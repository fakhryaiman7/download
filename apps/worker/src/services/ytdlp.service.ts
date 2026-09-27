import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import {
  AppError,
  VideoUnavailableError,
  DownloadUnavailableError,
  QualityUnavailableError,
  type VideoMetadata,
  type VideoFormat,
  type VideoContainer,
} from '@videodrop/shared';
import { logger } from '../lib/logger.js';
import { sourceRegistry } from '../lib/sources/registry.js';
import { FFmpegService } from './ffmpeg.service.js';

interface RawYtDlpFormat {
  format_id: string;
  format_note?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  tbr?: number;
}

interface RawYtDlpMetadata {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  extractor_key?: string;
  extractor?: string;
  formats?: RawYtDlpFormat[];
}

export class YtDlpService {
  private static activeProcesses = new Map<string, ChildProcess>();

  /**
   * Safe execution of yt-dlp with arguments array
   */
  public static async analyze(url: string): Promise<VideoMetadata> {
    const parsedUrl = new URL(url);
    const adapter = sourceRegistry.findAdapter(parsedUrl);
    const sourceName = adapter ? adapter.displayName : 'Web Video';

    const args = [
      '--dump-single-json',
      '--no-playlist',
      '--no-warnings',
      '--prefer-free-formats',
      '--skip-download',
      '--no-check-certificates',
      url,
    ];

    logger.info({ url: parsedUrl.hostname }, 'Starting yt-dlp metadata analysis');

    return new Promise((resolve, reject) => {
      const proc = spawn('yt-dlp', args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (err) => {
        logger.error({ err }, 'Failed to spawn yt-dlp');
        reject(new VideoUnavailableError('Failed to execute analysis tool.'));
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          logger.warn({ code, stderr }, 'yt-dlp analysis exited with non-zero code');
          if (
            stderr.includes('Private video') ||
            stderr.includes('Sign in') ||
            stderr.includes('login') ||
            stderr.includes('protected')
          ) {
            return reject(
              new DownloadUnavailableError(
                'This video is private, restricted, or requires authentication.'
              )
            );
          }
          if (stderr.includes('Video unavailable') || stderr.includes('Not Found') || stderr.includes('404')) {
            return reject(new VideoUnavailableError('This video could not be accessed.'));
          }
          if (stderr.includes('DRM') || stderr.includes('copyright')) {
            return reject(new DownloadUnavailableError('This video cannot be downloaded from this source.'));
          }
          return reject(new VideoUnavailableError('This video could not be accessed.'));
        }

        try {
          const raw: RawYtDlpMetadata = JSON.parse(stdout);
          const metadata = YtDlpService.parseMetadata(raw, sourceName);
          resolve(metadata);
        } catch (parseErr) {
          logger.error({ parseErr }, 'Failed to parse yt-dlp JSON output');
          reject(new VideoUnavailableError('Could not parse video metadata.'));
        }
      });
    });
  }

  /**
   * Parse raw yt-dlp JSON into structured VideoMetadata and available qualities
   */
  private static parseMetadata(raw: RawYtDlpMetadata, sourceName: string): VideoMetadata {
    const rawFormats = raw.formats || [];
    const availableHeights = new Set<number>();
    let hasAudio = false;

    for (const f of rawFormats) {
      if (f.acodec && f.acodec !== 'none') {
        hasAudio = true;
      }
      if (f.height && f.height > 0) {
        availableHeights.add(f.height);
      }
    }

    const formats: VideoFormat[] = [];

    // Always offer Best if video exists
    if (availableHeights.size > 0 || rawFormats.length > 0) {
      formats.push({
        id: 'best',
        type: 'video',
        container: 'mp4',
        quality: 'Best',
        note: 'Best available quality',
      });
    }

    // Standard target resolution tiers
    const targetQualities = [
      { quality: '1080p', minHeight: 1080 },
      { quality: '720p', minHeight: 720 },
      { quality: '480p', minHeight: 480 },
      { quality: '360p', minHeight: 360 },
    ];

    for (const tier of targetQualities) {
      // Check if video actually supports this height or higher
      const supportsTier = Array.from(availableHeights).some((h) => h >= tier.minHeight);
      if (supportsTier) {
        formats.push({
          id: tier.quality,
          type: 'video',
          container: 'mp4',
          quality: tier.quality,
          height: tier.minHeight,
        });
      }
    }

    // Add audio option if audio exists
    if (hasAudio || rawFormats.length > 0) {
      formats.push({
        id: 'audio-mp3',
        type: 'audio',
        container: 'mp3',
        quality: 'Audio only (MP3)',
        note: 'High-quality MP3 audio',
      });
    }

    return {
      id: raw.id || 'unknown',
      title: raw.title || 'Untitled Video',
      thumbnail: raw.thumbnail || '',
      duration: Math.round(raw.duration || 0),
      source: sourceName || raw.extractor_key || 'Public Source',
      formats,
    };
  }

  /**
   * Starts a download job using safe yt-dlp arguments and tracks progress
   */
  public static async download(options: {
    jobId: string;
    url: string;
    format: VideoContainer;
    quality: string;
    outputDir: string;
    onProgress: (progress: number, step: 'downloading' | 'processing') => void;
  }): Promise<{ filePath: string; fileName: string; fileSize: number }> {
    const { jobId, url, format, quality, outputDir, onProgress } = options;
    const parsedUrl = new URL(url);
    const adapter = sourceRegistry.findAdapter(parsedUrl);

    // Build format argument
    let formatArg = 'bestvideo+bestaudio/best';
    if (adapter) {
      formatArg = adapter.getYtDlpFormatSelector(quality, format);
    } else {
      if (format === 'mp3') {
        formatArg = 'bestaudio/best';
      } else {
        const hMatch = quality.match(/^(\d+)p$/);
        if (hMatch) {
          formatArg = `bestvideo[height<=${hMatch[1]}]+bestaudio/best[height<=${hMatch[1]}]/best`;
        }
      }
    }

    // Output template
    const outputTemplate = path.join(outputDir, '%(title).120B.%(ext)s');

    const args = [
      '--newline',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      '--max-filesize',
      '500M',
      '-o',
      outputTemplate,
    ];

    if (format === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      args.push(
        '-f',
        formatArg,
        '--format-sort',
        'vcodec:h264,acodec:aac',
        '--merge-output-format',
        'mp4'
      );
    }

    args.push(url);

    logger.info({ jobId, quality, format }, 'Spawning yt-dlp download process');

    return new Promise((resolve, reject) => {
      const proc = spawn('yt-dlp', args);
      YtDlpService.activeProcesses.set(jobId, proc);

      let stderr = '';
      let lastProgress = 0;

      proc.stdout.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Detect download progress: [download]  45.2% of ~  15.20MiB at  2.50MiB/s
          const dlMatch = trimmed.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
          if (dlMatch) {
            const pct = Math.min(100, Math.max(0, parseFloat(dlMatch[1])));
            if (pct >= lastProgress) {
              lastProgress = pct;
              onProgress(Math.round(pct), 'downloading');
            }
          }

          // Detect merging or post-processing
          if (
            trimmed.includes('[Merger]') ||
            trimmed.includes('[ExtractAudio]') ||
            trimmed.includes('[Fixup') ||
            trimmed.includes('Deleting original file')
          ) {
            onProgress(100, 'processing');
          }
        }
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        YtDlpService.activeProcesses.delete(jobId);
        logger.error({ jobId, err }, 'yt-dlp process spawn error');
        reject(new AppError('Download execution failed.'));
      });

      proc.on('close', async (code) => {
        YtDlpService.activeProcesses.delete(jobId);

        if (code !== 0) {
          logger.error({ jobId, code, stderr }, 'yt-dlp download process failed');
          if (stderr.includes('Requested format is not available')) {
            return reject(new QualityUnavailableError(quality));
          }
          if (stderr.includes('File is larger than max-filesize')) {
            return reject(new AppError('Video exceeds maximum allowed download size (500MB).'));
          }
          return reject(new DownloadUnavailableError('Failed to download video from this source.'));
        }

        try {
          // Identify the downloaded file in the directory
          const files = await fs.readdir(outputDir);
          const mediaFiles = files.filter(
            (f) =>
              !f.endsWith('.part') &&
              !f.endsWith('.ytdl') &&
              !f.startsWith('.') &&
              (f.endsWith('.mp4') || f.endsWith('.mp3') || f.endsWith('.mkv') || f.endsWith('.webm'))
          );

          if (mediaFiles.length === 0) {
            return reject(new AppError('Output file not found after download completion.'));
          }

          const fileName = mediaFiles[0];
          const filePath = path.join(outputDir, fileName);

          // If MP4 video, verify and guarantee universal playback compatibility (H.264)
          if (format === 'mp4') {
            try {
              onProgress(100, 'processing');
              await FFmpegService.ensureCompatibleMp4(filePath);
            } catch (transcodeErr) {
              logger.warn(
                { jobId, transcodeErr },
                'Optional compatibility transcode skipped, serving stream copy'
              );
            }
          }

          const stats = await fs.stat(filePath);

          resolve({
            filePath,
            fileName,
            fileSize: stats.size,
          });
        } catch (fsErr) {
          logger.error({ jobId, fsErr }, 'Error reading output directory');
          reject(new AppError('Failed to locate downloaded file on disk.'));
        }
      });
    });
  }

  /**
   * Cancel/terminate active download process for a jobId
   */
  public static cancel(jobId: string): boolean {
    const proc = YtDlpService.activeProcesses.get(jobId);
    if (proc) {
      try {
        proc.kill('SIGTERM');
        YtDlpService.activeProcesses.delete(jobId);
        return true;
      } catch (err) {
        logger.warn({ jobId, err }, 'Failed to terminate process');
      }
    }
    return false;
  }
}
