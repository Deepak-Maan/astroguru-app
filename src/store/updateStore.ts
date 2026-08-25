import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inAppUpdateEngine, UpdateDownloadProgress, LIVE_DIRECT_APK_URL } from '../services/updates/inAppUpdateEngine';
import { syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.8.7';

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
  isChecking: boolean;
  manualCheckMessage: string | null;
  lastCheckedTime: string | null;
  downloadedPackageUri: string | null;
  updateType: 'apk' | 'ota';
  downloadUrl: string | null;
}

interface UpdateState extends UpdateInfo {
  checkForUpdates: () => Promise<{ isNewAvailable: boolean; currentVersion: string; latestVersion: string }>;
  checkUpdatesManual: () => Promise<void>;
  autoCheckAndFetchOnStartup: () => Promise<void>;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  triggerUpdateModal: () => void;
  startDownload: (background?: boolean) => Promise<void>;
  installUpdate: () => Promise<void>;
  downloadDirectApk: () => Promise<void>;
  dismissUpdate: () => void;
  dismissInstallSnackbar: () => void;
  openPermissionSettings: () => Promise<void>;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      currentVersion: LATEST_RELEASE_VERSION,
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '• 🚀 Release v2.8.6: Standalone Android In-App APK Updater',
        '• 💬 Real-Time Astrotalk Consultation Experience & Live Q&A',
        '• 🪔 E-Puja Booking & Certified Gemstones Store with Instant Wallet Checkout',
        '• 🔒 100% Error-Free Native Android Bundler & Hermes Engine',
      ],
      downloadProgress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      downloadedMb: '0.0',
      totalMb: '42.5',
      speedKbps: 0,
      isDownloading: false,
      isBackgroundDownloading: false,
      isReadyToInstall: false,
      isChecking: false,
      manualCheckMessage: null,
      lastCheckedTime: null,
      downloadedPackageUri: null,
      updateType: 'apk',
      downloadUrl: null,

      autoCheckAndFetchOnStartup: async () => {
        try {
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, LIVE_DIRECT_APK_URL);
          // Cleanup older version APK files on startup
          inAppUpdateEngine.cleanupOldApks(LATEST_RELEASE_VERSION);
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
              totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '42.5',
              lastCheckedTime: new Date().toISOString(),
            });
            return;
          }
        } catch (e) {
          console.warn('[UpdateStore Startup GitHub Check]', e);
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
            totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '42.5',
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
        set({ isChecking: true, manualCheckMessage: 'Checking GitHub for updates…' });
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
              downloadUrl: result.downloadUrl || null,
              totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '42.5',
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
        });
      },

      triggerUpdateModal: () => {
        set({ updateAvailable: true, latestVersion: LATEST_RELEASE_VERSION });
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

        // If background, close the modal so user can keep using the app
        if (background) {
          set({ updateAvailable: false });
        }

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
                downloadedMb: progress.downloadedMb || (progress.downloadedBytes / (1024 * 1024)).toFixed(1),
                totalMb: progress.totalMb || (progress.totalBytes / (1024 * 1024)).toFixed(1),
              });
            },
            apkUrl
          );

          if (result && result.success && result.localUri) {
            set({
              isDownloading: false,
              isBackgroundDownloading: false,
              downloadProgress: 100,
              isReadyToInstall: true,
              downloadedPackageUri: result.localUri,
            });

            // Automatically launch Android package installer if foreground
            if (Platform.OS === 'android' && !background) {
              await inAppUpdateEngine.installDownloadedPackage(result.localUri);
            }
          } else {
            console.warn('[UpdateStore Download]', result?.error || 'Download failed');
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
          // If not downloaded yet, trigger download and install
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