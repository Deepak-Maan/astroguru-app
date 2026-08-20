/**
 * Acharya Live Chat Room — receives and replies to Seeker messages.
 * Enhanced with:
 * - Categorized Vedic Quick Replies (Kundli, Dasha, Remedies, Mantras, Blessings)
 * - Interactive Seeker Kundli Drawer (Lagna, Rashi, Nakshatra, Mahadasha)
 * - Instant Audio/Video Consultation Call Trigger
 * - Real-time Firebase bidirectional sync & zero "Room not found" fallback.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useLiveChatStore, LiveRoom } from '../../src/store/liveChatStore';
import { useAuthStore } from '../../src/store/authStore';
import { useJyotishiStore } from '../../src/store/jyotishiStore';
import { formatCurrency } from '../../src/utils';
import { subscribeToFirebaseRoomMessages } from '../../src/services/firebaseRealtimeService';
import { generateAIAstrologyReply } from '../../src/services/ai/aiAstrologyEngine';

let idC = 0;
const nid = () => `ac-${Date.now()}-${++idC}`;

const QUICK_CATEGORIES = [
  {
    category: '🙏 Welcome',
    replies: [
      '🙏 Namaste! I am analyzing your birth chart now.',
      '✨ Please share your exact Date, Time and Place of birth.',
      '🌟 Welcome to AstroGuru live consultation.',
    ],
  },
  {
    category: '🪐 Kundli & Dasha',
    replies: [
      '🪐 Your current Mahadasha indicates positive planetary shifts.',
      '🔮 7th House position shows auspicious relationship alignment.',
      '💼 10th Lord transit brings strong career growth opportunities.',
      '⚠️ Rahu-Ketu axis suggests patience in major financial decisions.',
    ],
  },
  {
    category: '💎 Lal Kitab Remedies',
    replies: [
      '💎 Wear Natural Yellow Sapphire (Pukhraj) on Thursday.',
      '🕊️ Feed soaked green gram to birds on Wednesdays.',
      '🌙 Offer water to Surya Dev every morning at sunrise.',
      '🪔 Light a mustard oil lamp under Peepal tree on Saturdays.',
    ],
  },
  {
    category: '🕉️ Mantras',
    replies: [
      '🕉️ Chant "Om Namah Shivaya" 108 times daily.',
      '☀️ Chant "Om Suryaya Namaha" for vitality and focus.',
      '🛡️ Chant Maha Mrityunjaya Mantra for protection & peace.',
    ],
  },
  {
    category: '✅ Blessings',
    replies: [
      '🙏 All remedies have been noted in your cosmic vault.',
      '✨ May Jupiter bless you with abundant peace, health and wealth.',
      '✅ Consultation concluded successfully. Stay blessed! 🙏',
    ],
  },
];

export default function AcharyaChatScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const authUser = useAuthStore((s) => s.user);
  const acharyaName = authUser?.name ?? 'Acharya';

  const roomFromStore = useLiveChatStore((s) => s.getRoom(roomId ?? ''));
  const room: LiveRoom = roomFromStore || {
    roomId: String(roomId || 'room_default'),
    seekerId: String(roomId || '').split('__')[0] || 'usr_seeker',
    seekerName: 'Seeker',
    astrologerId: String(roomId || '').split('__')[1] || authUser?.id || 'astro',
    astrologerName: acharyaName,
    topic: 'Vedic Astrology Consultation',
    ratePerMin: 25,
    startedAt: Date.now(),
    endedAt: null,
    minutesBilled: 0,
    messages: [],
    status: 'active' as const,
    unreadForSeeker: 0,
    unreadForAcharya: 0,
  };

  const sendMessage = useLiveChatStore((s) => s.sendMessage);
  const acceptRoom = useLiveChatStore((s) => s.acceptRoom);
  const endRoom = useLiveChatStore((s) => s.endRoom);
  const markRead = useLiveChatStore((s) => s.markRead);
  const billRoomMinute = useLiveChatStore((s) => s.billRoomMinute);
  const syncFirebaseMessages = useLiveChatStore((s) => s.syncFirebaseMessages);

  const [draft, setDraft] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [showQuick, setShowQuick] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showKundliDrawer, setShowKundliDrawer] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sendAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const messages = room?.messages ?? [];
  const isActive = room?.status === 'active';
  const isWaiting = room?.status === 'waiting';
  const isEnded = room?.status === 'ended';

  // Real-time Firebase Room Subscription
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToFirebaseRoomMessages(roomId, (fbMsgs) => {
      if (fbMsgs && fbMsgs.length > 0) {
        syncFirebaseMessages(roomId, fbMsgs);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Mark read
  useEffect(() => {
    if (roomId) markRead(roomId, 'acharya');
  }, [roomId, messages.length]);

  // Billing timer
  useEffect(() => {
    if (!isActive || !roomId) return;
    const t = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 60 === 0) {
          billRoomMinute(roomId);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isActive, roomId]);

  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isActive]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length]);

  function handleSend(text?: string) {
    const t = (text ?? draft).trim();
    if (!t || !roomId) return;
    setDraft('');
    setShowQuick(false);
    sendMessage(roomId, 'acharya', acharyaName, t);
    Animated.sequence([
      Animated.timing(sendAnim, { toValue: 0.85, duration: 90, useNativeDriver: true }),
      Animated.timing(sendAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  }

  function handleAccept() {
    if (!roomId) return;
    acceptRoom(roomId);
    setElapsed(0);
  }

  function handleEnd() {
    if (!roomId) return;
    endRoom(roomId);
    setTimeout(() => router.back(), 1000);
  }

  function handleLaunchCall(type: 'audio' | 'video') {
    const targetId = room.astrologerId || authUser?.id || 'astro';
    router.push(`/consultation/${targetId}?type=${type}&role=expert&seekerName=${encodeURIComponent(room.seekerName)}`);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const earned = (room.minutesBilled ?? 0) * (room.ratePerMin ?? 25);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Animated.View style={{ transform: [{ scale: isActive ? pulseAnim : 1 }] }}>
            <Avatar name={room.seekerName} size={42} online={isActive} showStatus />
          </Animated.View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.hName} numberOfLines={1}>{room.seekerName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : isWaiting ? '#F59E0B' : '#94A3B8' }]} />
              <Text style={styles.hMeta}>
                {isActive ? `Live · ${mm}:${ss}` : isWaiting ? 'Pending Acceptance' : 'Session Ended'}
              </Text>
            </View>
          </View>

          {/* Action Tools */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Kundli Toggle */}
            <Pressable
              onPress={() => setShowKundliDrawer(!showKundliDrawer)}
              style={[styles.headerActionBtn, showKundliDrawer && styles.headerActionBtnActive]}
            >
              <Text style={styles.headerActionIcon}>🪐</Text>
            </Pressable>

            {/* Audio Call */}
            <Pressable onPress={() => handleLaunchCall('audio')} style={styles.headerActionBtn}>
              <Text style={styles.headerActionIcon}>📞</Text>
            </Pressable>

            {/* Video Call */}
            <Pressable onPress={() => handleLaunchCall('video')} style={styles.headerActionBtn}>
              <Text style={styles.headerActionIcon}>📹</Text>
            </Pressable>

            {/* Earned Pill */}
            <View style={styles.earnedPill}>
              <Text style={styles.earnedVal}>₹{earned}</Text>
              <Text style={styles.earnedSub}>earned</Text>
            </View>
          </View>
        </View>

        {/* ── Seeker Kundli Overview Drawer ── */}
        {showKundliDrawer && (
          <View style={styles.kundliDrawer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.drawerTitle}>🪐 {room.seekerName}'s Natal Chart</Text>
              <Pressable onPress={() => setShowKundliDrawer(false)} hitSlop={8}>
                <Text style={{ color: '#94A3B8', fontWeight: '800' }}>✕ Close</Text>
              </Pressable>
            </View>
            <View style={styles.kundliDrawerGrid}>
              <View style={styles.drawerGridItem}>
                <Text style={styles.drawerLabel}>Ascendant (Lagna)</Text>
                <Text style={styles.drawerVal}>Mesha (Aries ♈)</Text>
              </View>
              <View style={styles.drawerGridItem}>
                <Text style={styles.drawerLabel}>Moon Sign (Rashi)</Text>
                <Text style={styles.drawerVal}>Vrishabha (Taurus ♉)</Text>
              </View>
              <View style={styles.drawerGridItem}>
                <Text style={styles.drawerLabel}>Current Mahadasha</Text>
                <Text style={styles.drawerVal}>Jupiter - Saturn (2026)</Text>
              </View>
              <View style={styles.drawerGridItem}>
                <Text style={styles.drawerLabel}>Key Gemstone</Text>
                <Text style={styles.drawerVal}>Yellow Sapphire / Pukhraj</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Session Info Strip ── */}
        <View style={styles.strip}>
          <Text style={styles.stripText} numberOfLines={1}>
            📌 {room.topic} · ₹{room.ratePerMin || 25}/min · {room.minutesBilled} min billed
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {isWaiting && (
              <Pressable onPress={handleAccept} style={styles.acceptBtn}>
                <Text style={styles.acceptBtnText}>⚡ Accept</Text>
              </Pressable>
            )}
            {isActive && (
              <Pressable onPress={handleEnd} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End Session</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Messages List & Composer ── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => {
              const isAcharya = m.role === 'acharya';
              const isSystem = m.role === 'system';

              if (isSystem) {
                return (
                  <View key={m.id} style={styles.sysBubble}>
                    <Text style={styles.sysText}>{m.text}</Text>
                  </View>
                );
              }

              return (
                <View
                  key={m.id}
                  style={[styles.msgRow, isAcharya ? styles.msgRowRight : styles.msgRowLeft]}
                >
                  {!isAcharya && <Avatar name={room.seekerName} size={28} />}
                  <View
                    style={[
                      styles.bubble,
                      isAcharya ? styles.bubbleAcharya : styles.bubbleSeeker,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isAcharya ? styles.bubbleTextAcharya : styles.bubbleTextSeeker,
                      ]}
                    >
                      {m.text}
                    </Text>
                    <Text
                      style={[
                        styles.msgTime,
                        isAcharya ? styles.msgTimeAcharya : styles.msgTimeSeeker,
                      ]}
                    >
                      {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* ── Enhanced Categorized Quick Reply Drawer ── */}
          {showQuick && (
            <View style={styles.quickReplyContainer}>
              {/* Categories Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickCatRow}
              >
                {QUICK_CATEGORIES.map((cat, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedCategory(idx)}
                    style={[
                      styles.quickCatChip,
                      selectedCategory === idx && styles.quickCatChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickCatText,
                        selectedCategory === idx && styles.quickCatTextActive,
                      ]}
                    >
                      {cat.category}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Replies for Selected Category */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickRepliesScroll}
              >
                {QUICK_CATEGORIES[selectedCategory].replies.map((r, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleSend(r)}
                    style={({ pressed }) => [styles.quickReplyChip, pressed && { opacity: 0.75 }]}
                  >
                    <Text style={styles.quickReplyChipText}>{r}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Composer ── */}
          {!isEnded && (
            <View style={styles.composer}>
              {/* Quick reply toggle */}
              <Pressable
                onPress={() => setShowQuick(!showQuick)}
                style={[styles.composerIconBtn, showQuick && { backgroundColor: '#FEF3C7' }]}
              >
                <Text style={styles.composerIcon}>⚡</Text>
              </Pressable>

              {/* ✨ AI Auto-Draft Button */}
              <Pressable
                onPress={() => {
                  const lastSeekerMsg = [...messages].reverse().find((m) => (m.role as string) === 'seeker' || (m.role as string) === 'user');
                  const question = lastSeekerMsg?.text || 'Career and marriage future';
                  const aiDraft = generateAIAstrologyReply(question, null, null);
                  setDraft(aiDraft);
                }}
                style={[styles.composerIconBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
              >
                <Text style={styles.composerIcon}>✨</Text>
              </Pressable>

              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={isWaiting ? 'Accept session to reply…' : 'Type or tap ✨ for AI Vedic reply…'}
                placeholderTextColor={colors.textFaint}
                style={styles.composerInput}
                multiline
                editable={!isWaiting}
                onSubmitEditing={() => handleSend()}
              />

              <Animated.View style={{ transform: [{ scale: sendAnim }] }}>
                <Pressable
                  onPress={() => handleSend()}
                  style={[styles.sendBtn, (!draft.trim() || isWaiting) && { opacity: 0.45 }]}
                  disabled={!draft.trim() || isWaiting}
                >
                  <Text style={styles.sendBtnText}>↑</Text>
                </Pressable>
              </Animated.View>
            </View>
          )}

          {isEnded && (
            <View style={styles.endedBar}>
              <Text style={styles.endedBarText}>🙏 Session Complete · ₹{earned} earned this session</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backIcon: { fontSize: 22, color: colors.text, lineHeight: 30, marginLeft: -2, fontWeight: '700' },
  hName: { fontSize: 15, fontWeight: '800', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  hMeta: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  headerActionBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionBtnActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  headerActionIcon: {
    fontSize: 16,
  },
  earnedPill: {
    backgroundColor: 'rgba(5,150,105,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
    alignItems: 'center',
    marginLeft: 2,
  },
  earnedVal: { color: colors.teal, fontWeight: '900', fontSize: 13 },
  earnedSub: { color: colors.teal, fontWeight: '700', fontSize: 9, opacity: 0.8 },

  kundliDrawer: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: spacing.md,
    gap: 8,
  },
  drawerTitle: {
    ...typography.tiny,
    fontWeight: '900',
    color: '#0F172A',
    fontSize: 12,
  },
  kundliDrawerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  drawerGridItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  drawerLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  drawerVal: {
    ...typography.tiny,
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,219,254,0.4)',
    gap: 8,
  },
  stripText: { fontSize: 11, color: colors.textMuted, fontWeight: '600', flex: 1 },
  acceptBtn: { backgroundColor: '#10B981', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  acceptBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  endBtn: { backgroundColor: '#EF4444', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  msgList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sysBubble: {
    alignSelf: 'center',
    backgroundColor: 'rgba(241,245,249,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginVertical: 4,
  },
  sysText: { fontSize: 11, color: colors.textMuted, fontWeight: '700', textAlign: 'center' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginVertical: 2 },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radius.lg,
  },
  bubbleAcharya: {
    backgroundColor: colors.teal,
    borderBottomRightRadius: 3,
  },
  bubbleSeeker: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleText: { fontSize: 14, lineHeight: 19 },
  bubbleTextAcharya: { color: '#FFFFFF', fontWeight: '600' },
  bubbleTextSeeker: { color: '#0F172A', fontWeight: '600' },
  msgTime: { fontSize: 9.5, marginTop: 4, textAlign: 'right' },
  msgTimeAcharya: { color: 'rgba(255,255,255,0.75)' },
  msgTimeSeeker: { color: '#94A3B8' },

  quickReplyContainer: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 6,
    gap: 6,
  },
  quickCatRow: {
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  quickCatChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#E2E8F0',
  },
  quickCatChipActive: {
    backgroundColor: colors.teal,
  },
  quickCatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quickCatTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  quickRepliesScroll: {
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  quickReplyChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    maxWidth: 260,
  },
  quickReplyChipText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,219,254,0.5)',
    gap: 8,
  },
  composerIconBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerIcon: { fontSize: 17 },
  composerInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 13.5,
    color: '#0F172A',
    maxHeight: 90,
  },
  sendBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  endedBar: {
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  endedBarText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
});