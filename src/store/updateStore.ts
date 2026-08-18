import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { inAppUpdateEngine, UpdateDownloadProgress, LIVE_DIRECT_APK_URL } from '../services/updates/inAppUpdateEngine';
import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.8.2';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string[];
  downloadProgress: number;
  downloadedBytes: number;
  totalBytes: number;
  speedKbps: number;
  isDownloading: boolean;
  isReadyToInstall: boolean;
  isChecking: boolean;
  lastCheckedTime: string | null;
  downloadedPackageUri: string | null;
  updateType: 'apk' | 'ota';
}

interface UpdateState extends UpdateInfo {
  checkForUpdates: () => Promise<{ isNewAvailable: boolean; currentVersion: string; latestVersion: string }>;
  autoCheckAndFetchOnStartup: () => Promise<void>;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  triggerUpdateModal: () => void;
  startDownload: () => Promise<void>;
  installUpdate: () => Promise<void>;
  downloadDirectApk: () => Promise<void>;
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
        '🚀 Release v2.8.2: Major AstroGuru Upgrade',
        '💳 AstroGold Luxury Metal Card & 1-Tap UPI Wallet Recharge',
        '🔥 Cosmic Retention Streak & 7-Day Astro-Coin Check-in Track',
        '🎡 6-Segment Navagraha Spin & Win Chakra (Instant Cash & Vouchers)',
        '🃏 Daily Mystical Tarot Guidance with 3D Flip Card & Affirmations',
        '🪔 Sacred Sadhana & Remedy Diary with Real-Time Streak Tracker',
        '⚡ Zero-Drop Live Consultation Auto-Recharge Drawer',
        '📦 Direct Native In-App APK Downloader & Package Installer',
      ],
      downloadProgress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speedKbps: 0,
      isDownloading: false,
      isReadyToInstall: false,
      isChecking: false,
      lastCheckedTime: null,
      downloadedPackageUri: null,
      updateType: 'apk',

      autoCheckAndFetchOnStartup: async () => {
        try {
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, LIVE_DIRECT_APK_URL);
        } catch (_) {}

        // Pre-fetch OTA update in background safely (No abrupt restart on launch)
        if (Platform.OS !== 'web' && Updates.isEnabled) {
          try {
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
              await Updates.fetchUpdateAsync();
              set({
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
                isReadyToInstall: true,
                updateType: 'ota',
              });
              return;
            }
          } catch (otaErr) {
            console.log('[OTA Startup Note]', otaErr);
          }
        }

        if (Platform.OS === 'web') {
          set({
            currentVersion: LATEST_RELEASE_VERSION,
            latestVersion: LATEST_RELEASE_VERSION,
            updateAvailable: false,
            isReadyToInstall: false,
          });
          return;
        }

        try {
          const remoteMeta = await getAppVersionFromFirebase();
          if (remoteMeta && remoteMeta.latestVersion) {
            set({
              latestVersion: remoteMeta.latestVersion || LATEST_RELEASE_VERSION,
              releaseNotes: remoteMeta.releaseNotes || get().releaseNotes,
            });
          }
        } catch (e) {
          console.warn('[UpdateStore Startup Check]', e);
        }
      },

      checkForUpdates: async () => {
        set({ isChecking: true });

        // Check EAS OTA first
        if (Platform.OS !== 'web' && Updates.isEnabled) {
          try {
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
              await Updates.fetchUpdateAsync();
              set({
                isChecking: false,
                updateAvailable: true,
                latestVersion: LATEST_RELEASE_VERSION,
                isReadyToInstall: true,
                updateType: 'ota',
                lastCheckedTime: new Date().toISOString(),
              });
              return { isNewAvailable: true, currentVersion: get().currentVersion, latestVersion: LATEST_RELEASE_VERSION };
            }
          } catch (e) {}
        }

        const currentVer = get().currentVersion;
        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          set({
            isChecking: false,
            updateAvailable: true,
            latestVersion: result.latestVersion,
            releaseNotes: result.releaseNotes,
            isMandatory: result.isMandatory,
            updateType: result.type,
            lastCheckedTime: new Date().toISOString(),
          });
          return {
            isNewAvailable: true,
            currentVersion: currentVer,
            latestVersion: result.latestVersion,
          };
        } catch (e) {
          set({ isChecking: false, updateAvailable: true });
          return {
            isNewAvailable: true,
            currentVersion: currentVer,
            latestVersion: LATEST_RELEASE_VERSION,
          };
        }
      },

      broadcastUpdate: (newVer, notes, mandatory = false) => {
        set({
          latestVersion: newVer,
          releaseNotes: notes,
          isMandatory: mandatory,
          updateAvailable: true,
          isReadyToInstall: false,
        });
      },

      triggerUpdateModal: () => {
        set({ updateAvailable: true, latestVersion: LATEST_RELEASE_VERSION });
      },

      startDownload: async () => {
        if (get().isDownloading) return;
        set({ isDownloading: true, downloadProgress: 0 });

        try {
          const result = await inAppUpdateEngine.downloadUpdatePackage(
            get().latestVersion,
            (progress: UpdateDownloadProgress) => {
              set({
                downloadProgress: progress.percentage,
                downloadedBytes: progress.downloadedBytes,
                totalBytes: progress.totalBytes,
                speedKbps: progress.speedKbps || 0,
              });
            }
          );

          set({
            isDownloading: false,
            downloadProgress: 100,
            isReadyToInstall: result.success,
            downloadedPackageUri: result.localUri || null,
          });
        } catch (err: any) {
          set({ isDownloading: false });
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri } = get();
        try {
          await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined);
          set({ updateAvailable: false, isReadyToInstall: false });
        } catch (err) {
          console.warn('[Install Update Error]', err);
        }
      },

      downloadDirectApk: async () => {
        await inAppUpdateEngine.openDirectBrowserDownload();
      },

      dismissUpdate: () => {
        if (!get().isMandatory) {
          set({ updateAvailable: false });
        }
      },
    }),
    {
      name: 'astroguru_update_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);