import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { getDailyPanchang } from '../src/services/astrology/panchang';

export default function PanchangScreen() {
  const [panchang] = useState(() => getDailyPanchang(new Date()));
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'choghadiya'>('overview');

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Daily Panchang & Muhurat" subtitle={`${panchang.date} · ${panchang.day}`} showBack showWallet />

        {/* Category Tabs */}
        <View style={styles.tabRow}>
          {[
            { id: 'overview', label: '🪐 Panchang' },
            { id: 'events', label: '✨ Event Timings' },
            { id: 'choghadiya', label: '⏳ Choghadiya' },
          ].map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setActiveTab(t.id as any)}
              style={[styles.tabCell, activeTab === t.id && styles.tabCellActive]}
            >
              {activeTab === t.id && (
                <LinearGradient
                  colors={[colors.gold, colors.saffron]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <>
              {/* Sun & Moon Grid */}
              <View style={styles.sunMoonGrid}>
                <LinearGradient colors={['rgba(245,197,66,0.18)', 'rgba(255,138,61,0.06)']} style={styles.sunBox}>
                  <Text style={styles.sunIcon}>🌅</Text>
                  <Text style={styles.sunLabel}>Sunrise</Text>
                  <Text style={styles.sunTime}>{panchang.sunrise}</Text>
                </LinearGradient>

                <LinearGradient colors={['rgba(122,60,255,0.18)', 'rgba(194,75,255,0.06)']} style={styles.sunBox}>
                  <Text style={styles.sunIcon}>🌇</Text>
                  <Text style={styles.sunLabel}>Sunset</Text>
                  <Text style={styles.sunTime}>{panchang.sunset}</Text>
                </LinearGradient>

                <LinearGradient colors={['rgba(56,225,195,0.18)', 'rgba(56,225,195,0.06)']} style={styles.sunBox}>
                  <Text style={styles.sunIcon}>🌙</Text>
                  <Text style={styles.sunLabel}>Moonrise</Text>
                  <Text style={styles.sunTime}>{panchang.moonrise}</Text>
                </LinearGradient>
              </View>

              {/* 5 Core Pillars of Panchang */}
              <Card>
                <SectionHeader title="5 Pillars of Today" subtitle="Core Vedic Calendar Metrics" />

                {[
                  ['Tithi', `${panchang.tithi.name} (${panchang.tithi.paksha} Paksha)`, `Up to ${panchang.tithi.percentage}% day`],
                  ['Nakshatra', panchang.nakshatra.name, `Lord: ${panchang.nakshatra.lord}`],
                  ['Yoga', panchang.yoga.name, panchang.yoga.meaning],
                  ['Karana', panchang.karana.name, 'First half of Tithi'],
                  ['Vara (Day)', panchang.day, 'Solar weekday'],
                ].map(([label, value, sub]) => (
                  <View key={label} style={styles.row}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.rowValue}>{value}</Text>
                      <Text style={styles.rowSub}>{sub}</Text>
                    </View>
                  </View>
                ))}
              </Card>

              {/* Rahu Kaal Alert */}
              <Card style={{ borderColor: 'rgba(255,90,110,0.4)', backgroundColor: 'rgba(255,90,110,0.08)' }}>
                <View style={styles.alertHead}>
                  <Text style={{ fontSize: 24 }}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>Rahu Kaal (Avoid New Tasks)</Text>
                    <Text style={styles.alertTime}>{panchang.rahuKaal.start} – {panchang.rahuKaal.end}</Text>
                  </View>
                  <Chip label="Inauspicious" tone="default" style={{ backgroundColor: 'rgba(255,90,110,0.2)' }} />
                </View>
                <Text style={styles.alertSub}>
                  Avoid signing contracts, buying expensive items, or starting travel during Rahu Kaal.
                </Text>
              </Card>

              {/* Abhijit Muhurat Highlights */}
              <Card style={{ borderColor: 'rgba(61,220,132,0.4)', backgroundColor: 'rgba(61,220,132,0.08)' }}>
                <View style={styles.alertHead}>
                  <Text style={{ fontSize: 24 }}>⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: colors.success }]}>Abhijit Muhurat (Golden Hour)</Text>
                    <Text style={[styles.alertTime, { color: colors.gold }]}>{panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}</Text>
                  </View>
                  <Chip label="Auspicious" tone="teal" />
                </View>
                <Text style={styles.alertSub}>
                  Most favorable 48-minute window of the day for any important task or negotiation.
                </Text>
              </Card>
            </>
          )}

          {activeTab === 'events' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="Shubh Muhurat by Activity" subtitle="Recommended Auspicious Windows Today" />
              </Card>
              {panchang.eventMuhurats.map((ev) => (
                <Card key={ev.category} style={styles.eventCard}>
                  <View style={styles.eventIconWrap}>
                    <Text style={{ fontSize: 24 }}>{ev.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{ev.category}</Text>
                    <Text style={styles.eventTime}>Best Window: {ev.bestTime}</Text>
                  </View>
                  <View style={[styles.qualityTag, { backgroundColor: ev.quality === 'Excellent' ? 'rgba(61,220,132,0.15)' : 'rgba(245,197,66,0.15)' }]}>
                    <Text style={[styles.qualityText, { color: ev.quality === 'Excellent' ? colors.success : colors.gold }]}>
                      {ev.quality}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {activeTab === 'choghadiya' && (
            <Card padded={false}>
              <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
                <SectionHeader title="Day Choghadiya Timings" subtitle="7 Hourly Time Slots for Action" />
              </View>
              {panchang.choghadiya.map((ch, idx) => (
                <View key={idx} style={styles.choghRow}>
                  <Text style={styles.choghTime}>{ch.time}</Text>
                  <Text style={styles.choghType}>{ch.type}</Text>
                  <View style={[styles.choghBadge, { backgroundColor: ch.status === 'Good' ? 'rgba(61,220,132,0.15)' : ch.status === 'Bad' ? 'rgba(255,90,110,0.15)' : 'rgba(255,255,255,0.06)' }]}>
                    <Text style={[styles.choghBadgeText, { color: ch.status === 'Good' ? colors.success : ch.status === 'Bad' ? colors.danger : colors.textMuted }]}>
                      {ch.status}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  tabCellActive: {},
  tabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: colors.bg },

  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  sunMoonGrid: { flexDirection: 'row', gap: spacing.sm },
  sunBox: {
    flex: 1,
    minWidth: 90,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sunIcon: { fontSize: 22 },
  sunLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 4 },
  sunTime: { ...typography.small, color: colors.text, fontWeight: '800', marginTop: 2 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  rowLabel: { ...typography.small, color: colors.textMuted },
  rowValue: { ...typography.h3, fontSize: 14, color: colors.goldSoft },
  rowSub: { ...typography.tiny, color: colors.textFaint, marginTop: 1 },

  alertHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alertTitle: { ...typography.h3, fontSize: 15, color: colors.danger },
  alertTime: { ...typography.small, color: colors.text, fontWeight: '800', marginTop: 2 },
  alertSub: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 16 },

  eventCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eventIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: { ...typography.h3, fontSize: 15, color: colors.text },
  eventTime: { ...typography.small, color: colors.goldSoft, marginTop: 2 },
  qualityTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  qualityText: { ...typography.tiny, fontWeight: '800' },

  choghRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  choghTime: { ...typography.tiny, color: colors.textFaint, width: 140 },
  choghType: { ...typography.small, color: colors.text, flex: 1, fontWeight: '600' },
  choghBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  choghBadgeText: { ...typography.tiny, fontWeight: '800', fontSize: 10 },
});
