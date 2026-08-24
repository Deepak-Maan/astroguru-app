/**
 * AstroGuru Direct APK In-App Downloader & Auto-Installer Service
 * Downloads the latest .apk directly inside the app with real progress (0-100%)
 * and launches the native Android Package Installer without leaving the app!
 */
import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

// FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456)
const ANDROID_INSTALL_FLAGS = 1 | 268435456;

export async function launchNativeInstaller(targetFileUri: string, apkUrl: string): Promise<boolean> {
  // Strategy 1: IntentLauncher VIEW with content:// URI
  try {
    const fsAny = FileSystem as any;
    const getContentUri = fsAny.getContentUriAsync || FileSystem.getContentUriAsync;

    let packageUri = targetFileUri;
    if (typeof getContentUri === 'function') {
      packageUri = await getContentUri(targetFileUri);
    }

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: packageUri,
      flags: ANDROID_INSTALL_FLAGS,
      type: 'application/vnd.android.package-archive',
    });
    return true;
  } catch (intentErr) {
    console.warn('[Installer Strategy 1 - Intent VIEW]', intentErr);
  }

  // Strategy 2: Direct browser download fallback
  try {
    await Linking.openURL(apkUrl);
    return true;
  } catch (linkErr) {
    console.warn('[Installer Strategy 2 - Browser]', linkErr);
  }

  // Strategy 3: Sharing with system-level package-archive MIME type
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(targetFileUri, {
        mimeType: 'application/vnd.android.package-archive',
        dialogTitle: 'Install AstroGuru Update',
        UTI: 'com.android.package-archive',
      });
      return true;
    }
  } catch (shareErr) {
    console.warn('[Installer Strategy 3 - Sharing]', shareErr);
    return false;
  }
  return false;
}

export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; error?: string; fileUri?: string }> {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Direct APK installation is only supported on Android devices.' };
  }

  try {
    const fsAny = FileSystem as any;
    const targetDir = fsAny.cacheDirectory || fsAny.documentDirectory;
    const filename = 'astroguru_latest_update.apk';
    const targetFileUri = `${targetDir}${filename}`;

    // Delete previous downloaded apk if exists
    try {
      const fileInfo = await fsAny.getInfoAsync(targetFileUri);
      if (fileInfo.exists) {
        await fsAny.deleteAsync(targetFileUri, { idempotent: true });
      }
    } catch (_) {}

    if (typeof fsAny.createDownloadResumable === 'function') {
      const downloadResumable = fsAny.createDownloadResumable(
        apkUrl,
        targetFileUri,
        {},
        (downloadProgress: any) => {
          if (downloadProgress.totalBytesExpectedToWrite > 0) {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            const pct = Math.min(99, Math.max(1, Math.round(progress * 100)));
            if (onProgress) onProgress(pct);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) {
        throw new Error('APK download failed to write to local storage.');
      }

      if (onProgress) onProgress(100);

      // Launch package installer
      const launched = await launchNativeInstaller(result.uri, apkUrl);
      return { success: launched, fileUri: result.uri };
    }

    // Direct browser fallback
    await Linking.openURL(apkUrl);
    return { success: true };
  } catch (err: any) {
    console.warn('[APK Auto-Installer Error]', err);
    try {
      await Linking.openURL(apkUrl);
      return { success: true };
    } catch (_) {
      return { success: false, error: err?.message || 'Failed to install APK.' };
    }
  }
}