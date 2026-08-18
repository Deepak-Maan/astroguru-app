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
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../src/components/GradientBackground';
import { colors, radius, spacing, typography } from '../src/theme';
import { useRewardsStore, RemedyItem, TarotCard } from '../src/store/rewardsStore';
import { useWalletStore } from '../src/store/walletStore';
import { formatCurrency } from '../src/utils';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 80, 260);

const WHEEL_SEGMENTS = [
  { label: '₹25 Cash', icon: '💰', color: '#D97706', bg: ['#F59E0B', '#B45309'] },
  { label: '50 Coins', icon: '🪙', color: '#059669', bg: ['#10B981', '#047857'] },
  { label: '₹50 Off', icon: '🎟️', color: '#7C3AED', bg: ['#8B5CF6', '#6D28D9'] },
  { label: '100 Coins', icon: '💎', color: '#DB2777', bg: ['#EC4899', '#BE185D'] },
  { label: '₹10 Cash', icon: '💵', color: '#2563EB', bg: ['#3B82F6', '#1D4ED8'] },
  { label: 'Free Milan', icon: '📜', color: '#EA580C', bg: ['#F97316', '#C2410C'] },
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Remedies', icon: '✨' },
  { id: 'mantra', label: 'Mantras', icon: '🕉️' },
  { id: 'routine', label: 'Rituals', icon: '🪔' },
  { id: 'gemstone', label: 'Gems', icon: '💎' },
  { id: 'charity', label: 'Seva', icon: '🙏' },
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

  // Category Filter
  const [activeCategory, setActiveCategory] = useState('all');

  // Add Remedy Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemCategory, setNewRemCategory] = useState<RemedyItem['category']>('mantra');
  const [newRemTiming, setNewRemTiming] = useState('Daily Morning (Sunrise)');

  // Flame Pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (Platform.OS !== 'web') {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function handleCheckIn() {
    triggerHaptic('medium');
    const res = checkInToday();
    if (res.success) {
      triggerHaptic('heavy');
      Alert.alert(
        '🔥 Cosmic Energy Claimed!',
        `Day ${res.newStreak} Check-in Complete!\n\n✨ +${res.coinsAwarded} Astro-Coins added to your cosmic vault.\nKeep the streak alive tomorrow!`,
        [{ text: 'Namaste 🙏' }]
      );
    } else {
      Alert.alert(
        'Already Claimed Today',
        `You have already drawn today’s cosmic power! Return tomorrow at sunrise for Day ${streakCount + 1}.`,
        [{ text: 'OK' }]
      );
    }
  }

  function handleSpinWheel() {
    if (hasSpunToday) {
      Alert.alert(
        'Chakra In Alignment',
        'You have already spun the Navagraha Chakra today! Return tomorrow at sunrise for your next free spin.'
      );
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);
    triggerHaptic('medium');

    const randomRotations = 6 + Math.floor(Math.random() * 4);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalDeg = randomRotations * 360 + randomAngle;

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: totalDeg,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      triggerHaptic('heavy');
      const res = spinChakra();
      setSpinPrizeModal(res.prize);
    });
  }

  function handleTarotFlip() {
    triggerHaptic('light');
    const card = drawDailyTarot();
    if (!isFlipped) {
      Animated.spring(flipValue, {
        toValue: 180,
        friction: 7,
        tension: 12,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(true);
        triggerHaptic('medium');
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

  const filteredRemedies = remedies.filter((r) => {
    if (activeCategory === 'all') return true;
    return r.category === activeCategory;
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* ── Top Header Bar ── */}
        <View style={styles.topNavBar}>
          <Pressable onPress={() => router.back()} style={styles.navBackBtn}>
            <Text style={styles.navBackIcon}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.navTitle}>Cosmic Rewards & Daily Tarot</Text>
            <Text style={styles.navSubtitle}>Streaks · Navagraha Chakra · Sadhana Vault</Text>
          </View>
          <View style={styles.coinsHeaderPill}>
            <Text style={{ fontSize: 14 }}>🪙</Text>
            <Text style={styles.coinsHeaderText}>{astroCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: Cosmic Streak Hero Journey ── */}
          <View style={styles.heroStreakCard}>
            <LinearGradient
              colors={['#1E1B4B', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Glowing Accent Orb */}
            <View style={styles.glowOrb} />

            <View style={styles.streakHeaderRow}>
              <Animated.View style={[styles.flameCircle, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient colors={['#F59E0B', '#EA580C']} style={StyleSheet.absoluteFill} />
                <Text style={{ fontSize: 26 }}>🔥</Text>
              </Animated.View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.streakEyebrow}>DAILY SACRED HABIT</Text>
                  <View style={styles.streakStatusBadge}>
                    <Text style={styles.streakStatusText}>
                      {hasCheckedInToday ? '✅ Claimed' : '⚡ Available'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.streakMainTitle}>{streakCount} Day Cosmic Streak!</Text>
                <Text style={styles.streakDescription}>
                  {hasCheckedInToday
                    ? 'Divine grace activated! Return tomorrow for Day ' + (streakCount + 1)
                    : 'Check in now to claim +25 Astro-Coins & energize your chart'}
                </Text>
              </View>
            </View>

            {/* 7-Day Visual Milestones Track */}
            <View style={styles.milestoneTrack}>
              {/* Connecting line */}
              <View style={styles.trackLineBg} />

              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isPassed = day < streakCount || (day === streakCount && hasCheckedInToday);
                const isCurrent = day === streakCount && !hasCheckedInToday;
                const isJackpot = day === 7;

                return (
                  <View key={day} style={styles.dayNodeWrapper}>
                    <View
                      style={[
                        styles.dayNodeCircle,
                        isPassed && styles.dayNodePassed,
                        isCurrent && styles.dayNodeCurrent,
                        isJackpot && styles.dayNodeJackpot,
                      ]}
                    >
                      {isPassed ? (
                        <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '900' }}>✓</Text>
                      ) : isJackpot ? (
                        <Text style={{ fontSize: 14 }}>👑</Text>
                      ) : isCurrent ? (
                        <Text style={{ fontSize: 13 }}>🔥</Text>
                      ) : (
                        <Text style={styles.dayNodeText}>D{day}</Text>
                      )}
                    </View>
                    <Text style={[styles.dayNodeLabel, isPassed && { color: '#FDE68A' }]}>
                      +{20 + day * 5}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Claim CTA Button */}
            <Pressable
              onPress={handleCheckIn}
              disabled={hasCheckedInToday}
              style={({ pressed }) => [
                styles.claimStreakBtn,
                hasCheckedInToday && styles.claimStreakBtnDone,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={
                  hasCheckedInToday
                    ? ['#334155', '#1E293B']
                    : [colors.saffron, colors.gold]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.claimStreakBtnText}>
                {hasCheckedInToday
                  ? '✨ Today’s Energy Claimed (Come back tomorrow)'
                  : `⚡ Claim Day ${streakCount} Energy (+${20 + streakCount * 5} Coins)`}
              </Text>
            </Pressable>
          </View>

          {/* ── Section 2: Interactive Navagraha Spin Chakra ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Text style={{ fontSize: 18 }}>🎡</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionHeading}>Navagraha Spin & Win Chakra</Text>
                <Text style={styles.sectionSubHeading}>Spin daily for wallet cash & consultation vouchers</Text>
              </View>
              <View style={[styles.freeTag, hasSpunToday && styles.freeTagUsed]}>
                <Text style={[styles.freeTagText, hasSpunToday && { color: '#64748B' }]}>
                  {hasSpunToday ? 'Used Today' : '1 Free Spin'}
                </Text>
              </View>
            </View>

            {/* Wheel Canvas & Pointer */}
            <View style={styles.wheelOuterFrame}>
              {/* Outer Golden Cosmic Ring */}
              <View style={styles.wheelGoldRing}>
                <Animated.View
                  style={[
                    styles.wheelDisc,
                    {
                      width: WHEEL_SIZE,
                      height: WHEEL_SIZE,
                      borderRadius: WHEEL_SIZE / 2,
                      transform: [{ rotate: spinInterpolate }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#4338CA', '#3730A3', '#1E1B4B']}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* 6 Wheel Wedges */}
                  {WHEEL_SEGMENTS.map((seg, idx) => {
                    const angle = idx * 60;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.wedgeContainer,
                          { transform: [{ rotate: `${angle}deg` }] },
                        ]}
                      >
                        <View style={styles.wedgeContent}>
                          <Text style={{ fontSize: 15, marginBottom: 2 }}>{seg.icon}</Text>
                          <Text style={styles.wedgeLabel}>{seg.label}</Text>
                        </View>
                      </View>
                    );
                  })}

                  {/* Center Sacred OM Hub */}
                  <View style={styles.centerOmHub}>
                    <LinearGradient
                      colors={[colors.gold, colors.saffron]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.omText}>🕉️</Text>
                  </View>
                </Animated.View>

                {/* Top Arrow Pointer */}
                <View style={styles.wheelArrowPointer}>
                  <Text style={{ fontSize: 24, color: '#F59E0B' }}>▼</Text>
                </View>
              </View>
            </View>

            {/* Spin CTA Button */}
            <Pressable
              onPress={handleSpinWheel}
              disabled={isSpinning || hasSpunToday}
              style={({ pressed }) => [
                styles.spinActionBtn,
                (isSpinning || hasSpunToday) && styles.spinActionBtnDisabled,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={
                  hasSpunToday
                    ? ['#475569', '#334155']
                    : [colors.teal, '#047857']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.spinActionBtnText}>
                {isSpinning
                  ? '☸️ Aligning Graha Coordinates…'
                  : hasSpunToday
                  ? '✅ Chakra Spun (Resets at Sunrise)'
                  : '✨ Spin Navagraha Chakra Now'}
              </Text>
            </Pressable>
          </View>

          {/* ── Section 3: Mystical Tarot Guidance of the Day ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#F3E8FF' }]}>
                <Text style={{ fontSize: 18 }}>🃏</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionHeading}>Daily Mystical Tarot Guidance</Text>
                <Text style={styles.sectionSubHeading}>Celestial archetype & planetary alignment for today</Text>
              </View>
              <View style={styles.tapToRevealPill}>
                <Text style={styles.tapToRevealText}>{isFlipped ? 'Revealed' : 'Tap Card'}</Text>
              </View>
            </View>

            {/* 3D Animated Tarot Card Container */}
            <Pressable onPress={handleTarotFlip} style={styles.tarotFlipArea}>
              {/* Back Face */}
              <Animated.View
                style={[
                  styles.tarotCardSide,
                  styles.tarotCardBackStyle,
                  { transform: [{ rotateY: frontInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={['#312E81', '#1E1B4B', '#0F172A']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.tarotFiligreeBorder}>
                  <Text style={{ fontSize: 44, marginBottom: 8 }}>🔮</Text>
                  <Text style={styles.tarotBackTitle}>ASTROGURU TAROT</Text>
                  <Text style={styles.tarotBackMantra}>SACRED CELESTIAL DECK</Text>
                  <View style={styles.tarotTapPrompt}>
                    <Text style={styles.tarotTapPromptText}>✨ Tap to Flip & Receive Insight</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Front Face */}
              <Animated.View
                style={[
                  styles.tarotCardSide,
                  styles.tarotCardFrontStyle,
                  { transform: [{ rotateY: backInterpolate }] },
                ]}
              >
                <LinearGradient
                  colors={['#1E293B', '#0F172A']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.tarotFrontHeader}>
                  <Text style={{ fontSize: 38 }}>{dailyTarotCard?.imageEmoji}</Text>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.tarotCardTitleText}>{dailyTarotCard?.name}</Text>
                    <Text style={styles.tarotCardSubText}>
                      {dailyTarotCard?.arcana} · {dailyTarotCard?.rulingPlanet}
                    </Text>
                  </View>
                </View>

                {/* Keyword Pill */}
                <View style={styles.tarotKeywordBadge}>
                  <Text style={styles.tarotKeywordText}>✨ {dailyTarotCard?.keyword}</Text>
                </View>

                {/* Meaning */}
                <Text style={styles.tarotMeaningText}>{dailyTarotCard?.meaning}</Text>

                {/* Affirmation Box */}
                <View style={styles.tarotAffirmationCard}>
                  <Text style={styles.tarotAffirmationHeader}>🌟 Daily Cosmic Affirmation:</Text>
                  <Text style={styles.tarotAffirmationQuote}>"{dailyTarotCard?.affirmation}"</Text>
                </View>

                {/* Meta Indicator Pills */}
                <View style={styles.tarotIndicatorRow}>
                  <View style={styles.indicatorPill}>
                    <Text style={styles.indicatorLabel}>💎 Stone</Text>
                    <Text style={styles.indicatorValue}>{dailyTarotCard?.luckyStone}</Text>
                  </View>
                  <View style={styles.indicatorPill}>
                    <Text style={styles.indicatorLabel}>🎨 Lucky Color</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: dailyTarotCard?.luckyColor || '#F59E0B' },
                        ]}
                      />
                      <Text style={styles.indicatorValue}>{dailyTarotCard?.rulingPlanet}</Text>
                    </View>
                  </View>
                  <View style={styles.indicatorPill}>
                    <Text style={styles.indicatorLabel}>🔢 Lucky No.</Text>
                    <Text style={styles.indicatorValue}>{dailyTarotCard?.luckyNumber}</Text>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </View>

          {/* ── Section 4: Sacred Sadhana & Remedy Habit Vault ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ fontSize: 18 }}>🪔</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionHeading}>Sacred Sadhana & Remedy Diary</Text>
                <Text style={styles.sectionSubHeading}>Complete daily rituals & earn +15 Astro-Coins</Text>
              </View>
              <Pressable
                onPress={() => setShowAddModal(true)}
                style={styles.addRemedyHeaderBtn}
              >
                <Text style={styles.addRemedyHeaderBtnText}>+ Add</Text>
              </Pressable>
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilterRow}
            >
              {CATEGORY_FILTERS.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    triggerHaptic('light');
                    setActiveCategory(cat.id);
                  }}
                  style={[
                    styles.categoryFilterPill,
                    activeCategory === cat.id && styles.categoryFilterPillActive,
                  ]}
                >
                  <Text style={styles.categoryFilterIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryFilterText,
                      activeCategory === cat.id && styles.categoryFilterTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Remedy Items List */}
            <View style={{ gap: 10, marginTop: 10 }}>
              {filteredRemedies.map((rem) => (
                <Pressable
                  key={rem.id}
                  onPress={() => {
                    triggerHaptic('medium');
                    toggleRemedy(rem.id);
                  }}
                  style={({ pressed }) => [
                    styles.remedyTaskCard,
                    rem.completed && styles.remedyTaskCardDone,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  {/* Custom Checkbox */}
                  <View
                    style={[
                      styles.customCheckbox,
                      rem.completed && styles.customCheckboxChecked,
                    ]}
                  >
                    <Text style={styles.customCheckboxIcon}>
                      {rem.completed ? '✓' : ''}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.remedyTaskTitle,
                        rem.completed && styles.remedyTaskTitleDone,
                      ]}
                    >
                      {rem.title}
                    </Text>
                    <View style={styles.remedyMetaRow}>
                      <Text style={styles.remedyTimingText}>🕒 {rem.timing}</Text>
                      <View style={styles.remedyStreakPill}>
                        <Text style={styles.remedyStreakText}>🔥 {rem.streak}d streak</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => {
                      triggerHaptic('light');
                      deleteRemedy(rem.id);
                    }}
                    hitSlop={12}
                    style={styles.deleteRemedyBtn}
                  >
                    <Text style={styles.deleteRemedyIcon}>✕</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ── Prize Celebration Modal ── */}
        <Modal visible={Boolean(spinPrizeModal)} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.celebrationCard}>
              <LinearGradient
                colors={['#1E1B4B', '#0F172A']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 56, textAlign: 'center', marginVertical: 4 }}>🎉</Text>
              <Text style={styles.celebrationTitle}>Cosmic Grace Bestowed!</Text>
              <Text style={styles.celebrationSubtitle}>
                The Navagraha Chakra has granted your fortune:
              </Text>
              <View style={styles.celebrationPrizePill}>
                <Text style={styles.celebrationPrizeText}>{spinPrizeModal}</Text>
              </View>
              <Text style={styles.celebrationNote}>
                Prize credited to your wallet & profile vault instantly.
              </Text>
              <Pressable
                onPress={() => {
                  triggerHaptic('medium');
                  setSpinPrizeModal(null);
                }}
                style={styles.celebrationCloseBtn}
              >
                <LinearGradient
                  colors={[colors.saffron, colors.gold]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.celebrationCloseBtnText}>Namaste 🙏 Collect</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* ── Add Sadhana / Remedy Modal ── */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.addRemedyCard}>
              <Text style={styles.addRemedyTitle}>+ Prescribe New Sadhana</Text>
              <Text style={styles.addRemedySub}>
                Add daily mantras, astrological routines, or prescribed Lal Kitab remedies.
              </Text>

              <TextInput
                value={newRemTitle}
                onChangeText={setNewRemTitle}
                placeholder="e.g. Chant Maha Mrityunjaya Mantra (108x)"
                placeholderTextColor={colors.textFaint}
                style={styles.addTextInput}
              />
              <TextInput
                value={newRemTiming}
                onChangeText={setNewRemTiming}
                placeholder="Timing (e.g. Sunrise / Thursday Evening)"
                placeholderTextColor={colors.textFaint}
                style={styles.addTextInput}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Pressable
                  onPress={() => setShowAddModal(false)}
                  style={styles.cancelActionBtn}
                >
                  <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!newRemTitle.trim()) return;
                    triggerHaptic('medium');
                    addRemedy(newRemTitle.trim(), newRemCategory, newRemTiming.trim());
                    setNewRemTitle('');
                    setShowAddModal(false);
                  }}
                  style={styles.saveActionBtn}
                >
                  <LinearGradient
                    colors={[colors.teal, '#047857']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>Save Sadhana</Text>
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
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  navBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navBackIcon: { fontSize: 24, color: '#0F172A', fontWeight: '800', marginTop: -2 },
  navTitle: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  navSubtitle: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  coinsHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 5,
  },
  coinsHeaderText: { ...typography.tiny, fontWeight: '900', color: '#B45309', fontSize: 12 },

  scrollContainer: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 50,
  },

  /* Hero Streak Card */
  heroStreakCard: {
    borderRadius: 24,
    padding: spacing.md + 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  glowOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  streakHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  streakEyebrow: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 1.2,
  },
  streakStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  streakStatusText: { fontSize: 9.5, color: '#FFFFFF', fontWeight: '800' },
  streakMainTitle: {
    ...typography.h2,
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  streakDescription: {
    ...typography.tiny,
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  milestoneTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  trackLineBg: {
    position: 'absolute',
    top: 28,
    left: 15,
    right: 15,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dayNodeWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  dayNodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayNodePassed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  dayNodeCurrent: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#F59E0B',
  },
  dayNodeJackpot: {
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: '#EC4899',
  },
  dayNodeText: { fontSize: 10, color: '#94A3B8', fontWeight: '800' },
  dayNodeLabel: { fontSize: 9.5, color: '#CBD5E1', fontWeight: '700' },

  claimStreakBtn: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 16,
  },
  claimStreakBtnDone: { opacity: 0.75 },
  claimStreakBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13 },

  /* Generic Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: { ...typography.h3, fontSize: 15, fontWeight: '900', color: '#0F172A' },
  sectionSubHeading: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  freeTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  freeTagUsed: { backgroundColor: '#F1F5F9' },
  freeTagText: { fontSize: 10, fontWeight: '900', color: '#059669' },

  /* Wheel Styles */
  wheelOuterFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  wheelGoldRing: {
    padding: 6,
    borderRadius: 140,
    backgroundColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  wheelDisc: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  wedgeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  wedgeContent: {
    alignItems: 'center',
    marginTop: 14,
  },
  wedgeLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
  centerOmHub: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  omText: { fontSize: 20 },
  wheelArrowPointer: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
  },
  spinActionBtn: {
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 8,
  },
  spinActionBtnDisabled: { opacity: 0.65 },
  spinActionBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 13.5 },

  /* Tarot 3D Card */
  tapToRevealPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tapToRevealText: { fontSize: 10, fontWeight: '800', color: '#7C3AED' },
  tarotFlipArea: {
    height: 310,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotCardSide: {
    position: 'absolute',
    width: width - 56,
    height: 300,
    borderRadius: 20,
    padding: spacing.md,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  tarotCardBackStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotFiligreeBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tarotBackTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 2,
  },
  tarotBackMantra: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  tarotTapPrompt: {
    marginTop: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tarotTapPromptText: { fontSize: 11, fontWeight: '800', color: '#F59E0B' },

  tarotCardFrontStyle: {
    padding: spacing.md,
  },
  tarotFrontHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarotCardTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FDE68A',
  },
  tarotCardSubText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 1,
  },
  tarotKeywordBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginVertical: 6,
  },
  tarotKeywordText: { fontSize: 11, fontWeight: '800', color: '#F59E0B' },
  tarotMeaningText: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  tarotAffirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
  },
  tarotAffirmationHeader: { fontSize: 10, fontWeight: '800', color: '#FDE68A' },
  tarotAffirmationQuote: {
    fontSize: 11,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  tarotIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  indicatorPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  indicatorLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '700' },
  indicatorValue: { fontSize: 10, color: '#FFFFFF', fontWeight: '800', marginTop: 1 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },

  /* Sadhana Habit Section */
  addRemedyHeaderBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  addRemedyHeaderBtnText: { color: colors.teal, fontSize: 11.5, fontWeight: '900' },

  categoryFilterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 4,
  },
  categoryFilterPillActive: {
    backgroundColor: '#0F172A',
  },
  categoryFilterIcon: { fontSize: 12 },
  categoryFilterText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  categoryFilterTextActive: { color: '#FFFFFF' },

  remedyTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  remedyTaskCardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  customCheckboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  customCheckboxIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  remedyTaskTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  remedyTaskTitleDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  remedyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  remedyTimingText: { fontSize: 10.5, color: colors.textMuted, fontWeight: '600' },
  remedyStreakPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  remedyStreakText: { fontSize: 9.5, fontWeight: '800', color: '#B45309' },
  deleteRemedyBtn: { padding: 4 },
  deleteRemedyIcon: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },

  /* Modal Backdrop & Cards */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  celebrationTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 4,
  },
  celebrationPrizePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  celebrationPrizeText: { fontSize: 17, fontWeight: '900', color: '#B45309' },
  celebrationNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 18,
  },
  celebrationCloseBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radius.pill,
    alignItems: 'center',
    overflow: 'hidden',
  },
  celebrationCloseBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },

  addRemedyCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
  },
  addRemedyTitle: { ...typography.h3, fontSize: 17, fontWeight: '900', color: '#0F172A' },
  addRemedySub: { fontSize: 11.5, color: colors.textMuted, marginVertical: 6, lineHeight: 16 },
  addTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 8,
  },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
  },
  saveActionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});