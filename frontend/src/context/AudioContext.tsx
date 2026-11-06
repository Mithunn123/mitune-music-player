import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

interface AudioContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (url: string) => Promise<void>;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (val: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(200);
  const [volume, setVolumeState] = useState(0.7);

  const playTrack = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      await audioService.loadTrack(arrayBuffer);
      await audioService.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('Failed to play track', e);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioService.pause();
      setIsPlaying(false);
    } else {
      audioService.play();
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    audioService.seek(time);
    setCurrentTime(time);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    audioService.setVolume(val);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, currentTime, duration, volume, playTrack, togglePlay, seek, setVolume }}>
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
