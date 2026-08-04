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
          colors={['rgba(16,185,129,0.18)', 'rgba(245,158,11,0.04)']}
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
                    colors={[colors.teal, colors.saffron]}
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
    backgroundColor: '#0E1726',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    height: 46,
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.30)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
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
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    borderColor: colors.saffron,
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
    backgroundColor: '#080E1A',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
