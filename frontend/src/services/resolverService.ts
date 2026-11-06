import { Track } from '../types/music';

// Blacklisted keywords that indicate non-creator content (covers, reactions, loops, tutorials, etc.)
const NON_CREATOR_KEYWORDS = [
  'reaction',
  'reacts',
  'reacting',
  'react to',
  'vocal coach',
  'review',
  'covered by',
  'cover by',
  'guitar cover',
  'drum cover',
  'piano cover',
  'acoustic cover',
  'bass cover',
  'fingerstyle',
  'instrumental cover',
  'tutorial',
  'how to play',
  'lesson',
  'chords',
  'karaoke',
  '10 hour',
  '10 hours',
  '1 hour',
  '1hr',
  'loop',
  'parody',
  'slowed',
  'reverb',
  'sped up',
  'nightcore',
  '8d audio',
  'bass boosted',
  'amateur',
  'fan made',
  'compilation',
  'status video',
  'ringtone',
  'teaser',
  'trailer',
];

interface ScoredVideo {
  videoId: string;
  title: string;
  artist: string;
  channelTitle: string;
  duration: number;
  thumbnail: string;
  score: number;
  isVerifiedCreator: boolean;
}

class ResolverService {
  private queryCache: Map<string, Track[]> = new Map();
  private videoIdCache: Map<string, string> = new Map();

