import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { RateLimiter } from '../lib/rate-limit.js';
import { RateLimitedError } from '@videodrop/shared';

const analyzeLimiter = new RateLimiter(config.rateLimitAnalyze, 60 * 60 * 1000);
const downloadLimiter = new RateLimiter(config.rateLimitDownload, 60 * 60 * 1000);

function getClientIp(req: Request): string {
  // Use forwarded-for if behind reverse proxy / Next.js
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

export function rateLimitAnalyzeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const result = analyzeLimiter.check(`analyze:${ip}`);

  res.setHeader('X-RateLimit-Limit', config.rateLimitAnalyze.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());

  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil(result.resetMs / 1000).toString());
    throw new RateLimitedError();
  }

  next();
}

export function rateLimitDownloadMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const result = downloadLimiter.check(`download:${ip}`);

  res.setHeader('X-RateLimit-Limit', config.rateLimitDownload.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());

  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil(result.resetMs / 1000).toString());
    throw new RateLimitedError();
  }

  next();
}
