import React, { useState, useEffect } from 'react';
import { Play, Heart, RefreshCw } from 'lucide-react';
import { recommendationEngine, TRENDING_SEEDS } from '../services/recommendationEngine';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

export const RecommendationsDashboard: React.FC = () => {
  const [headline, setHeadline] = useState('Top Mix For You');
  const [forYouTracks, setForYouTracks] = useState<Track[]>([]);
  const [shelves, setShelves] = useState<{ title: string; tracks: Track[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const { playTrack, currentTrack, isPlaying, favorites, toggleFavorite } = useAudio();

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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Minimal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {headline}
        </h2>

        <div className="flex items-center gap-2">
          {forYouTracks.length > 0 && (
            <button
              onClick={() => playTrack(forYouTracks[0], forYouTracks)}
              className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Play All
            </button>
          )}

          <button
            onClick={loadFeed}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mood Filters */}
      <div className="flex gap-2 flex-wrap">
        {TRENDING_SEEDS.map((seed) => (
          <button
            key={seed.tag}
            onClick={() => handleMoodSelect(seed)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              activeMood === seed.tag
                ? 'bg-white text-black font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {seed.tag}
          </button>
        ))}
      </div>

      {/* Clean Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {forYouTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, forYouTracks)}
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ opacity: isFav ? 1 : undefined }}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
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

      {/* Shelves */}
      {shelves.map((shelf, i) => (
        <div key={i} className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-300">{shelf.title}</h3>
            <button
              onClick={() => playTrack(shelf.tracks[0], shelf.tracks)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Play all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {shelf.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, shelf.tracks)}
                className="group p-2 rounded-xl bg-zinc-900/20 hover:bg-zinc-900 cursor-pointer"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-1.5">
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
                <p className="text-xs font-medium text-zinc-200 truncate">{track.title}</p>
                <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
