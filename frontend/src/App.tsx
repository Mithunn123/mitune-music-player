import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  FolderPlus, 
  Music2, 
  Flame, 
  Radio, 
  Layers 
} from 'lucide-react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { AudioTimeline } from './components/AudioTimeline';
import { ImportModal } from './components/ImportModal';
import { EqualizerModal } from './components/EqualizerModal';
import { QueueDrawer } from './components/QueueDrawer';
import { DiscoverView } from './components/DiscoverView';
import { AudioProvider, useAudio } from './context/AudioContext';
import { storageService } from './services/storageService';
import { Track, Playlist } from './types/music';

// Initial starter collection
const DEMO_TRACKS: Track[] = [
  {
    id: 'demo-1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 243,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    source: 'demo',
    streamUrl: 'https://cdn.freesound.org/previews/612/612089_5674468-lq.mp3',
    genre: 'Synthwave',
    mood: 'Chill',
  },
  {
    id: 'demo-2',
    title: 'Neon Skyline Dreams',
    artist: 'Antigravity Studio',
    album: 'Cyber Echoes',
    duration: 185,
    albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    source: 'demo',
    streamUrl: 'https://cdn.freesound.org/previews/655/655317_11861866-lq.mp3',
    genre: 'Electronic',
    mood: 'Energetic',
  },
  {
    id: 'demo-3',
    title: 'Atmospheric Lo-Fi Rain',
    artist: 'Lofi Cafe',
    album: 'Study Sessions Vol. 1',
    duration: 215,
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
    source: 'demo',
    streamUrl: 'https://cdn.freesound.org/previews/530/530415_1648170-lq.mp3',
    genre: 'Lo-Fi',
    mood: 'Focus',
  },
];

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('library');
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Modals & Panels
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEqOpen, setIsEqOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

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
      // Return history tracks
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
      {/* Navigation Sidebar */}
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
      />

      {/* Main Studio Center */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950">
        {/* Top Header Bar */}
        <header className="h-16 px-8 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
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
              onClick={() => setIsImportOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 font-medium text-xs flex items-center gap-2 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Import Audio</span>
            </button>
          </div>
        </header>

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {currentTab === 'discover' ? (
            <DiscoverView />
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
