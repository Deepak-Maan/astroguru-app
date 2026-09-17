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
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useNotificationStore } from '../src/store/notificationStore';
import { triggerInstantMorningMuhuratTestPush } from '../src/services/pushNotificationService';

type FilterType = 'all' | 'chat_message' | 'astrologer_live' | 'order';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const [filter, setFilter] = useState<FilterType>('all');

  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleTriggerTestPush = () => {
    addNotification({
      type: 'astrologer_live',
      title: '⚡ Major Planetary Transit Push Alert!',
      message: 'Sun entering Simha (Leo) — auspicious muhurta active! Tap to view your chart remedies.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      actionUrl: '/transit-alerts',
    });
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'order') return n.type === 'order_update' || n.type === 'spell_update';
    return n.type === filter;
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Push Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts read'}
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
            { id: 'all', label: 'All Alerts' },
            { id: 'chat_message', label: '💬 Messages' },
            { id: 'astrologer_live', label: '🔴 Live Experts' },
            { id: 'order', label: '🛒 Orders & Spells' },
          ].map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setFilter(t.id as FilterType)}
              style={[styles.tabBtn, filter === t.id && styles.tabBtnActive]}
            >
              {filter === t.id && (
                <LinearGradient
                  colors={[colors.teal, '#047857']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.tabBtnText, filter === t.id && styles.tabBtnTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header Action Bar */}
          <View style={styles.topActionsRow}>
            <Button
              label="⚡ Test Push"
              variant="gold"
              size="sm"
              fullWidth={false}
              onPress={handleTriggerTestPush}
            />
            <Button
              label="🌅 7 AM Muhurat"
              variant="coral"
              size="sm"
              fullWidth={false}
              onPress={triggerInstantMorningMuhuratTestPush}
            />
            <Button
              label="Mark All Read"
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={markAllAsRead}
            />
            <Button
              label="Clear All"
              variant="danger"
              size="sm"
              fullWidth={false}
              onPress={clearAll}
            />
          </View>

          {/* Notification List */}
          {filteredList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 44 }}>🔔</Text>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>
                You are all caught up! New astrologer messages and live status alerts will appear here.
              </Text>
            </View>
          ) : (
            filteredList.map((notif) => (
              <Pressable
                key={notif.id}
                onPress={() => {
                  markAsRead(notif.id);
                  if (notif.actionUrl) {
                    router.push(notif.actionUrl as never);
                  }
                }}
                style={({ pressed }) => [
                  styles.notifCard,
                  !notif.read && styles.notifCardUnread,
                  pressed && { opacity: 0.8 },
                ]}
              >
                {!notif.read && <View style={styles.unreadIndicator} />}

                <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                  {notif.avatar ? (
                    <Image source={{ uri: notif.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.iconCircle}>
                      <Text style={{ fontSize: 20 }}>
                        {notif.type === 'spell_update'
                          ? '🪄'
                          : notif.type === 'wallet'
                          ? '💰'
                          : '🔔'}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMsg}>{notif.message}</Text>
                    <Text style={styles.notifTime}>{notif.timestamp}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.25)',
    backgroundColor: 'rgba(26, 33, 64, 0.65)',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tabBtn: {
    paddingHorizontal: spacing.md,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
    borderColor: 'rgba(129, 140, 248, 0.7)',
  },
  tabBtnText: { ...typography.tiny, color: '#A5B4FC', fontWeight: '800' },
  tabBtnTextActive: { color: '#FFFFFF', fontWeight: '900' },

  scroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  topActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },

  notifCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  notifCardUnread: {
    borderColor: 'rgba(129, 140, 248, 0.6)',
    backgroundColor: 'rgba(26, 33, 64, 0.95)',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.teal },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { ...typography.h3, color: '#EEF2FF', fontSize: 14, fontWeight: '800' },
  notifMsg: { ...typography.small, color: '#A5B4FC', fontSize: 12.5, lineHeight: 17, fontWeight: '600' },
  notifTime: { ...typography.tiny, color: colors.teal, marginTop: 2, fontSize: 10, fontWeight: '700' },

  emptyBox: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.xs },
  emptyTitle: { ...typography.h2, color: colors.text, fontWeight: '800' },
  emptySub: { ...typography.small, color: colors.textMuted, textAlign: 'center', maxWidth: 280, fontWeight: '600' },
});
