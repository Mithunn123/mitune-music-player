import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  ListMusic, 
  Lock, 
  Globe 
} from 'lucide-react';
import { Track, Playlist } from '../types/music';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onToggleTrackInPlaylist: (playlistId: string, track: Track) => Promise<boolean>; // returns true if added, false if removed
  onCreatePlaylistWithTrack: (name: string, isPrivate: boolean, track: Track) => Promise<Playlist>;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  isOpen,
  onClose,
  track,
  playlists,
  onToggleTrackInPlaylist,
  onCreatePlaylistWithTrack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreatingNew) {
          setIsCreatingNew(false);
        } else {
          onClose();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isCreatingNew, onClose]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setIsCreatingNew(false);
      setNewPlaylistName('');
      setIsPrivate(false);
      setToastMessage(null);
    }
  }, [isOpen]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  if (!isOpen || !track) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newPlaylistName.trim();
    if (!cleanName) return;

    const created = await onCreatePlaylistWithTrack(cleanName, isPrivate, track);
    setToastMessage(`Created & added to "${created.name}"`);
    setIsCreatingNew(false);
    setNewPlaylistName('');
  };

  const handlePlaylistClick = async (playlist: Playlist) => {
    const wasAdded = await onToggleTrackInPlaylist(playlist.id, track);
    if (wasAdded) {
      setToastMessage(`Added to "${playlist.name}"`);
    } else {
      setToastMessage(`Removed from "${playlist.name}"`);
    }
  };

  const filteredPlaylists = playlists.filter((pl) =>
    pl.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#121318] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-white text-black font-semibold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="font-semibold text-white text-sm tracking-tight">Add to Playlist</h3>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {track.title} &bull; <span className="text-neutral-500">{track.artist}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search / Filter Input */}
        <div className="p-4 pb-2 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181920] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Action 1: Create New Playlist Section */}
        <div className="p-4 border-b border-white/10 bg-[#14151c]">
          {!isCreatingNew ? (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/15 hover:border-white/30 hover:bg-white/[0.04] text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-3 animate-in fade-in duration-150">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  {isPrivate ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Public</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewPlaylistName('');
                    }}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim()}
                    className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-40"
                  >
                    Create & Add
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Action 2: Scrollable List of Existing Playlists */}
        <div className="max-h-64 overflow-y-auto p-3 space-y-1">
          {filteredPlaylists.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{searchQuery ? 'No matching playlists found' : 'No playlists yet'}</p>
            </div>
          ) : (
            filteredPlaylists.map((playlist) => {
              const isIncluded = playlist.tracks.some((t) => t.id === track.id);

              return (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistClick(playlist)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                    isIncluded
                      ? 'bg-white/10 text-white'
                      : 'hover:bg-white/[0.04] text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Cover Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#181920] border border-white/10 shrink-0 flex items-center justify-center">
                      {playlist.coverArt ? (
                        <img
                          src={playlist.coverArt}
                          alt={playlist.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ListMusic className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{playlist.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {playlist.tracks.length} song{playlist.tracks.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Checkmark Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isIncluded
                        ? 'bg-white border-white text-black'
                        : 'border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
};
