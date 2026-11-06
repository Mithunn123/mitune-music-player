import { storageService } from './storageService';
import { resolverService } from './resolverService';
import { Track } from '../types/music';

// Curated Top Hits with PRE-RESOLVED YouTube IDs for ZERO playback latency
const PRE_RESOLVED_HITS: Track[] = [
  {
    id: 'yt-fHI8X4OXluQ',
    youtubeId: 'fHI8X4OXluQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    albumArt: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-yKNxeF4KMsY',
    youtubeId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    duration: 269,
    albumArt: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-V9PVRfjEBTI',
    youtubeId: 'V9PVRfjEBTI',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 231,
    albumArt: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-ic8j13piAhQ',
    youtubeId: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    duration: 178,
    albumArt: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-OPf0YbXqDm0',
    youtubeId: 'OPf0YbXqDm0',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    album: 'Uptown Special',
    duration: 270,
    albumArt: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-BBAyRKS9vUs',
    youtubeId: 'BBAyRKS9vUs',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 230,
    albumArt: 'https://i.ytimg.com/vi/BBAyRKS9vUs/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-09R8_2nJtjg',
    youtubeId: '09R8_2nJtjg',
    title: 'Sugar',
    artist: 'Maroon 5',
    album: 'V',
    duration: 235,
    albumArt: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-JGwWNGJdvx8',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    duration: 233,
    albumArt: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-hT_nvWreIhg',
    youtubeId: 'hT_nvWreIhg',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    album: 'Native',
    duration: 257,
    albumArt: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-kffacxfA7G4',
    youtubeId: 'kffacxfA7G4',
    title: 'Baby',
    artist: 'Justin Bieber',
    album: 'My World 2.0',
    duration: 216,
    albumArt: 'https://i.ytimg.com/vi/kffacxfA7G4/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-pRpeEdMmmQ0',
    youtubeId: 'pRpeEdMmmQ0',
    title: 'Waka Waka (This Time for Africa)',
    artist: 'Shakira',
    album: 'Sale el Sol',
    duration: 202,
    albumArt: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg',
    source: 'youtube',
  },
  {
    id: 'yt-YQHsXMglC9A',
    youtubeId: 'YQHsXMglC9A',
    title: 'Hello',
    artist: 'Adele',
    album: '25',
    duration: 295,
    albumArt: 'https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg',
    source: 'youtube',
  },
];

export const TRENDING_SEEDS = [
  { tag: "Today's Hits", query: 'Top Billboard Hits 2026' },
  { tag: 'Lo-Fi Chill', query: 'lofi hip hop study beats' },
  { tag: 'Synthwave', query: 'synthwave 80s electro' },
  { tag: 'Rock Classics', query: 'Classic Rock hits' },
  { tag: 'Deep Focus', query: 'deep focus ambient sound' },
];

class RecommendationEngine {
  private cache: Map<string, Track[]> = new Map();

  async fetchFullSongs(query: string, maxResults = 12): Promise<Track[]> {
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    const tracks = await resolverService.searchFullSongs(query, maxResults);
    if (tracks.length > 0) {
      this.cache.set(query, tracks);
      return tracks;
    }

    return PRE_RESOLVED_HITS;
  }

  async generatePersonalizedFeed(): Promise<{
    headline: string;
    description: string;
    forYouTracks: Track[];
    genreShelves: { title: string; tracks: Track[] }[];
  }> {
    const history = await storageService.getRecentHistory(30);

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

    let forYouTracks = PRE_RESOLVED_HITS;
    let headline = 'Top Mix For You';
    let description = 'Instant full-length playback of worldwide chart hits.';

    if (topArtists.length > 0) {
      const favArtist = topArtists[0];
      headline = `Based on ${favArtist}`;
      description = `Popular releases by ${favArtist} and related artists.`;
      const fetched = await this.fetchFullSongs(`${favArtist} hits`, 12);
      if (fetched.length > 0) forYouTracks = fetched;
    }

    // Only 2 lightweight shelves to keep dashboard ultra-fast and uncluttered
    const genreShelves: { title: string; tracks: Track[] }[] = [];
    const shelf1 = await this.fetchFullSongs('Trending English Pop Hits', 6);
    if (shelf1.length > 0) {
      genreShelves.push({ title: 'Global Pop Hits', tracks: shelf1 });
    }

    const shelf2 = await this.fetchFullSongs('Lofi hip hop beats', 6);
    if (shelf2.length > 0) {
      genreShelves.push({ title: 'Chill & Study Beats', tracks: shelf2 });
    }

    return {
      headline,
      description,
      forYouTracks,
      genreShelves,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
