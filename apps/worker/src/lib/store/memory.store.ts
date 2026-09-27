import type { Job, JobStatus } from '@videodrop/shared';
import type { JobStore } from './job.store.js';

const ACTIVE_STATUSES: JobStatus[] = ['queued', 'analyzing', 'downloading', 'processing'];

export class MemoryJobStore implements JobStore {
  private jobs = new Map<string, Job>();

  public async get(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null;
  }

  public async set(job: Job): Promise<void> {
    this.jobs.set(job.jobId, { ...job });
  }

  public async update(jobId: string, updates: Partial<Job>): Promise<Job | null> {
    const existing = this.jobs.get(jobId);
    if (!existing) {
      return null;
    }
    const updated: Job = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public async delete(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId);
  }

  public async getActiveJobCount(): Promise<number> {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (ACTIVE_STATUSES.includes(job.status)) {
        count++;
      }
    }
    return count;
  }

  public async getActiveJobCountForIp(ip: string): Promise<number> {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.ip === ip && ACTIVE_STATUSES.includes(job.status)) {
        count++;
      }
    }
    return count;
  }

  public async getExpiredJobs(now: number): Promise<Job[]> {
    const expired: Job[] = [];
    for (const job of this.jobs.values()) {
      if (job.expiresAt && job.expiresAt <= now) {
        expired.push(job);
      }
    }
    return expired;
  }

  public async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
}

export const memoryJobStore = new MemoryJobStore();
