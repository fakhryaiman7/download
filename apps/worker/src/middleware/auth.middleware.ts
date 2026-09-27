import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn({ ip: req.ip, path: req.path }, 'Missing Authorization header');
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing API key',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn({ ip: req.ip, path: req.path }, 'Malformed Authorization header');
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid authentication scheme',
    });
    return;
  }

  const token = parts[1];
  if (token !== config.apiKey) {
    logger.warn({ ip: req.ip, path: req.path }, 'Invalid worker API key');
    res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid API key',
    });
    return;
  }

  next();
}
