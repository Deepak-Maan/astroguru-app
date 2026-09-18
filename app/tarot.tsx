import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { TAROT_DECK, TarotCard } from '../src/data/tarot';
import { useWalletStore } from '../src/store/walletStore';
import { useSubscriptionStore } from '../src/store/subscriptionStore';
import { formatCurrency } from '../src/utils';
import { guruVaniVoiceService } from '../src/services/speech/guruVaniVoiceService';

export type SpreadType = 'daily' | 'love' | 'career' | 'threeCard' | 'yesNo';

interface SpreadConfig {
  id: SpreadType;
  title: string;
  icon: string;
  subtitle: string;
  cardCount: number;
  baseFee: number;
  badge?: string;
  gradient: [string, string];
}

const SPREADS: SpreadConfig[] = [
  {
    id: 'daily',
    title: 'Daily Card',
    icon: '🃏',
    subtitle: 'Cosmic Archetype & Advice for Today',
    cardCount: 1,
    baseFee: 149,
    gradient: ['#E67E22', '#D4AC0D'],
  },
  {
    id: 'love',
    title: 'Love & Ex',
    icon: '❤️',
    subtitle: 'Your Heart, Their Thoughts & Future',
    cardCount: 3,
    baseFee: 299,
    badge: 'HOT',
    gradient: ['#E11D48', '#BE185D'],
  },
  {
    id: 'career',
    title: 'Career & Wealth',
    icon: '💼',
    subtitle: 'Strengths, Hidden Obstacles & Money',
    cardCount: 3,
    baseFee: 299,
    badge: 'POPULAR',
    gradient: ['#059669', '#0D9488'],
  },
  {
    id: 'threeCard',
    title: 'Past · Present · Future',
    icon: '🔮',
    subtitle: 'Full Karmic Timeline & Evolution',
    cardCount: 3,
    baseFee: 299,
    gradient: ['#7D3C98', '#4F46E5'],
  },
  {
    id: 'yesNo',
    title: 'Yes / No Oracle',
    icon: '❓',
    subtitle: 'Instant Verdict & Timing Forecast',
    cardCount: 1,
    baseFee: 99,
    badge: '₹99 ONLY',
    gradient: ['#4F46E5', '#3B82F6'],
  },
];

const PRESET_QUESTIONS = [
  'Will I get the job / promotion?',
  'Will my ex or partner text me back?',
  'Is it the right time to invest money?',
  'Will this relationship turn into marriage?',
  'Should I move to a new city / abroad?',
];

