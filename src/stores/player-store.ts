import { create } from "zustand";

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  isPiP: boolean;
  playbackRate: number;
  videoId: string | null;
  setPlaying: (playing: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setPiP: (pip: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setVideoId: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  isMuted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isFullscreen: false,
  isPiP: false,
  playbackRate: 1,
  videoId: null,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setMuted: (muted) => set({ isMuted: muted }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setPiP: (pip) => set({ isPiP: pip }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVideoId: (id) => set({ videoId: id }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
}));
