import { storageService } from './storageService';
import { resolverService } from './resolverService';
import { Track } from '../types/music';

// Instant Vibe Seed Categories
export const TRENDING_SEEDS = [
  { tag: "Today's Global Top Hits", query: 'Top Hits 2026 official songs' },
  { tag: 'Chill Lo-Fi & Study', query: 'lofi hip hop radio beats to relax' },
  { tag: 'Synthwave & Cyberpunk', query: 'synthwave 80s electro mix' },
  { tag: 'Workout & Phonk Power', query: 'phonk workout drift music' },
  { tag: 'Late Night R&B & Soul', query: 'r&b soul late night playlist' },
  { tag: 'Indie & Alt Rock', query: 'indie rock alternative pop' },
];

class RecommendationEngine {
  private cache: Map<string, Track[]> = new Map();

  async fetchFullSongs(query: string, maxResults = 14): Promise<Track[]> {
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    const tracks = await resolverService.searchFullSongs(query, maxResults);
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

    // Calculate top listened artists
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

    let forYouQuery = 'Trending Music Hits 2026';
    let headline = 'Discover Weekly · Full Length Tracks';
    let description = 'Complete, full-length songs curated dynamically from worldwide trends.';

    if (topArtists.length > 0) {
      const favArtist = topArtists[0];
      forYouQuery = `${favArtist} top songs full`;
      headline = `Inspired by your love for ${favArtist}`;
      description = `Handcrafted algorithmic mix with full-length tracks by ${favArtist} and related artists.`;
    }

    // Fetch primary For You mix
    const forYouTracks = await this.fetchFullSongs(forYouQuery, 14);

    // Dynamic Shelves
    const shelfQueries = [
      topArtists.length > 1
        ? { title: `More from ${topArtists[1]}`, query: `${topArtists[1]} best songs` }
        : { title: '🔥 Global Billboard Top Hits', query: 'Billboard Hot 100 songs' },
      { title: '⚡ High Octane Phonk & Gym Drive', query: 'best phonk songs gym' },
      { title: '🌙 Late Night Mood & Lo-Fi Session', query: 'chill lofi songs' },
    ];

    const genreShelves: { title: string; tracks: Track[] }[] = [];
    for (const shelf of shelfQueries) {
      const shelfTracks = await this.fetchFullSongs(shelf.query, 8);
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
        id: 'yt-yKNxeF4KMsY',
        youtubeId: 'yKNxeF4KMsY',
        title: 'Coldplay - Yellow (Official Video)',
        artist: 'Coldplay',
        album: 'Parachutes',
        duration: 269,
        albumArt: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
        source: 'youtube',
      },
      {
        id: 'yt-fHI8X4OXluQ',
        youtubeId: 'fHI8X4OXluQ',
        title: 'The Weeknd - Blinding Lights (Official Audio)',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
        albumArt: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg',
        source: 'youtube',
      },
    ];
  }
}

export const recommendationEngine = new RecommendationEngine();
