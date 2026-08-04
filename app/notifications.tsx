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
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useNotificationStore, NotificationType } from '../src/store/notificationStore';

type FilterType = 'all' | 'chat_message' | 'astrologer_live' | 'order';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const [filter, setFilter] = useState<FilterType>('all');

  const filteredList = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'order') return n.type === 'order_update' || n.type === 'spell_update';
    return n.type === filter;
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Notifications"
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
                  colors={['#7D3C98', '#E67E22']}
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
              <Text style={styles.emptySub}>You are all caught up! New astrologer messages and live status alerts will appear here.</Text>
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
  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#E3E8F3', backgroundColor: '#FFFFFF' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: spacing.xs },
  tabBtn: {
    paddingHorizontal: spacing.md,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    overflow: 'hidden',
  },
  tabBtnActive: { borderColor: 'transparent' },
  tabBtnText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800' },
  tabBtnTextActive: { color: colors.white },

  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },

  topActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },

  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    position: 'relative',
    shadowColor: 'rgba(160,175,205,0.20)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  notifCardUnread: {
    borderColor: 'rgba(230,126,34,0.4)',
    backgroundColor: '#FFFDF9',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.saffron,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: '#E3E8F3' },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { ...typography.h3, color: colors.text, fontSize: 14, fontWeight: '800' },
  notifMsg: { ...typography.small, color: colors.textMuted, fontSize: 12.5, lineHeight: 17 },
  notifTime: { ...typography.tiny, color: colors.textFaint, marginTop: 2, fontSize: 10 },

  emptyBox: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.xs },
  emptyTitle: { ...typography.h2, color: colors.text, fontWeight: '800' },
  emptySub: { ...typography.small, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
});
