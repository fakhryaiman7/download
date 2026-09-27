export type VideoType = 'video' | 'audio';
export type VideoContainer = 'mp4' | 'mp3';

export interface VideoFormat {
  id: string;
  type: VideoType;
  container: VideoContainer;
  quality: string; // e.g. "1080p", "720p", "480p", "360p", "Audio only"
  height?: number | null;
  fps?: number | null;
  filesize?: number | null; // bytes
  note?: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: number; // in seconds
  source: string; // e.g. "YouTube", "Vimeo", "TikTok"
  formats: VideoFormat[];
}

export type JobStatus =
  | 'queued'
  | 'analyzing'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export interface Job {
  jobId: string;
  status: JobStatus;
  progress: number; // 0 to 100
  title: string;
  downloadUrl?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  format: VideoContainer;
  quality: string;
  url: string;
  ip?: string;
}

export interface AnalyzeResult {
  success: boolean;
  video?: VideoMetadata;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface JobStatusResult {
  jobId: string;
  status: JobStatus;
  progress: number;
  title?: string;
  downloadUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  error?: string | null;
}
