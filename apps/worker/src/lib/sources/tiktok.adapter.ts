import type { SourceAdapter } from './base.adapter.js';

export class TikTokAdapter implements SourceAdapter {
  public readonly name = 'tiktok';
  public readonly displayName = 'TikTok';
  public readonly domains = ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'];

  public canHandle(url: URL): boolean {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com';
  }

  public getYtDlpFormatSelector(quality: string, format: 'mp4' | 'mp3'): string {
    if (format === 'mp3') {
      return 'bestaudio/best';
    }
    return 'best[ext=mp4]/best';
  }
}
