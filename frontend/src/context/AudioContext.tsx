import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../types/music';
import { audioService } from '../services/audioService';
import { youtubePlayerService } from '../services/youtubePlayerService';
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
  activeEngine: 'youtube' | 'webaudio';

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackOrId: string | Track) => Promise<void>;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  setEqualizerBand: (bandIndex: number, gain: number) => void;
  audioQuality: 'low' | 'normal' | 'high';
  setAudioQuality: (quality: 'low' | 'normal' | 'high') => void;
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
  const [activeEngine, setActiveEngine] = useState<'youtube' | 'webaudio'>('youtube');
  const [audioQuality, setAudioQualityState] = useState<'low' | 'normal' | 'high'>('high');

  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Refs for stable callbacks
  const queueRef = useRef<Track[]>([]);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(-1);
  queueIndexRef.current = queueIndex;
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef<boolean>(false);
  isShuffleRef.current = isShuffle;
  const activeEngineRef = useRef<'youtube' | 'webaudio'>('youtube');
  activeEngineRef.current = activeEngine;

  // Single mount effect - zero high-frequency state churn
  useEffect(() => {
    const unsubAudio = audioService.subscribe((state) => {
      if (activeEngineRef.current === 'webaudio') {
        setIsPlaying(state.isPlaying);
        setIsBuffering(state.isBuffering);
        setCurrentTime(state.currentTime);
        if (state.duration && isFinite(state.duration) && state.duration > 0) {
          setDuration(state.duration);
        }
      }
    });

    const unsubYT = youtubePlayerService.subscribe((state) => {
      if (activeEngineRef.current === 'youtube') {
        setIsPlaying(state.isPlaying);
        setIsBuffering(state.isBuffering);
        setCurrentTime(state.currentTime);
        if (state.duration && isFinite(state.duration) && state.duration > 0) {
          setDuration(state.duration);
        }
      }
    });

    audioService.onEnded(() => {
      if (activeEngineRef.current === 'webaudio') handleTrackEnd();
    });

    youtubePlayerService.onEnded(() => {
      if (activeEngineRef.current === 'youtube') handleTrackEnd();
    });

    storageService.getFavorites().then(setFavorites);
    storageService.getRecentHistory().then(setHistory);

    return () => {
      unsubAudio();
      unsubYT();
    };
  }, []);

  const handleTrackEnd = () => {
    if (repeatModeRef.current === 'one') {
      if (activeEngineRef.current === 'youtube') {
        youtubePlayerService.seek(0);
        youtubePlayerService.play();
      } else {
        audioService.seek(0);
        audioService.play();
      }
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

    storageService.addHistory(track.id, track.title, track.artist, track);
    storageService.getRecentHistory().then(setHistory);

    await executePlayback(track);
  };

  const executePlayback = async (track: Track) => {
    try {
      if (track.audioBlobUrl) {
        setActiveEngine('webaudio');
        youtubePlayerService.stop();
        await audioService.setSource(track.audioBlobUrl, true);
        return;
      }

      setActiveEngine('youtube');
      audioService.pause();

      if (track.youtubeId) {
        youtubePlayerService.loadTrack(track.youtubeId);
      } else {
        setIsBuffering(true);
        const videoId = await resolverService.resolveYouTubeVideoId(track.title, track.artist);
        if (videoId) {
          track.youtubeId = videoId;
          youtubePlayerService.loadTrack(videoId);
        } else if (track.streamUrl) {
          setActiveEngine('webaudio');
          await audioService.setSource(track.streamUrl, true);
        } else {
          setIsBuffering(false);
        }
      }
    } catch (err) {
      console.error('Error during playback:', err);
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

    storageService.addHistory(track.id, track.title, track.artist, track);
    storageService.getRecentHistory().then(setHistory);

    await executePlayback(track);
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) playAtIndex(0);
      return;
    }

    if (activeEngine === 'youtube') {
      if (isPlaying) {
        youtubePlayerService.pause();
      } else {
        youtubePlayerService.play();
      }
    } else {
      if (isPlaying) {
        audioService.pause();
      } else {
        audioService.play();
      }
    }
  };

  const seek = (seconds: number) => {
    if (activeEngine === 'youtube') {
      youtubePlayerService.seek(seconds);
    } else {
      audioService.seek(seconds);
    }
    setCurrentTime(seconds);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    youtubePlayerService.setVolume(val);
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

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setRepeatMode((p) => (p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'));

  const toggleFavorite = async (trackOrId: string | Track) => {
    let trackId: string;
    let trackData: Track | undefined;

    if (typeof trackOrId === 'object' && trackOrId !== null) {
      trackId = String(trackOrId.id);
      trackData = trackOrId;
    } else {
      trackId = String(trackOrId);
      if (currentTrack && String(currentTrack.id) === trackId) {
        trackData = currentTrack;
      } else {
        trackData = queueRef.current.find((t) => String(t.id) === trackId);
      }
    }

    const isFav = await storageService.toggleFavorite(trackId, trackData);
    if (isFav) {
      setFavorites((prev) => [...prev.filter((id) => id !== trackId), trackId]);
    } else {
      setFavorites((prev) => prev.filter((id) => id !== trackId));
    }
  };

  const setAudioQuality = (quality: 'low' | 'normal' | 'high') => {
    setAudioQualityState(quality);
    audioService.setAudioQuality(quality);
  };

  const addToQueue = (track: Track) => setQueue((p) => [...p, track]);
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
        activeEngine,
        audioQuality,
        setAudioQuality,
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
