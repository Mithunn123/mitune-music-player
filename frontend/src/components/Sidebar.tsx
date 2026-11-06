import React from 'react';
import { 
  Search as SearchIcon,
  Sparkles, 
  Heart, 
  History, 
  Library, 
  Settings as SettingsIcon,
  ListMusic, 
  FolderPlus, 
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Playlist } from '../types/music';

export type NavTab = 'discover' | 'feed' | 'favorites' | 'history' | 'library' | 'settings' | 'playlists';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  playlists: Playlist[];
  activePlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenImport: () => void;
  onOpenEqualizer: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreatePlaylist: () => void;
  onOpenAmbientMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onOpenEqualizer,
  isCollapsed,
  onToggleCollapse,
  onOpenCreatePlaylist,
  onOpenAmbientMode,
}) => {
  return (
    <aside
      className={`bg-[#121318] border-r border-white/10 flex flex-col h-full select-none shrink-0 transition-all duration-300 relative z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Collapse Toggle */}
      <div className={`p-4 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                mitune
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                  PRO
                </span>
              </h1>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
            M
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors ${
            isCollapsed ? 'mt-2' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation - Strict 8pt Grid Order:
          1. Search ON TOP
          2. Recommended For You
          3. Favorites
          4. Listening History
          5. Settings
          6. My Library
      */}
      <div className="p-3 space-y-1">
        {/* 1. SEARCH ON TOP */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'discover'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Search"
        >
          <SearchIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Search</span>}
        </button>

        {/* 2. RECOMMENDED */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'feed'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Recommended For You"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Recommended</span>}
        </button>

        {/* 3. FAVORITES */}
        <button
          onClick={() => onSelectTab('favorites')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'favorites'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Favorites"
        >
          <Heart className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Favorites</span>}
        </button>

        {/* 4. HISTORY */}
        <button
          onClick={() => onSelectTab('history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="History"
        >
          <History className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>History</span>}
        </button>

        {/* 5. SETTINGS */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* 6. MY LIBRARY AT THE BOTTOM */}
        <button
          onClick={() => onSelectTab('library')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            currentTab === 'library'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="My Library"
        >
          <Library className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>My Library</span>}
        </button>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 overflow-y-auto p-3 border-t border-white/10 space-y-1">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Playlists
            </span>
            <button
              onClick={onOpenCreatePlaylist}
              className="p-1 hover:text-white text-neutral-400 hover:bg-white/10 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Create New Playlist"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New</span>
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center mb-2">
            <button
              onClick={onOpenCreatePlaylist}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
              title="Create Playlist"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        )}

        {playlists.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-4 text-xs text-neutral-500 text-center border border-dashed border-white/10 rounded-xl">
              <p>No playlists yet</p>
              <button
                onClick={onOpenCreatePlaylist}
                className="mt-1.5 text-neutral-300 hover:underline text-xs"
              >
                + Create Playlist
              </button>
            </div>
          )
        ) : (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left truncate transition-all ${
                activePlaylistId === playlist.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={playlist.name}
            >
              <ListMusic className="w-4 h-4 shrink-0 text-neutral-400" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{playlist.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {playlist.tracks.length}
                  </span>
                </>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer Controls: Ambient Mode Button, Equalizer */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <button
          onClick={onOpenAmbientMode}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-[#181920] border border-white/10 text-neutral-200 hover:text-white hover:bg-white/10 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Ambient Full-Screen Mode"
        >
          <Maximize2 className="w-4 h-4 text-neutral-300 shrink-0" />
          {!isCollapsed && <span>Ambient CD Mode</span>}
        </button>

        <button
          onClick={onOpenEqualizer}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Audio Equalizer"
        >
          <Sliders className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          {!isCollapsed && <span>Audio EQ</span>}
        </button>
      </div>
    </aside>
  );
};
