import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { useUpdateStore } from '../store/updateStore';

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
    startDownload,
    installUpdate,
    downloadDirectApk,
    dismissUpdate,
  } = useUpdateStore();

  // On Web platform, updates happen automatically on page reload without modal popups
  if (Platform.OS === 'web' || !updateAvailable) return null;

  const formattedDownloadedMb = (downloadedBytes / (1024 * 1024)).toFixed(1);
  const formattedTotalMb = (totalBytes / (1024 * 1024)).toFixed(1);
  const formattedSpeedMb = (speedKbps / 1024).toFixed(1);

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
              <ScrollView
                style={{ maxHeight: 150 }}
                contentContainerStyle={{ gap: 6 }}
                showsVerticalScrollIndicator={false}
              >
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Live In-App Download Progress Box */}
            {(isDownloading || isReadyToInstall) && (
              <View style={styles.progressBox}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressLabel}>
                    {isReadyToInstall ? '✅ Package Downloaded! Ready to Install' : '📥 Downloading In-App Package…'}
                  </Text>
                  <Text style={styles.progressPct}>{downloadProgress}%</Text>
                </View>

                {/* Progress Track */}
                <View style={styles.track}>
                  <LinearGradient
                    colors={['#F59E0B', '#E67E22']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.bar, { width: `${Math.max(5, downloadProgress)}%` }]}
                  />
                </View>

                {/* Download Meta stats */}
                {isDownloading && totalBytes > 0 && (
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                      {formattedDownloadedMb} MB / {formattedTotalMb} MB
                    </Text>
                    {speedKbps > 0 && (
                      <Text style={[styles.statsText, { color: colors.teal }]}>
                        ⚡ {formattedSpeedMb} MB/s
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* In-App Action Buttons */}
            <View style={styles.actionColumn}>
              {!isDownloading && !isReadyToInstall && (
                <>
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

              {isDownloading && (
                <Button
                  label={`Downloading Package (${downloadProgress}%)… Please Wait`}
                  variant="gold"
                  size="md"
                  disabled
                  loading
                />
              )}

              {isReadyToInstall && (
                <Button
                  label="📦 Install New Version Now"
                  variant="gold"
                  size="md"
                  onPress={installUpdate}
                />
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.90)',
    gap: spacing.sm,
    shadowColor: 'rgba(15,23,42,0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 3,
  },
  badgePill: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 2,
  },
  badgeText: { ...typography.tiny, color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.8, fontSize: 10 },
  headerTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  versionBadge: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  versionText: { ...typography.tiny, color: '#FFFFFF', fontWeight: '800', fontSize: 12.5 },

  notesContainer: { paddingHorizontal: spacing.lg, gap: 5 },
  notesHeader: { ...typography.h3, color: '#0F172A', fontSize: 14, fontWeight: '900' },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.70)',
  },
  noteText: { ...typography.small, color: '#334155', lineHeight: 17, fontWeight: '600', fontSize: 12 },

  progressBox: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: 5,
    backgroundColor: '#F0FDF4',
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.30)',
  },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { ...typography.tiny, color: colors.teal, fontWeight: '800', fontSize: 11 },
  progressPct: { ...typography.tiny, color: colors.goldSoft, fontWeight: '900', fontSize: 12 },
  track: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 4.5,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 4.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 },
  statsText: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '700' },

  actionColumn: { gap: 8, padding: spacing.lg, paddingTop: spacing.xs },
});
