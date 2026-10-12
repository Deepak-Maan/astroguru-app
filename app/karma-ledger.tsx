import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { colors, radius, spacing, typography } from '../src/theme';
import { useKarmaStore } from '../src/store/karmaStore';
import { useWalletStore } from '../src/store/walletStore';

const MANTRAS = [
  { name: 'Gayatri Mantra', deity: 'Surya / Savitr', purpose: 'Intellectual Clarity & Solar Vitality' },
  { name: 'Mahamrityunjaya', deity: 'Lord Shiva', purpose: 'Healing, Longevity & Fear Dissolution' },
  { name: 'Om Sham Shanaishcharaya', deity: 'Lord Shani', purpose: 'Relief from Sade Sati & Karmic Obstacles' },
  { name: 'Om Gam Ganapataye', deity: 'Lord Ganesha', purpose: 'Removal of All Obstacles in New Ventures' },
];

export default function KarmaLedgerScreen() {
  const router = useRouter();

  const {
    karmaScore,
    currentStreak,
    bestStreak,
    japaCount,
    unlockedBadges,
    remedies,
    completeRemedy,
    incrementJapa,
    resetJapa,
    checkAndUpdateStreak,
    claimMilestoneReward,
  } = useKarmaStore();

  const topupWallet = useWalletStore((s) => s.topup);

  const [selectedMantra, setSelectedMantra] = useState(MANTRAS[0]);
  const [beadTapEffect, setBeadTapEffect] = useState(false);

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  const handleBeadTap = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    setBeadTapEffect(true);
    setTimeout(() => setBeadTapEffect(false), 120);
    incrementJapa();
  };

  const handleClaimMilestone = (days: number) => {
    const res = claimMilestoneReward(days);
    if (res.rewardGranted) {
      topupWallet(50, `21-Day Karma Milestone Bonus`);
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }
      Alert.alert('🎉 Reward Claimed!', res.message);
    } else {
      Alert.alert('Milestone Locked', res.message);
    }
  };

  const completedCount = remedies.filter((r) => r.completed).length;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="📿 Karma Ledger & Upaya Streak" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top Score & Streak Banner */}
          <Card padded style={styles.topCard}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.25)', 'rgba(129, 140, 248, 0.15)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Karma Score Circle */}
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{karmaScore}</Text>
                <Text style={styles.scoreSub}>KARMA SCORE</Text>
              </View>

              {/* Streak Info */}
              <View style={{ flex: 1, paddingLeft: 18, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 24 }}>🔥</Text>
                  <Text style={styles.streakCount}>{currentStreak} Day Streak</Text>
                </View>
                <Text style={styles.streakSub}>Best Record: {bestStreak} Days</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${Math.min(100, (currentStreak / 21) * 100)}%` }]} />
                </View>
                <Text style={styles.progressNote}>{21 - (currentStreak % 21)} days left to next Golden Reward</Text>
              </View>
            </View>
          </Card>

          {/* Today's Daily Upaya Checklist */}
          <Card padded style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeader
                title="🌟 Today's Vedic Upayas (Remedies)"
                subtitle="Small sacred actions to pacify challenging transits"
              />
              <Text style={styles.completedBadge}>
                {completedCount}/{remedies.length} Done
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {remedies.map((remedy) => (
                <Pressable
                  key={remedy.id}
                  onPress={() => {
                    if (!remedy.completed) {
                      if (Platform.OS !== 'web') {
                        try {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        } catch (_) {}
                      }
                      completeRemedy(remedy.id);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.remedyRow,
                    remedy.completed && styles.remedyRowCompleted,
                    pressed && !remedy.completed && { opacity: 0.8 },
                  ]}
                >
                  <View style={styles.checkbox}>
                    {remedy.completed ? (
                      <Text style={{ color: '#10B981', fontWeight: '900', fontSize: 14 }}>✓</Text>
                    ) : (
                      <Text style={{ fontSize: 16 }}>{remedy.planetGlyph}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.remedyTitle, remedy.completed && styles.remedyTextCrossed]}>
                      {remedy.title}
                    </Text>
                    <Text style={styles.remedyDesc}>{remedy.description}</Text>
                    <Text style={styles.remedyPlanet}>Ruled by: {remedy.planet}</Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{remedy.points}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Interactive Digital Japa Mala (108 Beads Counter) */}
          <Card padded style={styles.japaCard}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.15)', 'rgba(168, 85, 247, 0.1)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.japaHeading}>📿 Sacred Digital Japa Mala</Text>
                <Text style={styles.japaSub}>108 Beads Meditation Counter with Haptic Touch</Text>
              </View>
              <Pressable onPress={resetJapa} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </Pressable>
            </View>

            {/* Mantra Selector */}
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: 6 }}>
              {MANTRAS.map((m) => (
                <Chip
                  key={m.name}
                  label={m.name}
                  selected={selectedMantra.name === m.name}
                  onPress={() => setSelectedMantra(m)}
                  tone={selectedMantra.name === m.name ? 'gold' : 'default'}
                />
              ))}
            </View>

            <View style={styles.mantraBox}>
              <Text style={styles.mantraDeity}>Deity: {selectedMantra.deity}</Text>
              <Text style={styles.mantraPurpose}>{selectedMantra.purpose}</Text>
            </View>

            {/* Tap Bead Button */}
            <Pressable
              onPress={handleBeadTap}
              style={({ pressed }) => [
                styles.beadCircle,
                beadTapEffect && styles.beadCircleActive,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={styles.beadNumber}>{japaCount}</Text>
              <Text style={styles.beadTotal}>OF 108 BEADS</Text>
              <Text style={styles.beadHint}>TAP WITH THUMB</Text>
            </Pressable>
          </Card>

          {/* 21-Day Milestone Rewards */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="🏆 21-Day Karma Milestone Rewards"
              subtitle="Commit to sacred discipline to unlock protection shields"
            />

            <View style={{ gap: 10 }}>
              {[
                { days: 7, label: '🥉 7-Day Streak', reward: 'Bronze Karma Shield Badge', unlocked: currentStreak >= 7 },
                { days: 14, label: '🥈 14-Day Streak', reward: 'Silver Shield + 15% AstroMall Discount', unlocked: currentStreak >= 14 },
                { days: 21, label: '🥇 21-Day Mastery', reward: 'Golden Karma Master + ₹50 Wallet Bonus', unlocked: currentStreak >= 21 },
              ].map((tier) => (
                <View key={tier.days} style={styles.tierRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tierLabel}>{tier.label}</Text>
                    <Text style={styles.tierReward}>{tier.reward}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleClaimMilestone(tier.days)}
                    style={[styles.claimBtn, tier.unlocked && styles.claimBtnUnlocked]}
                  >
                    <Text style={[styles.claimBtnText, tier.unlocked && { color: '#0A0C16' }]}>
                      {tier.unlocked ? 'Claim Reward' : 'Locked 🔒'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </Card>

          {/* Unlocked Badges */}
          <Card padded style={{ gap: spacing.sm }}>
            <SectionHeader title="🛡️ Unlocked Spiritual Badges" subtitle="Active shields protecting your natal chart" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {unlockedBadges.map((badge) => (
                <View key={badge} style={styles.badgePill}>
                  <Text style={{ fontSize: 13 }}>✨</Text>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  topCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    overflow: 'hidden',
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 3,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 28, fontWeight: '900', color: '#FDE68A' },
  scoreSub: { fontSize: 8.5, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.6 },
  streakCount: { fontSize: 18, fontWeight: '900', color: '#EEF2FF' },
  streakSub: { fontSize: 11, color: '#A5B4FC', fontWeight: '600' },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#FCD34D', borderRadius: 3 },
  progressNote: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  completedBadge: { fontSize: 12, fontWeight: '800', color: '#34D399' },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  remedyRowCompleted: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.35)' },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 33, 64, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remedyTitle: { fontSize: 13.5, fontWeight: '700', color: '#EEF2FF' },
  remedyTextCrossed: { textDecorationLine: 'line-through', color: '#94A3B8' },
  remedyDesc: { fontSize: 11, color: '#CBD5E1', lineHeight: 15 },
  remedyPlanet: { fontSize: 10, color: '#FCD34D', fontWeight: '700', marginTop: 2 },
  pointsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pointsText: { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
  japaCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    gap: 8,
  },
  japaHeading: { fontSize: 16, fontWeight: '800', color: '#EEF2FF' },
  japaSub: { fontSize: 11, color: '#A5B4FC' },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)' },
  resetBtnText: { fontSize: 11, color: '#CBD5E1', fontWeight: '600' },
  mantraBox: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    padding: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    width: '100%',
  },
  mantraDeity: { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
  mantraPurpose: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  beadCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 3,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#FCD34D',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  beadCircleActive: { transform: [{ scale: 1.06 }], backgroundColor: 'rgba(245, 158, 11, 0.3)' },
  beadNumber: { fontSize: 42, fontWeight: '900', color: '#FDE68A' },
  beadTotal: { fontSize: 9, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.8 },
  beadHint: { fontSize: 8.5, color: '#94A3B8', marginTop: 2 },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  tierLabel: { fontSize: 13, fontWeight: '800', color: '#EEF2FF' },
  tierReward: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },
  claimBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  claimBtnUnlocked: { backgroundColor: '#FCD34D' },
  claimBtnText: { fontSize: 11.5, fontWeight: '800', color: '#94A3B8' },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 11.5, color: '#FDE68A', fontWeight: '700' },
});
