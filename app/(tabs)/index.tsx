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

import { JyotishiWorkstation } from '../../src/components/workstation/JyotishiWorkstation';

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const t = useLanguageStore((s) => s.t);

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
    { icon: '🪐', label: 'Kundli', href: '/(tabs)/kundli', bg: '#FFEDD5' },
    { icon: '🔢', label: 'Numerology', href: '/numerology', bg: '#E0F2FE' },
    { icon: '🪄', label: 'Vedic Spells', href: '/spells', bg: '#F3E8FF' },
    { icon: '🔮', label: 'Crystal Ball', href: '/soulmate-ai', bg: '#EEF2FF' },
    { icon: '💬', label: 'Chat', href: '/instant-consult', bg: '#F5F3FF' },
    { icon: '💰', label: 'Wallet', href: '/wallet', bg: '#FEF3C7' },
  ];

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
    () => computeNumerologyDetails(displayName, profile?.date || '15-08-1998'),
    [displayName, profile?.date]
  );

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
          {/* YOUR SKY AT BIRTH Hero Card matching screenshot */}
          <Pressable onPress={() => router.push(kundli ? '/(tabs)/kundli' : '/(onboarding)/birth-details')}>
            <View style={styles.skyCard}>
              <Text style={styles.skyEyebrow}>YOUR SKY AT BIRTH</Text>
              <Text style={styles.skyTitle}>
                {kundli ? `${rashi.english} Rashi Chart` : 'Add your birth details'}
              </Text>
              <Text style={styles.skySub}>
                The chakra fills with your nine grahas once we know when and where you were born.
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
                    TODAY'S READING • {rashi.sanskrit.toUpperCase()}
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

          {/* Quick Actions 6 Grid Cards matching screenshot */}
          <View style={styles.quickGrid}>
            {quickActions.map(({ icon, label, href, bg }) => (
              <Pressable
                key={label}
                onPress={() => router.push(href as never)}
                style={({ pressed }) => [styles.quickCell, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: bg }]}>
                  <Text style={styles.quickIcon}>{icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Dedicated Numerology Past & Future Predictions Banner */}
          <Pressable onPress={() => router.push('/numerology')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
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

          {/* Feature Highlights Row 1: Spells & Remedies */}
          <View style={styles.featureHighlightsRow}>
            <Pressable
              onPress={() => router.push('/spells')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
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
              colors={isVip ? [colors.gold, colors.saffron] : [colors.teal, '#047857']}
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
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md, paddingTop: spacing.xs },

  /* YOUR SKY AT BIRTH Hero Card */
  skyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.xs,
    shadowColor: '#93C5FD',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  skyEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  skyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E1065',
    lineHeight: 32,
    marginTop: 2,
  },
  skySub: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 4,
    fontWeight: '500',
  },
  startNowRow: {
    marginTop: spacing.md,
  },
  startNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },

  /* Today's Reading Card */
  todayCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  todayRule: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#059669',
  },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  purpleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B0764',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLabel: { fontSize: 11, letterSpacing: 0.6, color: '#059669', flex: 1, fontWeight: '800' },
  moodBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.25)',
  },
  todayMood: { fontSize: 11, color: '#059669', fontWeight: '800' },
  todayText: { color: '#334155', lineHeight: 20, fontWeight: '500', fontSize: 13.5 },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  luckyPill: {
    backgroundColor: '#FEF3C7',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  luckyPillText: { fontSize: 11.5, color: '#D97706', fontWeight: '800' },
  silverPill: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  silverPillText: { fontSize: 11.5, color: '#059669', fontWeight: '800' },
  readMore: { fontSize: 13, color: '#059669', fontWeight: '800', marginLeft: 'auto' },

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
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  quickIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: { fontSize: 22 },
  quickLabel: { color: '#1E1B4B', fontSize: 12.5, fontWeight: '800', textAlign: 'center' },

  numerologyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.35)',
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  numBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justify.content: 'center',
  },
  numBadgeVal: { ...typography.display, fontSize: 20, color: colors.white, fontWeight: '900' },
  numBannerTag: { ...typography.tiny, color: colors.teal, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  numBannerTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  numBannerSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, lineHeight: 14, fontWeight: '600' },
  numBannerArrow: { fontSize: 20, color: colors.teal, fontWeight: '800' },

  featureHighlightsRow: { flexDirection: 'row', gap: spacing.xs + 2 },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightTitle: { ...typography.h3, color: colors.text, fontSize: 13, fontWeight: '800' },
  highlightSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  highlightArrow: { fontSize: 18, color: colors.textMuted },

  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
});,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
