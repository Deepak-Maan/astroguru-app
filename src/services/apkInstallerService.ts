/**
 * AstroGuru Direct APK In-App Downloader & Auto-Installer Service
 * Downloads the latest .apk directly inside the app with real progress (0-100%)
 * and launches the native Android Package Installer without leaving the app!
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; error?: string }> {
  if (Platform.OS !== 'android') {
    return { success: false, error: 'Direct APK installation is only supported on Android devices.' };
  }

  try {
    const filename = 'astroguru_latest_update.apk';
    const targetFileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Delete previous downloaded apk if exists
    const fileInfo = await FileSystem.getInfoAsync(targetFileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(targetFileUri, { idempotent: true });
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      apkUrl,
      targetFileUri,
      {},
      (downloadProgress) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
          if (onProgress) onProgress(pct);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('APK download failed to write to local storage.');
    }

    if (onProgress) onProgress(100);

    // Convert to content URI for Android Intent
    const contentUri = await FileSystem.getContentUriAsync(result.uri);

    // Launch Android Package Installer
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });

    return { success: true };
  } catch (err: any) {
    console.warn('[APK Auto-Installer Error]', err);
    return { success: false, error: err?.message || 'Failed to install APK.' };
  }
}