import type { Job } from '@videodrop/shared';

export interface JobStore {
  get(jobId: string): Promise<Job | null>;
  set(job: Job): Promise<void>;
  update(jobId: string, updates: Partial<Job>): Promise<Job | null>;
  delete(jobId: string): Promise<boolean>;
  getActiveJobCount(): Promise<number>;
  getActiveJobCountForIp(ip: string): Promise<number>;
  getExpiredJobs(now: number): Promise<Job[]>;
  getAllJobs(): Promise<Job[]>;
}
