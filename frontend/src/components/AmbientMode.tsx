import React, { useEffect, useRef } from 'react';
import { 
  Minimize2, 
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
    visualizerData,
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keyboard shortcut: ESC to exit full screen ambient mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Audio Reactive Circular Beat Visualizer around the spinning CD
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = width * 0.22; // Just outside the vinyl record disc

      ctx.clearRect(0, 0, width, height);

      const numBars = 64;
      const step = (Math.PI * 2) / numBars;

      // Extract frequency data or fallback wave
      let data = visualizerData;
      if (!data || data.length === 0) {
        data = new Uint8Array(numBars);
        for (let i = 0; i < numBars; i++) {
          data[i] = isPlaying ? Math.floor(Math.sin(Date.now() / 200 + i) * 50 + 100) : 20;
        }
      }

      for (let i = 0; i < numBars; i++) {
        const angle = i * step;
        const val = data[i % data.length] || 30;
        const barHeight = isPlaying ? Math.max(8, (val / 255) * (width * 0.12)) : 6;

        // Inner and outer points of the radiant beat beam
        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

        // Radiant glow gradient
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'rgba(129, 140, 248, 0.8)'); // Indigo
        grad.addColorStop(0.5, 'rgba(192, 132, 252, 0.9)'); // Purple
        grad.addColorStop(1, 'rgba(244, 114, 182, 0.6)'); // Pink

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, visualizerData, isPlaying]);

  if (!isOpen) return null;

  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const albumArt =
    currentTrack?.albumArt ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden animate-in fade-in duration-500 select-none">
      {/* 1. Immersive Dynamic Album Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-125 filter blur-3xl opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${albumArt})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />

      {/* Top Header bar */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
            M
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase">
              Ambient Vinyl Mode
            </span>
            <p className="text-xs text-zinc-400">Press ESC or click exit to return</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md border border-white/15 transition-all flex items-center gap-2"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Ambient Mode</span>
        </button>
      </div>

      {/* Center Stage: Spinning Vinyl CD with Circular Beat Sync Visualizer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
          {/* Circular Audio Reactive Canvas */}
          <canvas
            ref={canvasRef}
            width={520}
            height={520}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Vinyl Record Disc Shell with Grooves */}
          <div
            className={`w-[290px] h-[290px] sm:w-[370px] sm:h-[370px] rounded-full bg-zinc-950 border-[6px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden ${
              isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
            }`}
          >
            {/* Vinyl grooves gloss */}
            <div className="absolute inset-0 rounded-full border border-white/5 opacity-50 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/5 opacity-40 pointer-events-none" />
            <div className="absolute inset-16 rounded-full border border-white/5 opacity-30 pointer-events-none" />
            <div className="absolute inset-24 rounded-full border border-white/5 opacity-20 pointer-events-none" />

            {/* Inner Center Album Label Artwork */}
            <div className="w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] rounded-full overflow-hidden shadow-2xl relative border-4 border-zinc-900">
              <img
                src={albumArt}
                alt={currentTrack?.title || 'Album Art'}
                className="w-full h-full object-cover"
              />
              {/* Spindle hole */}
              <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-zinc-950 border-2 border-white/30 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="mt-8 text-center max-w-xl px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md truncate">
            {currentTrack?.title || 'No Track Selected'}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium mt-1 truncate">
            {currentTrack?.artist || 'Select a song to start'}
          </p>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 px-8 pb-8 pt-4 max-w-3xl mx-auto w-full space-y-4">
        {/* Progress Bar */}
        <div
          className="w-full h-2 group cursor-pointer relative flex items-center"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seek(ratio * duration);
          }}
        >
          <div className="w-full h-1 group-hover:h-2 transition-all bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-white'
                }`}
              />
            </button>
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-colors ${
                isShuffle ? 'text-indigo-400 bg-indigo-500/20' : 'text-zinc-400 hover:text-white'
              }`}
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
              className="p-4 rounded-full bg-white text-zinc-950 hover:scale-105 active:scale-95 shadow-2xl transition-all flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-zinc-950" />
              ) : (
                <Play className="w-7 h-7 fill-zinc-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleRepeat}
              className={`p-2.5 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/20' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
