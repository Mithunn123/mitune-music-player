import { ipc } from '../types/ipc';

type PlaybackStateCallback = (state: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
}) => void;

class AudioService {
  private audioElement: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private equalizerBands: BiquadFilterNode[] = [];

  private isInitialized = false;
  private isBuffering = false;
  private callbacks: Set<PlaybackStateCallback> = new Set();
  private onEndedCallback: (() => void) | null = null;
  private currentUrl = '';
  private corsRetry = false;

  private currentQuality: 'low' | 'normal' | 'high' = 'high';

  // 5-Band EQ Frequencies
  private readonly EQ_FREQS = [60, 250, 1000, 4000, 14000];

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.setupListeners();
  }

  private setupListeners() {
    this.audioElement.addEventListener('timeupdate', () => this.notify());
    this.audioElement.addEventListener('durationchange', () => this.notify());

    this.audioElement.addEventListener('canplay', () => {
      this.isBuffering = false;
      this.notify();
    });

    this.audioElement.addEventListener('play', () => {
      this.isBuffering = false;
      this.notify();
      this.callTauriIPC('play');
    });

    this.audioElement.addEventListener('pause', () => {
      this.notify();
      this.callTauriIPC('pause');
    });

    this.audioElement.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.notify();
    });

    this.audioElement.addEventListener('playing', () => {
      this.isBuffering = false;
      this.notify();
    });

    this.audioElement.addEventListener('ended', () => {
      this.notify();
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    this.audioElement.addEventListener('error', () => {
      // If anonymous CORS failed, retry once cleanly without CORS header
      if (!this.corsRetry && this.currentUrl) {
        console.warn('Audio crossOrigin error, retrying without crossOrigin attribute');
        this.corsRetry = true;
        this.audioElement.removeAttribute('crossorigin');
        this.audioElement.src = this.currentUrl;
        this.audioElement.play().catch(() => {});
        return;
      }
      this.isBuffering = false;
      this.notify();
    });
  }

  private async callTauriIPC(action: string, arg?: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        if (action === 'play') await ipc.player.play();
        if (action === 'pause') await ipc.player.pause();
        if (action === 'seek') await ipc.player.seek(arg);
        if (action === 'volume') await ipc.player.setVolume(arg);
      }
    } catch {
      // IPC silent fallback
    }
  }

  public initWebAudio() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 64;

      // Setup 5-Band Equalizer
      let previousNode: AudioNode = this.sourceNode;
      this.equalizerBands = this.EQ_FREQS.map((freq, index) => {
        const filter = this.audioContext!.createBiquadFilter();
        if (index === 0) filter.type = 'lowshelf';
        else if (index === this.EQ_FREQS.length - 1) filter.type = 'highshelf';
        else filter.type = 'peaking';

        filter.frequency.value = freq;
        filter.gain.value = 0;

        previousNode.connect(filter);
        previousNode = filter;
        return filter;
      });

      previousNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('WebAudio init deferred:', e);
    }
  }

  public async setSource(url: string, autoplay = true) {
    this.currentUrl = url;
    this.corsRetry = false;

    if (!this.isInitialized) {
      this.initWebAudio();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }

    this.isBuffering = true;
    this.audioElement.src = url;
    this.notify();

    if (autoplay) {
      try {
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          await playPromise;
          this.isBuffering = false;
          this.notify();
        }
      } catch (err) {
        console.warn('Autoplay handled', err);
      }
    }
  }

  public async play() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }
    try {
      await this.audioElement.play();
    } catch (e) {
      console.error('Failed to play', e);
    }
  }

  public pause() {
    this.audioElement.pause();
  }

  public seek(seconds: number) {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audioElement.currentTime = seconds;
      this.callTauriIPC('seek', seconds);
      this.notify();
    }
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.gainNode) {
      this.gainNode.gain.value = clamped;
    }
    this.callTauriIPC('volume', clamped);
    this.notify();
  }

  public setEqualizerBand(index: number, gain: number) {
    if (!this.isInitialized) {
      this.initWebAudio();
    }
    const filter = this.equalizerBands[index];
    if (filter) {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        try {
          filter.gain.setValueAtTime(gain, this.audioContext.currentTime);
        } catch {
          filter.gain.value = gain;
        }
      } else {
        filter.gain.value = gain;
      }
    }
  }

  public setAudioQuality(quality: 'low' | 'normal' | 'high', alternateStreamUrl?: string) {
    this.currentQuality = quality;
    if (alternateStreamUrl && alternateStreamUrl !== this.currentUrl) {
      const prevPos = this.audioElement.currentTime;
      const wasPlaying = !this.audioElement.paused && !this.audioElement.ended;
      this.currentUrl = alternateStreamUrl;
      this.audioElement.src = alternateStreamUrl;
      this.audioElement.currentTime = prevPos;
      if (wasPlaying) {
        this.audioElement.play().catch(() => {});
      }
    }
  }

  public getAudioQuality(): 'low' | 'normal' | 'high' {
    return this.currentQuality;
  }

  public getVisualizerData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  public subscribe(callback: PlaybackStateCallback): () => void {
    this.callbacks.add(callback);
    this.notify();
    return () => this.callbacks.delete(callback);
  }

  private notify() {
    const state = {
      currentTime: this.audioElement.currentTime || 0,
      duration: this.audioElement.duration || 0,
      isPlaying: !this.audioElement.paused && !this.audioElement.ended,
      isBuffering: this.isBuffering,
    };
    this.callbacks.forEach((cb) => cb(state));
  }

  public getState() {
    return {
      currentTime: this.audioElement.currentTime || 0,
      duration: this.audioElement.duration || 0,
      isPlaying: !this.audioElement.paused && !this.audioElement.ended,
      isBuffering: this.isBuffering,
      volume: this.audioElement.volume,
    };
  }
}

export const audioService = new AudioService();
