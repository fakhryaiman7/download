import { spawn } from 'child_process';
import fs from 'fs/promises';
import { logger } from '../lib/logger.js';

export class FFmpegService {
  private static isAvailable: boolean | null = null;

  public static async checkAvailable(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    return new Promise((resolve) => {
      const proc = spawn('ffmpeg', ['-version']);
      proc.on('error', () => {
        this.isAvailable = false;
        resolve(false);
      });
      proc.on('close', (code) => {
        this.isAvailable = code === 0;
        resolve(this.isAvailable);
      });
    });
  }

  /**
   * Retrieves the video codec name using ffprobe
   */
  public static async getVideoCodec(filePath: string): Promise<string | null> {
    return new Promise((resolve) => {
      const proc = spawn('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=codec_name',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ]);
      let stdout = '';
      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });
      proc.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          resolve(stdout.trim().toLowerCase());
        } else {
          resolve(null);
        }
      });
      proc.on('error', () => resolve(null));
    });
  }

  /**
   * Ensures the MP4 video is encoded with H.264 so it can play natively
   * on macOS QuickTime, Safari, Windows Media Player, iOS, and Android.
   */
  public static async ensureCompatibleMp4(filePath: string): Promise<void> {
    const isReady = await this.checkAvailable();
    if (!isReady) return;

    const codec = await this.getVideoCodec(filePath);
    // If codec is already h264 or hevc, it's universally compatible
    if (!codec || codec === 'h264' || codec === 'hevc') {
      return;
    }

    logger.info({ codec, filePath }, 'Transcoding incompatible video codec (e.g. AV1/VP9) to H.264');
    const tempOutput = filePath + '.transcoded.mp4';

    return new Promise<void>((resolve, reject) => {
      const args = [
        '-y',
        '-i',
        filePath,
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-c:a',
        'copy', // keep audio track unchanged
        '-movflags',
        '+faststart',
        tempOutput,
      ];

      const proc = spawn('ffmpeg', args);
      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      proc.on('error', (err) => reject(err));
      proc.on('close', async (code) => {
        if (code === 0) {
          try {
            await fs.rename(tempOutput, filePath);
            resolve();
          } catch (e) {
            reject(e);
          }
        } else {
          try {
            await fs.unlink(tempOutput).catch(() => {});
          } catch {}
          logger.error({ code, stderr }, 'FFmpeg transcoding failed');
          reject(new Error(`Transcoding failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Converts an audio file to MP3 (192k) safely.
   */
  public static async convertToMp3(inputPath: string, outputPath: string): Promise<void> {
    const isReady = await this.checkAvailable();
    if (!isReady) {
      throw new Error('FFmpeg is not installed or available on this system.');
    }

    return new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-i',
        inputPath,
        '-vn',
        '-acodec',
        'libmp3lame',
        '-b:a',
        '192k',
        outputPath,
      ];

      logger.debug({ args }, 'Running FFmpeg audio conversion');
      const proc = spawn('ffmpeg', args);

      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        logger.error({ err }, 'FFmpeg execution error');
        reject(err);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          logger.error({ code, stderr }, 'FFmpeg conversion failed');
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });
  }
}