  // Score and extract official creator video items
  private evaluateVideoRenderer(
    v: any,
    targetArtist?: string,
    targetTitle?: string,
    isPodcastSearch = false
  ): ScoredVideo | null {
    if (!v || !v.videoId) return null;

    const title: string = v.title?.runs?.[0]?.text || '';
    const channel: string = v.ownerText?.runs?.[0]?.text || '';
    const titleLower = title.toLowerCase();
    const channelLower = channel.toLowerCase();

    // 1. Hard disqualification for non-creator and amateur content
    const hasBlacklist = NON_CREATOR_KEYWORDS.some((kw) => {
      // Allow 'cover' only if specifically searched or if title has 'cover' in artist name
      if (kw === 'covered by' || kw === 'cover by') {
        return titleLower.includes(kw);
      }
      return titleLower.includes(` ${kw} `) || titleLower.includes(`(${kw})`) || titleLower.includes(`[${kw}]`) || titleLower.startsWith(`${kw} `) || titleLower.endsWith(` ${kw}`) || channelLower.includes(kw);
    });

    if (hasBlacklist) {
      return null;
    }

    // Direct check for "cover" in title
    if (/\bcover\b/i.test(titleLower) && !targetTitle?.toLowerCase().includes('cover')) {
      return null;
    }
    // Direct check for "reaction" in title
    if (/\breaction\b/i.test(titleLower) || /\breacts\b/i.test(titleLower)) {
      return null;
    }

    // Duration parsing
    const durText: string = v.lengthText?.simpleText || '3:30';
    const parts = durText.split(':').map(Number);
    let duration = 210;
    if (parts.length === 2) {
      duration = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    // Unless searching for podcasts/mixes, filter out shorts (< 60s) and massive compilation videos (> 720s)
    if (!isPodcastSearch) {
      if (duration < 60) return null; // Reject YouTube shorts
      if (duration > 720) return null; // Reject 15-minute+ compilations/loops
    }

    // 2. Identify verified badges
    const badges: string[] = (v.ownerBadges || []).map(
      (b: any) => b.metadataBadgeRenderer?.style || ''
    );
    const hasArtistBadge = badges.includes('BADGE_STYLE_TYPE_VERIFIED_ARTIST');
    const hasVerifiedBadge = badges.includes('BADGE_STYLE_TYPE_VERIFIED');
    const isTopicChannel = channel.endsWith(' - Topic');
    const isVevo = /vevo$/i.test(channelLower) || channelLower.includes('vevo');

    let score = 0;
    let isVerifiedCreator = false;

    // Highest priority: Official YouTube Music Topic Channel (direct record label master upload)
    if (isTopicChannel) {
      score += 200;
      isVerifiedCreator = true;
    }

    // Official Artist Channel badge (musical note)
    if (hasArtistBadge) {
      score += 180;
      isVerifiedCreator = true;
    }

    // Verified Record Label (Sony, Universal, Warner, T-Series, etc.)
    if (hasVerifiedBadge) {
      score += 120;
      isVerifiedCreator = true;
    }

    // VEVO Channel
    if (isVevo) {
      score += 130;
      isVerifiedCreator = true;
    }

    // Artist name match
    if (targetArtist) {
      const artClean = targetArtist.toLowerCase().trim();
      if (channelLower.includes(artClean) || artClean.includes(channelLower.replace(' - topic', ''))) {
        score += 80;
      }
    }

    // Title metadata bonuses for official releases
    if (titleLower.includes('official audio')) score += 60;
    else if (titleLower.includes('official music video')) score += 55;
    else if (titleLower.includes('official video')) score += 50;
    else if (titleLower.includes('official lyric video') || titleLower.includes('lyric video')) score += 40;
    else if (titleLower.includes('(audio)') || titleLower.includes('[audio]')) score += 35;

    // View count weighting (official tracks have high views)
    const viewText: string = v.viewCountText?.simpleText || '';
    if (viewText.includes('M views') || viewText.includes('B views')) {
      score += 30;
    }

    // High quality thumbnail
    const thumbnail =
      v.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
      `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

    // Clean display title and artist
    let displayTitle = title;
    let displayArtist = channel.replace(/ - Topic$/i, '').trim();

    // Clean up "Artist - Title (Official Video)" format
    if (title.includes(' - ')) {
      const segs = title.split(' - ');
      if (segs.length >= 2) {
        displayArtist = segs[0].trim();
        displayTitle = segs.slice(1).join(' - ').trim();
      }
    }

    // Strip out (Official Video), [Official Audio], etc. from visible title for cleaner UI
    displayTitle = displayTitle
      .replace(/\s*[\(\[](Official\s*(Audio|Video|Music Video|Lyric Video|Visualizer)?|Audio|Visualizer)[\)\]]\s*/gi, ' ')
      .trim();

    return {
      videoId: v.videoId,
      title: displayTitle || title,
      artist: displayArtist || channel,
      channelTitle: channel,
      duration,
      thumbnail,
      score,
      isVerifiedCreator,
    };
  }

  // Search full-length songs strictly from verified creators
  async searchFullSongs(query: string, limit = 24): Promise<Track[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    if (this.queryCache.has(cleanQuery)) {
      return this.queryCache.get(cleanQuery)!;
    }

    const isPodcast = /podcast/i.test(cleanQuery);

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
          query: isPodcast ? cleanQuery : `${cleanQuery} official`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const evaluated: ScoredVideo[] = [];

        for (const c of contents) {
          if (c.videoRenderer) {
            const evaluatedItem = this.evaluateVideoRenderer(c.videoRenderer, undefined, cleanQuery, isPodcast);
            if (evaluatedItem) {
              evaluated.push(evaluatedItem);
            }
          }
        }

        // Sort by score descending to prioritize verified artist channels & official label tracks
        evaluated.sort((a, b) => b.score - a.score);

        const tracks: Track[] = evaluated.slice(0, limit).map((v) => {
          // Pre-cache video ID for zero latency
          const cacheKey = `${v.title} - ${v.artist}`.toLowerCase().trim();
          this.videoIdCache.set(cacheKey, v.videoId);

          return {
            id: `yt-${v.videoId}`,
            youtubeId: v.videoId,
            title: v.title,
            artist: v.artist,
            album: v.isVerifiedCreator ? 'Official Release' : 'Studio Track',
            duration: v.duration,
            albumArt: v.thumbnail,
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
      console.warn('Official creator search fallback:', err);
    }

    return this.searchAppleFallback(cleanQuery, limit);
  }

  // Fast Apple fallback (official studio releases directly from iTunes catalog)
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
          album: item.collectionName || 'Official Single',
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

  // Resolve official creator YouTube video ID with scoring
  async resolveYouTubeVideoId(title: string, artist: string): Promise<string | null> {
    const key = `${title} - ${artist}`.toLowerCase().trim();
    if (this.videoIdCache.has(key)) {
      return this.videoIdCache.get(key)!;
    }

    try {
      // Search with specific artist and song name targeting official audio
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
          query: `${artist} ${title} official audio`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const candidates: ScoredVideo[] = [];

        for (const c of contents) {
          if (c.videoRenderer) {
            const evaluated = this.evaluateVideoRenderer(c.videoRenderer, artist, title);
            if (evaluated) {
              candidates.push(evaluated);
            }
          }
        }

        // Sort candidate videos strictly by verified creator score
        candidates.sort((a, b) => b.score - a.score);

        if (candidates.length > 0) {
          const bestMatch = candidates[0];
          this.videoIdCache.set(key, bestMatch.videoId);
          return bestMatch.videoId;
        }
      }
    } catch (e) {
      console.warn('Resolution error:', e);
    }

    return null;
  }
}

export const resolverService = new ResolverService();
