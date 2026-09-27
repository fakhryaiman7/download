import {
  type VideoMetadata,
  type VideoContainer,
  type JobStatusResult,
  AppError,
  WorkerUnavailableError,
} from '@videodrop/shared';

const WORKER_URL = process.env.DOWNLOADER_API_URL || 'http://localhost:8080';
const WORKER_KEY = process.env.DOWNLOADER_API_KEY || 'dev-secret-api-key-12345';

interface WorkerResponse<T> {
  success: boolean;
  error?: string;
  video?: VideoMetadata;
  metadata?: Partial<VideoMetadata>;
  formats?: VideoMetadata['formats'];
  jobId?: string;
  [key: string]: unknown;
}

export class WorkerClient {
  private static getHeaders(clientIp?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WORKER_KEY}`,
    };
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
    }
    return headers;
  }

  public static async analyze(url: string, clientIp?: string): Promise<VideoMetadata> {
    try {
      const res = await fetch(`${WORKER_URL}/analyze`, {
        method: 'POST',
        headers: this.getHeaders(clientIp),
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30000), // 30s timeout for analysis
      });

      const data = (await res.json()) as WorkerResponse<VideoMetadata>;

      if (!res.ok || !data.success) {
        throw new AppError(data.error || 'Failed to analyze video URL', res.status);
      }

      if (!data.video) {
        throw new AppError('Worker did not return video metadata', 500);
      }

      return data.video;
    } catch (err: unknown) {
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new AppError('Video analysis timed out. The source may be slow or unresponsive.', 504);
      }
      throw new WorkerUnavailableError();
    }
  }

  public static async createJob(
    url: string,
    format: VideoContainer,
    quality: string,
    clientIp?: string
  ): Promise<string> {
    try {
      const res = await fetch(`${WORKER_URL}/jobs`, {
        method: 'POST',
        headers: this.getHeaders(clientIp),
        body: JSON.stringify({ url, format, quality, ip: clientIp }),
        signal: AbortSignal.timeout(15000),
      });

      const data = (await res.json()) as WorkerResponse<{ jobId: string }>;

      if (!res.ok || !data.success || !data.jobId) {
        throw new AppError(data.error || 'Failed to initialize download job', res.status);
      }

      return data.jobId;
    } catch (err: unknown) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new WorkerUnavailableError();
    }
  }

  public static async getJobStatus(jobId: string): Promise<JobStatusResult> {
    try {
      const res = await fetch(`${WORKER_URL}/jobs/${jobId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      });

      const data = (await res.json()) as JobStatusResult & { success?: boolean; error?: string };

      if (!res.ok) {
        throw new AppError(data.error || 'Job not found', res.status);
      }

      // If completed and downloadUrl exists, construct full accessible URL with clean filename
      let downloadUrl = data.downloadUrl;
      if (downloadUrl && downloadUrl.startsWith('/')) {
        const fileSuffix = data.fileName ? `/${encodeURIComponent(data.fileName)}` : '';
        downloadUrl = `${WORKER_URL}${downloadUrl}${fileSuffix}`;
      }

      return {
        jobId: data.jobId,
        status: data.status,
        progress: data.progress,
        title: data.title,
        downloadUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        error: data.error,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new WorkerUnavailableError();
    }
  }
}
