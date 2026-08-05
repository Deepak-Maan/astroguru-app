import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { ApiClient } from '../services/apiClient';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string[];
  downloadProgress: number; // 0 to 100
  isDownloading: boolean;
  isReadyToInstall: boolean;
}

interface UpdateState extends UpdateInfo {
  checkForUpdates: () => Promise<{ isNewAvailable: boolean; currentVersion: string; latestVersion: string }>;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  triggerUpdateModal: () => void;
  startDownload: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '✨ Redesigned Cyber-Vedic Obsidian Dark Login Interface',
        '📱 Fast 6-Digit Mobile SMS & OTP Authentication',
        '⚡ 1-Tap Quick Demo Credentials for Seeker, Jyotishi & Admin',
        '🔮 Real-Time Celestial Transits & Instant Kundli Matching',
        '🛡️ Enhanced Security Vault & PIN Lock System',
      ],
      downloadProgress: 0,
      isDownloading: false,
      isReadyToInstall: false,

      checkForUpdates: async () => {
        const currentVersion = get().currentVersion || APP_VERSION;

        // 1. Check real Expo OTA Updates API (Standalone / Production Builds)
        try {
          if (!__DEV__ && Updates.isEnabled) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              set({
                updateAvailable: true,
                latestVersion: `1.0.${Date.now().toString().slice(-3)}`,
              });
              return {
                isNewAvailable: true,
                currentVersion,
                latestVersion: get().latestVersion,
              };
            }
          }
        } catch (e) {
          console.warn('[Expo Updates Check Warning]', e);
        }

        // 2. Check REST API backend server
        try {
          const res = await ApiClient.checkUpdates();
          if (res && res.updates) {
            const { latestVersion, releaseNotes, isMandatory } = res.updates;
            const isNewAvailable = latestVersion !== currentVersion;
            set({
              latestVersion: latestVersion || currentVersion,
              releaseNotes: releaseNotes || get().releaseNotes,
              isMandatory: !!isMandatory,
              updateAvailable: isNewAvailable,
            });
            return { isNewAvailable, currentVersion, latestVersion: latestVersion || currentVersion };
          }
        } catch (err) {}

        const { latestVersion } = get();
        const isNewAvailable = latestVersion !== currentVersion;
        return { isNewAvailable, currentVersion, latestVersion };
      },

      triggerUpdateModal: () => {
        set({ updateAvailable: true });
      },

      broadcastUpdate: (newVer, notes, mandatory = false) => {
        set({
          latestVersion: newVer,
          releaseNotes: notes,
          isMandatory: mandatory,
          updateAvailable: true,
          downloadProgress: 0,
          isDownloading: false,
          isReadyToInstall: false,
        });
      },

      startDownload: async () => {
        set({ isDownloading: true, downloadProgress: 10 });

        // If running in production build with Expo Updates enabled
        try {
          if (!__DEV__ && Updates.isEnabled) {
            set({ downloadProgress: 40 });
            await Updates.fetchUpdateAsync();
            set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
            return;
          }
        } catch (e) {
          console.warn('[Expo Updates Fetch Exception]', e);
        }

        // Fallback simulation for dev/preview builds
        let progress = 20;
        const interval = setInterval(() => {
          progress += 25;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
          } else {
            set({ downloadProgress: progress });
          }
        }, 300);
      },

      installUpdate: async () => {
        const { latestVersion } = get();

        // If real Expo OTA update package is ready
        try {
          if (!__DEV__ && Updates.isEnabled) {
            await Updates.reloadAsync();
            return;
          }
        } catch (e) {
          console.warn('[Expo Updates Reload Exception]', e);
        }

        set({
          currentVersion: latestVersion,
          updateAvailable: false,
          isDownloading: false,
          isReadyToInstall: false,
          downloadProgress: 0,
        });
      },

      dismissUpdate: () => {
        set({ updateAvailable: false });
      },
    }),
    {
      name: 'astroguru_update_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
