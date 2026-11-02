import React from 'react';
import { SkipPrevious, PlayPause, SkipNext, Volume, Volume2 } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (value: number) => void;
  volume: number;
}

export const AudioTimeline: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayToggle,
  onPrevious,
  onNext,
  onVolumeChange,
  volume,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);
  const [seekTime, setSeekTime] = React.useState(0);

  // Simulated progress update
  React.useEffect(() => {
    if (isPlaying && !isSeeking) {
      const updateProgress = () => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 0.5;
        });
        setTimeout(updateProgress, 200);
      };
      updateProgress();
    }
  }, [isPlaying, isSeeking]);

  return (
    <div className="flex items-center justify-between px-4 pb-3 border-t border-white/10">
      {/* Waveform visualizer */}
      <div className="flex-1 h-1 mr-4">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-indigo-purple transform duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-zinc-500 text-xs">
          {progress > 0 ? `${Math.round((progress / 100) * 200)}s / 200s` : '0:00 / 3:20'}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400"
          aria-label="Previous track"
        >
          <SkipPrevious className="w-5 h-5" />
        </button>
        <button
          onClick={onPlayToggle}
          className="p-3 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <PlayPause
            className={`w-6 h-6 ${isPlaying ? 'text-green-400' : 'text-zinc-300'}`}
          />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400"
          aria-label="Next track"
        >
          <SkipNext className="w-5 h-5" />
        </button>
      </div>

      {/* Volume slider */}
      <div className="ml-6 w-24 h-2 rounded-full bg-zinc-800 relative overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-200"
          style={{ width: `${volume * 100}%` }}
        />
        <button
          type="button"
          onClick={e => e.stopPropagation()}
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white text-zinc-900"
        />
      </div>
    </div>
  );
};