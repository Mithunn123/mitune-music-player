import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  Shuffle, 
  Disc, 
  Image as ImageIcon,
  BookmarkPlus
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types/music';

interface AmbientModeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddToPlaylist?: (track: Track) => void;
}

const FALLBACK_ART =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

const BAR_COUNT = 48;

export const AmbientMode: React.FC<AmbientModeProps> = ({ isOpen, onClose, onOpenAddToPlaylist }) => {
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

  const [displayMode, setDisplayMode] = useState<'cd' | 'artwork'>('artwork');
  const [imgError, setImgError] = useState(false);

  // Audio beat visualizer direct DOM ref container (avoids 60fps React state churn)
  const visualizerContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Pre-generate static angles for 48 bars
  const barAngles = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => (i / BAR_COUNT) * 360);
  }, []);

  // Decoupled, non-blocking 60fps RAF loop operating directly on DOM nodes
  useEffect(() => {
    if (!isOpen || displayMode !== 'cd') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const container = visualizerContainerRef.current;
    if (!container) return;
    const barElements = container.children;

    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const phase = elapsed * 2 * Math.PI * 2; // ~120 BPM cycle

      for (let i = 0; i < barElements.length; i++) {
        const el = barElements[i] as HTMLElement;
        if (!el) continue;

        if (isPlaying) {
          const wave1 = Math.sin(phase + i * 0.4);
          const wave2 = Math.cos(phase * 0.7 + i * 0.8);
          const height = Math.max(6, Math.min(28, 12 + wave1 * 8 + wave2 * 6));
          const opacity = 0.5 + (wave1 + 1) * 0.25;

          el.style.height = `${height}px`;
          el.style.opacity = `${opacity}`;
          el.style.transform = `rotate(${barAngles[i]}deg) translateY(-${145 + height / 2}px)`;
        } else {
          el.style.height = '4px';
          el.style.opacity = '0.2';
          el.style.transform = `rotate(${barAngles[i]}deg) translateY(-147px)`;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isOpen, isPlaying, displayMode, barAngles]);

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

  return (
    <div 
      className={`fixed inset-0 z-40 bg-[#0d0e12] flex flex-col justify-between overflow-hidden select-none transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Subtle Atmospheric Backdrop (Clean, 100% crash-free, zero neon gradients) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-105 transition-all duration-1000"
          style={{ backgroundImage: `url("${albumArt}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/80 to-[#0d0e12]/95" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
            M
          </div>
          <span className="text-xs font-medium tracking-wide text-neutral-400">
            mitune
          </span>
        </div>

        {/* View Toggle (1:1 Artwork vs Vinyl CD) and Close Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#181920] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setDisplayMode('artwork')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                displayMode === 'artwork'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Artwork View"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cover</span>
            </button>
            <button
              onClick={() => setDisplayMode('cd')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                displayMode === 'cd'
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Vinyl View"
            >
              <Disc className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vinyl</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">
        {displayMode === 'artwork' ? (
          /* ========================================================
             MODE A: 1:1 artwork (rounded-2xl with subtle 1px border),
             left-aligned metadata
             ======================================================== */
          <div className="w-full max-w-md flex flex-col items-center sm:items-start space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* 1:1 Artwork */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 aspect-square rounded-2xl overflow-hidden bg-[#181920] border border-white/10 shadow-2xl relative group">
              <img
                src={albumArt}
                alt={currentTrack?.title || 'Track Artwork'}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Left-Aligned Metadata */}
            <div className="w-full text-center sm:text-left">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 
                    className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate cursor-default"
                    title={currentTrack?.title}
                  >
                    {currentTrack?.title || 'No Track Playing'}
                  </h2>
                  <p 
                    className="text-xs text-neutral-400 mt-1 truncate"
                    title={currentTrack?.artist}
                  >
                    {currentTrack?.artist || 'Select a track to start playback'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => currentTrack && toggleFavorite(currentTrack)}
                    className="p-2 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                    title="Favorite"
                  >
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  {onOpenAddToPlaylist && (
                    <button
                      onClick={() => currentTrack && onOpenAddToPlaylist(currentTrack)}
                      className="p-2 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                      title="Add to Playlist"
                    >
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {currentTrack?.album && (
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-400 truncate max-w-full">
                    {currentTrack.album}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             MODE B: Realistic Vinyl CD with Synchronized Audio Beat Ring
             ======================================================== */
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative flex items-center justify-center">
              {/* Circular Audio Equalizer Beat Ring (Direct DOM Mutation Container) */}
              <div 
                ref={visualizerContainerRef}
                className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center pointer-events-none"
              >
                {barAngles.map((angle, idx) => (
                  <div
                    key={idx}
                    className="absolute w-1 rounded-full bg-white transition-opacity duration-75"
                    style={{
                      height: '4px',
                      opacity: 0.25,
                      transform: `rotate(${angle}deg) translateY(-147px)`,
                    }}
                  />
                ))}
              </div>

              {/* Vinyl / CD Outer Disc Body */}
              <div
                className={`w-64 h-64 sm:w-76 sm:h-76 rounded-full bg-[#121318] border-[3px] border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '12s' }}
              >
                {/* Concentric Grooves */}
                <div className="absolute inset-3 rounded-full border border-white/[0.04] pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-white/[0.05] pointer-events-none" />
                <div className="absolute inset-14 rounded-full border border-white/[0.04] pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/[0.05] pointer-events-none" />

                {/* Iridescent Specular Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background:
                      'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.2) 60deg, transparent 120deg, transparent 180deg, rgba(255,255,255,0.2) 240deg, transparent 300deg)',
                  }}
                />

                {/* Center Label */}
                <div className="w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-[2px] border-black shadow-2xl relative bg-[#181920] flex items-center justify-center">
                  <img
                    src={albumArt}
                    alt={currentTrack?.title || 'Album Art'}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                  {/* Spindle hole */}
                  <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-[#0d0e12] border-[2px] border-white/60 shadow-inner flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center max-w-lg px-4">
              <h2 
                className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate cursor-default"
                title={currentTrack?.title}
              >
                {currentTrack?.title || 'No Track Playing'}
              </h2>
              <p 
                className="text-xs text-neutral-400 mt-1 truncate"
                title={currentTrack?.artist}
              >
                {currentTrack?.artist || 'Select a track to start playback'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ergonomic Thumb-Zone Controls Bar */}
      <div className="relative z-10 px-6 sm:px-8 pb-10 max-w-xl mx-auto w-full space-y-4">
        {/* Full-width Scrubber Bar Flanked by Monospace Timestamps with tabular-nums */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums text-neutral-400 select-none w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            className="flex-1 h-3 cursor-pointer relative flex items-center group"
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seek(ratio * duration);
            }}
          >
            <div className="w-full h-1 group-hover:h-1.5 transition-all bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-mono tabular-nums text-neutral-400 select-none w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>

        {/* Ergonomic Controls: Shuffle, Previous, 44px Solid Play/Pause, Next, Repeat, Volume */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all ${
                isShuffle ? 'text-white bg-white/15' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentTrack && toggleFavorite(currentTrack)}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            {onOpenAddToPlaylist && (
              <button
                onClick={() => currentTrack && onOpenAddToPlaylist(currentTrack)}
                className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
                title="Add to Playlist"
              >
                <BookmarkPlus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={previousTrack}
              className="p-2.5 rounded-full text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 sm:p-4 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shadow-xl flex items-center justify-center shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2.5 rounded-full text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-all"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRepeat}
              className={`p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all ${
                repeatMode !== 'off' ? 'text-white bg-white/15' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
