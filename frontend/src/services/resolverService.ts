import { ipc, ResolverResult } from '../types/ipc';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.yt.artemislabs.eu',
  'https://pipedapi.adminforge.de',
];

const DB_NAME = 'mitone-db';
const STORE_NAME = 'resolver_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class ResolverService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => resolve();
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async getCached(key: string): Promise<string | null> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.expires > Date.now()) {
            resolve(result.streamUrl);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async setCache(key: string, streamUrl: string): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put({
          key,
          streamUrl,
          expires: Date.now() + CACHE_TTL_MS,
        });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async resolveTrack(trackId: string, source: string, uri: string): Promise<string> {
    const cacheKey = `${source}:${trackId}:${uri}`;
    const cached = await this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Try Piped instances
    for (const instance of PIPED_INSTANCES) {
      try {
        const response = await fetch(`${instance}/streams/${trackId}`);
        if (response.ok) {
          const data = await response.json();
          // Find audio stream
          const audioStreams = data.audioStreams || [];
          if (audioStreams.length > 0) {
            // Sort by bitrate or pick first
            const streamUrl = audioStreams[0].url;
            await this.setCache(cacheKey, streamUrl);
            return streamUrl;
          }
        }
      } catch {
        // Try next instance
      }
    }

    // Fallback to Tauri IPC resolver
    try {
      const res: ResolverResult = await ipc.resolver.resolve(trackId, source, uri);
      if (res && res.stream_url) {
        await this.setCache(cacheKey, res.stream_url);
        return res.stream_url;
      }
    } catch (e) {
      console.error('IPC resolver fallback failed:', e);
    }

    throw new Error(`Failed to resolve audio stream for track ${trackId}`);
  }
}

export const resolverService = new ResolverService();
