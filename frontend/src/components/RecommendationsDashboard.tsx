import React, { useState, useEffect } from 'react';
import { Play, BookmarkPlus, Plus, ChevronRight } from 'lucide-react';
import { recommendationEngine, TRENDING_SEEDS } from '../services/recommendationEngine';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

interface RecommendationsDashboardProps {
  onOpenAddToPlaylist?: (track: Track) => void;
}

export const RecommendationsDashboard: React.FC<RecommendationsDashboardProps> = ({ onOpenAddToPlaylist }) => {
  const [filterType, setFilterType] = useState<'All' | 'Music' | 'Podcasts'>('All');
  const [quickAccessTracks, setQuickAccessTracks] = useState<Track[]>([]);
  const [pickedTrack, setPickedTrack] = useState<Track | null>(null);
  const [newFridayTracks, setNewFridayTracks] = useState<Track[]>([]);
  const [recents, setRecents] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { playTrack, currentTrack, queue } = useAudio();

  useEffect(() => {
    const loadSpotifyHomeData = async () => {
      setIsLoading(true);
      try {
        const feed = await recommendationEngine.generatePersonalizedFeed();
        const allTracks = feed.forYouTracks;

        // 1. Quick-Access Grid (8 tracks: 2 rows x 4 columns)
        setQuickAccessTracks(allTracks.slice(0, 8));

        // 2. Section 1 Hero Pick ("Picked for you")
        setPickedTrack(allTracks[0] || null);

        // 3. Section 1 Media Cards ("It's New Music Friday!")
        if (feed.genreShelves && feed.genreShelves.length > 0) {
          setNewFridayTracks(feed.genreShelves[0].tracks.slice(0, 4));
        } else {
          setNewFridayTracks(allTracks.slice(1, 5));
        }

        // 4. Section 2: "Recents"
        const recentHistory = allTracks.slice(2, 8);
        setRecents(recentHistory);
      } catch (err) {
        console.error('Failed to load Spotify-styled home feed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpotifyHomeData();
  }, []);

  // Handle filter switching
  const handleFilterChange = (filter: 'All' | 'Music' | 'Podcasts') => {
    setFilterType(filter);
    if (filter === 'Podcasts') {
      recommendationEngine.fetchFullSongs('Trending English Podcasts Conversational', 12).then((tracks) => {
        setQuickAccessTracks(tracks.slice(0, 8));
        setPickedTrack(tracks[0] || null);
        setNewFridayTracks(tracks.slice(1, 5));
        setRecents(tracks.slice(2, 8));
      });
    } else {
      recommendationEngine.generatePersonalizedFeed().then((feed) => {
        setQuickAccessTracks(feed.forYouTracks.slice(0, 8));
        setPickedTrack(feed.forYouTracks[0] || null);
        setNewFridayTracks(
          feed.genreShelves?.[0]?.tracks.slice(0, 4) || feed.forYouTracks.slice(1, 5)
        );
        setRecents(feed.forYouTracks.slice(2, 8));
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 select-none animate-in fade-in duration-200">
      
      {/* ========================================================
          1. TOP FILTER CHIPS (All, Music, Podcasts)
         ======================================================== */}
      <div className="flex items-center gap-2">
        {(['All', 'Music', 'Podcasts'] as const).map((chip) => (
          <button
            key={chip}
            onClick={() => handleFilterChange(chip)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterType === chip
                ? 'bg-white text-black shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ========================================================
          2. QUICK-ACCESS GRID (2 rows x 4 columns)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickAccessTracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, quickAccessTracks)}
              className="h-14 sm:h-16 bg-white/5 hover:bg-white/10 rounded-md overflow-hidden transition-all group cursor-pointer flex items-center justify-between relative shadow-sm"
            >
              <div className="flex items-center min-w-0 h-full flex-1">
                {/* Left: Square thumbnail covering full card height */}
                <div className="w-14 sm:w-16 h-full shrink-0 bg-[#242424] overflow-hidden">
                  <img
                    src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80'}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Center: Title single-line truncated */}
                <span className={`font-semibold text-sm truncate px-3 ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                  {track.title}
                </span>
              </div>

              {/* Right: Hover-triggered solid green Spotify play action button */}
              <div className="pr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track, quickAccessTracks);
                  }}
                  className="w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl transition-transform"
                  title="Play"
                >
                  <Play className="w-5 h-5 fill-black translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. SECTION 1: "Picked for you" + "It's New Music Friday!"
         ======================================================== */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: "Picked for you" Large Hero Banner (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xl font-bold text-white tracking-tight">Picked for you</h3>

            {pickedTrack ? (
              <div 
                onClick={() => playTrack(pickedTrack, quickAccessTracks)}
                className="bg-[#181818] hover:bg-[#202020] rounded-xl p-5 transition-all group cursor-pointer border border-white/5 space-y-4 shadow-lg"
              >
                {/* 16:9 Rich Banner Artwork */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#242424]">
                  <img
                    src={pickedTrack.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                    alt={pickedTrack.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white tracking-wider uppercase font-semibold">
                    Studio Master
                  </div>
                </div>

                {/* Banner Metadata & Inline Action Buttons */}
                <div className="space-y-2">
                  <h4 className="text-xl font-extrabold text-white tracking-tight truncate">
                    {pickedTrack.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    Official studio master by {pickedTrack.artist}. Curated by Mitune recommendation algorithms based on high global streaming engagement.
                  </p>
                </div>

                {/* Action Buttons: Play + Add to Playlist */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(pickedTrack, quickAccessTracks);
                    }}
                    className="w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-transform"
                    title="Play"
                  >
                    <Play className="w-5 h-5 fill-black translate-x-0.5" />
                  </button>

                  {onOpenAddToPlaylist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddToPlaylist(pickedTrack);
                      }}
                      className="w-10 h-10 rounded-full border border-white/20 hover:border-white text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-xl bg-[#181818] animate-pulse" />
            )}
          </div>

          {/* Right Side: "It's New Music Friday!" (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">It's New Music Friday!</h3>
                <p className="text-xs text-neutral-400 mt-0.5">The freshest official releases from creators worldwide</p>
              </div>
              <button 
                onClick={() => {
                  if (newFridayTracks.length > 0) playTrack(newFridayTracks[0], newFridayTracks);
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
              >
                Show all
              </button>
            </div>

            {/* Grid of standard media cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {newFridayTracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, newFridayTracks)}
                    className="p-3.5 bg-[#181818] hover:bg-[#242424] rounded-lg transition-all group cursor-pointer flex flex-col justify-between relative shadow-sm"
                  >
                    {/* Square 1:1 artwork with rounded-md corners */}
                    <div className="relative aspect-square rounded-md overflow-hidden bg-[#242424] mb-3">
                      <img
                        src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />

                      {/* Spotify hover play button */}
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track, newFridayTracks);
                          }}
                          className="w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl transition-transform"
                          title="Play"
                        >
                          <Play className="w-5 h-5 fill-black translate-x-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & 2-line truncated subtitle/artist */}
                    <div>
                      <h5 className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                        {track.title}
                      </h5>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-snug">
                        {track.artist} &bull; {track.album || 'Single'}
                      </p>
                    </div>

                    {/* Bookmark action on hover */}
                    {onOpenAddToPlaylist && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddToPlaylist(track);
                        }}
                        className="mt-2 text-xs text-neutral-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add to Playlist"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          4. SECTION 2: "Recents" Horizontal Media Card Row
         ======================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Recents</h3>
          <button
            onClick={() => {
              if (recents.length > 0) playTrack(recents[0], recents);
            }}
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Show all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {recents.map((track) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, recents)}
                className="p-3 bg-[#181818] hover:bg-[#242424] rounded-lg transition-all group cursor-pointer flex flex-col justify-between relative shadow-sm"
              >
                {/* 1:1 Cover Art */}
                <div className="relative aspect-square rounded-md overflow-hidden bg-[#242424] mb-3">
                  <img
                    src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track, recents);
                      }}
                      className="w-9 h-9 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl transition-transform"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h5 className={`font-semibold text-xs truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>
                    {track.title}
                  </h5>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
