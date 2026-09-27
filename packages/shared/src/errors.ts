export class AppError extends Error {
  public statusCode: number;
  public userMessage: string;

  constructor(userMessage: string, statusCode = 400) {
    super(userMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}

export class UnsupportedSourceError extends AppError {
  constructor(message = 'This source is not currently supported.') {
    super(message, 400);
    this.name = 'UnsupportedSourceError';
  }
}

export class VideoUnavailableError extends AppError {
  constructor(message = 'This video could not be accessed.') {
    super(message, 404);
    this.name = 'VideoUnavailableError';
  }
}

export class DownloadUnavailableError extends AppError {
  constructor(message = 'This video cannot be downloaded from this source.') {
    super(message, 400);
    this.name = 'DownloadUnavailableError';
  }
}

export class QualityUnavailableError extends AppError {
  constructor(quality?: string) {
    const msg = quality
      ? `${quality} is not available for this video.`
      : 'That quality is not available.';
    super(msg, 400);
    this.name = 'QualityUnavailableError';
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429);
    this.name = 'RateLimitedError';
  }
}

export class WorkerUnavailableError extends AppError {
  constructor(message = 'The download service is temporarily unavailable.') {
    super(message, 503);
    this.name = 'WorkerUnavailableError';
  }
}

export class SSRFBlockedError extends AppError {
  constructor(message = 'Access to this address or internal host is prohibited.') {
    super(message, 403);
    this.name = 'SSRFBlockedError';
  }
}

export const ERROR_MESSAGES = {
  UNSUPPORTED_SOURCE: 'This source is not currently supported.',
  VIDEO_UNAVAILABLE: 'This video could not be accessed.',
  DOWNLOAD_UNAVAILABLE: 'This video cannot be downloaded from this source.',
  QUALITY_UNAVAILABLE: 'That quality is not available.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  WORKER_UNAVAILABLE: 'The download service is temporarily unavailable.',
  MAX_CONCURRENT_JOBS: 'Maximum concurrent download limit reached. Please wait a moment.',
  JOB_NOT_FOUND: 'Download job not found or expired.',
} as const;
