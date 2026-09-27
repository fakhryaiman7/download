import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger.js';
import { healthRouter } from './routes/health.route.js';
import { analyzeRouter } from './routes/analyze.route.js';
import { jobsRouter } from './routes/jobs.route.js';
import { downloadRouter } from './routes/download.route.js';
import { errorHandler } from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  // Trust proxy for IP extraction behind reverse proxies
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS
  app.use(cors());

  // JSON parser with size limit
  app.use(express.json({ limit: '100kb' }));

  // HTTP Request Logging (sanitize headers)
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req: express.Request) => req.url === '/health',
      },
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    })
  );

  // Routes
  app.use(healthRouter);
  app.use(analyzeRouter);
  app.use(jobsRouter);
  app.use(downloadRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint ${req.method} ${req.path} not found`,
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
