import { invoke } from '@tauri-apps/api/core';

export interface Playlist {
  id: string;
  name: string;
}

export interface PlayerEvent {
  trackId: string;
  isPlaying: boolean;
  progress: number;
}

export const ipc = {
  playlist: {
    load: (id: string) => invoke<void>('playlist_load', { id }),
  },
  player: {
    play: () => invoke<void>('player_play'),
    pause: () => invoke<void>('player_pause'),
    seek: (time: number) => invoke<void>('player_seek', { time }),
  },
  file: {
    import: (path: string) => invoke<void>('file_import', { path }),
  },
  resolver: {
    setInstance: (url: string) => invoke<void>('resolver_set_instance', { url }),
  },
};
