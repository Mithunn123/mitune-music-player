import React, { useEffect, useState, useRef } from 'react';
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

const FALLBACK_ART =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

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

  const [beatPhase, setBeatPhase] = useState(0);
  const [imgError, setImgError] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Audio beat visualizer pulse animation loop
  useEffect(() => {
    if (!isOpen) return;

    let startTime = performance.now();
    const animate = (time: number) => {
      if (isPlaying) {
        const elapsed = (time - startTime) / 1000;
        // ~120 BPM pulsing cycle
        setBeatPhase(elapsed * 2 * Math.PI * 2);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, isPlaying]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset image error when track changes
  useEffect(() => {
    setImgError(false);
  }, [currentTrack?.id]);

  if (!isOpen) return null;

  const isFav = currentTrack ? (favorites || []).includes(currentTrack.id) : false;
  const safeDuration = duration > 0 ? duration : 1;
  const progressPercent = Math.max(0, Math.min(100, (currentTime / safeDuration) * 100));

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const albumArt = !imgError && currentTrack?.albumArt ? currentTrack.albumArt : FALLBACK_ART;

  // Generate 48 circular audio visualizer bars around the CD
  const BAR_COUNT = 48;
  const visualizerBars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const angle = (i / BAR_COUNT) * 360;
    // Harmonically modulated heights to simulate authentic audio equalizer
    const wave1 = Math.sin(beatPhase + i * 0.4);
    const wave2 = Math.cos(beatPhase * 0.7 + i * 0.8);
    const height = isPlaying ? Math.max(6, Math.min(32, 14 + wave1 * 9 + wave2 * 7)) : 4;
    const opacity = isPlaying ? 0.7 + (wave1 + 1) * 0.15 : 0.25;

    return { angle, height, opacity };
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#070709] flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Ambient Background: Vibrant Glow Mesh + Radial Vignette (100% crash-free, zero heavy CSS blur filters) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft background art texture */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 scale-105 transition-all duration-1000"
          style={{ backgroundImage: `url("${albumArt}")` }}
        />

        {/* Ambient atmospheric radial glow cones */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full transition-all duration-1000 ${
            isPlaying ? 'opacity-40 scale-110' : 'opacity-15 scale-95'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.3) 40%, rgba(236, 72, 153, 0.15) 70%, transparent 100%)',
          }}
        />

        {/* Deep dark vignette border so edges blend seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/90 via-transparent to-[#070709]/90" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
            M
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-white uppercase">
              Ambient Mode
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              Hi-Fi Studio Disc
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
          title="Exit Ambient Mode (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Stage: Spinning CD with Synchronized Audio Visualizer Beat Ring */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center">
          {/* Synchronized Circular Audio Beat Equalizer (Surrounds the CD) */}
          <div className="absolute w-[330px] h-[330px] sm:w-[440px] sm:h-[440px] flex items-center justify-center pointer-events-none">
            {visualizerBars.map((bar, idx) => (
              <div
                key={idx}
                className="absolute w-1 rounded-full transition-all duration-75"
                style={{
                  height: `${bar.height}px`,
                  opacity: bar.opacity,
                  background: 'linear-gradient(to top, #818cf8, #c084fc, #f472b6)',
                  transform: `rotate(${bar.angle}deg) translateY(-${150 + (bar.height / 2)}px)`,
                  boxShadow: isPlaying ? '0 0 8px rgba(168, 85, 247, 0.6)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Vinyl / CD Outer Disc Body */}
          <div
            className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#111114] border-[4px] border-zinc-700/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden transition-transform duration-700 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '12s' }}
          >
            {/* Concentric Vinyl Grooves */}
            <div className="absolute inset-3 rounded-full border border-white/[0.04] pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/[0.05] pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-white/[0.04] pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-white/[0.05] pointer-events-none" />

            {/* Specular Iridescent Reflection Sheen */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background:
                  'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.15) 60deg, transparent 120deg, transparent 180deg, rgba(255,255,255,0.15) 240deg, transparent 300deg)',
              }}
            />

            {/* Center Album Art Label */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[3px] border-zinc-900 shadow-2xl relative bg-zinc-900 flex items-center justify-center">
              <img
                src={albumArt}
                alt={currentTrack?.title || 'Album Art'}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />

              {/* Center Spindle Hole */}
              <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-[#070709] border-[3px] border-white/60 shadow-inner flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Track Details */}
        <div className="mt-9 text-center max-w-lg px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate tracking-tight">
            {currentTrack?.title || 'No Track Selected'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1 truncate font-medium">
            {currentTrack?.artist || 'Select a song to start'}
          </p>
          {currentTrack?.album && (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-400">
              {currentTrack.album}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Minimalist Controls Bar */}
      <div className="relative z-10 px-6 sm:px-8 pb-10 max-w-xl mx-auto w-full space-y-4">
        {/* Seekbar */}
        <div
          className="w-full h-3 cursor-pointer relative flex items-center group"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seek(ratio * duration);
          }}
        >
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full transition-colors ${
                isShuffle ? 'text-white bg-white/20' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={previousTrack}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-white/10 flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black" />
              ) : (
                <Play className="w-7 h-7 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-95"
              title="Next"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleRepeat}
              className={`p-2.5 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-white bg-white/20' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-2.5 rounded-full text-zinc-400 hover:text-white transition-colors"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
