import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { ApiClient } from '../services/apiClient';

const APP_VERSION = Constants.expoConfig?.version || '1.4.0';
const LATEST_RELEASE_VERSION = '1.4.0';

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
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: true,
      isMandatory: false,
      releaseNotes: [
        '✨ Theme 4 Cyber-Vedic Emerald & Obsidian Dark Mode UI',
        '📐 Sleek 195px Proportional 3D RashiChakra Hero Card',
        '📱 Native Mobile UPI App Deep-Link Launcher (GPay, PhonePe, Paytm)',
        '🌐 1-Tap Google Sign-In Mobile APK Compatibility',
        '⚡ 1-Click Fast OTA App Update System (v1.4.0)',
      ],
      downloadProgress: 0,
      isDownloading: false,
      isReadyToInstall: false,

      checkForUpdates: async () => {
        const currentVersion = get().currentVersion || '1.0.0';

        // 1. Check real Expo OTA Updates API (Standalone / Mobile Builds)
        try {
          if (Updates.isEnabled) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              set({
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
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
              latestVersion: latestVersion || LATEST_RELEASE_VERSION,
              releaseNotes: releaseNotes || get().releaseNotes,
              isMandatory: !!isMandatory,
              updateAvailable: isNewAvailable,
            });
            return { isNewAvailable, currentVersion, latestVersion: latestVersion || LATEST_RELEASE_VERSION };
          }
        } catch (err) {}

        const isNewAvailable = currentVersion !== LATEST_RELEASE_VERSION;
        set({ updateAvailable: isNewAvailable, latestVersion: LATEST_RELEASE_VERSION });
        return { isNewAvailable, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
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
        set({ isDownloading: true, downloadProgress: 20 });

        // Attempt fetching real Expo OTA update bundle
        try {
          if (Updates.isEnabled) {
            set({ downloadProgress: 60 });
            await Updates.fetchUpdateAsync();
            set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
            return;
          }
        } catch (e) {
          console.warn('[Expo Updates Fetch Exception]', e);
        }

        // Fallback smooth progress indicator for web / dev / instant updates
        let progress = 35;
        const interval = setInterval(() => {
          progress += 35;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
          } else {
            set({ downloadProgress: progress });
          }
        }, 250);
      },

      installUpdate: async () => {
        const { latestVersion } = get();

        // Attempt reloading with native Expo Updates package
        try {
          if (Updates.isEnabled) {
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
