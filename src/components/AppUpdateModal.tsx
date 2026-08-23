import React, { useState } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { useUpdateStore } from '../store/updateStore';
import { downloadAndInstallApk, launchNativeInstaller } from '../services/apkInstallerService';
import { LIVE_DIRECT_APK_URL } from '../services/updates/inAppUpdateEngine';

export function AppUpdateModal() {
  const {
    currentVersion,
    latestVersion,
    updateAvailable,
    isMandatory,
    releaseNotes,
    downloadProgress,
    downloadedBytes,
    totalBytes,
    speedKbps,
    isDownloading,
    isReadyToInstall,
    updateType,
    downloadUrl,
    startDownload,
    installUpdate,
    downloadDirectApk,
    dismissUpdate,
  } = useUpdateStore();

  const [isApkDownloading, setIsApkDownloading] = useState(false);
  const [apkProgress, setApkProgress] = useState(0);
  const [downloadedApkUri, setDownloadedApkUri] = useState<string | null>(null);

  if (Platform.OS === 'web' || !updateAvailable) return null;

  const targetApkUrl = downloadUrl || LIVE_DIRECT_APK_URL;

  const handleInAppApkInstall = async () => {
    setIsApkDownloading(true);
    setApkProgress(10);
    setDownloadedApkUri(null);

    try {
      const res = await downloadAndInstallApk(targetApkUrl, (pct) => {
        setApkProgress(pct);
      });

      setIsApkDownloading(false);
      if (res.fileUri) {
        setDownloadedApkUri(res.fileUri);
      }

      if (!res.success && res.error) {
        Alert.alert(
          'APK Ready to Install',
          'Download complete. Tap "Open & Install APK" below, or download directly via browser.',
          [
            {
              text: 'Open in Browser',
              onPress: () => Linking.openURL(targetApkUrl),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (e) {
      setIsApkDownloading(false);
      await Linking.openURL(targetApkUrl);
    }
  };

  const handleLaunchPackageInstaller = async () => {
    try {
      if (downloadedApkUri) {
        await launchNativeInstaller(downloadedApkUri, targetApkUrl);
      } else {
        await downloadAndInstallApk(targetApkUrl);
      }
    } catch (_) {
      await Linking.openURL(targetApkUrl);
    }
  };

  return (
    <Modal visible={updateAvailable} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.webWrapper}>
          <View style={styles.card}>
            {/* Header Banner */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#D97706', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>✨ NEW VERSION v{latestVersion} READY</Text>
              </View>
              <Text style={{ fontSize: 36, marginVertical: 2 }}>🚀</Text>
              <Text style={styles.headerTitle}>In-App App Installer</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  Current: v{currentVersion} ➔ <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>New: v{latestVersion}</Text>
                </Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in Version {latestVersion}:</Text>
              <ScrollView style={{ maxHeight: 150 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Download Progress Bar */}
            {(isDownloading || isApkDownloading) && (
              <View style={styles.progressBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.progressLabel}>
                    {isApkDownloading
                      ? '📥 Downloading APK Package…'
                      : '⚡ Fetching Update Bundle…'}
                  </Text>
                  <Text style={styles.progressPct}>
                    {isApkDownloading ? apkProgress : downloadProgress}%
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${isApkDownloading ? apkProgress : downloadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionColumn}>
              {isApkDownloading ? (
                <Button
                  label={`📥 Downloading APK (${apkProgress}%)…`}
                  variant="gold"
                  size="md"
                  disabled
                  loading
                />
              ) : isDownloading ? (
                <Button
                  label={`⚡ Fetching Update (${downloadProgress}%)…`}
                  variant="gold"
                  size="md"
                  disabled
                  loading
                />
              ) : (
                <>
                  {Platform.OS === 'android' && downloadedApkUri ? (
                    <Button
                      label="📲 Open & Install Downloaded APK"
                      variant="gold"
                      size="md"
                      onPress={handleLaunchPackageInstaller}
                    />
                  ) : Platform.OS === 'android' ? (
                    <Button
                      label="📥 In-App Download & Auto-Install APK"
                      variant="gold"
                      size="md"
                      onPress={handleInAppApkInstall}
                    />
                  ) : null}

                  <Button
                    label="📥 Download & Install New Version"
                    variant="gold"
                    size="md"
                    onPress={() => startDownload()}
                  />
                  <Button
                    label="🌐 Direct APK Package Downloader"
                    variant="outline"
                    size="md"
                    onPress={() => downloadDirectApk()}
                  />
                  {!isMandatory && (
                    <Pressable
                      onPress={dismissUpdate}
                      style={({ pressed }) => [
                        { paddingVertical: 6, alignItems: 'center' },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={{ ...typography.tiny, color: colors.textMuted, fontWeight: '700' }}>
                        Remind Me Later
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  badgePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 4,
  },
  versionBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  versionText: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesContainer: {
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
  },
  notesHeader: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    ...typography.small,
    color: colors.text,
    lineHeight: 18,
  },
  progressBox: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  progressLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '700',
  },
  progressPct: {
    ...typography.tiny,
    color: colors.gold,
    fontWeight: '900',
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 4,
  },
  actionColumn: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});