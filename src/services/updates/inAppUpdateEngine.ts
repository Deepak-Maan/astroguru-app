/**
 * AstroGuru Native In-App APK Downloader & Package Installer Engine
 * True In-App APK streaming, byte counter, transfer speed, Android Intent installation,
 * and zero browser redirects.
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
  downloadUrl: string;
  apkFileName: string;
  apkSizeMb: number;
}

export const GITHUB_OWNER = 'Deepak-Maan';
export const GITHUB_REPO = 'astroguru-app';
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

export function getDirectApkDownloadUrl(version: string, assetName: string = 'app-release.apk'): string {
  const cleanVer = version.replace(/^v/i, '').trim();
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${cleanVer}/${assetName}`;
}

export function isRemoteVersionNewer(remoteVer: string, currentVer: string): boolean {
  if (!remoteVer || !currentVer) return false;

  const cleanRemote = remoteVer.trim().replace(/^v/i, '');
  const cleanCurrent = currentVer.trim().replace(/^v/i, '');

  if (cleanRemote === cleanCurrent) return false;

  // Numeric versionCode check (e.g. "287" vs "286")
  const remoteNum = parseInt(cleanRemote, 10);
  const currentNum = parseInt(cleanCurrent, 10);
  if (!isNaN(remoteNum) && !isNaN(currentNum) && !cleanRemote.includes('.') && !cleanCurrent.includes('.')) {
    return remoteNum > currentNum;
  }

  // Semver check (e.g. "2.8.7" vs "2.8.6")
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
   * Cleans up old cached APKs to keep storage lean.
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
          } catch (_) {}
        }
      }
    } catch (e) {
      console.log('[InAppUpdateEngine] Cache cleanup notice:', e);
    }
  }

  /**
   * Checks GitHub for the latest release metadata.
   */
  async checkForUpdate(currentVersion: string, fallbackVersion: string): Promise<InAppUpdateCheckResult> {
    const currentCode = Application.nativeBuildVersion || '286';
    const currentName = Application.nativeApplicationVersion || currentVersion || '2.8.6';

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

        const isNewer =
          isRemoteVersionNewer(cleanTag, currentCode) ||
          isRemoteVersionNewer(cleanTag, currentName);

        const apkAsset = data.assets?.find((asset: any) =>
          typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk')
        );

        const directUrl = apkAsset?.browser_download_url || getDirectApkDownloadUrl(cleanTag || fallbackVersion);
        const rawSize = apkAsset?.size ? (apkAsset.size / (1024 * 1024)).toFixed(1) : '44.8';
        const isMandatory = data.body?.toLowerCase().includes('[mandatory]') || false;

        const formattedNotes: string[] = [];
        if (data.body) {
          data.body
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0 && !l.startsWith('#'))
            .forEach((l: string) => {
              if (l.startsWith('-') || l.startsWith('*') || l.startsWith('•')) {
                formattedNotes.push(l.replace(/^[-*•]\s*/, '• '));
              } else {
                formattedNotes.push(`• ${l}`);
              }
            });
        }

        const notes = formattedNotes.length > 0
          ? formattedNotes
          : [
              '• 👑 Ultra-Premium Imperial Gold & Crystal Glass Design System.',
              '• 💬 Enhanced live consultation stability and chat responsiveness.',
              '• 🧭 Vastu Compass, Love Meter & Daily Karma Rewards.',
              '• 📲 100% In-App Direct APK Downloading & Auto-Installation.',
            ];

        return {
          isAvailable: isNewer,
          currentVersion: currentName,
          latestVersion: cleanTag || fallbackVersion,
          releaseNotes: notes,
          isMandatory,
          type: 'apk',
          downloadUrl: directUrl,
          apkFileName: apkAsset?.name || `AstroGuru-v${cleanTag || fallbackVersion}.apk`,
          apkSizeMb: parseFloat(rawSize),
        };
      }
    } catch (ghErr) {
      console.log('[InAppUpdateEngine] GitHub Releases check notice:', ghErr);
    }

    // Default fallback
    return {
      isAvailable: isRemoteVersionNewer(fallbackVersion, currentName),
      currentVersion: currentName,
      latestVersion: fallbackVersion,
      releaseNotes: [
        '• 👑 Ultra-Premium Imperial Gold & Crystal Glass Design System.',
        '• 💬 Astrotalk-Grade 1-on-1 Chat, Voice Call & Live Streaming.',
        '• 🧭 Vastu Compass, Love Meter & Daily Karma Rewards.',
      ],
      isMandatory: false,
      type: 'apk',
      downloadUrl: getDirectApkDownloadUrl(fallbackVersion),
      apkFileName: `AstroGuru-v${fallbackVersion}.apk`,
      apkSizeMb: 44.8,
    };
  }

  /**
   * Streams the APK file directly to phone storage without opening any browser.
   */
  async downloadUpdatePackage(
    targetVersion: string,
    onProgress: (progress: UpdateDownloadProgress) => void,
    customApkUrl?: string
  ): Promise<{ success: boolean; localUri?: string; type: 'apk'; error?: string }> {
    if (Platform.OS !== 'android') {
      return { success: false, type: 'apk', error: 'Platform not Android' };
    }

    const cleanVer = targetVersion.replace(/^v/i, '').trim();
    const primaryUrl = customApkUrl && customApkUrl.endsWith('.apk')
      ? customApkUrl
      : getDirectApkDownloadUrl(cleanVer);

    try {
      const fsAny = FileSystem as any;
      const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;

      if (!targetDir || typeof fsAny.createDownloadResumable !== 'function') {
        return { success: false, type: 'apk', error: 'FileSystem not available' };
      }

      await this.cleanupOldApks(cleanVer);

      const fileName = `AstroGuru-v${cleanVer}.apk`;
      const localPath = `${targetDir}${fileName}`;

      // If already fully downloaded
      try {
        const existingInfo = await fsAny.getInfoAsync(localPath);
        if (existingInfo.exists && existingInfo.size > 8 * 1024 * 1024) {
          const finalMb = (existingInfo.size / (1024 * 1024)).toFixed(1);
          onProgress({
            totalBytes: existingInfo.size,
            downloadedBytes: existingInfo.size,
            percentage: 100,
            speedKbps: 4500,
            downloadedMb: finalMb,
            totalMb: finalMb,
          });
          return { success: true, localUri: localPath, type: 'apk' };
        } else if (existingInfo.exists) {
          await fsAny.deleteAsync(localPath, { idempotent: true });
        }
      } catch (_) {}

      this.lastDownloadedBytes = 0;
      this.lastTimestamp = Date.now();

      this.activeDownload = fsAny.createDownloadResumable(
        primaryUrl,
        localPath,
        {
          headers: {
            Accept: 'application/octet-stream',
            'User-Agent': 'AstroGuru-InApp-Downloader',
          },
        },
        (downloadProgress: any) => {
          const total = downloadProgress.totalBytesExpectedToWrite > 0
            ? downloadProgress.totalBytesExpectedToWrite
            : 44.8 * 1024 * 1024;
          const downloaded = downloadProgress.totalBytesWritten;
          const percentage = Math.min(100, Math.max(1, Math.floor((downloaded / total) * 100)));

          const now = Date.now();
          const timeDiff = (now - this.lastTimestamp) / 1000;
          let speedKbps = 2800;

          if (timeDiff >= 0.25) {
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
        const fileInfo = await fsAny.getInfoAsync(result.uri);
        if (fileInfo.exists && fileInfo.size > 5 * 1024 * 1024) {
          const finalMb = (fileInfo.size / (1024 * 1024)).toFixed(1);
          onProgress({
            totalBytes: fileInfo.size,
            downloadedBytes: fileInfo.size,
            percentage: 100,
            speedKbps: 4500,
            downloadedMb: finalMb,
            totalMb: finalMb,
          });
          return { success: true, localUri: result.uri, type: 'apk' };
        } else {
          return { success: false, type: 'apk', error: 'Downloaded file incomplete' };
        }
      }

      return { success: false, type: 'apk', error: 'No download result URI returned' };
    } catch (err: any) {
      console.warn('[InAppUpdateEngine] In-app APK streaming notice:', err);
      return { success: false, type: 'apk', error: err?.message || 'Download error' };
    }
  }

  /**
   * Installs the downloaded APK directly via Android package installer intent (NO BROWSER).
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

      // Launch native Android Package Installer directly on device
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: packageUri,
        flags: 1 | 268435456, // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
        type: 'application/vnd.android.package-archive',
      });
      return true;
    } catch (e: any) {
      console.warn('[InAppUpdateEngine] Native install launcher:', e);
      await this.openSettingsForInstallPermission();
      return false;
    }
  }

  /**
   * 1-Tap Unknown Apps Permission helper
   */
  async openSettingsForInstallPermission(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
          data: 'package:com.astroguru.app',
        });
      } catch (e) {
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