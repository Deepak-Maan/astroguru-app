import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
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
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { ChatBubble } from '../../src/components/ChatBubble';
import { EmptyState } from '../../src/components/EmptyState';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { greetingFor, replyTo, typingDelay } from '../../src/services/consult/replies';
import { generateAstrologyAiReply, calculateTypingDelay } from '../../src/services/ai/astrologyAiEngine';
import { useChatStore } from '../../src/store/chatStore';
import { useLiveChatStore } from '../../src/store/liveChatStore';
import { useUserStore } from '../../src/store/userStore';
import { useWalletStore } from '../../src/store/walletStore';
import { useAuthStore } from '../../src/store/authStore';
import { formatCurrency } from '../../src/utils';
import { getAstrologerByIdFromFirebase } from '../../src/services/firebaseAuthService';
import { subscribeToFirebaseRoomMessages } from '../../src/services/firebaseRealtimeService';
import { Astrologer, ChatMessage } from '../../src/types';

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
  const [astrologer, setAstrologer] = useState<Astrologer | undefined>(() => ASTROLOGERS.find((a) => a.id === id));

  useEffect(() => {
    if (id && !astrologer) {
      getAstrologerByIdFromFirebase(String(id)).then((data) => {
        if (data) setAstrologer(data);
      });
    }
  }, [id]);

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
  const isFreeEligible = useChatStore((s) => s.isFreeEligible);
  const markFreeTrialUsed = useChatStore((s) => s.markFreeTrialUsed);
  const updateFreeSecondsRemaining = useChatStore((s) => s.updateFreeSecondsRemaining);

  // ── Live bidirectional chat room (Seeker ↔ Acharya) ──
  const createRoom = useLiveChatStore((s) => s.createRoom);
  const sendLiveMessage = useLiveChatStore((s) => s.sendMessage);
  const markRead = useLiveChatStore((s) => s.markRead);
  const currentSeekerId = authUser?.id ? String(authUser.id) : 'usr_seeker_demo';
  const currentSeekerName = authUser?.name ? authUser.name : 'Seeker';

  const liveRoom = useLiveChatStore((s) =>
    astrologer
      ? s.getRoomByPair(currentSeekerId, astrologer.id)
      : null
  );
  const liveRoomId = liveRoom?.roomId ?? (astrologer ? `${currentSeekerId}__${astrologer.id}` : null);
  const liveMessages = liveRoom?.messages ?? [];
  const isLiveActive = liveRoom?.status === 'active';
  const isLiveEnded = liveRoom?.status === 'ended';

  const syncFirebaseMessages = useLiveChatStore((s) => s.syncFirebaseMessages);

  // Real-time Firebase Room Subscription (<100ms sync across devices)
  useEffect(() => {
    if (!liveRoomId) return;
    const unsubscribe = subscribeToFirebaseRoomMessages(liveRoomId, (fbMsgs) => {
      if (fbMsgs && fbMsgs.length > 0) {
        setTimeout(() => {
          syncFirebaseMessages(liveRoomId, fbMsgs);
        }, 0);
      }
    });
    return () => unsubscribe();
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
  const [showRechargeDrawer, setShowRechargeDrawer] = useState(false);
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
    
    const shouldBeFree = isFreeEligible();

    if (shouldBeFree) {
      // 1st Chat Special Offer: 3 Minutes 100% FREE!
      startSession(astrologer.id, true);
      setElapsed(0);
      setRanOut(false);
    } else {
      // Regular paid consultation
      if (balance < astrologer.pricePerMin) {
        topup(100, 'Welcome Consultation Bonus');
      }

      const ok = debit(astrologer.pricePerMin, `Consult · ${astrologer.name} (min 1)`);
      if (!ok) {
        setRanOut(true);
        setShowRechargeDrawer(true);
        return;
      }

      startSession(astrologer.id, false);
      billMinute(astrologer.id, astrologer.pricePerMin);
      setElapsed(0);
      setRanOut(false);
    }

    // ── Create or open a live bidirectional room for Acharya to see ──
    setTimeout(() => {
      createRoom({
        seekerId: currentSeekerId,
        seekerName: currentSeekerName,
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        topic: QUICK_PROMPTS[0],
        ratePerMin: astrologer.pricePerMin,
      });

      if ((useChatStore.getState().sessions[astrologer.id]?.messages.length ?? 0) === 0) {
        const welcomeMsg = shouldBeFree
          ? `${greetingFor(astrologer)}\n\n🎁 Aapka pehla 3-minute consultation bilkul FREE hai! Kripya apna prashna ya samasya batayein, main aapki kundli dekh kar batata hoon.`
          : greetingFor(astrologer);

        addMessage(astrologer.id, {
          id: nextId(),
          role: 'assistant',
          text: welcomeMsg,
          at: Date.now(),
        });
      }
    }, 0);
  }, [astrologer, balance, isFreeEligible, topup, debit, startSession, billMinute, addMessage, createRoom, currentSeekerId, currentSeekerName]);

  useEffect(() => {
    if (astrologer && !session?.startedAt && !session?.ended) {
      const timer = setTimeout(() => {
        begin();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [astrologer?.id]);

  useEffect(() => {
    if (!active || !astrologer) return;

    const t = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        const currentSession = useChatStore.getState().getSession(astrologer.id);
        const isFree = currentSession?.isFreeTrial;

        if (isFree) {
          // Free 3 Minutes (180 seconds)
          if (next <= 180) {
            updateFreeSecondsRemaining(astrologer.id, Math.max(0, 180 - next));

            // Alert 30 seconds before free time ends
            if (next === 150) {
              addMessage(astrologer.id, {
                id: nextId(),
                role: 'assistant',
                text: `⏳ Dhyan dein: Aapke 3 Minute FREE consultation ke 30 second bache hain! 03:00 ke baad standard rate (₹${astrologer.pricePerMin}/min) shuru hoga.`,
                at: Date.now(),
              });
            }

            // Free time completes at exactly 180s (3:00)
            if (next === 180) {
              markFreeTrialUsed();
              // Try debiting for Minute 4 (first paid minute)
              const ok = debit(
                astrologer.pricePerMin,
                `Consult · ${astrologer.name} (min 4)`
              );
              if (ok) {
                billMinute(astrologer.id, astrologer.pricePerMin);
                addMessage(astrologer.id, {
                  id: nextId(),
                  role: 'assistant',
                  text: `✨ Aapka 3-minute FREE trial safaltapoorvak poora hua! Regular consultation ₹${astrologer.pricePerMin}/min shuru ho gaya hai. Aap bejhijhak prashna pooch sakte hain 🙏`,
                  at: Date.now(),
                });
              } else {
                setRanOut(true);
                setShowRechargeDrawer(true);
                addMessage(astrologer.id, {
                  id: nextId(),
                  role: 'assistant',
                  text: `⚠️ 3-Minute FREE trial poora ho chuka hai. Consultation jaari rakhne ke liye kripya apna wallet recharge karein.`,
                  at: Date.now(),
                });
              }
            }
          } else {
            // Subsequent paid minutes (at 240s, 300s, 360s...)
            if (next % 60 === 0) {
              const minute = Math.floor(next / 60) + 1;
              const ok = debit(
                astrologer.pricePerMin,
                `Consult · ${astrologer.name} (min ${minute})`
              );
              if (ok) {
                billMinute(astrologer.id, astrologer.pricePerMin);
              } else {
                setRanOut(true);
                setShowRechargeDrawer(true);
                endSession(astrologer.id);
              }
            }
          }
        } else {
          // Regular non-free session: debits every 60s
          if (next > 0 && next % 60 === 0) {
            const minute = next / 60 + 1;
            const ok = debit(
              astrologer.pricePerMin,
              `Consult · ${astrologer.name} (min ${minute})`
            );
            if (ok) {
              billMinute(astrologer.id, astrologer.pricePerMin);
            } else {
              setRanOut(true);
              setShowRechargeDrawer(true);
              endSession(astrologer.id);
            }
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [active, astrologer, debit, billMinute, endSession, markFreeTrialUsed, updateFreeSecondsRemaining, addMessage]);

  async function send(textToSend?: string) {
    const text = (textToSend || draft).trim();
    if (!text || !astrologer) return;

    // If session ended or ran out, restart seamlessly on message send
    if (!active) {
      begin();
    }

    setDraft('');
    const userMsg: ChatMessage = { id: nextId(), role: 'user', text, at: Date.now() };
    addMessage(astrologer.id, userMsg);

    // ── Mirror to live room so Acharya (Vivek Kumar) sees it in real time ──
    if (liveRoomId) {
      sendLiveMessage(liveRoomId, 'seeker', currentSeekerName, text);
    }

    scrollToEnd();

    // Button pop animation
    Animated.sequence([
      Animated.timing(sendScaleAnim, { toValue: 0.82, duration: 100, useNativeDriver: true }),
      Animated.timing(sendScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setTyping(true);

    try {
      const currentHistory = (useChatStore.getState().getSession(astrologer.id)?.messages || []);
      const reply = await generateAstrologyAiReply({
        currentMessage: text,
        history: currentHistory,
        astrologer,
        kundli,
        profile: useUserStore.getState().profile,
      });

      const delay = calculateTypingDelay(reply);
      setTimeout(() => {
        setTyping(false);
        addMessage(astrologer.id, {
          id: nextId(),
          role: 'assistant',
          text: reply,
          at: Date.now(),
        });
        scrollToEnd();
      }, delay);
    } catch (e) {
      setTyping(false);
      const turn = messages.filter((m) => m.role === 'user').length;
      const fallbackReply = replyTo(text, astrologer, kundli, turn);
      addMessage(astrologer.id, {
        id: nextId(),
        role: 'assistant',
        text: fallbackReply,
        at: Date.now(),
      });
      scrollToEnd();
    }
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

  const isFree = Boolean(session?.isFreeTrial && elapsed < 180);
  const freeSecondsLeft = Math.max(0, 180 - elapsed);
  const freeMm = String(Math.floor(freeSecondsLeft / 60)).padStart(2, '0');
  const freeSs = String(freeSecondsLeft % 60).padStart(2, '0');

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
              <View style={[styles.statusDot, { backgroundColor: isFree ? '#DB2777' : active ? colors.online : colors.saffron }]} />
              <Text style={[styles.hMeta, isFree && { color: '#7C3AED', fontWeight: '800' }]}>
                {active
                  ? (isFree ? `🎁 3 Min FREE · ${freeMm}:${freeSs}` : `Live Consultation · ${mm}:${ss}`)
                  : 'Online Jyotishi'}
              </Text>
            </View>
          </View>

          {/* Dynamic Real Wallet Balance Pill */}
          <Pressable onPress={() => setShowRechargeDrawer(true)} style={styles.walletPill}>
            <LinearGradient
              colors={isFree ? ['rgba(124,58,237,0.12)', 'rgba(219,39,119,0.06)'] : ['rgba(230,126,34,0.12)', 'rgba(212,172,13,0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.walletVal}>{formatCurrency(balance)}</Text>
            <Text style={styles.walletRate}>{isFree ? '1st Free 🎁' : `${formatCurrency(price)}/min ⚡`}</Text>
          </Pressable>
        </View>

        {/* 1st Chat 3-Min FREE Banner */}
        {isFree && (
          <View style={styles.freeTrialBanner}>
            <LinearGradient
              colors={['rgba(124,58,237,0.14)', 'rgba(219,39,119,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.freeTrialGrad}
            >
              <Text style={styles.freeTrialIcon}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.freeTrialTitle}>1st Consultation: First 3 Minutes FREE</Text>
                <Text style={styles.freeTrialSub}>
                  ₹0 debited • {freeMm}:{freeSs} remaining • Normal rate starts at 03:00
                </Text>
              </View>
              <View style={styles.freeTrialBadge}>
                <Text style={styles.freeTrialBadgeText}>3 MIN FREE</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Sub-Header Session Info Strip */}
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            {isFree
              ? `Spent: ₹0 (FREE 3-Min Trial) · ${freeMm}:${freeSs} left`
              : `Spent: ${formatCurrency(cost)} · ~${minLeft} min remaining`}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable
              onPress={() => setMode(mode === 'chat' ? 'call' : 'chat')}
              style={styles.modeToggle}
            >
              <LinearGradient
                colors={mode === 'call' ? ['#6366F1', '#8B5CF6'] : ['#F1F5F9', '#E2E8F0']}
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
                  colors={['rgba(99,102,241,0.30)', 'rgba(139,92,246,0.10)']}
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
            <Text style={[styles.callStatus, { color: active ? colors.primary : colors.textMuted }]}>
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
                        ? idx % 3 === 0 ? '#FF3366' : idx % 3 === 1 ? '#06B6D4' : '#6366F1'
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
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        try {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        } catch (_) {}
                      }
                      send(prompt);
                    }}
                    style={({ pressed }) => [
                      styles.promptChip,
                      pressed && { transform: [{ translateY: 1.5 }], opacity: 0.85 },
                    ]}
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
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (_) {}
                    }
                    send();
                  }}
                  disabled={!draft.trim()}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    !draft.trim() && styles.sendBtnOff,
                    pressed && { transform: [{ translateY: 1.5 }], opacity: 0.85 },
                  ]}
                >
                  <Animated.View style={{ transform: [{ scale: sendScaleAnim }], flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <LinearGradient
                      colors={draft.trim() ? ['#FF3366', '#F43F5E'] : ['#CBD5E1', '#94A3B8']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.sendIcon}>➤</Text>
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* ── 1-Tap In-Session Wallet Recharge Drawer ── */}
        <Modal
          visible={showRechargeDrawer || ranOut}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRechargeDrawer(false)}
        >
          <View style={styles.rechargeOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => !ranOut && setShowRechargeDrawer(false)}
            />
            <View style={styles.rechargeCard}>
              <View style={styles.rechargeHandle} />
              <Text style={styles.rechargeTitle}>⚡ Quick Wallet Top-Up</Text>
              <Text style={styles.rechargeSub}>
                Current Balance: <Text style={{ color: colors.teal, fontWeight: '900' }}>{formatCurrency(balance)}</Text> · Rate: {formatCurrency(price)}/min
              </Text>

              <View style={styles.rechargeGrid}>
                {[
                  { amount: 100, bonus: '₹10 Bonus', mins: `~${Math.floor(100 / (price || 25))} min` },
                  { amount: 250, bonus: '₹35 Bonus', mins: `~${Math.floor(250 / (price || 25))} min`, popular: true },
                  { amount: 500, bonus: '₹100 Bonus', mins: `~${Math.floor(500 / (price || 25))} min`, best: true },
                  { amount: 1000, bonus: '₹250 Bonus', mins: `~${Math.floor(1000 / (price || 25))} min` },
                ].map((pack) => (
                  <Pressable
                    key={pack.amount}
                    onPress={() => {
                      topup(pack.amount, `Live Session Top-Up (${pack.bonus})`);
                      setRanOut(false);
                      setShowRechargeDrawer(false);
                      begin();
                    }}
                    style={[
                      styles.rechargeOption,
                      pack.popular && styles.rechargeOptionPopular,
                      pack.best && styles.rechargeOptionBest,
                    ]}
                  >
                    {pack.popular && (
                      <View style={styles.popularTag}>
                        <Text style={styles.popularTagText}>🌟 POPULAR</Text>
                      </View>
                    )}
                    {pack.best && (
                      <View style={[styles.popularTag, { backgroundColor: colors.gold }]}>
                        <Text style={styles.popularTagText}>👑 BEST VALUE</Text>
                      </View>
                    )}
                    <Text style={styles.rechargeAmount}>₹{pack.amount}</Text>
                    <Text style={styles.rechargeBonus}>{pack.bonus}</Text>
                    <Text style={styles.rechargeMins}>{pack.mins} chat</Text>
                  </Pressable>
                ))}
              </View>

              {!ranOut && (
                <Pressable
                  onPress={() => setShowRechargeDrawer(false)}
                  style={{ marginTop: 12, padding: 8, alignItems: 'center' }}
                >
                  <Text style={{ ...typography.tiny, color: colors.textMuted, fontWeight: '700' }}>
                    Cancel & Return to Chat
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
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
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(191,219,254,0.8)',
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.8)',
  },
  backIcon: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: -2 },
  hName: { ...typography.h3, fontSize: 15.5, color: '#0F172A', fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  hMeta: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  walletPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,182,212,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(6,182,212,0.35)',
    overflow: 'hidden',
  },
  walletVal: { ...typography.h3, fontSize: 13, color: '#0284C7', textAlign: 'center', fontWeight: '900' },
  walletRate: { ...typography.tiny, fontSize: 9.5, color: colors.textMuted, textAlign: 'center', fontWeight: '700' },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,219,254,0.6)',
  },
  stripText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', fontSize: 11 },
  modeToggle: { borderRadius: radius.pill, overflow: 'hidden' },
  modeToggleGrad: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  modeToggleText: { ...typography.tiny, color: colors.text, fontWeight: '800' },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(225,29,72,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(225,29,72,0.3)',
  },
  endBtnText: { ...typography.tiny, color: colors.danger, fontWeight: '800' },
  startBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
  },
  startBtnText: { ...typography.tiny, color: colors.teal, fontWeight: '800' },

  /* Call Mode */
  callScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  callAvatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(245,158,11,0.5)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  callName: { ...typography.h1, fontSize: 22, color: '#0F172A', textAlign: 'center', fontWeight: '900' },
  callStatus: { ...typography.small, fontWeight: '700', textAlign: 'center' },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 50,
    marginVertical: spacing.sm,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
  },
  callControls: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  callBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
    borderBottomWidth: 3.5,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  callBtnDanger: {
    backgroundColor: 'rgba(225,29,72,0.10)',
    borderColor: colors.danger,
    borderBottomColor: '#BE123C',
  },
  callBtnGold: {
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderColor: '#06B6D4',
    borderBottomColor: '#0E7490',
  },
  callBtnEnd: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  callBtnIcon: { fontSize: 22 },
  callBtnLabel: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '700' },

  /* Chat Mode */
  scroll: { padding: spacing.md, flexGrow: 1 },

  promptWrapper: {
    height: 42,
    marginBottom: spacing.xs,
  },
  promptScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  promptChip: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderRightWidth: 1.2,
    borderRightColor: '#E2E8F0',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promptText: { ...typography.tiny, color: colors.goldSoft, fontWeight: '800', fontSize: 11.5 },

  noticeCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.35)',
    gap: spacing.sm,
  },
  noticeText: { ...typography.small, color: colors.text, textAlign: 'center', fontWeight: '600' },

  composer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(124,58,237,0.12)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F1FA',
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: 4,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.18)',
    height: 48,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 3,
    borderBottomColor: '#9D174D',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnOff: { opacity: 0.4, borderBottomColor: '#94A3B8' },
  sendIcon: { color: colors.white, fontSize: 16, fontWeight: '900', marginLeft: 2 },

  /* In-Session Quick Recharge Drawer */
  rechargeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46,40,54,0.65)',
    justifyContent: 'flex-end',
  },
  rechargeCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  rechargeHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  rechargeTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  rechargeSub: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  rechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rechargeOption: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 14,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    borderRightWidth: 1.2,
    borderRightColor: '#EDE9FE',
    borderBottomWidth: 3.5,
    borderBottomColor: '#DDD6FE',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rechargeOptionPopular: {
    borderColor: colors.coral,
    borderBottomColor: '#9D174D',
    backgroundColor: 'rgba(219,39,119,0.06)',
  },
  rechargeOptionBest: {
    borderColor: colors.primary,
    borderBottomColor: '#5B21B6',
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  popularTag: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.coral,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  popularTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  rechargeAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
  },
  rechargeBonus: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.teal,
    marginTop: 2,
  },
  rechargeMins: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },

  /* 1st Chat 3-Min FREE Banner */
  freeTrialBanner: {
    marginHorizontal: spacing.md,
    marginTop: 6,
    marginBottom: 2,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.25)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  freeTrialGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  freeTrialIcon: {
    fontSize: 22,
  },
  freeTrialTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  freeTrialSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6D28D9',
    marginTop: 2,
  },
  freeTrialBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  freeTrialBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
