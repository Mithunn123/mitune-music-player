import React, { useState, useEffect } from 'react';
import { Menu, Search, Grid, Settings, MoodChill, MoodEnergetic, MoodFocus, MoodNostalgic, MoodAtmospheric, MoodLateNight } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { AudioTimeline } from './components/AudioTimeline';
import './components/GlassCard.css';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  albumArt: string;
  isPlaying: boolean;
  isSelected: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const INITIAL_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    duration: 294,
    albumArt: '/placeholder-album-1.svg',
    isPlaying: false,
    isSelected: false,
  },
  {
    id: '2',
    title: 'Electric Feel',
    artist: 'MGMT',
    duration: 248,
    albumArt: '/placeholder-album-2.svg',
    isPlaying: false,
    isSelected: false,
  },
  {
    id: '3',
    title: 'Bloom',
    artist: 'Talk Talk',
    duration: 312,
    albumArt: '/placeholder-album-3.svg',
    isPlaying: false,
    isSelected: false,
  },
  {
    id: '4',
    title: 'Deep Blue',
    artist: 'Radiohead',
    duration: 345,
    albumArt: '/placeholder-album-4.svg',
    isPlaying: false,
    isSelected: false,
  },
];

export const App: React.FC = () => {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (playingTrack) {
      setIsPlaying(prev => !prev);
    } else {
      setPlayingTrack(INITIAL_TRACKS[0].id);
      setIsPlaying(true);
    }
  };

  const handlePlayTrack = (trackId: string) => {
    setPlayingTrack(trackId);
    setIsPlaying(true);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Bottom Audio Timeline */}
      <AudioTimeline
        isPlaying={isPlaying}
        onPlayToggle={togglePlay}
        onPrevious={() => console.log('Previous track')}
        onNext={() => console.log('Next track')}
        onVolumeChange={handleVolumeChange}
        volume={volume}
      />

      {/* Page content with glass background */}
      <div className="relative flex min-h-screen">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header with active playlist info */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-wider">My Library</h2>
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex items-center gap-4">
              <button className="glass-btn text-sm">+ Add Tracks</button>
              <button className="glass-btn text-sm">Import</button>
            </div>
          </header>

          {/* Playlist header with cover art */}
          <div className="glass-card p-6 mb-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                  Cinzel Display Font
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Recently Added Playlist</p>
              </div>
              <div className="w-24 h-24 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                <img
                  src="/cover-art.svg"
                  alt="Playlist cover"
                  className="w-16 h-16 rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-zinc-400 text-sm">12 tracks · 47:32</p>
            </div>
          </div>

          {/* Sorting & controls toolbar */}
          <div className="glass-card p-4 mb-4 rounded-2xl border border-white/10">
            <div className="flex gap-3 flex-wrap">
              <button className="glass-btn text-xs px-3 py-1.5">Shuffle</button>
              <button className="glass-btn text-xs px-3 py-1.5">Edit</button>
              <button className="glass-btn text-xs px-3 py-1.5">Custom</button>
              <button className="glass-btn text-xs px-3 py-1.5">Date Added</button>
              <button className="glass-btn text-xs px-3 py-1.5">Title</button>
            </div>
          </div>

          {/* Track List */}
          <TrackList
            tracks={tracks}
            onPlay={handlePlayTrack}
            onToggleSelect={() => console.log('toggle select')}
            onContextMenu={(e, id) => console.log('context menu', id)}
          />

          {/* Genre filters from Sidebar */}
          {/* Already included in Sidebar component */}
        </main>
      </div>
    </div>
  );
};