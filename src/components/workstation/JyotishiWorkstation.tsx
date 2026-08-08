import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
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
import { colors, radius, spacing, typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useJyotishiStore } from '../../store/jyotishiStore';
import { formatCurrency } from '../../utils';
import { ScreenHeader } from '../ScreenHeader';
import { Card } from '../Card';
import { Button } from '../Button';
import { SectionHeader } from '../SectionHeader';
import { KundliChart } from '../KundliChart';
import { computeKundli } from '../../services/astrology';
import { useLiveChatStore } from '../../store/liveChatStore';

export function JyotishiWorkstation() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isOnDuty = useJyotishiStore((s) => s.isOnDuty ?? true);
  const ratePerMin = useJyotishiStore((s) => s.ratePerMin ?? 25);
  const todayEarnings = useJyotishiStore((s) => s.todayEarnings ?? 0);
  const completedCount = useJyotishiStore((s) => s.completedCount ?? 0);
  const rating = useJyotishiStore((s) => s.rating ?? 5.0);
  const payoutBalance = useJyotishiStore((s) => s.payoutBalance ?? 0);
  const clientQueue = useJyotishiStore((s) => s.clientQueue);
  const toggleDuty = useJyotishiStore((s) => s.toggleDuty);
  const setRatePerMin = useJyotishiStore((s) => s.setRatePerMin);
  const acceptRequest = useJyotishiStore((s) => s.acceptRequest);
  const declineRequest = useJyotishiStore((s) => s.declineRequest);
  const withdrawPayout = useJyotishiStore((s) => s.withdrawPayout);

  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [newRateInput, setNewRateInput] = useState((ratePerMin ?? 25).toString());

  const [inspectKundliClient, setInspectKundliClient] = useState<any | null>(null);
  const [remedyNote, setRemedyNote] = useState('');
  const [remedySent, setRemedySent] = useState(false);

  // ── Live chat rooms from seekers ──
  const rooms = useLiveChatStore((s) => s.rooms);
  const acceptLiveRoom = useLiveChatStore((s) => s.acceptRoom);
  const endLiveRoom = useLiveChatStore((s) => s.endRoom);

  const acharyaId = user?.id?.toString() ?? 'acharya-1';
  const liveRooms = useMemo(() => {
    const roomsMap = rooms || {};
    return Object.values(roomsMap).filter((r) => Boolean(r && r.astrologerId === acharyaId));
  }, [rooms, acharyaId]);

  const waitingRooms = useMemo(() => liveRooms.filter((r) => r.status === 'waiting'), [liveRooms]);
  const activeRooms = useMemo(() => liveRooms.filter((r) => r.status === 'active'), [liveRooms]);

  const handleUpdateRate = () => {
    const val = parseInt(newRateInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 500) {
      if (setRatePerMin) setRatePerMin(val);
      setRateModalVisible(false);
    } else {
      if (Platform.OS === 'web') alert('Rate must be between ₹5/min and ₹500/min');
      else Alert.alert('Invalid Rate', 'Rate must be between ₹5/min and ₹500/min');
    }
  };

  const handleWithdraw = () => {
    const success = withdrawPayout ? withdrawPayout(5000) : false;
    if (success) {
      if (Platform.OS === 'web') alert('✅ Payout Request Submitted!\n₹5,000 will be credited to your bank account within 24 hours.');
      else Alert.alert('Payout Submitted', '₹5,000 will be credited to your bank account within 24 hours.');
    }
  };

  const activeQueue = useMemo(
    () => (clientQueue || []).filter((q) => q && q.status !== 'declined'),
    [clientQueue]
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Screen Header for Certified Jyotishi */}
      <ScreenHeader
        title={`Acharya ${user?.name || 'Dev'}`}
        subtitle="Certified Vedic Astrologer Workstation"
        hideLanguage
        right={
          <Pressable
            onPress={() => setRateModalVisible(true)}
            style={styles.rateHeaderBadge}
          >
            <Text style={styles.rateHeaderIcon}>💰</Text>
            <Text style={styles.rateHeaderText}>₹{ratePerMin}/min</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Live Duty Toggle Banner */}
        <View style={[styles.dutyCard, !isOnDuty && styles.dutyCardOff]}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.dutyTitleRow}>
              <View style={[styles.statusDot, { backgroundColor: isOnDuty ? colors.teal : colors.danger }]} />
              <Text style={styles.dutyTitle}>
                {isOnDuty ? '🟢 ON DUTY · RECEIVING CALLS' : '🔴 OFF DUTY · PAUSED'}
              </Text>
            </View>
            <Text style={styles.dutySub}>
              {isOnDuty
                ? 'Your profile is visible to 10,000+ seekers. Incoming requests will trigger instant alerts.'
                : 'Turn ON duty when you are ready to accept client chats & audio consultations.'}
            </Text>
          </View>
          <Switch
            value={isOnDuty}
            onValueChange={toggleDuty}
            trackColor={{ false: '#CBD5E1', true: 'rgba(5, 150, 105, 0.4)' }}
            thumbColor={isOnDuty ? colors.teal : '#64748B'}
          />
        </View>

        {/* Workstation Earnings & Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Today's Net Earnings */}
          <View style={styles.statCell}>
            <View style={styles.statTopRow}>
              <Text style={styles.statIcon}>💸</Text>
              <Text style={styles.statGrowthTag}>+18% today</Text>
            </View>
            <Text style={styles.statVal}>{formatCurrency(todayEarnings)}</Text>
            <Text style={styles.statLabel}>Today's Net Earnings</Text>
          </View>

          {/* Completed Sessions */}
          <View style={styles.statCell}>
            <View style={styles.statTopRow}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statRatingTag}>Avg 18m</Text>
            </View>
            <Text style={styles.statVal}>{completedCount} Sessions</Text>
            <Text style={styles.statLabel}>Consultations Done</Text>
          </View>

          {/* Overall Rating */}
          <View style={styles.statCell}>
            <View style={styles.statTopRow}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statRatingTag}>128 Reviews</Text>
            </View>
            <Text style={styles.statVal}>{rating} / 5.0</Text>
            <Text style={styles.statLabel}>Client Rating</Text>
          </View>

          {/* Available Payout Balance */}
          <View style={styles.statCell}>
            <View style={styles.statTopRow}>
              <Text style={styles.statIcon}>🏦</Text>
              <Pressable onPress={handleWithdraw} style={styles.withdrawMiniBtn}>
                <Text style={styles.withdrawMiniText}>Withdraw</Text>
              </Pressable>
            </View>
            <Text style={styles.statVal}>{formatCurrency(payoutBalance)}</Text>
            <Text style={styles.statLabel}>Available Bank Balance</Text>
          </View>
        </View>

        {/* ── REAL LIVE CHAT ROOMS (from seekers) ── */}
        {(waitingRooms.length > 0 || activeRooms.length > 0) && (
          <View style={{ gap: spacing.sm }}>
            <SectionHeader
              title="🔴 Live Seeker Chat Rooms"
              subtitle={`${waitingRooms.length} waiting · ${activeRooms.length} active`}
            />
            {[...waitingRooms, ...activeRooms].map((room) => (
              <View key={room.roomId} style={[styles.clientCard, { borderLeftWidth: 4, borderLeftColor: room.status === 'active' ? '#10B981' : '#F59E0B' }]}>
                <View style={styles.clientHeaderRow}>
                  <View style={[styles.clientAvatarCircle, { backgroundColor: room.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' }]}>
                    <Text style={{ fontSize: 20 }}>{room.status === 'active' ? '💬' : '🔔'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{room.seekerName}</Text>
                    <Text style={styles.clientTopic}>{room.topic}</Text>
                    <Text style={styles.clientBirthSub}>
                      {room.status === 'waiting' ? '⏳ Waiting for acceptance' : `✅ Active · ${room.minutesBilled} min billed`}
                      {room.unreadForAcharya > 0 && (
                        <Text style={{ color: '#EF4444', fontWeight: '900' }}> · {room.unreadForAcharya} new msg</Text>
                      )}
                    </Text>
                  </View>
                  <View style={styles.ratePill}>
                    <Text style={styles.ratePillText}>₹{room.ratePerMin}/min</Text>
                  </View>
                </View>
                <View style={styles.clientActionsRow}>
                  {room.status === 'waiting' && (
                    <Pressable
                      onPress={() => {
                        acceptLiveRoom(room.roomId);
                        router.push(`/acharya-chat/${room.roomId}`);
                      }}
                      style={styles.activeChatBtn}
                    >
                      <Text style={styles.activeChatText}>✅ Accept & Open Chat</Text>
                    </Pressable>
                  )}
                  {room.status === 'active' && (
                    <Pressable
                      onPress={() => router.push(`/acharya-chat/${room.roomId}`)}
                      style={styles.activeChatBtn}
                    >
                      <Text style={styles.activeChatText}>
                        💬 Open Chat {room.unreadForAcharya > 0 ? `(${room.unreadForAcharya})` : ''}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => endLiveRoom(room.roomId)}
                    style={[styles.declineBtn, { flex: 0, paddingHorizontal: 14 }]}
                  >
                    <Text style={styles.declineText}>End</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Incoming Client Queue & Consultation Requests */}
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="📥 Incoming Client Consultation Queue"
            subtitle={`${activeQueue.length} seekers waiting for consultation`}
          />

          {activeQueue.length === 0 ? (
            <Card padded style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 32 }}>🧘‍♂️</Text>
              <Text style={styles.emptyTitle}>Queue Currently Clear</Text>
              <Text style={styles.emptySub}>
                Keep your ON DUTY toggle enabled. Incoming client requests will appear here instantly.
              </Text>
            </Card>
          ) : (
            activeQueue.map((req) => (
              <View key={req.id} style={styles.clientCard}>
                <View style={styles.clientHeaderRow}>
                  <View style={styles.clientAvatarCircle}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{req.clientName}</Text>
                    <Text style={styles.clientTopic}>Topic: {req.topic}</Text>
                    <Text style={styles.clientBirthSub}>
                      🗓️ {req?.birthDetails?.date || 'N/A'} · ⏰ {req?.birthDetails?.time || 'N/A'} · 📍 {req?.birthDetails?.place || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.ratePill}>
                    <Text style={styles.ratePillText}>₹{req.ratePerMin}/min</Text>
                  </View>
                </View>

                {/* Quick Action Buttons for Certified Astrologer */}
                <View style={styles.clientActionsRow}>
                  <Pressable
                    onPress={() => setInspectKundliClient(req)}
                    style={styles.inspectKundliBtn}
                  >
                    <Text style={styles.inspectKundliIcon}>🪐</Text>
                    <Text style={styles.inspectKundliText}>Inspect Kundli</Text>
                  </Pressable>

                  {req.status === 'active' ? (
                    <Pressable
                      onPress={() => router.push(`/chat/${req.id}`)}
                      style={styles.activeChatBtn}
                    >
                      <Text style={styles.activeChatText}>🟢 Open Live Chat Room →</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => acceptRequest(req.id)}
                        style={styles.acceptBtn}
                      >
                        <Text style={styles.acceptText}>Accept Session ✓</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => declineRequest(req.id)}
                        style={styles.declineBtn}
                      >
                        <Text style={styles.declineText}>Decline</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Jyotishi Professional Workstation Tools */}
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="🛠️ Professional Jyotishi Tools"
            subtitle="Manage your certified practice and earnings"
          />

          <View style={styles.toolsGrid}>
            <Pressable style={styles.toolCell} onPress={() => setRateModalVisible(true)}>
              <Text style={styles.toolIcon}>💵</Text>
              <Text style={styles.toolTitle}>Consultation Rate</Text>
              <Text style={styles.toolSub}>Set ₹{ratePerMin}/min</Text>
            </Pressable>

            <Pressable style={styles.toolCell} onPress={handleWithdraw}>
              <Text style={styles.toolIcon}>🏦</Text>
              <Text style={styles.toolTitle}>Bank Payouts</Text>
              <Text style={styles.toolSub}>Transfer ₹38,400</Text>
            </Pressable>

            <Pressable style={styles.toolCell} onPress={() => router.push('/(tabs)/horoscope')}>
              <Text style={styles.toolIcon}>📜</Text>
              <Text style={styles.toolTitle}>Panchang & Gochar</Text>
              <Text style={styles.toolSub}>Planetary Transits</Text>
            </Pressable>

            <Pressable
              style={styles.toolCell}
              onPress={() => {
                logout();
                router.replace('/(auth)/login');
              }}
            >
              <Text style={styles.toolIcon}>🚪</Text>
              <Text style={styles.toolTitle}>Sign Out Workstation</Text>
              <Text style={styles.toolSub}>Acharya Portal</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* MODAL 1: Edit Per-Minute Consultation Rate */}
      <Modal visible={rateModalVisible} animationType="fade" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setRateModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>💵 Set Per-Minute Consultation Rate</Text>
            <Text style={styles.modalSub}>
              Enter your charging rate per minute. Seekers will be billed according to this rate during live sessions.
            </Text>

            <View style={styles.rateInputRow}>
              <Text style={styles.rateSymbol}>₹</Text>
              <TextInput
                value={newRateInput}
                onChangeText={setNewRateInput}
                keyboardType="number-pad"
                style={styles.rateInput}
              />
              <Text style={styles.rateUnit}>/ min</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
              <Button
                label="Cancel"
                variant="outline"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => setRateModalVisible(false)}
              />
              <Button
                label="Save Rate"
                variant="primary"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={handleUpdateRate}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: Rapid Client Kundli Inspection & Remedy Prescriber */}
      <Modal visible={!!inspectKundliClient} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            {inspectKundliClient && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                <View style={styles.inspectHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inspectTitle}>🪐 Client Birth Kundli Inspector</Text>
                    <Text style={styles.inspectSub}>
                      {inspectKundliClient.clientName} · {inspectKundliClient?.birthDetails?.date || ''} ({inspectKundliClient?.birthDetails?.place || ''})
                    </Text>
                  </View>
                  <Pressable onPress={() => setInspectKundliClient(null)} style={styles.closeBtn}>
                    <Text style={{ fontSize: 18, color: colors.text }}>✕</Text>
                  </Pressable>
                </View>

                {/* Kundli Chart Generator for Astrologer */}
                {inspectKundliClient.birthDetails && (
                  <View style={{ alignItems: 'center' }}>
                    <KundliChart
                      kundli={computeKundli({
                        name: inspectKundliClient.clientName || 'Client',
                        date: '15-08-1995',
                        time: '08:30',
                        gender: 'male',
                        place: { name: inspectKundliClient.birthDetails.place || 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 },
                      })}
                    />
                  </View>
                )}

                {/* Prescribe Remedy / Gemstone Section */}
                <View style={styles.remedyBox}>
                  <Text style={styles.remedyTitle}>💎 Prescribe Vedic Remedy & Gemstone</Text>
                  <TextInput
                    value={remedyNote}
                    onChangeText={(t) => { setRemedyNote(t); setRemedySent(false); }}
                    placeholder="Enter prescribed mantra, gemstone (e.g. Yellow Sapphire), or puja ritual..."
                    placeholderTextColor={colors.textFaint}
                    multiline
                    numberOfLines={3}
                    style={styles.remedyInput}
                  />

                  {remedySent ? (
                    <View style={styles.remedySentBadge}>
                      <Text style={styles.remedySentText}>✓ Prescribed & Sent to {inspectKundliClient.clientName}'s App Inbox!</Text>
                    </View>
                  ) : (
                    <Button
                      label="Send Prescription to Client Inbox →"
                      variant="primary"
                      size="sm"
                      onPress={() => setRemedySent(true)}
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },

  rateHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    elevation: 2,
  },
  rateHeaderIcon: { fontSize: 13 },
  rateHeaderText: { ...typography.tiny, color: colors.teal, fontWeight: '800', fontSize: 12 },

  /* Duty Toggle Card */
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(5, 150, 105, 0.35)',
    borderRightColor: 'rgba(5, 150, 105, 0.35)',
    padding: spacing.md,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 4,
  },
  dutyCardOff: {
    borderBottomColor: 'rgba(225, 29, 72, 0.35)',
    borderRightColor: 'rgba(225, 29, 72, 0.35)',
  },
  dutyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dutyTitle: { ...typography.h3, color: colors.text, fontSize: 14, fontWeight: '800' },
  dutySub: { ...typography.tiny, color: colors.textMuted, fontSize: 11, lineHeight: 15, fontWeight: '600' },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  statCell: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    padding: spacing.md,
    gap: 4,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: { fontSize: 20 },
  statGrowthTag: { ...typography.tiny, color: colors.teal, fontSize: 10, fontWeight: '800' },
  statRatingTag: { ...typography.tiny, color: colors.gold, fontSize: 10, fontWeight: '800' },
  statVal: { ...typography.display, fontSize: 20, color: colors.text, fontWeight: '900' },
  statLabel: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  withdrawMiniBtn: {
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  withdrawMiniText: { ...typography.tiny, color: colors.teal, fontSize: 9.5, fontWeight: '800' },

  emptyTitle: { ...typography.h3, color: colors.text, fontWeight: '800' },
  emptySub: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontSize: 12 },

  /* Client Card */
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 4,
  },
  clientHeaderRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  clientAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  clientTopic: { ...typography.small, color: colors.teal, fontSize: 12, fontWeight: '700' },
  clientBirthSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  ratePill: {
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  ratePillText: { ...typography.tiny, color: colors.gold, fontSize: 11, fontWeight: '800' },

  clientActionsRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  inspectKundliBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
  },
  inspectKundliIcon: { fontSize: 13 },
  inspectKundliText: { ...typography.tiny, color: colors.text, fontWeight: '800', fontSize: 11 },

  acceptBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { ...typography.tiny, color: colors.white, fontWeight: '800', fontSize: 12 },
  declineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
  },
  declineText: { ...typography.tiny, color: colors.danger, fontWeight: '800', fontSize: 11 },

  activeChatBtn: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChatText: { ...typography.tiny, color: colors.white, fontWeight: '900', fontSize: 12 },

  /* Tools Grid */
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  toolCell: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    padding: spacing.md,
    gap: 2,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 3,
  },
  toolIcon: { fontSize: 22 },
  toolTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  toolSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    gap: spacing.md,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.text, fontSize: 18, fontWeight: '800' },
  modalSub: { ...typography.small, color: colors.textMuted, fontSize: 12, fontWeight: '600' },

  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  rateSymbol: { fontSize: 20, color: colors.teal, fontWeight: '800' },
  rateInput: { flex: 1, fontSize: 22, color: colors.text, fontWeight: '900' },
  rateUnit: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },

  inspectHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inspectTitle: { ...typography.h2, color: colors.text, fontSize: 17, fontWeight: '800' },
  inspectSub: { ...typography.small, color: colors.textMuted, fontSize: 11.5, fontWeight: '600' },
  closeBtn: { padding: 6 },

  remedyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    gap: spacing.sm,
  },
  remedyTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  remedyInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  remedySentBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    borderRadius: radius.pill,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
  },
  remedySentText: { ...typography.small, color: colors.teal, fontWeight: '800', textAlign: 'center' },
});
