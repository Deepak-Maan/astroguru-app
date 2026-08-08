import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { HoroscopePeriod } from '../../src/types';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';

const PERIODS: { id: HoroscopePeriod; label: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', icon: '\u2600\ufe0f' },
  { id: 'weekly', label: 'Weekly', icon: '\ud83d\udcc5' },
  { id: 'monthly', label: 'Monthly', icon: '\ud83c\udf19' },
];

const TRANSITS = [
  { planet: '\u2609 Sun', from: 'Karka (Cancer)', to: 'Simha (Leo)', date: '17 Aug 2026', effect: 'Boosts leadership & authority in all charts', urgent: false },
  { planet: '\u263d Moon', from: 'Mesha', to: 'Vrishabha', date: '10 Aug 2026', effect: 'Emotional sensitivity peaks — advise clients caution', urgent: false },
  { planet: '\u2642 Mars', from: 'Mithuna', to: 'Karka', date: '01 Sep 2026', effect: 'Aggression & property disputes. Acharya alert!', urgent: true },
  { planet: '\u2643 Jupiter', from: 'Mithuna', to: 'Karka', date: '14 Oct 2026', effect: 'Grand Guru Transit — highly auspicious consultations', urgent: false },
  { planet: '\u2644 Saturn', from: 'Kumbha (Rx)', to: 'Direct', date: '15 Nov 2026', effect: 'Saturn stations direct — major life changes', urgent: true },
  { planet: '\u2648 Rahu', from: 'Meena', to: 'Kumbha', date: '22 Dec 2026', effect: 'Karmic axis shift — destiny consultations increase', urgent: false },
];

const RETRO = [
  { planet: 'Saturn \u2644', period: '29 Jun – 15 Nov 2026', status: 'Retrograde', impact: 'Delays, karma, karmic debt clients' },
  { planet: 'Jupiter \u2643', period: '09 Oct – 02 Feb 2027', status: 'Retrograde', impact: 'Guru wisdom retreat — introspection' },
  { planet: 'Mercury \u263f', period: '25 Aug – 17 Sep 2026', status: 'Retrograde', impact: 'Communication issues — advise delay' },
];

function AcharyaTransits() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent'>('all');
  const filtered = activeFilter === 'urgent' ? TRANSITS.filter((t) => t.urgent) : TRANSITS;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Planetary Transits" subtitle="Acharya astro-intelligence feed" />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} showsVerticalScrollIndicator={false}>

          {/* Filter Pills */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['all', 'urgent'] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                style={{
                  paddingHorizontal: 18, paddingVertical: 8, borderRadius: radius.pill,
                  backgroundColor: activeFilter === f ? colors.teal : '#FFFFFF',
                  borderWidth: 1.5, borderColor: activeFilter === f ? colors.teal : 'rgba(191,219,254,0.6)',
                }}
              >
                <Text style={{ color: activeFilter === f ? '#FFFFFF' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
                  {f === 'all' ? '\ud83c\udf0d All Transits' : '\u26a1 Urgent Alerts'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Today's Key Alert */}
          <View style={{ backgroundColor: '#FEF3C7', borderRadius: radius.lg, padding: spacing.md, borderLeftWidth: 4, borderLeftColor: '#D97706' }}>
            <Text style={{ color: '#92400E', fontWeight: '800', fontSize: 14 }}>\u26a1 Acharya Intelligence Alert</Text>
            <Text style={{ color: '#78350F', fontSize: 13, marginTop: 4, fontWeight: '600', lineHeight: 18 }}>Mars transiting Karka from 1 Sep — prepare clients in houses 1, 4, 7, 10 for major life changes. Update consultation notes now.</Text>
          </View>

          {/* Transit Table */}
          <SectionHeader title="\ud83c\udf20 Upcoming Major Transits" subtitle="Affects your consultation guidance" />
          {filtered.map((t, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: radius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: t.urgent ? 'rgba(220,38,38,0.3)' : 'rgba(191,219,254,0.5)',
                borderLeftWidth: 4,
                borderLeftColor: t.urgent ? '#EF4444' : colors.teal,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{t.planet}</Text>
                {t.urgent && (
                  <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '800' }}>\u26a1 URGENT</Text>
                  </View>
                )}
              </View>
              <Text style={{ ...typography.tiny, color: colors.teal, fontWeight: '700' }}>{t.from} \u2192 {t.to} · {t.date}</Text>
              <Text style={{ ...typography.small, color: colors.textMuted, lineHeight: 18 }}>{t.effect}</Text>
            </View>
          ))}

          {/* Retrograde Table */}
          <SectionHeader title="\u21a9\ufe0f Active Retrogrades" subtitle="Planet stations affecting readings" />
          <Card padded={false}>
            {RETRO.map((r, i) => (
              <View
                key={i}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.md, borderBottomWidth: i < RETRO.length - 1 ? 1 : 0, borderColor: 'rgba(191,219,254,0.4)', gap: spacing.sm }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ ...typography.body, color: colors.text, fontWeight: '800' }}>{r.planet}</Text>
                  <Text style={{ ...typography.tiny, color: colors.textMuted }}>{r.period}</Text>
                  <Text style={{ ...typography.tiny, color: colors.textMuted, marginTop: 2 }}>{r.impact}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(217,119,6,0.1)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(217,119,6,0.3)' }}>
                  <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '800' }}>\u21a9 {r.status}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Panchang Today */}
          <Card padded>
            <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800', marginBottom: spacing.sm }}>\ud83d\uddd3\ufe0f Today's Panchang</Text>
            {[
              ['Tithi', '\ud83c\udf15 Purnima (Full Moon)'],
              ['Nakshatra', '\u2b50 Shravana'],
              ['Yoga', 'Vriddhi (Growth)'],
              ['Karana', 'Bava'],
              ['Vara', 'Saturday (Shaniwar)'],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderColor: 'rgba(191,219,254,0.4)' }}>
                <Text style={{ ...typography.body, color: colors.textMuted }}>{k}</Text>
                <Text style={{ ...typography.body, color: colors.text, fontWeight: '700' }}>{v}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

