import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inAppUpdateEngine, UpdateDownloadProgress, LIVE_DIRECT_APK_URL } from '../services/updates/inAppUpdateEngine';
import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.8.6';

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
  downloadUrl: string | null;
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
        '🚀 Release v2.8.3: Standalone Android APK Build',
        '🛡️ Crash-Proof RashiChakra with Dynamic OpenGL Engine & 2D Celestial Fallback',
        '🎮 Navagraha Chakra (Spin & Win Wheel) with Real Cash & Voucher Rewards',
        '🃏 Daily 3D Tarot Guidance with Card Flip & Affirmations',
        '💳 AstroGold Luxury Metal Card & 1-Tap UPI Recharge Suite',
        '⚡ Zero-Drop Live Consultation Auto-Recharge Drawer',
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
      downloadUrl: null,

      autoCheckAndFetchOnStartup: async () => {
        try {
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, LIVE_DIRECT_APK_URL);
        } catch (_) {}

        if (Platform.OS === 'web') {
          set({
            currentVersion: LATEST_RELEASE_VERSION,
            latestVersion: LATEST_RELEASE_VERSION,
            updateAvailable: false,
            isReadyToInstall: false,
          });
          return;
        }

        // Automatic GitHub Release Check on Startup
        try {
          const currentVer = get().currentVersion;
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          if (result.isAvailable) {
            set({
              updateAvailable: true,
              latestVersion: result.latestVersion,
              releaseNotes: result.releaseNotes,
              isMandatory: result.isMandatory,
              updateType: result.type,
              downloadUrl: result.downloadUrl || null,
              lastCheckedTime: new Date().toISOString(),
            });
            return;
          }
        } catch (e) {
          console.warn('[UpdateStore Startup GitHub Check]', e);
        }

        // Pre-fetch OTA update in background safely
        if (Updates.isEnabled) {
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
            downloadUrl: result.downloadUrl || null,
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
        set({ updateAvailable: true, latestVersion: LATEST_RELEASE_VERSION });
      },

      startDownload: async () => {
        if (get().isDownloading) return;
        set({ isDownloading: true, downloadProgress: 0, downloadedPackageUri: null });

        try {
          const apkUrl = get().downloadUrl || LIVE_DIRECT_APK_URL;
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
            apkUrl
          );

          if (result && result.success && result.localUri) {
            set({
              isDownloading: false,
              downloadProgress: 100,
              isReadyToInstall: true,
              downloadedPackageUri: result.localUri,
            });

            // Automatically launch Android package installer
            if (Platform.OS === 'android') {
              await inAppUpdateEngine.installDownloadedPackage(result.localUri, apkUrl);
            }
          } else {
            // Direct browser fallback if local download stream was interrupted
            set({ isDownloading: false, downloadProgress: 0 });
            await inAppUpdateEngine.openDirectBrowserDownload(apkUrl);
          }
        } catch (err: any) {
          console.warn('[UpdateStore Download Error]', err);
          set({ isDownloading: false });
          const apkUrl = get().downloadUrl || LIVE_DIRECT_APK_URL;
          await inAppUpdateEngine.openDirectBrowserDownload(apkUrl);
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri, downloadUrl } = get();
        try {
          await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined, downloadUrl || undefined);
        } catch (err) {
          console.warn('[Install Update Error]', err);
        }
      },

      downloadDirectApk: async () => {
        const { downloadUrl } = get();
        await inAppUpdateEngine.openDirectBrowserDownload(downloadUrl || undefined);
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