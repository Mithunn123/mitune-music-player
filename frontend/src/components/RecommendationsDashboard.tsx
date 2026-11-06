import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Play, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Radio, 
  Headphones, 
  Heart,
  Zap
} from 'lucide-react';
import { recommendationEngine, TRENDING_SEEDS } from '../services/recommendationEngine';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

export const RecommendationsDashboard: React.FC = () => {
  const [headline, setHeadline] = useState('Your Daily Algorithm Mix');
  const [description, setDescription] = useState('Personalized to your unique taste, artists, and moods.');
  const [forYouTracks, setForYouTracks] = useState<Track[]>([]);
  const [shelves, setShelves] = useState<{ title: string; tracks: Track[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const { playTrack, addToQueue, currentTrack, isPlaying, favorites, toggleFavorite } = useAudio();

  const loadRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const feed = await recommendationEngine.generatePersonalizedFeed();
      setHeadline(feed.headline);
      setDescription(feed.description);
      setForYouTracks(feed.forYouTracks);
      setShelves(feed.genreShelves);
    } catch (e) {
      console.error('Failed to load feed', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleMoodSelect = async (seed: { tag: string; query: string }) => {
    setActiveMood(seed.tag);
    setIsRefreshing(true);
    try {
      const tracks = await recommendationEngine.fetchFullSongs(seed.query, 14);
      setHeadline(`Vibe Radio: ${seed.tag}`);
      setDescription(`Instant real-time stream queue generated from ${seed.tag}`);
      setForYouTracks(tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Algorithmic Station */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-zinc-950 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Recommendation Engine · Active</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {headline}
            </h2>
            <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (forYouTracks.length > 0) {
                  playTrack(forYouTracks[0], forYouTracks);
                }
              }}
              disabled={forYouTracks.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Smart Mix</span>
            </button>

            <button
              onClick={loadRecommendations}
              disabled={isRefreshing}
              className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all shadow-md"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Instant Vibe Chips */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Instant Vibe Selectors</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {TRENDING_SEEDS.map((seed) => (
              <button
                key={seed.tag}
                onClick={() => handleMoodSelect(seed)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeMood === seed.tag
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                    : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
                }`}
              >
                {seed.tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* For You / Recommended Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-wide">
              Top Picks For You
            </h3>
            <span className="text-xs text-zinc-500 font-mono">({forYouTracks.length} instant tracks)</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-2xl p-3 animate-pulse h-56" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {forYouTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isFav = favorites.includes(track.id);

              return (
                <div
                  key={track.id}
                  className="group relative bg-zinc-900/40 hover:bg-zinc-900/90 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-3 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                  onClick={() => playTrack(track, forYouTracks)}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-md">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay Play Button */}
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      style={{ opacity: isFav ? 1 : undefined }}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className={`text-xs font-semibold line-clamp-1 transition-colors ${
                      isCurrent ? 'text-indigo-400 font-bold' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                      {track.artist}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                      Full Track · {formatDuration(track.duration)}
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
        )}
      </div>

      {/* Recommended Shelves (Genre / Vibe based) */}
      {shelves.map((shelf, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-400" />
              <span>{shelf.title}</span>
            </h3>
            <button
              onClick={() => {
                if (shelf.tracks.length > 0) {
                  playTrack(shelf.tracks[0], shelf.tracks);
                }
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Play all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {shelf.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, shelf.tracks)}
                className="group bg-zinc-900/30 hover:bg-zinc-900/80 border border-white/5 rounded-xl p-2.5 transition-all cursor-pointer"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 mb-2">
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 fill-white text-white" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-400">
                  {track.title}
                </p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
