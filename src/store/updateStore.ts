import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inAppUpdateEngine, UpdateDownloadProgress } from '../services/updates/inAppUpdateEngine';
import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.8.0';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string[];
  downloadProgress: number; // 0 to 100
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
        '🚀 Release v2.8.0: Major AstroGuru Platform Upgrade',
        '🔥 Cosmic Streak & 7-Day Progressive Astro-Coin Check-in Pathway',
        '🎡 Interactive Navagraha Spin & Win Chakra (Instant Cash, Vouchers & Coins)',
        '🃏 Daily Mystical Tarot Guidance with 3D Flip Card & Affirmations',
        '🪔 Cosmic Remedy & Sadhana Diary with Real-Time Streak Tracker',
        '⚡ 1-Tap In-Session Wallet Auto-Recharge Drawer (No Call Drops)',
        '📦 Native Expo-Sharing Package Installer for Reliable In-App APK Installs',
        '📞 Enhanced Real-Time Consultation Ringing Modal with Multi-Alias Sync',
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
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes);
        } catch (_) {}

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
          const currentVer = get().currentVersion;
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          if (result.isAvailable) {
            set({
              updateAvailable: true,
              latestVersion: result.latestVersion,
              releaseNotes: result.releaseNotes,
              isMandatory: result.isMandatory,
              isReadyToInstall: false,
              downloadProgress: 0,
              updateType: result.type,
              lastCheckedTime: new Date().toISOString(),
            });
          }

          const remoteMeta = await getAppVersionFromFirebase();
          if (remoteMeta && remoteMeta.latestVersion) {
            if (currentVer !== remoteMeta.latestVersion) {
              set({
                updateAvailable: true,
                latestVersion: remoteMeta.latestVersion,
                releaseNotes: remoteMeta.releaseNotes || get().releaseNotes,
                isReadyToInstall: true,
                downloadProgress: 100,
              });
            }
          }
        } catch (e) {
          console.warn('[UpdateStore Startup Check]', e);
        }
      },

      checkForUpdates: async () => {
        set({ isChecking: true });
        const currentVer = get().currentVersion;
        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          set({
            isChecking: false,
            updateAvailable: result.isAvailable,
            latestVersion: result.latestVersion,
            releaseNotes: result.releaseNotes,
            isMandatory: result.isMandatory,
            updateType: result.type,
            lastCheckedTime: new Date().toISOString(),
          });
          return {
            isNewAvailable: result.isAvailable,
            currentVersion: currentVer,
            latestVersion: result.latestVersion,
          };
        } catch (e) {
          set({ isChecking: false });
          return {
            isNewAvailable: false,
            currentVersion: currentVer,
            latestVersion: currentVer,
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
        set({ updateAvailable: true });
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