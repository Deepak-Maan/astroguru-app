import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Chip } from '../../src/components/Chip';
import { SectionHeader } from '../../src/components/SectionHeader';
import { AstrologerCard } from '../../src/components/AstrologerCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { RashiChakra } from '../../src/components/hero/RashiChakra';
import { WarpZoomSlider } from '../../src/components/WarpZoomSlider';
import { DailyCosmicDirectiveCard } from '../../src/components/cosmic/DailyCosmicDirectiveCard';
import { ShareableCosmicStoryModal } from '../../src/components/cosmic/ShareableCosmicStoryModal';
import { GuruVaniVoiceModal } from '../../src/components/voice/GuruVaniVoiceModal';
import { ProblemCategoryCards } from '../../src/components/ProblemCategoryCards';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { useLanguageStore } from '../../src/store/languageStore';
import { TranslationKey } from '../../src/i18n/translations';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';
import { computeNumerologyDetails } from '../../src/services/numerologyPrediction';

import { JyotishiWorkstation } from '../../src/components/workstation/JyotishiWorkstation';

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const t = useLanguageStore((s) => s.t);

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showGuruVaniModal, setShowGuruVaniModal] = useState(false);

  const signIndex = kundli?.moonRashiIndex ?? 0;
  const rashi = RASHIS[signIndex];
  const reading = useMemo(() => getHoroscope(signIndex, 'daily'), [signIndex]);

  const featured = ASTROLOGERS.filter((a) => a.online).slice(0, 6);

  // Dynamic user name from auth session or birth profile
  const displayName =
    authUser?.name ||
    profile?.name ||
    (authUser?.email ? authUser.email.split('@')[0] : 'Demo');
  const firstName = displayName.split(' ')[0];

  const numerology = useMemo(
    () =>
      computeNumerologyDetails(
        profile?.date || '1995-08-15',
        displayName
      ),
    [profile?.date, displayName]
  );

  // If logging out or unauthenticated, return clean blank background during transition
  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // If user role is Astrologer / Jyotishi, render dedicated Jyotishi Workstation Dashboard
  if (authUser?.role === 'astrologer') {
    return (
      <GradientBackground>
        <JyotishiWorkstation />
      </GradientBackground>
    );
  }

  const quickActions = [
    { icon: '💬', label: 'Astrologer', href: '/instant-consult', bg: 'rgba(99, 102, 241, 0.25)' },
    { icon: '🪐', label: 'Kundli', href: '/(tabs)/kundli', bg: 'rgba(56, 189, 248, 0.22)' },
    { icon: '🪔', label: 'Book Puja', href: '/puja', bg: 'rgba(245, 158, 11, 0.25)' },
    { icon: '🎙️', label: 'Voice AI', href: 'guruvani_modal', bg: 'rgba(168, 85, 247, 0.25)' },
    { icon: '💳', label: 'Wallet', href: '/wallet', bg: 'rgba(236, 72, 153, 0.22)' },
    { icon: '🔢', label: 'Numerology', href: '/numerology', bg: 'rgba(129, 140, 248, 0.22)' },
    { icon: '🪄', label: 'Mantras', href: '/spells', bg: 'rgba(168, 85, 247, 0.22)' },
    { icon: '🔮', label: 'Love Match', href: '/soulmate-ai', bg: 'rgba(244, 114, 182, 0.22)' },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Screen Header matching design screenshot */}
        <ScreenHeader
          title={`Namaste,\n${firstName} 🙏`}
          subtitle={today}
          showWallet
          showTicker
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* 3D Warp Zoom Slider Showcase */}
          <WarpZoomSlider />

          {/* Live Planetary Transit Ticker Ribbon */}
          <View style={styles.transitRibbon}>
            <LinearGradient
              colors={['rgba(28, 36, 70, 0.85)', 'rgba(14, 18, 40, 0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.transitIcon}>🪐</Text>
            <Text style={styles.transitText} numberOfLines={1}>
              <Text style={{ fontWeight: '800', color: colors.primary }}>TODAY'S PLANETS:</Text> Jupiter in Taurus · Sun in Leo · Moon in {rashi.english} · Good time active
            </Text>
          </View>

          {/* Daily Vedic Shloka Mantra Pill */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={({ pressed }) => [styles.shlokaPill, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
          >
            <View style={styles.shlokaLeft}>
              <Text style={styles.shlokaSoundIcon}>🔊</Text>
              <View>
                <Text style={styles.shlokaTitle}>Daily Mantra · Gayatri Mantra</Text>
                <Text style={styles.shlokaSub}>ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि...</Text>
              </View>
            </View>
            <View style={styles.shlokaPlayBtn}>
              <Text style={styles.shlokaPlayText}>▶ Play</Text>
            </View>
          </Pressable>

          {/* YOUR SKY AT BIRTH Hero Card matching screenshot */}
          <Pressable onPress={() => router.push(kundli ? '/(tabs)/kundli' : '/(onboarding)/birth-details')}>
            <View style={styles.skyCard}>
              <View style={styles.constellationGlow} />
              <Text style={styles.skyEyebrow}>✨ YOUR BIRTH CHART (KUNDLI)</Text>
              <Text style={styles.skyTitle}>
                {kundli ? `${rashi.english} Birth Chart` : 'Enter your birth details'}
              </Text>
              <Text style={styles.skySub}>
                See where the planets were when you were born. Tap to view your full Kundli chart.
              </Text>
              <View style={styles.startNowRow}>
                <Text style={styles.startNowText}>{kundli ? 'View full chart →' : 'Start now →'}</Text>
              </View>
            </View>
          </Pressable>

          {/* Today's reading Card matching screenshot */}
          <Pressable onPress={() => router.push('/(tabs)/horoscope')}>
            <View style={styles.todayCard}>
              <View style={styles.todayRule} />
              <View style={{ flex: 1, gap: 10 }}>
                <View style={styles.todayTop}>
                  <View style={styles.purpleIconBox}>
                    <Text style={{ fontSize: 16 }}>🔮</Text>
                  </View>
                  <Text style={styles.todayLabel}>
                    TODAY'S HOROSCOPE • {rashi.english.toUpperCase()} ({rashi.sanskrit})
                  </Text>
                  <View style={styles.moodBadge}>
                    <Text style={styles.todayMood}>{reading.mood}% Positive</Text>
                  </View>
                </View>

                <Text style={styles.todayText} numberOfLines={3}>
                  Venus softens the mood around you. Rest is not idleness today. Recovery will multiply tomorrow's output. Overall, ...
                </Text>

                <View style={styles.todayFooter}>
                  <View style={styles.luckyPill}>
                    <Text style={styles.luckyPillText}>Lucky no. {reading.luckyNumber}</Text>
                  </View>
                  <View style={styles.silverPill}>
                    <Text style={styles.silverPillText}>{reading.luckyColor}</Text>
                  </View>
                  <Text style={styles.readMore}>Read details →</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Problem-First Concern Categories (Love, Marriage, Career, Money, Nazar) */}
          <ProblemCategoryCards />

          {/* Quick Actions 8 Grid Cards matching screenshot */}
          <View style={styles.quickGrid}>
            {quickActions.map(({ icon, label, href, bg }) => (
              <Pressable
                key={label}
                onPress={() => {
                  if (href === 'guruvani_modal') {
                    if (Platform.OS !== 'web') {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      } catch (_) {}
                    }
                    setShowGuruVaniModal(true);
                  } else {
                    router.push(href as never);
                  }
                }}
                style={({ pressed }) => [styles.quickCell, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: bg }]}>
                  <Text style={styles.quickIcon}>{icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Daily Cosmic Directives (Do's & Don'ts & 9:16 Story Card) */}
          <DailyCosmicDirectiveCard
            rashiId={rashi.english.toLowerCase()}
            rashiName={rashi.english}
            onOpenShareModal={() => setShowStoryModal(true)}
          />

          {/* Sacred Sanctuary & AstroMall Banner */}
          <Pressable onPress={() => router.push('/puja')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={['rgba(79, 70, 229, 0.35)', 'rgba(245, 158, 11, 0.25)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sanctuaryBanner}
            >
              <View style={styles.sanctuaryIconCircle}>
                <Text style={{ fontSize: 24 }}>🪔</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sanctuaryTag}>ONLINE PUJAS & REMEDIES</Text>
                  <View style={styles.sanctuaryLivePill}>
                    <Text style={styles.sanctuaryLiveText}>KASHI & UJJAIN</Text>
                  </View>
                </View>
                <Text style={styles.sanctuaryTitle}>Book Temple Pujas & Buy Remedies</Text>
                <Text style={styles.sanctuarySub} numberOfLines={1}>
                  Pujas performed in your name · Genuine certified Rudraksha & Gemstones
                </Text>
              </View>
              <Text style={styles.sanctuaryArrow}>›</Text>
            </LinearGradient>
          </Pressable>

          {/* Dedicated Numerology Past & Future Predictions Banner */}
          <Pressable onPress={() => router.push('/numerology')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <View style={styles.numerologyBanner}>
              <View style={styles.numBadgeCircle}>
                <Text style={styles.numBadgeVal}>{numerology.lifePathNumber}</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={styles.numBannerTag}>🔢 NUMEROLOGY PREDICTION</Text>
                <Text style={styles.numBannerTitle}>
                  Life Path #{numerology.lifePathNumber} · Year {numerology.personalYear2026}
                </Text>
                <Text style={styles.numBannerSub} numberOfLines={1}>
                  Your personality strengths & 2026 life forecast
                </Text>
              </View>
              <Text style={styles.numBannerArrow}>›</Text>
            </View>
          </Pressable>

          {/* Horoscope Highlights Mini-Row */}
          <View style={styles.featureHighlightsRow}>
            <Pressable
              onPress={() => router.push('/(tabs)/horoscope')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ fontSize: 20 }}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Daily Rashi</Text>
                <Text style={styles.highlightSub}>Today's Forecast</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/shop')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ fontSize: 20 }}>💎</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Remedies</Text>
                <Text style={styles.highlightSub}>Gemstones Shop</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>
          </View>

          {/* VIP / AI Banner */}
          <Pressable onPress={() => router.push('/vip')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={isVip ? ['#FF3366', '#8B5CF6'] : ['#4F46E5', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.vipBanner}
            >
              <Text style={styles.aiIcon}>{isVip ? '👑' : '✨'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>
                  {isVip ? 'AstroVIP Active' : t('askAi')}
                </Text>
                <Text style={styles.aiSub}>
                  {isVip ? '15% off all consultations · Unlimited AI' : t('askAiSub')}
                </Text>
              </View>
              <Text style={styles.aiArrow}>›</Text>
            </LinearGradient>
          </Pressable>

          {/* Astrologers online */}
          <View>
            <SectionHeader
              title={t('astrologersOnline')}
              subtitle={`${featured.length} experts available now`}
              actionLabel="See all"
              onAction={() => router.push('/(tabs)/consult')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.lg }}
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

          {/* Top rated */}
          <View>
            <SectionHeader title={t('topRated')} subtitle="Highest rated Jyotishis this month" />
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
        </ScrollView>

        {/* Floating GuruVani AI Conversational Voice Astrologer Button */}
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (_) {}
            }
            setShowGuruVaniModal(true);
          }}
          style={({ pressed }) => [
            styles.floatingGuruVaniBtn,
            pressed && { transform: [{ scale: 0.94 }], opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingGuruVaniGradient}
          >
            <Text style={styles.floatingGuruVaniIcon}>🎙️</Text>
          </LinearGradient>
          <View style={styles.floatingGuruVaniPill}>
            <Text style={styles.floatingGuruVaniPillText}>Talk to AI</Text>
          </View>
        </Pressable>

        {/* 9:16 Shareable Cosmic Story Modal */}
        <ShareableCosmicStoryModal
          visible={showStoryModal}
          rashiId={rashi.english.toLowerCase()}
          onClose={() => setShowStoryModal(false)}
        />

        {/* GuruVani AI Voice Astrologer Modal */}
        <GuruVaniVoiceModal
          visible={showGuruVaniModal}
          onClose={() => setShowGuruVaniModal(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md, paddingTop: spacing.xs },

  /* YOUR SKY AT BIRTH Hero Card */
  skyCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  skyEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.8,
  },
  skyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#EEF2FF',
    lineHeight: 30,
    marginTop: 2,
  },
  skySub: {
    fontSize: 13.5,
    color: '#A5B4FC',
    lineHeight: 20,
    marginTop: 4,
    fontWeight: '500',
  },
  startNowRow: {
    marginTop: spacing.md,
  },
  startNowText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#38BDF8',
  },
  constellationGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },

  /* Live Planetary Transit Ticker Ribbon */
  transitRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.28)',
    overflow: 'hidden',
    gap: 8,
  },
  transitIcon: { fontSize: 14 },
  transitText: { fontSize: 11.5, color: '#EEF2FF', fontWeight: '600', flex: 1 },

  /* Daily Vedic Shloka Mantra Pill */
  shlokaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  shlokaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  shlokaSoundIcon: { fontSize: 18 },
  shlokaTitle: { fontSize: 12.5, fontWeight: '800', color: '#EEF2FF' },
  shlokaSub: { fontSize: 10.5, color: '#A5B4FC', fontWeight: '500', marginTop: 1 },
  shlokaPlayBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 2.5,
    borderBottomColor: '#059669',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: 'rgba(16, 185, 129, 0.4)',
    borderRightColor: 'rgba(16, 185, 129, 0.4)',
  },
  shlokaPlayText: { fontSize: 11, fontWeight: '900', color: '#10B981' },

  /* Today's Reading Card */
  todayCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    padding: spacing.md,
    overflow: 'hidden',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  todayRule: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#818CF8',
  },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  purpleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: { fontSize: 11, letterSpacing: 0.6, color: '#818CF8', flex: 1, fontWeight: '800' },
  moodBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  todayMood: { fontSize: 11, color: '#10B981', fontWeight: '800' },
  todayText: { color: '#EEF2FF', lineHeight: 20, fontWeight: '500', fontSize: 13.5 },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  luckyPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#0284C7',
  },
  luckyPillText: { fontSize: 11.5, color: '#38BDF8', fontWeight: '800' },
  silverPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  silverPillText: { fontSize: 11.5, color: '#10B981', fontWeight: '800' },
  readMore: { fontSize: 13, color: '#818CF8', fontWeight: '800', marginLeft: 'auto' },

  /* 6 Quick Action Grid Cards */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickCell: {
    minWidth: '28%',
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    gap: 8,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  quickIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomWidth: 2.5,
    borderBottomColor: 'rgba(10, 12, 28, 0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  quickIcon: { fontSize: 23 },
  quickLabel: { color: '#EEF2FF', fontSize: 12.5, fontWeight: '800', textAlign: 'center' },

  numerologyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md + 2,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 4,
  },
  numBadgeCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 2.5,
    borderBottomColor: '#4338CA',
  },
  numBadgeVal: { ...typography.display, fontSize: 20, color: colors.white, fontWeight: '900' },
  numBannerTag: { ...typography.tiny, color: '#818CF8', fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  numBannerTitle: { ...typography.h3, color: '#EEF2FF', fontSize: 13, fontWeight: '800' },
  numBannerSub: { ...typography.tiny, color: '#A5B4FC', fontSize: 10.5, lineHeight: 14, fontWeight: '600' },
  numBannerArrow: { fontSize: 20, color: '#818CF8', fontWeight: '800' },

  featureHighlightsRow: { flexDirection: 'row', gap: spacing.xs + 2 },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    padding: spacing.sm + 3,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  highlightTitle: { ...typography.h3, color: '#EEF2FF', fontSize: 13, fontWeight: '800' },
  highlightSub: { ...typography.tiny, color: '#A5B4FC', fontSize: 10, fontWeight: '600' },
  highlightArrow: { fontSize: 18, color: '#818CF8' },

  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderBottomWidth: 3.5,
    borderBottomColor: '#9D174D',
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  aiIcon: { fontSize: 20 },
  aiTitle: { ...typography.h3, color: colors.white, fontWeight: '800', fontSize: 15 },
  aiSub: { ...typography.small, fontSize: 11.5, color: 'rgba(255,255,255,0.9)', marginTop: 1 },
  aiArrow: { fontSize: 22, color: colors.white, fontWeight: '700' },

  /* Sacred Sanctuary & AstroMall Banner */
  sanctuaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  sanctuaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  sanctuaryTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.8,
  },
  sanctuaryLivePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  sanctuaryLiveText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  sanctuaryTitle: {
    ...typography.h3,
    color: '#EEF2FF',
    fontWeight: '800',
    fontSize: 14,
  },
  sanctuarySub: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  sanctuaryArrow: {
    fontSize: 22,
    color: '#FCD34D',
    fontWeight: '700',
  },

  /* Floating GuruVani Voice Button */
  floatingGuruVaniBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
    gap: 4,
    zIndex: 999,
  },
  floatingGuruVaniGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.45)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  floatingGuruVaniIcon: {
    fontSize: 26,
  },
  floatingGuruVaniPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  floatingGuruVaniPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EEF2FF',
    letterSpacing: 0.4,
  },
});
