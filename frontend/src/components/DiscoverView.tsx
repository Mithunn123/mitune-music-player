import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Play, Plus, Compass } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

// Spotify-style Browse Category Cards with vibrant card gradients
interface CategoryCard {
  id: string;
  name: string;
  query: string;
  gradient: string;
  subtitle: string;
}

const SPOTIFY_CATEGORIES: CategoryCard[] = [
  { id: 'tamil', name: 'Tamil Hits', query: 'Latest Tamil Hits songs 2026', gradient: 'from-orange-600 to-amber-700', subtitle: 'Anirudh, AR Rahman & Top Beats' },
  { id: 'hindi', name: 'Bollywood & Hindi', query: 'Latest Bollywood Hindi songs', gradient: 'from-rose-600 to-pink-800', subtitle: 'Arijit Singh, Romance & Melodies' },
  { id: 'english', name: 'International Pop', query: 'Top English Pop hits', gradient: 'from-blue-600 to-indigo-800', subtitle: 'Global Top Billboard' },
  { id: 'rock', name: 'Rock & Classics', query: 'Best Classic and Modern Rock songs', gradient: 'from-red-700 to-zinc-900', subtitle: 'Guitars, Anthems & Legends' },
  { id: 'jazz', name: 'Smooth Jazz', query: 'Smooth Jazz saxophone relaxing', gradient: 'from-emerald-700 to-teal-900', subtitle: 'Cafe, Blues & Saxophone' },
  { id: 'podcasts', name: 'Podcasts & Talks', query: 'Best interesting podcast episodes', gradient: 'from-purple-700 to-violet-950', subtitle: 'Stories, Science & Comedy' },
  { id: 'lofi', name: 'Lo-Fi & Study', query: 'Lofi hip hop beats to study relax', gradient: 'from-amber-600 to-yellow-800', subtitle: 'Chill background study vibes' },
  { id: 'edm', name: 'EDM & Dance', query: 'EDM festival dance party hits', gradient: 'from-cyan-600 to-blue-900', subtitle: 'High energy festival drops' },
  { id: 'hiphop', name: 'Hip-Hop & Rap', query: 'Trending Hip Hop and Rap hits', gradient: 'from-zinc-700 to-stone-900', subtitle: 'Beats, bars & anthems' },
  { id: 'kpop', name: 'K-Pop Worldwide', query: 'Kpop trending songs', gradient: 'from-pink-600 to-fuchsia-800', subtitle: 'BTS, Blackpink & rising stars' },
  { id: 'punjabi', name: 'Punjabi Bangers', query: 'Trending Punjabi songs hits', gradient: 'from-yellow-600 to-orange-800', subtitle: 'High beat Punjabi party' },
  { id: 'sleep', name: 'Ambient & Sleep', query: 'Deep sleep rain ambient soundscapes', gradient: 'from-teal-800 to-slate-900', subtitle: 'Calm night rain & sleep waves' },
];

export const DiscoverView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<Track[]>([]);
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  const handleSearch = async (searchTerm: string, categoryTitle?: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setActiveCategory(categoryTitle || null);
    try {
      const items = await resolverService.searchFullSongs(searchTerm, 30);
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

  const handleCategorySelect = (card: CategoryCard) => {
    setQuery(card.name);
    handleSearch(card.query, card.name);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Search Header */}
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white tracking-tight">Search</h2>
        <form onSubmit={onSubmit} className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to play? (Artists, songs, podcasts, languages...)"
            className="w-full bg-zinc-900/90 border border-white/10 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all shadow-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shadow"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Results Section (when searched or category clicked) */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {activeCategory ? `Browse: ${activeCategory}` : `Results for "${query}"`}
            </h3>
            <button
              onClick={() => playTrack(results[0], results)}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  className="group p-2.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2 shadow">
                      <img
                        src={track.albumArt}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-indigo-400' : 'text-zinc-100'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
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
        </div>
      )}

      {/* Spotify-Style Browse All Categories Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white tracking-tight">Browse All Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {SPOTIFY_CATEGORIES.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCategorySelect(card)}
              className={`h-36 rounded-2xl p-4 text-left relative overflow-hidden bg-gradient-to-br ${card.gradient} shadow-lg hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all flex flex-col justify-between group`}
            >
              <div>
                <h4 className="font-extrabold text-white text-base tracking-tight leading-tight">
                  {card.name}
                </h4>
                <p className="text-[11px] text-white/70 mt-1 line-clamp-2 leading-tight">
                  {card.subtitle}
                </p>
              </div>

              {/* Decorative mini graphic icon */}
              <div className="self-end opacity-20 group-hover:opacity-35 transition-opacity">
                <Compass className="w-10 h-10 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
