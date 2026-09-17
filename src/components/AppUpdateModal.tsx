import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useUpdateStore } from '../store/updateStore';
import { openUnknownAppSourcesSettings } from '../services/apkInstallerService';

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
    startDownload,
    installUpdate,
    downloadDirectApk,
    dismissUpdate,
  } = useUpdateStore();

  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  if (!updateAvailable) return null;

  const handlePrimaryPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isReadyToInstall) {
      installUpdate();
    } else if (!isDownloading) {
      startDownload();
    }
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await openUnknownAppSourcesSettings();
  };

  const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(1);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const speedMBps = ((speedKbps || 0) / 1024).toFixed(1);

  return (
    <Modal visible={updateAvailable} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.webWrapper}>
          <View style={styles.card}>
            {/* Header Banner */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#4F46E5', '#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>✨ OFFICIAL UPDATE AVAILABLE</Text>
              </View>
              <Text style={{ fontSize: 38, marginVertical: 4 }}>🚀</Text>
              <Text style={styles.headerTitle}>AstroGuru v{latestVersion}</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  Installed: v{currentVersion} ➔ <Text style={{ color: '#C7D2FE', fontWeight: '900' }}>New: v{latestVersion}</Text>
                </Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in This Version:</Text>
              <ScrollView
                style={{ maxHeight: 150 }}
                contentContainerStyle={{ gap: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Live Progress Bar Section */}
            {isDownloading && (
              <View style={styles.progressBox}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressLabel}>
                    📥 Downloading Update Package…
                  </Text>
                  <Text style={styles.progressPct}>{downloadProgress}%</Text>
                </View>

                {/* Animated Track */}
                <View style={styles.track}>
                  <LinearGradient
                    colors={[colors.saffron, colors.gold, '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.bar, { width: `${Math.max(4, downloadProgress)}%` }]}
                  />
                </View>

                <View style={styles.progressMetaRow}>
                  <Text style={styles.progressMetaText}>
                    {downloadedMB} MB / {totalMB} MB
                  </Text>
                  <Text style={styles.progressMetaSpeed}>
                    ⚡ {speedMBps} MB/s
                  </Text>
                </View>
              </View>
            )}

            {/* Installation Ready Callout with Unknown Apps Helper */}
            {isReadyToInstall && !isDownloading && (
              <View style={styles.readyBox}>
                <Text style={styles.readyTitle}>✅ Package Downloaded Successfully!</Text>
                <Text style={styles.readySubtitle}>
                  If Android asks for permission: Tap "Allow from this source" in Settings.
                </Text>
              </View>
            )}

            {/* Unknown Apps Permission Helper Box */}
            {Platform.OS === 'android' && (
              <View style={styles.permissionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.permissionTitle}>🛡️ Android Security Tip:</Text>
                  <Text style={styles.permissionDesc}>
                    If install is blocked, turn ON "Allow from this source".
                  </Text>
                </View>
                <Pressable onPress={handleOpenSettings} style={styles.settingsPill}>
                  <Text style={styles.settingsPillText}>⚙️ Settings</Text>
                </Pressable>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionColumn}>
              <Pressable
                onPress={handlePrimaryPress}
                disabled={isDownloading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  isDownloading && styles.primaryBtnDisabled,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
              >
                <LinearGradient
                  colors={
                    isReadyToInstall
                      ? ['#059669', '#10B981']
                      : ['#FF3366', '#F43F5E']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.primaryBtnText}>
                  {isDownloading
                    ? `⏳ Downloading (${downloadProgress}%)…`
                    : isReadyToInstall
                    ? '📲 Tap to Install Update Now'
                    : `📥 Download & Install Update (v${latestVersion})`}
                </Text>
              </Pressable>

              {/* Direct Browser Fallback */}
              <Pressable
                onPress={downloadDirectApk}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.secondaryBtnText}>🌐 Download via Web Browser</Text>
              </Pressable>

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
    backgroundColor: 'rgba(4, 6, 15, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    backgroundColor: '#11162B',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 4,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  badgePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    ...typography.tiny,
    color: '#E0E7FF',
    fontWeight: '900',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 2,
    fontSize: 22,
  },
  versionBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  versionText: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '700',
    fontSize: 12,
  },
  notesContainer: {
    padding: spacing.md,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.2)',
  },
  notesHeader: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    ...typography.small,
    color: '#EEF2FF',
    lineHeight: 18,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBox: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontWeight: '800',
    fontSize: 12,
  },
  progressPct: {
    ...typography.tiny,
    color: colors.gold,
    fontWeight: '900',
    fontSize: 13,
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(15, 20, 45, 0.95)',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressMetaText: {
    fontSize: 11,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  progressMetaSpeed: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
  },
  readyBox: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  readyTitle: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 13.5,
  },
  readySubtitle: {
    color: '#A7F3D0',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 14,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: 12,
    gap: 8,
  },
  permissionTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#38BDF8',
  },
  permissionDesc: {
    fontSize: 10.5,
    color: '#BAE6FD',
    fontWeight: '600',
    marginTop: 1,
  },
  settingsPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  settingsPillText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  actionColumn: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  primaryBtn: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 3.5,
    borderBottomColor: '#BE123C',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnDisabled: {
    opacity: 0.85,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.pill,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#A5B4FC',
    fontWeight: '800',
    fontSize: 12.5,
  },
});