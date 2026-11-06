import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Play } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

const SPOTIFY_CATEGORIES = [
  { name: 'Tamil', query: 'Latest Tamil hits official audio', tag: 'Regional' },
  { name: 'Hindi', query: 'Bollywood romantic hits official', tag: 'Popular' },
  { name: 'English', query: 'Global Billboard Pop hits official', tag: 'Trending' },
  { name: 'Rock', query: 'Classic Rock master hits official', tag: 'Genre' },
  { name: 'Jazz', query: 'Smooth Jazz saxophone master', tag: 'Instrumental' },
  { name: 'Podcasts', query: 'Interesting conversational podcasts', tag: 'Talk' },
  { name: 'Lo-Fi', query: 'lofi hip hop chill study beats', tag: 'Focus' },
  { name: 'EDM', query: 'Electronic dance festival hits official', tag: 'Dance' },
  { name: 'Hip-Hop', query: 'Trending Rap Hip Hop hits official', tag: 'Urban' },
  { name: 'Punjabi', query: 'Latest Punjabi songs hits official', tag: 'Regional' },
  { name: 'K-Pop', query: 'Kpop global hits official audio', tag: 'Global' },
  { name: 'Acoustic', query: 'Acoustic chill songs official', tag: 'Relax' },
];

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Track[]>([]);
  const { playTrack, currentTrack } = useAudio();

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
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Search Input Bar */}
      <form onSubmit={onSubmit} className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, songs, podcasts..."
          className="w-full bg-[#121318] border border-white/10 rounded-full pl-11 pr-24 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-40"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {activeCategory ? `${activeCategory} Highlights` : `Results for "${query}"`}
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              {results.length} tracks found
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  className="group p-3 rounded-2xl bg-[#121318] hover:bg-[#181920] border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* 1:1 Artwork */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#181920] mb-2.5 border border-white/5">
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
                      <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs font-medium truncate ${isCurrent ? 'text-white font-semibold' : 'text-neutral-200'}`}>
                    {track.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spotify Categories: Human-Crafted Dark Neutral Surfaces */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">Browse Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SPOTIFY_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setQuery(cat.name);
                handleSearch(cat.query, cat.name);
              }}
              className="h-24 rounded-2xl p-4 text-left bg-[#121318] hover:bg-[#181920] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-white text-sm tracking-tight">{cat.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">{cat.tag}</span>
              </div>
              <span className="text-[11px] text-neutral-400 group-hover:text-white transition-colors">
                Explore &rarr;
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
