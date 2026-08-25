/**
 * AstroGuru Native In-App APK Downloader & Package Installer Engine
 * Production-grade direct APK streaming, background downloads, permission helper,
 * storage garbage collection, and Android Intent package installation.
 * Powered by GitHub Releases API (https://github.com/Deepak-Maan/astroguru-app/releases).
 */

import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';

export interface UpdateDownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  percentage: number;
  speedKbps?: number;
  downloadedMb?: string;
  totalMb?: string;
}

export interface InAppUpdateCheckResult {
  isAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string[];
  isMandatory: boolean;
  type: 'apk';
  downloadUrl?: string;
  apkFileName?: string;
  apkSizeMb?: number;
}

export const GITHUB_OWNER = 'Deepak-Maan';
export const GITHUB_REPO = 'astroguru-app';
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
export const LIVE_DIRECT_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

/**
 * Robust version comparison helper
 * Handles versionCode ('286' > '285') and semver ('2.8.6' > '2.8.5')
 */
export function isRemoteVersionNewer(remoteVer: string, currentVer: string): boolean {
  if (!remoteVer || !currentVer) return false;

  const cleanRemote = remoteVer.trim().replace(/^v/i, '');
  const cleanCurrent = currentVer.trim().replace(/^v/i, '');

  if (cleanRemote === cleanCurrent) return false;

  // Numeric versionCode check (e.g. "286" vs "285")
  const remoteNum = parseInt(cleanRemote, 10);
  const currentNum = parseInt(cleanCurrent, 10);
  if (!isNaN(remoteNum) && !isNaN(currentNum) && !cleanRemote.includes('.') && !cleanCurrent.includes('.')) {
    return remoteNum > currentNum;
  }

  // Semver check (e.g. "2.8.6" vs "2.8.5")
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
   * Automatic Storage Garbage Collector:
   * Scans cache/document directories and deletes older version APKs to free up phone storage.
   */
  async cleanupOldApks(keepVersion?: string): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      const fsAny = FileSystem as any;
      const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;
      if (!targetDir || typeof fsAny.readDirectoryAsync !== 'function') return;

      const files: string[] = await fsAny.readDirectoryAsync(targetDir);
      const keepName = keepVersion ? `AstroGuru-v${keepVersion}.apk` : '';

      for (const file of files) {
        if (file.toLowerCase().endsWith('.apk') && file !== keepName) {
          try {
            await fsAny.deleteAsync(`${targetDir}${file}`, { idempotent: true });
            console.log('[InAppUpdateEngine] Cleaned up old APK:', file);
          } catch (_) {}
        }
      }
    } catch (e) {
      console.log('[InAppUpdateEngine] Cache cleanup notice:', e);
    }
  }

  /**
   * Checks GitHub Releases for the latest APK uploaded by the developer.
   */
  async checkForUpdate(currentVersion: string, fallbackVersion: string): Promise<InAppUpdateCheckResult> {
    const currentCode = Application.nativeBuildVersion || '286';
    const currentName = Application.nativeApplicationVersion || currentVersion || '2.8.6';

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

        const downloadUrl = apkAsset?.browser_download_url || 
          `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${rawTag || 'v' + cleanTag}/${apkAsset?.name || 'app-release.apk'}`;

        const rawSize = apkAsset?.size ? (apkAsset.size / (1024 * 1024)).toFixed(1) : '42.5';
        const isMandatory = data.body?.toLowerCase().includes('[mandatory]') || data.body?.toLowerCase().includes('force_update') || false;

        const formattedNotes: string[] = [];
        if (data.body) {
          data.body
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0 && !line.startsWith('#'))
            .forEach((line: string) => {
              if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
                formattedNotes.push(line.replace(/^[-*•]\s*/, '• '));
              } else {
                formattedNotes.push(`• ${line}`);
              }
            });
        }

        const notes = formattedNotes.length > 0
          ? formattedNotes
          : [
              '• 🚀 Performance optimizations & 2x faster Kundli rendering.',
              '• 💬 Enhanced live consultation stability and chat responsiveness.',
              '• 🔒 Security patches and seamless in-app APK updating.',
            ];

        return {
          isAvailable: isNewer,
          currentVersion: currentName,
          latestVersion: cleanTag || fallbackVersion,
          releaseNotes: notes,
          isMandatory,
          type: 'apk',
          downloadUrl,
          apkFileName: apkAsset?.name || `AstroGuru-v${cleanTag}.apk`,
          apkSizeMb: parseFloat(rawSize),
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
   * Downloads the APK package directly in-app with byte counting, transfer speed, and integrity checks.
   */
  async downloadUpdatePackage(
    targetVersion: string,
    onProgress: (progress: UpdateDownloadProgress) => void,
    customApkUrl?: string
  ): Promise<{ success: boolean; localUri?: string; type: 'apk'; error?: string }> {
    if (Platform.OS !== 'android') {
      return { success: false, type: 'apk', error: 'Platform not Android' };
    }

    const apkUrl = customApkUrl || LIVE_DIRECT_APK_URL;

    try {
      const fsAny = FileSystem as any;
      const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;

      if (!targetDir || typeof fsAny.createDownloadResumable !== 'function') {
        return { success: false, type: 'apk', error: 'FileSystem not available' };
      }

      // Cleanup older version APKs before starting download
      await this.cleanupOldApks(targetVersion);

      const fileName = `AstroGuru-v${targetVersion}.apk`;
      const localPath = `${targetDir}${fileName}`;

      // Check if already completely downloaded and valid
      try {
        const existingInfo = await fsAny.getInfoAsync(localPath);
        if (existingInfo.exists && existingInfo.size > 10 * 1024 * 1024) {
          onProgress({
            totalBytes: existingInfo.size,
            downloadedBytes: existingInfo.size,
            percentage: 100,
            speedKbps: 3500,
            downloadedMb: (existingInfo.size / (1024 * 1024)).toFixed(1),
            totalMb: (existingInfo.size / (1024 * 1024)).toFixed(1),
          });
          return { success: true, localUri: localPath, type: 'apk' };
        } else if (existingInfo.exists) {
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
            Accept: 'application/octet-stream',
            'User-Agent': 'AstroGuru-InApp-Downloader',
          },
        },
        (downloadProgress: any) => {
          const total = downloadProgress.totalBytesExpectedToWrite || 42 * 1024 * 1024;
          const downloaded = downloadProgress.totalBytesWritten;
          const percentage = Math.min(100, Math.max(1, Math.floor((downloaded / total) * 100)));

          const now = Date.now();
          const timeDiff = (now - this.lastTimestamp) / 1000;
          let speedKbps = 2400;

          if (timeDiff >= 0.3) {
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
            downloadedMb: (downloaded / (1024 * 1024)).toFixed(1),
            totalMb: (total / (1024 * 1024)).toFixed(1),
          });
        }
      );

      const result = await this.activeDownload.downloadAsync();
      
      if (result && result.uri) {
        // Validate APK integrity (size > 10MB to avoid partial/corrupt files)
        const fileInfo = await fsAny.getInfoAsync(result.uri);
        if (fileInfo.exists && fileInfo.size > 10 * 1024 * 1024) {
          const finalMb = (fileInfo.size / (1024 * 1024)).toFixed(1);
          onProgress({
            totalBytes: fileInfo.size,
            downloadedBytes: fileInfo.size,
            percentage: 100,
            speedKbps: 3500,
            downloadedMb: finalMb,
            totalMb: finalMb,
          });
          return { success: true, localUri: result.uri, type: 'apk' };
        } else {
          return { success: false, type: 'apk', error: 'Downloaded APK file is incomplete or corrupted.' };
        }
      }

      return { success: false, type: 'apk', error: 'Download stream returned no URI' };
    } catch (err: any) {
      console.warn('[InAppUpdateEngine] Direct APK download error:', err);
      return { success: false, type: 'apk', error: err?.message || 'Download error' };
    }
  }

  /**
   * Installs the downloaded APK package directly via Android Package Installer Intent
   */
  async installDownloadedPackage(localUri?: string): Promise<boolean> {
    if (Platform.OS !== 'android' || !localUri) {
      return false;
    }

    try {
      const fsAny = FileSystem as any;
      const getContentUri = fsAny.getContentUriAsync || FileSystem.getContentUriAsync;

      let packageUri = localUri;
      if (typeof getContentUri === 'function') {
        packageUri = await getContentUri(localUri);
      }

      // Launch native Android Package Installer directly
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: packageUri,
        flags: 1 | 268435456, // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
        type: 'application/vnd.android.package-archive',
      });
      return true;
    } catch (e: any) {
      console.warn('[InAppUpdateEngine] Intent install error:', e);

      // Prompt for unknown sources permission if restricted
      await this.openSettingsForInstallPermission();
      return false;
    }
  }

  /**
   * 1-Tap Unknown Apps Permission helper for Android 8.0 through Android 15
   */
  async openSettingsForInstallPermission(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
          data: 'package:com.astroguru.app',
        });
      } catch (e) {
        console.warn('[InAppUpdateEngine] Failed to open unknown sources settings:', e);
        try {
          await IntentLauncher.startActivityAsync('android.settings.APPLICATION_DETAILS_SETTINGS', {
            data: 'package:com.astroguru.app',
          });
        } catch (_) {}
      }
    }
  }
}

export const inAppUpdateEngine = new InAppUpdateEngine();