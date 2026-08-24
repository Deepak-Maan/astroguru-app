import React from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { useUpdateStore } from '../store/updateStore';
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
    downloadUrl,
    startDownload,
    installUpdate,
    dismissUpdate,
  } = useUpdateStore();

  if (Platform.OS === 'web' || !updateAvailable) return null;

  const targetApkUrl = downloadUrl || LIVE_DIRECT_APK_URL;

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes <= 0) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal visible={updateAvailable} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.webWrapper}>
          <View style={styles.card}>
            {/* Header Banner */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#D97706', '#E67E22', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>✨ NEW UPDATE READY</Text>
              </View>
              <Text style={{ fontSize: 36, marginVertical: 2 }}>🚀</Text>
              <Text style={styles.headerTitle}>AstroGuru Update Available</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  Current: v{currentVersion} ➔ <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>New: v{latestVersion}</Text>
                </Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in v{latestVersion}:</Text>
              <ScrollView style={{ maxHeight: 150 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteBullet}>•</Text>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Download Progress Bar */}
            {isDownloading && (
              <View style={styles.progressBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.progressLabel}>
                    📥 Downloading APK from GitHub…
                  </Text>
                  <Text style={styles.progressPct}>
                    {downloadProgress}%
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.speedText}>
                    {totalBytes > 0 ? `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}` : `${downloadProgress}% downloaded`}
                  </Text>
                  {speedKbps > 0 && (
                    <Text style={styles.speedText}>
                      ⚡ {(speedKbps / 1024).toFixed(1)} MB/s
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Ready to Install Notification */}
            {isReadyToInstall && !isDownloading && (
              <View style={styles.readyCard}>
                <Text style={styles.readyText}>
                  ✅ APK Download Complete! Tap below to install seamlessly.
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionColumn}>
              {isDownloading ? (
                <Button
                  label={`📥 Downloading APK (${downloadProgress}%)…`}
                  variant="gold"
                  size="md"
                  disabled
                  loading
                />
              ) : isReadyToInstall ? (
                <Button
                  label="📲 Install Update Now"
                  variant="gold"
                  size="md"
                  onPress={() => installUpdate()}
                />
              ) : (
                <Button
                  label="📥 Download & Install Update"
                  variant="gold"
                  size="md"
                  onPress={() => startDownload()}
                />
              )}

              {!isMandatory && !isDownloading && (
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
  noteBullet: {
    ...typography.small,
    color: colors.goldDark,
    fontWeight: '900',
    marginRight: 6,
  },
  noteText: {
    ...typography.small,
    color: colors.text,
    lineHeight: 18,
    flex: 1,
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
    color: colors.goldDark,
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
  speedText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '700',
  },
  readyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  readyText: {
    ...typography.small,
    color: '#047857',
    fontWeight: '800',
    textAlign: 'center',
  },
  actionColumn: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});