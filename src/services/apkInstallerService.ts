/**
 * AstroGuru Direct APK In-App Downloader & Auto-Installer Service
 * Downloads the latest .apk directly inside the app with real progress (0-100%)
 * and launches the native Android Package Installer without leaving the app!
 */
import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

// FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456)
const ANDROID_INSTALL_FLAGS = 1 | 268435456;

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

    // Convert file:// to content:// URI using Expo FileProvider
    const contentUri = await FileSystem.getContentUriAsync(result.uri);

    // 1. Try Primary Android Package Installer Intent (VIEW)
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: ANDROID_INSTALL_FLAGS,
        type: 'application/vnd.android.package-archive',
      });
      return { success: true, fileUri: result.uri };
    } catch (viewError) {
      console.warn('[APK Installer VIEW Intent Failed, trying INSTALL_PACKAGE]', viewError);

      // 2. Try Secondary Install Intent (INSTALL_PACKAGE)
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: contentUri,
          flags: ANDROID_INSTALL_FLAGS,
          type: 'application/vnd.android.package-archive',
        });
        return { success: true, fileUri: result.uri };
      } catch (installError) {
        console.warn('[APK Installer INSTALL_PACKAGE Intent Failed, trying Linking]', installError);

        // 3. Fallback to open content URI or Direct Download Link
        try {
          const canOpen = await Linking.canOpenURL(apkUrl);
          if (canOpen) {
            await Linking.openURL(apkUrl);
          }
        } catch (_) {}

        return { success: false, error: 'Could not open package installer automatically. Please tap download link.' };
      }
    }
  } catch (err: any) {
    console.warn('[APK Auto-Installer Error]', err);
    return { success: false, error: err?.message || 'Failed to install APK.' };
  }
}