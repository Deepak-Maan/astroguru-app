import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Card } from '../Card';
import { ScreenHeader } from '../ScreenHeader';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useLiveChatStore, LiveRoom } from '../../store/liveChatStore';
import { useJyotishiStore } from '../../store/jyotishiStore';
import { formatCurrency } from '../../utils';
import {
  subscribeToAcharyaRoomsInFirebase,
  subscribeToIncomingCallsInFirebase,
} from '../../services/firebaseRealtimeService';

type FilterTab = 'all' | 'waiting' | 'active' | 'completed';

export function AcharyaChatCenter() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const acharyaId = String(authUser?.id || 'astro_1786457216977');

  const roomsMap = useLiveChatStore((s) => s.rooms);
  const acceptRoom = useLiveChatStore((s) => s.acceptRoom);
  const endRoom = useLiveChatStore((s) => s.endRoom);

  const isOnDuty = useJyotishiStore((s) => s.isOnDuty ?? true);
  const toggleDuty = useJyotishiStore((s) => s.toggleDuty);
  const todayEarnings = useJyotishiStore((s) => s.todayEarnings ?? 0);
  const ratePerMin = useJyotishiStore((s) => s.ratePerMin ?? 25);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeekerKundli, setSelectedSeekerKundli] = useState<any | null>(null);

  // Real-time Firebase Room Listener
  const [firebaseRooms, setFirebaseRooms] = useState<any[]>([]);

  useEffect(() => {
    if (!acharyaId) return;

    const unsubscribe = subscribeToAcharyaRoomsInFirebase(acharyaId, (rooms) => {
      setFirebaseRooms(rooms || []);
    });

    return () => unsubscribe();
  }, [acharyaId]);

  // Merge Zustand local rooms with Firebase Realtime Database rooms
  const allRooms: LiveRoom[] = useMemo(() => {
    const localList = Object.values(roomsMap || {}).filter(
      (r) => r && (r.astrologerId === acharyaId || r.astrologerId === 'astro_1786457216977' || true)
    );

    const mergedMap = new Map<string, LiveRoom>();

    // Add local state
    localList.forEach((r) => {
      if (r && r.roomId) mergedMap.set(r.roomId, r);
    });

    // Merge Firebase rooms
    firebaseRooms.forEach((fbR) => {
      if (!fbR || !fbR.roomId) return;
      const existing = mergedMap.get(fbR.roomId);
      if (!existing) {
        const parts = (fbR.roomId || '').split('__');
        mergedMap.set(fbR.roomId, {
          roomId: fbR.roomId,
          seekerId: fbR.seekerId || parts[0] || 'usr_seeker',
          seekerName: fbR.seekerName || 'Seeker',
          astrologerId: acharyaId,
          astrologerName: authUser?.name || 'Acharya Vivek Kumar',
          topic: fbR.topic || 'Vedic Astrology Consultation',
          ratePerMin: ratePerMin,
          startedAt: fbR.updatedAt || Date.now(),
          endedAt: null,
          minutesBilled: 0,
          messages: [],
          status: fbR.status || 'waiting',
          unreadForSeeker: 0,
          unreadForAcharya: 1,
        });
      } else {
        mergedMap.set(fbR.roomId, {
          ...existing,
          status: fbR.status || existing.status,
          seekerName: fbR.seekerName || existing.seekerName,
        });
      }
    });

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return result;
  }, [roomsMap, firebaseRooms, acharyaId, authUser?.name, ratePerMin]);

  // Counts
  const waitingCount = allRooms.filter((r) => r.status === 'waiting').length;
  const activeCount = allRooms.filter((r) => r.status === 'active').length;
  const completedCount = allRooms.filter((r) => r.status === 'ended').length;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return allRooms.filter((r) => {
      if (activeTab === 'waiting' && r.status !== 'waiting') return false;
      if (activeTab === 'active' && r.status !== 'active') return false;
      if (activeTab === 'completed' && r.status !== 'ended') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.seekerName || '').toLowerCase().includes(q);
        const matchesTopic = (r.topic || '').toLowerCase().includes(q);
        const matchesMsg = (r.messages?.[r.messages.length - 1]?.text || '').toLowerCase().includes(q);
        return matchesName || matchesTopic || matchesMsg;
      }
      return true;
    });
  }, [allRooms, activeTab, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  function handleAcceptChat(room: LiveRoom) {
    acceptRoom(room.roomId);
    router.push(`/acharya-chat/${room.roomId}`);
  }

  function handleOpenChat(room: LiveRoom) {
    router.push(`/acharya-chat/${room.roomId}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>💬 Acharya Chat Center</Text>
          <Text style={styles.headerSubtitle}>
            Live Seeker Consultation Queue & Direct Messages
          </Text>
        </View>

        {/* Duty Toggle */}
        <View style={styles.dutyPill}>
          <View style={[styles.statusDot, { backgroundColor: isOnDuty ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.dutyText}>{isOnDuty ? 'ONLINE' : 'AWAY'}</Text>
          <Switch
            value={isOnDuty}
            onValueChange={toggleDuty}
            trackColor={{ false: '#94A3B8', true: '#10B981' }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      {/* Metrics Banner */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.metricVal, { color: colors.saffron }]}>{waitingCount}</Text>
          <Text style={styles.metricLabel}>⏳ Waiting Queue</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: 'rgba(16,185,129,0.4)', backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.metricVal, { color: '#059669' }]}>{activeCount}</Text>
          <Text style={styles.metricLabel}>💬 Active Chats</Text>
        </View>

        <View style={[styles.metricCard, { borderColor: 'rgba(59,130,246,0.4)', backgroundColor: '#EFF6FF' }]}>
          <Text style={[styles.metricVal, { color: colors.teal }]}>₹{todayEarnings}</Text>
          <Text style={styles.metricLabel}>💰 Today Earned</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by seeker name or topic..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
        {!!searchQuery && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Tabs Row */}
      <View style={styles.tabFilterRow}>
        {[
          { key: 'all', label: `All (${allRooms.length})` },
          { key: 'waiting', label: `⏳ Waiting (${waitingCount})` },
          { key: 'active', label: `🟢 Active (${activeCount})` },
          { key: 'completed', label: `History (${completedCount})` },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key as FilterTab)}
              style={[styles.tabFilterChip, isSelected && styles.tabFilterChipActive]}
            >
              <Text
                style={[
                  styles.tabFilterText,
                  isSelected && styles.tabFilterTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Chat Rooms List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.roomId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 54, marginBottom: 8 }}>🪔</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'waiting'
                ? 'No Pending Requests'
                : activeTab === 'active'
                ? 'No Active Chats'
                : 'No Consultations Found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isOnDuty
                ? 'You are Online. When seekers send a message or start a consultation, it will appear here in real time!'
                : 'You are currently Away. Turn on Online Duty above to start receiving seeker consultation requests.'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isPending = item.status === 'waiting';
          const isLive = item.status === 'active';
          const lastMsg = item.messages?.[item.messages.length - 1];

          return (
            <Pressable
              onPress={() => (isPending ? handleAcceptChat(item) : handleOpenChat(item))}
              style={({ pressed }) => [
                styles.roomCard,
                isPending && styles.roomCardPending,
                isLive && styles.roomCardActive,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
            >
              {/* Header inside Card */}
              <View style={styles.cardHeader}>
                <View style={styles.seekerInfo}>
                  <View style={{ position: 'relative' }}>
                    <Avatar name={item.seekerName || 'Seeker'} size={48} />
                    <View
                      style={[
                        styles.onlineBeacon,
                        { backgroundColor: isLive ? '#10B981' : isPending ? colors.gold : '#94A3B8' },
                      ]}
                    />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.seekerName} numberOfLines={1}>
                        {item.seekerName || 'Seeker'}
                      </Text>
                      <Text style={styles.timeText}>
                        {lastMsg ? new Date(lastMsg.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </Text>
                    </View>
                    <Text style={styles.topicText} numberOfLines={1}>
                      🪐 {item.topic || 'Vedic Astrology Consultation'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Message Preview */}
              <View style={styles.msgPreviewBox}>
                <Text style={styles.lastMsgText} numberOfLines={2}>
                  {lastMsg?.text || '⚡ Consultation session initiated. Tap to open chat and guide the seeker.'}
                </Text>
              </View>

              {/* Action & Status Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateBadgeText}>₹{item.ratePerMin || ratePerMin}/min</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() =>
                      setSelectedSeekerKundli({
                        name: item.seekerName || 'Seeker',
                        lagna: 'Mesha (Aries)',
                        moonSign: 'Vrishabha (Taurus)',
                        dasha: 'Jupiter - Saturn (2026)',
                      })
                    }
                    style={styles.kundliQuickBtn}
                  >
                    <Text style={styles.kundliQuickBtnText}>🪐 Kundli</Text>
                  </Pressable>

                  {isPending ? (
                    <Pressable
                      onPress={() => handleAcceptChat(item)}
                      style={styles.acceptActionBtn}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.acceptActionBtnText}>⚡ Accept & Chat</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleOpenChat(item)}
                      style={styles.openChatBtn}
                    >
                      <Text style={styles.openChatBtnText}>
                        {isLive ? '💬 Open Live Chat' : '📄 View Chat'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Seeker Kundli Quick Modal */}
      {selectedSeekerKundli && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedSeekerKundli(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.modalTitle}>🪐 {selectedSeekerKundli.name}'s Chart</Text>
                <Pressable onPress={() => setSelectedSeekerKundli(null)} hitSlop={8}>
                  <Text style={{ fontSize: 18, color: colors.textMuted, fontWeight: '800' }}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.kundliGrid}>
                {[
                  { label: 'Ascendant (Lagna)', val: selectedSeekerKundli.lagna },
                  { label: 'Moon Sign (Rashi)', val: selectedSeekerKundli.moonSign },
                  { label: 'Current Mahadasha', val: selectedSeekerKundli.dasha },
                  { label: 'Recommended Remedy', val: 'Chant Gayatri Mantra daily' },
                ].map((item, idx) => (
                  <View key={idx} style={styles.kundliGridItem}>
                    <Text style={styles.kundliGridLabel}>{item.label}</Text>
                    <Text style={styles.kundliGridVal}>{item.val}</Text>
                  </View>
                ))}
              </View>

              <Button
                label="Close Kundli Overview"
                variant="gold"
                size="sm"
                style={{ marginTop: 16 }}
                onPress={() => setSelectedSeekerKundli(null)}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dutyText: {
    ...typography.tiny,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricVal: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '900',
  },
  metricLabel: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  tabFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    gap: 6,
  },
  tabFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#E2E8F0',
  },
  tabFilterChipActive: {
    backgroundColor: colors.teal,
  },
  tabFilterText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tabFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  roomCardPending: {
    borderColor: 'rgba(245,158,11,0.6)',
    backgroundColor: '#FFFDF5',
  },
  roomCardActive: {
    borderColor: 'rgba(16,185,129,0.6)',
    backgroundColor: '#F7FEFA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seekerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  onlineBeacon: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  seekerName: {
    ...typography.body,
    fontWeight: '900',
    color: '#0F172A',
    fontSize: 15,
  },
  timeText: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700',
  },
  topicText: {
    ...typography.tiny,
    color: colors.saffron,
    fontWeight: '800',
    marginTop: 2,
  },
  msgPreviewBox: {
    backgroundColor: 'rgba(241,245,249,0.7)',
    padding: 9,
    borderRadius: radius.md,
    marginVertical: spacing.sm,
  },
  lastMsgText: {
    ...typography.small,
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  rateBadgeText: {
    ...typography.tiny,
    color: colors.saffron,
    fontWeight: '900',
    fontSize: 11,
  },
  kundliQuickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kundliQuickBtnText: {
    ...typography.tiny,
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  acceptActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptActionBtnText: {
    ...typography.tiny,
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  openChatBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openChatBtnText: {
    ...typography.tiny,
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  kundliGrid: {
    gap: 8,
    marginVertical: 8,
  },
  kundliGridItem: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kundliGridLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 10.5,
  },
  kundliGridVal: {
    ...typography.body,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
});