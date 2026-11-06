import React, { useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart,
  Repeat,
  Shuffle
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface AmbientModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AmbientMode: React.FC<AmbientModeProps> = ({ isOpen, onClose }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
    favorites,
    toggleFavorite,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
  } = useAudio();

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const albumArt =
    currentTrack?.albumArt ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Ambient blurred background using img element (zero CSS filter crash) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={albumArt}
          alt=""
          className="w-full h-full object-cover scale-150 opacity-25 filter blur-3xl transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-[#09090b]/80" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-xs">
            M
          </div>
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Ambient Vinyl Mode
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Stage: Spinning Vinyl CD with Ambient Glow */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Ambient Pulsing Glow behind CD */}
          <div
            className={`absolute -inset-10 rounded-full bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-pink-500/20 blur-2xl transition-all duration-700 pointer-events-none ${
              isPlaying ? 'scale-110 opacity-90' : 'scale-95 opacity-20'
            }`}
          />

          {/* Vinyl Disc Body with Real Spin Animation */}
          <div
            className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-black border-[5px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.95)] flex items-center justify-center relative overflow-hidden ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '10s' }}
          >
            {/* Vinyl Record Grooves */}
            <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-24 rounded-full border border-white/5 pointer-events-none" />

            {/* Vinyl Light Reflection Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

            {/* Inner Center Album Art Disc */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-zinc-950 shadow-2xl relative">
              <img
                src={albumArt}
                alt={currentTrack?.title || 'Album Art'}
                className="w-full h-full object-cover"
              />
              {/* Spindle hole */}
              <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-black border-2 border-white/40 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="mt-8 text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-white truncate">
            {currentTrack?.title || 'No track selected'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1 truncate">
            {currentTrack?.artist || 'Ready to play'}
          </p>
        </div>
      </div>

      {/* Bottom Timeline & Controls */}
      <div className="relative z-10 px-8 pb-10 max-w-xl mx-auto w-full space-y-4">
        {/* Seekbar */}
        <div
          className="w-full h-2 cursor-pointer relative flex items-center"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seek(ratio * duration);
          }}
        >
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-colors ${isShuffle ? 'text-white bg-white/20' : 'text-zinc-400 hover:text-white'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={previousTrack}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-xl"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black" />
              ) : (
                <Play className="w-7 h-7 fill-black translate-x-0.5" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRepeat}
              className={`p-2.5 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-white bg-white/20' : 'text-zinc-400 hover:text-white'}`}
            >
              <Repeat className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-2.5 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
