import React from 'react';
import { Music, EllipsisVertical, Heart, Share } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  albumArt: string;
  isPlaying: boolean;
  isSelected: boolean;
}

interface TrackListProps {
  tracks: Track[];
  onPlay: (trackId: string) => void;
  onToggleSelect: (trackId: string) => void;
  onContextMenu: (event: React.MouseEvent, trackId: string) => void;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const TrackList: React.FC<TrackListProps> = ({ tracks, onPlay, onToggleSelect, onContextMenu }) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-1">
      {tracks.map((track, i) => (
        <div
          key={track.id}
          className="glass-card p-3 flex items-center gap-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer select-none"
          onClick={() => onPlay(track.id)}
          onContextMenu={(e) => onContextMenu(e, track.id)}
        >
          <div className="w-10 h-10 rounded relative">
            <img
              src={track.albumArt}
              alt={track.title}
              className="w-full h-full object-cover rounded"
            />
            {track.isPlaying && (
              <div
                className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(2px)' }}
              >
                <span className="text-xs font-medium text-zinc-900">▶</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-100 text-sm line-clamp-1 line-clamp-text-ellipsis truncate">{track.title}</p>
            <p className="text-zinc-500 text-xs line-clamp-1 line-clamp-text-ellipsis truncate">{track.artist}</p>
          </div>
          <span className="text-zinc-500 text-xs">{formatDuration(track.duration)}</span>
          <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 hover:opacity-50 transition-opacity group-hover:opacity-50" />
          <div className="flex gap-2">
            <Heart className="w-3 h-3 text-zinc-500 hover:text-red-500 transition-colors" />
            <Share className="w-3 h-3 text-zinc-500 hover:text-cyan-500 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
};