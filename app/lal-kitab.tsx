import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { EmptyState } from '../src/components/EmptyState';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useUserStore } from '../src/store/userStore';
import { calculateLalKitab, LalKitabDebt } from '../src/services/lalkitab';

type TabType = 'debts' | 'houses' | 'tracker';

export default function LalKitabScreen() {
  const router = useRouter();
  const kundli = useUserStore((s) => s.kundli);
  const profile = useUserStore((s) => s.profile);

  const [tab, setTab] = useState<TabType>('debts');
  const [selectedDebt, setSelectedDebt] = useState<LalKitabDebt | null>(null);

  // 43-Day Streak State
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  if (!kundli || !profile) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScreenHeader title="Lal Kitab & Pitru Dosh" showBack />
          <EmptyState
            icon="⚔️"
            title="No Chart Found"
            message="Please add your birth details first to generate your Lal Kitab Kundli and Pitru Dosh report."
            actionLabel="Add Birth Details"
            onAction={() => router.push('/(onboarding)/birth-details')}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const { houses, debts } = calculateLalKitab(kundli);
  const activeDebts = debts.filter((d) => d.isPresent);

  const toggleDayCompleted = (dayNum: number) => {
    if (completedDays.includes(dayNum)) {
      setCompletedDays(completedDays.filter((d) => d !== dayNum));
    } else {
      setCompletedDays([...completedDays, dayNum]);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Lal Kitab & Ancestral Debts"
          subtitle={`${profile.name} · Pakka Ghar Analysis`}
          showBack
          showWallet
        />

        {/* Tab Switcher Wrapper */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={{ flexGrow: 0 }}
          >
            {[
              { id: 'debts', label: `⚔️ Ancestral Debts (${activeDebts.length})` },
              { id: 'houses', label: '🔮 Lal Kitab Kundli' },
              { id: 'tracker', label: `📿 43-Day Remedy Tracker (${completedDays.length}/43)` },
            ].map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id as TabType)}
                style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              >
                {tab === t.id && (
                  <LinearGradient
                    colors={['#7D3C98', '#E67E22']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.tabBtnText, tab === t.id && styles.tabBtnTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── TAB 1: ANCESTRAL DEBTS & PITRU DOSH ── */}
          {tab === 'debts' && (
            <View style={{ gap: spacing.md }}>
              <View style={styles.heroBanner}>
                <LinearGradient
                  colors={['rgba(230,126,34,0.12)', 'rgba(125,60,152,0.04)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 36 }}>⚔️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Lal Kitab Rina (Ancestral Debts)</Text>
                  <Text style={styles.heroSub}>
                    Diagnoses karmic debts inherited from past lineage and provides simple 43-day household remedies.
                  </Text>
                </View>
              </View>

              <SectionHeader title="Diagnosed Lineage Debts" subtitle="Based on your Lal Kitab Kundli" />

              {activeDebts.map((debt) => (
                <Card key={debt.id} style={styles.debtCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{debt.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.debtTitle}>{debt.name}</Text>
                      <Text style={styles.debtSanskrit}>{debt.sanskritName}</Text>
                    </View>
                    <Chip
                      label={`${debt.severity} Risk`}
                      tone={debt.severity === 'High' ? 'rose' : 'gold'}
                    />
                  </View>

                  <Text style={styles.causeText}>
                    <Text style={{ fontWeight: '800', color: colors.saffron }}>Cause: </Text>
                    {debt.cause}
                  </Text>

                  <Text style={styles.symptomHeader}>Key Symptoms / Life Indications:</Text>
                  {debt.symptoms.map((s, idx) => (
                    <Text key={idx} style={styles.symptomItem}>• {s}</Text>
                  ))}

                  <View style={styles.remedyBox}>
                    <Text style={styles.remedyTitle}>📿 Recommended 43-Day Household Remedy:</Text>
                    {debt.remedies.map((r, i) => (
                      <Text key={i} style={styles.remedyText}>{i + 1}. {r}</Text>
                    ))}
                  </View>

                  <Button
                    label="📿 Start 43-Day Remedy Tracker"
                    variant="gold"
                    size="sm"
                    onPress={() => setTab('tracker')}
                  />
                </Card>
              ))}
            </View>
          )}

          {/* ── TAB 2: LAL KITAB KUNDLI & PAKKA GHAR ── */}
          {tab === 'houses' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Lal Kitab Pakka Ghar Kundli" subtitle="Aries (Mesh) is fixed as House 1" />

              <Card padded={false}>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, { width: 50 }]}>House</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Pakka Lord</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Occupants</Text>
                  <Text style={[styles.th, { width: 70, textAlign: 'right' }]}>Status</Text>
                </View>

                {houses.map((h) => (
                  <View key={h.house} style={styles.tableRow}>
                    <Text style={[styles.tdStrong, { width: 50 }]}>H-{h.house}</Text>
                    <Text style={[styles.td, { flex: 1 }]}>{h.pakkaGharLord}</Text>
                    <View style={{ flex: 1.5 }}>
                      {h.occupants.length > 0 ? (
                        <Text style={styles.tdStrong}>{h.occupants.join(', ')}</Text>
                      ) : (
                        <Text style={styles.tdFaint}>Dormant (Soya)</Text>
                      )}
                    </View>
                    <View style={{ width: 70, alignItems: 'flex-end' }}>
                      <Chip
                        label={h.isSoya ? 'Soya' : h.isAndha ? 'Andha' : 'Active'}
                        tone={h.isSoya ? 'teal' : h.isAndha ? 'rose' : 'gold'}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* ── TAB 3: 43-DAY REMEDY STREAK TRACKER ── */}
          {tab === 'tracker' && (
            <View style={{ gap: spacing.md }}>
              <Card style={{ gap: spacing.sm }}>
                <SectionHeader
                  title="43-Consecutive Day Remedy Tracker"
                  subtitle="Lal Kitab remedies require uninterrupted 43 days completion"
                />

                <View style={styles.progressBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.progressText}>
                      Completed: <Text style={{ color: colors.saffron, fontWeight: '800' }}>{completedDays.length}</Text> / 43 Days
                    </Text>
                    <Text style={styles.progressPct}>
                      {Math.round((completedDays.length / 43) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.bar, { width: `${(completedDays.length / 43) * 100}%` }]} />
                  </View>
                </View>

                <Text style={styles.gridHeader}>Tap a day circle to check off today's remedy:</Text>

                {/* 43 Days Grid */}
                <View style={styles.dayGrid}>
                  {Array.from({ length: 43 }, (_, i) => {
                    const dayNum = i + 1;
                    const done = completedDays.includes(dayNum);
                    return (
                      <Pressable
                        key={dayNum}
                        onPress={() => toggleDayCompleted(dayNum)}
                        style={[styles.dayCell, done && styles.dayCellDone]}
                      >
                        <Text style={[styles.dayCellText, done && styles.dayCellTextDone]}>
                          {done ? '✓' : dayNum}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {completedDays.length === 43 && (
                  <View style={styles.congratsBanner}>
                    <Text style={{ fontSize: 32 }}>🎉 📿</Text>
                    <Text style={styles.congratsTitle}>43-Day Ritual Completed!</Text>
                    <Text style={styles.congratsSub}>
                      Congratulations! Your Lal Kitab karmic remedy cycle has been successfully fulfilled.
                    </Text>
                  </View>
                )}
              </Card>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F3',
    justifyContent: 'center',
    shadowColor: 'rgba(160,175,205,0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabBtn: {
    minWidth: 80,
    paddingHorizontal: spacing.md,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    overflow: 'hidden',
  },
  tabBtnActive: { borderColor: 'transparent' },
  tabBtnText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  tabBtnTextActive: { color: colors.white },

  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
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
  heroTitle: { ...typography.h3, color: colors.saffron, fontSize: 16, fontWeight: '800' },
  heroSub: { ...typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18, fontWeight: '600' },

  debtCard: { gap: spacing.xs },
  debtTitle: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  debtSanskrit: { ...typography.tiny, color: colors.saffron, fontWeight: '700' },
  causeText: { ...typography.small, color: colors.text, marginTop: 4, lineHeight: 18 },

  symptomHeader: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', marginTop: spacing.xs },
  symptomItem: { ...typography.small, color: colors.text, lineHeight: 18 },

  remedyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 4,
    marginVertical: spacing.xs,
  },
  remedyTitle: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  remedyText: { ...typography.small, color: colors.text, lineHeight: 19, fontWeight: '600' },

  /* Table */
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8F3',
  },
  th: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 11 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E8F3',
  },
  td: { ...typography.small, color: colors.text },
  tdStrong: { ...typography.small, color: colors.text, fontWeight: '700' },
  tdFaint: { ...typography.tiny, color: colors.textMuted, fontStyle: 'italic' },

  /* Tracker */
  progressBox: { gap: 4, marginVertical: spacing.xs },
  progressText: { ...typography.small, color: colors.text, fontWeight: '700' },
  progressPct: { ...typography.small, color: colors.saffron, fontWeight: '900' },
  track: { height: 10, backgroundColor: '#F8FAFC', borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: '#E3E8F3' },
  bar: { height: '100%', backgroundColor: colors.saffron, borderRadius: 5 },

  gridHeader: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', marginTop: spacing.sm },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.sm },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellDone: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  dayCellText: { ...typography.small, color: colors.text, fontWeight: '800' },
  dayCellTextDone: { color: colors.white },

  congratsBanner: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  congratsTitle: { ...typography.h2, color: colors.success, fontWeight: '800' },
  congratsSub: { ...typography.small, color: colors.text, textAlign: 'center', lineHeight: 18 },
});
