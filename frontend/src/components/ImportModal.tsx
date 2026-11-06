import React, { useState } from 'react';
import { X, Upload, Link2, FileJson, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { ingestionService } from '../services/ingestionService';
import { Track, Playlist } from '../types/music';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTracks: (tracks: Track[], playlistName?: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportTracks,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'url' | 'json'>('files');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const parsedTracks: Track[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)) {
          const track = await ingestionService.parseLocalFile(file);
          parsedTracks.push(track);
        }
      }

      if (parsedTracks.length > 0) {
        onImportTracks(parsedTracks, `Imported Audio (${parsedTracks.length})`);
        setStatusMessage({ type: 'success', text: `Successfully loaded ${parsedTracks.length} local audio track(s)!` });
        setTimeout(() => onClose(), 1200);
      } else {
        setStatusMessage({ type: 'error', text: 'No supported audio files found.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to parse audio files.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const { name, tracks } = await ingestionService.parseJsonExport(file);
      if (tracks.length > 0) {
        onImportTracks(tracks, name || 'JSON Playlist');
        setStatusMessage({ type: 'success', text: `Loaded playlist "${name}" with ${tracks.length} tracks!` });
        setTimeout(() => onClose(), 1200);
      } else {
        setStatusMessage({ type: 'error', text: 'No tracks found in JSON file.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Invalid JSON playlist file format.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const parsed = ingestionService.parseMusicUrl(urlInput);
      if (parsed.type === 'unknown') {
        setStatusMessage({
          type: 'error',
          text: 'Unsupported URL format. Paste a valid Spotify or YouTube Music link.',
        });
        setIsLoading(false);
        return;
      }

      // Demo track resolution for the link
      const resolvedTrack: Track = {
        id: parsed.id || `url-${Date.now()}`,
        title: `${parsed.type === 'spotify' ? 'Spotify' : 'YT Music'} Stream`,
        artist: 'Resolved Artist',
        album: 'Online Stream',
        duration: 210,
        albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
        source: 'piped',
        addedAt: Date.now(),
      };

      onImportTracks([resolvedTrack], `${parsed.type.toUpperCase()} Track`);
      setStatusMessage({ type: 'success', text: 'Track successfully linked and added!' });
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to process music link.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Import Music & Playlists</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === 'files' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Local Files</span>
            {activeTab === 'files' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === 'url' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>URL Link</span>
            {activeTab === 'url' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === 'json' ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>JSON Backup</span>
            {activeTab === 'json' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'files' && (
            <div className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl p-8 text-center transition-colors group cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-zinc-200 font-medium text-sm">
                Drop MP3, WAV, FLAC, or OGG files here
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Files are decoded locally on your machine with instant playback.
              </p>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Paste Stream / Playlist Link
                </label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/playlist/... or YouTube Music link"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Resolving...' : 'Import Stream'}
              </button>
            </form>
          )}

          {activeTab === 'json' && (
            <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-8 text-center transition-colors group cursor-pointer relative">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleJsonUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileJson className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-zinc-200 font-medium text-sm">
                Drop Spotify or YT Music Export JSON
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Reads exported metadata offline and prepares local playlist queue.
              </p>
            </div>
          )}

          {/* Feedback messages */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