export default function TarotScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);
  const isVip = useSubscriptionStore((s) => s.isVip);

  const [spreadMode, setSpreadMode] = useState<SpreadType>('daily');
  const [userQuestion, setUserQuestion] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [showCutDeckModal, setShowCutDeckModal] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [debitNotice, setDebitNotice] = useState<string | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Audio wave animation
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.7)).current;
  const waveAnim3 = useRef(new Animated.Value(0.5)).current;

  const currentConfig = SPREADS.find((s) => s.id === spreadMode) || SPREADS[0];
  const finalFee = isVip ? Math.round(currentConfig.baseFee * 0.85) : currentConfig.baseFee;

  const [drawnCards, setDrawnCards] = useState<{ position: string; card: TarotCard; revealed: boolean }[]>(() => [
    { position: '🌟 Today’s Cosmic Guidance', card: TAROT_DECK[0], revealed: false },
  ]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      guruVaniVoiceService.stopSpeaking();
    };
  }, []);

  // Waveform animation loop
  useEffect(() => {
    if (isVoiceSpeaking) {
      const loopAnim = (val: Animated.Value, dur: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue: 1, duration: dur, useNativeDriver: true }),
            Animated.timing(val, { toValue: 0.2, duration: dur, useNativeDriver: true }),
          ])
        ).start();
      };
      loopAnim(waveAnim1, 350);
      loopAnim(waveAnim2, 480);
      loopAnim(waveAnim3, 400);
    } else {
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.7);
      waveAnim3.setValue(0.5);
    }
  }, [isVoiceSpeaking]);

  const getPositionsForMode = (mode: SpreadType): string[] => {
    switch (mode) {
      case 'daily':
        return ['🌟 Today’s Cosmic Archetype'];
      case 'love':
        return ['❤️ 1 · Your Heart & Energy', '💭 2 · Their Secret Feelings', '🔮 3 · Relationship Future'];
      case 'career':
        return ['💼 1 · Professional Strengths', '⚠️ 2 · Hidden Work Obstacle', '🪙 3 · Wealth Breakthrough'];
      case 'threeCard':
        return ['⏳ 1 · Past Influences', '⚡ 2 · Present Reality', '🌅 3 · Future Outcome'];
      case 'yesNo':
        return ['❓ The Oracle’s Verdict'];
    }
  };

  const handleSelectSpread = (mode: SpreadType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    guruVaniVoiceService.stopSpeaking();
    setIsVoiceSpeaking(false);
    setSpreadMode(mode);

    // Prompt deck cut to draw
    setShowCutDeckModal(true);
  };

  const executeDraw = (mode: SpreadType, deckCutName: string) => {
    setShowCutDeckModal(false);
    guruVaniVoiceService.stopSpeaking();
    setIsVoiceSpeaking(false);

    // Debit wallet
    const spreadName = SPREADS.find((s) => s.id === mode)?.title || 'Tarot Reading';
    const success = debit(finalFee, `Tarot Session: ${spreadName} (${deckCutName})`);
    if (!success) {
      setShowRechargeModal(true);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setDebitNotice(`${formatCurrency(finalFee)} debited for ${spreadName} ✨`);
    setTimeout(() => setDebitNotice(null), 3500);

    // Shuffle
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      const shuffled = [...TAROT_DECK].sort(() => 0.5 - Math.random());
      const positions = getPositionsForMode(mode);
      const newDrawn = positions.map((pos, idx) => ({
        position: pos,
        card: shuffled[idx % shuffled.length],
        revealed: false,
      }));
      setDrawnCards(newDrawn);
    }, 600);
  };

  const revealCard = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDrawnCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, revealed: true } : c))
    );
  };

  const revealAllCards = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setDrawnCards((prev) => prev.map((c) => ({ ...c, revealed: true })));
  };

  const toggleVoiceReading = () => {
    if (isVoiceSpeaking) {
      guruVaniVoiceService.stopSpeaking();
      setIsVoiceSpeaking(false);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Generate comprehensive speech narrative
    let narrative = `Namaste divine seeker. Welcome to your ${currentConfig.title} Tarot session. `;
    if (spreadMode === 'yesNo') {
      const first = drawnCards[0].card;
      narrative += `Regarding your question: "${userQuestion || 'your deepest concern'}", the sacred oracle declares: ${first.yesOrNo}, with ${first.confidencePct} percent cosmic certainty. ${first.upright} In timing: ${first.timingAdvice}. Take this guidance to heart.`;
    } else if (spreadMode === 'love') {
      narrative += `In your Love reading: First, your heart energy is governed by ${drawnCards[0]?.card.name}: ${drawnCards[0]?.card.loveMeaning} Second, your partner's unspoken thoughts reflect ${drawnCards[1]?.card.name}: ${drawnCards[1]?.card.loveMeaning} Finally, the future of your connection culminates in ${drawnCards[2]?.card.name}: ${drawnCards[2]?.card.loveMeaning} Cosmic advice: ${drawnCards[2]?.card.advice}`;
    } else if (spreadMode === 'career') {
      narrative += `In your Career and Wealth spread: Your greatest strength is ${drawnCards[0]?.card.name}: ${drawnCards[0]?.card.careerMeaning} Be vigilant regarding ${drawnCards[1]?.card.name}, which indicates hidden obstacles: ${drawnCards[1]?.card.careerMeaning} Your path to financial breakthrough is blessed by ${drawnCards[2]?.card.name}: ${drawnCards[2]?.card.careerMeaning} Actionable advice: ${drawnCards[2]?.card.advice}`;
    } else {
      drawnCards.forEach((item) => {
        narrative += `For ${item.position}, we have ${item.card.name}. ${item.card.upright} Cosmic advice: ${item.card.advice}. `;
      });
    }

    setIsVoiceSpeaking(true);
    guruVaniVoiceService.speakText(
      narrative,
      () => setIsVoiceSpeaking(true),
      () => setIsVoiceSpeaking(false)
    );
  };

  const anyRevealed = drawnCards.some((c) => c.revealed);
  const allRevealed = drawnCards.every((c) => c.revealed);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Sacred Tarot Reader"
          subtitle={`Session Fee: ${formatCurrency(finalFee)}`}
          showBack
          showWallet
        />

        {/* ── 5 SPREAD TABS SCROLLER ── */}
        <View style={styles.tabWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            {SPREADS.map((sp) => {
              const active = spreadMode === sp.id;
              return (
                <Pressable
                  key={sp.id}
                  onPress={() => handleSelectSpread(sp.id)}
                  style={[styles.spreadTab, active && styles.spreadTabActive]}
                >
                  {active && (
                    <LinearGradient colors={sp.gradient} style={StyleSheet.absoluteFill} />
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16 }}>{sp.icon}</Text>
                    <Text style={[styles.spreadTabText, active && styles.spreadTabTextActive]}>
                      {sp.title}
                    </Text>
                    {!!sp.badge && (
                      <View style={styles.tabBadge}>
                        <Text style={styles.tabBadgeText}>{sp.badge}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!!debitNotice && (
            <View style={styles.debitBanner}>
              <Text style={styles.debitBannerText}>{debitNotice}</Text>
            </View>
          )}

          {/* ── SPREAD HERO BANNER ── */}
          <View style={styles.heroBanner}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.25)', 'rgba(168, 85, 247, 0.08)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.heroIconBox}>
                <Text style={{ fontSize: 26 }}>{currentConfig.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>{currentConfig.title} Spread</Text>
                <Text style={styles.heroSubtitle}>{currentConfig.subtitle}</Text>
              </View>
              <View style={styles.feePill}>
                <Text style={styles.feeText}>{formatCurrency(finalFee)}</Text>
                {isVip && <Text style={styles.vipTag}>VIP -15%</Text>}
              </View>
            </View>
          </View>

          {/* ── YES / NO ORACLE QUESTION INPUT ── */}
          {spreadMode === 'yesNo' && (
            <Card style={styles.questionCard}>
              <Text style={styles.questionLabel}>❓ Enter Your Burning Question:</Text>
              <TextInput
                value={userQuestion}
                onChangeText={setUserQuestion}
                placeholder="Type your question (e.g. Will I get the promotion?)"
                placeholderTextColor="#64748B"
                style={styles.questionInput}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, marginTop: 10 }}
              >
                {PRESET_QUESTIONS.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => setUserQuestion(q)}
                    style={styles.presetChip}
                  >
                    <Text style={styles.presetChipText}>{q}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Card>
          )}

          {/* ── SHUFFLE & VOICE CONTROLS ROW ── */}
          <View style={styles.controlRow}>
            <Pressable
              onPress={() => setShowCutDeckModal(true)}
              disabled={isShuffling}
              style={({ pressed }) => [
                styles.shuffleBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.shuffleBtnText}>
                {isShuffling ? '🔀 Shuffling 78 Cards…' : '🔀 Shuffle & Cut Deck'}
              </Text>
            </Pressable>

            {!allRevealed && (
              <Pressable
                onPress={revealAllCards}
                style={({ pressed }) => [styles.revealAllBtn, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.revealAllBtnText}>✨ Reveal All</Text>
              </Pressable>
            )}
          </View>

          {/* ── GURUVANI AI SPOKEN VOICE READING BAR ── */}
          {anyRevealed && (
            <Pressable
              onPress={toggleVoiceReading}
              style={({ pressed }) => [
                styles.voiceBar,
                isVoiceSpeaking && styles.voiceBarActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <LinearGradient
                colors={
                  isVoiceSpeaking
                    ? ['rgba(239, 68, 68, 0.25)', 'rgba(244, 63, 94, 0.15)']
                    : ['rgba(99, 102, 241, 0.25)', 'rgba(129, 140, 248, 0.15)']
                }
                style={StyleSheet.absoluteFill}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{isVoiceSpeaking ? '⏹️' : '🎙️'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.voiceTitle}>
                    {isVoiceSpeaking ? 'Acharya GuruVani AI Speaking…' : 'Listen to GuruVani AI Voice Reading'}
                  </Text>
                  <Text style={styles.voiceSub}>
                    {isVoiceSpeaking
                      ? 'Tap to stop speech audio'
                      : 'Authentic spoken Vedic interpretation with ambient resonance'}
                  </Text>
                </View>
                {isVoiceSpeaking && (
                  <View style={styles.waveContainer}>
                    <Animated.View style={[styles.waveBar, { transform: [{ scaleY: waveAnim1 }] }]} />
                    <Animated.View style={[styles.waveBar, { transform: [{ scaleY: waveAnim2 }] }]} />
                    <Animated.View style={[styles.waveBar, { transform: [{ scaleY: waveAnim3 }] }]} />
                  </View>
                )}
              </View>
            </Pressable>
          )}

          {/* ── CARDS DISPLAY ── */}
          <Text style={styles.instruction}>
            Tap each card to flip and unveil its divine prophecy:
          </Text>

          <View style={styles.cardsRow}>
            {drawnCards.map((item, idx) => {
              const isYesNo = spreadMode === 'yesNo';
              const isLove = spreadMode === 'love';
              const isCareer = spreadMode === 'career';

              return (
                <View key={idx} style={styles.cardCol}>
                  <Text style={styles.posTitle}>{item.position}</Text>

                  <Pressable
                    onPress={() => revealCard(idx)}
                    style={({ pressed }) => [
                      styles.tarotCardFrame,
                      item.revealed && styles.tarotCardFrameRevealed,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                    ]}
                  >
                    {item.revealed ? (
                      <View style={styles.tarotCardFront}>
                        <Image source={{ uri: item.card.image }} style={styles.cardImage} />
                        <LinearGradient
                          colors={['transparent', 'rgba(10, 12, 26, 0.94)']}
                          style={styles.cardGradOverlay}
                        />
                        <View style={styles.cardOverlayContent}>
                          <Text style={styles.cardGlyph}>{item.card.glyph}</Text>
                          <Text style={styles.cardName}>{item.card.name}</Text>
                        </View>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={['#4338CA', '#312E81', '#1E1B4B']}
                        style={styles.tarotCardBack}
                      >
                        <View style={styles.tarotBackPattern}>
                          <Text style={{ fontSize: 40 }}>🪐</Text>
                          <Text style={styles.tapText}>TAP TO REVEAL</Text>
                          <View style={styles.sacredRings}>
                            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>✦ ✦ ✦</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    )}
                  </Pressable>

                  {/* ── CARD INTERPRETATION & GAUGES ── */}
                  {item.revealed && (
                    <Card style={{ marginTop: spacing.sm }}>
                      <SectionHeader
                        title={item.card.name}
                        subtitle={`Element: ${item.card.element} · Arcana #${item.card.number}`}
                      />

                      {/* YES/NO CONFIDENCE METER (If in Yes/No mode) */}
                      {isYesNo && (
                        <View style={styles.yesNoBox}>
                          <View style={styles.verdictRow}>
                            <Text style={styles.verdictLabel}>Oracle Verdict:</Text>
                            <View
                              style={[
                                styles.verdictBadge,
                                item.card.yesOrNo.includes('YES')
                                  ? styles.badgeYes
                                  : item.card.yesOrNo.includes('NO')
                                  ? styles.badgeNo
                                  : styles.badgeMaybe,
                              ]}
                            >
                              <Text style={styles.verdictBadgeText}>{item.card.yesOrNo}</Text>
                            </View>
                          </View>

                          <View style={styles.confidenceRow}>
                            <Text style={styles.confidenceText}>
                              Certainty: <strong>{item.card.confidencePct}%</strong>
                            </Text>
                            <View style={styles.confidenceTrack}>
                              <View
                                style={[
                                  styles.confidenceFill,
                                  {
                                    width: `${item.card.confidencePct}%`,
                                    backgroundColor: item.card.yesOrNo.includes('YES')
                                      ? '#10B981'
                                      : item.card.yesOrNo.includes('NO')
                                      ? '#F43F5E'
                                      : '#F59E0B',
                                  },
                                ]}
                              />
                            </View>
                          </View>

                          <View style={styles.timingPill}>
                            <Text style={styles.timingText}>
                              ⏳ <strong>Cosmic Timing:</strong> {item.card.timingAdvice}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* LOVE SPREAD CUSTOM READING */}
                      {isLove && (
                        <View style={styles.topicHighlightBox}>
                          <Text style={styles.topicHighlightTitle}>❤️ Love & Karmic Meaning:</Text>
                          <Text style={styles.topicHighlightText}>{item.card.loveMeaning}</Text>
                        </View>
                      )}

                      {/* CAREER SPREAD CUSTOM READING */}
                      {isCareer && (
                        <View style={[styles.topicHighlightBox, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                          <Text style={[styles.topicHighlightTitle, { color: '#34D399' }]}>
                            💼 Career & Wealth Insight:
                          </Text>
                          <Text style={styles.topicHighlightText}>{item.card.careerMeaning}</Text>
                        </View>
                      )}

                      {/* Keywords */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.xs }}>
                        {item.card.keywords.map((kw) => (
                          <Chip key={kw} label={kw} tone="gold" />
                        ))}
                      </View>

                      {/* Upright Meaning */}
                      <Text style={styles.readHeading}>Vedic Archetype & Prophecy:</Text>
                      <Text style={styles.readText}>{item.card.upright}</Text>

                      {/* Cosmic Advice */}
                      <Text style={styles.readHeading}>Cosmic Action Advice:</Text>
                      <Text style={styles.readAdvice}>💡 {item.card.advice}</Text>
                    </Card>
                  )}
                </View>
              );
            })}
          </View>

          {/* New Spread Button */}
          <Button
            label={`🔀 Pull New ${currentConfig.title} Spread (${formatCurrency(finalFee)})`}
            variant="gold"
            size="lg"
            onPress={() => setShowCutDeckModal(true)}
            style={{ marginTop: spacing.md }}
          />
        </ScrollView>

        {/* ── 3D CUT THE DECK INTERACTIVE MODAL ── */}
        <Modal visible={showCutDeckModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.cutDeckModal}>
              <LinearGradient
                colors={['#1E1B4B', '#0F172A']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 4 }}>🔮</Text>
              <Text style={styles.cutDeckTitle}>Cut the Sacred Tarot Deck</Text>
              <Text style={styles.cutDeckSubtitle}>
                Select one of the three cosmic stacks below to focus your intention and reveal your spread:
              </Text>

              <View style={styles.deckStacksRow}>
                {/* Stack 1 */}
                <Pressable
                  onPress={() => executeDraw(spreadMode, 'Surya Stack')}
                  style={({ pressed }) => [styles.deckStackCard, pressed && { transform: [{ scale: 0.96 }] }]}
                >
                  <LinearGradient colors={['#D97706', '#92400E']} style={styles.stackGradient}>
                    <Text style={{ fontSize: 28 }}>☀️</Text>
                    <Text style={styles.stackName}>Surya</Text>
                    <Text style={styles.stackSub}>Willpower & Soul</Text>
                  </LinearGradient>
                </Pressable>

                {/* Stack 2 */}
                <Pressable
                  onPress={() => executeDraw(spreadMode, 'Chandra Stack')}
                  style={({ pressed }) => [styles.deckStackCard, pressed && { transform: [{ scale: 0.96 }] }]}
                >
                  <LinearGradient colors={['#4F46E5', '#312E81']} style={styles.stackGradient}>
                    <Text style={{ fontSize: 28 }}>🌙</Text>
                    <Text style={styles.stackName}>Chandra</Text>
                    <Text style={styles.stackSub}>Emotions & Mind</Text>
                  </LinearGradient>
                </Pressable>

                {/* Stack 3 */}
                <Pressable
                  onPress={() => executeDraw(spreadMode, 'Shiva Stack')}
                  style={({ pressed }) => [styles.deckStackCard, pressed && { transform: [{ scale: 0.96 }] }]}
                >
                  <LinearGradient colors={['#7C3AED', '#581C87']} style={styles.stackGradient}>
                    <Text style={{ fontSize: 28 }}>🔱</Text>
                    <Text style={styles.stackName}>Shiva</Text>
                    <Text style={styles.stackSub}>Transformation</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={{ marginTop: spacing.md }}>
                <Button
                  label="Close"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowCutDeckModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* ── RECHARGE REQUIRED MODAL ── */}
        <Modal visible={showRechargeModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insufficient Wallet Balance</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 40 }}>💰</Text>
                <Text style={styles.modalText}>
                  {currentConfig.title} Session requires{' '}
                  <Text style={{ color: colors.saffron, fontWeight: '800' }}>
                    {formatCurrency(finalFee)}
                  </Text>.
                </Text>
                <Text style={styles.modalSubText}>
                  Your current balance is{' '}
                  <Text style={{ color: colors.danger }}>{formatCurrency(balance)}</Text>.
                  Please recharge your wallet to continue.
                </Text>
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="💰 Recharge Wallet Now"
                  variant="gold"
                  size="md"
                  onPress={() => {
                    setShowRechargeModal(false);
                    router.push('/wallet');
                  }}
                />
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => setShowRechargeModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.2)',
  },
  tabScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  spreadTab: {
    height: 38,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spreadTabActive: {
    borderColor: '#C7D2FE',
  },
  spreadTabText: {
    ...typography.small,
    color: '#A5B4FC',
    fontWeight: '800',
    fontSize: 12,
  },
  spreadTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  tabBadge: {
    backgroundColor: '#FF3366',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  debitBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  debitBannerText: { ...typography.small, color: colors.success, fontWeight: '800', textAlign: 'center' },

  heroBanner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...typography.h3,
    color: '#EEF2FF',
    fontWeight: '900',
    fontSize: 16,
  },
  heroSubtitle: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
  },
  feePill: {
    alignItems: 'flex-end',
  },
  feeText: {
    ...typography.small,
    color: colors.gold,
    fontWeight: '900',
    fontSize: 14,
  },
  vipTag: {
    fontSize: 9,
    color: colors.success,
    fontWeight: '800',
  },

  /* Question Card for Yes/No */
  questionCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  questionLabel: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '800',
    marginBottom: 6,
  },
  questionInput: {
    backgroundColor: 'rgba(10, 12, 28, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  presetChipText: {
    color: '#C7D2FE',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Controls */
  controlRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  shuffleBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shuffleBtnText: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  revealAllBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealAllBtnText: {
    ...typography.small,
    color: '#C7D2FE',
    fontWeight: '800',
  },

  /* GuruVani Voice Bar */
  voiceBar: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  voiceBarActive: {
    borderColor: '#EF4444',
  },
  voiceTitle: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '800',
  },
  voiceSub: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
    width: 20,
    justifyContent: 'center',
  },
  waveBar: {
    width: 3,
    height: 16,
    backgroundColor: '#F43F5E',
    borderRadius: 2,
  },

  instruction: {
    ...typography.small,
    color: '#A5B4FC',
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 2,
  },

  cardsRow: { gap: spacing.lg },
  cardCol: { gap: spacing.xs },
  posTitle: {
    ...typography.h3,
    color: colors.goldSoft,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '800',
  },

  tarotCardFrame: {
    height: 250,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.8,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    backgroundColor: '#131830',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tarotCardFrameRevealed: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  tarotCardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotBackPattern: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: radius.lg,
    width: '85%',
    height: '85%',
  },
  tapText: { ...typography.tiny, color: colors.white, fontWeight: '800', letterSpacing: 1.2 },
  sacredRings: { marginTop: 4 },

  tarotCardFront: { flex: 1, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  cardOverlayContent: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  cardGlyph: { fontSize: 34 },
  cardName: {
    ...typography.h2,
    color: colors.white,
    textShadowColor: '#000',
    textShadowRadius: 6,
    fontWeight: '900',
    marginTop: 2,
  },

  /* Yes/No Box */
  yesNoBox: {
    backgroundColor: 'rgba(10, 12, 28, 0.7)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    gap: 8,
  },
  verdictRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verdictLabel: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '800',
  },
  verdictBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeYes: { backgroundColor: '#059669' },
  badgeNo: { backgroundColor: '#DC2626' },
  badgeMaybe: { backgroundColor: '#D97706' },
  verdictBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  confidenceRow: {
    gap: 4,
  },
  confidenceText: {
    ...typography.tiny,
    color: '#A5B4FC',
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  timingPill: {
    marginTop: 2,
  },
  timingText: {
    ...typography.tiny,
    color: colors.goldSoft,
    fontSize: 11,
  },

  /* Topic Highlight Box */
  topicHighlightBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  topicHighlightTitle: {
    ...typography.small,
    color: '#FB7185',
    fontWeight: '800',
    marginBottom: 4,
  },
  topicHighlightText: {
    ...typography.body,
    color: '#EEF2FF',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  readHeading: { ...typography.tiny, color: '#818CF8', fontWeight: '800', marginTop: spacing.sm },
  readText: { ...typography.body, color: '#EEF2FF', lineHeight: 21, marginTop: 2, fontWeight: '500' },
  readAdvice: { ...typography.small, color: colors.goldSoft, fontWeight: '800', lineHeight: 20, marginTop: 4 },

  /* 3D Cut Deck Modal */
  cutDeckModal: {
    backgroundColor: '#0F172A',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  cutDeckTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 20,
  },
  cutDeckSubtitle: {
    ...typography.tiny,
    color: '#A5B4FC',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  deckStacksRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  deckStackCard: {
    flex: 1,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stackGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
  },
  stackName: {
    ...typography.small,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stackSub: {
    fontSize: 9,
    color: '#E0E7FF',
    textAlign: 'center',
    fontWeight: '600',
  },

  /* Recharge Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4, 6, 15, 0.88)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    gap: spacing.md,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: { ...typography.h2, color: '#EEF2FF', textAlign: 'center', fontWeight: '800' },
  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: '#EEF2FF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  modalSubText: { ...typography.small, color: '#A5B4FC', textAlign: 'center', lineHeight: 18 },
});