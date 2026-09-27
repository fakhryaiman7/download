import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryJobStore } from '../src/lib/store/memory.store.js';
import type { Job } from '@videodrop/shared';

describe('MemoryJobStore', () => {
  let store: MemoryJobStore;

  beforeEach(() => {
    store = new MemoryJobStore();
  });

  it('stores and retrieves jobs accurately', async () => {
    const job: Job = {
      jobId: 'test-job-1',
      status: 'queued',
      progress: 0,
      title: 'Test Video',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: Date.now() + 60000,
      format: 'mp4',
      quality: '1080p',
      url: 'https://youtube.com/watch?v=12345',
      ip: '192.0.2.1',
    };

    await store.set(job);
    const retrieved = await store.get('test-job-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.jobId).toBe('test-job-1');
    expect(retrieved?.status).toBe('queued');
  });

  it('tracks active job count and per-IP count accurately', async () => {
    const baseJob: Job = {
      jobId: 'job-1',
      status: 'downloading',
      progress: 30,
      title: 'Video 1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      expiresAt: Date.now() + 60000,
      format: 'mp4',
      quality: '720p',
      url: 'https://youtube.com/watch?v=123',
      ip: '192.0.2.1',
    };

    await store.set(baseJob);
    await store.set({ ...baseJob, jobId: 'job-2', ip: '192.0.2.1' });
    await store.set({ ...baseJob, jobId: 'job-3', ip: '192.0.2.2', status: 'completed' });

    expect(await store.getActiveJobCount()).toBe(2);
    expect(await store.getActiveJobCountForIp('192.0.2.1')).toBe(2);
    expect(await store.getActiveJobCountForIp('192.0.2.2')).toBe(0);
  });

  it('identifies expired jobs properly', async () => {
    const now = Date.now();
    await store.set({
      jobId: 'expired-job',
      status: 'completed',
      progress: 100,
      title: 'Expired Video',
      createdAt: now - 120000,
      updatedAt: now - 120000,
      expiresAt: now - 1000,
      format: 'mp4',
      quality: '720p',
      url: 'https://youtube.com/watch?v=old',
    });

    const expired = await store.getExpiredJobs(now);
    expect(expired.length).toBe(1);
    expect(expired[0].jobId).toBe('expired-job');
  });
});
