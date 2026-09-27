import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../src/lib/rate-limit.js';

describe('Rate Limiter', () => {
  it('allows requests within threshold and blocks excess', () => {
    const limiter = new RateLimiter(3, 1000); // 3 per sec
    const ip = '198.51.100.1';

    const r1 = limiter.check(ip);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check(ip);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.check(ip);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = limiter.check(ip);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetMs).toBeGreaterThan(0);
  });

  it('maintains independent quotas for different IPs', () => {
    const limiter = new RateLimiter(1, 1000);
    const ip1 = '198.51.100.2';
    const ip2 = '198.51.100.3';

    expect(limiter.check(ip1).allowed).toBe(true);
    expect(limiter.check(ip1).allowed).toBe(false);

    // ip2 should still be allowed
    expect(limiter.check(ip2).allowed).toBe(true);
  });
});
