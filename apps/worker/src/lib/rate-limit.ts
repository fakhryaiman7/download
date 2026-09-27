export class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests: number, windowMs = 60 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodically clean stale entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000).unref();
  }

  public check(key: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const windowStart = now - this.windowMs;

    // Filter out timestamps outside window
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= this.maxRequests) {
      const oldest = recent[0];
      const resetMs = oldest + this.windowMs - now;
      this.requests.set(key, recent);
      return { allowed: false, remaining: 0, resetMs };
    }

    recent.push(now);
    this.requests.set(key, recent);

    return {
      allowed: true,
      remaining: this.maxRequests - recent.length,
      resetMs: this.windowMs,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter((t) => t > windowStart);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}
