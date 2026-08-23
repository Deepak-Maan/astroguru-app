/**
 * AstroGuru Native In-App APK Downloader & Package Installer Engine
 * Direct .apk package streaming, progress tracking, and Android Intent package installation
 * Powered by GitHub Releases API (https://github.com/Deepak-Maan/astroguru-app/releases).
 */

import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
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
  type: 'apk';
  downloadUrl?: string;
}

export const GITHUB_OWNER = 'Deepak-Maan';
export const GITHUB_REPO = 'astroguru-app';
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
export const LIVE_DIRECT_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

/**
 * Robust version comparison helper
 * Handles versionCode ('284' > '283') and semver ('2.8.5' > '2.8.4')
 */
export function isRemoteVersionNewer(remoteVer: string, currentVer: string): boolean {
  if (!remoteVer || !currentVer) return false;

  const cleanRemote = remoteVer.trim().replace(/^v/i, '');
  const cleanCurrent = currentVer.trim().replace(/^v/i, '');

  if (cleanRemote === cleanCurrent) return false;

  // Numeric versionCode check (e.g. "285" vs "284")
  const remoteNum = parseInt(cleanRemote, 10);
  const currentNum = parseInt(cleanCurrent, 10);
  if (!isNaN(remoteNum) && !isNaN(currentNum) && !cleanRemote.includes('.') && !cleanCurrent.includes('.')) {
    return remoteNum > currentNum;
  }

  // Semver check (e.g. "2.8.5" vs "2.8.4")
  const rParts = cleanRemote.split('.').map((p) => parseInt(p, 10) || 0);
  const cParts = cleanCurrent.split('.').map((p) => parseInt(p, 10) || 0);

  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }

  return false;
}

class InAppUpdateEngine {
  private activeDownload: any = null;
  private lastDownloadedBytes: number = 0;
  private lastTimestamp: number = 0;

  /**
   * Checks GitHub Releases for the latest APK uploaded by the developer.
   */
  async checkForUpdate(currentVersion: string, fallbackVersion: string): Promise<InAppUpdateCheckResult> {
    const currentCode = Application.nativeBuildVersion || '284';
    const currentName = Application.nativeApplicationVersion || currentVersion || '2.8.4';

    // 1. Query GitHub Releases API
    try {
      const response = await fetch(GITHUB_API_LATEST_RELEASE, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AstroGuru-InApp-Updater',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rawTag = data.tag_name || '';
        const cleanTag = rawTag.replace(/^v/i, '').trim();

        // Check if remote version from GitHub Release is newer
        const isNewer =
          isRemoteVersionNewer(cleanTag, currentCode) ||
          isRemoteVersionNewer(cleanTag, currentName);

        // Find .apk asset download URL from release assets
        const apkAsset = data.assets?.find((asset: any) =>
          typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk')
        );

        const downloadUrl = apkAsset?.browser_download_url || `${LIVE_DIRECT_APK_URL}/download/${rawTag || 'v' + cleanTag}/${apkAsset?.name || 'app-release.apk'}`;

        const notes = data.body
          ? data.body
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.length > 0)
          : [
              `✨ What's new in v${cleanTag}:`,
              '• Performance optimizations & UI enhancements.',
              '• Direct In-App APK update from GitHub Releases.',
            ];

        return {
          isAvailable: isNewer,
          currentVersion: currentName,
          latestVersion: cleanTag || fallbackVersion,
          releaseNotes: notes,
          isMandatory: false,
          type: 'apk',
          downloadUrl: downloadUrl,
        };
      }
    } catch (ghErr) {
      console.log('[InAppUpdateEngine] GitHub Releases check error:', ghErr);
    }

    // Up to date or offline
    return {
      isAvailable: false,
      currentVersion: currentName,
      latestVersion: currentName,
      releaseNotes: ['You are using the latest version of AstroGuru.'],
      isMandatory: false,
      type: 'apk',
    };
  }

  /**
   * Downloads the APK file directly with real-time percentage, byte counting, and transfer speed.
   */
  async downloadUpdatePackage(
    targetVersion: string,
    onProgress: (progress: UpdateDownloadProgress) => void,
    customApkUrl?: string
  ): Promise<{ success: boolean; localUri?: string; type: 'apk' }> {
    const apkUrl = customApkUrl || LIVE_DIRECT_APK_URL;

    // Direct Native Android APK Download
    if (Platform.OS === 'android') {
      try {
        const fsAny = FileSystem as any;
        const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;

        if (targetDir && typeof fsAny.createDownloadResumable === 'function') {
          const fileName = `AstroGuru-v${targetVersion}.apk`;
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
            {},
            (downloadProgress: any) => {
              const total = downloadProgress.totalBytesExpectedToWrite || 40 * 1024 * 1024;
              const downloaded = downloadProgress.totalBytesWritten;
              const percentage = Math.min(100, Math.floor((downloaded / total) * 100));

              const now = Date.now();
              const timeDiff = (now - this.lastTimestamp) / 1000;
              let speedKbps = 2400;

              if (timeDiff >= 0.5) {
                const bytesDiff = downloaded - this.lastDownloadedBytes;
                speedKbps = Math.max(100, Math.floor(bytesDiff / timeDiff / 1024));
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
              totalBytes: 40 * 1024 * 1024,
              downloadedBytes: 40 * 1024 * 1024,
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

    // Direct browser fallback for Web / non-Android
    return { success: false, type: 'apk' };
  }

  /**
   * Installs the downloaded APK package via Android Package Installer Intent
   */
  async installDownloadedPackage(localUri?: string, customApkUrl?: string): Promise<boolean> {
    if (Platform.OS === 'android' && localUri) {
      // 1. IntentLauncher VIEW with content:// URI
      try {
        const fsAny = FileSystem as any;
        const getContentUri = fsAny.getContentUriAsync || FileSystem.getContentUriAsync;

        let packageUri = localUri;
        if (typeof getContentUri === 'function') {
          packageUri = await getContentUri(localUri);
        }

        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: packageUri,
          flags: 1 | 268435456, // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
          type: 'application/vnd.android.package-archive',
        });
        return true;
      } catch (e: any) {
        console.warn('[InAppUpdateEngine] Intent install fallback to Sharing:', e);
      }

      // 2. Sharing fallback
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(localUri, {
            mimeType: 'application/vnd.android.package-archive',
            dialogTitle: 'Install AstroGuru Update',
            UTI: 'com.android.package-archive',
          });
          return true;
        }
      } catch (shareErr) {
        console.warn('[InAppUpdateEngine] expo-sharing error:', shareErr);
      }
    }

    // Direct browser APK link fallback
    const targetUrl = customApkUrl || LIVE_DIRECT_APK_URL;
    try {
      await Linking.openURL(targetUrl);
      return true;
    } catch (err) {
      console.warn('[InAppUpdateEngine] Fallback openURL failed:', err);
      return false;
    }
  }

  async openDirectBrowserDownload(customApkUrl?: string): Promise<boolean> {
    const targetUrl = customApkUrl || LIVE_DIRECT_APK_URL;
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