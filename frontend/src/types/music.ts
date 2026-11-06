export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  albumArt: string;
  source: 'local' | 'piped' | 'spotify' | 'ytmusic' | 'demo' | 'instant';
  uri?: string;
  streamUrl?: string;
  file?: File;
  audioBlobUrl?: string;
  addedAt?: number;
  genre?: string;
  mood?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  type: 'custom' | 'spotify' | 'ytmusic' | 'local';
  trackCount: number;
  coverArt?: string;
  tracks: Track[];
  createdAt: number;
}

export interface StreamInfo {
  url: string;
  format: string;
  quality: string;
  bitrate?: number;
}

export interface ResolverResult {
  track_id: string;
  stream_url: string;
  streams: StreamInfo[];
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
  node?: BiquadFilterNode;
}
