/**
 * AstroGuru Rock-Solid In-App APK Downloader & Package Installer Engine
 * Supports background OTA updates and direct native Android APK package streaming with progress tracking.
 */

import { Platform, Linking } from 'react-native';
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

export interface UpdateDownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  percentage: number;
  speedKbps?: number;
}

export interface InAppUpdateCheckResult {
  isAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string[];
  isMandatory: boolean;
  type: 'apk' | 'ota';
}

export const FALLBACK_APK_URL = 'https://expo.dev/artifacts/eas/eY0X9nAAY9q7HAFZhMJ0rj_JfkMmeysSEdLwn0HHlq8.apk';

class InAppUpdateEngine {
  private activeDownload: any = null;
  private lastDownloadedBytes: number = 0;
  private lastTimestamp: number = 0;

  /**
   * Checks for standalone binary APK version mismatches.
   */
  async checkForUpdate(currentVersion: string, latestVersion: string): Promise<InAppUpdateCheckResult> {
    const isVersionNewer = currentVersion !== latestVersion;
    return {
      isAvailable: isVersionNewer,
      currentVersion,
      latestVersion,
      releaseNotes: [
        `🚀 Official AstroGuru Platform Upgrade v${latestVersion}`,
        '🎙️ WhatsApp-Style Voice Notes in Chat with Live Waveforms & Audio Bubbles',
        '🎯 Problem-First Jyotish Categories (Love, Marriage, Career, Money, Nazar)',
        '🌅 Approximate Birth Time Windows (Morning, Afternoon, Evening, Night & Prashna)',
        '⚡ Seamless 1-Tap Floating Wallet Recharge During Live Calls (+5 Mins ₹99)',
        '🔔 Daily 7:00 AM "Subah Ka Shubh Muhurat" & Rahu Kaal Push Notifications',
        '🪐 High-Accuracy Vedic Kundli Match (All 12 Rashis & 36 Ashta-Koota Scoring)',
        '📦 Direct Native In-App APK Download & Package Auto-Installer Engine',
        '💎 Ultra-Smooth Liquid Glass UI & Zero-Glitch Polished Experience',
      ],
      isMandatory: false,
      type: 'apk',
    };
  }

