import { storageService } from './storageService';

export interface PipedStreamTrack {
  url: string;
  format: string;
  quality: string;
  bitrate: number;
  mimeType: string;
}

export interface PipedSearchResult {
  id: string;
  title: string;
  uploaderName: string;
  uploaderAvatar?: string;
  thumbnail: string;
  duration: number;
}

const PUBLIC_PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.private.coffee',
  'https://pipedapi.adminforge.de',
  'https://piped-api.lunar.icu',
  'https://cf.pipedapi.tokhmi.xyz'
];

class ResolverService {
  private activeInstanceIndex = 0;

  get currentInstance(): string {
    return PUBLIC_PIPED_INSTANCES[this.activeInstanceIndex];
  }

  nextInstance(): string {
    this.activeInstanceIndex = (this.activeInstanceIndex + 1) % PUBLIC_PIPED_INSTANCES.length;
    return this.currentInstance;
  }

  async searchMusic(query: string): Promise<PipedSearchResult[]> {
    for (let attempts = 0; attempts < PUBLIC_PIPED_INSTANCES.length; attempts++) {
      const instance = this.currentInstance;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=music_songs`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          return items
            .filter((item: any) => item.type === 'stream')
            .map((item: any) => {
              const videoId = item.url ? item.url.replace('/watch?v=', '') : item.id;
              return {
                id: videoId,
                title: item.title,
                uploaderName: item.uploaderName || 'Unknown Artist',
                uploaderAvatar: item.uploaderAvatar,
                thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
                duration: item.duration || 180,
              };
            });
        }
      } catch (e) {
        console.warn(`Search attempt failed on ${instance}, trying next...`);
        this.nextInstance();
      }
    }
    return [];
  }

  async resolveAudioStream(trackId: string): Promise<string | null> {
    const cacheKey = `stream:${trackId}`;
    const cached = await storageService.getCachedStream(cacheKey);
    if (cached) {
      return cached;
    }

    for (let attempts = 0; attempts < PUBLIC_PIPED_INSTANCES.length; attempts++) {
      const instance = this.currentInstance;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`${instance}/streams/${trackId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const audioStreams = data.audioStreams || [];
          if (audioStreams.length > 0) {
            // Pick highest quality m4a/opus or mp4
            const sorted = audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
            const selectedUrl = sorted[0].url;

            await storageService.setCachedStream(cacheKey, selectedUrl, data.title);
            return selectedUrl;
          }
        }
      } catch (e) {
        console.warn(`Resolve stream attempt failed on ${instance}, switching...`);
        this.nextInstance();
      }
    }

    return null;
  }
}

export const resolverService = new ResolverService();
