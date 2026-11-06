import { storageService } from './storageService';
import { Track } from '../types/music';

class ResolverService {
  private queryCache: Map<string, Track[]> = new Map();
  private videoIdCache: Map<string, string> = new Map();

  // Search full-length songs using Innertube with zero CORS issues via local proxy
  async searchFullSongs(query: string, limit = 20): Promise<Track[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    if (this.queryCache.has(cleanQuery)) {
      return this.queryCache.get(cleanQuery)!;
    }

    try {
      const res = await fetch('/api/youtube/youtubei/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00',
            },
          },
          query: cleanQuery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const tracks: Track[] = contents
          .filter((c: any) => c.videoRenderer && c.videoRenderer.videoId)
          .slice(0, limit)
          .map((c: any) => {
            const v = c.videoRenderer;
            const durText = v.lengthText?.simpleText || '3:30';
            const parts = durText.split(':').map(Number);
            let duration = 210;
            if (parts.length === 2) {
              duration = parts[0] * 60 + parts[1];
            } else if (parts.length === 3) {
              duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
            }

            const title = v.title?.runs?.[0]?.text || 'Unknown Title';
            const artist = v.ownerText?.runs?.[0]?.text || 'Featured Artist';
            const thumbnail =
              v.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
              `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

            return {
              id: `yt-${v.videoId}`,
              youtubeId: v.videoId,
              title,
              artist,
              album: 'Official Full Track',
              duration,
              albumArt: thumbnail,
              source: 'youtube',
              addedAt: Date.now(),
            };
          });

        if (tracks.length > 0) {
          this.queryCache.set(cleanQuery, tracks);
          return tracks;
        }
      }
    } catch (err) {
      console.warn('Innertube search proxy fallback to Apple Catalog:', err);
    }

    // Fallback: iTunes search
    return this.searchAppleFallback(cleanQuery, limit);
  }

  // Fallback search
  private async searchAppleFallback(cleanQuery: string, limit: number): Promise<Track[]> {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        cleanQuery
      )}&media=music&entity=song&limit=${limit}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        return results.map((item: any) => ({
          id: `apple-${item.trackId}`,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Single',
          duration: Math.round((item.trackTimeMillis || 180000) / 1000),
          albumArt: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          source: 'instant',
          streamUrl: item.previewUrl,
          addedAt: Date.now(),
        }));
      }
    } catch {}
    return [];
  }

  // Find exact YouTube Video ID for any track so it plays the full song
  async resolveYouTubeVideoId(title: string, artist: string): Promise<string | null> {
    const key = `${title} - ${artist}`.toLowerCase().trim();
    if (this.videoIdCache.has(key)) {
      return this.videoIdCache.get(key)!;
    }

    try {
      const res = await fetch('/api/youtube/youtubei/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00',
            },
          },
          query: `${title} ${artist} official audio`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const video = contents.find((c: any) => c.videoRenderer)?.videoRenderer;
        if (video && video.videoId) {
          this.videoIdCache.set(key, video.videoId);
          return video.videoId;
        }
      }
    } catch (e) {
      console.warn('Could not resolve video ID for full playback:', e);
    }

    return null;
  }
}

export const resolverService = new ResolverService();
