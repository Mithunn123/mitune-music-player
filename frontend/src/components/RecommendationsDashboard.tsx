import React, { useState, useEffect } from 'react';
import { Play, Heart, RefreshCw, BookmarkPlus } from 'lucide-react';
import { recommendationEngine, TRENDING_SEEDS } from '../services/recommendationEngine';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

interface RecommendationsDashboardProps {
  onOpenAddToPlaylist?: (track: Track) => void;
}

export const RecommendationsDashboard: React.FC<RecommendationsDashboardProps> = ({ onOpenAddToPlaylist }) => {
  const [headline, setHeadline] = useState('Recommended Mix');
  const [forYouTracks, setForYouTracks] = useState<Track[]>([]);
  const [shelves, setShelves] = useState<{ title: string; tracks: Track[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const { playTrack, currentTrack, favorites, toggleFavorite } = useAudio();

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const feed = await recommendationEngine.generatePersonalizedFeed();
      setHeadline(feed.headline);
      setForYouTracks(feed.forYouTracks);
      setShelves(feed.genreShelves);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleMoodSelect = async (seed: { tag: string; query: string }) => {
    setActiveMood(seed.tag);
    setIsLoading(true);
    try {
      const tracks = await recommendationEngine.fetchFullSongs(seed.query, 12);
      setHeadline(seed.tag);
      setForYouTracks(tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {headline}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Personalized studio tracks curated from your listening taste
          </p>
        </div>

        <div className="flex items-center gap-3">
          {forYouTracks.length > 0 && (
            <button
              onClick={() => playTrack(forYouTracks[0], forYouTracks)}
              className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
            >
              Play All
            </button>
          )}

          <button
            onClick={loadFeed}
            className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mood Filters: 8pt grid, dark neutral pills */}
      <div className="flex gap-2 flex-wrap">
        {TRENDING_SEEDS.map((seed) => (
          <button
            key={seed.tag}
            onClick={() => handleMoodSelect(seed)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${
              activeMood === seed.tag
                ? 'bg-white text-black font-semibold'
                : 'bg-[#121318] border border-white/10 text-neutral-400 hover:text-white hover:bg-[#181920]'
            }`}
          >
            {seed.tag}
          </button>
        ))}
      </div>

      {/* Grid of 1:1 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {forYouTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, forYouTracks)}
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

                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:scale-105 active:scale-95 transition-all"
                    style={{ opacity: isFav ? 1 : undefined }}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  {onOpenAddToPlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddToPlaylist(track);
                      }}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:scale-105 active:scale-95 transition-all"
                      title="Add to Playlist"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Left-Aligned Metadata */}
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

      {/* Shelves */}
      {shelves.map((shelf, i) => (
        <div key={i} className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-tight">{shelf.title}</h3>
            <button
              onClick={() => playTrack(shelf.tracks[0], shelf.tracks)}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Play all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {shelf.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, shelf.tracks)}
                className="group p-2.5 rounded-2xl bg-[#121318] hover:bg-[#181920] border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#181920] mb-2 border border-white/5">
                  <img
                    src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <p className="text-xs font-medium text-neutral-200 truncate">{track.title}</p>
                <p className="text-[10px] text-neutral-500 truncate">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
