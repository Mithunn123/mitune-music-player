import React, { useState } from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BANDS = [
  { label: '60 Hz', sub: 'Sub-bass' },
  { label: '250 Hz', sub: 'Bass' },
  { label: '1 kHz', sub: 'Midrange' },
  { label: '4 kHz', sub: 'Upper-mids' },
  { label: '14 kHz', sub: 'Treble' },
];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 1, 0, -1],
  Vocal: [-2, 1, 4, 3, 1],
  Electronic: [5, 3, 0, 2, 4],
  Rock: [4, 2, -1, 2, 4],
};

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const { setEqualizerBand } = useAudio();
  const [bandValues, setBandValues] = useState<number[]>([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState<string>('Flat');

  if (!isOpen) return null;

  const handleSliderChange = (index: number, val: number) => {
    const updated = [...bandValues];
    updated[index] = val;
    setBandValues(updated);
    setActivePreset('Custom');
    setEqualizerBand(index, val);
  };

  const applyPreset = (name: string) => {
    const preset = PRESETS[name];
    if (preset) {
      setBandValues([...preset]);
      setActivePreset(name);
      preset.forEach((val, idx) => setEqualizerBand(idx, val));
    }
  };

  const handleReset = () => {
    applyPreset('Flat');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">5-Band Audio Equalizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              EQ Presets
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((pName) => (
              <button
                key={pName}
                onClick={() => applyPreset(pName)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activePreset === pName
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {pName}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="p-6">
          <div className="flex justify-between items-center h-48 px-4">
            {BANDS.map((band, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-between">
                <span className="text-[11px] font-mono text-zinc-400">
                  {bandValues[idx] > 0 ? `+${bandValues[idx]}` : bandValues[idx]}dB
                </span>
                <div className="relative h-28 flex items-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={bandValues[idx]}
                    onChange={(e) => handleSliderChange(idx, parseFloat(e.target.value))}
                    className="h-28 w-1.5 appearance-none bg-zinc-800 rounded-full outline-none accent-indigo-500 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-semibold text-zinc-200">{band.label}</p>
                  <p className="text-[10px] text-zinc-500">{band.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
