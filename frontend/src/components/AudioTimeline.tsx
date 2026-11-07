import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Mic2, 
  Laptop, 
  SlidersHorizontal,
  Check,
  BookmarkPlus,
  Maximize2
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types/music';

interface AudioTimelineProps {
  onToggleQueue?: () => void;
  onToggleEqualizer?: () => void;
  onToggleLyrics?: () => void;
  isLyricsOpen?: boolean;
  onOpenAddToPlaylist?: (track: Track) => void;
  onToggleAmbient?: () => void;
}

const OUTPUT_DEVICES = [
  { id: 'system', name: 'This Computer (Default Output)', desc: 'High-Definition Audio Engine' },
  { id: 'dac', name: 'Hi-Fi Master Stream', desc: 'Direct 32-bit / 48kHz Output' },
  { id: 'headphones', name: 'Headphones / External DAC', desc: 'Stereo 3.5mm / USB' },
];

export const AudioTimeline: React.FC<AudioTimelineProps> = ({
  onToggleQueue,
  onToggleEqualizer,
  onToggleLyrics,
  isLyricsOpen,
  onOpenAddToPlaylist,
  onToggleAmbient,
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
    togglePlay,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
  } = useAudio();

  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('system');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState<number | null>(null);

  const deviceMenuRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Close device menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target as Node)) {
        setIsDeviceMenuOpen(false);
      }
    };
    if (isDeviceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDeviceMenuOpen]);

  const isFavorite = currentTrack ? (favorites || []).includes(currentTrack.id) : false;
  const safeDuration = duration > 0 ? duration : 1;
  const currentRatio = Math.max(0, Math.min(1, currentTime / safeDuration));
  const activePercent = isScrubbing && scrubPercent !== null ? scrubPercent : currentRatio * 100;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const handleVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
  };

  const albumArt = currentTrack?.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80';

  return (
    <footer className="h-24 bg-[#121318]/95 backdrop-blur-md border-t border-white/10 px-6 select-none shrink-0 z-40 relative">
      <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        
        {/* ========================================================
            1. LEFT COLUMN: 48-56px art, single-line title, artist, heart
           ======================================================== */}
        <div className="w-[30%] min-w-[200px] max-w-sm flex items-center gap-3">
          {currentTrack ? (
            <>
              {/* 52px Album Art with subtle 1px border */}
              <img
                src={albumArt}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80';
                }}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg object-cover bg-[#181920] border border-white/10 shrink-0 shadow-sm"
              />

              {/* Single-line track title & artist */}
              <div className="min-w-0 flex-1 overflow-hidden pr-2">
                <p className="font-medium text-sm truncate text-white leading-tight">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-neutral-400 truncate mt-1">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Favorite Action with micro-interaction */}
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack)}
                className="p-1.5 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Add to Playlist Action */}
              {onOpenAddToPlaylist && (
                <button
                  onClick={() => currentTrack && onOpenAddToPlaylist(currentTrack)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                  title="Add to Playlist"
                >
                  <BookmarkPlus className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-[#181920] border border-white/10 flex items-center justify-center text-neutral-500 text-xs">
                Mitune
              </div>
              <div>
                <p className="font-medium text-sm text-neutral-300">Ready to Play</p>
                <p className="text-xs text-neutral-500 mt-0.5">Select any song to start</p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            2. CENTER COLUMN: Centered playback controls stacked above
               full-width scrubber bar flanked by monospace timestamps
           ======================================================== */}
        <div className="w-[40%] max-w-xl flex flex-col items-center justify-center gap-1.5">
          {/* Centered Controls: Shuffle, Previous, 38px Solid Play/Pause, Next, Repeat */}
          <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all relative ${
                isShuffle ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>

            {/* Previous */}
            <button
              onClick={previousTrack}
              className="p-1.5 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Previous (Cmd+Left)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Prominent 38px Solid Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-9.5 h-9.5 sm:w-10 sm:h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-md shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Next (Cmd+Right)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all relative ${
                repeatMode !== 'off' ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode !== 'off' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Full-Width Scrubber Bar Flanked by Monospace Timestamps using tabular-nums */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-neutral-400 select-none w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              ref={progressBarRef}
              className="flex-1 h-3 group cursor-pointer relative flex items-center"
              onClick={handleSeek}
            >
              {/* Scrubber Track */}
              <div className="w-full h-1 group-hover:h-1.5 transition-all bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${activePercent}%` }}
                />
              </div>

              {/* Scrubber Thumb Knob on hover */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${activePercent}% - 6px)` }}
              />
            </div>

            <span className="text-xs font-mono tabular-nums text-neutral-400 select-none w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ========================================================
            3. RIGHT COLUMN: System utilities (Queue, Lyrics, Output
               device selector, and fixed 80-100px volume slider)
           ======================================================== */}
        <div className="w-[30%] min-w-[200px] flex items-center justify-end gap-3 relative">
          
          {/* Lyrics Utility */}
          {onToggleLyrics && (
            <button
              onClick={onToggleLyrics}
              className={`p-2 rounded-lg hover:scale-105 active:scale-95 transition-all ${
                isLyricsOpen ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white'
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>
          )}

          {/* Queue Utility */}
          {onToggleQueue && (
            <button
              onClick={onToggleQueue}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Play Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          )}

          {/* Equalizer Utility */}
          {onToggleEqualizer && (
            <button
              onClick={onToggleEqualizer}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Audio Equalizer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Full Screen Ambient Mode Utility */}
          {onToggleAmbient && (
            <button
              onClick={onToggleAmbient}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:scale-105 active:scale-95 transition-all"
              title="Ambient Full Screen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {/* Output Device Selector */}
          <div className="relative" ref={deviceMenuRef}>
            <button
              onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
              className={`p-2 rounded-lg hover:scale-105 active:scale-95 transition-all ${
                isDeviceMenuOpen ? 'text-white bg-white/10' : 'text-neutral-400 hover:text-white'
              }`}
              title="Connect to a device"
            >
              <Laptop className="w-4 h-4" />
            </button>

            {/* Sleek Device Selector Popover */}
            {isDeviceMenuOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#181920] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-xs font-semibold text-white px-2 py-1 uppercase tracking-wider text-[10px] text-neutral-400">
                  Select Output Device
                </p>
                <div className="mt-1 space-y-1">
                  {OUTPUT_DEVICES.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => {
                        setSelectedDevice(dev.id);
                        setIsDeviceMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                        selectedDevice === dev.id
                          ? 'bg-white/10 text-white'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium">{dev.name}</p>
                        <p className="text-[10px] text-neutral-500">{dev.desc}</p>
                      </div>
                      {selectedDevice === dev.id && (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixed 80-100px Volume Slider (w-24 = 96px) */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-neutral-400 hover:text-white p-1 hover:scale-105 active:scale-95 transition-all"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fixed 80-100px volume bar (w-20 = 80px, sm:w-24 = 96px) */}
            <div
              className="w-20 sm:w-24 h-3 flex items-center cursor-pointer relative"
              onClick={handleVolume}
            >
              <div className="w-full h-1 group-hover:h-1.5 transition-all bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.round(volume * 100)}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
