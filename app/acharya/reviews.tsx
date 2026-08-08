import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Avatar } from '../../src/components/Avatar';
import { colors, radius, spacing, typography } from '../../src/theme';

const REVIEWS = [
  { id: '1', name: 'Rahul M.', date: '02 Aug 2026', stars: 5, text: 'Bahut achhe Acharya ji! Mera career reading ekdum sahi nikla. Dasha period ke baare mein jo bataya woh 100% sach hua. Highly recommended! 🙏', verified: true },
  { id: '2', name: 'Priya K.', date: '29 Jul 2026', stars: 5, text: 'Excellent guidance on my marriage timing. The Kundli analysis was very detailed and accurate. Acharya ji explained everything in simple language. Will consult again!', verified: true },
  { id: '3', name: 'Amit S.', date: '25 Jul 2026', stars: 5, text: 'Sach mein bahut gyaani astrologer hain. Business mein loss ho raha tha, unhone Lal Kitab remedy batai aur ab situation better ho rahi hai. Shukriya Acharya ji!', verified: true },
  { id: '4', name: 'Sunita R.', date: '20 Jul 2026', stars: 4, text: 'Very knowledgeable and patient. Explained my Saturn dasha in detail. Took time to understand my concerns. Minor delay in session start but overall great experience.', verified: true },
  { id: '5', name: 'Deepak V.', date: '15 Jul 2026', stars: 5, text: 'The gemstone recommendation was spot on! After wearing Yellow Sapphire as advised, I got a promotion within 6 weeks. Acharya ji is truly blessed with divine knowledge. 🌟', verified: true },
  { id: '6', name: 'Meera T.', date: '10 Jul 2026', stars: 5, text: 'Best astrologer on the platform! Health issue prediction was very accurate. The Hanuman Chalisa remedy has been helping me a lot. God bless you Acharya ji 🙏', verified: true },
  { id: '7', name: 'Vikram P.', date: '05 Jul 2026', stars: 4, text: 'Good session, accurate predictions about foreign travel. Would have given 5 stars but session was a bit short. Will definitely consult again for yearly prediction.', verified: true },
  { id: '8', name: 'Anjali G.', date: '01 Jul 2026', stars: 3, text: 'Decent reading. Some predictions were accurate but some didn\'t resonate. The remedies suggested were simple and doable. Neutral experience overall.', verified: true },
];

const STAR_BREAKDOWN = [
  { stars: 5, pct: 87 },
  { stars: 4, pct: 10 },
  { stars: 3, pct: 2 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

function StarRow({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 12, color: i < count ? '#F59E0B' : '#CBD5E1' }}>★</Text>
      ))}
    </View>
  );
}

export default function Reviews() {
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3>('all');

  const filtered = filter === 'all' ? REVIEWS : REVIEWS.filter((r) => r.stars === filter);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Client Reviews" subtitle="4,200+ verified consultations" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Rating Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.ratingBig}>
              <Text style={styles.ratingNum}>4.95</Text>
              <Text style={styles.ratingStar}>★</Text>
            </View>
            <Text style={styles.ratingTotal}>from 4,200+ verified reviews</Text>

            <View style={styles.breakdown}>
              {STAR_BREAKDOWN.map((row) => (
                <View key={row.stars} style={styles.breakdownRow}>
                  <Text style={styles.breakdownStarLabel}>{row.stars}★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${row.pct}%` }]} />
                  </View>
                  <Text style={styles.breakdownPct}>{row.pct}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            {(['all', 5, 4, 3] as const).map((f) => (
              <Pressable
                key={String(f)}
                onPress={() => setFilter(f)}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
              >
                <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                  {f === 'all' ? 'All' : `${f}★`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Review Cards */}
          {filtered.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar name={review.name} size={38} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    {review.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedBadgeText}>✅ Verified</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    <StarRow count={review.stars} />
                    <Text style={styles.reviewDate}>· {review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl, padding: spacing.lg,
    alignItems: 'center', gap: 8,
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 3,
  },
  ratingBig: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  ratingNum: { fontSize: 48, fontWeight: '900', color: colors.text, lineHeight: 54 },
  ratingStar: { fontSize: 36, color: '#F59E0B', lineHeight: 50 },
  ratingTotal: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  breakdown: { width: '100%', gap: 6, marginTop: 8 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownStarLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700', width: 22 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },
  breakdownPct: { fontSize: 12, color: colors.textMuted, fontWeight: '700', width: 30, textAlign: 'right' },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterTab: {
    flex: 1, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: '#FFFFFF',
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(191,219,254,0.6)',
  },
  filterTabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterTabText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  filterTabTextActive: { color: '#FFFFFF' },
  reviewCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.4)',
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  reviewerName: { fontSize: 14, fontWeight: '800', color: colors.text },
  verifiedBadge: { backgroundColor: 'rgba(5,150,105,0.1)', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedBadgeText: { fontSize: 10, color: colors.teal, fontWeight: '800' },
  reviewDate: { fontSize: 11, color: colors.textFaint },
  reviewText: { fontSize: 13, color: colors.text, lineHeight: 20, fontWeight: '500' },
});
