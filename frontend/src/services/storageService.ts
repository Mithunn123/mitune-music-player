import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Playlist, Track } from '../types/music';

interface MitoneDB extends DBSchema {
  playlists: {
    key: string;
    value: Playlist;
    indexes: { 'by-name': string };
  };
  tracks: {
    key: string;
    value: Track;
    indexes: { 'by-artist': string; 'by-title': string };
  };
  resolver_cache: {
    key: string;
    value: {
      key: string;
      streamUrl: string;
      title?: string;
      expires: number;
    };
  };
  history: {
    key: number;
    value: {
      id?: number;
      trackId: string;
      title: string;
      artist: string;
      playedAt: number;
      track?: Track;
    };
    indexes: { 'by-played': number };
  };
  favorites: {
    key: string;
    value: {
      trackId: string;
      addedAt: number;
      track?: Track;
    };
  };
}

const DB_NAME = 'mitone-music-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<MitoneDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MitoneDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('playlists')) {
          const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
          playlistStore.createIndex('by-name', 'name');
        }
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('by-artist', 'artist');
          trackStore.createIndex('by-title', 'title');
        }
        if (!db.objectStoreNames.contains('resolver_cache')) {
          db.createObjectStore('resolver_cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', {
            keyPath: 'id',
            autoIncrement: true,
          });
          historyStore.createIndex('by-played', 'playedAt');
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'trackId' });
        }
      },
    });
  }
  return dbPromise;
};

// Database helper operations
export const storageService = {
  // Playlists
  async getAllPlaylists(): Promise<Playlist[]> {
    const db = await getDB();
    return db.getAll('playlists');
  },

  async savePlaylist(playlist: Playlist): Promise<void> {
    const db = await getDB();
    await db.put('playlists', playlist);
  },

  async deletePlaylist(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('playlists', id);
  },

  // Tracks
  async saveTrack(track: Track): Promise<void> {
    const db = await getDB();
    await db.put('tracks', track);
  },

  async getAllTracks(): Promise<Track[]> {
    const db = await getDB();
    return db.getAll('tracks');
  },

  async getTrack(id: string): Promise<Track | undefined> {
    const db = await getDB();
    return db.get('tracks', id);
  },

  // Resolver Cache
  async getCachedStream(key: string): Promise<string | null> {
    const db = await getDB();
    const entry = await db.get('resolver_cache', key);
    if (entry && entry.expires > Date.now()) {
      return entry.streamUrl;
    }
    return null;
  },

  async setCachedStream(key: string, streamUrl: string, title?: string): Promise<void> {
    const db = await getDB();
    await db.put('resolver_cache', {
      key,
      streamUrl,
      title,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
  },

  // Favorites
  async getFavorites(): Promise<string[]> {
    const db = await getDB();
    const all = await db.getAll('favorites');
    return all.map((f) => String(f.trackId));
  },

  async getFavoriteTracks(): Promise<Track[]> {
    const db = await getDB();
    const all = await db.getAll('favorites');
    const tracks: Track[] = [];
    for (const f of all) {
      if (f.track) {
        tracks.push(f.track);
      } else {
        const stored = await db.get('tracks', f.trackId);
        if (stored) tracks.push(stored);
      }
    }
    return tracks;
  },

  async toggleFavorite(trackId: string, trackData?: Track): Promise<boolean> {
    const db = await getDB();
    const normalizedId = String(trackId);
    const existing = await db.get('favorites', normalizedId);
    if (existing) {
      await db.delete('favorites', normalizedId);
      return false;
    } else {
      let resolvedTrack = trackData;
      if (!resolvedTrack) {
        resolvedTrack = await db.get('tracks', normalizedId);
      } else {
        await db.put('tracks', resolvedTrack);
      }
      await db.put('favorites', { trackId: normalizedId, addedAt: Date.now(), track: resolvedTrack });
      return true;
    }
  },

  // History
  async addHistory(trackId: string, title: string, artist: string, trackData?: Track): Promise<void> {
    const db = await getDB();
    const normalizedId = String(trackId);
    // Deduplicate consecutive recent entries (e.g., if replaying or spam clicking)
    const tx = db.transaction('history', 'readonly');
    const index = tx.store.index('by-played');
    const records = await index.getAll();
    const lastRecord = records[records.length - 1];
    if (lastRecord && String(lastRecord.trackId) === normalizedId && Date.now() - lastRecord.playedAt < 5000) {
      return;
    }

    let resolvedTrack = trackData;
    if (!resolvedTrack) {
      resolvedTrack = await db.get('tracks', normalizedId);
    } else {
      await db.put('tracks', resolvedTrack);
    }

    await db.add('history', {
      trackId: normalizedId,
      title,
      artist,
      playedAt: Date.now(),
      track: resolvedTrack,
    });
  },

  async getRecentHistory(limit = 30) {
    const db = await getDB();
    const tx = db.transaction('history', 'readonly');
    const index = tx.store.index('by-played');
    const records = await index.getAll();
    return records.reverse().slice(0, limit);
  },

  async getRecentHistoryTracks(limit = 30): Promise<Track[]> {
    const db = await getDB();
    const tx = db.transaction('history', 'readonly');
    const index = tx.store.index('by-played');
    const records = (await index.getAll()).reverse().slice(0, limit);
    const tracks: Track[] = [];
    const seenIds = new Set<string>();

    for (const r of records) {
      if (!seenIds.has(String(r.trackId))) {
        seenIds.add(String(r.trackId));
        if (r.track) {
          tracks.push(r.track);
        } else {
          const stored = await db.get('tracks', String(r.trackId));
          if (stored) {
            tracks.push(stored);
          } else {
            tracks.push({
              id: String(r.trackId),
              title: r.title,
              artist: r.artist,
              album: 'Single',
              duration: 180,
              albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
              source: 'youtube',
            });
          }
        }
      }
    }
    return tracks;
  },
};
