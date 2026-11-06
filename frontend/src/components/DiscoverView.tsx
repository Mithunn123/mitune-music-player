import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Play, BookmarkPlus, X } from 'lucide-react';
import { resolverService } from '../services/resolverService';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

interface BrowseCategory {
  id: string;
  name: string;
  query: string;
  bgColor: string;
  image: string;
}

const BROWSE_CATEGORIES: BrowseCategory[] = [
  {
    id: 'music',
    name: 'Music',
    query: 'Top global Billboard hits official',
    bgColor: '#dc148c', // Vibrant Magenta
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'podcasts',
    name: 'Podcasts',
    query: 'Top conversational video podcast official',
    bgColor: '#006450', // Deep Pine Green
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'live-events',
    name: 'Live Events',
    query: 'Live music acoustic concert performance official',
    bgColor: '#8400e7', // Electric Violet
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'made-for-you',
    name: 'Made For You',
    query: 'Top trending personalized daily mix songs',
    bgColor: '#1e3264', // Midnight Navy
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'new-releases',
    name: 'New Releases',
    query: 'Latest music releases this week official audio',
    bgColor: '#e8115b', // Bright Crimson
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'charts',
    name: 'Charts',
    query: 'Top 50 global viral chart hits',
    bgColor: '#8d67ab', // Soft Amethyst
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'bollywood',
    name: 'Bollywood',
    query: 'Bollywood romantic dance hits official',
    bgColor: '#d84000', // Burnt Orange
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'kollywood',
    name: 'Kollywood',
    query: 'Latest Tamil hit songs official audio',
    bgColor: '#e91429', // Scarlet Red
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'regional',
    name: 'Regional',
    query: 'Trending regional hits official music',
    bgColor: '#bc5900', // Ochre Amber
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pop',
    name: 'Pop',
    query: 'Pop anthems worldwide hits official audio',
    bgColor: '#148a08', // Emerald Leaf
    image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    query: 'Trending Hip Hop Rap hits official audio',
    bgColor: '#ba5d07', // Bronze Rust
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'rock',
    name: 'Rock',
    query: 'Classic and modern Rock hits official',
    bgColor: '#777777', // Slate Charcoal
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'lo-fi',
    name: 'Lo-Fi Chill',
    query: 'lofi hip hop chill beats study relax',
    bgColor: '#477d95', // Muted Cyan
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'dance-edm',
    name: 'Dance / Electronic',
    query: 'Electronic dance festival anthem hits official',
    bgColor: '#0d73ec', // Electric Azure
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'punjabi',
    name: 'Punjabi',
    query: 'Latest Punjabi party hits official audio',
    bgColor: '#b02897', // Deep Orchid
    image: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'indie',
    name: 'Indie',
    query: 'Indie alternative acoustic songs official',
    bgColor: '#608108', // Olive Green
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'k-pop',
    name: 'K-Pop',
    query: 'Kpop global hits official audio',
    bgColor: '#148a08', // Forest Mint
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'jazz',
    name: 'Jazz & Blues',
    query: 'Smooth Jazz saxophone master official',
    bgColor: '#1e3264', // Deep Sapphire
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'acoustic',
    name: 'Acoustic & Folk',
    query: 'Acoustic chill relaxing songs official audio',
    bgColor: '#503750', // Plum Twilight
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'classical',
    name: 'Classical & Ambient',
    query: 'Peaceful classical piano strings study',
    bgColor: '#7d4b32', // Warm Umber
    image: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=200&auto=format&fit=crop&q=80',
  },
];

interface DiscoverViewProps {
  onOpenAddToPlaylist?: (track: Track) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onOpenAddToPlaylist }) => {
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
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleCategoryClick = (cat: BrowseCategory) => {
    setQuery(cat.name);
    handleSearch(cat.query, cat.name);
  };

  const handleClearSearch = () => {
    setQuery('');
    setActiveCategory(null);
    setResults([]);
  };

  const isSearchActive = query.trim().length > 0 || results.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Search Input Bar */}
      <form onSubmit={onSubmit} className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim() && results.length > 0) {
              setResults([]);
              setActiveCategory(null);
            }
          }}
          placeholder="What do you want to listen to?"
          className="w-full bg-[#121318] border border-white/10 rounded-full pl-11 pr-28 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Active Search Results Section */}
      {isSearchActive && results.length > 0 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-semibold text-white tracking-tight">
              {activeCategory ? `${activeCategory} Highlights` : `Results for "${query}"`}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-mono">
                {results.length} tracks found
              </span>
              <button
                onClick={handleClearSearch}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Back to Browse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      </div>
                    </div>

                    {/* Bookmark action on hover */}
                    {onOpenAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist(track);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
                        title="Add to Playlist"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    )}
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

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
          <span className="text-xs text-neutral-400 font-mono">Discovering official releases...</span>
        </div>
      )}

      {/* "Browse All" Category Card Grid (Visible by default when not actively displaying search results) */}
      {!isLoading && results.length === 0 && (
        <section className="space-y-6">
          <h2 className="font-bold text-2xl text-white tracking-tight">Browse all</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {BROWSE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{ backgroundColor: cat.bgColor }}
                className="aspect-[16/10] sm:aspect-square min-h-[140px] sm:min-h-[160px] rounded-lg relative overflow-hidden cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] shadow-md group"
              >
                {/* Category Label Pinned to Top-Left */}
                <h3 className="top-4 left-4 absolute font-bold text-lg md:text-xl text-white leading-tight max-w-[65%] break-words z-10 drop-shadow-sm">
                  {cat.name}
                </h3>

                {/* Decorative Artwork Thumbnail Rotated ~25 degrees in Bottom-Right Corner */}
                <div className="bottom-0 right-0 absolute pointer-events-none w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] md:w-[100px] md:h-[100px] rotate-[25deg] translate-x-[18%] translate-y-[5%] shadow-2xl rounded-md overflow-hidden bg-black/20 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
