/**
 * AstroGuru Direct APK In-App Downloader & Auto-Installer Service
 * Downloads the latest .apk directly inside the app with real progress (0-100%)
 * and launches the native Android Package Installer without leaving the app!
 */
import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

// FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456)
const ANDROID_INSTALL_FLAGS = 1 | 268435456;

export async function launchNativeInstaller(targetFileUri: string, apkUrl: string): Promise<boolean> {
  // Strategy 1: Sharing with system-level package-archive MIME type
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(targetFileUri, {
        mimeType: 'application/vnd.android.package-archive',
        dialogTitle: 'Install AstroGuru Update',
        UTI: 'com.astroguru.app',
      });
      return true;
    }
  } catch (shareErr) {
    console.warn('[Installer Strategy 1 - Sharing]', shareErr);
  }

  // Strategy 2: IntentLauncher VIEW
  try {
    const contentUri = await FileSystem.getContentUriAsync(targetFileUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: ANDROID_INSTALL_FLAGS,
      type: 'application/vnd.android.package-archive',
    });
    return true;
  } catch (intentErr) {
    console.warn('[Installer Strategy 2 - Intent VIEW]', intentErr);
  }

  // Strategy 3: Direct browser download fallback
  try {
    await Linking.openURL(apkUrl);
    return true;
  } catch (linkErr) {
    console.warn('[Installer Strategy 3 - Browser]', linkErr);
    return false;
  }
}

export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; error?: string; fileUri?: string }> {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Direct APK installation is only supported on Android devices.' };
  }

  try {
    const filename = 'astroguru_latest_update.apk';
    const targetFileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Delete previous downloaded apk if exists
    try {
      const fileInfo = await FileSystem.getInfoAsync(targetFileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(targetFileUri, { idempotent: true });
      }
    } catch (_) {}

    const downloadResumable = FileSystem.createDownloadResumable(
      apkUrl,
      targetFileUri,
      {},
      (downloadProgress) => {
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
  } catch (err: any) {
    console.warn('[APK Auto-Installer Error]', err);
    return { success: false, error: err?.message || 'Failed to install APK.' };
  }
}