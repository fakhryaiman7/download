import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import {
  type Job,
  type VideoContainer,
  AppError,
  RateLimitedError,
  ERROR_MESSAGES,
} from '@videodrop/shared';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { memoryJobStore } from '../lib/store/memory.store.js';
import { YtDlpService } from './ytdlp.service.js';
import { CleanupService } from './cleanup.service.js';

export class JobService {
  /**
   * Create and enqueue a new download job
   */
  public static async createJob(options: {
    url: string;
    format: VideoContainer;
    quality: string;
    ip?: string;
  }): Promise<Job> {
    const { url, format, quality, ip } = options;

    // Check overall worker concurrency
    const activeJobs = await memoryJobStore.getActiveJobCount();
    if (activeJobs >= config.maxConcurrentJobs) {
      logger.warn({ activeJobs, max: config.maxConcurrentJobs }, 'Max worker concurrency reached');
      throw new AppError(ERROR_MESSAGES.MAX_CONCURRENT_JOBS, 429);
    }

    // Check per-IP concurrency if IP provided
    if (ip) {
      const activeForIp = await memoryJobStore.getActiveJobCountForIp(ip);
      if (activeForIp >= 2) {
        logger.warn({ ip, activeForIp }, 'Max per-IP concurrency reached');
        throw new RateLimitedError('You already have 2 active downloads in progress.');
      }
    }

    const jobId = uuidv4();
    const now = Date.now();
    const expiresAt = now + config.jobTtlMinutes * 60 * 1000;

    const job: Job = {
      jobId,
      status: 'queued',
      progress: 0,
      title: 'Preparing video...',
      downloadUrl: null,
      error: null,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      format,
      quality,
      url,
      ip,
    };

    await memoryJobStore.set(job);
    logger.info({ jobId, url, quality, format }, 'Job created and enqueued');

    // Run job asynchronously in the background
    this.processJob(job).catch((err) => {
      logger.error({ jobId, err }, 'Unhandled error in job processing');
    });

    return job;
  }

  /**
   * Background runner for the job
   */
  private static async processJob(job: Job): Promise<void> {
    const { jobId, url, format, quality } = job;
    const outputDir = path.join(config.tempStorageDir, jobId);

    try {
      await fs.mkdir(outputDir, { recursive: true });

      // Update state to downloading
      await memoryJobStore.update(jobId, {
        status: 'downloading',
        progress: 5,
      });

      const result = await YtDlpService.download({
        jobId,
        url,
        format,
        quality,
        outputDir,
        onProgress: async (progress, step) => {
          await memoryJobStore.update(jobId, {
            status: step,
            progress,
          });
        },
      });

      // Update completed state
      const downloadEndpoint = `/download/${jobId}`;
      await memoryJobStore.update(jobId, {
        status: 'completed',
        progress: 100,
        title: result.fileName,
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
        downloadUrl: downloadEndpoint,
        error: null,
      });

      // Automatically copy to user's ~/Downloads folder if available locally
      try {
        const userDownloads = path.join(os.homedir(), 'Downloads');
        const dest = path.join(userDownloads, result.fileName);
        await fs.copyFile(result.filePath, dest);
        logger.info({ dest }, 'Saved copy directly to user Downloads folder');
      } catch (copyErr) {
        logger.debug({ copyErr }, 'Local Downloads folder copy skipped');
      }

      logger.info({ jobId, fileName: result.fileName, size: result.fileSize }, 'Job completed successfully');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof AppError
          ? err.userMessage
          : err instanceof Error
          ? err.message
          : 'Download failed';

      logger.error({ jobId, err: errorMessage }, 'Job failed');

      await memoryJobStore.update(jobId, {
        status: 'failed',
        error: errorMessage,
      });

      // Clean up failed artifacts
      await CleanupService.cleanupJobDir(jobId);
    }
  }

  /**
   * Retrieve job by ID
   */
  public static async getJob(jobId: string): Promise<Job | null> {
    return memoryJobStore.get(jobId);
  }
}
