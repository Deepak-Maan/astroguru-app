import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { HoroscopePeriod } from '../../src/types';
import { RASHIS } from '../../src/data/rashis';
import { getHoroscope } from '../../src/services/horoscope';
import { useUserStore } from '../../src/store/userStore';

const PERIODS: { id: HoroscopePeriod; label: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', icon: '☀️' },
  { id: 'weekly', label: 'Weekly', icon: '📅' },
  { id: 'monthly', label: 'Monthly', icon: '🌙' },
];

const AREA_ICONS = { love: '❤️', career: '💼', health: '🌿' } as const;

export default function Horoscope() {
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
                  style={[styles.signCell, active && styles.signCellActive]}
                >
                  {active && (
                    <LinearGradient
                      colors={[colors.auroraA, colors.auroraB]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.signGlyph, active && { color: colors.white }]}>
                    {r.glyph}
                  </Text>
                  <Text style={[styles.signName, active && { color: 'rgba(255,255,255,0.85)' }]}>
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
                    colors={[colors.gold, colors.saffron]}
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
                  <Text style={{ color: colors.textMuted, fontWeight: '500' }}> · {rashi.english}</Text>
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
                colors={[colors.teal, colors.auroraB]}
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
          <Card>
            <Text style={styles.luckyTitle}>Lucky Factors</Text>
            <View style={styles.luckyRow}>
              {[
                { label: 'Number', value: String(reading.luckyNumber), color: colors.gold },
                { label: 'Colour', value: reading.luckyColor, color: colors.teal },
                { label: 'Gem', value: rashi.luckyColor, color: colors.auroraB },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.luckyCell}>
                  <Text style={styles.luckyLabel}>{label}</Text>
                  <Text style={[styles.luckyValue, { color }]}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.traitRow}>
              <Chip label={rashi.traits} tone="teal" />
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
    width: 68,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: spacing.sm,
    overflow: 'hidden',
    gap: 3,
  },
  signCellActive: { borderColor: colors.auroraA },
  signGlyph: { fontSize: 22, color: colors.goldSoft },
  signName: { ...typography.tiny, fontSize: 9.5, color: colors.textMuted },
  yourDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.teal,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },

  periodRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 2,
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
  periodIcon: { fontSize: 13 },
  periodText: { ...typography.small, color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  periodTextActive: { color: colors.bg },

  readingHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  readingGlyphCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245,197,66,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingGlyph: { fontSize: 28, color: colors.goldSoft },
  readingSign: { ...typography.h2, color: colors.text },
  readingMeta: { ...typography.tiny, color: colors.textFaint, marginTop: 2, textTransform: 'capitalize' },
  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(56,225,195,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,225,195,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodValue: { ...typography.h3, fontSize: 15, color: colors.teal, lineHeight: 18 },
  moodPct: { ...typography.tiny, fontSize: 9, color: colors.teal },

  summary: { ...typography.body, color: colors.text, lineHeight: 22 },
  moodBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  moodBarFill: { height: '100%', borderRadius: 4 },
  moodCaption: { ...typography.tiny, color: colors.textMuted, marginTop: 6 },

  areaCard: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  areaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaIcon: { fontSize: 18 },
  areaTitle: { ...typography.h3, fontSize: 15, color: colors.text },
  areaText: { ...typography.small, color: colors.textMuted, marginTop: 4, lineHeight: 19 },

  luckyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  luckyRow: { flexDirection: 'row', gap: spacing.sm },
  luckyCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  luckyLabel: { ...typography.tiny, color: colors.textFaint },
  luckyValue: { ...typography.h3, fontSize: 13, fontWeight: '800' },
  traitRow: { flexDirection: 'row', marginTop: spacing.md },
});
