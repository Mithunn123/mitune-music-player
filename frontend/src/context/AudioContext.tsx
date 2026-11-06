import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist } from '../types/music';
import { audioService } from '../services/audioService';
import { resolverService } from '../services/resolverService';
import { storageService } from '../services/storageService';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  queueIndex: number;
  history: any[];
  favorites: string[];
  visualizerData: Uint8Array | null;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => Promise<void>;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setEqualizerBand: (bandIndex: number, gain: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [visualizerData, setVisualizerData] = useState<Uint8Array | null>(null);

  // Keep refs for callbacks
  const queueRef = useRef<Track[]>([]);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(-1);
  queueIndexRef.current = queueIndex;
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef<boolean>(false);
  isShuffleRef.current = isShuffle;

  // Sync state from AudioService
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsBuffering(state.isBuffering);
      setCurrentTime(state.currentTime);
      if (state.duration && isFinite(state.duration) && state.duration > 0) {
        setDuration(state.duration);
      }
    });

    // Auto next track when current ends
    audioService.onEnded(() => {
      handleTrackEnd();
    });

    // Load initial favorites & history
    storageService.getFavorites().then(setFavorites);
    storageService.getRecentHistory().then(setHistory);

    // Audio Visualizer loop
    const animId = requestAnimationFrame(function updateVis() {
      if (audioService) {
        const data = audioService.getVisualizerData();
        if (data) setVisualizerData(new Uint8Array(data));
      }
      requestAnimationFrame(updateVis);
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleTrackEnd = () => {
    if (repeatModeRef.current === 'one') {
      audioService.seek(0);
      audioService.play();
      return;
    }

    const currentQ = queueRef.current;
    const currentIndex = queueIndexRef.current;

    if (currentQ.length === 0) return;

    if (isShuffleRef.current) {
      const randomIndex = Math.floor(Math.random() * currentQ.length);
      playAtIndex(randomIndex);
    } else if (currentIndex < currentQ.length - 1) {
      playAtIndex(currentIndex + 1);
    } else if (repeatModeRef.current === 'all') {
      playAtIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  const playAtIndex = async (index: number) => {
    const track = queueRef.current[index];
    if (!track) return;

    setQueueIndex(index);
    setCurrentTrack(track);
    setDuration(track.duration || 0);

    // Record history
    storageService.addHistory(track.id, track.title, track.artist);
    storageService.getRecentHistory().then(setHistory);

    try {
      if (track.audioBlobUrl) {
        // Direct local file blob
        await audioService.setSource(track.audioBlobUrl, true);
      } else if (track.streamUrl) {
        // Already has direct stream
        await audioService.setSource(track.streamUrl, true);
      } else {
        // Resolve online stream via Piped
        setIsBuffering(true);
        const resolvedUrl = await resolverService.resolveAudioStream(track.id);
        if (resolvedUrl) {
          track.streamUrl = resolvedUrl;
          await audioService.setSource(resolvedUrl, true);
        } else {
          console.error('Failed to resolve stream for track', track.title);
          setIsBuffering(false);
        }
      }
    } catch (err) {
      console.error('Error during track play:', err);
      setIsBuffering(false);
    }
  };

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    let q = queue;
    let idx = 0;

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      q = newQueue;
      idx = newQueue.findIndex((t) => t.id === track.id);
      if (idx === -1) idx = 0;
    } else {
      // Check if already in queue
      idx = queue.findIndex((t) => t.id === track.id);
      if (idx === -1) {
        q = [track, ...queue];
        setQueue(q);
        idx = 0;
      }
    }

    setQueueIndex(idx);
    setCurrentTrack(track);
    setDuration(track.duration || 0);

    // Save history
    storageService.addHistory(track.id, track.title, track.artist);
    storageService.getRecentHistory().then(setHistory);

    try {
      if (track.audioBlobUrl) {
        await audioService.setSource(track.audioBlobUrl, true);
      } else if (track.streamUrl) {
        await audioService.setSource(track.streamUrl, true);
      } else {
        setIsBuffering(true);
        const resolvedUrl = await resolverService.resolveAudioStream(track.id);
        if (resolvedUrl) {
          track.streamUrl = resolvedUrl;
          await audioService.setSource(resolvedUrl, true);
        } else {
          console.error('Failed to resolve track stream URL');
          setIsBuffering(false);
        }
      }
    } catch (err) {
      console.error('Playback trigger error', err);
      setIsBuffering(false);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playAtIndex(0);
      }
      return;
    }

    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.play();
    }
  };

  const seek = (seconds: number) => {
    audioService.seek(seconds);
    setCurrentTime(seconds);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    audioService.setVolume(val);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    if (isShuffle) {
      const rand = Math.floor(Math.random() * queue.length);
      playAtIndex(rand);
    } else if (queueIndex < queue.length - 1) {
      playAtIndex(queueIndex + 1);
    } else {
      playAtIndex(0);
    }
  };

  const previousTrack = () => {
    if (queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
    } else if (queueIndex > 0) {
      playAtIndex(queueIndex - 1);
    } else {
      playAtIndex(queue.length - 1);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleFavorite = async (trackId: string) => {
    const isFav = await storageService.toggleFavorite(trackId);
    if (isFav) {
      setFavorites([...favorites, trackId]);
    } else {
      setFavorites(favorites.filter((id) => id !== trackId));
    }
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const clearQueue = () => {
    setQueue([]);
    setQueueIndex(-1);
  };

  const setEqualizerBand = (bandIndex: number, gain: number) => {
    audioService.setEqualizerBand(bandIndex, gain);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        history,
        favorites,
        visualizerData,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        nextTrack,
        previousTrack,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        addToQueue,
        clearQueue,
        setEqualizerBand,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
