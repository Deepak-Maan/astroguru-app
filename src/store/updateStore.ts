import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inAppUpdateEngine, UpdateDownloadProgress } from '../services/updates/inAppUpdateEngine';

export const LATEST_RELEASE_VERSION = '2.7.6';

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
  startDownload: (customApkUrl?: string) => Promise<void>;
  installUpdate: () => Promise<void>;
  downloadDirectApk: (customUrl?: string) => Promise<void>;
  dismissUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      currentVersion: '2.7.6',
      latestVersion: '2.7.6',
      updateAvailable: false,
      isMandatory: false,
      releaseNotes: [
        '✨ Release v2.7.6: Live Planetary Transit Ticker & Daily Vedic Shloka Audio',
        '💎 Interactive North & South Indian Kundli Chart Style Switcher',
        '🧙‍♂️ Enhanced Astrologer Cards with Live Queue Status & 10s Voice Intros',
        '📦 Direct Native In-App APK Downloader & System Package Installer',
        '💳 Solar Saffron/Gold High-Contrast Balance Header & Wallet Suite',
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
        // On Web, app updates automatically on bundle reload without modal prompt
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

        const currentVersion = get().currentVersion || '2.0.0';

        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVersion, LATEST_RELEASE_VERSION);
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
        } catch (e) {
          console.warn('[UpdateStore Startup Check]', e);
        }
      },

      checkForUpdates: async () => {
        const currentVersion = get().currentVersion || '2.0.0';
        set({ isChecking: true });

        try {
          const result = await inAppUpdateEngine.checkForUpdate(currentVersion, LATEST_RELEASE_VERSION);
          set({
            isChecking: false,
            lastCheckedTime: new Date().toISOString(),
            updateAvailable: result.isAvailable,
            latestVersion: result.latestVersion,
            releaseNotes: result.releaseNotes,
            updateType: result.type,
          });
          return {
            isNewAvailable: result.isAvailable,
            currentVersion,
            latestVersion: result.latestVersion,
          };
        } catch (e) {
          set({ isChecking: false });
          const isNew = currentVersion !== LATEST_RELEASE_VERSION;
          set({ updateAvailable: isNew });
          return { isNewAvailable: isNew, currentVersion, latestVersion: LATEST_RELEASE_VERSION };
        }
      },

      triggerUpdateModal: () => {
        set({
          latestVersion: LATEST_RELEASE_VERSION,
          updateAvailable: true,
          isReadyToInstall: false,
          downloadProgress: 0,
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

      startDownload: async (customApkUrl?: string) => {
        set({ isDownloading: true, downloadProgress: 5, isReadyToInstall: false, downloadedPackageUri: null });

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
          customApkUrl
        );

        set({
          downloadProgress: 100,
          isDownloading: false,
          isReadyToInstall: true,
          downloadedPackageUri: result.localUri || null,
          updateType: result.type,
        });
      },

      installUpdate: async () => {
        const { downloadedPackageUri, latestVersion } = get();

        await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined);

        set({
          currentVersion: latestVersion,
          updateAvailable: false,
          isDownloading: false,
          isReadyToInstall: false,
          downloadProgress: 0,
        });
      },

      downloadDirectApk: async (customUrl?: string) => {
        await inAppUpdateEngine.installDownloadedPackage(undefined, customUrl);
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
