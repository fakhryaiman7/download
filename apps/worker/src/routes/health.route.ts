import { Router } from 'express';
import { FFmpegService } from '../services/ffmpeg.service.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  const ffmpegReady = await FFmpegService.checkAvailable();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    ffmpegAvailable: ffmpegReady,
  });
});
