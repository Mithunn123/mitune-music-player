import { storageService } from './storageService';
import { resolverService } from './resolverService';
import { Track } from '../types/music';

// Instant Vibe Seed Categories
export const TRENDING_SEEDS = [
  { tag: "Today's Global Top Hits", query: 'Top Hits 2026' },
  { tag: 'Chill Lo-Fi & Study', query: 'lofi chill beats' },
  { tag: 'Synthwave & Cyberpunk', query: 'synthwave electro' },
  { tag: 'Workout & Phonk Power', query: 'phonk workout bass' },
  { tag: 'Late Night R&B & Soul', query: 'r&b neo soul' },
  { tag: 'Indie & Alt Pop', query: 'indie pop alternative' },
];

class RecommendationEngine {
  private cache: Map<string, Track[]> = new Map();

  async fetchInstantSongs(query: string, maxResults = 12): Promise<Track[]> {
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    const tracks = await resolverService.searchMusic(query, maxResults);
    if (tracks.length > 0) {
      this.cache.set(query, tracks);
      return tracks;
    }

    return this.getDemoFallback();
  }

  async generatePersonalizedFeed(): Promise<{
    headline: string;
    description: string;
    forYouTracks: Track[];
    genreShelves: { title: string; tracks: Track[] }[];
  }> {
    const history = await storageService.getRecentHistory(30);

    // 1. Calculate top listened artists / terms
    const artistScores: Record<string, number> = {};
    for (const item of history) {
      const art = item.artist;
      if (art && art !== 'Unknown Artist' && art !== 'Local Artist') {
        artistScores[art] = (artistScores[art] || 0) + 1;
      }
    }

    const topArtists = Object.keys(artistScores).sort(
      (a, b) => artistScores[b] - artistScores[a]
    );

    let forYouQuery = 'Billboard Hot 100';
    let headline = 'Discover Weekly · Global Hits';
    let description = 'Instant stream recommendations matching worldwide streaming popularity.';

    if (topArtists.length > 0) {
      const favArtist = topArtists[0];
      forYouQuery = favArtist;
      headline = `Inspired by your love for ${favArtist}`;
      description = `Handcrafted algorithmic mix combining ${favArtist} with similar chart-topping tracks.`;
    }

    // Fetch primary For You mix
    const forYouTracks = await this.fetchInstantSongs(forYouQuery, 14);

    // Dynamic Shelves
    const shelfQueries = [
      topArtists.length > 1
        ? { title: `More from ${topArtists[1]} & Similar`, query: topArtists[1] }
        : { title: '🔥 Global Billboard Top Hits', query: 'The Weeknd Taylor Swift Drake' },
      { title: '⚡ Fast Energy & Phonk Drive', query: 'phonk workout drift' },
      { title: '🌙 Late Night Mood & Lo-Fi Beats', query: 'lofi hip hop chill beats' },
    ];

    const genreShelves: { title: string; tracks: Track[] }[] = [];
    for (const shelf of shelfQueries) {
      const shelfTracks = await this.fetchInstantSongs(shelf.query, 8);
      if (shelfTracks.length > 0) {
        genreShelves.push({
          title: shelf.title,
          tracks: shelfTracks,
        });
      }
    }

    return {
      headline,
      description,
      forYouTracks: forYouTracks.length > 0 ? forYouTracks : this.getDemoFallback(),
      genreShelves,
    };
  }

  private getDemoFallback(): Track[] {
    return [
      {
        id: 'demo-1',
        title: 'Midnight City',
        artist: 'M83',
        album: "Hurry Up, We're Dreaming",
        duration: 243,
        albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
        source: 'instant',
        streamUrl: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
      },
      {
        id: 'demo-2',
        title: 'Cyber Echoes',
        artist: 'Antigravity Studio',
        album: 'Neon Skies',
        duration: 185,
        albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        source: 'instant',
        streamUrl: 'https://cdn.freesound.org/previews/655/655317_11861866-lq.mp3',
      },
    ];
  }
}

export const recommendationEngine = new RecommendationEngine();
