import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { inAppUpdateEngine, UpdateDownloadProgress } from '../services/updates/inAppUpdateEngine';
import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';

export const LATEST_RELEASE_VERSION = '2.9.2';
export const DIRECT_APK_URL = 'https://expo.dev/artifacts/eas/uHiJXVN01PSBi81bGeS9-bW5w8FhnxlAYd3e9Sbn2MU.apk';

const NATIVE_VERSION = Constants.expoConfig?.version || '2.9.1';

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
      currentVersion: NATIVE_VERSION,
      latestVersion: LATEST_RELEASE_VERSION,
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        `🚀 Official AstroGuru Platform Upgrade v${LATEST_RELEASE_VERSION}`,
        '✨ All-New Claymorphism 3D Soft Tactile UI Experience',
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
      totalBytes: 105 * 1024 * 1024,
      speedKbps: 0,
      isDownloading: false,
      isReadyToInstall: false,
      isChecking: false,
      lastCheckedTime: null,
      downloadedPackageUri: null,
      updateType: 'apk',
      apkDownloadUrl: DIRECT_APK_URL,

      autoCheckAndFetchOnStartup: async () => {
        const currentVer = Constants.expoConfig?.version || NATIVE_VERSION;
        set({ currentVersion: currentVer });

        try {
          syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, DIRECT_APK_URL);
        } catch (_) {}

        // If app is already on latest version, never show update modal
        if (currentVer === LATEST_RELEASE_VERSION) {
          set({ updateAvailable: false, isReadyToInstall: false });
          return;
        }

        // Silent background OTA fetch without hijacking the APK install modal
        if (Platform.OS !== 'web' && Updates.isEnabled) {
          try {
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
              await Updates.fetchUpdateAsync();
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
            const remoteVersion = remoteMeta.latestVersion;
            const hasNewer = remoteVersion !== currentVer;
            set({
              latestVersion: remoteVersion,
              releaseNotes: remoteMeta.releaseNotes || get().releaseNotes,
              apkDownloadUrl: remoteMeta.apkUrl || DIRECT_APK_URL,
              updateAvailable: hasNewer,
              updateType: 'apk',
              isReadyToInstall: false,
            });
          } else if (currentVer !== LATEST_RELEASE_VERSION) {
            set({
              latestVersion: LATEST_RELEASE_VERSION,
              updateAvailable: true,
              updateType: 'apk',
              isReadyToInstall: false,
            });
          }
        } catch (e) {
          console.warn('[UpdateStore Startup Check]', e);
          if (currentVer !== LATEST_RELEASE_VERSION) {
            set({
              latestVersion: LATEST_RELEASE_VERSION,
              updateAvailable: true,
              updateType: 'apk',
              isReadyToInstall: false,
            });
          }
        }
      },

      checkForUpdates: async () => {
        set({ isChecking: true });

        const currentVer = Constants.expoConfig?.version || get().currentVersion || NATIVE_VERSION;
        set({ currentVersion: currentVer });

        // Silent background OTA check
        if (Platform.OS !== 'web' && Updates.isEnabled) {
          try {
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
              await Updates.fetchUpdateAsync();
            }
          } catch (e) {}
        }

        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVer, LATEST_RELEASE_VERSION);
          const isReallyNew = result.isAvailable && currentVer !== LATEST_RELEASE_VERSION;

          set({
            isChecking: false,
            updateAvailable: isReallyNew,
            latestVersion: result.latestVersion,
            releaseNotes: result.releaseNotes,
            isMandatory: result.isMandatory && isReallyNew,
            updateType: 'apk',
            isReadyToInstall: false,
            lastCheckedTime: new Date().toISOString(),
          });

          return {
            isNewAvailable: isReallyNew,
            currentVersion: currentVer,
            latestVersion: result.latestVersion,
          };
        } catch (e) {
          const isNewer = currentVer !== LATEST_RELEASE_VERSION;
          set({ isChecking: false, updateAvailable: isNewer, updateType: 'apk', isReadyToInstall: false });
          return {
            isNewAvailable: isNewer,
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
          updateType: 'apk',
        });
      },

      triggerUpdateModal: () => {
        set({
          updateAvailable: true,
          latestVersion: LATEST_RELEASE_VERSION,
          updateType: 'apk',
          isReadyToInstall: false,
          downloadProgress: 0,
        });
      },

      startDownload: async () => {
        if (get().isDownloading) return;
        set({ isDownloading: true, downloadProgress: 0, isReadyToInstall: false, updateType: 'apk' });

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

          if (result.success && result.localUri) {
            set({
              isDownloading: false,
              downloadProgress: 100,
              isReadyToInstall: true,
              downloadedPackageUri: result.localUri,
              updateType: 'apk',
            });

            // Automatically launch Android Package Installer prompt!
            setTimeout(async () => {
              await get().installUpdate();
            }, 350);
          } else {
            // Direct browser fallback so user is never stuck
            set({ isDownloading: false });
            await get().downloadDirectApk();
          }
        } catch (err: any) {
          set({ isDownloading: false });
          await get().downloadDirectApk();
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri, apkDownloadUrl } = get();
        try {
          const result = await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined, apkDownloadUrl);
          if (!result.success && !result.requiresPermission) {
            await inAppUpdateEngine.openDirectBrowserDownload(apkDownloadUrl);
          }
        } catch (err) {
          console.warn('[Install Update Error]', err);
          await inAppUpdateEngine.openDirectBrowserDownload(apkDownloadUrl);
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