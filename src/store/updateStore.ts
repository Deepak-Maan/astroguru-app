import { Platform, Linking } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { inAppUpdateEngine, UpdateDownloadProgress, getDirectApkDownloadUrl, FALLBACK_RELEASE_APK_URL } from '../services/updates/inAppUpdateEngine';
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
  downloadError: string | null;
}

export interface UpdateActions {
  checkForUpdates: () => Promise<{ isNewAvailable: boolean; currentVersion: string; latestVersion: string }>;
  checkUpdatesManual: () => Promise<void>;
  autoCheckAndFetchOnStartup: () => Promise<void>;
  startDownload: (background?: boolean) => Promise<void>;
  downloadDirectApk: () => Promise<void>;
  openDirectDownloadInBrowser: () => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  dismissInstallSnackbar: () => void;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean, apkUrl?: string) => void;
  triggerUpdateModal: () => void;
  openPermissionSettings: () => Promise<void>;
  clearDownloadError: () => void;
}

const defaultAppVersion = Application.nativeApplicationVersion || '2.8.8';

export const useUpdateStore = create<UpdateInfo & UpdateActions>()(
  persist(
    (set, get) => ({
      currentVersion: defaultAppVersion,
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '• 👑 Ultra-Premium Imperial Gold & Crystal Glass Design System.',
        '• 💬 Astrotalk-Grade 1-on-1 Chat, Voice Call & Live Streaming.',
        '• 🧭 Vastu Compass, Love Meter & Daily Karma Rewards.',
        '• 📲 100% In-App Direct APK Streaming & Auto-Installation.',
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
      downloadUrl: FALLBACK_RELEASE_APK_URL,
      lastCheckedTime: null,
      isChecking: false,
      manualCheckMessage: null,
      downloadError: null,

      autoCheckAndFetchOnStartup: async () => {
        try {
          const currentVer = get().currentVersion || defaultAppVersion;
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          if (result.isAvailable) {
            set({
              updateAvailable: true,
              latestVersion: result.latestVersion,
              releaseNotes: result.releaseNotes,
              isMandatory: result.isMandatory,
              updateType: result.type,
              downloadUrl: result.downloadUrl,
              totalMb: result.apkSizeMb ? result.apkSizeMb.toFixed(1) : '44.8',
              lastCheckedTime: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.log('[UpdateStore autoCheck startup notice]', e);
        }
      },

      checkForUpdates: async () => {
        set({ isChecking: true });
        const currentVer = get().currentVersion || defaultAppVersion;

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
        const currentVer = get().currentVersion || defaultAppVersion;

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
              manualCheckMessage: `You are running the latest version of AstroGuru (v${currentVer}) ✅`,
            });
            setTimeout(() => {
              set({ manualCheckMessage: null });
            }, 4000);
          }
        } catch (err) {
          set({
            isChecking: false,
            manualCheckMessage: `AstroGuru v${currentVer} is up to date ✅`,
          });
          setTimeout(() => {
            set({ manualCheckMessage: null });
          }, 4000);
        }
      },

      broadcastUpdate: (newVer, notes, mandatory = false, customApkUrl?: string) => {
        const finalUrl = customApkUrl || getDirectApkDownloadUrl(newVer);
        set({
          latestVersion: newVer,
          releaseNotes: notes,
          isMandatory: mandatory,
          updateAvailable: true,
          isReadyToInstall: false,
          downloadUrl: finalUrl,
        });

        // Sync to cloud database for all active seeker devices
        try {
          syncLatestAppVersionToFirebase(newVer, notes, finalUrl);
        } catch (_) {}
      },

      triggerUpdateModal: () => {
        const currentVer = Application.nativeApplicationVersion || get().currentVersion || defaultAppVersion;
        const latestVer = get().latestVersion || LATEST_RELEASE_VERSION;

        // If the user is already on the latest version or higher, inform them instead of opening a false update modal
        if (!isRemoteVersionNewer(latestVer, currentVer)) {
          set({
            currentVersion: currentVer,
            updateAvailable: false,
            manualCheckMessage: `You are running the latest version of AstroGuru (v${currentVer}) ✅`,
          });
          setTimeout(() => {
            set({ manualCheckMessage: null });
          }, 4000);
          return;
        }

        set({
          currentVersion: currentVer,
          updateAvailable: true,
          latestVersion: latestVer,
          downloadUrl: get().downloadUrl || FALLBACK_RELEASE_APK_URL,
          downloadError: null,
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
          downloadError: null,
        });

        if (background) {
          set({ updateAvailable: false });
        }

        try {
          const targetVersion = get().latestVersion || LATEST_RELEASE_VERSION;
          const directUrl = get().downloadUrl || FALLBACK_RELEASE_APK_URL;

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
              downloadError: null,
            });

            // Automatically launch Android package installer directly
            if (Platform.OS === 'android' && !background) {
              await inAppUpdateEngine.installDownloadedPackage(result.localUri);
            }
          } else {
            console.warn('[UpdateStore Download Notice]', result?.error || 'Download error');
            set({
              isDownloading: false,
              isBackgroundDownloading: false,
              downloadProgress: 0,
              downloadError: result?.error || 'Download interrupted. You can retry or download directly.',
            });
          }
        } catch (err: any) {
          console.warn('[UpdateStore Download Error]', err);
          set({
            isDownloading: false,
            isBackgroundDownloading: false,
            downloadProgress: 0,
            downloadError: err?.message || 'Download error encountered. Please check connection.',
          });
        }
      },

      openDirectDownloadInBrowser: async () => {
        const url = get().downloadUrl || FALLBACK_RELEASE_APK_URL;
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            await Linking.openURL(FALLBACK_RELEASE_APK_URL);
          }
        } catch (e) {
          console.warn('[OpenDirectDownload Error]', e);
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

      clearDownloadError: () => {
        set({ downloadError: null });
      },

      dismissUpdate: () => {
        if (!get().isMandatory) {
          set({ updateAvailable: false, downloadError: null });
        }
      },

      dismissInstallSnackbar: () => {
        set({ isReadyToInstall: false });
      },
    }),
    {
      name: 'astroguru_update_store_v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);