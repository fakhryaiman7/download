import type { SourceAdapter } from './base.adapter.js';
import { YouTubeAdapter } from './youtube.adapter.js';
import { VimeoAdapter } from './vimeo.adapter.js';
import { TikTokAdapter } from './tiktok.adapter.js';
import { DirectMediaAdapter } from './direct.adapter.js';

class SourceRegistry {
  private adapters: SourceAdapter[] = [
    new YouTubeAdapter(),
    new VimeoAdapter(),
    new TikTokAdapter(),
    new DirectMediaAdapter(),
  ];

  public findAdapter(url: URL): SourceAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(url)) {
        return adapter;
      }
    }
    return null;
  }

  public isSupported(url: URL): boolean {
    return this.findAdapter(url) !== null;
  }

  public getSupportedSources(): { name: string; displayName: string; domains: string[] }[] {
    return this.adapters.map((a) => ({
      name: a.name,
      displayName: a.displayName,
      domains: a.domains,
    }));
  }
}

export const sourceRegistry = new SourceRegistry();
