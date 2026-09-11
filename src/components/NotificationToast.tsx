import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationToast() {
  const router = useRouter();
  const toastNotification = useNotificationStore((s) => s.toastNotification);
  const dismissToast = useNotificationStore((s) => s.dismissToast);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  if (!toastNotification) return null;

  const handleTapToast = () => {
    markAsRead(toastNotification.id);
    dismissToast();
    if (toastNotification.actionUrl) {
      router.push(toastNotification.actionUrl as never);
    } else {
      router.push('/notifications');
    }
  };

  return (
    <Pressable
      onPress={handleTapToast}
      style={({ pressed }) => [styles.toastContainer, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.contentRow}>
        {toastNotification.avatar ? (
          <Image source={{ uri: toastNotification.avatar }} style={styles.avatar} />
        ) : (
          <Text style={{ fontSize: 26 }}>🔔</Text>
        )}

        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.title} numberOfLines={1}>
            {toastNotification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {toastNotification.message}
          </Text>
        </View>

        <Pressable onPress={dismissToast} hitSlop={10} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
    borderBottomWidth: 3.5,
    borderBottomColor: '#B45309',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.gold },
  title: { ...typography.h3, color: '#0F172A', fontSize: 14, fontWeight: '800' },
  message: { ...typography.small, color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  closeBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800' },
});
