import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    isDownloading,
    isReadyToInstall,
    startDownload,
    installUpdate,
    dismissUpdate,
  } = useUpdateStore();

  if (!updateAvailable) return null;

  return (
    <Modal visible={updateAvailable} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.webWrapper}>
          <View style={styles.card}>
            {/* Header Banner */}
            <View style={styles.header}>
              <LinearGradient
                colors={[colors.auroraA, colors.saffron]}
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
                  v{currentVersion} ➔ <Text style={{ color: colors.goldSoft, fontWeight: '900' }}>v{latestVersion}</Text>
                </Text>
              </View>
            </View>

            {/* Release Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesHeader}>🎁 What's New in Version {latestVersion}:</Text>
              <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ gap: 8 }} showsVerticalScrollIndicator={false}>
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
            <View style={styles.actionRow}>
              {!isDownloading && !isReadyToInstall && (
                <>
                  {!isMandatory && (
                    <Button
                      label="Remind Later"
                      variant="outline"
                      size="md"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={dismissUpdate}
                    />
                  )}
                  <Button
                    label="⚡ Update App Now"
                    variant="gold"
                    size="md"
                    fullWidth={false}
                    style={{ flex: 1.4 }}
                    onPress={startDownload}
                  />
                </>
              )}

              {isDownloading && (
                <Button label="Downloading Package… (Please Wait)" variant="gold" size="md" disabled loading />
              )}

              {isReadyToInstall && (
                <Button label="🎉 Restart & Install Update Now" variant="gold" size="md" onPress={installUpdate} />
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
    backgroundColor: 'rgba(4,7,13,0.85)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#0D1524',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    gap: spacing.md,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  badgePill: {
    backgroundColor: 'rgba(7,13,24,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgeText: { ...typography.tiny, color: colors.goldSoft, fontWeight: '800', letterSpacing: 0.8 },
  headerTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  versionBadge: {
    backgroundColor: 'rgba(7,13,24,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  versionText: { ...typography.tiny, color: '#F8FAFC', fontWeight: '800', fontSize: 13 },

  notesContainer: { paddingHorizontal: spacing.xl, gap: spacing.xs },
  notesHeader: { ...typography.h3, color: colors.goldSoft, fontSize: 15, fontWeight: '800' },
  noteItem: {
    backgroundColor: '#070D18',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  noteText: { ...typography.small, color: '#F8FAFC', lineHeight: 18, fontWeight: '600' },

  progressBox: { paddingHorizontal: spacing.xl, gap: 6 },
  progressLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  progressPct: { ...typography.tiny, color: colors.goldSoft, fontWeight: '900' },
  track: { height: 8, backgroundColor: '#070D18', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  bar: { height: '100%', backgroundColor: colors.saffron, borderRadius: 4 },

  actionRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.xl, paddingTop: spacing.xs },
});

