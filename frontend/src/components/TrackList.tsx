import React from 'react';
import { Play, Pause, Heart, Clock, MoreVertical, Music } from 'lucide-react';
import { Track } from '../types/music';
import { useAudio } from '../context/AudioContext';

interface TrackListProps {
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  playlistContextTracks?: Track[];
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onTrackSelect,
  playlistContextTracks,
}) => {
  const { currentTrack, isPlaying, favorites, toggleFavorite, addToQueue } = useAudio();

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!tracks || tracks.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500 flex flex-col items-center justify-center">
        <Music className="w-12 h-12 stroke-[1.5] text-zinc-600 mb-3" />
        <p className="text-zinc-400 font-medium text-base">No tracks found</p>
        <p className="text-zinc-600 text-sm mt-1 max-w-sm">
          Import local audio files, search for online streaming tracks, or paste a playlist link to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {/* Header bar */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 md:col-span-5">Title</div>
        <div className="hidden md:block md:col-span-4">Album / Source</div>
        <div className="col-span-5 md:col-span-2 flex justify-end items-center pr-4">
          <Clock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Track rows */}
      <div className="space-y-1 mt-1">
        {tracks.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;
          const isFav = favorites.includes(track.id);

          return (
            <div
              key={track.id}
              className={`group grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-white'
                  : 'hover:bg-white/[0.04] text-zinc-300 hover:text-white'
              }`}
              onClick={() => onTrackSelect(track)}
            >
              {/* Number / Play Button */}
              <div className="col-span-1 flex items-center justify-center">
                {isCurrent && isPlaying ? (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-indigo-400 animate-pulse" />
                    <span className="w-0.5 h-2 bg-indigo-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-full bg-indigo-400 animate-pulse delay-150" />
                  </div>
                ) : (
                  <>
                    <span className="group-hover:hidden text-zinc-500 text-xs font-mono">
                      {index + 1}
                    </span>
                    <Play className="hidden group-hover:block w-3.5 h-3.5 text-white fill-white" />
                  </>
                )}
              </div>

              {/* Title & Artist */}
              <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                <img
                  src={track.albumArt || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80'}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80';
                  }}
                  className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0 border border-white/5"
                />
                <div className="truncate pr-2">
                  <p className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-400 font-semibold' : ''}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </div>

              {/* Album / Source */}
              <div className="hidden md:block md:col-span-4 text-xs text-zinc-400 truncate">
                <span className="truncate">{track.album || 'Single'}</span>
                {track.source === 'local' && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Local
                  </span>
                )}
                {track.source === 'piped' && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Stream
                  </span>
                )}
              </div>

              {/* Duration & Actions */}
              <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3 text-xs text-zinc-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-all"
                  style={{ opacity: isFav ? 1 : undefined }}
                  title="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-red-500 text-red-500' : 'text-zinc-500'
                    }`}
                  />
                </button>

                <span className="font-mono text-zinc-500">{formatDuration(track.duration)}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(track);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity"
                  title="Add to queue"
                >
                  <MoreVertical className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
