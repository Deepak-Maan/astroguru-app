/**
 * AstroGuru — Astrotalk Astrologer Consultation Directory
 * Filter by Vedic, Tarot, Love, Career, with instant Chat & Call buttons
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AstrotalkHeader } from '../../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkAstrologerCard } from '../../src/components/astrotalk/AstrotalkAstrologerCard';
import { AstrotalkRechargeModal } from '../../src/components/astrotalk/AstrotalkRechargeModal';
import { colors, radius, spacing } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Astrologer } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { fetchJyotishisFromFirebase } from '../../src/services/firebaseAuthService';
import { AcharyaChatCenter } from '../../src/components/workstation/AcharyaChatCenter';

const CATEGORIES = [
  { id: 'All', label: '🌟 All' },
  { id: 'Online', label: '🟢 Online Now' },
  { id: 'Vedic', label: '🪐 Vedic' },
  { id: 'Tarot', label: '🃏 Tarot' },
  { id: 'Love', label: '💖 Love & Match' },
  { id: 'Career', label: '💼 Career & Money' },
  { id: 'Numerology', label: '🔢 Numerology' },
  { id: 'Vastu', label: '🏛️ Vastu' },
];

type SortType = 'popular' | 'rating' | 'price_low' | 'exp';

export default function Consult() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);

  // If logged in as Certified Astrologer / Jyotishi, render dedicated Acharya Live Chat Center
  if (authUser?.role === 'astrologer') {
    return <AcharyaChatCenter />;
  }

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<SortType>('popular');
  const [astrologersList, setAstrologersList] = useState<Astrologer[]>(ASTROLOGERS);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

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
            reviewsCount: a.reviews || 1,
            pricing: {
              chatPerMin: a.pricePerMin || 25,
              callPerMin: a.pricePerMin ? a.pricePerMin + 5 : 30,
              report: 299,
            },
            experience: a.experienceYears || 10,
            specialties: a.specialties || ['Vedic Astrology'],
            languages: a.languages || ['Hindi', 'English'],
            consultationsCount: a.consultations || 1400,
            online: a.online ?? true,
            bio: a.about || 'Certified Vedic Jyotish Expert',
          }));
          const existingIds = new Set(remoteList.map((r) => r.id));
          const localOnly = ASTROLOGERS.filter((l) => !existingIds.has(l.id));
          setAstrologersList([...remoteList, ...localOnly]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return astrologersList
      .filter((a) => {
        // Query search
        if (query.trim().length > 0) {
          const q = query.toLowerCase();
          const matchesName = a.name.toLowerCase().includes(q);
          const matchesSpecialty = a.specialties.some((s) => s.toLowerCase().includes(q));
          const matchesLang = a.languages.some((l) => l.toLowerCase().includes(q));
          if (!matchesName && !matchesSpecialty && !matchesLang) return false;
        }

        // Category filter
        if (filter === 'Online') return a.online;
        if (filter === 'Vedic') return a.specialties.some((s) => s.toLowerCase().includes('vedic'));
        if (filter === 'Tarot') return a.specialties.some((s) => s.toLowerCase().includes('tarot'));
        if (filter === 'Love')
          return a.specialties.some((s) => s.toLowerCase().includes('love') || s.toLowerCase().includes('relationship'));
        if (filter === 'Career')
          return a.specialties.some((s) => s.toLowerCase().includes('career') || s.toLowerCase().includes('finance'));
        if (filter === 'Numerology')
          return a.specialties.some((s) => s.toLowerCase().includes('numerology'));
        if (filter === 'Vastu')
          return a.specialties.some((s) => s.toLowerCase().includes('vastu'));

        return true;
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'price_low') return a.pricing.chatPerMin - b.pricing.chatPerMin;
        if (sort === 'exp') return b.experience - a.experience;
        return (b.consultationsCount || 0) - (a.consultationsCount || 0);
      });
  }, [astrologersList, query, filter, sort]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Astrotalk Fixed Header */}
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        {/* Search & Sort Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              placeholder="Search Astrologer, Tarot, Vedic, Love…"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Text style={{ fontSize: 14, color: '#9CA3AF' }}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const active = filter === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    try {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    } catch (_) {}
                    setFilter(cat.id);
                  }}
                  style={[styles.catPill, active && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Sort Header */}
        <View style={styles.sortHeader}>
          <Text style={styles.countText}>
            Showing <Text style={{ fontWeight: '900', color: '#1A1A1A' }}>{filtered.length}</Text> Verified Astrologers
          </Text>

          <View style={styles.sortRow}>
            <Pressable
              onPress={() => setSort(sort === 'rating' ? 'price_low' : 'rating')}
              style={styles.sortBtn}
            >
              <Text style={styles.sortBtnText}>
                {sort === 'rating' ? '⭐ Rating' : sort === 'price_low' ? '💎 Price' : '🔥 Popular'} ▾
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Astrologers List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => <AstrotalkAstrologerCard astrologer={item} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No Astrologers Found</Text>
              <Text style={styles.emptySub}>Try searching for a different skill or name.</Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* Recharge Modal */}
      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  catPill: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  catPillActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  catPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  catPillTextActive: {
    color: '#D97706',
    fontWeight: '900',
  },
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
  },
});
