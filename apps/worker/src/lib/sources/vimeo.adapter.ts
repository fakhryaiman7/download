import type { SourceAdapter } from './base.adapter.js';

export class VimeoAdapter implements SourceAdapter {
  public readonly name = 'vimeo';
  public readonly displayName = 'Vimeo';
  public readonly domains = ['vimeo.com', 'player.vimeo.com'];

  public canHandle(url: URL): boolean {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'vimeo.com' || host === 'player.vimeo.com';
  }

  public getYtDlpFormatSelector(quality: string, format: 'mp4' | 'mp3'): string {
    if (format === 'mp3') {
      return 'bestaudio/best';
    }

    const heightMatch = quality.match(/^(\d+)p$/);
    if (heightMatch) {
      const height = heightMatch[1];
      return `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}]/best`;
    }

    return 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
  }
}
