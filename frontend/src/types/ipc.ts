import { invoke } from '@tauri-apps/api/core';

export interface Playlist {
  id: string;
  name: string;
  type: 'spotify' | 'ytmusic';
  trackCount: number;
  coverArt?: string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  albumArt: string;
  source?: 'spotify' | 'ytmusic' | 'local';
  uri?: string;
  streamUrl?: string;
  isPlaying?: boolean;
  isSelected?: boolean;
}

export interface StreamInfo {
  url: string;
  format: string;
  quality: string;
}

export interface ResolverResult {
  track_id: string;
  stream_url: string;
  streams: StreamInfo[];
}

export interface PlayerEvent {
  trackId: string;
  isPlaying: boolean;
  progress: number;
}

export const ipc = {
  playlist: {
    load: (id: string) => invoke<string>('playlist_load', { id }),
  },
  player: {
    play: () => invoke<void>('player_play'),
    pause: () => invoke<void>('player_pause'),
    seek: (time: number) => invoke<void>('player_seek', { time }),
    setVolume: (volume: number) => invoke<void>('player_set_volume', { volume }),
    next: () => invoke<void>('player_next'),
    prev: () => invoke<void>('player_prev'),
  },
  file: {
    import: (path: string) => invoke<string>('file_import', { path }),
  },
  resolver: {
    setInstance: (url: string) => invoke<void>('resolver_set_instance', { url }),
    resolve: (trackId: string, source: string, uri: string) =>
      invoke<ResolverResult>('resolver_resolve', { trackId, source, uri }),
  },
};
