import { describe, it, expect } from 'vitest';
import { sourceRegistry } from '../src/lib/sources/registry.js';
import { YouTubeAdapter } from '../src/lib/sources/youtube.adapter.js';
import { VimeoAdapter } from '../src/lib/sources/vimeo.adapter.js';
import { TikTokAdapter } from '../src/lib/sources/tiktok.adapter.js';
import { DirectMediaAdapter } from '../src/lib/sources/direct.adapter.js';

describe('Source Adapter System', () => {
  it('correctly matches YouTube URLs', () => {
    const yt = new YouTubeAdapter();
    expect(yt.canHandle(new URL('https://www.youtube.com/watch?v=12345'))).toBe(true);
    expect(yt.canHandle(new URL('https://youtu.be/12345'))).toBe(true);
    expect(yt.canHandle(new URL('https://m.youtube.com/watch?v=12345'))).toBe(true);
    expect(yt.canHandle(new URL('https://vimeo.com/12345'))).toBe(false);
  });

  it('correctly matches Vimeo URLs', () => {
    const vimeo = new VimeoAdapter();
    expect(vimeo.canHandle(new URL('https://vimeo.com/76979871'))).toBe(true);
    expect(vimeo.canHandle(new URL('https://player.vimeo.com/video/76979871'))).toBe(true);
    expect(vimeo.canHandle(new URL('https://youtube.com/watch?v=123'))).toBe(false);
  });

  it('correctly matches TikTok URLs', () => {
    const tiktok = new TikTokAdapter();
    expect(tiktok.canHandle(new URL('https://www.tiktok.com/@user/video/123456789'))).toBe(true);
    expect(tiktok.canHandle(new URL('https://vm.tiktok.com/ZM812345/'))).toBe(true);
    expect(tiktok.canHandle(new URL('https://example.com'))).toBe(false);
  });

  it('correctly matches direct media stream URLs', () => {
    const direct = new DirectMediaAdapter();
    expect(direct.canHandle(new URL('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'))).toBe(true);
    expect(direct.canHandle(new URL('https://example.com/audio/podcast.mp3'))).toBe(true);
    expect(direct.canHandle(new URL('https://example.com/video.html'))).toBe(false);
  });

  it('rejects unsupported domains through registry', () => {
    expect(sourceRegistry.isSupported(new URL('https://unsupported-random-site.com/video'))).toBe(false);
    expect(sourceRegistry.isSupported(new URL('https://www.youtube.com/watch?v=123'))).toBe(true);
  });

  it('generates appropriate format selectors for YouTube qualities', () => {
    const yt = new YouTubeAdapter();
    const sel1080 = yt.getYtDlpFormatSelector('1080p', 'mp4');
    expect(sel1080).toContain('1080');

    const selMp3 = yt.getYtDlpFormatSelector('Best', 'mp3');
    expect(selMp3).toBe('bestaudio/best');
  });
});
