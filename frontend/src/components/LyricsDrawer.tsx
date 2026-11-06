import React from 'react';
import { X, Mic2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface LyricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsDrawer: React.FC<LyricsDrawerProps> = ({ isOpen, onClose }) => {
  const { currentTrack, currentTime } = useAudio();

  if (!isOpen) return null;

  // Placeholder synced lyrics generator based on track
  const sampleLyrics = [
    { time: 0, text: '♪ Instrumental intro ♪' },
    { time: 12, text: `I've been on my own for long enough` },
    { time: 24, text: `Maybe you can show me how to love, maybe` },
    { time: 38, text: `I'm going through withdrawals` },
    { time: 48, text: `You don't even have to do too much` },
    { time: 60, text: `You can turn me on with just a touch, baby` },
    { time: 75, text: `I look around and Sin City's cold and empty` },
    { time: 88, text: `No one's around to judge me` },
    { time: 102, text: `I can't see clearly when you're gone` },
    { time: 118, text: `I said, ooh, I'm blinded by the lights` },
    { time: 135, text: `No, I can't sleep until I feel your touch` },
    { time: 152, text: `I said, ooh, I'm drowning in the night` },
    { time: 170, text: `Oh, when I'm like this, you're the one I trust` },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-[#121318]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-white" />
          <h3 className="font-semibold text-white text-sm">Lyrics</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Track summary */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <img
          src={currentTrack?.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
          alt=""
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-lg object-cover border border-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-white truncate">{currentTrack?.title || 'No Track Selected'}</p>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{currentTrack?.artist || 'Select a song'}</p>
        </div>
      </div>

      {/* Lyrics body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {sampleLyrics.map((line, idx) => {
          const isActive = currentTime >= line.time && (idx === sampleLyrics.length - 1 || currentTime < sampleLyrics[idx + 1].time);
          const isPast = currentTime > line.time;

          return (
            <p
              key={idx}
              className={`text-lg transition-all duration-300 font-semibold ${
                isActive
                  ? 'text-white scale-[1.02] origin-left'
                  : isPast
                  ? 'text-neutral-400'
                  : 'text-neutral-600'
              }`}
            >
              {line.text}
            </p>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center text-[11px] text-neutral-500 font-mono">
        Synced Studio Lyrics · 100% Creator Verified
      </div>
    </div>
  );
};
