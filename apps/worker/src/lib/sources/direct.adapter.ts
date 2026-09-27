import type { SourceAdapter } from './base.adapter.js';

export class DirectMediaAdapter implements SourceAdapter {
  public readonly name = 'direct';
  public readonly displayName = 'Direct Media Stream';
  public readonly domains = [];

  public canHandle(url: URL): boolean {
    const pathname = url.pathname.toLowerCase();
    return (
      pathname.endsWith('.mp4') ||
      pathname.endsWith('.webm') ||
      pathname.endsWith('.m4v') ||
      pathname.endsWith('.mov') ||
      pathname.endsWith('.mp3')
    );
  }

  public getYtDlpFormatSelector(quality: string, format: 'mp4' | 'mp3'): string {
    if (format === 'mp3') {
      return 'bestaudio/best';
    }
    return 'best[ext=mp4]/best';
  }
}
