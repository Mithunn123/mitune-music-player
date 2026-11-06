import React, { useState, useEffect } from 'react';
import { 
  Search as SearchIcon, 
  Sparkles, 
  FolderPlus, 
  Music2, 
  Flame, 
  Radio, 
  Layers,
  Sliders,
  Maximize2
} from 'lucide-react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { AudioTimeline } from './components/AudioTimeline';
import { ImportModal } from './components/ImportModal';
import { EqualizerModal } from './components/EqualizerModal';
import { QueueDrawer } from './components/QueueDrawer';
import { DiscoverView } from './components/DiscoverView';
import { RecommendationsDashboard } from './components/RecommendationsDashboard';
import { SettingsView } from './components/SettingsView';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AmbientMode } from './components/AmbientMode';
import { LyricsDrawer } from './components/LyricsDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AudioProvider, useAudio } from './context/AudioContext';
import { storageService } from './services/storageService';
import { Track, Playlist } from './types/music';

// Initial starter collection
const DEMO_TRACKS: Track[] = [
  {
    id: 'yt-fHI8X4OXluQ',
    youtubeId: 'fHI8X4OXluQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    albumArt: 'https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg',
    source: 'youtube',
    genre: 'Synthwave',
    mood: 'Energetic',
  },
  {
    id: 'yt-yKNxeF4KMsY',
    youtubeId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    duration: 269,
    albumArt: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    source: 'youtube',
    genre: 'Rock',
    mood: 'Chill',
  },
  {
    id: 'yt-V9PVRfjEBTI',
    youtubeId: 'V9PVRfjEBTI',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    duration: 231,
    albumArt: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    source: 'youtube',
    genre: 'Pop',
    mood: 'Focus',
  },
];

