import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Chip } from '../../src/components/Chip';
import { SectionHeader } from '../../src/components/SectionHeader';
import { AstrologerCard } from '../../src/components/AstrologerCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { RashiChakra } from '../../src/components/hero/RashiChakra';
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

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const t = useLanguageStore((s) => s.t);

  const quickActions = [
    { icon: '🪐', labelKey: 'kundli', href: '/(tabs)/kundli', gradientA: '#10B981', gradientB: '#059669' },
    { icon: '🔢', labelKey: 'numerology', href: '/numerology', gradientA: '#F59E0B', gradientB: '#D97706' },
    { icon: '🪄', labelKey: 'spells', href: '/spells', gradientA: '#8B5CF6', gradientB: '#F59E0B' },
    { icon: '🔮', labelKey: 'matching', href: '/matching', gradientA: '#F59E0B', gradientB: '#10B981' },
    { icon: '💬', labelKey: 'consult', href: '/instant-consult', gradientA: '#06B6D4', gradientB: '#3B82F6' },
    { icon: '💰', labelKey: 'wallet', href: '/wallet', gradientA: '#F59E0B', gradientB: '#E67E22' },
  ];

  const signIndex = kundli?.moonRashiIndex ?? 0;
  const rashi = RASHIS[signIndex];
  const reading = useMemo(() => getHoroscope(signIndex, 'daily'), [signIndex]);

  const featured = ASTROLOGERS.filter((a) => a.online).slice(0, 6);

  // Dynamic user name from auth session or birth profile
  const displayName =
    authUser?.name ||
    profile?.name ||
    (authUser?.email ? authUser.email.split('@')[0] : 'Seeker');
  const firstName = displayName.split(' ')[0];

  const numerology = useMemo(
    () => computeNumerologyDetails(displayName, profile?.date || '15-08-1998'),
    [displayName, profile?.date]
  );

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Screen Header with Live Panchang Ticker */}
        <ScreenHeader
          title={`${t('namaste')}, ${firstName} 🙏`}
          subtitle={today}
          showWallet
          showTicker
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Chakra */}
          <RashiChakra
            kundli={kundli}
            onPress={() =>
              router.push(kundli ? '/(tabs)/kundli' : '/(onboarding)/birth-details')
            }
          />

          {/* Today's reading 3D Dark Glass Card */}
          <Pressable onPress={() => router.push('/(tabs)/horoscope')}>
            <View style={styles.todayCard}>
              <LinearGradient
                colors={['rgba(16,185,129,0.14)', 'rgba(245,158,11,0.06)', 'rgba(14,23,38,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.todayRule} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={styles.todayTop}>
                  <Text style={styles.todayGlyph}>{rashi.glyph}</Text>
                  <Text style={styles.todayLabel}>
                    {t('todayReading')} · {rashi.sanskrit.toUpperCase()}
                  </Text>
                  <View style={styles.moodBadge}>
                    <Text style={styles.todayMood}>✨ {reading.mood}% Positive</Text>
                  </View>
                </View>

                <Text style={styles.todayText} numberOfLines={2}>
                  {reading.summary}
                </Text>

                <View style={styles.todayFooter}>
                  <Chip label={`Lucky no. ${reading.luckyNumber}`} tone="gold" />
                  <Chip label={reading.luckyColor} tone="teal" />
                  <Text style={styles.readMore}>Read details →</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Quick actions 3D Cyber Glass Grid */}
          <View style={styles.quickGrid}>
            {quickActions.map(({ icon, labelKey, href, gradientA, gradientB }) => (
              <Pressable
                key={labelKey}
                onPress={() => router.push(href as never)}
                style={({ pressed }) => [styles.quickCell, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
              >
                <LinearGradient
                  colors={[gradientA + '22', gradientB + '08']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.quickIconCircle, { backgroundColor: gradientA + '33' }]}>
                  <Text style={styles.quickIcon}>{icon}</Text>
                </View>
                <Text style={styles.quickLabel}>
                  {labelKey === 'numerology'
                    ? 'Numerology'
                    : labelKey === 'spells'
                    ? 'Vedic Spells'
                    : labelKey === 'matching'
                    ? 'Gun Milan'
                    : labelKey === 'japa'
                    ? 'Japa Mala'
                    : labelKey === 'pdf'
                    ? 'Kundli PDF'
                    : t(labelKey as TranslationKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Dedicated Numerology Past & Future Predictions Cyber Banner */}
          <Pressable onPress={() => router.push('/numerology')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <View style={styles.numerologyBanner}>
              <LinearGradient
                colors={['rgba(245,158,11,0.20)', 'rgba(16,185,129,0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
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

          {/* Feature Highlights Row 1: Spells & Remedies */}
          <View style={styles.featureHighlightsRow}>
            <Pressable
              onPress={() => router.push('/spells')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['rgba(139,92,246,0.18)', 'rgba(245,158,11,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 20 }}>🪄</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Vedic Spells</Text>
                <Text style={styles.highlightSub}>Manifestation Rituals</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/remedies')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['rgba(245,158,11,0.18)', 'rgba(16,185,129,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 20 }}>💎</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Remedies</Text>
                <Text style={styles.highlightSub}>Gemstones Shop</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>
          </View>

          {/* Feature Highlights Row 2: Palmistry & Sade Sati */}
          <View style={styles.featureHighlightsRow}>
            <Pressable
              onPress={() => router.push('/palmistry')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['rgba(16,185,129,0.18)', 'rgba(6,182,212,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 20 }}>✋</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>AstroPalm AI</Text>
                <Text style={styles.highlightSub}>Palmistry Scanner</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/sade-sati')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['rgba(244,63,94,0.18)', 'rgba(245,158,11,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 20 }}>🪐</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Shani Sade Sati</Text>
                <Text style={styles.highlightSub}>Gochar & Remedies</Text>
              </View>
              <Text style={styles.highlightArrow}>›</Text>
            </Pressable>
          </View>

          {/* VIP / AI Banner */}
          <Pressable onPress={() => router.push('/vip')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <LinearGradient
              colors={isVip ? ['#F59E0B', '#D97706'] : ['#10B981', '#059669']}
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

          <Text style={styles.footerNote}>
            Astrologer consultations in this build are simulated for demonstration.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md, paddingTop: spacing.xs },

  todayCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.30)',
    backgroundColor: '#0E1726',
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  todayRule: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: colors.saffron,
    opacity: 0.9,
  },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  todayGlyph: { fontSize: 18, color: colors.saffron },
  todayLabel: { ...typography.tiny, fontSize: 10, letterSpacing: 1.2, color: colors.saffron, flex: 1, fontWeight: '800' },
  moodBadge: {
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.40)',
  },
  todayMood: { ...typography.tiny, fontSize: 10, color: colors.teal, fontWeight: '800' },
  todayText: { ...typography.small, color: colors.text, lineHeight: 18, fontWeight: '600', fontSize: 12.5 },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  readMore: { ...typography.small, color: colors.saffron, fontWeight: '800', marginLeft: 'auto', fontSize: 12 },

  aiIcon: { fontSize: 20 },
  aiTitle: { ...typography.h3, color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  aiSub: { ...typography.small, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  aiArrow: { fontSize: 22, color: '#FFFFFF', fontWeight: '700' },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  quickCell: {
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.22)',
    overflow: 'hidden',
    gap: 4,
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  quickIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: { fontSize: 17 },
  quickLabel: { ...typography.tiny, color: colors.text, fontSize: 10.5, fontWeight: '800' },

  numerologyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    shadowColor: 'rgba(245,158,11,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  numBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeVal: { ...typography.display, fontSize: 20, color: colors.white, fontWeight: '900' },
  numBannerTag: { ...typography.tiny, color: colors.saffron, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  numBannerTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  numBannerSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, lineHeight: 14, fontWeight: '600' },
  numBannerArrow: { fontSize: 20, color: colors.saffron, fontWeight: '800' },

  featureHighlightsRow: { flexDirection: 'row', gap: spacing.xs + 2 },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.22)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.40)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  highlightSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  highlightArrow: { fontSize: 18, color: colors.textMuted },

  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderRadius: radius.md,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: 'rgba(16,185,129,0.30)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },

  footerNote: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
