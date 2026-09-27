import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';
import { SSRFBlockedError } from '@videodrop/shared';
import { logger } from './logger.js';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',
]);

const BLOCKED_SUFFIXES = [
  '.local',
  '.internal',
  '.localhost',
  '.onion',
  '.arpa',
  '.corp',
  '.home',
  '.lan',
];

/**
 * Checks if an IP string is private, loopback, link-local, or reserved
 */
export function isPrivateOrReservedIp(ipStr: string): boolean {
  try {
    const addr = ipaddr.parse(ipStr);
    const range = addr.range();

    const blockedRanges: string[] = [
      'loopback',
      'private',
      'linkLocal',
      'broadcast',
      'carrierGradeNat',
      'uniqueLocal',
      'unspecified',
      'reserved',
    ];

    if (blockedRanges.includes(range)) {
      return true;
    }

    // Special check for IPv4 mapped in IPv6
    if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
      const ipv4 = (addr as ipaddr.IPv6).toIPv4Address();
      if (blockedRanges.includes(ipv4.range())) {
        return true;
      }
    }

    return false;
  } catch {
    // If it cannot be parsed as an IP, it's not a valid IP string
    return false;
  }
}

/**
 * Validates a target URL against SSRF attacks.
 * Verifies protocols, hostname blocklists, and performs DNS resolution to check for internal IP targets.
 */
export async function validateSsrf(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SSRFBlockedError('Invalid URL format');
  }

  // Only permit HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SSRFBlockedError(`Unsupported protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check static blocked list
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    logger.warn({ hostname }, 'SSRF attempt detected via blocked hostname');
    throw new SSRFBlockedError('Access to this host is prohibited');
  }

  // Check blocked suffixes
  for (const suffix of BLOCKED_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      logger.warn({ hostname, suffix }, 'SSRF attempt detected via blocked suffix');
      throw new SSRFBlockedError('Access to internal domain is prohibited');
    }
  }

  // Check if hostname itself is an IP address
  if (ipaddr.isValid(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      logger.warn({ ip: hostname }, 'SSRF attempt detected via direct private IP');
      throw new SSRFBlockedError('Access to private or local IP is prohibited');
    }
  }

  // Resolve DNS to verify the resolved IPs are not internal/private (prevents DNS rebinding / host alias)
  try {
    const lookups = await dns.lookup(hostname, { all: true });
    for (const record of lookups) {
      if (isPrivateOrReservedIp(record.address)) {
        logger.warn(
          { hostname, address: record.address },
          'SSRF attempt detected via resolved private IP'
        );
        throw new SSRFBlockedError('Resolved host points to an internal or reserved IP');
      }
    }
  } catch (err: unknown) {
    if (err instanceof SSRFBlockedError) {
      throw err;
    }
    // DNS resolution failure (domain doesn't exist or network error)
    logger.debug({ hostname, err }, 'DNS resolution failed during SSRF validation');
    throw new SSRFBlockedError('Unable to resolve domain name');
  }

  return parsed;
}
