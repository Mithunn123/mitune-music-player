import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Plus, Heart, RefreshCw, Flame, Radio, Headphones } from 'lucide-react';
import { recommendationEngine, TRENDING_SEEDS } from '../services/recommendationEngine';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

export const RecommendationsDashboard: React.FC = () => {
  const [headline, setHeadline] = useState('Recommended For You');
  const [description, setDescription] = useState('Personalized algorithmic mixes and chart-topping streams.');
  const [forYouTracks, setForYouTracks] = useState<Track[]>([]);
  const [shelves, setShelves] = useState<{ title: string; tracks: Track[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const { playTrack, addToQueue, currentTrack, isPlaying, favorites, toggleFavorite } = useAudio();

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const feed = await recommendationEngine.generatePersonalizedFeed();
      setHeadline(feed.headline);
      setDescription(feed.description);
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
      setDescription(`Streaming continuous full-length radio for ${seed.tag}`);
      setForYouTracks(tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Professional Hero Section */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              AI Mix & Discovery
            </span>
            <h2 className="text-3xl font-black text-white mt-2 tracking-tight">
              {headline}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {forYouTracks.length > 0 && (
              <button
                onClick={() => playTrack(forYouTracks[0], forYouTracks)}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Smart Mix</span>
              </button>
            )}

            <button
              onClick={loadFeed}
              className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Vibe Pill Chips */}
        <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-white/5">
          {TRENDING_SEEDS.map((seed) => (
            <button
              key={seed.tag}
              onClick={() => handleMoodSelect(seed)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeMood === seed.tag
                  ? 'bg-white text-black shadow'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {seed.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Recommendations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            <span>Featured Tracks</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {forYouTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = favorites.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, forYouTracks)}
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

      {/* Shelves (Dynamic Categorized Playlists) */}
      {shelves.map((shelf, i) => (
        <div key={i} className="space-y-3 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-400" />
              <span>{shelf.title}</span>
            </h3>
            <button
              onClick={() => playTrack(shelf.tracks[0], shelf.tracks)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Play all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {shelf.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, shelf.tracks)}
                className="group p-2 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-1.5 shadow">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-white">
                  {track.title}
                </p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
