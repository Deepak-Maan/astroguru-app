import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

const LATEST_RELEASE_VERSION = '2.7.2';

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
        '⚡ Release v2.7.2: 1-Tap In-Session Wallet Auto-Recharge Drawer (no call drops)',
        '📦 Native Expo-Sharing Package Installer for 100% reliable In-App APK installation',
        '🔮 Enhanced Astrologer Quick Chat Vedic Actions, Lal Kitab Totke & Seeker Kundli Drawer',
        '🔔 Real-Time Audio & Video Call Push Alerts & Multi-Alias Ringing Modal',
      ],
      downloadProgress: 100,
      isDownloading: false,
      isReadyToInstall: false,

      autoCheckAndFetchOnStartup: async () => {
        // Sync latest version metadata to Firebase Realtime DB
        syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes);

        // On Web, app updates automatically on bundle reload
        if (Platform.OS === 'web') {
          set({
            currentVersion: LATEST_RELEASE_VERSION,
            latestVersion: LATEST_RELEASE_VERSION,
            updateAvailable: false,
            isReadyToInstall: false,
            downloadProgress: 0,
          });
          return;
        }

        try {
          // Check for Over-The-Air EAS updates
          if (Updates.isEnabled) {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
              set({
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
                isDownloading: true,
                downloadProgress: 45,
              });
              await Updates.fetchUpdateAsync();
              set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
              return;
            }
          }

          // Check Firebase remote metadata
          const remoteMeta = await getAppVersionFromFirebase();
          if (remoteMeta && remoteMeta.latestVersion) {
            const currentVer = get().currentVersion;
            if (currentVer !== remoteMeta.latestVersion) {
              set({
                updateAvailable: true,
                latestVersion: remoteMeta.latestVersion,
                releaseNotes: remoteMeta.releaseNotes || get().releaseNotes,
                isReadyToInstall: true,
                downloadProgress: 100,
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[Auto Update Check Warning]', e);
        }

        set({
          currentVersion: LATEST_RELEASE_VERSION,
          latestVersion: LATEST_RELEASE_VERSION,
          updateAvailable: false,
          isReadyToInstall: false,
          downloadProgress: 0,
        });
      },

      checkForUpdates: async () => {
        const currentVersion = get().currentVersion || '2.6.7';

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

          const remoteMeta = await getAppVersionFromFirebase();
          const targetVer = remoteMeta?.latestVersion || LATEST_RELEASE_VERSION;

          if (currentVersion !== targetVer) {
            set({
              updateAvailable: true,
              latestVersion: targetVer,
              isReadyToInstall: true,
              downloadProgress: 100,
            });
            return { isNewAvailable: true, currentVersion, latestVersion: targetVer };
          }
        } catch (e) {
          console.warn('[Expo Updates Check Warning]', e);
        }

        return { isNewAvailable: false, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
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
