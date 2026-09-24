import { Platform } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { inAppUpdateEngine, UpdateDownloadProgress } from '../services/updates/inAppUpdateEngine';
import { getAppVersionFromFirebase, syncLatestAppVersionToFirebase } from '../services/firebaseRealtimeService';
import { openUnknownAppSourcesSettings } from '../services/apkInstallerService';

export const LATEST_RELEASE_VERSION = '3.0.1';
export const DIRECT_APK_URL = '/download/apk';

const NATIVE_VERSION = Constants.expoConfig?.version || '3.0.1';

function parseSemVer(v: string): number[] {
  return (v || '0.0.0').split('.').map((p) => parseInt(p, 10) || 0);
}

function isVersionHigher(candidate: string, current: string): boolean {
  const p1 = parseSemVer(candidate);
  const p2 = parseSemVer(current);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return true;
    if (n1 < n2) return false;
  }
  return false;
}

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
      updateAvailable: isVersionHigher(LATEST_RELEASE_VERSION, NATIVE_VERSION),
      isMandatory: false,
      releaseNotes: [
        `🚀 Official AstroGuru Platform Upgrade v${LATEST_RELEASE_VERSION}`,
        '📦 100% Native In-App APK Download & Package Auto-Installer (Zero Redirects)',
        '📱 GSAP Pinned 3D Phone Showcase with Interactive Sticky Scroll Physics',
        '🔮 5-Mode 3D Tarot Deck Cut & ₹99 Yes/No Oracle with Confidence Meter',
        '🔔 Instant Zero-Echo Bidirectional Calling & Live Chat Push Alerts',
        '👑 Golden Surya Sacred Vedic Branding & Adaptive Cosmic Graphics',
        '⚡ High-Contrast 36-Point Lagna Kundli & Ashta-Koota Matching',
        '🛠️ Real-Time Admin Website CMS & Remote Configuration Controller',
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

        try {
          const remoteMeta = await getAppVersionFromFirebase();
          const candidateVersion = (remoteMeta && remoteMeta.latestVersion) ? remoteMeta.latestVersion : LATEST_RELEASE_VERSION;
          const effectiveLatestVersion = isVersionHigher(candidateVersion, LATEST_RELEASE_VERSION)
            ? candidateVersion
            : LATEST_RELEASE_VERSION;

          const remoteApkUrl = remoteMeta?.apkUrl;
          const validApkUrl = (remoteApkUrl && typeof remoteApkUrl === 'string' && remoteApkUrl.endsWith('.apk'))
            ? remoteApkUrl
            : DIRECT_APK_URL;

          const hasNewer = isVersionHigher(effectiveLatestVersion, currentVer);

          set({
            latestVersion: effectiveLatestVersion,
            releaseNotes: (remoteMeta && remoteMeta.releaseNotes && remoteMeta.releaseNotes.length > 0)
              ? remoteMeta.releaseNotes
              : get().releaseNotes,
            apkDownloadUrl: validApkUrl,
            updateAvailable: hasNewer,
            updateType: 'apk',
            isReadyToInstall: false,
          });

          // Self-heal/sync Firebase app_meta if remote is older or missing
          if (!remoteMeta || isVersionHigher(LATEST_RELEASE_VERSION, remoteMeta.latestVersion || '0.0.0')) {
            syncLatestAppVersionToFirebase(LATEST_RELEASE_VERSION, get().releaseNotes, DIRECT_APK_URL).catch(() => {});
          }
        } catch (e) {
          console.warn('[UpdateStore Startup Check]', e);
          const hasNewer = isVersionHigher(LATEST_RELEASE_VERSION, currentVer);
          set({
            latestVersion: LATEST_RELEASE_VERSION,
            apkDownloadUrl: DIRECT_APK_URL,
            updateAvailable: hasNewer,
            updateType: 'apk',
            isReadyToInstall: false,
          });
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
          const remoteMeta = await getAppVersionFromFirebase();
          const candidateVersion = (remoteMeta && remoteMeta.latestVersion) ? remoteMeta.latestVersion : LATEST_RELEASE_VERSION;
          const effectiveLatestVersion = isVersionHigher(candidateVersion, LATEST_RELEASE_VERSION)
            ? candidateVersion
            : LATEST_RELEASE_VERSION;

          const remoteApkUrl = remoteMeta?.apkUrl;
          const validApkUrl = (remoteApkUrl && typeof remoteApkUrl === 'string' && remoteApkUrl.endsWith('.apk'))
            ? remoteApkUrl
            : DIRECT_APK_URL;

          const isReallyNew = isVersionHigher(effectiveLatestVersion, currentVer);

          set({
            isChecking: false,
            updateAvailable: isReallyNew,
            latestVersion: effectiveLatestVersion,
            apkDownloadUrl: validApkUrl,
            releaseNotes: (remoteMeta && remoteMeta.releaseNotes && remoteMeta.releaseNotes.length > 0)
              ? remoteMeta.releaseNotes
              : get().releaseNotes,
            isMandatory: !!(remoteMeta?.isMandatory && isReallyNew),
            updateType: 'apk',
            isReadyToInstall: false,
            lastCheckedTime: new Date().toISOString(),
          });

          return {
            isNewAvailable: isReallyNew,
            currentVersion: currentVer,
            latestVersion: effectiveLatestVersion,
          };
        } catch (e) {
          const isNewer = isVersionHigher(LATEST_RELEASE_VERSION, currentVer);
          set({
            isChecking: false,
            updateAvailable: isNewer,
            latestVersion: LATEST_RELEASE_VERSION,
            apkDownloadUrl: DIRECT_APK_URL,
            updateType: 'apk',
            isReadyToInstall: false,
          });
          return {
            isNewAvailable: isNewer,
            currentVersion: currentVer,
            latestVersion: LATEST_RELEASE_VERSION,
          };
        }
      },

      broadcastUpdate: (newVer, notes, mandatory = false) => {
        const currentVer = get().currentVersion || NATIVE_VERSION;
        const isNewer = isVersionHigher(newVer, currentVer);
        if (isNewer) {
          set({
            latestVersion: newVer,
            releaseNotes: notes,
            isMandatory: mandatory,
            updateAvailable: true,
            isReadyToInstall: false,
            updateType: 'apk',
          });
        }
      },

      triggerUpdateModal: () => {
        const { latestVersion, currentVersion } = get();
        // Only trigger update modal if an update is strictly newer/available
        if (isVersionHigher(latestVersion, currentVersion)) {
          set({
            updateAvailable: true,
            updateType: 'apk',
            isDownloading: false,
            isReadyToInstall: false,
            downloadProgress: 0,
          });
        }
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

            // Automatically launch Android Package Installer prompt on Android devices
            if (Platform.OS === 'android') {
              setTimeout(async () => {
                await get().installUpdate();
              }, 350);
            }
          } else {
            set({ isDownloading: false });
          }
        } catch (err: any) {
          console.warn('[In-App Download Error]', err);
          set({ isDownloading: false });
        }
      },

      installUpdate: async () => {
        const { downloadedPackageUri, apkDownloadUrl } = get();
        try {
          const result = await inAppUpdateEngine.installDownloadedPackage(downloadedPackageUri || undefined, apkDownloadUrl);
          if (!result.success && result.requiresPermission) {
            // Guide user to Android system permission screen
            await openUnknownAppSourcesSettings();
          }
        } catch (err) {
          console.warn('[Install Update Error]', err);
        }
      },

      downloadDirectApk: async () => {
        // Enforce 100% in-app download without external websites
        await get().startDownload();
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          const nativeVer = Constants.expoConfig?.version || '2.9.9';
          state.currentVersion = nativeVer;
          state.latestVersion = LATEST_RELEASE_VERSION;
          state.updateAvailable = isVersionHigher(state.latestVersion, nativeVer);
          state.isDownloading = false;
        }
      },
    }
  )
);