import { ipc } from '../types/ipc';

class AudioService {
  private audioContext: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async loadTrack(arrayBuffer: ArrayBuffer) {
    if (!this.audioContext) return;
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async play() {
    if (!this.audioContext || !this.buffer || this.isPlaying) return;

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;

    this.gainNode = this.audioContext.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.source.start(0, this.pauseTime);
    this.startTime = this.audioContext.currentTime - this.pauseTime;
    this.isPlaying = true;

    await ipc.player.play();
  }

  pause() {
    if (!this.source || !this.isPlaying) return;

    this.source.stop();
    this.pauseTime = this.audioContext!.currentTime - this.startTime;
    this.isPlaying = false;

    ipc.player.pause();
  }

  seek(time: number) {
    if (this.isPlaying) {
      this.pause();
      this.pauseTime = time;
      this.play();
    } else {
      this.pauseTime = time;
    }

    ipc.player.seek(time);
  }

  setVolume(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }
}

export const audioService = new AudioService();
