import { Router } from 'express';
import { analyzeRequestSchema, UnsupportedSourceError } from '@videodrop/shared';
import { validateSsrf } from '../lib/ssrf.js';
import { sourceRegistry } from '../lib/sources/registry.js';
import { YtDlpService } from '../services/ytdlp.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimitAnalyzeMiddleware } from '../middleware/rate-limit.middleware.js';

export const analyzeRouter = Router();

analyzeRouter.post(
  '/analyze',
  authMiddleware,
  rateLimitAnalyzeMiddleware,
  async (req, res, next) => {
    try {
      const input = analyzeRequestSchema.parse(req.body);

      // Validate SSRF
      const parsedUrl = await validateSsrf(input.url);

      // Check supported source
      if (!sourceRegistry.isSupported(parsedUrl)) {
        throw new UnsupportedSourceError();
      }

      // Analyze metadata via yt-dlp
      const video = await YtDlpService.analyze(parsedUrl.href);

      res.json({
        success: true,
        video,
        metadata: {
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          source: video.source,
        },
        formats: video.formats,
      });
    } catch (err) {
      next(err);
    }
  }
);
