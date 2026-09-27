import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { CleanupService } from './services/cleanup.service.js';
import { FFmpegService } from './services/ffmpeg.service.js';

const app = createApp();

async function main() {
  const ffmpegReady = await FFmpegService.checkAvailable();
  if (!ffmpegReady) {
    logger.warn('FFmpeg is not detected on the PATH. Video/audio merging may be limited.');
  } else {
    logger.info('FFmpeg detected and operational.');
  }

  // Start periodic cleanup worker
  CleanupService.start();

  const server = app.listen(config.port, config.host, () => {
    logger.info(
      {
        port: config.port,
        host: config.host,
        env: config.isDev ? 'development' : 'production',
        maxConcurrency: config.maxConcurrentJobs,
        ttlMinutes: config.jobTtlMinutes,
      },
      'VideoDrop Worker Service listening'
    );
  });

  const shutdown = () => {
    logger.info('Received termination signal. Shutting down gracefully...');
    CleanupService.stop();
    server.close(() => {
      logger.info('Server closed. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, 'Worker failed to start');
  process.exit(1);
});
