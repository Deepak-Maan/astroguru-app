import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
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
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing, typography } from '../src/theme';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useWalletStore } from '../src/store/walletStore';
import { useSubscriptionStore } from '../src/store/subscriptionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(330, SCREEN_WIDTH - 48);

interface WheelSegment {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  accent: string;
  type: 'cash' | 'discount' | 'vip' | 'voucher' | 'coins' | 'chat';
  value: number;
}

const SEGMENTS: WheelSegment[] = [
  { id: '1', label: '₹10 Cash', sub: 'Real Wallet Credit', icon: '🪙', color: '#FEF3C7', accent: '#D97706', type: 'cash', value: 10 },
  { id: '2', label: '50% OFF', sub: 'On 1st Voice Call', icon: '🎁', color: '#FEE2E2', accent: '#DC2626', type: 'discount', value: 50 },
  { id: '3', label: 'VIP Pass', sub: '24h VIP Access', icon: '👑', color: '#FEF9C3', accent: '#CA8A04', type: 'vip', value: 1 },
  { id: '4', label: '₹100 Store', sub: 'Gemstone Voucher', icon: '💎', color: '#F3E8FF', accent: '#9333EA', type: 'voucher', value: 100 },
  { id: '5', label: '50 Coins', sub: 'Karma Points', icon: '🪔', color: '#ECFDF5', accent: '#059669', type: 'coins', value: 50 },
  { id: '6', label: 'Free 3-Min', sub: 'Instant Chat Trial', icon: '🔮', color: '#E0F2FE', accent: '#0284C7', type: 'chat', value: 3 },
  { id: '7', label: '₹20 Cash', sub: 'Mega Jackpot Cash', icon: '💰', color: '#FFFBEB', accent: '#B45309', type: 'cash', value: 20 },
  { id: '8', label: '2x Karma', sub: 'Daily Multiplier', icon: '🌟', color: '#FDF2F8', accent: '#DB2777', type: 'coins', value: 100 },
];

