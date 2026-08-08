import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { formatCurrency } from '../../src/utils';

const MONTHS = ['August 2026', 'July 2026', 'June 2026', 'May 2026'];

const TRANSACTIONS = [
  { id: 't1', seeker: 'Rahul M.', duration: '18 min', amount: 810, date: '08 Aug, 14:20' },
  { id: 't2', seeker: 'Priya K.', duration: '25 min', amount: 1125, date: '08 Aug, 11:45' },
  { id: 't3', seeker: 'Amit S.', duration: '12 min', amount: 540, date: '07 Aug, 19:10' },
  { id: 't4', seeker: 'Sunita R.', duration: '30 min', amount: 1350, date: '06 Aug, 16:30' },
  { id: 't5', seeker: 'Deepak V.', duration: '15 min', amount: 675, date: '05 Aug, 18:00' },
  { id: 't6', seeker: 'Meera T.', duration: '22 min', amount: 990, date: '04 Aug, 10:15' },
  { id: 't7', seeker: 'Vikram P.', duration: '10 min', amount: 450, date: '03 Aug, 21:05' },
];

export default function EarningsReport() {
  const [monthIdx, setMonthIdx] = useState(0);

  function handleDownloadPDF() {
    if (Platform.OS === 'web') alert('📄 Downloading Monthly Earnings Statement (PDF)…');
    else Alert.alert('Downloading PDF', 'Your monthly earnings report is being generated and downloaded.');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Monthly Earnings Report" subtitle="Financial analytics & statements" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Month Selector */}
          <View style={styles.monthSelector}>
            <Pressable
              disabled={monthIdx >= MONTHS.length - 1}
              onPress={() => setMonthIdx((p) => Math.min(MONTHS.length - 1, p + 1))}
              style={[styles.arrowBtn, monthIdx >= MONTHS.length - 1 && { opacity: 0.3 }]}
            >
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[monthIdx]}</Text>
            <Pressable
              disabled={monthIdx <= 0}
              onPress={() => setMonthIdx((p) => Math.max(0, p - 1))}
              style={[styles.arrowBtn, monthIdx <= 0 && { opacity: 0.3 }]}
            >
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          {/* Growth Badge */}
          <View style={styles.growthBadge}>
            <Text style={styles.growthText}>📈 +18% growth vs previous month</Text>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Earned</Text>
              <Text style={[styles.metricVal, { color: colors.teal }]}>₹48,500</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Sessions</Text>
              <Text style={styles.metricVal}>142</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg / Session</Text>
              <Text style={styles.metricVal}>₹341</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TDS Deducted (10%)</Text>
              <Text style={[styles.metricVal, { color: '#D97706' }]}>₹4,850</Text>
            </View>
          </View>

          {/* Weekly Bar Chart */}
          <Text style={styles.sectionLabel}>📊 Weekly Breakdown</Text>
          <View style={styles.chartCard}>
            {[
              { week: 'Week 1', val: '₹9,200', pct: 45 },
              { week: 'Week 2', val: '₹14,100', pct: 70 },
              { week: 'Week 3', val: '₹18,700', pct: 95 },
              { week: 'Week 4', val: '₹6,500', pct: 32 },
            ].map((w) => (
              <View key={w.week} style={styles.barCol}>
                <Text style={styles.barVal}>{w.val}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${w.pct}%` }]} />
                </View>
                <Text style={styles.barLabel}>{w.week}</Text>
              </View>
            ))}
          </View>

          {/* Recent Consultations Log */}
          <Text style={styles.sectionLabel}>📑 Recent Consultation Credits</Text>
          <View style={styles.logCard}>
            {TRANSACTIONS.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.txRow,
                  idx < TRANSACTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(191,219,254,0.4)' },
                ]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.seekerName}>{tx.seeker}</Text>
                  <Text style={styles.txMeta}>⏱️ {tx.duration} · {tx.date}</Text>
                </View>
                <Text style={styles.txAmount}>+{formatCurrency(tx.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Download PDF Button */}
          <Pressable onPress={handleDownloadPDF} style={({ pressed }) => [styles.pdfBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.pdfBtnText}>📄 Download Official Statement (PDF)</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  arrowBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 22, fontWeight: '800', color: colors.teal, marginTop: -2 },
  monthText: { fontSize: 16, fontWeight: '800', color: colors.text },
  growthBadge: {
    backgroundColor: 'rgba(5,150,105,0.1)', borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'center', borderWidth: 1, borderColor: 'rgba(5,150,105,0.3)',
  },
  growthText: { color: colors.teal, fontWeight: '800', fontSize: 13 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: radius.md, padding: spacing.md, gap: 4,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  metricLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  metricVal: { fontSize: 18, fontWeight: '900', color: colors.text },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
  chartCard: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 170,
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
  },
  barCol: { alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: 60, gap: 4 },
  barVal: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  barTrack: { width: 24, height: 100, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: colors.teal, borderRadius: 12 },
  barLabel: { fontSize: 11, fontWeight: '700', color: colors.text },
  logCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)', overflow: 'hidden',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  seekerName: { fontSize: 14, fontWeight: '800', color: colors.text },
  txMeta: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  txAmount: { fontSize: 15, fontWeight: '900', color: colors.teal },
  pdfBtn: {
    backgroundColor: colors.teal, borderRadius: radius.lg, padding: 16, alignItems: 'center',
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  pdfBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
