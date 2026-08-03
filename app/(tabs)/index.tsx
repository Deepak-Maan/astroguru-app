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
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { useLanguageStore } from '../../src/store/languageStore';
import { TranslationKey } from '../../src/i18n/translations';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';

export default function Home() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const t = useLanguageStore((s) => s.t);

  const quickActions = [
    { icon: '🪐', labelKey: 'kundli', href: '/(tabs)/kundli', gradientA: '#7D3C98', gradientB: '#9B51E0' },
    { icon: '🪄', labelKey: 'spells', href: '/spells', gradientA: '#9B51E0', gradientB: '#E67E22' },
    { icon: '🔮', labelKey: 'matching', href: '/matching', gradientA: '#E67E22', gradientB: '#D4AC0D' },
    { icon: '💬', labelKey: 'consult', href: '/instant-consult', gradientA: '#16A085', gradientB: '#2980B9' },
    { icon: '💰', labelKey: 'wallet', href: '/wallet', gradientA: '#D4AC0D', gradientB: '#E67E22' },
    { icon: '📿', labelKey: 'japa', href: '/japa', gradientA: '#E67E22', gradientB: '#7D3C98' },
  ];

  const signIndex = kundli?.moonRashiIndex ?? 0;
  const rashi = RASHIS[signIndex];
  const reading = useMemo(() => getHoroscope(signIndex, 'daily'), [signIndex]);

  const featured = ASTROLOGERS.filter((a) => a.online).slice(0, 6);
  const firstName = profile?.name?.split(' ')[0] ?? 'Seeker';

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

          {/* Today's reading 3D Card */}
          <Pressable onPress={() => router.push('/(tabs)/horoscope')}>
            <View style={styles.todayCard}>
              <LinearGradient
                colors={['rgba(230,126,34,0.10)', 'rgba(125,60,152,0.04)', 'rgba(255,255,255,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.todayRule} />
              <View style={{ flex: 1, gap: spacing.sm }}>
                <View style={styles.todayTop}>
                  <Text style={styles.todayGlyph}>{rashi.glyph}</Text>
                  <Text style={styles.todayLabel}>
                    {t('todayReading')} · {rashi.sanskrit.toUpperCase()}
                  </Text>
                  <View style={styles.moodBadge}>
                    <Text style={styles.todayMood}>✨ {reading.mood}% Positive</Text>
                  </View>
                </View>

                <Text style={styles.todayText} numberOfLines={3}>
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

          {/* Quick actions 3D Glass Grid */}
          <View style={styles.quickGrid}>
            {quickActions.map(({ icon, labelKey, href, gradientA, gradientB }) => (
              <Pressable
                key={labelKey}
                onPress={() => router.push(href as never)}
                style={({ pressed }) => [styles.quickCell, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]}
              >
                <LinearGradient
                  colors={[gradientA + '18', gradientB + '06']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.quickIconCircle, { backgroundColor: gradientA + '22' }]}>
                  <Text style={styles.quickIcon}>{icon}</Text>
                </View>
                <Text style={styles.quickLabel}>
                  {labelKey === 'spells'
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

          {/* Feature Highlights Row 1: Spells & Remedies */}
          <View style={styles.featureHighlightsRow}>
            <Pressable
              onPress={() => router.push('/spells')}
              style={({ pressed }) => [styles.highlightCard, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={['rgba(125,60,152,0.14)', 'rgba(230,126,34,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 26 }}>🪄</Text>
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
                colors={['rgba(230,126,34,0.14)', 'rgba(212,172,13,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 26 }}>💎</Text>
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
                colors={['rgba(125,60,152,0.12)', 'rgba(125,60,152,0.03)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 26 }}>✋</Text>
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
                colors={['rgba(231,76,60,0.12)', 'rgba(230,126,34,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 26 }}>🪐</Text>
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
              colors={isVip ? ['#E67E22', '#D4AC0D'] : ['#7D3C98', '#E67E22']}
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg, paddingTop: spacing.xs },

  todayCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(230,126,34,0.3)',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: 'rgba(230,126,34,0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 5,
  },
  todayRule: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.saffron,
    opacity: 0.9,
  },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  todayGlyph: { fontSize: 22, color: colors.saffron },
  todayLabel: { ...typography.tiny, fontSize: 10.5, letterSpacing: 1.6, color: colors.saffron, flex: 1, fontWeight: '800' },
  moodBadge: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.35)',
  },
  todayMood: { ...typography.tiny, fontSize: 10.5, color: colors.teal, fontWeight: '800' },
  todayText: { ...typography.small, color: colors.text, lineHeight: 20, fontWeight: '600' },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  readMore: { ...typography.small, color: colors.saffron, fontWeight: '800', marginLeft: 'auto' },

  aiIcon: { fontSize: 24 },
  aiTitle: { ...typography.h3, color: '#FFFFFF', fontWeight: '800' },
  aiSub: { ...typography.small, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  aiArrow: { fontSize: 28, color: '#FFFFFF', fontWeight: '700' },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCell: {
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    overflow: 'hidden',
    gap: 6,
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: { fontSize: 20 },
  quickLabel: { ...typography.tiny, color: colors.text, fontSize: 11, fontWeight: '800' },

  featureHighlightsRow: { flexDirection: 'row', gap: spacing.sm },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  highlightTitle: { ...typography.h3, color: colors.text, fontSize: 14, fontWeight: '800' },
  highlightSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  highlightArrow: { fontSize: 20, color: colors.textMuted },

  vipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: 'rgba(125,60,152,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },

  footerNote: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
