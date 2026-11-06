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
    };
    indexes: { 'by-played': number };
  };
  favorites: {
    key: string;
    value: {
      trackId: string;
      addedAt: number;
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
    return all.map((f) => f.trackId);
  },

  async toggleFavorite(trackId: string): Promise<boolean> {
    const db = await getDB();
    const existing = await db.get('favorites', trackId);
    if (existing) {
      await db.delete('favorites', trackId);
      return false;
    } else {
      await db.put('favorites', { trackId, addedAt: Date.now() });
      return true;
    }
  },

  // History
  async addHistory(trackId: string, title: string, artist: string): Promise<void> {
    const db = await getDB();
    await db.add('history', {
      trackId,
      title,
      artist,
      playedAt: Date.now(),
    });
  },

  async getRecentHistory(limit = 20) {
    const db = await getDB();
    const tx = db.transaction('history', 'readonly');
    const index = tx.store.index('by-played');
    const records = await index.getAll();
    return records.reverse().slice(0, limit);
  },
};
