import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
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
import { GradientBackground } from '../src/components/GradientBackground';
import { colors, radius, spacing, typography } from '../src/theme';
import { useRewardsStore, RemedyItem, TarotCard } from '../src/store/rewardsStore';
import { useWalletStore } from '../src/store/walletStore';
import { formatCurrency } from '../src/utils';

const { width } = Dimensions.get('window');

const WHEEL_PRIZES = [
  { label: '₹25 Cash', color: '#F59E0B' },
  { label: '50 Coins', color: '#10B981' },
  { label: '₹50 Off', color: '#8B5CF6' },
  { label: '100 Coins', color: '#EC4899' },
  { label: '₹10 Cash', color: '#3B82F6' },
  { label: 'Free Milan', color: '#F97316' },
];

export default function DailyRewardsScreen() {
  const router = useRouter();
  const {
    streakCount,
    hasCheckedInToday,
    astroCoins,
    hasSpunToday,
    dailyTarotCard,
    tarotFlipped,
    remedies,
    checkInToday,
    spinChakra,
    drawDailyTarot,
    toggleRemedy,
    addRemedy,
    deleteRemedy,
  } = useRewardsStore();

  const balance = useWalletStore((s) => s.balance);

  // Wheel animation
  const spinValue = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinPrizeModal, setSpinPrizeModal] = useState<string | null>(null);

  // Tarot flip animation
  const flipValue = useRef(new Animated.Value(tarotFlipped ? 180 : 0)).current;
  const [isFlipped, setIsFlipped] = useState(tarotFlipped);

  // Add Remedy Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemCategory, setNewRemCategory] = useState<RemedyItem['category']>('mantra');
  const [newRemTiming, setNewRemTiming] = useState('Daily Morning');

  // Pulse animation for streak flame
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function handleCheckIn() {
    const res = checkInToday();
    if (res.success) {
      Alert.alert(
        '🔥 Cosmic Streak Claimed!',
        `Day ${res.newStreak} Check-in Complete!\n+${res.coinsAwarded} Astro-Coins added to your vault.`,
        [{ text: 'Namaste 🙏' }]
      );
    } else {
      Alert.alert('Already Claimed', 'You have already collected today’s cosmic streak! Return tomorrow for Day ' + (streakCount + 1));
    }
  }

  function handleSpinWheel() {
    if (hasSpunToday) {
      Alert.alert('Chakra Resetting', 'You have already spun the Navagraha Chakra today! Come back tomorrow at sunrise.');
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);

    const randomRotations = 5 + Math.floor(Math.random() * 4);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalDeg = randomRotations * 360 + randomAngle;

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: totalDeg,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      const res = spinChakra();
      setSpinPrizeModal(res.prize);
    });
  }

  function handleTarotFlip() {
    const card = drawDailyTarot();
    if (!isFlipped) {
      Animated.spring(flipValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(true);
      });
    }
  }

  const frontInterpolate = flipValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Cosmic Rewards & Daily Tarot</Text>
            <Text style={styles.subTitle}>Streaks, Navagraha Chakra & Remedy Vault</Text>
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsIcon}>🪙</Text>
            <Text style={styles.coinsText}>{astroCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: Cosmic Streak & Daily Check-in ── */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#1E1B4B', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.streakTop}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={{ fontSize: 36 }}>🔥</Text>
              </Animated.View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.streakCount}>{streakCount} Day Cosmic Streak!</Text>
                <Text style={styles.streakSub}>
                  {hasCheckedInToday
                    ? '✨ Today’s cosmic energy claimed'
                    : 'Claim your daily divine energy & Astro-Coins'}
                </Text>
              </View>
              <Pressable
                onPress={handleCheckIn}
                disabled={hasCheckedInToday}
                style={[styles.claimBtn, hasCheckedInToday && styles.claimBtnDisabled]}
              >
                <LinearGradient
                  colors={hasCheckedInToday ? ['#64748B', '#475569'] : [colors.saffron, colors.gold]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.claimBtnText}>{hasCheckedInToday ? '✅ Claimed' : '⚡ Claim'}</Text>
              </Pressable>
            </View>

            {/* 7-Day Trail */}
            <View style={styles.trailRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isPassed = day <= streakCount;
                const isCurrent = day === streakCount;
                return (
                  <View key={day} style={[styles.trailNode, isPassed && styles.trailNodePassed]}>
                    <Text style={[styles.trailDay, isPassed && { color: '#FDE68A' }]}>D{day}</Text>
                    <Text style={{ fontSize: 13, marginTop: 2 }}>{day === 7 ? '👑' : isPassed ? '⭐' : '🪙'}</Text>
                    <Text style={styles.trailCoins}>+{20 + day * 5}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Section 2: Navagraha Spin & Win Chakra ── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>🎡 Navagraha Spin & Win Chakra</Text>
              <Text style={styles.badgeFree}>{hasSpunToday ? 'Used Today' : '1 Free Spin'}</Text>
            </View>
            <Text style={styles.cardDesc}>
              Spin the celestial wheel once daily to win instant wallet cash, consultation discount vouchers, and bonus Astro-Coins!
            </Text>

            <View style={styles.wheelWrapper}>
              <Animated.View style={[styles.wheelCircle, { transform: [{ rotate: spinInterpolate }] }]}>
                <LinearGradient
                  colors={['#7C3AED', '#4F46E5', '#2563EB', '#059669', '#D97706', '#DC2626']}
                  style={StyleSheet.absoluteFill}
                />
                {WHEEL_PRIZES.map((item, idx) => {
                  const angle = idx * 60;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.wheelSliceText,
                        { transform: [{ rotate: `${angle}deg` }, { translateY: -46 }] },
                      ]}
                    >
                      <Text style={styles.wheelText}>{item.label}</Text>
                    </View>
                  );
                })}
                <View style={styles.wheelHub}>
                  <Text style={{ fontSize: 18 }}>☸️</Text>
                </View>
              </Animated.View>

              {/* Center Pointer */}
              <View style={styles.wheelPointer}>
                <Text style={{ fontSize: 24 }}>▼</Text>
              </View>
            </View>

            <Pressable
              onPress={handleSpinWheel}
              disabled={isSpinning || hasSpunToday}
              style={[styles.spinBtn, (isSpinning || hasSpunToday) && styles.spinBtnDisabled]}
            >
              <LinearGradient
                colors={hasSpunToday ? ['#64748B', '#475569'] : [colors.teal, '#059669']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.spinBtnText}>
                {isSpinning ? '☸️ Aligning Planetary Chakra…' : hasSpunToday ? '✅ Spun Today (Resets 6 AM)' : '✨ Spin the Chakra Now'}
              </Text>
            </Pressable>
          </View>

          {/* ── Section 3: Mystical Tarot Card of the Day ── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>🃏 Daily Mystical Tarot Guidance</Text>
              <Text style={styles.badgeFree}>Tap to Reveal</Text>
            </View>
            <Text style={styles.cardDesc}>
              Draw your personalized celestial archetype for today. Discover your ruling planet, lucky stone, and cosmic affirmation.
            </Text>

            <Pressable onPress={handleTarotFlip} style={styles.tarotCardContainer}>
              {/* Card Back */}
              <Animated.View
                style={[
                  styles.tarotCard,
                  styles.tarotCardBack,
                  { transform: [{ rotateY: frontInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={['#312E81', '#1E1B4B', '#0F172A']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 50 }}>🔮</Text>
                <Text style={styles.tarotBackText}>ASTROGURU TAROT</Text>
                <Text style={styles.tarotBackSub}>Tap to Flip & Reveal</Text>
              </Animated.View>

              {/* Card Front */}
              <Animated.View
                style={[
                  styles.tarotCard,
                  styles.tarotCardFront,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={['#1E293B', '#0F172A']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 44, marginBottom: 4 }}>{dailyTarotCard?.imageEmoji}</Text>
                <Text style={styles.tarotFrontName}>{dailyTarotCard?.name}</Text>
                <Text style={styles.tarotFrontArcana}>{dailyTarotCard?.arcana} · {dailyTarotCard?.rulingPlanet}</Text>
                <View style={styles.tarotPill}>
                  <Text style={styles.tarotPillText}>✨ {dailyTarotCard?.keyword}</Text>
                </View>
                <Text style={styles.tarotMeaning}>{dailyTarotCard?.meaning}</Text>
                <View style={styles.tarotAffirmBox}>
                  <Text style={styles.tarotAffirmTitle}>🌟 Daily Cosmic Affirmation:</Text>
                  <Text style={styles.tarotAffirmText}>"{dailyTarotCard?.affirmation}"</Text>
                </View>
                <View style={styles.tarotMetaRow}>
                  <Text style={styles.tarotMetaItem}>💎 Stone: {dailyTarotCard?.luckyStone}</Text>
                  <Text style={styles.tarotMetaItem}>🎨 Lucky No: {dailyTarotCard?.luckyNumber}</Text>
                </View>
              </Animated.View>
            </Pressable>
          </View>

          {/* ── Section 4: Daily Remedy & Sadhana Diary ── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>🪔 Cosmic Remedy & Sadhana Diary</Text>
              <Pressable onPress={() => setShowAddModal(true)} style={styles.addRemedyBtn}>
                <Text style={styles.addRemedyBtnText}>+ Add Remedy</Text>
              </Pressable>
            </View>
            <Text style={styles.cardDesc}>
              Track your daily mantras, gemstone routines, and astrologer-prescribed Lal Kitab remedies. Earn +15 Astro-Coins per checkmark!
            </Text>

            <View style={{ gap: 8, marginTop: 8 }}>
              {remedies.map((rem) => (
                <Pressable
                  key={rem.id}
                  onPress={() => toggleRemedy(rem.id)}
                  style={[styles.remedyItem, rem.completed && styles.remedyItemCompleted]}
                >
                  <View style={[styles.checkbox, rem.completed && styles.checkboxActive]}>
                    <Text style={styles.checkboxTick}>{rem.completed ? '✓' : ''}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.remedyTitle, rem.completed && styles.remedyTitleDone]}>
                      {rem.title}
                    </Text>
                    <Text style={styles.remedyTiming}>
                      🕒 {rem.timing} · 🔥 {rem.streak} day streak
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => deleteRemedy(rem.id)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>✕</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ── Prize Modal ── */}
        <Modal visible={Boolean(spinPrizeModal)} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.prizeCard}>
              <Text style={{ fontSize: 50, textAlign: 'center' }}>🎉</Text>
              <Text style={styles.prizeTitle}>Cosmic Fortune Won!</Text>
              <Text style={styles.prizeSub}>The Navagraha Chakra has bestowed:</Text>
              <View style={styles.prizeBadge}>
                <Text style={styles.prizeBadgeText}>{spinPrizeModal}</Text>
              </View>
              <Text style={styles.prizeNote}>Prize added to your account instantly.</Text>
              <Pressable onPress={() => setSpinPrizeModal(null)} style={styles.prizeCloseBtn}>
                <LinearGradient colors={[colors.saffron, colors.gold]} style={StyleSheet.absoluteFill} />
                <Text style={styles.prizeCloseText}>Namaste 🙏</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Add Remedy Modal ── */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.addModalCard}>
              <Text style={styles.addModalTitle}>+ Add Cosmic Remedy</Text>
              <TextInput
                value={newRemTitle}
                onChangeText={setNewRemTitle}
                placeholder="e.g. Chant Gayatri Mantra 21 times"
                placeholderTextColor={colors.textFaint}
                style={styles.addInput}
              />
              <TextInput
                value={newRemTiming}
                onChangeText={setNewRemTiming}
                placeholder="Timing (e.g. Sunrise / Thursday evening)"
                placeholderTextColor={colors.textFaint}
                style={styles.addInput}
              />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Pressable onPress={() => setShowAddModal(false)} style={styles.cancelModalBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!newRemTitle.trim()) return;
                    addRemedy(newRemTitle.trim(), newRemCategory, newRemTiming.trim());
                    setNewRemTitle('');
                    setShowAddModal(false);
                  }}
                  style={styles.saveModalBtn}
                >
                  <LinearGradient colors={[colors.teal, '#059669']} style={StyleSheet.absoluteFill} />
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Save Remedy</Text>
                </Pressable>
              </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backIcon: { fontSize: 22, color: colors.text, fontWeight: '700', marginLeft: -2 },
  title: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  subTitle: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  coinsIcon: { fontSize: 14 },
  coinsText: { ...typography.tiny, fontWeight: '900', color: '#B45309' },

  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCount: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  streakSub: { ...typography.tiny, color: '#CBD5E1', fontSize: 11, marginTop: 2 },
  claimBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    overflow: 'hidden',
  },
  claimBtnDisabled: { opacity: 0.6 },
  claimBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },

  trailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  trailNode: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 38,
  },
  trailNodePassed: {
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  trailDay: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  trailCoins: { fontSize: 9, color: '#CBD5E1', fontWeight: '700', marginTop: 2 },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSectionTitle: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  badgeFree: {
    ...typography.tiny,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#ECFDF5',
    color: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  cardDesc: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 12,
  },

  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    height: 170,
  },
  wheelCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FDE68A',
  },
  wheelSliceText: {
    position: 'absolute',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
  wheelHub: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  wheelPointer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
  },
  spinBtn: {
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 6,
  },
  spinBtnDisabled: { opacity: 0.65 },
  spinBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13.5 },

  tarotCardContainer: {
    height: 290,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotCard: {
    position: 'absolute',
    width: width - 56,
    height: 280,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  tarotCardBack: {
    gap: 8,
  },
  tarotBackText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 1.5,
  },
  tarotBackSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tarotCardFront: {
    padding: spacing.md,
    alignItems: 'center',
  },
  tarotFrontName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE68A',
  },
  tarotFrontArcana: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  tarotPill: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginVertical: 6,
  },
  tarotPillText: { fontSize: 11, fontWeight: '800', color: '#F59E0B' },
  tarotMeaning: {
    fontSize: 11,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 15,
  },
  tarotAffirmBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    padding: 8,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  tarotAffirmTitle: { fontSize: 9.5, fontWeight: '800', color: '#FDE68A' },
  tarotAffirmText: { fontSize: 10.5, color: '#FFFFFF', fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  tarotMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 6,
  },
  tarotMetaItem: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },

  addRemedyBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  addRemedyBtnText: { color: colors.teal, fontSize: 11, fontWeight: '800' },
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  remedyItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxTick: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  remedyTitle: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  remedyTitleDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  remedyTiming: { fontSize: 10, color: colors.textMuted, marginTop: 2, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  prizeCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  prizeTitle: { ...typography.h2, fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 8 },
  prizeSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  prizeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  prizeBadgeText: { fontSize: 16, fontWeight: '900', color: '#B45309' },
  prizeNote: { fontSize: 11, color: colors.textMuted, marginBottom: 16 },
  prizeCloseBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    overflow: 'hidden',
  },
  prizeCloseText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },

  addModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  addModalTitle: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  addInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});