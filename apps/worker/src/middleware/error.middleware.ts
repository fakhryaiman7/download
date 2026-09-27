import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@videodrop/shared';
import { logger } from '../lib/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    const issue = err.issues[0]?.message || 'Invalid input data';
    logger.warn({ ip: req.ip, path: req.path, issues: err.issues }, 'Validation error');
    res.status(400).json({
      success: false,
      error: issue,
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(
      { ip: req.ip, path: req.path, status: err.statusCode, message: err.userMessage },
      'Application error'
    );
    res.status(err.statusCode).json({
      success: false,
      error: err.userMessage,
    });
    return;
  }

  // Generic or unexpected error
  const message = err instanceof Error ? err.message : 'Unknown server error';
  logger.error({ ip: req.ip, path: req.path, err: message }, 'Unexpected server error');

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred while processing your request.',
  });
}
