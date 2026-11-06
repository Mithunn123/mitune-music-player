import React, { useState } from 'react';
import { Search, Loader2, Play, Plus, Compass, Sparkles, Zap } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

const QUICK_SEARCH_CHIPS = [
  'The Weeknd',
  'Taylor Swift',
  'Billie Eilish',
  'Kendrick Lamar',
  'Coldplay',
  'Drake',
  'Travis Scott',
  'Dua Lipa',
  'Eminem',
  'Arijit Singh',
  'Synthwave 80s',
  'Lo-Fi Study Beats',
];

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const items = await resolverService.searchMusic(searchTerm, 30);
      setResults(items);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    handleSearch(term);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Instant Global Stream Engine · Zero Buffering</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2 tracking-tight">
          <Compass className="w-7 h-7 text-indigo-400" />
          <span>Access Any Music in the World</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Instant high-speed playback for over 100+ million studio masters worldwide.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={onSubmit} className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any artist, song title, album, or vibe..."
          className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-32 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xl"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Search</span>
        </button>
      </form>

      {/* Quick Artist & Vibe Chips */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-zinc-500 font-semibold mr-1">Trending:</span>
        {QUICK_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Results grid */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Found {results.length} Instant Tracks
            </h3>
            <button
              onClick={() => playTrack(results[0], results)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  className="group bg-zinc-900/40 hover:bg-zinc-900/90 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-3 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-md">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Play button overlay */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            <span className="w-1 h-full bg-white animate-pulse" />
                            <span className="w-1 h-2 bg-white animate-pulse delay-75" />
                            <span className="w-1 h-full bg-white animate-pulse delay-150" />
                          </div>
                        ) : (
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-semibold line-clamp-1 transition-colors ${
                        isCurrent ? 'text-indigo-400 font-bold' : 'text-zinc-200 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                      {track.artist}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      ⚡ Instant
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-1 hover:text-white text-zinc-400 hover:bg-white/10 rounded-md transition-colors"
                      title="Add to queue"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="py-24 text-center text-zinc-600 flex flex-col items-center">
          <Search className="w-14 h-14 stroke-1 text-zinc-700 mb-3" />
          <p className="text-zinc-300 text-base font-semibold">Search Any Artist or Song</p>
          <p className="text-zinc-500 text-xs mt-1 max-w-md">
            Type any song name above or click a trending artist chip to begin instant playback.
          </p>
        </div>
      )}
    </div>
  );
};
