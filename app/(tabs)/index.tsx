/**
 * AstroGuru — Ultra-Premium Vedic Astrological Super App Home Experience
 * Rebuilt with Nordic Frost luxury aesthetics, glassmorphic sheen, live transit ribbons,
 * interactive 432Hz Vedic audio player, and comprehensive Jyotish widgets.
 */

import React, { useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { SectionHeader } from '../../src/components/SectionHeader';
import { AstrologerCard } from '../../src/components/AstrologerCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { RashiChakra } from '../../src/components/hero/RashiChakra';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { useLanguageStore } from '../../src/store/languageStore';
import { useRewardsStore } from '../../src/store/rewardsStore';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';
import { computeNumerologyDetails } from '../../src/services/numerologyPrediction';
import { JyotishiWorkstation } from '../../src/components/workstation/JyotishiWorkstation';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const t = useLanguageStore((s) => s.t);
  const { streakCount, astroCoins } = useRewardsStore();

  const [isPlayingMantra, setIsPlayingMantra] = useState(false);

  const signIndex = kundli?.moonRashiIndex ?? 0;
  const rashi = RASHIS[signIndex] || RASHIS[0];
  const reading = useMemo(() => getHoroscope(signIndex, 'daily'), [signIndex]);

  const featured = ASTROLOGERS.filter((a) => a.online).slice(0, 6);

  // Dynamic user name
  const displayName =
    authUser?.name ||
    profile?.name ||
    (authUser?.email ? authUser.email.split('@')[0] : 'Seeker');
  const firstName = displayName.split(' ')[0];

  const numerology = useMemo(
    () =>
      computeNumerologyDetails(
        profile?.date || '1995-08-15',
        displayName
      ),
    [profile?.date, displayName]
  );

  // If logging out or unauthenticated
  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // Astrologer Workstation view
  if (authUser?.role === 'astrologer') {
    return (
      <GradientBackground>
        <JyotishiWorkstation />
      </GradientBackground>
    );
  }

  const quickActions = [
    { icon: '🎡', label: 'Spin & Win', href: '/daily-rewards', bg: '#FEF3C7', border: '#FDE68A', badge: 'FREE' },
    { icon: '🪐', label: 'Kundli', href: '/(tabs)/kundli', bg: '#FFEDD5', border: '#FED7AA', badge: '10-Pg' },
    { icon: '🔮', label: '3D Tarot', href: '/daily-rewards', bg: '#F3E8FF', border: '#E9D5FF' },
    { icon: '📿', label: '108 Japa', href: '/japa', bg: '#DCFCE7', border: '#BBF7D0', badge: 'Mala' },
    { icon: '🔢', label: 'Numerology', href: '/numerology', bg: '#E0F2FE', border: '#BAE6FD' },
    { icon: '💎', label: 'Gemstones', href: '/gemstone-finder', bg: '#FCE7F3', border: '#FBCFE8' },
    { icon: '🏛️', label: 'Live Darshan', href: '/live-darshan', bg: '#FFF1F2', border: '#FFE4E6', badge: 'LIVE' },
    { icon: '💬', label: 'Instant Chat', href: '/instant-consult', bg: '#EEF2FF', border: '#E0E7FF' },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const toggleMantra = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    setIsPlayingMantra(!isPlayingMantra);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Screen Header */}
        <ScreenHeader
          title={`Namaste,\n${firstName} 🙏`}
          subtitle={today}
          showWallet
          showTicker
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Live Planetary Transit & Shubh Muhurta Ticker Ribbon */}
          <View style={styles.transitRibbon}>
            <LinearGradient
              colors={['#FFFBEB', '#F0FDF4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.livePulseDot} />
            <Text style={styles.transitText} numberOfLines={1}>
              <Text style={{ fontWeight: '900', color: '#D97706' }}>🪐 SHUBH MUHURTA:</Text> Abhijit Muhurta Active (11:45 AM - 12:30 PM) · Moon in {rashi.sanskrit}
            </Text>
          </View>

          {/* Daily Vedic Shloka Mantra Audio Player */}
          <Pressable
            onPress={toggleMantra}
            style={({ pressed }) => [styles.shlokaPill, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
          >
            <View style={styles.shlokaLeft}>
              <View style={styles.shlokaIconRing}>
                <Text style={styles.shlokaSoundIcon}>{isPlayingMantra ? '🔊' : '🕉️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.shlokaTitle}>Daily Vedic Shloka · 432Hz</Text>
                  {isPlayingMantra ? (
                    <View style={styles.playingBadge}>
                      <Text style={styles.playingBadgeText}>PLAYING ▂▃▅</Text>
                    </View>
                  ) : (
                    <View style={styles.tapToPlayBadge}>
                      <Text style={styles.tapToPlayBadgeText}>TAP TO LISTEN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.shlokaSub} numberOfLines={1}>
                  ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्
                </Text>
              </View>
            </View>
            <View style={[styles.shlokaPlayBtn, isPlayingMantra && styles.shlokaPauseBtn]}>
              <Text style={styles.shlokaPlayText}>{isPlayingMantra ? '❚❚ Pause' : '▶ Gayatri'}</Text>
            </View>
          </Pressable>

          {/* YOUR SKY AT BIRTH 3D/2D Celestial Hero Chakra */}
          <RashiChakra
            kundli={kundli}
            onPress={() => router.push(kundli ? '/(tabs)/kundli' : '/(onboarding)/birth-details')}
          />

          {/* Daily Cosmic Rewards & Navagraha Chakra Banner */}
          <Pressable
            onPress={() => router.push('/daily-rewards')}
            style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.rewardsBanner}>
              <LinearGradient
                colors={['#1E1B4B', '#2E1065', '#0F172A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.rewardsFlameBox}>
                <LinearGradient
                  colors={['#F59E0B', '#EA580C']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 24 }}>🔥</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.rewardsBannerTag}>COSMIC REWARDS</Text>
                  <View style={styles.rewardsStreakPill}>
                    <Text style={styles.rewardsStreakPillText}>{streakCount}D Streak</Text>
                  </View>
                  <View style={styles.rewardsCoinsHeaderPill}>
                    <Text style={{ fontSize: 10 }}>🪙</Text>
                    <Text style={styles.rewardsCoinsText}>{astroCoins}</Text>
                  </View>
                </View>
                <Text style={styles.rewardsBannerTitle}>Daily Rewards & Navagraha Spin 🎡</Text>
                <Text style={styles.rewardsBannerSub}>
                  Spin wheel for wallet cash · Draw 3D Tarot · Prescribe Sadhana
                </Text>
              </View>
              <View style={styles.rewardsActionBtn}>
                <LinearGradient
                  colors={[colors.saffron, colors.gold]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.rewardsActionText}>Play ›</Text>
              </View>
            </View>
          </Pressable>

          {/* Today's Reading Card */}
          <Pressable onPress={() => router.push('/(tabs)/horoscope')}>
            <View style={styles.todayCard}>
              <View style={styles.todayRule} />
              <View style={{ flex: 1, gap: 10 }}>
                <View style={styles.todayTop}>
                  <View style={styles.purpleIconBox}>
                    <Text style={{ fontSize: 16 }}>🔮</Text>
                  </View>
                  <Text style={styles.todayLabel}>
                    TODAY'S HOROSCOPE • {rashi.sanskrit.toUpperCase()}
                  </Text>
                  <View style={styles.moodBadge}>
                    <Text style={styles.todayMood}>{reading.mood}% Positive</Text>
                  </View>
                </View>

                <Text style={styles.todayText} numberOfLines={3}>
                  {reading.summary || "Venus softens the mood around you today. Trust your intuition in key financial and relationship decisions. Recovery multiplies tomorrow's output."}
                </Text>

                <View style={styles.todayFooter}>
                  <View style={styles.luckyPill}>
                    <Text style={styles.luckyPillText}>Lucky #{reading.luckyNumber}</Text>
                  </View>
                  <View style={styles.silverPill}>
                    <Text style={styles.silverPillText}>{reading.luckyColor}</Text>
                  </View>
                  <Text style={styles.readMore}>Full Forecast →</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* 🪐 Live Celestial Graha Radar Widget */}
          <View style={styles.grahaRadarCard}>
            <View style={styles.grahaRadarHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={styles.livePulseDot} />
                <Text style={styles.grahaRadarTitle}>LIVE CELESTIAL GRAHA RADAR</Text>
              </View>
              <Text style={styles.grahaRadarSub}>Current Transits vs Your Chart</Text>
            </View>

            <View style={styles.grahaPillGrid}>
              <View style={styles.grahaTransitPill}>
                <Text style={{ fontSize: 14 }}>🪐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.grahaPillName}>Brihaspati (Jupiter) in 11th</Text>
                  <Text style={styles.grahaPillEffect}>High financial & network gains active</Text>
                </View>
                <View style={styles.auspiciousBadge}>
                  <Text style={styles.auspiciousBadgeText}>+85% BENEFIC</Text>
                </View>
              </View>

              <View style={styles.grahaTransitPill}>
                <Text style={{ fontSize: 14 }}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.grahaPillName}>Shukra (Venus) in 5th</Text>
                  <Text style={styles.grahaPillEffect}>Romantic bliss & creative clarity</Text>
                </View>
                <View style={styles.auspiciousBadge}>
                  <Text style={styles.auspiciousBadgeText}>+92% HARMONY</Text>
                </View>
              </View>

              <View style={styles.grahaTransitPill}>
                <Text style={{ fontSize: 14 }}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.grahaPillName}>Shani (Saturn) in 10th</Text>
                  <Text style={styles.grahaPillEffect}>Disciplined career elevation & stability</Text>
                </View>
                <View style={[styles.auspiciousBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <Text style={[styles.auspiciousBadgeText, { color: '#B45309' }]}>KARMA SHIELD</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 8-Grid Super App Quick Actions */}
          <View>
            <SectionHeader title="✨ Vedic Astro Services" subtitle="Instant consultations & spiritual tools" />
            <View style={styles.quickGrid}>
              {quickActions.map(({ icon, label, href, bg, border, badge }) => (
                <Pressable
                  key={label}
                  onPress={() => router.push(href as never)}
                  style={({ pressed }) => [
                    styles.quickCell,
                    { backgroundColor: bg, borderColor: border },
                    pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  {badge && (
                    <View style={styles.quickBadge}>
                      <Text style={styles.quickBadgeText}>{badge}</Text>
                    </View>
                  )}
                  <Text style={styles.quickIcon}>{icon}</Text>
                  <Text style={styles.quickLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Today's Daily Panchang & Muhurta Radar Card */}
          <Pressable onPress={() => router.push('/panchang')} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
            <View style={styles.panchangCard}>
              <View style={styles.panchangTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🌅</Text>
                  <Text style={styles.panchangTitle}>Daily Panchang & Muhurta</Text>
                </View>
                <Text style={styles.panchangLink}>View Calendar →</Text>
              </View>
              <View style={styles.panchangGrid}>
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>TITHI</Text>
                  <Text style={styles.panchangVal}>Shukla Dashami</Text>
                </View>
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>NAKSHATRA</Text>
                  <Text style={styles.panchangVal}>Pushya Nakshatra</Text>
                </View>
                <View style={styles.panchangCol}>
                  <Text style={styles.panchangLabel}>RAHU KAAL</Text>
                  <Text style={[styles.panchangVal, { color: '#E11D48' }]}>4:30 PM - 6:00 PM</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Dedicated Numerology Grid */}
          <Pressable onPress={() => router.push('/numerology')} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
            <View style={styles.numerologyBanner}>
              <View style={styles.numBadgeCircle}>
                <Text style={styles.numBadgeVal}>{numerology.lifePathNumber}</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={styles.numBannerTag}>🔢 VEDIC NUMEROLOGY GRID</Text>
                <Text style={styles.numBannerTitle}>
                  Life Path #{numerology.lifePathNumber} · Personal Year {numerology.personalYear2026}
                </Text>
                <Text style={styles.numBannerSub} numberOfLines={1}>
                  📜 Past Life: {numerology.pastLifeInsight.pastLifeRole} · 🔮 2026-2030 Timeline
                </Text>
              </View>
              <Text style={styles.numBannerArrow}>›</Text>
            </View>
          </Pressable>

          {/* Astrologers Online Carousel */}
          <View>
            <SectionHeader
              title={t('astrologersOnline')}
              subtitle={`${featured.length} Acharyas online now`}
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/consult')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.lg, gap: 12 }}
            >
              {featured.map((a) => (
                <AstrologerCard
                  key={a.id}
                  astrologer={a}
                  compact
                  onPress={() => router.push(`/astrologer/${a.id}`)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Top Rated Acharyas */}
          <View>
            <SectionHeader title={t('topRated')} subtitle="Highest rated Vedic Masters this month" />
            <View style={{ gap: 12 }}>
              {[...ASTROLOGERS]
                .sort((x, y) => y.rating - x.rating)
                .slice(0, 3)
                .map((a) => (
                  <AstrologerCard
                    key={a.id}
                    astrologer={a}
                    onPress={() => router.push(`/astrologer/${a.id}`)}
                  />
                ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    paddingTop: spacing.xs,
  },

  /* Live Transit Ribbon */
  transitRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    overflow: 'hidden',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  transitText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },

  /* Daily Vedic Shloka Mantra Pill */
  shlokaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 150, 105, 0.25)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  shlokaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shlokaIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shlokaSoundIcon: {
    fontSize: 18,
  },
  shlokaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  playingBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  playingBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  tapToPlayBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  tapToPlayBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
  },
  shlokaSub: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  shlokaPlayBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  shlokaPauseBtn: {
    backgroundColor: '#D97706',
  },
  shlokaPlayText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Cosmic Rewards Banner */
  rewardsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: spacing.md,
    gap: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  rewardsFlameBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rewardsBannerTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  rewardsStreakPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  rewardsStreakPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FB923C',
  },
  rewardsCoinsHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  rewardsCoinsText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FDE68A',
  },
  rewardsBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rewardsBannerSub: {
    fontSize: 10.5,
    color: '#CBD5E1',
    lineHeight: 14,
  },
  rewardsActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rewardsActionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E1B4B',
  },

  /* Today's Reading Card */
  todayCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  todayRule: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#7C3AED',
  },
  todayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  purpleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
    flex: 1,
  },
  moodBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  todayMood: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },
  todayText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  luckyPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  luckyPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  silverPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  silverPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  readMore: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C3AED',
    marginLeft: 'auto',
  },

  /* 8-Grid Super App Quick Actions */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.xs,
  },
  quickCell: {
    width: '22.8%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  quickBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  quickIcon: {
    fontSize: 22,
  },
  quickLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },

  /* Panchang Card */
  panchangCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  panchangTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panchangTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  panchangLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  panchangGrid: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
  },
  panchangCol: {
    flex: 1,
    gap: 2,
  },
  panchangLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  panchangVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },

  /* Numerology Banner */
  numerologyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#BAE6FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  numBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0369A1',
  },
  numBannerTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  numBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  numBannerSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  numBannerArrow: {
    fontSize: 20,
    color: '#0284C7',
    fontWeight: '700',
  },

  /* Graha Radar Widget Styles */
  grahaRadarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  grahaRadarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  grahaRadarTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  grahaRadarSub: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  grahaPillGrid: {
    gap: 8,
  },
  grahaTransitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  grahaPillName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  grahaPillEffect: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  auspiciousBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  auspiciousBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.3,
  },
});
