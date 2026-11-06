import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types/music';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { queue, queueIndex, currentTrack, playTrack, clearQueue } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-[#121318]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-white" />
          <h3 className="font-semibold text-white text-sm">Play Queue</h3>
          <span className="text-xs text-neutral-400 font-mono">({queue.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Clear queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <Music className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium text-neutral-400">Queue is empty</p>
            <p className="text-xs mt-1">Add tracks from your library or search</p>
          </div>
        ) : (
          queue.map((track: Track, idx: number) => {
            const isCurrent = idx === queueIndex || currentTrack?.id === track.id;

            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => playTrack(track, queue)}
                className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-white/10 border border-white/10 text-white'
                    : 'hover:bg-white/5 text-neutral-300'
                }`}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#181920] border border-white/10">
                  <img
                    src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80'}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${isCurrent ? 'text-white' : ''}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
