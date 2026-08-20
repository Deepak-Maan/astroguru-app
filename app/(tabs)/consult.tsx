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
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
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
import { fetchJyotishisFromFirebase } from '../../src/services/firebaseAuthService';
import { AcharyaChatCenter } from '../../src/components/workstation/AcharyaChatCenter';

const CATEGORIES = [
  { id: 'All', label: '🌟 All' },
  { id: 'Instant', label: '⚡ 0m Wait' },
  { id: 'Online', label: '🟢 Online Now' },
  { id: 'Vedic', label: '🪐 Vedic Jyotish' },
  { id: 'Tarot', label: '🃏 Tarot' },
  { id: 'Numerology', label: '🔢 Numerology' },
  { id: 'Love', label: '❤️ Love & Match' },
  { id: 'Career', label: '💼 Career' },
  { id: 'Remedies', label: '🪔 Remedies' },
];

type Sort = 'popular' | 'rating' | 'price';
const SORTS: { id: Sort; label: string; icon: string }[] = [
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'rating', label: 'Top Rated', icon: '⭐' },
  { id: 'price', label: 'Best Price', icon: '💎' },
];

export default function Consult() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If logged in as Certified Astrologer / Jyotishi, render dedicated Acharya Live Chat Center
  if (authUser?.role === 'astrologer') {
    return <AcharyaChatCenter />;
  }

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<Sort>('popular');
  const [astrologersList, setAstrologersList] = useState<Astrologer[]>(ASTROLOGERS);

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchJyotishisFromFirebase()
      .then((firebaseList) => {
        if (firebaseList && firebaseList.length > 0) {
          const remoteList: Astrologer[] = firebaseList.map((a: any) => ({
            id: a.id,
            name: a.name,
            avatar:
              a.avatar ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
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
        (filter === 'Instant'
          ? a.online
          : filter === 'Online'
          ? a.online
          : a.specialties.some((s: string) => s.toLowerCase().includes(filter.toLowerCase())));
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

  const onlineCount = astrologersList.filter((a) => a.online).length;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* ── Luminous Search Bar ── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Vedic Astrologer, Tarot or Remedy..."
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
        {!!query && (
          <Pressable
            onPress={() => {
              triggerHaptic();
              setQuery('');
            }}
            hitSlop={8}
            style={styles.clearBtnWrap}
          >
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Live Astrologer Pulse Beacon Banner ── */}
      <View style={styles.onlineBanner}>
        <View style={styles.beaconWrap}>
          <View style={styles.beaconOuter} />
          <View style={styles.beaconDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.onlineTitle}>
            <Text style={styles.onlineCount}>{onlineCount} Vedic Acharyas</Text> Active Online
          </Text>
          <Text style={styles.onlineSubtitle}>⚡ Instant 1-Tap Audio / Video · 0 min wait time</Text>
        </View>
        <View style={styles.secureBadge}>
          <Text style={styles.secureBadgeText}>🔒 100% Private</Text>
        </View>
      </View>

      {/* ── Category Filter Chips ── */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStrip}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((c) => {
            const active = filter === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  triggerHaptic();
                  setFilter(c.id);
                }}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {active && (
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Sort Segmented Control ── */}
      <View style={styles.sortWrap}>
        <Text style={styles.sortLabel}>SORT BY</Text>
        <View style={styles.sortPills}>
          {SORTS.map((s) => {
            const active = sort === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  triggerHaptic();
                  setSort(s.id);
                }}
                style={[styles.sortPill, active && styles.sortPillActive]}
              >
                {active && (
                  <LinearGradient
                    colors={['#0F172A', '#1E1B4B']}
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
          subtitle={`${onlineCount} of ${astrologersList.length} experts online now`}
          showWallet
        />

        {list.length === 0 ? (
          <View style={{ flex: 1 }}>
            {renderHeader()}
            <EmptyState
              icon="🔭"
              title="No Astrologers Found"
              message="Try searching for another specialty, language, or clear the filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setQuery('');
                setFilter('All');
              }}
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
                🕉️ All Jyotishis & Acharyas are verified with 10+ years of Vedic experience.
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
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 10,
  },

  /* Search Wrap */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    height: 48,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    color: '#1E1B4B',
    fontSize: 13.5,
    paddingVertical: 0,
    fontWeight: '700',
  },
  clearBtnWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '900',
  },

  /* Online Live Beacon Banner */
  onlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  beaconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  beaconOuter: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  beaconDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#059669',
  },
  onlineTitle: {
    fontSize: 12.5,
    color: '#1E1B4B',
    fontWeight: '800',
  },
  onlineCount: {
    color: '#059669',
    fontWeight: '900',
  },
  onlineSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  secureBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  secureBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#047857',
  },

  /* Filter Chips */
  filterWrapper: {
    height: 38,
  },
  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    overflow: 'hidden',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    borderColor: 'transparent',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  filterChipText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* Sort Segmented Control */
  sortWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  sortLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sortPills: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  sortPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  sortPillActive: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sortPillText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 11,
  },
  sortPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* List */
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: 12,
  },
  note: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '600',
    lineHeight: 16,
  },
});
