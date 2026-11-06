import React, { useState } from 'react';
import { Search, Loader2, Play, Plus, Compass } from 'lucide-react';
import { resolverService, PipedSearchResult } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PipedSearchResult[]>([]);
  const { playTrack, addToQueue } = useAudio();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const items = await resolverService.searchMusic(query);
      setResults(items);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayOnline = (result: PipedSearchResult) => {
    const track: Track = {
      id: result.id,
      title: result.title,
      artist: result.uploaderName,
      duration: result.duration,
      albumArt: result.thumbnail,
      source: 'piped',
      addedAt: Date.now(),
    };
    playTrack(track);
  };

  const handleAddToQueue = (result: PipedSearchResult) => {
    const track: Track = {
      id: result.id,
      title: result.title,
      artist: result.uploaderName,
      duration: result.duration,
      albumArt: result.thumbnail,
      source: 'piped',
      addedAt: Date.now(),
    };
    addToQueue(track);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-400" />
          <span>Discover Music</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Search millions of tracks via public decentralized streaming resolvers.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, songs, remixes, or live tracks..."
          className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Search</span>
        </button>
      </form>

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((res) => (
            <div
              key={res.id}
              className="group bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-2xl p-3.5 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-md">
                <img
                  src={res.thumbnail}
                  alt={res.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handlePlayOnline(res)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </button>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                  {formatDuration(res.duration)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                  {res.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                  {res.uploaderName}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium border border-red-500/20">
                  Online Stream
                </span>
                <button
                  onClick={() => handleAddToQueue(res)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Add to queue"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="py-20 text-center text-zinc-600 flex flex-col items-center">
          <Search className="w-12 h-12 stroke-1 text-zinc-700 mb-3" />
          <p className="text-zinc-400 text-sm font-medium">Search across high quality streams</p>
          <p className="text-zinc-600 text-xs mt-1 max-w-sm">
            Type any song name or artist above to fetch and stream music on-demand.
          </p>
        </div>
      )}
    </div>
  );
};
