import React from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { useUpdateStore } from '../store/updateStore';

const DIRECT_APK_DOWNLOAD_URL = 'https://expo.dev/accounts/deepak00007/projects/astrologer-app/builds';

export function AppUpdateModal() {
  const {
    currentVersion,
    latestVersion,
    updateAvailable,
    isMandatory,
    releaseNotes,
    downloadProgress,
    isDownloading,
    isReadyToInstall,
    startDownload,
    installUpdate,
    dismissUpdate,
  } = useUpdateStore();

  // On Web platform, updates happen automatically on page reload without modal popups
  if (Platform.OS === 'web' || !updateAvailable) return null;

  const handleDirectApkDownload = async () => {
    try {
      await Linking.openURL(DIRECT_APK_DOWNLOAD_URL);
    } catch (e) {
      console.warn('Failed to open direct APK link:', e);
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
                colors={[colors.saffron, colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>✨ NEW ASTROGURU VERSION READY</Text>
              </View>
              <Text style={{ fontSize: 38, marginVertical: 2 }}>🚀</Text>
              <Text style={styles.headerTitle}>Update Available!</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  v{currentVersion} ➔ <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>v{latestVersion}</Text>
                </Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in Version {latestVersion}:</Text>
              <ScrollView style={{ maxHeight: 160 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
                {releaseNotes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Download Progress Bar */}
            {(isDownloading || isReadyToInstall) && (
              <View style={styles.progressBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.progressLabel}>
                    {isReadyToInstall ? '✅ Update Package Downloaded!' : 'Downloading Update Bundle…'}
                  </Text>
                  <Text style={styles.progressPct}>{downloadProgress}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.bar, { width: `${downloadProgress}%` }]} />
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionColumn}>
              {!isDownloading && !isReadyToInstall && (
                <>
                  <Button
                    label="⚡ Update App Now (Instant OTA)"
                    variant="gold"
                    size="md"
                    onPress={startDownload}
                  />
                  <Button
                    label="📥 Direct Download & Install APK"
                    variant="outline"
                    size="md"
                    onPress={handleDirectApkDownload}
                  />
                  {!isMandatory && (
                    <Pressable onPress={dismissUpdate} style={{ paddingVertical: 4, alignItems: 'center' }}>
                      <Text style={{ ...typography.tiny, color: colors.textMuted, fontWeight: '700' }}>
                        Remind Me Later
                      </Text>
                    </Pressable>
                  )}
                </>
              )}

              {isDownloading && (
                <Button label="Downloading Package… (Please Wait)" variant="gold" size="md" disabled loading />
              )}

              {isReadyToInstall && (
                <Button label="📦 Install New Version Now" variant="gold" size="md" onPress={installUpdate} />
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
    backgroundColor: 'rgba(30,41,59,0.50)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#E6ECF5',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    gap: spacing.md,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  badgePill: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgeText: { ...typography.tiny, color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.8 },
  headerTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  versionBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  versionText: { ...typography.tiny, color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  notesContainer: { paddingHorizontal: spacing.xl, gap: spacing.xs },
  notesHeader: { ...typography.h3, color: colors.gold, fontSize: 15, fontWeight: '800' },
  noteItem: {
    backgroundColor: '#EEF2F7',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.3)',
    borderRightColor: 'rgba(163, 177, 198, 0.3)',
  },
  noteText: { ...typography.small, color: colors.text, lineHeight: 18, fontWeight: '600' },

  progressBox: { paddingHorizontal: spacing.xl, gap: 6 },
  progressLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  progressPct: { ...typography.tiny, color: colors.gold, fontWeight: '900' },
  track: { height: 8, backgroundColor: '#DFE6F0', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(217,119,6,0.3)' },
  bar: { height: '100%', backgroundColor: colors.saffron, borderRadius: 4 },

  actionColumn: { gap: spacing.xs, padding: spacing.xl, paddingTop: spacing.xs },
});
