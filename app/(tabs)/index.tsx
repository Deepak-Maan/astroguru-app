/**
 * AstroGuru — Ultra-Premium Mystical Spatial Vedic Astrology Experience
 * Rebuilt with Deep Celestial Dark Palette (#0B0D17 Obsidian Midnight, #1A1A3A Nebula Indigo),
 * Starlight Gold (#D4AF37), GSAP Staggered Micro-Interactions, 3D WebGL Constellation Parallax,
 * and Frosted Spatial Glassmorphism Cards.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import gsap from 'gsap';
import { GradientBackground } from '../../src/components/GradientBackground';
import { SectionHeader } from '../../src/components/SectionHeader';
import { AstrologerCard } from '../../src/components/AstrologerCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { RashiChakra } from '../../src/components/hero/RashiChakra';
import { DailyHoroscopeHero } from '../../src/components/hero/DailyHoroscopeHero';
import { EnergyTransitMetrics } from '../../src/components/widgets/EnergyTransitMetrics';
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
  const contentContainerRef = useRef<HTMLDivElement | null>(null);

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

  // ── GSAP Staggered Entrance Micro-Interactions (Web) ──
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const ctx = gsap.context(() => {
        gsap.from('.stagger-card', {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'all',
        });
      }, contentContainerRef);

      return () => ctx.revert();
    }
  }, []);

  // If logging out or unauthenticated
  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // Admin view -> Redirect to Admin Panel immediately
  if (authUser?.role === 'admin') {
    router.replace('/admin');
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
    { icon: '🎡', label: 'Spin & Win', href: '/daily-rewards', bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', badge: 'FREE' },
    { icon: '🪐', label: 'Kundli', href: '/(tabs)/kundli', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', badge: '10-Pg' },
    { icon: '🔮', label: '3D Tarot', href: '/daily-rewards', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)' },
    { icon: '📿', label: '108 Japa', href: '/japa', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', badge: 'Mala' },
    { icon: '🔢', label: 'Numerology', href: '/numerology', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)' },
    { icon: '💎', label: 'Gemstones', href: '/gemstone-finder', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.35)' },
    { icon: '🏛️', label: 'Live Darshan', href: '/live-darshan', bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', badge: 'LIVE' },
    { icon: '💬', label: 'Instant Chat', href: '/instant-consult', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.35)' },
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
          <div ref={contentContainerRef as any} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Live Planetary Transit & Shubh Muhurta Ticker Ribbon */}
            <View style={[styles.transitRibbon, { className: 'stagger-card' } as any]}>
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.15)', 'rgba(56, 189, 248, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.livePulseDot} />
              <Text style={styles.transitText} numberOfLines={1}>
                <Text style={{ fontWeight: '900', color: colors.goldSoft }}>🪐 SHUBH MUHURTA:</Text> Abhijit Muhurta Active (11:45 AM - 12:30 PM) · Moon in {rashi.sanskrit}
              </Text>
            </View>

            {/* Daily Vedic Shloka Mantra Audio Player */}
            <Pressable
              onPress={toggleMantra}
              style={({ pressed }) => [
                styles.shlokaPill,
                { className: 'stagger-card' } as any,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
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
            <View style={{ className: 'stagger-card' } as any}>
              <RashiChakra
                kundli={kundli}
                onPress={() => router.push(kundli ? '/(tabs)/kundli' : '/(onboarding)/birth-details')}
              />
            </View>

            {/* Daily 3D Horoscope Hero Card with Embossed Zodiac Sphere */}
            <View style={{ className: 'stagger-card' } as any}>
              <DailyHoroscopeHero
                selectedRashi={rashi}
                onSelectRashi={(newRashi) => setRashiIndex(RASHIS.findIndex((r) => r.id === newRashi.id))}
              />
            </View>

            {/* Energy & Transit Metrics Widget */}
            <View style={{ className: 'stagger-card' } as any}>
              <EnergyTransitMetrics />
            </View>

            {/* Daily Cosmic Rewards & Navagraha Chakra Banner */}
            <Pressable
              onPress={() => router.push('/daily-rewards')}
              style={({ pressed }) => [
                { className: 'stagger-card' } as any,
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={styles.rewardsBanner}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.82)', 'rgba(254, 243, 199, 0.6)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.rewardsFlameBox}>
                  <LinearGradient
                    colors={['#D4AF37', '#EA580C']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={{ fontSize: 22 }}>🔥</Text>
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
                    colors={['#D4AF37', '#B8902A']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.rewardsActionText}>Play ›</Text>
                </View>
              </View>
            </Pressable>

            {/* Today's Reading Card */}
            <Pressable
              onPress={() => router.push('/(tabs)/horoscope')}
              style={{ className: 'stagger-card' } as any}
            >
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
                    {reading.summary || "Venus softens the celestial mood today. Trust your intuition in key financial and relationship decisions. Recovery multiplies tomorrow's output."}
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
            <View style={[styles.grahaRadarCard, { className: 'stagger-card' } as any]}>
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
                  <View style={[styles.auspiciousBadge, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
                    <Text style={[styles.auspiciousBadgeText, { color: colors.goldSoft }]}>KARMA SHIELD</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 8-Grid Super App Quick Actions */}
            <View style={{ className: 'stagger-card' } as any}>
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
            <Pressable
              onPress={() => router.push('/panchang')}
              style={({ pressed }) => [{ className: 'stagger-card' } as any, pressed && { opacity: 0.88 }]}
            >
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
                    <Text style={[styles.panchangVal, { color: '#F43F5E' }]}>4:30 PM - 6:00 PM</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Dedicated Numerology Grid */}
            <Pressable
              onPress={() => router.push('/numerology')}
              style={({ pressed }) => [{ className: 'stagger-card' } as any, pressed && { opacity: 0.88 }]}
            >
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
            <View style={{ className: 'stagger-card' } as any}>
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
            <View style={{ className: 'stagger-card' } as any}>
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
          </div>
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
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backdropFilter: 'blur(12px)' as any,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  transitText: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },

  /* Daily Vedic Shloka Player */
  shlokaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    backdropFilter: 'blur(16px)' as any,
  },
  shlokaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shlokaIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shlokaSoundIcon: {
    fontSize: 18,
  },
  shlokaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  playingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  playingBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  tapToPlayBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tapToPlayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B45309',
  },
  shlokaSub: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  shlokaPlayBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  shlokaPauseBtn: {
    backgroundColor: '#D97706',
  },
  shlokaPlayText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#0F172A',
  },

  /* Cosmic Rewards Banner */
  rewardsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: spacing.md,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    backdropFilter: 'blur(16px)' as any,
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
    color: '#B8902A',
    letterSpacing: 1,
  },
  rewardsStreakPill: {
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.35)',
  },
  rewardsStreakPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C2410C',
  },
  rewardsCoinsHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rewardsCoinsText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
  },
  rewardsBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  rewardsBannerSub: {
    fontSize: 10.5,
    color: '#94A3B8',
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
    color: '#0B0D17',
  },

  /* Today's Reading Card */
  todayCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    gap: 12,
    backdropFilter: 'blur(16px)' as any,
  },
  todayRule: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
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
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B8902A',
    letterSpacing: 0.5,
    flex: 1,
  },
  moodBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  todayMood: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0D9488',
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
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  luckyPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  silverPill: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  silverPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  readMore: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B8902A',
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    gap: 6,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backdropFilter: 'blur(10px)' as any,
  },
  quickBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#D97706',
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
    color: '#0F172A',
    textAlign: 'center',
  },

  /* Panchang Card */
  panchangCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 10,
    backdropFilter: 'blur(16px)' as any,
  },
  panchangTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panchangTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  panchangLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B8902A',
  },
  panchangGrid: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(241, 245, 249, 0.75)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  panchangCol: {
    flex: 1,
    gap: 2,
  },
  panchangLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  panchangVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Numerology Banner */
  numerologyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(2, 132, 199, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
    backdropFilter: 'blur(16px)' as any,
  },
  numBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284C7',
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
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    gap: 12,
    backdropFilter: 'blur(16px)' as any,
  },
  grahaRadarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
    paddingBottom: 8,
  },
  grahaRadarTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0D9488',
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
    backgroundColor: 'rgba(241, 245, 249, 0.75)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  grahaPillName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  grahaPillEffect: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  auspiciousBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  auspiciousBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0D9488',
    letterSpacing: 0.3,
  },
});
