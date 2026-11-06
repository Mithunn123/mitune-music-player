import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Play } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

const SPOTIFY_CATEGORIES = [
  { name: 'Tamil', query: 'Latest Tamil songs hits', bg: 'bg-emerald-800' },
  { name: 'Hindi', query: 'Bollywood Hindi romantic hits', bg: 'bg-rose-800' },
  { name: 'English', query: 'Top English Pop hits', bg: 'bg-blue-800' },
  { name: 'Rock', query: 'Classic Rock hits', bg: 'bg-red-900' },
  { name: 'Jazz', query: 'Smooth Jazz saxophone', bg: 'bg-amber-800' },
  { name: 'Podcasts', query: 'Popular interesting podcasts', bg: 'bg-purple-900' },
  { name: 'Lo-Fi', query: 'lofi hip hop chill study', bg: 'bg-orange-800' },
  { name: 'EDM', query: 'EDM party festival hits', bg: 'bg-cyan-800' },
  { name: 'Hip-Hop', query: 'Trending Rap Hip Hop hits', bg: 'bg-zinc-800' },
  { name: 'Punjabi', query: 'Latest Punjabi songs', bg: 'bg-yellow-800' },
  { name: 'K-Pop', query: 'Kpop hits', bg: 'bg-pink-800' },
  { name: 'Sleep', query: 'Sleep rain sounds ambient', bg: 'bg-teal-900' },
];

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Track[]>([]);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const handleSearch = async (searchTerm: string, categoryName?: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setActiveCategory(categoryName || null);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Search Field */}
      <form onSubmit={onSubmit} className="relative max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, songs, podcasts..."
          className="w-full bg-zinc-900 border border-white/5 rounded-full pl-10 pr-24 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 rounded-full bg-white text-black font-semibold text-xs transition-colors disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">
            {activeCategory ? `${activeCategory} Songs` : `Results for "${query}"`}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  className="group p-2 rounded-xl bg-zinc-900/30 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2">
                    <img
                      src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow">
                        <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-indigo-400' : 'text-zinc-100'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spotify Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Browse All</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPOTIFY_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setQuery(cat.name);
                handleSearch(cat.query, cat.name);
              }}
              className={`h-24 rounded-xl p-3.5 text-left ${cat.bg} hover:brightness-110 active:scale-95 transition-all flex flex-col justify-between`}
            >
              <span className="font-bold text-white text-sm">{cat.name}</span>
              <span className="text-[10px] text-white/60">Explore</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
