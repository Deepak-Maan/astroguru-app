import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useRewardsStore } from '../src/store/rewardsStore';
import { useWalletStore } from '../src/store/walletStore';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width - 72, 260);
const RADIUS = (WHEEL_SIZE - 20) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface MantraItem {
  id: string;
  name: string;
  sanskrit: string;
  transliteration: string;
  benefit: string;
  deity: string;
  idealTime: string;
  categoryIcon: string;
  chakra: string;
}

const MANTRAS_LIST: MantraItem[] = [
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    transliteration: 'Om Bhur Bhuvah Swah, Tat Savitur Varenyam, Bhargo Devasya Dheemahi, Dhiyo Yo Nah Prachodayat',
    benefit: 'Illuminates intellect, grants spiritual wisdom, sharpens focus & bestows inner peace',
    deity: 'Goddess Gayatri / Surya Dev',
    idealTime: 'Brahma Muhurta (Sunrise)',
    categoryIcon: '☀️',
    chakra: 'Ajna & Sahasrara (Crown)',
  },
  {
    id: 'mahamrityunjaya',
    name: 'Maha Mrityunjaya',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    benefit: 'Grants longevity, physical vitality, supreme health & shields from negative energy',
    deity: 'Bhagwan Shiva (Rudra)',
    idealTime: 'Morning or Pradosha Twilight',
    categoryIcon: '🔱',
    chakra: 'Anahata (Heart)',
  },
  {
    id: 'shiva',
    name: 'Om Namah Shivaya',
    sanskrit: 'ॐ नमः शिवाय',
    transliteration: 'Om Namah Shivaya',
    benefit: 'Purifies the 5 physical elements, dissolves anxiety, calms thought storms & elevates consciousness',
    deity: 'Lord Shiva (Mahadev)',
    idealTime: 'Anytime with clean mind',
    categoryIcon: '🕉️',
    chakra: 'Vishuddha (Throat)',
  },
  {
    id: 'krishna',
    name: 'Hare Krishna Mahamantra',
    sanskrit: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    transliteration: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare, Hare Rama Hare Rama Rama Rama Hare Hare',
    benefit: 'Awakens boundless divine love, clears deep karmic blockages & fills soul with bliss',
    deity: 'Lord Krishna & Sri Radha',
    idealTime: 'Brahma Muhurta & Sandhya',
    categoryIcon: '🪷',
    chakra: 'Anahata & Hridaya',
  },
  {
    id: 'ganesh',
    name: 'Ganesh Beej Mantra',
    sanskrit: 'ॐ गं गणपतये नमः॥',
    transliteration: 'Om Gam Ganapataye Namaha',
    benefit: 'Removes all obstacles (Vighna), blesses new beginnings, business & exams with victory',
    deity: 'Lord Ganesha (Vighnaharta)',
    idealTime: 'Wednesday mornings',
    categoryIcon: '🐘',
    chakra: 'Muladhara (Root)',
  },
  {
    id: 'lakshmi',
    name: 'Mahalakshmi Mantra',
    sanskrit: 'ॐ श्रीं ह्रीं क्लीं त्रिभुवन महालक्ष्म्यै अस्मांक दारिद्र्य नाशय प्रचुर धन देहि देहि क्लीं ह्रीं श्रीं ॐ॥',
    transliteration: 'Om Shreem Hreem Kleem Tribhuvana Mahalakshmyai Asmank Daridrya Nashaya Prachur Dhana Dehi Dehi',
    benefit: 'Attracts financial prosperity, removes debt & brings auspicious family harmony',
    deity: 'Goddess Mahalakshmi',
    idealTime: 'Friday evenings',
    categoryIcon: '💰',
    chakra: 'Manipura (Solar Plexus)',
  },
];

type MalaType = 'rudraksha' | 'tulsi' | 'sphatik' | 'kamalgatta';

