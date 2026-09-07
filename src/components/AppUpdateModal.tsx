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

  if (Platform.OS === 'web' || !updateAvailable) return null;

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
                colors={['#D97706', '#E67E22', '#F59E0B']}
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
                  Installed: v{currentVersion} ➔ <Text style={{ color: '#FDE68A', fontWeight: '900' }}>New: v{latestVersion}</Text>
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
                      : ['#D97706', '#F59E0B']
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
    backgroundColor: 'rgba(6, 10, 18, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
    color: '#FDE68A',
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  versionText: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11.5,
  },
  notesContainer: {
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  notesHeader: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    fontSize: 11,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    ...typography.small,
    color: '#1E293B',
    lineHeight: 18,
    fontSize: 12,
    fontWeight: '600',
  },
  progressBox: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.tiny,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11.5,
  },
  progressPct: {
    ...typography.tiny,
    color: colors.saffron,
    fontWeight: '900',
    fontSize: 13,
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
    borderRadius: 4,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressMetaText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '700',
  },
  progressMetaSpeed: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '800',
  },
  readyBox: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  readyTitle: {
    color: '#047857',
    fontWeight: '900',
    fontSize: 13,
  },
  readySubtitle: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: 10,
    gap: 8,
  },
  permissionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E40AF',
  },
  permissionDesc: {
    fontSize: 10,
    color: '#1E3A8A',
    fontWeight: '600',
    marginTop: 1,
  },
  settingsPill: {
    backgroundColor: '#2563EB',
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
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 12,
  },
});