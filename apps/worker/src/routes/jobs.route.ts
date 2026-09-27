import { Router } from 'express';
import {
  workerCreateJobSchema,
  UnsupportedSourceError,
  AppError,
  ERROR_MESSAGES,
} from '@videodrop/shared';
import { validateSsrf } from '../lib/ssrf.js';
import { sourceRegistry } from '../lib/sources/registry.js';
import { JobService } from '../services/job.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitDownloadMiddleware } from '../middleware/rate-limit.middleware.js';

export const jobsRouter = Router();

jobsRouter.post(
  '/jobs',
  authMiddleware,
  rateLimitDownloadMiddleware,
  async (req, res, next) => {
    try {
      const input = workerCreateJobSchema.parse(req.body);

      // Validate SSRF
      const parsedUrl = await validateSsrf(input.url);

      // Check supported source
      if (!sourceRegistry.isSupported(parsedUrl)) {
        throw new UnsupportedSourceError();
      }

      // Determine client IP
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp =
        input.ip ||
        (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) ||
        '127.0.0.1';

      const job = await JobService.createJob({
        url: parsedUrl.href,
        format: input.format,
        quality: input.quality,
        ip: clientIp,
      });

      res.status(202).json({
        success: true,
        jobId: job.jobId,
        status: job.status,
      });
    } catch (err) {
      next(err);
    }
  }
);

jobsRouter.get('/jobs/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const job = await JobService.getJob(id);

    if (!job) {
      throw new AppError(ERROR_MESSAGES.JOB_NOT_FOUND, 404);
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      title: job.title,
      downloadUrl: job.downloadUrl,
      fileName: job.fileName,
      fileSize: job.fileSize,
      error: job.error,
    });
  } catch (err) {
    next(err);
  }
});
