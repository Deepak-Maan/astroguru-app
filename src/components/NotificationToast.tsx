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
    backgroundColor: '#E6ECF5',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(217, 119, 6, 0.4)',
    borderRightColor: 'rgba(217, 119, 6, 0.4)',
    overflow: 'hidden',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.gold },
  title: { ...typography.h3, color: colors.text, fontSize: 14, fontWeight: '800' },
  message: { ...typography.small, color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  closeBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: '#E6ECF5',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  closeText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800' },
});
