import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { EmptyState } from '../../src/components/EmptyState';
import { KundliChart } from '../../src/components/KundliChart';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';
import { PLANETS } from '../../src/data/planets';

import { calculateVimshottariDasha, calculateGunMilan } from '../../src/services/astrology';

type TabId = 'chart' | 'planets' | 'houses' | 'dasha' | 'matching';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'chart', label: 'Chart', icon: '🪐' },
  { id: 'planets', label: 'Planets', icon: '✨' },
  { id: 'houses', label: 'Houses', icon: '🏠' },
  { id: 'dasha', label: 'Dasha', icon: '⏳' },
  { id: 'matching', label: 'Match', icon: '💞' },
];

function dms(deg: number): string {
  const within = deg % 30;
  const d = Math.floor(within);
  const m = Math.floor((within - d) * 60);
  return `${d}° ${String(m).padStart(2, '0')}'`;
}

export default function KundliScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const [tab, setTab] = useState<TabId>('chart');
  const [chartFormat, setChartFormat] = useState<'north' | 'south'>('north');
  const [matchingResult, setMatchingResult] = useState<any | null>(null);

  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // If logged in as Certified Astrologer / Acharya, render Client Vault Inspector
  if (authUser?.role === 'astrologer') {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScreenHeader title="Acharya Client Kundli Vault" subtitle="Search & inspect client birth charts" hideLanguage />
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            <Card padded>
              <Text style={{ ...typography.h2, color: colors.text, fontWeight: '800' }}>🔍 Search Client Chart Vault</Text>
              <Text style={{ ...typography.small, color: colors.textMuted, marginTop: 4 }}>
                Enter seeker birth details to generate real-time Vedic Kundli, Lagna analysis & Dasha timelines.
              </Text>
            </Card>

            <View style={{ gap: spacing.sm }}>
              <SectionHeader title="📂 Assigned Seekers" subtitle="Recent consultation charts" />
              {['Rahul Sharma (New Delhi)', 'Priya Patel (Ahmedabad)', 'Amit Verma (Mumbai)'].map((client, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push('/(tabs)')}
                  style={({ pressed }) => [{
                    backgroundColor: '#FFFFFF',
                    borderRadius: radius.md,
                    padding: spacing.md,
                    borderWidth: 1,
                    borderColor: 'rgba(191, 219, 254, 0.6)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }, pressed && { opacity: 0.8 }]}
                >
                  <View>
                    <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800' }}>👤 {client}</Text>
                    <Text style={{ ...typography.tiny, color: colors.teal, marginTop: 2, fontWeight: '700' }}>Vedic Kundli Generated · Active Session</Text>
                  </View>
                  <Text style={{ fontSize: 18, color: colors.teal, fontWeight: '800' }}>Inspect →</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!profile || !kundli) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScreenHeader title="Kundli" />
          <EmptyState
            icon="🪐"
            title="No chart yet"
            message="Add your birth details and we'll calculate your Lagna, Rashi and planetary positions."
            actionLabel="Add birth details"
            onAction={() => router.push('/(onboarding)/birth-details')}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const lagna = RASHIS[kundli.lagnaIndex];
  const moon = RASHIS[kundli.moonRashiIndex];
  const nak = NAKSHATRAS[kundli.moonNakshatraIndex];
  const dashas = calculateVimshottariDasha(kundli.moonNakshatraIndex, kundli.moonPada, profile.date);

  const handleRunMatch = () => {
    const result = calculateGunMilan(kundli, {
      ...kundli,
      moonRashiIndex: (kundli.moonRashiIndex + 4) % 12,
      moonNakshatraIndex: (kundli.moonNakshatraIndex + 7) % 27,
      mangalDosha: false,
    });
    setMatchingResult(result);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Your Kundli"
          subtitle={`${profile.name} · ${profile.date}`}
          showWallet
        />

        {/* Tab switcher wrapper with fixed height */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={{ flexGrow: 0 }}
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  {active ? (
                    <LinearGradient
                      colors={[colors.saffron, colors.gold]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                  <Text style={styles.tabIcon}>{t.icon}</Text>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'chart' && (
            <>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chartTitle}>
                      {chartFormat === 'north' ? 'Lagna Chart (North Indian)' : 'Lagna Chart (South Indian)'}
                    </Text>
                    <Text style={styles.chartSub}>
                      {chartFormat === 'north' ? 'Diamond geometry · 1st house top' : 'Fixed Zodiac clockwise boxes'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: radius.pill, padding: 3 }}>
                    <Pressable
                      onPress={() => setChartFormat('north')}
                      style={[{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.pill }, chartFormat === 'north' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }]}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: chartFormat === 'north' ? colors.goldSoft : colors.textMuted }}>💎 North</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setChartFormat('south')}
                      style={[{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.pill }, chartFormat === 'south' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }]}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: chartFormat === 'south' ? colors.goldSoft : colors.textMuted }}>🔲 South</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
                  <KundliChart kundli={kundli} size={300} chartStyle={chartFormat} />
                </View>
              </Card>

              {/* ── Magazine-Grade Vedic Kundli PDF Report Preview Card ── */}
              <Card>
                <LinearGradient
                  colors={['#FFFBEB', '#FEF3C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#D97706', alignItems: 'center', justifyContent: 'center', shadowColor: '#D97706', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }}>
                    <Text style={{ fontSize: 24 }}>📜</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#78350F' }}>
                      Complete 10-Page Vedic Kundli
                    </Text>
                    <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600', marginTop: 2 }}>
                      Gold-Sealed PDF · D1, D9 Navamsha, Dasha & Gemstone Upays
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    try {
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    } catch (_) {}
                    router.push('/(tabs)/profile');
                  }}
                  style={({ pressed }) => [{
                    marginTop: 12,
                    backgroundColor: '#D97706',
                    paddingVertical: 10,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    shadowColor: '#D97706',
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 2,
                  }, pressed && { opacity: 0.85 }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12.5 }}>
                    📥 Download Vedic PDF Report (Free) ›
                  </Text>
                </Pressable>
              </Card>

              <Card>
                <SectionHeader title="Core Details" />
                {[
                  ['Lagna (Ascendant)', `${lagna.sanskrit} · ${lagna.english}`, `Lord: ${PLANETS[lagna.lord].name}`],
                  ['Janma Rashi (Moon)', `${moon.sanskrit} · ${moon.english}`, `Element: ${moon.element}`],
                  ['Nakshatra', `${nak.name} · Pada ${kundli.moonPada}`, `Lord: ${PLANETS[nak.lord].name} · Deity: ${nak.deity}`],
                  ['Sun Sign (sidereal)', RASHIS[kundli.sunRashiIndex].sanskrit, RASHIS[kundli.sunRashiIndex].english],
                  ['Ayanamsa (Lahiri)', `${kundli.ayanamsa.toFixed(3)}°`, 'Sidereal correction applied'],
                ].map(([label, value, sub]) => (
                  <View key={label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={styles.detailValue}>{value}</Text>
                      <Text style={styles.detailSub}>{sub}</Text>
                    </View>
                  </View>
                ))}
              </Card>

              <Card>
                <SectionHeader title="Dosha Check" />
                <View style={styles.doshaRow}>
                  <View style={[styles.doshaIconWrap, { backgroundColor: kundli.mangalDosha ? 'rgba(225,29,72,0.12)' : 'rgba(5,150,105,0.12)' }]}>
                    <Text style={styles.doshaIcon}>{kundli.mangalDosha ? '⚠️' : '✅'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.doshaTitle}>
                      Mangal Dosha —{' '}
                      <Text style={{ color: kundli.mangalDosha ? colors.danger : colors.success }}>
                        {kundli.mangalDosha ? 'Present' : 'Not Present'}
                      </Text>
                    </Text>
                    <Text style={styles.doshaText}>
                      {kundli.mangalDosha
                        ? 'Mars occupies house 1, 2, 4, 7, 8 or 12. Traditionally this calls for a proper kundli match before marriage.'
                        : 'Mars is not placed in the houses associated with Mangal dosha in your chart.'}
                    </Text>
                  </View>
                </View>
              </Card>

              <Text style={styles.accuracyNote}>
                Positions are computed on-device using Lahiri ayanamsa. Sun and Moon are
                highly accurate; other planets use mean orbital elements and may vary by a
                fraction of a degree.
              </Text>
            </>
          )}

          {tab === 'planets' && (
            <Card padded={false}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { flex: 1.4 }]}>Planet</Text>
                <Text style={[styles.th, { flex: 1.4 }]}>Rashi</Text>
                <Text style={[styles.th, { width: 62 }]}>Degree</Text>
                <Text style={[styles.th, { width: 40, textAlign: 'center' }]}>H</Text>
              </View>
              {kundli.planets.map((p) => {
                const r = RASHIS[p.rashiIndex];
                const n = NAKSHATRAS[p.nakshatraIndex];
                return (
                  <View key={p.key} style={styles.tableRow}>
                    <View style={{ flex: 1.4 }}>
                      <Text style={styles.tdStrong}>
                        <Text style={{ color: PLANETS[p.key].color }}>
                          {PLANETS[p.key].glyph}{' '}
                        </Text>
                        {PLANETS[p.key].name}
                        {p.retrograde ? ' ↺' : ''}
                      </Text>
                      <Text style={styles.tdSub}>{PLANETS[p.key].sanskrit}</Text>
                    </View>
                    <View style={{ flex: 1.4 }}>
                      <Text style={styles.td}>{r.sanskrit}</Text>
                      <Text style={styles.tdSub}>
                        {n.name} · {p.pada}
                      </Text>
                    </View>
                    <Text style={[styles.td, { width: 62 }]}>{dms(p.longitude)}</Text>
                    <Text style={[styles.td, { width: 40, textAlign: 'center' }]}>
                      {p.house}
                    </Text>
                  </View>
                );
              })}
            </Card>
          )}

          {tab === 'houses' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="12 Houses" subtitle="Bhava chart — house lords and occupants" />
              </Card>
              {Array.from({ length: 12 }, (_, i) => {
                const houseNum = i + 1;
                const rashiIdx = (kundli.lagnaIndex + i) % 12;
                const rashi = RASHIS[rashiIdx];
                const occupants = kundli.planets.filter((p) => p.house === houseNum);
                return (
                  <Card key={houseNum} style={styles.houseCard}>
                    <View style={styles.houseNum}>
                      <Text style={styles.houseNumText}>{houseNum}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.houseRashi}>
                        {rashi.glyph} {rashi.sanskrit}
                        <Text style={{ color: colors.textMuted, fontWeight: '500' }}> · {rashi.english}</Text>
                      </Text>
                      <Text style={styles.houseLord}>
                        Lord: {PLANETS[rashi.lord].name} · {rashi.element} · {rashi.quality}
                      </Text>
                      {occupants.length > 0 ? (
                        <View style={styles.occupants}>
                          {occupants.map((p) => (
                            <Chip
                              key={p.key}
                              label={`${PLANETS[p.key].glyph} ${PLANETS[p.key].name}`}
                              tone="gold"
                            />
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.empty}>Empty house</Text>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {tab === 'dasha' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="Vimshottari Dasha" subtitle="120-Year Planetary Cycles" />
                <Text style={{ ...typography.small, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 18 }}>
                  Current active Mahadasha is highlighted below, based on your Moon Nakshatra at birth.
                </Text>
                {dashas.map((d) => (
                  <View
                    key={d.lord}
                    style={[
                      styles.dashaRow,
                      d.isActive && styles.dashaRowActive,
                    ]}
                  >
                    {d.isActive && (
                      <LinearGradient
                        colors={['rgba(217,119,6,0.12)', 'rgba(217,119,6,0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={[styles.dashaDot, { backgroundColor: d.isActive ? colors.gold : colors.textFaint }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dashaName, d.isActive && { color: colors.gold }]}>
                        {d.lordName} Mahadasha {d.isActive ? '⚡' : ''}
                      </Text>
                      <Text style={styles.dashaYears}>{d.years} years</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.dashaDate}>{d.startDate}</Text>
                      <Text style={[styles.dashaYears, { marginTop: 1 }]}>→ {d.endDate}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {tab === 'matching' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="Ashtakoot Gun Milan" subtitle="36-Point Vedic Compatibility" />
                <Text style={{ ...typography.small, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 18 }}>
                  Compare your birth chart with a partner chart for marriage & partnership compatibility.
                </Text>
                <Pressable
                  onPress={handleRunMatch}
                  style={({ pressed }) => [
                    styles.matchButton,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.saffron, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.matchButtonGradient}
                  >
                    <Text style={styles.matchButtonText}>💞 Calculate Kundli Compatibility</Text>
                  </LinearGradient>
                </Pressable>
              </Card>

              {matchingResult && (
                <Card>
                  <View style={styles.matchScore}>
                    <Text style={styles.matchScoreNum}>
                      {matchingResult.totalObtained}
                      <Text style={{ fontSize: 24, color: colors.textMuted }}> / {matchingResult.totalMax}</Text>
                    </Text>
                    <Text style={styles.matchScoreLabel}>
                      {matchingResult.percentage}% · {matchingResult.rating}
                    </Text>
                    <Text style={styles.matchVerdict}>{matchingResult.verdict}</Text>
                  </View>

                  <SectionHeader title="8 Koota Breakdown" />
                  {matchingResult.kootas.map((k: any) => (
                    <View key={k.name} style={styles.detailRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.detailValue, { textAlign: 'left', color: colors.text }]}>
                          {k.name}
                          <Text style={{ color: colors.textFaint, fontSize: 12 }}> ({k.sanskrit})</Text>
                        </Text>
                        <Text style={[styles.detailSub, { textAlign: 'left' }]}>{k.description}</Text>
                      </View>
                      <View style={[styles.kootaScore, { backgroundColor: k.obtained > 0 ? 'rgba(217,119,6,0.12)' : 'rgba(148,163,184,0.15)' }]}>
                        <Text style={[styles.kootaScoreText, { color: k.obtained > 0 ? colors.gold : colors.textFaint }]}>
                          {k.obtained}/{k.total}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    height: 48,
    marginBottom: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#E6ECF5',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  tabActive: {
    borderColor: 'transparent',
  },
  tabIcon: { fontSize: 13 },
  tabText: { ...typography.small, color: colors.textMuted, fontWeight: '700', fontSize: 13, lineHeight: 18 },
  tabTextActive: { color: colors.white, fontWeight: '800' },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg, paddingTop: spacing.xs },

  chartTitle: { ...typography.h2, color: colors.text, fontWeight: '800' },
  chartSub: { ...typography.small, color: colors.textMuted, marginTop: 2, fontWeight: '600' },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(163, 177, 198, 0.3)',
  },
  detailLabel: { ...typography.small, color: colors.textMuted, flex: 1, fontWeight: '600' },
  detailValue: { ...typography.h3, fontSize: 15, color: colors.gold, textAlign: 'right', fontWeight: '800' },
  detailSub: { ...typography.tiny, color: colors.textFaint, marginTop: 2, textAlign: 'right', fontWeight: '600' },

  doshaRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  doshaIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doshaIcon: { fontSize: 20 },
  doshaTitle: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '800' },
  doshaText: { ...typography.small, color: colors.textMuted, marginTop: 5, lineHeight: 19, fontWeight: '600' },

  accuracyNote: {
    ...typography.tiny,
    color: colors.textFaint,
    lineHeight: 15,
    paddingHorizontal: spacing.xs,
    textAlign: 'center',
  },

  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#DFE6F0',
  },
  th: { ...typography.tiny, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(163, 177, 198, 0.3)',
  },
  td: { ...typography.small, color: colors.text, fontWeight: '600' },
  tdStrong: { ...typography.small, color: colors.text, fontWeight: '800' },
  tdSub: { ...typography.tiny, color: colors.textFaint, marginTop: 2, fontWeight: '600' },

  houseCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  houseNum: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseNumText: { ...typography.h3, fontSize: 14, color: colors.gold, fontWeight: '900' },
  houseRashi: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '800' },
  houseLord: { ...typography.tiny, color: colors.textFaint, marginTop: 3, fontWeight: '600' },
  occupants: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  empty: { ...typography.tiny, color: colors.textFaint, fontStyle: 'italic', marginTop: spacing.sm },

  dashaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(163, 177, 198, 0.3)',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  dashaRowActive: {
    borderColor: 'rgba(217,119,6,0.40)',
    borderWidth: 1,
    borderRadius: radius.md,
    marginHorizontal: -2,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(217,119,6,0.06)',
  },
  dashaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dashaName: { ...typography.h3, fontSize: 14, color: colors.text, fontWeight: '800' },
  dashaYears: { ...typography.tiny, color: colors.textFaint, marginTop: 2, fontWeight: '600' },
  dashaDate: { ...typography.small, color: colors.gold, fontWeight: '800', fontSize: 12 },

  matchButton: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'stretch',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  matchButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  matchButtonText: {
    ...typography.h3,
    fontSize: 15,
    color: colors.white,
    fontWeight: '900',
  },
  matchScore: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderRadius: radius.md,
    backgroundColor: 'rgba(217,119,6,0.08)',
  },
  matchScoreNum: { fontSize: 52, fontWeight: '900', color: colors.gold },
  matchScoreLabel: { ...typography.h3, color: colors.gold, marginTop: 4, fontWeight: '800' },
  matchVerdict: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 18, paddingHorizontal: spacing.lg, fontWeight: '600' },

  kootaScore: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  kootaScoreText: { ...typography.small, fontWeight: '800', fontSize: 13 },
});
