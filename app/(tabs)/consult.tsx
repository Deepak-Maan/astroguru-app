import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { AstrologerCard } from '../../src/components/AstrologerCard';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Card } from '../../src/components/Card';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Astrologer } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { useJyotishiStore } from '../../src/store/jyotishiStore';
import { formatCurrency } from '../../src/utils';

const FILTERS = ['All', 'Online', 'Vedic', 'Tarot', 'Numerology', 'Love', 'Career', 'Remedies'];

type Sort = 'popular' | 'rating' | 'price';
const SORTS: { id: Sort; label: string; icon: string }[] = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'rating', label: 'Top Rated', icon: '⭐' },
  { id: 'price', label: 'Cheapest', icon: '💸' },
];

const EARNINGS_HISTORY = [
  { id: '1', date: 'Today', sessions: 14, amount: 4850, status: 'credited' },
  { id: '2', date: 'Yesterday', sessions: 11, amount: 3960, status: 'credited' },
  { id: '3', date: '06 Aug 2026', sessions: 16, amount: 5400, status: 'credited' },
  { id: '4', date: '05 Aug 2026', sessions: 9, amount: 2800, status: 'credited' },
  { id: '5', date: '04 Aug 2026', sessions: 13, amount: 4320, status: 'credited' },
  { id: '6', date: '03 Aug 2026', sessions: 18, amount: 6200, status: 'credited' },
];

