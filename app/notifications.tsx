import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useNotificationStore } from '../src/store/notificationStore';

type FilterType = 'all' | 'chat_message' | 'astrologer_live' | 'order' | 'wallet';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [filter, setFilter] = useState<FilterType>('all');

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  const handleTriggerTestPush = () => {
    triggerHaptic();
    addNotification({
      type: 'astrologer_live',
      title: '⚡ Major Planetary Transit Alert!',
      message: 'Sun entering Simha (Leo) — auspicious Abhijit Muhurta active! Tap to view your customized chart remedies.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      actionUrl: '/transit-alerts',
    });
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'order') return n.type === 'order_update' || n.type === 'spell_update';
    if (filter === 'wallet') return n.type === 'wallet';
    return n.type === filter;
  });

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'astrologer_live':
        return 'Join Live ›';
      case 'chat_message':
        return 'Reply ›';
      case 'spell_update':
      case 'order_update':
        return 'Track Order ›';
      case 'wallet':
        return 'Passbook ›';
      default:
        return 'View ›';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'spell_update':
        return { icon: '🪄', bg: '#F3E8FF', border: '#E9D5FF' };
      case 'wallet':
        return { icon: '💰', bg: '#ECFDF5', border: '#A7F3D0' };
      case 'order_update':
        return { icon: '🛍️', bg: '#FEF3C7', border: '#FDE68A' };
      case 'astrologer_live':
        return { icon: '🔴', bg: '#FFF1F2', border: '#FFE4E6' };
      default:
        return { icon: '🔔', bg: '#EFF6FF', border: '#BFDBFE' };
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Push Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts caught up'}
          showBack
        />

        {/* Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabsRow}
        >
          {[
            { id: 'all', label: '🌟 All Alerts' },
            { id: 'chat_message', label: '💬 Chats' },
            { id: 'astrologer_live', label: '🔴 Live Acharyas' },
            { id: 'order', label: '🪄 Spells & Orders' },
            { id: 'wallet', label: '💰 Wallet' },
          ].map((t) => {
            const active = filter === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  triggerHaptic();
                  setFilter(t.id as FilterType);
                }}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                {active && (
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header Action Bar */}
          <View style={styles.topActionsRow}>
            <Pressable
              onPress={handleTriggerTestPush}
              style={({ pressed }) => [styles.actionTestBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['#D97706', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.actionTestBtnText}>⚡ Send Test Push</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                markAllAsRead();
              }}
              style={({ pressed }) => [styles.actionSecondaryBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.actionSecondaryBtnText}>✓ Mark All Read</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                clearAll();
              }}
              style={({ pressed }) => [styles.actionDangerBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.actionDangerBtnText}>🗑️ Clear</Text>
            </Pressable>
          </View>

          {/* Notification List */}
          {filteredList.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Text style={{ fontSize: 36 }}>🔔</Text>
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>
                You are all caught up! New astrologer messages, puja updates, and live alerts will appear here.
              </Text>
            </View>
          ) : (
            filteredList.map((notif) => {
              const iconMeta = getNotificationIcon(notif.type);
              const actionLabel = getActionLabel(notif.type);

              return (
                <Pressable
                  key={notif.id}
                  onPress={() => {
                    triggerHaptic();
                    markAsRead(notif.id);
                    if (notif.actionUrl) {
                      router.push(notif.actionUrl as never);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.notifCard,
                    !notif.read && styles.notifCardUnread,
                    pressed && { opacity: 0.90, transform: [{ scale: 0.985 }] },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    {/* Avatar or Icon Circle */}
                    {notif.avatar ? (
                      <View style={styles.avatarWrap}>
                        <Image source={{ uri: notif.avatar }} style={styles.avatar} />
                        {notif.type === 'astrologer_live' && <View style={styles.liveBadgeDot} />}
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: iconMeta.bg, borderColor: iconMeta.border },
                        ]}
                      >
                        <Text style={{ fontSize: 20 }}>{iconMeta.icon}</Text>
                      </View>
                    )}

                    {/* Title & Unread Badge */}
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.notifTitle} numberOfLines={1}>
                          {notif.title}
                        </Text>
                        {!notif.read && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.notifMsg} numberOfLines={2}>
                        {notif.message}
                      </Text>
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.notifTime}>⏱️ {notif.timestamp}</Text>
                    <View style={styles.actionPill}>
                      <Text style={styles.actionPillText}>{actionLabel}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabsScroll: {
    flexGrow: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.9)',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    overflow: 'hidden',
  },
  tabBtnActive: {
    borderColor: 'transparent',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '800',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  scroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: 12,
  },

  /* Top Actions Row */
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  actionTestBtn: {
    flex: 1.2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTestBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  actionSecondaryBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondaryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  actionDangerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 202, 202, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDangerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },

  /* Notification Card */
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  notifCardUnread: {
    borderColor: 'rgba(5, 150, 105, 0.4)',
    shadowColor: '#93C5FD',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#059669',
  },
  liveBadgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  newBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#059669',
  },
  notifMsg: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16.5,
    fontWeight: '500',
  },

  /* Card Footer */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  notifTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  /* Empty State */
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1E1B4B',
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    fontWeight: '500',
    lineHeight: 18,
  },
});
