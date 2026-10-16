import { create } from 'zustand';

export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'offline';

interface NetworkQualityState {
  quality: NetworkQuality;
  latencyMs: number;
  isLowBandwidthMode: boolean;
  setQuality: (quality: NetworkQuality, latencyMs: number) => void;
  enableLowBandwidthFallback: () => void;
  disableLowBandwidthFallback: () => void;
  checkConnectionQuality: () => Promise<NetworkQuality>;
}

export const useNetworkQuality = create<NetworkQualityState>((set, get) => ({
  quality: 'excellent',
  latencyMs: 45,
  isLowBandwidthMode: false,

  setQuality: (quality, latencyMs) => {
    const isPoorOrOffline = quality === 'poor' || quality === 'offline';
    set({
      quality,
      latencyMs,
      isLowBandwidthMode: isPoorOrOffline ? true : get().isLowBandwidthMode,
    });
  },

  enableLowBandwidthFallback: () => {
    set({ isLowBandwidthMode: true });
  },

  disableLowBandwidthFallback: () => {
    set({ isLowBandwidthMode: false });
  },

  checkConnectionQuality: async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      set({ quality: 'offline', latencyMs: -1, isLowBandwidthMode: true });
      return 'offline';
    }

    const start = Date.now();
    try {
      // Lightweight 0-byte ping
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;

      let quality: NetworkQuality = 'excellent';
      if (elapsed > 750) {
        quality = 'poor';
      } else if (elapsed > 250) {
        quality = 'good';
      }

      set({
        quality,
        latencyMs: elapsed,
        isLowBandwidthMode: quality === 'poor',
      });
      return quality;
    } catch {
      // Network timed out or failed
      const elapsed = Date.now() - start;
      const quality = elapsed >= 4000 ? 'poor' : 'offline';
      set({
        quality,
        latencyMs: elapsed,
        isLowBandwidthMode: true,
      });
      return quality;
    }
  },
}));