function AcharyaPayouts() {
  const payoutBalance = useJyotishiStore((s) => s.payoutBalance);
  const todayEarnings = useJyotishiStore((s) => s.todayEarnings);
  const completedCount = useJyotishiStore((s) => s.completedCount);
  const withdrawPayout = useJyotishiStore((s) => s.withdrawPayout);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const totalEarned = EARNINGS_HISTORY.reduce((s, e) => s + e.amount, 0);

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;
    const ok = withdrawPayout(amt);
    if (ok) {
      setShowWithdraw(false);
      setWithdrawAmount('');
      Alert.alert('✅ Withdrawal Initiated', `₹${amt.toLocaleString('en-IN')} will be credited to your bank within 24 hours.`);
    } else {
      Alert.alert('Insufficient Balance', 'Withdrawal amount exceeds available payout balance.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Payouts & Earnings" subtitle="Acharya earnings dashboard" />

        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} showsVerticalScrollIndicator={false}>

          {/* Summary Cards Row */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={[payStyles.statCard, { flex: 1 }]}>
              <Text style={payStyles.statValue}>₹{totalEarned.toLocaleString('en-IN')}</Text>
              <Text style={payStyles.statLabel}>Total Earned</Text>
            </View>
            <View style={[payStyles.statCard, { flex: 1 }]}>
              <Text style={payStyles.statValue}>₹{payoutBalance.toLocaleString('en-IN')}</Text>
              <Text style={payStyles.statLabel}>Payout Balance</Text>
            </View>
          </View>

          {/* Today Snapshot */}
          <View style={payStyles.todayCard}>
            <View>
              <Text style={payStyles.todayLabel}>📅 Today's Earnings</Text>
              <Text style={payStyles.todayAmount}>₹{todayEarnings.toLocaleString('en-IN')}</Text>
              <Text style={payStyles.todaySub}>{completedCount} sessions completed · ₹25/min rate</Text>
            </View>
            <Pressable style={payStyles.withdrawBtn} onPress={() => setShowWithdraw(true)}>
              <Text style={payStyles.withdrawBtnText}>💳 Withdraw</Text>
            </Pressable>
          </View>

          {/* Payout Schedule */}
          <Card padded>
            <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800', marginBottom: spacing.sm }}>📆 Payout Schedule</Text>
            {[{day: 'Monday', amt: '₹3,200'}, {day: 'Wednesday', amt: '₹4,100'}, {day: 'Friday', amt: '₹5,800'}].map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < 2 ? 1 : 0, borderColor: 'rgba(191,219,254,0.4)' }}>
                <Text style={{ ...typography.body, color: colors.text, fontWeight: '700' }}>{p.day}</Text>
                <Text style={{ ...typography.body, color: colors.teal, fontWeight: '800' }}>{p.amt}</Text>
              </View>
            ))}
          </Card>

          {/* Earnings History */}
          <SectionHeader title="📊 Earnings History" subtitle="Daily breakdown" />
          {EARNINGS_HISTORY.map((entry) => (
            <View key={entry.id} style={payStyles.historyRow}>
              <View>
                <Text style={{ ...typography.h3, color: colors.text, fontWeight: '700' }}>{entry.date}</Text>
                <Text style={{ ...typography.tiny, color: colors.textMuted }}>{entry.sessions} sessions</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ ...typography.h3, color: colors.teal, fontWeight: '800' }}>₹{entry.amount.toLocaleString('en-IN')}</Text>
                <Text style={{ ...typography.tiny, color: '#10B981', fontWeight: '700' }}>✅ {entry.status}</Text>
              </View>
            </View>
          ))}

          {/* Bank Details */}
          <Card padded>
            <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800', marginBottom: spacing.sm }}>🏦 Bank Account Linked</Text>
            <Text style={{ ...typography.body, color: colors.textMuted }}>HDFC Bank · ••••5678</Text>
            <Text style={{ ...typography.tiny, color: colors.teal, marginTop: 4, fontWeight: '700' }}>Verified · UPI: acharya@hdfc</Text>
          </Card>
        </ScrollView>

        {/* Withdraw Modal */}
        <Modal visible={showWithdraw} transparent animationType="slide" onRequestClose={() => setShowWithdraw(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.5)' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.md }}>
              <Text style={{ ...typography.h2, color: colors.text, fontWeight: '800' }}>💳 Withdraw Payout</Text>
              <Text style={{ ...typography.body, color: colors.textMuted }}>Available: ₹{payoutBalance.toLocaleString('en-IN')}</Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.textFaint}
                style={{ borderWidth: 1.5, borderColor: 'rgba(191,219,254,0.8)', borderRadius: radius.md, padding: 14, fontSize: 18, fontWeight: '700', color: colors.text, backgroundColor: '#F8FAFC' }}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Pressable onPress={() => setShowWithdraw(false)} style={{ flex: 1, padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.teal, alignItems: 'center' }}>
                  <Text style={{ color: colors.teal, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleWithdraw} style={{ flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.teal, alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Withdraw Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const payStyles = StyleSheet.create({
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.6)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  todayCard: {
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700' },
  todayAmount: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  todaySub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  withdrawBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  historyRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.5)',
  },
});

export default function Consult() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<Sort>('popular');
  const [astrologersList, setAstrologersList] = useState<Astrologer[]>(ASTROLOGERS);

  useEffect(() => {
    fetch('http://localhost:5000/api/astrologers')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.astrologers)) {
          const remoteList: Astrologer[] = data.astrologers.map((a: any) => ({
            id: a.id,
            name: a.name,
            avatar: a.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
            rating: a.rating || 5.0,
            reviews: a.reviews || 1,
            pricePerMin: a.pricePerMin || 25,
            experienceYears: a.experienceYears || 10,
            specialties: a.specialties || ['Vedic Astrology'],
            languages: a.languages || ['Hindi', 'English'],
            consultations: a.consultations || 0,
            online: a.online ?? true,
            about: a.about || 'Certified Vedic Jyotish Expert',
          }));

          // Merge without duplicate IDs
          const existingIds = new Set(remoteList.map((r) => r.id));
          const localOnly = ASTROLOGERS.filter((l) => !existingIds.has(l.id));
          setAstrologersList([...remoteList, ...localOnly]);
        }
      })
      .catch(() => {});
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = astrologersList.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.specialties.some((s: string) => s.toLowerCase().includes(q)) ||
        a.languages.some((l: string) => l.toLowerCase().includes(q));
      const matchF =
        filter === 'All' ||
        (filter === 'Online' ? a.online : a.specialties.some((s: string) => s === filter));
      return matchQ && matchF;
    });
    out = [...out].sort((x, y) => {
      if (sort === 'rating') return y.rating - x.rating;
      if (sort === 'price') return x.pricePerMin - y.pricePerMin;
      return y.consultations - x.consultations;
    });
    return out.sort((x, y) => Number(y.online) - Number(x.online));
  }, [query, filter, sort, astrologersList]);

  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (authUser?.role === 'astrologer') return <AcharyaPayouts />;

  const onlineCount = ASTROLOGERS.filter((a) => a.online).length;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, specialty or language"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Online banner ── */}
      <View style={styles.onlineBanner}>
        <View style={styles.onlinePulse} />
        <Text style={styles.onlineText}>
          <Text style={styles.onlineCount}>{onlineCount} experts</Text>
          {'  '}available for instant consultation
        </Text>
      </View>

      {/* ── Filter chips (horizontal scroll) ── */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStrip}
          style={{ flexGrow: 0 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {active && (
                  <LinearGradient
                    colors={[colors.saffron, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Sort tabs ── */}
      <View style={styles.sortWrap}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <View style={styles.sortPills}>
          {SORTS.map((s) => {
            const active = sort === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSort(s.id)}
                style={[styles.sortPill, active && styles.sortPillActive]}
              >
                {active && (
                  <LinearGradient
                    colors={[colors.teal, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.sortPillText, active && styles.sortPillTextActive]}>
                  {s.icon} {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Consult"
          subtitle={`${onlineCount} of ${ASTROLOGERS.length} experts online`}
          showWallet
        />

        {list.length === 0 ? (
          <View style={{ flex: 1 }}>
            {renderHeader()}
            <EmptyState
              icon="🔭"
              title="No astrologers found"
              message="Try a different search term or clear the filters."
              actionLabel="Clear filters"
              onAction={() => { setQuery(''); setFilter('All'); }}
            />
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(a) => a.id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: a }) => (
              <AstrologerCard
                astrologer={a}
                onPress={() => router.push(`/astrologer/${a.id}`)}
              />
            )}
            ListFooterComponent={
              <Text style={styles.note}>
                Consultations are simulated in this build for demonstration.
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: spacing.sm,
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#DFE6F0',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(163, 177, 198, 0.4)',
    height: 46,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14.5, paddingVertical: 0, fontWeight: '600' },
  clearBtn: { fontSize: 14, color: colors.textFaint, paddingHorizontal: 4, fontWeight: '700' },

  /* Online banner */
  onlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    backgroundColor: '#E6ECF5',
    overflow: 'hidden',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
  },
  onlineText: { ...typography.small, color: colors.textMuted, fontSize: 13, flex: 1, fontWeight: '600' },
  onlineCount: { color: colors.online, fontWeight: '800' },

  /* Filter chips */
  filterWrapper: {
    marginBottom: spacing.md,
    height: 38,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
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
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  filterChipActive: {
    borderColor: colors.gold,
  },
  filterChipText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  filterChipTextActive: { color: colors.white, fontWeight: '800' },

  /* Sort */
  sortWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sortLabel: { ...typography.tiny, color: colors.textFaint, fontWeight: '800' },
  sortPills: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#E6ECF5',
    borderRadius: radius.pill,
    padding: 3,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.4)',
    borderRightColor: 'rgba(163, 177, 198, 0.4)',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  sortPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  sortPillActive: {},
  sortPillText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  sortPillTextActive: { color: colors.white, fontWeight: '800' },

  /* List */
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  note: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 15,
  },
});
