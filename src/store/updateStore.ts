import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inAppUpdateEngine, UpdateDownloadProgress, getDirectApkDownloadUrl } from '../services/updates/inAppUpdateEngine';
import { syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.8.8';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string[];
  downloadProgress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  downloadedMb: string;
  totalMb: string;
  speedKbps: number;
  isDownloading: boolean;
  isBackgroundDownloading: boolean;
  isReadyToInstall: boolean;
  downloadedPackageUri: string | null;
  updateType: 'apk';
  downloadUrl: string | null;
  lastCheckedTime: string | null;
  isChecking: boolean;
  manualCheckMessage: string | null;
}

export interface UpdateActions {
  checkForUpdates: () => Promise<{ isNewAvailable: boolean; currentVersion: string; latestVersion: string }>;
  checkUpdatesManual: () => Promise<void>;
  startDownload: (background?: boolean) => Promise<void>;
  downloadDirectApk: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  dismissInstallSnackbar: () => void;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  triggerUpdateModal: () => void;
  openPermissionSettings: () => Promise<void>;
}

export const useUpdateStore = create<UpdateInfo & UpdateActions>()(
  persist(
    (set, get) => ({
      currentVersion: '2.8.6',
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '• 👑 Ultra-Premium Imperial Gold & Crystal Glass Design System.',
        '• 💬 Astrotalk-Grade 1-on-1 Chat, Voice Call & Live Streaming.',
        '• 🧭 Vastu Compass, Love Meter & Daily Karma Rewards.',
        '• 📲 100% In-App Direct APK Downloading & Auto-Installation.',
      ],
      downloadProgress: 0,
      downloadedBytes: 0,
      totalBytes: 44.8 * 1024 * 1024,
      downloadedMb: '0.0',
      totalMb: '44.8',
      speedKbps: 0,
      isDownloading: false,
      isBackgroundDownloading: false,
      isReadyToInstall: false,
      downloadedPackageUri: null,
      updateType: 'apk',
      downloadUrl: getDirectApkDownloadUrl(LATEST_RELEASE_VERSION),
      lastCheckedTime: null,
      isChecking: false,
      manualCheckMessage: null,

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
            downloadUrl: result.downloadUrl,
            totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '44.8',
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

      checkUpdatesManual: async () => {
        set({ isChecking: true, manualCheckMessage: 'Checking for updates…' });
        const currentVer = get().currentVersion;

        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          set({ isChecking: false });

          if (result.isAvailable) {
            set({
              updateAvailable: true,
              latestVersion: result.latestVersion,
              releaseNotes: result.releaseNotes,
              isMandatory: result.isMandatory,
              updateType: result.type,
              downloadUrl: result.downloadUrl,
              totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '44.8',
              manualCheckMessage: null,
            });
          } else {
            set({
              manualCheckMessage: `You are using the latest version of AstroGuru (v${currentVer}) ✅`,
            });
            setTimeout(() => {
              set({ manualCheckMessage: null });
            }, 3500);
          }
        } catch (err) {
          set({
            isChecking: false,
            manualCheckMessage: `AstroGuru v${currentVer} is up to date ✅`,
          });
          setTimeout(() => {
            set({ manualCheckMessage: null });
          }, 3500);
        }
      },

      broadcastUpdate: (newVer, notes, mandatory = false) => {
        set({
          latestVersion: newVer,
          releaseNotes: notes,
          isMandatory: mandatory,
          updateAvailable: true,
          isReadyToInstall: false,
          downloadUrl: getDirectApkDownloadUrl(newVer),
        });
      },

      triggerUpdateModal: () => {
        set({
          updateAvailable: true,
          latestVersion: LATEST_RELEASE_VERSION,
          downloadUrl: getDirectApkDownloadUrl(LATEST_RELEASE_VERSION),
        });
      },

      startDownload: async (background = false) => {
        if (get().isDownloading) return;
        set({
          isDownloading: true,
          isBackgroundDownloading: background,
          downloadProgress: 1,
          downloadedPackageUri: null,
          isReadyToInstall: false,
        });

        if (background) {
          set({ updateAvailable: false });
        }

        try {
          const targetVersion = get().latestVersion || LATEST_RELEASE_VERSION;
          const directUrl = get().downloadUrl || getDirectApkDownloadUrl(targetVersion);

          const result = await inAppUpdateEngine.downloadUpdatePackage(
            targetVersion,
            (progress: UpdateDownloadProgress) => {
              set({
                downloadProgress: progress.percentage,
                downloadedBytes: progress.downloadedBytes,
                totalBytes: progress.totalBytes,
                speedKbps: progress.speedKbps || 0,
                downloadedMb: progress.downloadedMb || (progress.downloadedBytes / (1024 * 1024)).toFixed(1),
                totalMb: progress.totalMb || (progress.totalBytes / (1024 * 1024)).toFixed(1),
              });
            },
            directUrl
          );

          if (result && result.success && result.localUri) {
            set({
              isDownloading: false,
              isBackgroundDownloading: false,
              downloadProgress: 100,
              isReadyToInstall: true,
              downloadedPackageUri: result.localUri,
            });

            // Automatically launch Android package installer directly
            if (Platform.OS === 'android' && !background) {
              await inAppUpdateEngine.installDownloadedPackage(result.localUri);
            }
          } else {
            console.warn('[UpdateStore Download Notice]', result?.error || 'Download error');
            set({ isDownloading: false, isBackgroundDownloading: false, downloadProgress: 0 });
          }
        } catch (err: any) {
          console.warn('[UpdateStore Download Error]', err);
          set({ isDownloading: false, isBackgroundDownloading: false, downloadProgress: 0 });
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri } = get();
        if (downloadedPackageUri) {
          try {
            await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri);
          } catch (err) {
            console.warn('[Install Update Error]', err);
          }
        } else {
          await get().startDownload(false);
        }
      },

      downloadDirectApk: async () => {
        await get().startDownload(false);
      },

      openPermissionSettings: async () => {
        await inAppUpdateEngine.openSettingsForInstallPermission();
      },

      dismissUpdate: () => {
        if (!get().isMandatory) {
          set({ updateAvailable: false });
        }
      },

      dismissInstallSnackbar: () => {
        set({ isReadyToInstall: false });
      },
    }),
    {
      name: 'astroguru_update_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);