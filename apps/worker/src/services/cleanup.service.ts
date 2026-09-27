import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { memoryJobStore } from '../lib/store/memory.store.js';

export class CleanupService {
  private static timer: NodeJS.Timeout | null = null;

  public static start(): void {
    logger.info(
      { intervalSec: config.cleanupIntervalSeconds, ttlMin: config.jobTtlMinutes },
      'Starting temporary file cleanup worker'
    );

    // Run initial cleanup
    this.runCleanup().catch((err) => {
      logger.error({ err }, 'Error during initial cleanup run');
    });

    this.timer = setInterval(() => {
      this.runCleanup().catch((err) => {
        logger.error({ err }, 'Error during periodic cleanup run');
      });
    }, config.cleanupIntervalSeconds * 1000);

    this.timer.unref();
  }

  public static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Delete files for a specific job directory
   */
  public static async cleanupJobDir(jobId: string): Promise<void> {
    const jobDir = path.join(config.tempStorageDir, jobId);
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
      logger.debug({ jobId, jobDir }, 'Cleaned up job directory');
    } catch (err) {
      logger.warn({ jobId, err }, 'Failed to delete job directory');
    }
  }

  /**
   * Scans job store and disk for expired jobs
   */
  public static async runCleanup(): Promise<void> {
    const now = Date.now();
    const expiredJobs = await memoryJobStore.getExpiredJobs(now);

    for (const job of expiredJobs) {
      logger.info({ jobId: job.jobId }, 'Cleaning up expired job');
      await this.cleanupJobDir(job.jobId);
      await memoryJobStore.update(job.jobId, { status: 'expired', downloadUrl: null });
    }

    // Also scan temp dir for orphaned folders older than TTL
    try {
      await fs.mkdir(config.tempStorageDir, { recursive: true });
      const entries = await fs.readdir(config.tempStorageDir, { withFileTypes: true });
      const maxAgeMs = config.jobTtlMinutes * 60 * 1000;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const folderPath = path.join(config.tempStorageDir, entry.name);
          const stats = await fs.stat(folderPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            logger.info({ folder: entry.name }, 'Removing orphaned temp job directory');
            await fs.rm(folderPath, { recursive: true, force: true });
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to clean orphaned directories');
    }
  }
}
