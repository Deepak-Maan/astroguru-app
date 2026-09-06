/**
 * AstroGuru Native In-App APK Downloader & Package Installer Engine
 * True In-App APK streaming, byte counter, transfer speed, Android Intent installation,
 * and zero browser redirects.
 */

import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { getAppVersionFromFirebase } from '../firebaseRealtimeService';

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
export const GITHUB_API_ALL_RELEASES = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
export const GITHUB_API_LATEST_RELEASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// Fallback known valid APK download URLs in case a newly created GitHub release does not have an asset uploaded yet
export const FALLBACK_RELEASE_APK_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v2.8.7/astro-2.8.4.apk`;

export function getDirectApkDownloadUrl(version: string, assetName: string = 'app-release.apk'): string {
  const cleanVer = version.replace(/^v/i, '').trim();
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${cleanVer}/${assetName}`;
}

export function isRemoteVersionNewer(remoteVer: string, currentVer: string): boolean {
  if (!remoteVer || !currentVer) return false;

  const cleanRemote = remoteVer.trim().replace(/^v/i, '');
  const cleanCurrent = currentVer.trim().replace(/^v/i, '');

  if (cleanRemote === cleanCurrent) return false;

  // Numeric versionCode check (e.g. "288" vs "287")
  const remoteNum = parseInt(cleanRemote, 10);
  const currentNum = parseInt(cleanCurrent, 10);
  if (!isNaN(remoteNum) && !isNaN(currentNum) && !cleanRemote.includes('.') && !cleanCurrent.includes('.')) {
    return remoteNum > currentNum;
  }

  // Semver check (e.g. "2.8.8" vs "2.8.7")
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
   * Checks GitHub and Firebase for the latest release metadata.
   */
  async checkForUpdate(currentVersion: string, fallbackVersion: string): Promise<InAppUpdateCheckResult> {
    const currentCode = Application.nativeBuildVersion || '288';
    const currentName = Application.nativeApplicationVersion || currentVersion || '2.8.8';

    // 1. Check Firebase first for any urgent/admin broadcasted version
    let fbData: any = null;
    try {
      fbData = await getAppVersionFromFirebase();
    } catch (_) {}

    // 2. Query GitHub Releases API for all releases and assets
    try {
      const response = await fetch(GITHUB_API_ALL_RELEASES, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AstroGuru-InApp-Updater',
        },
      });

      if (response.ok) {
        const releases = await response.json();
        if (Array.isArray(releases) && releases.length > 0) {
          // Find the latest non-draft release
          const validReleases = releases.filter((r: any) => !r.draft);
          const topRelease = validReleases[0] || releases[0];
          const rawTag = topRelease.tag_name || '';
          const cleanTag = rawTag.replace(/^v/i, '').trim();

          // Find first release in list that has an actual .apk asset
          let bestApkAsset: any = null;

          for (const rel of validReleases) {
            const asset = rel.assets?.find((a: any) =>
              typeof a.name === 'string' && a.name.toLowerCase().endsWith('.apk')
            );
            if (asset) {
              bestApkAsset = asset;
              break;
            }
          }

          const targetVer = fbData?.latestVersion || cleanTag || fallbackVersion;
          const isNewer =
            isRemoteVersionNewer(targetVer, currentCode) ||
            isRemoteVersionNewer(targetVer, currentName);

          const directUrl =
            fbData?.apkUrl ||
            bestApkAsset?.browser_download_url ||
            FALLBACK_RELEASE_APK_URL;

          const rawSize = bestApkAsset?.size ? (bestApkAsset.size / (1024 * 1024)).toFixed(1) : '44.8';
          const isMandatory = topRelease.body?.toLowerCase().includes('[mandatory]') || false;

          const formattedNotes: string[] = [];
          const sourceBody = fbData?.releaseNotes ? fbData.releaseNotes.join('\n') : topRelease.body;

          if (sourceBody) {
            sourceBody
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
            latestVersion: targetVer,
            releaseNotes: notes,
            isMandatory,
            type: 'apk',
            downloadUrl: directUrl,
            apkFileName: bestApkAsset?.name || `AstroGuru-v${targetVer}.apk`,
            apkSizeMb: parseFloat(rawSize),
          };
        }
      }
    } catch (ghErr) {
      console.log('[InAppUpdateEngine] GitHub Releases check notice:', ghErr);
    }

    // 3. Fallback to Firebase or default
    const finalFallbackVersion = fbData?.latestVersion || fallbackVersion;
    const isNewerFallback = isRemoteVersionNewer(finalFallbackVersion, currentName);

    return {
      isAvailable: isNewerFallback,
      currentVersion: currentName,
      latestVersion: finalFallbackVersion,
      releaseNotes: fbData?.releaseNotes || [
        '• 👑 Ultra-Premium Imperial Gold & Crystal Glass Design System.',
        '• 💬 Astrotalk-Grade 1-on-1 Chat, Voice Call & Live Streaming.',
        '• 🧭 Vastu Compass, Love Meter & Daily Karma Rewards.',
        '• 📲 100% In-App Direct APK Streaming & Auto-Installer.',
      ],
      isMandatory: false,
      type: 'apk',
      downloadUrl: fbData?.apkUrl || FALLBACK_RELEASE_APK_URL,
      apkFileName: `AstroGuru-v${finalFallbackVersion}.apk`,
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
    const candidateUrls = [
      customApkUrl,
      FALLBACK_RELEASE_APK_URL,
      getDirectApkDownloadUrl(cleanVer),
    ].filter((u): u is string => Boolean(u && u.startsWith('http')));

    const fsAny = FileSystem as any;
    const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;

    if (!targetDir || typeof fsAny.createDownloadResumable !== 'function') {
      return { success: false, type: 'apk', error: 'FileSystem storage not available' };
    }

    await this.cleanupOldApks(cleanVer);

    const fileName = `AstroGuru-v${cleanVer}.apk`;
    const localPath = `${targetDir}${fileName}`;

    // If already fully downloaded and valid (> 5MB)
    try {
      const existingInfo = await fsAny.getInfoAsync(localPath);
      if (existingInfo.exists && existingInfo.size > 5 * 1024 * 1024) {
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

    // Try candidate download URLs in order
    let lastError = 'Download failed';
    for (const url of candidateUrls) {
      try {
        this.lastDownloadedBytes = 0;
        this.lastTimestamp = Date.now();

        this.activeDownload = fsAny.createDownloadResumable(
          url,
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
          // Valid APK binary must be at least 2MB (prevents 404 HTML response pages)
          if (fileInfo.exists && fileInfo.size > 2 * 1024 * 1024) {
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
            try {
              await fsAny.deleteAsync(result.uri, { idempotent: true });
            } catch (_) {}
            lastError = 'Remote server returned incomplete file. Trying fallback…';
          }
        }
      } catch (e: any) {
        lastError = e?.message || 'Download error';
        console.warn(`[InAppUpdateEngine] Failed downloading from ${url}:`, e);
      }
    }

    return {
      success: false,
      type: 'apk',
      error: lastError || 'Unable to download APK package. Please check connection.',
    };
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