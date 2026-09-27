import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIp, validateSsrf } from '../src/lib/ssrf.js';
import { SSRFBlockedError } from '@videodrop/shared';

describe('SSRF Protection', () => {
  it('identifies private and reserved IP addresses accurately', () => {
    // Loopback
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('127.0.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);

    // Private Class A, B, C
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.254.254.254')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.100.50')).toBe(true);

    // Link-local & cloud metadata
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);

    // Public IPs should not be blocked
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
    expect(isPrivateOrReservedIp('142.250.190.46')).toBe(false);
  });

  it('blocks localhost and internal hostnames', async () => {
    await expect(validateSsrf('http://localhost:8080/secret')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('http://127.0.0.1:3000')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('http://169.254.169.254/latest/meta-data')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('http://service.internal/api')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('http://router.local')).rejects.toThrow(SSRFBlockedError);
  });

  it('blocks non-HTTP protocols', async () => {
    await expect(validateSsrf('file:///etc/passwd')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('gopher://127.0.0.1:70')).rejects.toThrow(SSRFBlockedError);
    await expect(validateSsrf('ftp://127.0.0.1')).rejects.toThrow(SSRFBlockedError);
  });

  it('allows valid public video platforms', async () => {
    const parsed = await validateSsrf('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(parsed.hostname).toBe('www.youtube.com');
  });
});