export default function FortuneWheelScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const topup = useWalletStore((s) => s.topup);
  const subscribe = useSubscriptionStore((s) => s.subscribe);

  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);
  const [canSpinFree, setCanSpinFree] = useState(true);
  const [streakCount, setStreakCount] = useState(3);
  const [countdown, setCountdown] = useState('18h 42m 10s');

  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotationRef = useRef(0);

  useEffect(() => {
    checkDailyCooldown();
  }, []);

  const checkDailyCooldown = async () => {
    try {
      const last = await AsyncStorage.getItem('last_fortune_spin_time');
      if (last) {
        const lastTime = parseInt(last, 10);
        const diffHours = (Date.now() - lastTime) / (1000 * 60 * 60);
        if (diffHours < 24) {
          setCanSpinFree(false);
        }
      }
    } catch (_) {}
  };

  const handleSpin = () => {
    if (spinning) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (_) {}

    setSpinning(true);
    setWonPrize(null);

    // Pick random winning index (0 to 7)
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length; // 45 deg
    const targetSegmentOffset = 360 - (winningIndex * segmentAngle + segmentAngle / 2);

    // 5 full rotations + target angle
    const totalExtraDegrees = 360 * 6 + targetSegmentOffset;
    const finalDegree = currentRotationRef.current + totalExtraDegrees;

    Animated.timing(spinAnim, {
      toValue: finalDegree,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      currentRotationRef.current = finalDegree % 360;
      setSpinning(false);
      const prize = SEGMENTS[winningIndex];
      setWonPrize(prize);

      // Save spin timestamp
      await AsyncStorage.setItem('last_fortune_spin_time', Date.now().toString());
      setCanSpinFree(false);

      // Auto-Credit Rewards
      if (prize.type === 'cash') {
        topup(prize.value, `Cosmic Wheel Reward (${prize.label})`);
      } else if (prize.type === 'vip') {
        subscribe('monthly');
      }

      try {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (_) {}
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Cosmic Fortune Wheel" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header Motivation Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#78350F', '#B45309', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streakCount}-DAY SPIN STREAK</Text>
            </View>
            <Text style={styles.heroTitle}>Daily Divine Lucky Spin</Text>
            <Text style={styles.heroSub}>
              Spin the Vedic wheel every morning to claim real wallet cash, free calls & VIP passes!
            </Text>
          </View>

          {/* Wheel Stage Area */}
          <View style={styles.wheelStage}>
            {/* Top Indicator Arrow */}
            <View style={styles.pointerContainer}>
              <View style={styles.pointerArrow} />
              <View style={styles.pointerGem} />
            </View>

            {/* Rotating 3D Wheel Body */}
            <View style={[styles.wheelOuterRing, { width: WHEEL_SIZE + 24, height: WHEEL_SIZE + 24, borderRadius: (WHEEL_SIZE + 24) / 2 }]}>
              <LinearGradient
                colors={['#D4AF37', '#F5D77F', '#B8902A', '#F5D77F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <Animated.View
                style={[
                  styles.wheelCircle,
                  {
                    width: WHEEL_SIZE,
                    height: WHEEL_SIZE,
                    borderRadius: WHEEL_SIZE / 2,
                    transform: [{ rotate: spinInterpolate }],
                  },
                ]}
              >
                {/* 8 Rendered Segments */}
                {SEGMENTS.map((seg, idx) => {
                  const angle = idx * 45;
                  return (
                    <View
                      key={seg.id}
                      style={[
                        styles.segmentSlice,
                        {
                          transform: [{ rotate: `${angle}deg` }],
                        },
                      ]}
                    >
                      <View style={[styles.segmentLabelWrap, { backgroundColor: seg.color }]}>
                        <Text style={{ fontSize: 18 }}>{seg.icon}</Text>
                        <Text style={[styles.segmentLabelText, { color: seg.accent }]}>
                          {seg.label}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Animated.View>

              {/* Center Golden Knob Button */}
              <Pressable
                onPress={handleSpin}
                disabled={spinning}
                style={({ pressed }) => [
                  styles.centerKnob,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <LinearGradient
                  colors={['#FFC107', '#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.centerKnobIcon}>🎡</Text>
                <Text style={styles.centerKnobText}>
                  {spinning ? 'SPINNING…' : 'SPIN'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action CTA Button & Status */}
          <View style={styles.ctaBox}>
            <Pressable
              onPress={handleSpin}
              disabled={spinning}
              style={({ pressed }) => [
                styles.spinButton,
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={['#D4AF37', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.spinButtonText}>
                {spinning
                  ? '🌀 Aligning Your Stars…'
                  : canSpinFree
                  ? '✨ SPIN FREE TODAY'
                  : '🪙 Spin Again (50 Karma Coins)'}
              </Text>
            </Pressable>

            {!canSpinFree && (
              <View style={styles.cooldownBadge}>
                <Text style={styles.cooldownText}>
                  ⏳ Next Free Daily Spin in: <Text style={{ color: '#D97706', fontWeight: '900' }}>{countdown}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Rewards Legend Table */}
          <View style={styles.rewardsLegend}>
            <Text style={styles.legendTitle}>🏆 Available Daily Rewards</Text>
            <View style={styles.legendGrid}>
              {SEGMENTS.map((seg) => (
                <View key={seg.id} style={styles.legendCard}>
                  <Text style={{ fontSize: 22 }}>{seg.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legendCardTitle}>{seg.label}</Text>
                    <Text style={styles.legendCardSub}>{seg.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Win Celebration Modal */}
        <Modal visible={!!wonPrize} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={styles.winCard}>
              <LinearGradient
                colors={['#FFFDF5', '#FFFBEB']}
                style={StyleSheet.absoluteFill}
              />

              <Text style={{ fontSize: 48, marginTop: -20 }}>🎉</Text>
              <Text style={styles.winTitle}>Jai Ho! You Won!</Text>
              <Text style={styles.winSubtitle}>Your stars have blessed you with:</Text>

              {wonPrize && (
                <View style={[styles.prizeBadge, { borderColor: wonPrize.accent, backgroundColor: wonPrize.color }]}>
                  <Text style={{ fontSize: 36 }}>{wonPrize.icon}</Text>
                  <Text style={[styles.prizeLabel, { color: wonPrize.accent }]}>{wonPrize.label}</Text>
                  <Text style={styles.prizeSub}>{wonPrize.sub}</Text>
                </View>
              )}

              <Text style={styles.autoCreditNotice}>
                ✅ Reward automatically credited to your account!
              </Text>

              {/* Action Buttons: Consult Now / Close */}
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => {
                    setWonPrize(null);
                    router.push('/(tabs)/consult');
                  }}
                  style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.88 }]}
                >
                  <LinearGradient
                    colors={['#FFC107', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.consultBtnText}>💬 Consult Astrologer Now ➔</Text>
                </Pressable>

                <Pressable
                  onPress={() => setWonPrize(null)}
                  style={({ pressed }) => [styles.closeModalBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.closeModalText}>Done / Collect</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    paddingBottom: 40,
  },
  heroCard: {
    margin: 16,
    borderRadius: 22,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 12,
    color: '#FEF3C7',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 16,
  },
  wheelStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -12,
    zIndex: 10,
    alignItems: 'center',
  },
  pointerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pointerGem: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC107',
    marginTop: -22,
  },
  wheelOuterRing: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  wheelCircle: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  segmentSlice: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  segmentLabelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    width: 68,
  },
  segmentLabelText: {
    fontSize: 9.5,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },
  centerKnob: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  centerKnobIcon: {
    fontSize: 18,
  },
  centerKnobText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 1,
  },
  ctaBox: {
    paddingHorizontal: 20,
    gap: 8,
  },
  spinButton: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  spinButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  cooldownBadge: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cooldownText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  rewardsLegend: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  legendCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  legendCardSub: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  winCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  winTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
  },
  winSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  prizeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    marginVertical: 16,
    width: '100%',
  },
  prizeLabel: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  prizeSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  autoCreditNotice: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '800',
    marginBottom: 16,
  },
  modalActions: {
    width: '100%',
    gap: 8,
  },
  consultBtn: {
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  consultBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  closeModalBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
});
