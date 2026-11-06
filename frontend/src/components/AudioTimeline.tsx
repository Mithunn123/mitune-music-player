import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1, 
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
    isShuffle,
    repeatMode,
    favorites,
    visualizerData,
    togglePlay,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
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
    <div className="relative z-30 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/10 px-4 py-3 select-none">
      {/* Visualizer micro-bar on top border */}
      {visualizerData && isPlaying && (
        <div className="absolute -top-1 left-0 right-0 h-1 flex items-end justify-center gap-1 opacity-70 overflow-hidden pointer-events-none">
          {Array.from(visualizerData.slice(0, 32)).map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-400 transition-all duration-75"
              style={{ height: `${Math.max(15, (val / 255) * 100)}%` }}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className="w-full h-2 mb-2 group cursor-pointer relative flex items-center"
        onClick={handleSeek}
      >
        <div className="w-full h-1 group-hover:h-1.5 transition-all bg-zinc-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div
          className="absolute w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Track Metadata (Left) */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          {currentTrack ? (
            <>
              <div className="relative group">
                <img
                  src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80'}
                  alt={currentTrack.title}
                  className={`w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md ${
                    isPlaying ? 'ring-2 ring-indigo-500/50 animate-pulse' : ''
                  }`}
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-zinc-100 font-medium text-sm truncate">
                  {currentTrack.title}
                </p>
                <p className="text-zinc-400 text-xs truncate">
                  {currentTrack.artist}
                </p>
              </div>
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors ml-1"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-500 hover:text-white'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="text-zinc-500 text-xs flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-600">
                ♫
              </div>
              <div>
                <p className="text-zinc-400 font-medium">Ready to play</p>
                <p className="text-zinc-600 text-[11px]">Select a song or import music</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                isShuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previousTrack}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-lg transition-colors ${
                repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Time Display */}
          <div className="text-[11px] text-zinc-500 font-mono tracking-wider">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Tools (Volume, EQ, Queue) */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          {onToggleEqualizer && (
            <button
              onClick={onToggleEqualizer}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Equalizer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {onToggleQueue && (
            <button
              onClick={onToggleQueue}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Current Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div
              className="w-20 h-1.5 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group"
              onClick={handleVolume}
            >
              <div
                className="h-full bg-zinc-300 group-hover:bg-indigo-400 rounded-full transition-all"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
