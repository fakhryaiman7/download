import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current dir
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export interface Config {
  port: number;
  host: string;
  apiKey: string;
  tempStorageDir: string;
  cleanupIntervalSeconds: number;
  maxConcurrentJobs: number;
  jobTtlMinutes: number;
  rateLimitAnalyze: number;
  rateLimitDownload: number;
  isDev: boolean;
}

export const config: Config = {
  port: parseInt(process.env.WORKER_PORT || '8080', 10),
  host: process.env.WORKER_HOST || '0.0.0.0',
  apiKey: process.env.DOWNLOADER_API_KEY || 'dev-secret-api-key-12345',
  tempStorageDir: process.env.TEMP_STORAGE_DIR || '/tmp/video-downloader',
  cleanupIntervalSeconds: parseInt(process.env.CLEANUP_INTERVAL_SECONDS || '60', 10),
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS || '2', 10),
  jobTtlMinutes: parseInt(process.env.JOB_TTL_MINUTES || '30', 10),
  rateLimitAnalyze: parseInt(process.env.RATE_LIMIT_ANALYZE || '20', 10),
  rateLimitDownload: parseInt(process.env.RATE_LIMIT_DOWNLOAD || '10', 10),
  isDev: process.env.NODE_ENV !== 'production',
};
