import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';

const FILTERS = ['All', 'Online', 'Vedic', 'Tarot', 'Numerology', 'Love', 'Career', 'Remedies'];

type Sort = 'popular' | 'rating' | 'price';
const SORTS: { id: Sort; label: string; icon: string }[] = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'rating', label: 'Top Rated', icon: '⭐' },
  { id: 'price', label: 'Cheapest', icon: '💸' },
];

export default function Consult() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<Sort>('popular');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = ASTROLOGERS.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.specialties.some((s) => s.toLowerCase().includes(q)) ||
        a.languages.some((l) => l.toLowerCase().includes(q));
      const matchF =
        filter === 'All' ||
        (filter === 'Online' ? a.online : a.specialties.some((s) => s === filter));
      return matchQ && matchF;
    });
    out = [...out].sort((x, y) => {
      if (sort === 'rating') return y.rating - x.rating;
      if (sort === 'price') return x.pricePerMin - y.pricePerMin;
      return y.consultations - x.consultations;
    });
    return out.sort((x, y) => Number(y.online) - Number(x.online));
  }, [query, filter, sort]);

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
        <LinearGradient
          colors={['rgba(61,220,132,0.18)', 'rgba(61,220,132,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
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
                    colors={[colors.auroraA, colors.auroraB]}
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
                    colors={['rgba(122,60,255,0.55)', 'rgba(194,75,255,0.35)']}
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
                Consultations are simulated in this build — no real astrologer is contacted and
                no real money is charged.
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
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 44,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14.5, paddingVertical: 0 },
  clearBtn: { fontSize: 12, color: colors.textFaint, paddingHorizontal: 4 },

  /* Online banner */
  onlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(61,220,132,0.28)',
    overflow: 'hidden',
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
  },
  onlineText: { ...typography.small, color: colors.textMuted, fontSize: 13, flex: 1 },
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
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  filterChipActive: {
    borderColor: colors.auroraA,
  },
  filterChipText: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  filterChipTextActive: { color: colors.white },

  /* Sort */
  sortWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sortLabel: { ...typography.tiny, color: colors.textFaint, fontWeight: '700' },
  sortPills: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sortPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  sortPillActive: {},
  sortPillText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  sortPillTextActive: { color: colors.white },

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
