import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Play, Plus } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

const QUICK_CHIPS = ['The Weeknd', 'Taylor Swift', 'Coldplay', 'Billie Eilish', 'Kendrick Lamar', 'Lo-Fi Chill'];

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const items = await resolverService.searchFullSongs(searchTerm, 24);
      setResults(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search Input */}
      <form onSubmit={onSubmit} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-11 pr-24 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Search</span>
        </button>
      </form>

      {/* Quick Chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              setQuery(chip);
              handleSearch(chip);
            }}
            className="px-3 py-1 rounded-full text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Clean Grid Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map((track) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, results)}
                className="group p-2 rounded-xl bg-zinc-900/30 hover:bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <p className={`text-xs font-medium truncate ${isCurrent ? 'text-indigo-400' : 'text-zinc-200'}`}>
                  {track.title}
                </p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {track.artist}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
                  <span>{formatDuration(track.duration)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    className="p-1 hover:text-white"
                    title="Add to queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="py-20 text-center text-zinc-600 text-xs">
          Search for any song or artist above
        </div>
      )}
    </div>
  );
};
