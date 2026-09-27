import type { SourceAdapter } from './base.adapter.js';

export class YouTubeAdapter implements SourceAdapter {
  public readonly name = 'youtube';
  public readonly displayName = 'YouTube';
  public readonly domains = [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'youtube-nocookie.com',
  ];

  public canHandle(url: URL): boolean {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com';
  }

  public getYtDlpFormatSelector(quality: string, format: 'mp4' | 'mp3'): string {
    if (format === 'mp3') {
      return 'bestaudio/best';
    }

    const heightMatch = quality.match(/^(\d+)p$/);
    if (heightMatch) {
      const height = heightMatch[1];
      return `bv*[height<=${height}][vcodec^=avc1]+ba[acodec^=mp4a]/bv*[height<=${height}][ext=mp4]+ba[ext=m4a]/bv*[height<=${height}]+ba/b[height<=${height}]/b`;
    }

    return 'bv*[vcodec^=avc1]+ba[acodec^=mp4a]/bv*[ext=mp4]+ba[ext=m4a]/bv*+ba/b';
  }

  public normalizeUrl(url: URL): string {
    // If it's youtu.be/VIDEO_ID, expand or retain clean
    return url.href;
  }
}