export default function Horoscope() {
  const authUser = useAuthStore((s) => s.user);
  if (authUser?.role === 'astrologer') return <AcharyaTransits />;

  const kundli = useUserStore((s) => s.kundli);
  const [sign, setSign] = useState(kundli?.moonRashiIndex ?? 0);
  const [period, setPeriod] = useState<HoroscopePeriod>('daily');

  const reading = useMemo(() => getHoroscope(sign, period), [sign, period]);
  const rashi = RASHIS[sign];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Horoscope" subtitle="Rashifal for all 12 signs" showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Sign selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.signStrip}
          >
            {RASHIS.map((r) => {
              const active = r.index === sign;
              return (
                <Pressable
                  key={r.index}
                  onPress={() => setSign(r.index)}
                  style={({ pressed }) => [
                    styles.signCell,
                    active && styles.signCellActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {active && (
                    <LinearGradient
                      colors={[colors.saffron, colors.gold]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.signGlyph, active && { color: colors.white }]}>
                    {r.glyph}
                  </Text>
                  <Text style={[styles.signName, active && { color: colors.white, fontWeight: '800' }]}>
                    {r.sanskrit}
                  </Text>
                  {r.index === kundli?.moonRashiIndex && (
                    <View style={styles.yourDot} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Period tabs */}
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setPeriod(p.id)}
                style={[styles.period, period === p.id && styles.periodActive]}
              >
                {period === p.id && (
                  <LinearGradient
                    colors={[colors.teal, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={styles.periodIcon}>{p.icon}</Text>
                <Text style={[styles.periodText, period === p.id && styles.periodTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Main reading card */}
          <Card>
            <View style={styles.readingHead}>
              <View style={styles.readingGlyphCircle}>
                <Text style={styles.readingGlyph}>{rashi.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.readingSign}>
                  {rashi.sanskrit}
                  <Text style={{ color: colors.textMuted, fontWeight: '600' }}> · {rashi.english}</Text>
                </Text>
                <Text style={styles.readingMeta}>
                  {rashi.element} · {rashi.quality} · Lord {rashi.lord}
                </Text>
              </View>
              <View style={styles.moodCircle}>
                <Text style={styles.moodValue}>{reading.mood}</Text>
                <Text style={styles.moodPct}>%</Text>
              </View>
            </View>

            <Text style={styles.summary}>{reading.summary}</Text>

            {/* Mood bar */}
            <View style={styles.moodBarTrack}>
              <LinearGradient
                colors={[colors.teal, colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.moodBarFill, { width: `${reading.mood}%` }]}
              />
            </View>
            <Text style={styles.moodCaption}>Overall {period} mood · {reading.mood}%</Text>
          </Card>

          {/* Life areas */}
          {(
            [
              ['❤️', 'Love & Relationships', reading.love],
              ['💼', 'Career & Work', reading.career],
              ['🌿', 'Health & Wellbeing', reading.health],
            ] as [string, string, string][]
          ).map(([icon, title, text]) => (
            <View key={title} style={styles.areaCard}>
              <View style={styles.areaIconCircle}>
                <Text style={styles.areaIcon}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.areaTitle}>{title}</Text>
                <Text style={styles.areaText}>{text}</Text>
              </View>
            </View>
          ))}

          {/* Lucky factors */}
          <Card style={{ marginHorizontal: spacing.lg }}>
            <Text style={styles.luckyTitle}>Lucky Factors</Text>
            <View style={styles.luckyRow}>
              {[
                { label: 'Number', value: String(reading.luckyNumber), color: colors.gold },
                { label: 'Colour', value: reading.luckyColor, color: colors.teal },
                { label: 'Gem', value: rashi.luckyColor, color: colors.gold },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.luckyCell}>
                  <Text style={styles.luckyLabel}>{label}</Text>
                  <Text style={[styles.luckyValue, { color }]}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.traitRow}>
              <Chip label={rashi.traits} tone="gold" />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg },

  signStrip: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.xs },
  signCell: {
    width: 72,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#E6ECF5',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    marginRight: spacing.sm,
    overflow: 'hidden',
    gap: 3,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  signCellActive: { borderColor: colors.gold },
  signGlyph: { fontSize: 24, color: colors.gold },
  signName: { ...typography.tiny, fontSize: 10, color: colors.text, fontWeight: '700' },
  yourDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  periodRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: '#E6ECF5',
    borderRadius: radius.pill,
    padding: 4,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    gap: 2,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  period: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  periodActive: {},
  periodIcon: { fontSize: 14 },
  periodText: { ...typography.small, color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  periodTextActive: { color: colors.white, fontWeight: '800' },

  readingHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  readingGlyphCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingGlyph: { fontSize: 28, color: colors.gold },
  readingSign: { ...typography.h2, color: colors.text, fontWeight: '800' },
  readingMeta: { ...typography.tiny, color: colors.textFaint, marginTop: 2, textTransform: 'capitalize', fontWeight: '600' },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodValue: { ...typography.h3, fontSize: 15, color: colors.teal, lineHeight: 18, fontWeight: '800' },
  moodPct: { ...typography.tiny, fontSize: 9.5, color: colors.teal, fontWeight: '800' },

  summary: { ...typography.body, color: colors.text, lineHeight: 22, fontWeight: '600' },
  moodBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DFE6F0',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  moodBarFill: { height: '100%', borderRadius: 4 },
  moodCaption: { ...typography.tiny, color: colors.textMuted, marginTop: 6, fontWeight: '700' },

  areaCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: '#E6ECF5',
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    padding: spacing.lg,
    alignItems: 'flex-start',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  areaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DFE6F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(163, 177, 198, 0.4)',
  },
  areaIcon: { fontSize: 18 },
  areaTitle: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '800' },
  areaText: { ...typography.small, color: colors.textMuted, marginTop: 4, lineHeight: 19, fontWeight: '600' },

  luckyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md, fontWeight: '800' },
  luckyRow: { flexDirection: 'row', gap: spacing.sm },
  luckyCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#DFE6F0',
    borderWidth: 1,
    borderColor: 'rgba(163, 177, 198, 0.4)',
    gap: 4,
  },
  luckyLabel: { ...typography.tiny, color: colors.textFaint, fontWeight: '700' },
  luckyValue: { ...typography.h3, fontSize: 13, fontWeight: '800' },
  traitRow: { flexDirection: 'row', marginTop: spacing.md },
});
