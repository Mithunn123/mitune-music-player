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
import { AudioProvider, useAudio } from './context/AudioContext';
import { storageService } from './services/storageService';
import { Track, Playlist } from './types/music';

// Initial starter collection
const DEMO_TRACKS: Track[] = [
  {
    id: 'yt-fHI8X4OXluQ',
    youtubeId: 'fHI8X4OXluQ',
    title: 'The Weeknd - Blinding Lights (Official Audio)',
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
    title: 'Coldplay - Yellow (Official Video)',
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
    title: 'Billie Eilish - BIRDS OF A FEATHER (Official Video)',
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
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950">
        {/* Top Header Bar */}
        <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search library, artists, titles..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAmbientModeOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 font-medium text-xs flex items-center gap-1.5 transition-all shadow-md"
              title="Open Ambient Vinyl CD Mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Ambient Mode</span>
            </button>

            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Playlist</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 font-medium text-xs flex items-center gap-2 transition-all"
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
              <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/50 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                      {currentTab === 'playlists' && activePlaylist
                        ? 'PLAYLIST'
                        : currentTab === 'favorites'
                        ? 'COLLECTION'
                        : currentTab === 'history'
                        ? 'ACTIVITY'
                        : 'STUDIO LIBRARY'}
                    </span>
                    <h2 className="text-3xl font-black text-white mt-1 tracking-tight">
                      {currentTab === 'playlists' && activePlaylist
                        ? activePlaylist.name
                        : currentTab === 'favorites'
                        ? 'Your Favorites'
                        : currentTab === 'history'
                        ? 'Recently Played'
                        : 'All Tracks'}
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1">
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
                      className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
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
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedGenre === genre
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
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

      {/* Full Screen Ambient Vinyl Mode */}
      <AmbientMode
        isOpen={isAmbientModeOpen}
        onClose={() => setIsAmbientModeOpen(false)}
      />

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
    <AudioProvider>
      <MainApp />
    </AudioProvider>
  );
};
