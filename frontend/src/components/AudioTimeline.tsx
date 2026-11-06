import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  ListMusic, 
  SlidersHorizontal 
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface AudioTimelineProps {
  onToggleQueue?: () => void;
  onToggleEqualizer?: () => void;
}

export const AudioTimeline: React.FC<AudioTimelineProps> = ({
  onToggleQueue,
  onToggleEqualizer,
}) => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    favorites,
    togglePlay,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
    toggleFavorite,
  } = useAudio();

  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(clickRatio * duration);
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(clickRatio);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="bg-zinc-950 border-t border-white/5 px-6 py-3 select-none shrink-0">
      {/* Seekbar */}
      <div
        className="w-full h-2 mb-2 group cursor-pointer relative flex items-center"
        onClick={handleSeek}
      >
        <div className="w-full h-1 group-hover:h-1.5 transition-all bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Track Info (Left) */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80';
                }}
                className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-white/5 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-zinc-100 font-medium text-xs truncate">
                  {currentTrack.title}
                </p>
                <p className="text-zinc-500 text-[11px] truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                className="p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </>
          ) : (
            <p className="text-zinc-600 text-xs">Ready to play</p>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={previousTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-white text-zinc-950 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow"
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-zinc-950" />
              ) : (
                <Play className="w-4 h-4 fill-zinc-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Tools (Volume, EQ, Queue) */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          {onToggleEqualizer && (
            <button
              onClick={onToggleEqualizer}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="EQ"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {onToggleQueue && (
            <button
              onClick={onToggleQueue}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-zinc-400 hover:text-white"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div
              className="w-16 h-1 bg-zinc-800 rounded-full cursor-pointer relative"
              onClick={handleVolume}
            >
              <div
                className="h-full bg-zinc-300 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
