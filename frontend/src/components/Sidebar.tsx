import React, { useState } from 'react';
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
  onOpenImport,
  onOpenEqualizer,
  isCollapsed,
  onToggleCollapse,
  onOpenCreatePlaylist,
  onOpenAmbientMode,
}) => {
  return (
    <aside
      className={`bg-zinc-950/85 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full select-none shrink-0 transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Collapse Toggle */}
      <div className={`p-4 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
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
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            M
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors ${
            isCollapsed ? 'mt-3' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation - Ordered strictly as requested:
          1. Search (formerly Discover Online) ON TOP
          2. Recommended For You (AI feed)
          3. Favorites
          4. Listening History
          5. Settings
          6. My Library (at the bottom of navigation items)
      */}
      <div className="px-3 py-3 space-y-1">
        {/* 1. SEARCH ON TOP */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'discover'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Search"
        >
          <SearchIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Search</span>}
        </button>

        {/* 2. RECOMMENDED FEED */}
        <button
          onClick={() => onSelectTab('feed')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'feed'
              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Recommended For You"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          {!isCollapsed && <span>Recommended</span>}
        </button>

        {/* 3. FAVORITES */}
        <button
          onClick={() => onSelectTab('favorites')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'favorites'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Favorites"
        >
          <Heart className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Favorites</span>}
        </button>

        {/* 4. HISTORY */}
        <button
          onClick={() => onSelectTab('history')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'history'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="History"
        >
          <History className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>History</span>}
        </button>

        {/* 5. SETTINGS */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* 6. MY LIBRARY AT THE BOTTOM */}
        <button
          onClick={() => onSelectTab('library')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'library'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="My Library"
        >
          <Library className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>My Library</span>}
        </button>
      </div>

      {/* Playlists Section with Create Playlist Place */}
      <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-white/5 space-y-1">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Playlists
            </span>
            <button
              onClick={onOpenCreatePlaylist}
              className="p-1 hover:text-white text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium"
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
              className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded-xl"
              title="Create Playlist"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>
        )}

        {playlists.length === 0 ? (
          !isCollapsed && (
            <div className="px-3 py-4 text-xs text-zinc-600 text-center border border-dashed border-white/5 rounded-xl">
              <p>No playlists created yet.</p>
              <button
                onClick={onOpenCreatePlaylist}
                className="mt-2 text-indigo-400 hover:underline text-xs"
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left truncate transition-all ${
                activePlaylistId === playlist.id
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={playlist.name}
            >
              <ListMusic className="w-4 h-4 shrink-0 text-zinc-500" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{playlist.name}</span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {playlist.tracks.length}
                  </span>
                </>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer Controls: Ambient Mode Button, Equalizer, Import */}
      <div className="p-3 border-t border-white/5 space-y-1.5">
        {/* AMBIENT MODE BUTTON */}
        <button
          onClick={onOpenAmbientMode}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/40 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Ambient Mode (Full Screen Vinyl CD)"
        >
          <Maximize2 className="w-4 h-4 text-purple-400 shrink-0" />
          {!isCollapsed && <span>Ambient CD Mode</span>}
        </button>

        <button
          onClick={onOpenEqualizer}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Equalizer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {!isCollapsed && <span>Audio EQ & Effects</span>}
        </button>
      </div>
    </aside>
  );
};
