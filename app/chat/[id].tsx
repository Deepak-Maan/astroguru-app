import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { astrologerById } from '../../src/data/astrologers';
import { useChatStore } from '../../src/store/chatStore';
import { useUserStore } from '../../src/store/userStore';
import { useWalletStore } from '../../src/store/walletStore';
import { greetingFor, replyTo, typingDelay } from '../../src/services/consult/replies';
import { formatCurrency } from '../../src/utils';

let seq = 0;
const nextId = () => `c-${Date.now()}-${seq++}`;

const WAVE_HEIGHTS = [14, 28, 20, 36, 24, 40, 18, 34, 22, 30, 26, 38];

const QUICK_PROMPTS = [
  '✨ Marriage & Relationship Timing',
  '💼 Career Transition & Promotion',
  '💰 Wealth & Property Prospects',
  '🪐 Current Dasha Remedies',
];

export default function ConsultChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const astrologerId = String(id);
  const astrologer = astrologerById(astrologerId);
  const scrollRef = useRef<ScrollView>(null);

  const session = useChatStore((s) => s.sessions[astrologerId]);
  const startSession = useChatStore((s) => s.startSession);
  const endSession = useChatStore((s) => s.endSession);
  const addMessage = useChatStore((s) => s.addMessage);
  const billMinute = useChatStore((s) => s.billMinute);

  const debit = useWalletStore((s) => s.debit);
  const balance = useWalletStore((s) => s.balance);
  const kundli = useUserStore((s) => s.kundli);

  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ranOut, setRanOut] = useState(false);

  // Mode
  const [mode, setMode] = useState<'chat' | 'call'>('chat');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Animated wave values for call mode
  const waveAnims = useRef(WAVE_HEIGHTS.map(() => new Animated.Value(6))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sendScaleAnim = useRef(new Animated.Value(1)).current;

  const messages = session?.messages ?? [];
  const active = !!session?.startedAt && !session?.ended;
  const cost = session?.costSoFar ?? 0;
  const price = astrologer?.pricePerMin ?? 0;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/consult');
    }
  };

  // Pulsing avatar animation in call mode
  useEffect(() => {
    if (mode === 'call' && active) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [mode, active]);

  // Start/stop soundwave animation
  useEffect(() => {
    if (mode === 'call' && active) {
      const animations = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: WAVE_HEIGHTS[i],
              duration: 280 + i * 70,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 4,
              duration: 280 + i * 70,
              useNativeDriver: false,
            }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      waveAnims.forEach((anim) => anim.setValue(4));
    }
  }, [mode, active]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const begin = useCallback(() => {
    if (!astrologer) return;
    if (!debit(astrologer.pricePerMin, `Consult · ${astrologer.name} (min 1)`)) {
      setRanOut(true);
      return;
    }
    startSession(astrologer.id);
    billMinute(astrologer.id, astrologer.pricePerMin);
    setElapsed(0);
    setRanOut(false);

    if ((useChatStore.getState().sessions[astrologer.id]?.messages.length ?? 0) === 0) {
      addMessage(astrologer.id, {
        id: nextId(),
        role: 'assistant',
        text: greetingFor(astrologer),
        at: Date.now(),
      });
    }
  }, [astrologer, debit, startSession, billMinute, addMessage]);

  useEffect(() => {
    if (astrologer && !session?.startedAt && !session?.ended) begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!text || !astrologer || !active) return;
    setDraft('');
    addMessage(astrologer.id, { id: nextId(), role: 'user', text, at: Date.now() });
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
      if (!useChatStore.getState().sessions[astrologer.id]?.ended) {
        addMessage(astrologer.id, {
          id: nextId(),
          role: 'assistant',
          text: reply,
          at: Date.now(),
        });
      }
      scrollToEnd();
    }, typingDelay(reply));
  }

  function stop() {
    if (astrologer) endSession(astrologer.id);
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
  const minLeft = Math.floor(balance / price);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Avatar
            uri={astrologer.avatar}
            name={astrologer.name}
            size={40}
            online={astrologer.online}
            showStatus
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.hName} numberOfLines={1}>
              {astrologer.name}
            </Text>
            <Text style={[styles.hMeta, { color: active ? colors.teal : colors.textFaint }]}>
              {active ? `● Live · ${mm}:${ss}` : session?.ended ? 'Session ended' : 'Connecting…'}
            </Text>
          </View>

          {/* Perfectly Centered Cost Pill */}
          <View style={styles.costPill}>
            <Text style={styles.costValue}>{formatCurrency(cost)}</Text>
            <Text style={styles.costLabel}>{formatCurrency(price)}/min</Text>
          </View>
        </View>

        {/* Balance + mode strip */}
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            {formatCurrency(balance)} · ~{minLeft} min left
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable
              onPress={() => setMode(mode === 'chat' ? 'call' : 'chat')}
              style={styles.modeToggle}
            >
              <LinearGradient
                colors={mode === 'call' ? [colors.auroraA, colors.auroraB] : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modeToggleGrad}
              >
                <Text style={styles.modeToggleText}>
                  {mode === 'chat' ? '📞 Audio Call' : '💬 Live Chat'}
                </Text>
              </LinearGradient>
            </Pressable>
            {active && (
              <Pressable onPress={stop} hitSlop={8} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── CALL MODE ── */}
        {mode === 'call' ? (
          <View style={styles.callScreen}>
            {/* Pulsing Avatar Ring */}
            <Animated.View style={[styles.callAvatarRing, { transform: [{ scale: pulseAnim }] }]}>
              {active && (
                <LinearGradient
                  colors={[colors.auroraA + '55', colors.auroraB + '22']}
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
            <Text style={[styles.callStatus, { color: active ? colors.gold : colors.textFaint }]}>
              {active ? `Live Consultation · ${mm}:${ss}` : 'Call Ended'}
            </Text>

            {/* Animated 12-Bar Soundwave */}
            <View style={styles.waveContainer}>
              {waveAnims.map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.waveBar,
                    {
                      height: anim,
                      backgroundColor: active
                        ? idx % 3 === 0 ? colors.gold : idx % 3 === 1 ? colors.auroraB : colors.teal
                        : colors.textFaint,
                      opacity: active ? 1 : 0.3,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Call controls */}
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

              <Pressable onPress={stop} style={styles.callBtnEnd}>
                <LinearGradient colors={['#FF5A6E', '#CC2244']} style={StyleSheet.absoluteFill} />
                <Text style={styles.callBtnIcon}>📵</Text>
                <Text style={[styles.callBtnLabel, { color: colors.white }]}>End Call</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsSpeaker(!isSpeaker)}
                style={[styles.callBtn, isSpeaker && styles.callBtnGold]}
              >
                <Text style={styles.callBtnIcon}>🔊</Text>
                <Text style={[styles.callBtnLabel, isSpeaker && { color: colors.gold }]}>
                  {isSpeaker ? 'Speaker' : 'Earpiece'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ── CHAT MODE ── */
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
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} authorLabel={astrologer.name} />
              ))}
              {typing && (
                <ChatBubble
                  message={{ id: 'typing', role: 'assistant', text: '', at: Date.now(), pending: true }}
                  authorLabel={astrologer.name}
                />
              )}
            </ScrollView>

            {/* Quick Suggested Question Prompts Container with Fixed Height */}
            {active && (
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
            )}

            {ranOut && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  💸 Your wallet ran out — consultation paused.
                </Text>
                <Button
                  label="Add money to continue"
                  variant="gold"
                  size="sm"
                  onPress={() => router.push('/wallet')}
                />
              </View>
            )}

            {!active && !ranOut && session?.ended && (
              <View style={styles.notice}>
                <Text style={styles.noticeText}>
                  Session ended. Total: {formatCurrency(cost)}.
                </Text>
                <Button label="Start again" variant="primary" size="sm" onPress={begin} />
              </View>
            )}

            {/* Animated Composer */}
            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={active ? 'Type your question…' : 'Session is not active'}
                placeholderTextColor={colors.textFaint}
                style={[styles.input, !active && { opacity: 0.5 }]}
                editable={active}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={() => send()}
                disabled={!draft.trim() || !active}
                style={({ pressed }) => [
                  styles.sendBtn,
                  (!draft.trim() || !active) && styles.sendBtnOff,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Animated.View style={{ transform: [{ scale: sendScaleAnim }], flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  <LinearGradient
                    colors={draft.trim() && active ? [colors.auroraA, colors.auroraB] : ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.06)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.sendIcon}>↑</Text>
                </Animated.View>
              </Pressable>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backIcon: { color: colors.text, fontSize: 24, lineHeight: 26, marginTop: -3 },
  hName: { ...typography.h3, fontSize: 15, color: colors.text },
  hMeta: { ...typography.tiny, marginTop: 1 },
  costPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245,197,66,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.4)',
    minWidth: 64,
  },
  costValue: { ...typography.h3, fontSize: 13, color: colors.gold, textAlign: 'center', lineHeight: 16 },
  costLabel: { ...typography.tiny, fontSize: 9.5, color: colors.textMuted, textAlign: 'center', marginTop: 1 },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  stripText: { ...typography.tiny, color: colors.textMuted },
  modeToggle: { borderRadius: radius.pill, overflow: 'hidden' },
  modeToggleGrad: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  modeToggleText: { ...typography.tiny, color: colors.gold, fontWeight: '800' },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,90,110,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,90,110,0.4)',
  },
  endBtnText: { ...typography.tiny, color: colors.danger, fontWeight: '800' },

  // ── CALL SCREEN ──
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
    borderWidth: 2,
    borderColor: 'rgba(122,60,255,0.45)',
    overflow: 'hidden',
  },
  callName: { ...typography.h1, fontSize: 22, color: colors.text, textAlign: 'center' },
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  callBtnDanger: {
    backgroundColor: 'rgba(255,90,110,0.20)',
    borderColor: 'rgba(255,90,110,0.6)',
  },
  callBtnGold: {
    backgroundColor: 'rgba(245,197,66,0.18)',
    borderColor: 'rgba(245,197,66,0.6)',
  },
  callBtnEnd: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
    borderWidth: 0,
  },
  callBtnIcon: { fontSize: 24 },
  callBtnLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 9.5,
    fontWeight: '700',
  },

  // ── CHAT MODE ──
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  promptText: { ...typography.tiny, color: colors.goldSoft, fontWeight: '700', fontSize: 12 },

  notice: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,138,61,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.4)',
    gap: spacing.md,
  },
  noticeText: { ...typography.small, color: colors.saffron, textAlign: 'center' },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: 'rgba(11,6,32,0.95)',
  },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 11,
    paddingBottom: 11,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnOff: {},
  sendIcon: { color: colors.white, fontSize: 20, fontWeight: '800' },
});
