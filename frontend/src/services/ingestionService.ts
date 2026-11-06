import { Track } from '../types/music';
import * as musicMetadata from 'music-metadata-browser';

export interface ParsedPlaylist {
  name: string;
  tracks: Track[];
}

export const ingestionService = {
  // Parse local audio file (MP3, WAV, FLAC, OGG, M4A)
  async parseLocalFile(file: File): Promise<Track> {
    const audioBlobUrl = URL.createObjectURL(file);
    let title = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Local Artist';
    let album = 'Local Audio';
    let duration = 0;
    let albumArt = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80';

    try {
      const metadata = await musicMetadata.parseBlob(file);
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) artist = metadata.common.artist;
      if (metadata.common.album) album = metadata.common.album;
      if (metadata.format.duration) duration = Math.round(metadata.format.duration);

      const picture = metadata.common.picture?.[0];
      if (picture) {
        const uint8 = new Uint8Array(picture.data);
        const blob = new Blob([uint8.buffer as ArrayBuffer], { type: picture.format });
        albumArt = URL.createObjectURL(blob);
      }
    } catch (e) {
      console.warn('Could not read full ID3 tags, fallback to basic info', e);
    }

    // Try HTML5 Audio for duration if metadata parser didn't get it
    if (!duration) {
      duration = await new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.src = audioBlobUrl;
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration) || 180);
        };
        audio.onerror = () => resolve(180);
      });
    }

    return {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      artist,
      album,
      duration,
      albumArt,
      source: 'local',
      audioBlobUrl,
      addedAt: Date.now(),
    };
  },

  // Parse JSON Playlist File (Spotify / YT Music export)
  async parseJsonExport(file: File): Promise<ParsedPlaylist> {
    const text = await file.text();
    const data = JSON.parse(text);

    let name = file.name.replace(/\.[^/.]+$/, '');
    const tracks: Track[] = [];

    // Check Spotify JSON structure
    if (data.name) name = data.name;
    const rawTracks = data.tracks || data.items || (Array.isArray(data) ? data : []);

    for (let i = 0; i < rawTracks.length; i++) {
      const item = rawTracks[i];
      const trackObj = item.track || item;
      const title = trackObj.name || trackObj.title || `Track ${i + 1}`;
      const artist = trackObj.artists
        ? (Array.isArray(trackObj.artists) ? trackObj.artists.map((a: any) => a.name || a).join(', ') : trackObj.artists)
        : trackObj.artist || 'Unknown Artist';
      const album = trackObj.album?.name || trackObj.album || '';
      const duration = Math.round((trackObj.duration_ms || trackObj.duration || 180000) / 1000);
      const albumArt = trackObj.album?.images?.[0]?.url || trackObj.albumArt || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80';

      tracks.push({
        id: `json-${Date.now()}-${i}`,
        title,
        artist,
        album,
        duration,
        albumArt,
        source: 'piped',
        addedAt: Date.now(),
      });
    }

    return { name, tracks };
  },

  // Parse Spotify / YT Music URL
  parseMusicUrl(url: string): { type: 'spotify' | 'ytmusic' | 'unknown'; id: string } {
    url = url.trim();

    // Spotify playlist or track regex
    const spotifyMatch = url.match(/spotify\.com\/(?:intl-[a-z]+\/)?(playlist|track)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
      return { type: 'spotify', id: spotifyMatch[2] };
    }

    // YouTube / YT Music playlist or watch URL
    const ytMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/) || url.match(/(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return { type: 'ytmusic', id: ytMatch[1] };
    }

    return { type: 'unknown', id: '' };
  },
};
