import React from 'react';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const AudioTimeline: React.FC<{
  onPrevious: () => void;
  onNext: () => void;
}> = ({ onPrevious, onNext }) => {
  const { isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume } = useAudio();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    seek(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVol = Math.max(0, Math.min(1, clickX / width));
    setVolume(newVol);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="flex items-center justify-between px-4 pb-3 border-t border-white/10">
      {/* Waveform visualizer */}
      <div className="flex-1 h-1 mr-4 cursor-pointer" onClick={handleSeekClick}>
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-indigo-purple transform duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-zinc-500 text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400"
          aria-label="Previous track"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className="p-3 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-green-400" />
          ) : (
            <Play className="w-6 h-6 text-zinc-300" />
          )}
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400"
          aria-label="Next track"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume slider */}
      <div
        className="ml-6 w-24 h-2 rounded-full bg-zinc-800 relative overflow-hidden cursor-pointer"
        onClick={handleVolumeClick}
      >
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-200"
          style={{ width: `${volume * 100}%` }}
        />
        <div
          style={{ left: `${volume * 100}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white text-zinc-900 pointer-events-none"
        />
      </div>
    </div>
  );
};
