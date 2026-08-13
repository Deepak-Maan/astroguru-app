/**
 * Acharya Live Chat Room — receives and replies to Seeker messages.
 * Route: /acharya-chat/[roomId]
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
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useLiveChatStore } from '../../src/store/liveChatStore';
import { useAuthStore } from '../../src/store/authStore';
import { useJyotishiStore } from '../../src/store/jyotishiStore';
import { formatCurrency } from '../../src/utils';

let idC = 0;
const nid = () => `ac-${Date.now()}-${++idC}`;

const QUICK_REPLIES = [
  '🙏 Namaste! Let me check your Kundli.',
  '✨ Please share your birth details.',
  '🔮 Based on your chart, I see...',
  '⭐ Your Dasha period suggests...',
  '💎 I recommend wearing Ruby gemstone.',
  '🌙 Chant this mantra daily: Om Namah Shivaya',
  '📅 An auspicious muhurta for you is...',
  '✅ Your concern is addressed. Namaste 🙏',
];

import { subscribeToFirebaseRoomMessages } from '../../src/services/firebaseRealtimeService';

export default function AcharyaChatScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const authUser = useAuthStore((s) => s.user);
  const acharyaName = authUser?.name ?? 'Acharya';

  const room = useLiveChatStore((s) => s.getRoom(roomId ?? ''));
  const sendMessage = useLiveChatStore((s) => s.sendMessage);
  const acceptRoom = useLiveChatStore((s) => s.acceptRoom);
  const endRoom = useLiveChatStore((s) => s.endRoom);
  const markRead = useLiveChatStore((s) => s.markRead);
  const billRoomMinute = useLiveChatStore((s) => s.billRoomMinute);
  const syncRoomFromBackend = useLiveChatStore((s) => s.syncRoomFromBackend);
  const todayEarnings = useJyotishiStore((s) => s.todayEarnings);

  const [draft, setDraft] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [showQuick, setShowQuick] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sendAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const messages = room?.messages ?? [];
  const isActive = room?.status === 'active';
  const isWaiting = room?.status === 'waiting';
  const isEnded = room?.status === 'ended';

  const syncFirebaseMessages = useLiveChatStore((s) => s.syncFirebaseMessages);

  // Real-time Firebase Room Subscription for Acharya
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToFirebaseRoomMessages(roomId, (fbMsgs) => {
      if (fbMsgs && fbMsgs.length > 0) {
        syncFirebaseMessages(roomId, fbMsgs);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Mark read when Acharya opens the screen
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
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
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
      Animated.timing(sendAnim, { toValue: 0.82, duration: 90, useNativeDriver: true }),
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
    setTimeout(() => router.back(), 1200);
  }

  if (!room) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 40 }}>🔭</Text>
            <Text style={{ ...typography.h2, color: colors.text, marginTop: 12 }}>Room not found</Text>
            <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 14, backgroundColor: colors.teal, borderRadius: radius.md }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>← Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const earned = (room.minutesBilled ?? 0) * (room.ratePerMin ?? 0);

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

          <View style={{ flex: 1 }}>
            <Text style={styles.hName} numberOfLines={1}>{room.seekerName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : isWaiting ? '#F59E0B' : '#94A3B8' }]} />
              <Text style={styles.hMeta}>
                {isActive ? `Live · ${mm}:${ss}` : isWaiting ? 'Waiting for acceptance' : 'Session Ended'}
              </Text>
            </View>
          </View>

          {/* Earned this session */}
          <View style={styles.earnedPill}>
            <Text style={styles.earnedVal}>₹{earned.toLocaleString('en-IN')}</Text>
            <Text style={styles.earnedSub}>earned</Text>
          </View>
        </View>

        {/* ── Session Info Strip ── */}
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            📌 {room.topic} · ₹{room.ratePerMin}/min · {room.minutesBilled} min billed
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isWaiting && (
              <Pressable onPress={handleAccept} style={styles.acceptBtn}>
                <Text style={styles.acceptBtnText}>✅ Accept</Text>
              </Pressable>
            )}
            {isActive && (
              <Pressable onPress={handleEnd} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
            )}
            {isEnded && (
              <View style={styles.endedBadge}>
                <Text style={styles.endedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Seeker Birth Details Card ── */}
        <View style={styles.birthCard}>
          <Text style={styles.birthCardText}>
            🪐 DOB: {room.seekerId.includes('@') ? 'N/A' : '14-05-1994'} · TOB: 08:30 AM · POB: New Delhi
          </Text>
          <Pressable style={styles.kundliBtn}>
            <Text style={styles.kundliBtnText}>View Full Kundli →</Text>
          </Pressable>
        </View>

        {/* ── Messages ── */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          >
            {messages.map((msg) => {
              const isAcharya = msg.role === 'acharya';
              const isSystem = msg.role === 'system';

              if (isSystem) {
                return (
                  <View key={msg.id} style={styles.systemMsgWrap}>
                    <Text style={styles.systemMsg}>{msg.text}</Text>
                  </View>
                );
              }

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.bubbleRow,
                    isAcharya ? styles.bubbleRowRight : styles.bubbleRowLeft,
                  ]}
                >
                  {!isAcharya && (
                    <Avatar name={room.seekerName} size={30} />
                  )}
                  <View style={[styles.bubble, isAcharya ? styles.bubbleAcharya : styles.bubbleSeeker]}>
                    {!isAcharya && (
                      <Text style={styles.bubbleSender}>{msg.senderName}</Text>
                    )}
                    <Text style={[styles.bubbleText, isAcharya && { color: '#fff' }]}>{msg.text}</Text>
                    <Text style={[styles.bubbleTime, isAcharya && { color: 'rgba(255,255,255,0.65)' }]}>
                      {new Date(msg.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {isAcharya && ' · You'}
                    </Text>
                  </View>
                  {isAcharya && (
                    <Avatar name={acharyaName} size={30} />
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* ── Quick Reply Tray ── */}
          {showQuick && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickTray}
            >
              {QUICK_REPLIES.map((qr, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSend(qr)}
                  style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.75 }]}
                >
                  <Text style={styles.quickChipText}>{qr}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* ── Composer ── */}
          {!isEnded && (
            <View style={styles.composer}>
              {/* Quick reply toggle */}
              <Pressable onPress={() => setShowQuick(!showQuick)} style={styles.composerIconBtn}>
                <Text style={styles.composerIcon}>⚡</Text>
              </Pressable>

              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={isWaiting ? 'Accept session to reply…' : 'Type Vedic guidance…'}
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
    gap: spacing.sm,
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
  },
  backIcon: { fontSize: 22, color: colors.text, lineHeight: 30, marginLeft: -2, fontWeight: '700' },
  hName: { fontSize: 15, fontWeight: '800', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  hMeta: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  earnedPill: {
    backgroundColor: 'rgba(5,150,105,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
    alignItems: 'center',
  },
  earnedVal: { color: colors.teal, fontWeight: '800', fontSize: 14 },
  earnedSub: { color: colors.teal, fontWeight: '600', fontSize: 10, opacity: 0.8 },

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
  acceptBtn: { backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  acceptBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  endBtn: { backgroundColor: '#EF4444', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  endedBadge: { backgroundColor: 'rgba(100,116,139,0.12)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  endedBadgeText: { color: '#64748B', fontWeight: '700', fontSize: 12 },

  birthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: 'rgba(217,119,6,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217,119,6,0.2)',
  },
  birthCardText: { fontSize: 11, color: '#92400E', fontWeight: '600', flex: 1 },
  kundliBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(217,119,6,0.12)', borderRadius: radius.pill },
  kundliBtnText: { color: '#B45309', fontSize: 11, fontWeight: '800' },

  msgList: { padding: spacing.md, gap: 12, paddingBottom: 16 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '88%' },
  bubbleRowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubbleRowLeft: { alignSelf: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, gap: 3 },
  bubbleAcharya: {
    backgroundColor: colors.teal,
    borderBottomRightRadius: 4,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleSeeker: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.6)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleSender: { fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 1 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20, fontWeight: '500' },
  bubbleTime: { fontSize: 10, color: colors.textFaint, marginTop: 2, alignSelf: 'flex-end' },

  systemMsgWrap: { alignSelf: 'center', marginVertical: 6 },
  systemMsg: {
    fontSize: 11,
    color: colors.textMuted,
    backgroundColor: 'rgba(241,245,249,0.9)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },

  quickTray: { paddingHorizontal: spacing.md, paddingVertical: 8, gap: 8 },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(5,150,105,0.3)',
  },
  quickChipText: { color: colors.teal, fontSize: 12, fontWeight: '700' },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(191,219,254,0.5)',
    gap: spacing.sm,
  },
  composerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  composerIcon: { fontSize: 18 },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sendBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: -2 },

  endedBar: {
    padding: spacing.md,
    backgroundColor: 'rgba(5,150,105,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(5,150,105,0.2)',
    alignItems: 'center',
  },
  endedBarText: { color: colors.teal, fontWeight: '700', fontSize: 13 },
});
