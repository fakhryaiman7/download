import type { VideoMetadata, VideoFormat } from '@videodrop/shared';

export interface DownloadArgsOptions {
  url: string;
  format: 'mp4' | 'mp3';
  quality: string;
  outputPath: string;
}

export interface SourceAdapter {
  name: string;
  displayName: string;
  domains: string[];
  canHandle(url: URL): boolean;
  getYtDlpFormatSelector(quality: string, format: 'mp4' | 'mp3'): string;
  normalizeUrl?(url: URL): string;
}
