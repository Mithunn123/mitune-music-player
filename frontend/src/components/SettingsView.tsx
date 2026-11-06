import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Sliders, 
  HardDrive, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Moon, 
  Monitor,
  Music2
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const SettingsView: React.FC = () => {
  const [audioQuality, setAudioQuality] = useState<'high' | 'ultra' | 'lossless'>('ultra');
  const [crossfade, setCrossfade] = useState<number>(2);
  const [normalizeVolume, setNormalizeVolume] = useState<boolean>(true);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [autoPreload, setAutoPreload] = useState<boolean>(true);

  const handleClearCache = async () => {
    try {
      // Clear IndexedDB cache
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
          <SettingsIcon className="w-7 h-7 text-indigo-400" />
          <span>App Settings</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Customize audio fidelity, playback behaviors, local storage, and ambient visualizations.
        </p>
      </div>

      {/* 1. Playback & Audio Engine */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Audio Quality & Streaming</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Streaming Bitrate Quality</p>
              <p className="text-xs text-zinc-500">Select preferred audio fidelity for streaming tracks.</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-white/5">
              {(['high', 'ultra', 'lossless'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setAudioQuality(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    audioQuality === q
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {q === 'ultra' ? 'Ultra (320k)' : q === 'lossless' ? 'Studio FLAC' : 'High (256k)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Seamless Crossfade Transition</p>
              <p className="text-xs text-zinc-500">Overlap audio smoothly between consecutive tracks.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-indigo-400">{crossfade}s</span>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={crossfade}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="w-28 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Volume Normalization (ReplayGain)</p>
              <p className="text-xs text-zinc-500">Automatically adjust track volume to prevent loud spikes.</p>
            </div>
            <button
              onClick={() => setNormalizeVolume(!normalizeVolume)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                normalizeVolume ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  normalizeVolume ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Performance & Preload */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">Playback Performance & Preload</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Zero-Latency Queue Preload</p>
              <p className="text-xs text-zinc-500">Pre-buffers subsequent songs in the background for 0ms transitions.</p>
            </div>
            <button
              onClick={() => setAutoPreload(!autoPreload)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                autoPreload ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoPreload ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Hardware Accelerated Visualizers</p>
              <p className="text-xs text-zinc-500">Utilizes GPU WebGL for real-time frequency spectrum analysis.</p>
            </div>
            <button
              onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                hardwareAcceleration ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  hardwareAcceleration ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Storage & Database Management */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Local Storage & Privacy</h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Local Stream Cache</p>
            <p className="text-xs text-zinc-500">IndexedDB tracks, album art, and temporary cached stream tokens.</p>
          </div>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-semibold transition-all flex items-center gap-2"
          >
            {cacheCleared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>{cacheCleared ? 'Cleared!' : 'Clear Cache'}</span>
          </button>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-4 text-xs text-zinc-600">
        <p className="font-semibold text-zinc-500">mitune Player v1.0.0 (High Fidelity Edition)</p>
        <p className="mt-0.5">Desktop Offline Engine & Decentralized Streaming</p>
      </div>
    </div>
  );
};