const MALA_TYPES: Array<{ id: MalaType; label: string; icon: string; bg: string; grad: [string, string] }> = [
  { id: 'rudraksha', label: 'Rudraksha', icon: '🟤', bg: '#78350F', grad: ['#92400E', '#451A03'] },
  { id: 'tulsi', label: 'Tulsi Wood', icon: '🌿', bg: '#D97706', grad: ['#F59E0B', '#B45309'] },
  { id: 'sphatik', label: 'Sphatik Quartz', icon: '⚪', bg: '#0284C7', grad: ['#38BDF8', '#0369A1'] },
  { id: 'kamalgatta', label: 'Lotus Seed', icon: '🪷', bg: '#BE185D', grad: ['#F43F5E', '#9F1239'] },
];

export default function JapaMalaScreen() {
  const router = useRouter();
  const { streakCount, addCoins } = useRewardsStore();

  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS_LIST[0]);
  const [malaType, setMalaType] = useState<MalaType>('rudraksha');
  const [beadCount, setBeadCount] = useState(0); // 0 to 108
  const [completedMalas, setCompletedMalas] = useState(0);
  const [totalChants, setTotalChants] = useState(0);
  const [targetMalas, setTargetMalas] = useState(1);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [celebrated, setCelebrated] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: beadCount / 108,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [beadCount]);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success') => {
    if (!hapticEnabled || Platform.OS === 'web') return;
    try {
      if (style === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (style === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
  };

  const handleBeadTap = () => {
    // Tactile button bounce & ripple animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.94, duration: 60, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();

    rippleAnim.setValue(0.8);
    rippleOpacity.setValue(0.6);
    Animated.parallel([
      Animated.timing(rippleAnim, { toValue: 1.4, duration: 400, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    const nextCount = beadCount + 1;
    const nextTotal = totalChants + 1;
    setTotalChants(nextTotal);

    if (nextCount >= 108) {
      // 108 Beads Complete!
      setBeadCount(0);
      setCompletedMalas((prev) => prev + 1);
      setCelebrated(true);
      triggerHaptic('success');
      addCoins(10); // Reward Astro-Coins for completing a full sacred Mala

      setTimeout(() => setCelebrated(false), 5000);
    } else {
      setBeadCount(nextCount);
      // Checkpoints: 27th, 54th, 81st bead (1/4th, 1/2, 3/4th Mala)
      if (nextCount % 27 === 0) {
        triggerHaptic('medium');
      } else {
        triggerHaptic('light');
      }
    }
  };

  const resetCounter = () => {
    triggerHaptic('medium');
    setBeadCount(0);
  };

  const activeMalaStyle = MALA_TYPES.find((m) => m.id === malaType) || MALA_TYPES[0];
  const strokeDashoffset = CIRCUMFERENCE - (beadCount / 108) * CIRCUMFERENCE;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Screen Header */}
        <ScreenHeader
          title="Digital 108 Japa Mala"
          subtitle="Sacred Vedic Chanting & Meditation"
          showBack
          showWallet
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Completion Celebration Overlay */}
          {celebrated && (
            <View style={styles.celebrationBanner}>
              <LinearGradient
                colors={['#ECFDF5', '#D1FAE5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 32 }}>🪷 📿 🎉</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.celebrationTitle}>Haraye Namah! 108 Beads Completed!</Text>
                <Text style={styles.celebrationSub}>
                  1 Full Sacred Mala logged · +10 Astro-Coins added to your Karma Vault
                </Text>
              </View>
            </View>
          )}

          {/* ── Section 1: Sacred Mantra Selector ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconRing}>
                <Text style={{ fontSize: 16 }}>📿</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Select Sacred Mantra</Text>
                <Text style={styles.sectionSub}>Choose your daily Vedic deity & frequency</Text>
              </View>
            </View>

            {/* Horizontal Mantra Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mantraScroll}
              style={{ flexGrow: 0 }}
            >
              {MANTRAS_LIST.map((m) => {
                const isSelected = selectedMantra.id === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      triggerHaptic('light');
                      setSelectedMantra(m);
                      setBeadCount(0);
                    }}
                    style={[styles.mantraPill, isSelected && styles.mantraPillActive]}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['#D97706', '#E67E22']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={{ fontSize: 13 }}>{m.categoryIcon}</Text>
                    <Text style={[styles.mantraPillText, isSelected && styles.mantraPillTextActive]}>
                      {m.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Sacred Sanskrit Shloka Box */}
            <View style={styles.sanskritCard}>
              <View style={styles.sanskritTopBadge}>
                <Text style={styles.sanskritTopBadgeText}>DEITY: {selectedMantra.deity.toUpperCase()}</Text>
                <Text style={styles.idealTimeText}>⏰ {selectedMantra.idealTime}</Text>
              </View>

              <Text style={styles.sanskritVerse}>{selectedMantra.sanskrit}</Text>
              <Text style={styles.translitText}>{selectedMantra.transliteration}</Text>

              <View style={styles.sanskritDivider} />

              <View style={styles.benefitRow}>
                <Text style={{ fontSize: 13 }}>✨</Text>
                <Text style={styles.benefitText}>{selectedMantra.benefit}</Text>
              </View>
            </View>
          </View>

          {/* ── Section 2: Authentic 108 Mala Wheel Counter ── */}
          <View style={styles.malaCounterCard}>
            {/* Mala Material Selector */}
            <View style={styles.malaMaterialRow}>
              {MALA_TYPES.map((type) => {
                const active = malaType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => {
                      triggerHaptic('light');
                      setMalaType(type.id);
                    }}
                    style={[styles.materialChip, active && styles.materialChipActive]}
                  >
                    <Text style={{ fontSize: 12 }}>{type.icon}</Text>
                    <Text style={[styles.materialChipText, active && styles.materialChipTextActive]}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sacred Interactive Circular Japa Bead */}
            <View style={styles.wheelWrapper}>
              {/* Expanding Pulse Aura */}
              <Animated.View
                style={[
                  styles.rippleOrb,
                  {
                    transform: [{ scale: rippleAnim }],
                    opacity: rippleOpacity,
                    backgroundColor: activeMalaStyle.bg,
                  },
                ]}
              />

              {/* Circular SVG Progress Ring */}
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={styles.svgRing}>
                <Defs>
                  <SvgGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0%" stopColor="#F59E0B" />
                    <Stop offset="50%" stopColor="#D97706" />
                    <Stop offset="100%" stopColor="#B45309" />
                  </SvgGradient>
                </Defs>

                {/* Track Circle */}
                <Circle
                  cx={WHEEL_SIZE / 2}
                  cy={WHEEL_SIZE / 2}
                  r={RADIUS}
                  stroke="rgba(226, 232, 240, 0.8)"
                  strokeWidth={8}
                  fill="none"
                />

                {/* Animated Progress Circle */}
                <Circle
                  cx={WHEEL_SIZE / 2}
                  cy={WHEEL_SIZE / 2}
                  r={RADIUS}
                  stroke="url(#goldGrad)"
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${WHEEL_SIZE / 2} ${WHEEL_SIZE / 2})`}
                />
              </Svg>

              {/* Central Tactile Bead Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  onPress={handleBeadTap}
                  accessibilityRole="button"
                  accessibilityLabel="Chant one bead"
                  style={styles.centerBeadButton}
                >
                  <LinearGradient
                    colors={activeMalaStyle.grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  {/* Bead Highlights */}
                  <View style={styles.beadHighlightRing} />

                  <Text style={styles.beadCountText}>{beadCount}</Text>
                  <Text style={styles.beadOutOfText}>/ 108 BEADS</Text>
                  <View style={styles.tapPill}>
                    <Text style={styles.tapPillText}>TAP TO CHANT</Text>
                  </View>
                </Pressable>
              </Animated.View>
            </View>

            {/* Japa Feedback Toggles (Haptic & Sound) */}
            <View style={styles.toggleBar}>
              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setHapticEnabled(!hapticEnabled);
                }}
                style={[styles.toggleBtn, hapticEnabled && styles.toggleBtnActive]}
              >
                <Text style={styles.toggleBtnText}>
                  {hapticEnabled ? '📳 Haptics: ON' : '📴 Haptics: OFF'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setSoundEnabled(!soundEnabled);
                }}
                style={[styles.toggleBtn, soundEnabled && styles.toggleBtnActive]}
              >
                <Text style={styles.toggleBtnText}>
                  {soundEnabled ? '🔔 Temple Bell: ON' : '🔕 Muted'}
                </Text>
              </Pressable>
            </View>

            {/* Mala Statistics Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{completedMalas}</Text>
                <Text style={styles.statLabel}>Completed Malas</Text>
                <Text style={styles.statSub}>
                  {completedMalas >= targetMalas ? '🎉 Goal Achieved' : `${targetMalas - completedMalas} left to goal`}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#D97706' }]}>{totalChants}</Text>
                <Text style={styles.statLabel}>Total Beads Today</Text>
                <Text style={styles.statSub}>+{(completedMalas * 108) + beadCount} lifetime</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statVal, { color: '#7C3AED' }]}>{streakCount}D</Text>
                <Text style={styles.statLabel}>Japa Sadhana</Text>
                <Text style={styles.statSub}>Active Streak 🔥</Text>
              </View>
            </View>

            {/* Target Mala Selector Chips */}
            <View style={styles.targetSection}>
              <Text style={styles.targetSectionLabel}>Daily Sankalpa (Target):</Text>
              <View style={styles.targetChipsRow}>
                {[1, 3, 11, 21].map((cnt) => (
                  <Pressable
                    key={cnt}
                    onPress={() => {
                      triggerHaptic('light');
                      setTargetMalas(cnt);
                    }}
                    style={[styles.targetChip, targetMalas === cnt && styles.targetChipActive]}
                  >
                    <Text style={[styles.targetChipText, targetMalas === cnt && styles.targetChipTextActive]}>
                      {cnt} Mala ({cnt * 108})
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Reset Bead Counter Button */}
            <Pressable
              onPress={resetCounter}
              style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.resetBtnText}>🔄 Reset Current Bead Counter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: 40,
    gap: 14,
  },

  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  celebrationTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#065F46',
  },
  celebrationSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    marginTop: 2,
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconRing: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Mantra Scroll */
  mantraScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  mantraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mantraPillActive: {
    borderColor: '#D97706',
  },
  mantraPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
  },
  mantraPillTextActive: {
    color: '#FFFFFF',
  },

  /* Sanskrit Shloka Box */
  sanskritCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  sanskritTopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sanskritTopBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  idealTimeText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '700',
  },
  sanskritVerse: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: 0.3,
  },
  translitText: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  sanskritDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },

  /* Mala Counter Card */
  malaCounterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 4,
    alignItems: 'center',
    gap: 14,
  },

  /* Material Selector */
  malaMaterialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    width: '100%',
  },
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  materialChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  materialChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  materialChipTextActive: {
    color: '#B45309',
    fontWeight: '800',
  },

  /* Wheel Area */
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  rippleOrb: {
    position: 'absolute',
    width: WHEEL_SIZE - 40,
    height: WHEEL_SIZE - 40,
    borderRadius: (WHEEL_SIZE - 40) / 2,
  },
  svgRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerBeadButton: {
    width: WHEEL_SIZE - 50,
    height: WHEEL_SIZE - 50,
    borderRadius: (WHEEL_SIZE - 50) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    gap: 2,
  },
  beadHighlightRing: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  beadCountText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  beadOutOfText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },
  tapPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  tapPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },

  /* Toggle Bar */
  toggleBar: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.pill,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  statSub: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Target Section */
  targetSection: {
    width: '100%',
    gap: 6,
    paddingTop: 4,
  },
  targetSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  targetChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  targetChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  targetChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  targetChipTextActive: {
    color: '#B45309',
    fontWeight: '900',
  },

  /* Reset Button */
  resetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  resetBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
  },
});
