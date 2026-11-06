type YTStateCallback = (state: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
}) => void;

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

class YouTubePlayerService {
  private player: any = null;
  private isReady = false;
  private isBuffering = false;
  private isPlaying = false;
  private currentVideoId: string | null = null;
  private timer: any = null;
  private callbacks: Set<YTStateCallback> = new Set();
  private onEndedCallback: (() => void) | null = null;
  private pendingVideoId: string | null = null;

  constructor() {
    this.init();
  }

  public init() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.createPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.createPlayer();
      };
    }
  }

  private createPlayer() {
    const container = document.getElementById('youtube-player-element');
    if (!container || this.player) return;

    try {
      this.player = new window.YT.Player('youtube-player-element', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.isReady = true;
            if (this.pendingVideoId) {
              this.loadTrack(this.pendingVideoId);
              this.pendingVideoId = null;
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            const state = event.data;
            if (state === 1) {
              this.isPlaying = true;
              this.isBuffering = false;
              this.startTicker();
            } else if (state === 2) {
              this.isPlaying = false;
              this.isBuffering = false;
              this.stopTicker();
            } else if (state === 3) {
              this.isBuffering = true;
            } else if (state === 0) {
              this.isPlaying = false;
              this.isBuffering = false;
              this.stopTicker();
              if (this.onEndedCallback) {
                this.onEndedCallback();
              }
            }
            this.notify();
          },
          onError: (err: any) => {
            console.warn('YouTube Player error:', err);
            this.isBuffering = false;
            this.notify();
          },
        },
      });
    } catch (e) {
      console.warn('Error creating YT.Player:', e);
    }
  }

  private startTicker() {
    this.stopTicker();
    this.timer = setInterval(() => {
      this.notify();
    }, 250);
  }

  private stopTicker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async loadTrack(videoId: string) {
    this.currentVideoId = videoId;
    if (!this.player || !this.isReady) {
      this.pendingVideoId = videoId;
      this.createPlayer();
      return;
    }

    try {
      this.isBuffering = true;
      this.notify();
      this.player.loadVideoById({
        videoId,
        startSeconds: 0,
      });
      this.player.playVideo();
    } catch (e) {
      console.error('Error loading YouTube video:', e);
      this.isBuffering = false;
      this.notify();
    }
  }

  public play() {
    if (this.player && this.isReady) {
      try {
        this.player.playVideo();
      } catch (e) {
        console.error(e);
      }
    }
  }

  public pause() {
    if (this.player && this.isReady) {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.error(e);
      }
    }
  }

  public seek(seconds: number) {
    if (this.player && this.isReady) {
      try {
        this.player.seekTo(seconds, true);
        this.notify();
      } catch (e) {
        console.error(e);
      }
    }
  }

  public setVolume(volume: number) {
    if (this.player && this.isReady) {
      try {
        // YT expects 0 - 100
        this.player.setVolume(Math.round(volume * 100));
      } catch (e) {
        console.error(e);
      }
    }
  }

  public onEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }

  public subscribe(callback: YTStateCallback): () => void {
    this.callbacks.add(callback);
    this.notify();
    return () => this.callbacks.delete(callback);
  }

  public stop() {
    if (this.player && this.isReady) {
      try {
        this.player.stopVideo();
      } catch {}
    }
    this.stopTicker();
    this.isPlaying = false;
    this.isBuffering = false;
    this.notify();
  }

  private notify() {
    let currentTime = 0;
    let duration = 0;

    if (this.player && this.isReady) {
      try {
        currentTime = this.player.getCurrentTime() || 0;
        duration = this.player.getDuration() || 0;
      } catch {}
    }

    const state = {
      currentTime,
      duration,
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
    };

    this.callbacks.forEach((cb) => cb(state));
  }
}

export const youtubePlayerService = new YouTubePlayerService();
