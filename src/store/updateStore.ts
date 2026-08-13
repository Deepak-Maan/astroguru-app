import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

const LATEST_RELEASE_VERSION = '2.6.9';

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
  autoCheckAndFetchOnStartup: () => Promise<void>;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  triggerUpdateModal: () => void;
  startDownload: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      currentVersion: LATEST_RELEASE_VERSION,
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '✨ Release v2.6.9: Real-time Audio & Video Call System',
        '🔔 Native Android & iOS Status Bar Push Notifications',
        '🪔 Instant Acharya Ringing Modal & Live WebRTC Stream',
        '⚡ Strict Single Message Dispatch & Duplicate Prevention',
      ],
      downloadProgress: 100,
      isDownloading: false,
      isReadyToInstall: false,

      autoCheckAndFetchOnStartup: async () => {
        // Automatically sync current version to latest release version
        set({
          currentVersion: LATEST_RELEASE_VERSION,
          latestVersion: LATEST_RELEASE_VERSION,
        });

        // On Web, app updates automatically on bundle reload
        if (Platform.OS === 'web') {
          set({
            updateAvailable: false,
            isReadyToInstall: false,
            downloadProgress: 0,
          });
          return;
        }

        const currentVersion = get().currentVersion || '2.0.0';

        try {
          if (Updates.isEnabled) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              set({
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
                isDownloading: true,
              });
              await Updates.fetchUpdateAsync();
              set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
              return;
            }
          }
        } catch (e) {
          console.warn('[Auto Update Check Warning]', e);
        }

        if (currentVersion !== LATEST_RELEASE_VERSION) {
          set({ updateAvailable: true, latestVersion: LATEST_RELEASE_VERSION, isReadyToInstall: true, downloadProgress: 100 });
        } else {
          set({ updateAvailable: false, isReadyToInstall: false, downloadProgress: 0 });
        }
      },

      checkForUpdates: async () => {
        const currentVersion = get().currentVersion || '1.5.0';

        try {
          if (Updates.isEnabled) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              set({
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
                isReadyToInstall: true,
                downloadProgress: 100,
              });
              return { isNewAvailable: true, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
            }
          }
        } catch (e) {
          console.warn('[Expo Updates Check Warning]', e);
        }

        const isNewAvailable = currentVersion !== LATEST_RELEASE_VERSION;
        if (isNewAvailable) {
          set({
            updateAvailable: true,
            latestVersion: LATEST_RELEASE_VERSION,
            isReadyToInstall: true,
            downloadProgress: 100,
          });
          return { isNewAvailable: true, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
        } else {
          set({
            updateAvailable: true,
            latestVersion: LATEST_RELEASE_VERSION,
            isReadyToInstall: true,
            downloadProgress: 100,
          });
          return { isNewAvailable: true, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
        }
      },

      triggerUpdateModal: () => {
        set({
          latestVersion: LATEST_RELEASE_VERSION,
          updateAvailable: true,
          isReadyToInstall: true,
          downloadProgress: 100,
        });
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
        set({ isDownloading: true, downloadProgress: 50 });

        try {
          if (Updates.isEnabled) {
            await Updates.fetchUpdateAsync();
          }
        } catch (e) {
          console.warn('[Expo Updates Fetch Exception]', e);
        }

        set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
      },

      installUpdate: async () => {
        set({
          currentVersion: LATEST_RELEASE_VERSION,
          latestVersion: LATEST_RELEASE_VERSION,
          updateAvailable: false,
          isDownloading: false,
          isReadyToInstall: false,
          downloadProgress: 0,
        });

        try {
          if (Updates.isEnabled) {
            await Updates.reloadAsync();
            return;
          }
        } catch (e) {
          console.warn('[Expo Updates Reload Exception]', e);
        }
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
