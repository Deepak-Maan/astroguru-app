import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
    downloadedMb,
    totalMb,
    speedKbps,
    isDownloading,
    isReadyToInstall,
    startDownload,
    installUpdate,
    dismissUpdate,
    openPermissionSettings,
  } = useUpdateStore();

  if (Platform.OS === 'web' || !updateAvailable) return null;

  const handleForegroundDownload = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    startDownload(false);
  };

  const handleBackgroundDownload = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    startDownload(true);
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
                <Text style={styles.badgeText}>✨ OFFICIAL UPDATE</Text>
              </View>
              <Text style={{ fontSize: 36, marginVertical: 2 }}>🚀</Text>
              <Text style={styles.headerTitle}>AstroGuru Update Available</Text>
              
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  v{currentVersion} ➔ <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>v{latestVersion}</Text>
                </Text>
                <Text style={styles.sizeText}>• {totalMb} MB</Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in v{latestVersion}:</Text>
              <ScrollView style={{ maxHeight: 140 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteBullet}>•</Text>
                    <Text style={styles.noteText}>{note.replace(/^[•\s*]+/, '')}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Download Progress Bar */}
            {isDownloading && (
              <View style={styles.progressBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.progressLabel}>
                    📥 Streaming APK Package…
                  </Text>
                  <Text style={styles.progressPct}>
                    {downloadProgress}%
                  </Text>
                </View>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${Math.max(4, downloadProgress)}%` },
                    ]}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.speedText}>
                    {downloadedMb} MB / {totalMb} MB
                  </Text>
                  {speedKbps > 0 && (
                    <Text style={styles.speedText}>
                      ⚡ {(speedKbps / 1024).toFixed(1)} MB/s
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Ready State */}
            {isReadyToInstall && (
              <View style={styles.readyBox}>
                <Text style={styles.readyText}>
                  ✅ APK Download Complete! Tap below to install.
                </Text>
              </View>
            )}

            {/* Android 1-Tap Permission Helper */}
            <Pressable
              onPress={openPermissionSettings}
              style={({ pressed }) => [styles.permissionHelper, pressed && { opacity: 0.8 }]}
            >
              <Text style={{ fontSize: 13 }}>⚙️</Text>
              <Text style={styles.permissionText}>
                Need help? <Text style={{ textDecorationLine: 'underline', fontWeight: '800' }}>Allow "Install Unknown Apps" permission</Text>
              </Text>
            </Pressable>

            {/* Actions */}
            <View style={styles.actionColumn}>
              {isDownloading ? (
                <Button
                  label={`📥 Downloading (${downloadProgress}%)…`}
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
                <>
                  <Button
                    label={`📥 Download & Install (${totalMb} MB)`}
                    variant="gold"
                    size="md"
                    onPress={handleForegroundDownload}
                  />

                  {!isMandatory && (
                    <Pressable
                      onPress={handleBackgroundDownload}
                      style={({ pressed }) => [styles.bgDownloadBtn, pressed && { opacity: 0.85 }]}
                    >
                      <Text style={styles.bgDownloadText}>⏳ Download in Background</Text>
                    </Pressable>
                  )}
                </>
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
    maxWidth: 420,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 6,
  },
  versionText: {
    ...typography.small,
    color: '#FDE68A',
    fontWeight: '700',
  },
  sizeText: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notesContainer: {
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  notesHeader: {
    ...typography.small,
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: 6,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteBullet: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '900',
    lineHeight: 18,
  },
  noteText: {
    ...typography.small,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  progressBox: {
    padding: spacing.md,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  progressLabel: {
    ...typography.small,
    color: '#92400E',
    fontWeight: '800',
  },
  progressPct: {
    ...typography.small,
    color: '#D97706',
    fontWeight: '900',
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  speedText: {
    ...typography.tiny,
    color: '#64748B',
    fontWeight: '700',
  },
  readyBox: {
    padding: spacing.md,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    alignItems: 'center',
  },
  readyText: {
    ...typography.small,
    color: '#065F46',
    fontWeight: '800',
    textAlign: 'center',
  },
  permissionHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
  },
  permissionText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  actionColumn: {
    padding: spacing.md,
    gap: 10,
  },
  bgDownloadBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgDownloadText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
});