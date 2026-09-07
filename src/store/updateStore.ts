import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { inAppUpdateEngine, UpdateDownloadProgress, FALLBACK_APK_URL } from '../services/updates/inAppUpdateEngine';
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
  apkDownloadUrl: string;
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
      currentVersion: '2.7.0',
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '🚀 Release v2.8.2: Major AstroGuru Platform Upgrade',
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
      totalBytes: 38 * 1024 * 1024,
      speedKbps: 0,
      isDownloading: false,
      isReadyToInstall: false,
      isChecking: false,
      lastCheckedTime: null,
      downloadedPackageUri: null,
      updateType: 'apk',
      apkDownloadUrl: FALLBACK_APK_URL,

      autoCheckAndFetchOnStartup: async () => {
        try {
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, get().apkDownloadUrl);
        } catch (_) {}

        // Safe background check without interrupting the user
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
              apkDownloadUrl: remoteMeta.apkUrl || FALLBACK_APK_URL,
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
        set({ isDownloading: true, downloadProgress: 0, isReadyToInstall: false });

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
            },
            get().apkDownloadUrl
          );

          set({
            isDownloading: false,
            downloadProgress: 100,
            isReadyToInstall: true,
            downloadedPackageUri: result.localUri || null,
            updateType: result.type,
          });

          // Automatically trigger installer as soon as download reaches 100%
          setTimeout(() => {
            get().installUpdate();
          }, 400);
        } catch (err: any) {
          set({ isDownloading: false });
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri, apkDownloadUrl } = get();
        try {
          await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined, apkDownloadUrl);
        } catch (err) {
          console.warn('[Install Update Error]', err);
        }
      },

      downloadDirectApk: async () => {
        const { apkDownloadUrl } = get();
        await inAppUpdateEngine.openDirectBrowserDownload(apkDownloadUrl);
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