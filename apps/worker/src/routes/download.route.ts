import { Router } from 'express';
import fs from 'fs';
import { JobService } from '../services/job.service.js';
import { AppError } from '@videodrop/shared';

export const downloadRouter = Router();

// Support both /download/:id and /download/:id/:filename for clean URL-based file saving
downloadRouter.get(['/download/:id', '/download/:id/:filename'], async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const job = await JobService.getJob(id);

    if (!job) {
      throw new AppError('Download link has expired or does not exist.', 404);
    }

    if (job.status !== 'completed' || !job.filePath) {
      throw new AppError('File is not ready for download yet.', 400);
    }

    if (Date.now() > job.expiresAt) {
      throw new AppError('This download link has expired.', 410);
    }

    if (!fs.existsSync(job.filePath)) {
      throw new AppError('File was cleaned up or is no longer available.', 404);
    }

    const rawName = job.fileName || `video-${job.jobId}.${job.format}`;
    // RFC 6266 safe header with fallback ASCII and encoded UTF-8
    const safeAscii = rawName.replace(/["',;\$\\\/]/g, '').replace(/\s+/g, '_');
    const encodedName = encodeURIComponent(rawName);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodedName}`
    );
    res.setHeader('Content-Type', job.format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    const stream = fs.createReadStream(job.filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});
