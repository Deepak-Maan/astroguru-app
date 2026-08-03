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
    <Modal visible={updateAvailable} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header Banner */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#7D3C98', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={{ fontSize: 42 }}>🚀</Text>
            <Text style={styles.headerTitle}>New Update Available!</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                v{currentVersion} ➔ <Text style={{ color: colors.saffron, fontWeight: '900' }}>v{latestVersion}</Text>
              </Text>
            </View>
          </View>

          {/* Release Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesHeader}>🎁 What's New in v{latestVersion}:</Text>
            <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ gap: 6 }}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.progressLabel}>
                  {isReadyToInstall ? '✅ Package Downloaded!' : 'Downloading Update Package…'}
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
              <Button label="Downloading Package… (Wait)" variant="gold" size="md" disabled loading />
            )}

            {isReadyToInstall && (
              <Button label="🎉 Restart & Install Update" variant="gold" size="md" onPress={installUpdate} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27,20,56,0.65)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  headerTitle: { ...typography.h1, color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  versionText: { ...typography.tiny, color: colors.text, fontWeight: '800', fontSize: 12 },

  notesContainer: { paddingHorizontal: spacing.xl, gap: spacing.xs },
  notesHeader: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  noteText: { ...typography.small, color: colors.text, lineHeight: 18, fontWeight: '600' },

  progressBox: { paddingHorizontal: spacing.xl, gap: 4 },
  progressLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  progressPct: { ...typography.tiny, color: colors.saffron, fontWeight: '900' },
  track: { height: 8, backgroundColor: '#F8FAFC', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#E3E8F3' },
  bar: { height: '100%', backgroundColor: colors.saffron, borderRadius: 4 },

  actionRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.xl, paddingTop: 0 },
});
