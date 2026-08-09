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
import { Button } from '../../src/components/Button';
import { ChatBubble } from '../../src/components/ChatBubble';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { greetingFor, replyTo, typingDelay } from '../../src/services/consult/replies';
import { useChatStore } from '../../src/store/chatStore';
import { useLiveChatStore } from '../../src/store/liveChatStore';
import { useUserStore } from '../../src/store/userStore';
import { useWalletStore } from '../../src/store/walletStore';
import { useAuthStore } from '../../src/store/authStore';
import { formatCurrency } from '../../src/utils';

let idCounter = 0;
const nextId = () => `m-${Date.now()}-${++idCounter}`;

const QUICK_PROMPTS = [
  '✨ Career & Finance 2026',
  '❤️ Marriage & Compatibility',
  '🪐 Kundli Dasha Remedies',
  '🔮 Lucky Gemstone Advice',
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const astrologer = ASTROLOGERS.find((a) => a.id === id);
  const authUser = useAuthStore((s) => s.user);

  const kundli = useUserStore((s) => s.kundli);
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);
  const topup = useWalletStore((s) => s.topup);

  // Per-user chat store actions
  const getSession = useChatStore((s) => s.getSession);
  const startSession = useChatStore((s) => s.startSession);
  const billMinute = useChatStore((s) => s.billMinute);
  const endSession = useChatStore((s) => s.endSession);
  const addMessage = useChatStore((s) => s.addMessage);

  // ── Live bidirectional chat room (Seeker ↔ Acharya) ──
  const createRoom = useLiveChatStore((s) => s.createRoom);
  const sendLiveMessage = useLiveChatStore((s) => s.sendMessage);
  const markRead = useLiveChatStore((s) => s.markRead);
  const syncRoomFromBackend = useLiveChatStore((s) => s.syncRoomFromBackend);
  const liveRoom = useLiveChatStore((s) =>
    astrologer && authUser?.id
      ? s.getRoomByPair(authUser.id.toString(), astrologer.id)
      : null
  );
  const liveRoomId = liveRoom?.roomId ?? null;
  const liveMessages = liveRoom?.messages ?? [];
  const isLiveActive = liveRoom?.status === 'active';
  const isLiveEnded = liveRoom?.status === 'ended';

  // 1.5s real-time background sync polling
  useEffect(() => {
    if (!liveRoomId) return;
    syncRoomFromBackend(liveRoomId);
    const poll = setInterval(() => {
      syncRoomFromBackend(liveRoomId);
    }, 1500);
    return () => clearInterval(poll);
  }, [liveRoomId]);

  const session = astrologer ? getSession(astrologer.id) : null;
  const active = Boolean(session?.startedAt && !session?.ended);
  const messages = session?.messages ?? [];

  const displayMessages = useMemo(() => {
    if (liveMessages.length > 0) {
      return liveMessages
        .filter((lm) => lm.role !== 'system')
        .map((lm) => ({
          id: lm.id,
          role: lm.role === 'acharya' ? ('assistant' as const) : ('user' as const),
          text: lm.text,
          at: lm.at,
        }));
    }
    return messages;
  }, [liveMessages, messages]);

  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ranOut, setRanOut] = useState(false);
  const [mode, setMode] = useState<'chat' | 'call'>('chat');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const sendScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(8))).current;

  const price = astrologer?.pricePerMin ?? 0;
  const cost = session?.costSoFar ?? 0;

  // Pulse & Wave Animations for Audio Call Mode
  useEffect(() => {
    if (mode === 'call' && active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

      const waveLoops = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 18 + (i % 5) * 8, duration: 300 + (i % 4) * 120, easing: Easing.linear, useNativeDriver: false }),
            Animated.timing(anim, { toValue: 6 + (i % 3) * 4, duration: 300 + (i % 4) * 120, easing: Easing.linear, useNativeDriver: false }),
          ])
        )
      );
      waveLoops.forEach((loop) => loop.start());
      return () => waveLoops.forEach((loop) => loop.stop());
    }
  }, [mode, active, pulseAnim, waveAnims]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const begin = useCallback(() => {
    if (!astrologer) return;
    
    // Auto-topup welcome trial if user has insufficient funds for first minute
    if (balance < astrologer.pricePerMin) {
      topup(100, 'Welcome Consultation Bonus');
    }

    const ok = debit(astrologer.pricePerMin, `Consult · ${astrologer.name} (min 1)`);
    if (!ok) {
      setRanOut(true);
      return;
    }

    startSession(astrologer.id);
    billMinute(astrologer.id, astrologer.pricePerMin);
    setElapsed(0);
    setRanOut(false);

    // ── Create or open a live bidirectional room for Acharya to see ──
    if (authUser?.id) {
      createRoom({
        seekerId: authUser.id.toString(),
        seekerName: authUser.name ?? 'Seeker',
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        topic: QUICK_PROMPTS[0],
        ratePerMin: astrologer.pricePerMin,
      });
    }

    if ((useChatStore.getState().sessions[astrologer.id]?.messages.length ?? 0) === 0) {
      addMessage(astrologer.id, {
        id: nextId(),
        role: 'assistant',
        text: greetingFor(astrologer),
        at: Date.now(),
      });
    }
  }, [astrologer, balance, topup, debit, startSession, billMinute, addMessage, createRoom, authUser]);

  useEffect(() => {
    if (astrologer && !session?.startedAt && !session?.ended) begin();
  }, [astrologer?.id]);

  useEffect(() => {
    if (!active || !astrologer) return;

    const t = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 60 === 0) {
          const minute = next / 60 + 1;
          const ok = debit(
            astrologer.pricePerMin,
            `Consult · ${astrologer.name} (min ${minute})`,
          );
          if (ok) {
            billMinute(astrologer.id, astrologer.pricePerMin);
          } else {
            setRanOut(true);
            endSession(astrologer.id);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [active, astrologer, debit, billMinute, endSession]);

  function send(textToSend?: string) {
    const text = (textToSend || draft).trim();
    if (!text || !astrologer) return;

    // If session ended or ran out, restart seamlessly on message send
    if (!active) {
      begin();
    }

    setDraft('');
    addMessage(astrologer.id, { id: nextId(), role: 'user', text, at: Date.now() });

    // ── Mirror to live room so Acharya sees it in real time ──
    if (liveRoomId && authUser?.name) {
      sendLiveMessage(liveRoomId, 'seeker', authUser.name, text);
    }

    scrollToEnd();

    // Button pop animation
    Animated.sequence([
      Animated.timing(sendScaleAnim, { toValue: 0.82, duration: 100, useNativeDriver: true }),
      Animated.timing(sendScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const turn = messages.filter((m) => m.role === 'user').length;
    const reply = replyTo(text, astrologer, kundli, turn);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage(astrologer.id, {
        id: nextId(),
        role: 'assistant',
        text: reply,
        at: Date.now(),
      });
      scrollToEnd();
    }, typingDelay(reply));
  }

  function stop() {
    if (astrologer) endSession(astrologer.id);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/consult');
    }
  }

  if (!astrologer) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <EmptyState
            icon="🔭"
            title="Astrologer not found"
            actionLabel="Back to list"
            onAction={() => router.replace('/(tabs)/consult')}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const minLeft = Math.max(1, Math.floor(balance / Math.max(1, price)));

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Screen Header Bar */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          
          <Avatar
            uri={astrologer.avatar}
            name={astrologer.name}
            size={42}
            online={astrologer.online}
            showStatus
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.hName} numberOfLines={1}>
              {astrologer.name}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: active ? colors.online : colors.saffron }]} />
              <Text style={styles.hMeta}>
                {active ? `Live Consultation · ${mm}:${ss}` : 'Online Jyotishi'}
              </Text>
            </View>
          </View>

          {/* Dynamic Real Wallet Balance Pill */}
          <Pressable onPress={() => router.push('/wallet')} style={styles.walletPill}>
            <LinearGradient
              colors={['rgba(230,126,34,0.12)', 'rgba(212,172,13,0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.walletVal}>{formatCurrency(balance)}</Text>
            <Text style={styles.walletRate}>{formatCurrency(price)}/min</Text>
          </Pressable>
        </View>

        {/* Sub-Header Session Info Strip */}
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            Spent: {formatCurrency(cost)} · ~{minLeft} min remaining
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable
              onPress={() => setMode(mode === 'chat' ? 'call' : 'chat')}
              style={styles.modeToggle}
            >
              <LinearGradient
                colors={mode === 'call' ? [colors.saffron, colors.gold] : ['#F1F5F9', '#E2E8F0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modeToggleGrad}
              >
                <Text style={[styles.modeToggleText, mode === 'call' && { color: colors.white }]}>
                  {mode === 'chat' ? '📞 Audio Call' : '💬 Live Chat'}
                </Text>
              </LinearGradient>
            </Pressable>

            {active ? (
              <Pressable onPress={stop} hitSlop={8} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
            ) : (
              <Pressable onPress={begin} hitSlop={8} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Connect</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── AUDIO CALL MODE ── */}
        {mode === 'call' ? (
          <View style={styles.callScreen}>
            <Animated.View style={[styles.callAvatarRing, { transform: [{ scale: pulseAnim }] }]}>
              {active && (
                <LinearGradient
                  colors={['rgba(230,126,34,0.30)', 'rgba(125,60,152,0.10)']}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Avatar
                uri={astrologer.avatar}
                name={astrologer.name}
                size={110}
                online={astrologer.online}
                showStatus
              />
            </Animated.View>

            <Text style={styles.callName}>{astrologer.name}</Text>
            <Text style={[styles.callStatus, { color: active ? colors.saffron : colors.textMuted }]}>
              {active ? `Live Audio Call · ${mm}:${ss}` : 'Ready to Connect'}
            </Text>

            {/* Soundwave Equalizer */}
            <View style={styles.waveContainer}>
              {waveAnims.map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.waveBar,
                    {
                      height: anim,
                      backgroundColor: active
                        ? idx % 3 === 0 ? colors.saffron : idx % 3 === 1 ? colors.gold : colors.teal
                        : '#CBD5E1',
                    },
                  ]}
                />
              ))}
            </View>

            {/* Call Action Controls */}
            <View style={styles.callControls}>
              <Pressable
                onPress={() => setIsMuted(!isMuted)}
                style={[styles.callBtn, isMuted && styles.callBtnDanger]}
              >
                <Text style={styles.callBtnIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
                <Text style={[styles.callBtnLabel, isMuted && { color: colors.danger }]}>
                  {isMuted ? 'Muted' : 'Mute'}
                </Text>
              </Pressable>

              <Pressable onPress={active ? stop : begin} style={styles.callBtnEnd}>
                <LinearGradient
                  colors={active ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.callBtnIcon}>{active ? '📵' : '📞'}</Text>
                <Text style={[styles.callBtnLabel, { color: colors.white }]}>
                  {active ? 'End Call' : 'Start Call'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsSpeaker(!isSpeaker)}
                style={[styles.callBtn, isSpeaker && styles.callBtnGold]}
              >
                <Text style={styles.callBtnIcon}>🔊</Text>
                <Text style={[styles.callBtnLabel, isSpeaker && { color: colors.saffron }]}>
                  {isSpeaker ? 'Speaker' : 'Earpiece'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ── LIVE CHAT MODE ── */
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.scroll}
              onContentSizeChange={scrollToEnd}
              showsVerticalScrollIndicator={false}
            >
              {displayMessages.map((m) => (
                <ChatBubble key={m.id} message={m} authorLabel={astrologer.name} />
              ))}
              {typing && (
                <ChatBubble
                  message={{ id: 'typing', role: 'assistant', text: '', at: Date.now(), pending: true }}
                  authorLabel={astrologer.name}
                />
              )}
            </ScrollView>

            {/* Quick Suggested Prompts */}
            <View style={styles.promptWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptScroll}
                style={{ flexGrow: 0 }}
              >
                {QUICK_PROMPTS.map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => send(prompt)}
                    style={({ pressed }) => [styles.promptChip, pressed && { opacity: 0.75 }]}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Insufficient Funds Banner */}
            {ranOut && (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  💸 Wallet balance low. Recharge to continue consultation.
                </Text>
                <Button
                  label="💰 Quick Top-Up ₹100"
                  variant="gold"
                  size="sm"
                  onPress={() => {
                    topup(100, 'Instant Wallet Top-Up');
                    begin();
                  }}
                />
              </View>
            )}

            {/* Sleek WhatsApp/Telegram Style Composer Pill with Integrated Send Button */}
            <View style={styles.composer}>
              <View style={styles.inputPillContainer}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Type your question to Acharya…"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                  onSubmitEditing={() => send()}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={() => send()}
                  disabled={!draft.trim()}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    !draft.trim() && styles.sendBtnOff,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Animated.View style={{ transform: [{ scale: sendScaleAnim }], flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <LinearGradient
                      colors={draft.trim() ? [colors.saffron, colors.gold] : ['#CBD5E1', '#94A3B8']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.sendIcon}>➤</Text>
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#060A12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.25)',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  backIcon: { color: colors.text, fontSize: 26, lineHeight: 28, marginTop: -2 },
  hName: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  hMeta: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  walletPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1726',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
    overflow: 'hidden',
  },
  walletVal: { ...typography.h3, fontSize: 13, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  walletRate: { ...typography.tiny, fontSize: 9.5, color: colors.textMuted, textAlign: 'center', fontWeight: '700' },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: '#080E1A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.20)',
  },
  stripText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  modeToggle: { borderRadius: radius.pill, overflow: 'hidden' },
  modeToggleGrad: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  modeToggleText: { ...typography.tiny, color: colors.white, fontWeight: '800' },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  endBtnText: { ...typography.tiny, color: colors.danger, fontWeight: '800' },
  startBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  startBtnText: { ...typography.tiny, color: colors.online, fontWeight: '800' },

  /* Call Mode */
  callScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  callAvatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(230,126,34,0.4)',
    overflow: 'hidden',
  },
  callName: { ...typography.h1, fontSize: 22, color: colors.text, textAlign: 'center', fontWeight: '800' },
  callStatus: { ...typography.small, fontWeight: '700', textAlign: 'center' },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 50,
    marginVertical: spacing.md,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
  },
  callControls: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  callBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  callBtnDanger: { backgroundColor: 'rgba(244,63,94,0.14)', borderColor: colors.danger },
  callBtnGold: { backgroundColor: 'rgba(245,158,11,0.14)', borderColor: colors.saffron },
  callBtnEnd: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  callBtnIcon: { fontSize: 22 },
  callBtnLabel: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '700' },

  /* Chat Mode */
  scroll: { padding: spacing.lg, flexGrow: 1 },

  promptWrapper: {
    height: 42,
    marginBottom: spacing.xs,
  },
  promptScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  promptChip: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  promptText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 12 },

  noticeCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
    gap: spacing.sm,
  },
  noticeText: { ...typography.small, color: colors.text, textAlign: 'center', fontWeight: '600' },

  composer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#060A12',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  inputPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnOff: { opacity: 0.5 },
  sendIcon: { color: colors.white, fontSize: 15, fontWeight: '900', marginLeft: 2 },
});