const MainApp: React.FC = () => {
  // Navigation State - Search is on top
  const [currentTab, setCurrentTab] = useState<NavTab>('discover');
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals & Panels
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAmbientModeOpen, setIsAmbientModeOpen] = useState(false);

  const { playTrack, favorites, history } = useAudio();

  // Load playlists from IndexedDB
  useEffect(() => {
    storageService.getAllPlaylists().then((saved) => {
      setPlaylists(saved);
    });
  }, []);

  const handleImportTracks = async (newTracks: Track[], playlistName?: string) => {
    setTracks((prev) => [...newTracks, ...prev]);

    if (playlistName) {
      const newPlaylist: Playlist = {
        id: `pl-${Date.now()}`,
        name: playlistName,
        type: 'custom',
        trackCount: newTracks.length,
        tracks: newTracks,
        createdAt: Date.now(),
        coverArt: newTracks[0]?.albumArt,
      };

      await storageService.savePlaylist(newPlaylist);
      setPlaylists((prev) => [newPlaylist, ...prev]);
      setActivePlaylist(newPlaylist);
    }
  };

  const handleCreatePlaylist = async (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      type: 'custom',
      trackCount: 0,
      tracks: [],
      createdAt: Date.now(),
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    };

    await storageService.savePlaylist(newPlaylist);
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setActivePlaylist(newPlaylist);
    setCurrentTab('playlists');
  };

  const handleSelectPlaylist = (pl: Playlist) => {
    setActivePlaylist(pl);
    setCurrentTab('playlists');
  };

  // Filter tracks based on current Tab & Search
  const getVisibleTracks = (): Track[] => {
    let result = tracks;

    if (currentTab === 'favorites') {
      result = tracks.filter((t) => favorites.includes(t.id));
    } else if (currentTab === 'playlists' && activePlaylist) {
      result = activePlaylist.tracks;
    } else if (currentTab === 'history') {
      const historyIds = new Set(history.map((h: any) => h.trackId));
      result = tracks.filter((t) => historyIds.has(t.id));
    }

    if (selectedGenre) {
      result = result.filter((t) => t.genre === selectedGenre);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.album && t.album.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const visibleTracks = getVisibleTracks();

  return (
    <div className="flex h-screen w-screen bg-[#0d0e12] text-neutral-100 overflow-hidden font-sans select-none">
      {/* Navigation Sidebar with Collapse/Expand */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'playlists') setActivePlaylist(null);
        }}
        playlists={playlists}
        activePlaylistId={activePlaylist?.id || null}
        onSelectPlaylist={handleSelectPlaylist}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenEqualizer={() => setIsEqOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onOpenAmbientMode={() => setIsAmbientModeOpen(true)}
      />

      {/* Main Studio Center */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0e12]">
        {/* Top Header Bar */}
        <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-[#0d0e12]/80 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search library, artists, titles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAmbientModeOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#121318] border border-white/10 text-neutral-300 hover:text-white hover:bg-[#181920] font-medium text-xs flex items-center gap-1.5 transition-all"
              title="Open Ambient Vinyl CD Mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
              <span>Ambient Mode</span>
            </button>

            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#121318] border border-white/10 text-neutral-300 hover:text-white hover:bg-[#181920] font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Playlist</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#121318] border border-white/10 text-neutral-300 hover:text-white hover:bg-[#181920] font-medium text-xs flex items-center gap-2 transition-all"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Import Audio</span>
            </button>
          </div>
        </header>

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {currentTab === 'discover' ? (
            <DiscoverView />
          ) : currentTab === 'feed' ? (
            <RecommendationsDashboard />
          ) : currentTab === 'settings' ? (
            <SettingsView />
          ) : (
            <div className="space-y-6">
              {/* Header Hero Banner */}
              <div className="rounded-2xl p-6 bg-[#121318] border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                      {currentTab === 'playlists' && activePlaylist
                        ? 'PLAYLIST'
                        : currentTab === 'favorites'
                        ? 'COLLECTION'
                        : currentTab === 'history'
                        ? 'ACTIVITY'
                        : 'STUDIO LIBRARY'}
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
                      {currentTab === 'playlists' && activePlaylist
                        ? activePlaylist.name
                        : currentTab === 'favorites'
                        ? 'Your Favorites'
                        : currentTab === 'history'
                        ? 'Recently Played'
                        : 'All Tracks'}
                    </h2>
                    <p className="text-neutral-400 text-xs mt-1">
                      {visibleTracks.length} track(s) · High Fidelity Offline & Stream Resolution
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (visibleTracks.length > 0) {
                          playTrack(visibleTracks[0], visibleTracks);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Play All</span>
                    </button>
                  </div>
                </div>

                {/* Genre filter tags */}
                {currentTab === 'library' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap">
                    {['Synthwave', 'Electronic', 'Lo-Fi', 'Ambient', 'Rock'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() =>
                          setSelectedGenre(selectedGenre === genre ? null : genre)
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedGenre === genre
                            ? 'bg-white text-black'
                            : 'bg-[#181920] border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tracks Section */}
              <TrackList
                tracks={visibleTracks}
                onTrackSelect={(track) => playTrack(track, visibleTracks)}
              />
            </div>
          )}
        </main>

        {/* Audio Timeline Player Footer */}
        <AudioTimeline
          onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
          onToggleEqualizer={() => setIsEqOpen(!isEqOpen)}
          onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
          isLyricsOpen={isLyricsOpen}
        />
      </div>

      {/* Floating Modals and Drawers */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportTracks={handleImportTracks}
      />

      <EqualizerModal
        isOpen={isEqOpen}
        onClose={() => setIsEqOpen(false)}
      />

      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      <LyricsDrawer
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
      />

      {/* Full Screen Ambient Vinyl Mode with isolated ErrorBoundary */}
      <ErrorBoundary>
        <AmbientMode
          isOpen={isAmbientModeOpen}
          onClose={() => setIsAmbientModeOpen(false)}
        />
      </ErrorBoundary>

      {/* Headless Global Full-Track YouTube Streaming Mount */}
      <div
        id="youtube-player-element"
        style={{
          position: 'fixed',
          bottom: -9999,
          left: -9999,
          width: 240,
          height: 240,
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AudioProvider>
        <MainApp />
      </AudioProvider>
    </ErrorBoundary>
  );
};
