/**
 * AstroGuru — Complete Astrotalk Home Screen & Consultation Hub
 * Matching the exact UI & functioning architecture of https://astrotalk.com
 */

import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AstrotalkHeader } from '../../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkFreeConsultBanner } from '../../src/components/astrotalk/AstrotalkFreeConsultBanner';
import { AstrotalkHeroBannerCarousel } from '../../src/components/astrotalk/AstrotalkHeroBannerCarousel';
import { AstrotalkCorePillars } from '../../src/components/astrotalk/AstrotalkCorePillars';
import { AstrotalkFreeServicesGrid } from '../../src/components/astrotalk/AstrotalkFreeServicesGrid';
import { AstrotalkFortuneWheelBanner } from '../../src/components/astrotalk/AstrotalkFortuneWheelBanner';
import { AstrotalkAstrologerCard } from '../../src/components/astrotalk/AstrotalkAstrologerCard';
import { AstrotalkVideoTestimonials } from '../../src/components/astrotalk/AstrotalkVideoTestimonials';
import { AstrotalkRechargeModal } from '../../src/components/astrotalk/AstrotalkRechargeModal';
import { LuckyThreeWidget } from '../../src/components/widgets/LuckyThreeWidget';
import { DailySankalpAudioCard } from '../../src/components/widgets/DailySankalpAudioCard';
import { DoshaBadgesWidget } from '../../src/components/widgets/DoshaBadgesWidget';
import { ReferralCard } from '../../src/components/widgets/ReferralCard';
import { InstantMatchmakerModal } from '../../src/components/widgets/InstantMatchmakerModal';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { ASTROLOGERS } from '../../src/data/astrologers';

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);

  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [matchmakerVisible, setMatchmakerVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'vedic' | 'tarot' | 'love' | 'career'>('all');

  // If logging out or unauthenticated
  if (!isAuthenticated || !authUser) {
    return <View style={{ flex: 1, backgroundColor: '#F7F8FA' }} />;
  }

  // Admin view -> Redirect to Admin Panel immediately
  if (authUser?.role === 'admin') {
    router.replace('/admin');
    return <View style={{ flex: 1, backgroundColor: '#F7F8FA' }} />;
  }

  const onlineAstrologers = ASTROLOGERS.filter((a) => a.online);
  const filteredAstrologers = ASTROLOGERS.filter((a) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'vedic') return a.specialties.some((s) => s.toLowerCase().includes('vedic'));
    if (selectedFilter === 'tarot') return a.specialties.some((s) => s.toLowerCase().includes('tarot'));
    if (selectedFilter === 'love') return a.specialties.some((s) => s.toLowerCase().includes('relationship') || s.toLowerCase().includes('love'));
    if (selectedFilter === 'career') return a.specialties.some((s) => s.toLowerCase().includes('career') || s.toLowerCase().includes('finance'));
    return true;
  });

  const FILTERS = [
    { id: 'all', label: 'All Astrologers' },
    { id: 'vedic', label: '🕉️ Vedic' },
    { id: 'tarot', label: '🃏 Tarot' },
    { id: 'love', label: '💖 Love & Marriage' },
    { id: 'career', label: '💼 Career' },
  ];

  return (
    <View style={styles.rootContainer}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Astrotalk Fixed Header */}
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Promotional Carousel */}
          <AstrotalkHeroBannerCarousel />

          {/* Today's Lucky 3: Number, Color & Shubh Muhurat */}
          <LuckyThreeWidget />

          {/* New User Free Consultation Countdown Banner */}
          <AstrotalkFreeConsultBanner />

          {/* 1-Tap Instant Matchmaker Floating Trigger Banner */}
          <View style={{ paddingHorizontal: 16, marginTop: 4, marginBottom: 8 }}>
            <Pressable
              onPress={() => {
                try {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (_) {}
                setMatchmakerVisible(true);
              }}
              style={({ pressed }) => [styles.instantMatchBanner, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}
            >
              <LinearGradient
                colors={['#1E1B4B', '#312E81', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.instantMatchLeft}>
                <View style={styles.instantMatchIconBubble}>
                  <Text style={{ fontSize: 20 }}>⚡</Text>
                </View>
                <View>
                  <Text style={styles.instantMatchTitle}>1-Tap Instant Connect</Text>
                  <Text style={styles.instantMatchSub}>Auto-match top available Astrologer in 10s</Text>
                </View>
              </View>

              <View style={styles.instantMatchCta}>
                <Text style={styles.instantMatchCtaText}>Match ➔</Text>
              </View>
            </Pressable>
          </View>

          {/* 4 Core Astrotalk Pillars (Chat, Call, Live, Store) */}
          <AstrotalkCorePillars />

          {/* 10-Grid Astrotalk Free Services */}
          <AstrotalkFreeServicesGrid />

          {/* Daily Morning Sankalp & Gayatri Mantra Audio Card */}
          <DailySankalpAudioCard />

          {/* Daily Cosmic Fortune Wheel Banner */}
          <AstrotalkFortuneWheelBanner />

          {/* Kundli Dosha Health Badges (Manglik, Kaal Sarp, Sade Sati, Pitra) */}
          <DoshaBadgesWidget />

          {/* Astrologers Online Now Horizontal Scroller */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>🔴 Astrologers Online Now</Text>
              <Text style={styles.sectionSub}>Instant connection in 30 seconds</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/consult')}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.viewAllText}>View All ›</Text>
            </Pressable>
          </View>

          <FlatList
            data={onlineAstrologers}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <AstrotalkAstrologerCard astrologer={item} compact />
            )}
          />

          {/* Daily Panchang & Auspicious Muhurat Ribbon Card */}
          <Pressable
            onPress={() => router.push('/panchang')}
            style={({ pressed }) => [
              styles.panchangCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
          >
            <LinearGradient
              colors={['#FFFBEB', '#FEF3C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.panchangLeft}>
              <Text style={{ fontSize: 28 }}>🌅</Text>
              <View>
                <Text style={styles.panchangTitle}>Today's Panchang & Shubh Muhurat</Text>
                <Text style={styles.panchangDetails}>
                  Shukla Dashami • Pushya Nakshatra • Rahu Kaal: 4:30 PM
                </Text>
              </View>
            </View>
            <Text style={styles.panchangArrow}>➔</Text>
          </Pressable>

          {/* Refer & Earn ₹50 Viral Card */}
          <ReferralCard />

          {/* Filterable Astrologer Directory Feed */}
          <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
            <View>
              <Text style={styles.sectionTitle}>⭐ Top Rated Acharyas</Text>
              <Text style={styles.sectionSub}>Verified Vedic Gurus & Tarot Masters</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsContainer}
          >
            {FILTERS.map((f) => {
              const active = selectedFilter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => {
                    try {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    } catch (_) {}
                    setSelectedFilter(f.id as any);
                  }}
                  style={[
                    styles.filterPill,
                    active && styles.filterPillActive,
                  ]}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Astrologers List Items */}
          {filteredAstrologers.map((astrologer) => (
            <AstrotalkAstrologerCard key={astrologer.id} astrologer={astrologer} />
          ))}

          {/* Devotee Stories & Video Testimonials */}
          <AstrotalkVideoTestimonials />

          {/* Bottom Space for Floating Tab Bar */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Instant Recharge Modal */}
      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />

      {/* 1-Tap Instant Astrologer Matchmaker Modal */}
      <InstantMatchmakerModal
        visible={matchmakerVisible}
        onClose={() => setMatchmakerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  panchangCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  panchangLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  panchangTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  panchangDetails: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  panchangArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
    marginLeft: 8,
  },
  filterPillsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  filterPillActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#D97706',
    fontWeight: '900',
  },
  instantMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    overflow: 'hidden',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  instantMatchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  instantMatchIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  instantMatchTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  instantMatchSub: {
    fontSize: 11,
    color: '#FCD34D',
    fontWeight: '600',
    marginTop: 1,
  },
  instantMatchCta: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  instantMatchCtaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
});
