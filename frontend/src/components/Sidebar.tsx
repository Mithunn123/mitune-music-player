import React from 'react';
import { 
  Library, 
  Compass, 
  Heart, 
  History, 
  ListMusic, 
  FolderPlus, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { Playlist } from '../types/music';

export type NavTab = 'library' | 'discover' | 'favorites' | 'history' | 'playlists';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  playlists: Playlist[];
  activePlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenImport: () => void;
  onOpenEqualizer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onOpenImport,
  onOpenEqualizer,
}) => {
  return (
    <aside className="w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg tracking-wider">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              mitune
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">Local & Cloud Player</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onSelectTab('library')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'library'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>My Library</span>
        </button>

        <button
          onClick={() => onSelectTab('discover')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'discover'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover Online</span>
        </button>

        <button
          onClick={() => onSelectTab('favorites')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'favorites'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Listening History</span>
        </button>
      </div>

      {/* Playlists section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 mt-2 border-t border-white/5 space-y-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Playlists
          </span>
          <button
            onClick={onOpenImport}
            className="p-1 hover:text-white text-zinc-400 hover:bg-white/5 rounded-md transition-colors"
            title="Import or Create Playlist"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {playlists.length === 0 ? (
          <div className="px-3 py-4 text-xs text-zinc-600 italic">
            No saved playlists yet. Click '+' to import Spotify/YT or JSON.
          </div>
        ) : (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left truncate transition-all ${
                activePlaylistId === playlist.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ListMusic className="w-4 h-4 shrink-0 text-zinc-500" />
              <span className="truncate">{playlist.name}</span>
              <span className="text-[10px] text-zinc-600 ml-auto shrink-0 font-mono">
                {playlist.tracks.length}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer Quick Controls */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={onOpenEqualizer}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Audio EQ & Effects</span>
        </button>

        <button
          onClick={onOpenImport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/25 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Import Music / URL</span>
        </button>
      </div>
    </aside>
  );
};