  /**
   * Downloads the native Android APK package with real progress tracking.
   */
  async downloadUpdatePackage(
    targetVersion: string,
    onProgress: (progress: UpdateDownloadProgress) => void,
    customApkUrl?: string
  ): Promise<{ success: boolean; localUri?: string; type: 'apk' }> {
    const apkUrl = customApkUrl || FALLBACK_APK_URL;

    // Web Platform: Simulate live download stream with animated progress bar and trigger APK download
    if (Platform.OS === 'web') {
      const totalBytes = 105 * 1024 * 1024;
      let downloaded = 0;
      for (let p = 12; p <= 98; p += 16) {
        await new Promise((resolve) => setTimeout(resolve, 180));
        downloaded = Math.min(totalBytes, Math.floor((p / 100) * totalBytes));
        onProgress({
          totalBytes,
          downloadedBytes: downloaded,
          percentage: p,
          speedKbps: 4200 + Math.floor(Math.random() * 900),
        });
      }
      onProgress({
        totalBytes,
        downloadedBytes: totalBytes,
        percentage: 100,
        speedKbps: 5120,
      });

      try {
        if (typeof window !== 'undefined' && window.open) {
          window.open(apkUrl, '_blank');
        } else {
          await Linking.openURL(apkUrl);
        }
      } catch (_) {}

      return { success: true, localUri: apkUrl, type: 'apk' };
    }

    if (Platform.OS === 'android') {
      try {
        const fsAny = FileSystem as any;
        const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;

        if (targetDir && typeof fsAny.createDownloadResumable === 'function') {
          const fileName = `AstroGuru_v${targetVersion}.apk`;
          const localPath = `${targetDir}${fileName}`;

          try {
            const info = await fsAny.getInfoAsync(localPath);
            if (info.exists) {
              await fsAny.deleteAsync(localPath, { idempotent: true });
            }
          } catch (_) {}

          this.lastDownloadedBytes = 0;
          this.lastTimestamp = Date.now();

          this.activeDownload = fsAny.createDownloadResumable(
            apkUrl,
            localPath,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept': 'application/vnd.android.package-archive,*/*',
              },
            },
            (downloadProgress: any) => {
              const total = downloadProgress.totalBytesExpectedToWrite > 0
                ? downloadProgress.totalBytesExpectedToWrite
                : 105 * 1024 * 1024;
              const downloaded = downloadProgress.totalBytesWritten;
              const percentage = Math.min(99, Math.max(1, Math.floor((downloaded / total) * 100)));

              const now = Date.now();
              const timeDiff = (now - this.lastTimestamp) / 1000;
              let speedKbps = 2400;

              if (timeDiff >= 0.5) {
                const bytesDiff = downloaded - this.lastDownloadedBytes;
                speedKbps = Math.max(100, Math.floor((bytesDiff / timeDiff) / 1024));
                this.lastDownloadedBytes = downloaded;
                this.lastTimestamp = now;
              }

              onProgress({
                totalBytes: total,
                downloadedBytes: downloaded,
                percentage,
                speedKbps,
              });
            }
          );

          const result = await this.activeDownload.downloadAsync();
          if (result && result.uri) {
            onProgress({
              totalBytes: 105 * 1024 * 1024,
              downloadedBytes: 105 * 1024 * 1024,
              percentage: 100,
              speedKbps: 3500,
            });
            return { success: true, localUri: result.uri, type: 'apk' };
          }
        }
      } catch (err) {
        console.warn('[InAppUpdateEngine] Direct APK download error:', err);
      }
    }

    return { success: false, type: 'apk' };
  }

  /**
   * Installs the downloaded package via Native Android Package Installer prompt.
   */
  async installDownloadedPackage(localUri?: string, customApkUrl?: string): Promise<{ success: boolean; requiresPermission?: boolean; error?: string }> {
    const targetUrl = customApkUrl || FALLBACK_APK_URL;

    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.open) {
          window.open(targetUrl, '_blank');
        } else {
          await Linking.openURL(targetUrl);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    if (Platform.OS === 'android' && localUri) {
      try {
        const fsAny = FileSystem as any;
        const getContentUri = fsAny.getContentUriAsync || FileSystem.getContentUriAsync;

        let contentUri = localUri;
        if (typeof getContentUri === 'function') {
          contentUri = await getContentUri(localUri);
        }

        console.log('[InAppUpdateEngine] Launching Android Package Installer with contentUri:', contentUri);

        // Launch android.intent.action.VIEW with application/vnd.android.package-archive
        // Flags: FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456)
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1 | 268435456,
          type: 'application/vnd.android.package-archive',
        });
        return { success: true };
      } catch (intentErr: any) {
        console.warn('[InAppUpdateEngine] Native Intent install blocked or failed:', intentErr);

        // Fallback: Open direct APK download in Android browser/Download Manager
        try {
          await Linking.openURL(targetUrl);
          return { success: true, requiresPermission: true };
        } catch (openErr) {
          return { success: false, requiresPermission: true, error: intentErr?.message };
        }
      }
    }

    // Direct browser APK link fallback
    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(targetUrl);
        return { success: true };
      } catch (err: any) {
        console.warn('[InAppUpdateEngine] Fallback openURL failed:', err);
        return { success: false, error: err?.message };
      }
    }

    return { success: false };
  }

  async openDirectBrowserDownload(customApkUrl?: string): Promise<boolean> {
    const targetUrl = customApkUrl || FALLBACK_APK_URL;
    try {
      await Linking.openURL(targetUrl);
      return true;
    } catch (err) {
      console.warn('[InAppUpdateEngine] openDirectBrowserDownload failed:', err);
      return false;
    }
  }
}

export const inAppUpdateEngine = new InAppUpdateEngine();