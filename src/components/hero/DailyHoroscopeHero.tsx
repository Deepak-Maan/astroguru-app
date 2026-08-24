import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../../theme';
import { SpatialGlassCard } from '../SpatialGlassCard';
import { Rashi } from '../../types';
import { RASHIS } from '../../data/rashis';

interface Props {
  selectedRashi?: Rashi;
  onSelectRashi?: (rashi: Rashi) => void;
}

export function DailyHoroscopeHero({
  selectedRashi = RASHIS[0],
  onSelectRashi,
}: Props) {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<'today' | 'tomorrow' | 'month'>('today');

  const triggerHaptic = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
  };

  return (
    <SpatialGlassCard padded elevated borderGold tilt>
      <View style={styles.cardContent}>
        {/* Top Header: Period Selector Pill */}
        <View style={styles.topRow}>
          <View style={styles.periodPillContainer}>
            {(['today', 'tomorrow', 'month'] as const).map((period) => {
              const isActive = activePeriod === period;
              return (
                <Pressable
                  key={period}
                  onPress={() => {
                    triggerHaptic();
                    setActivePeriod(period);
                  }}
                  style={[styles.periodBtn, isActive && styles.periodBtnActive]}
                >
                  {isActive && (
                    <LinearGradient
                      colors={['#D4AF37', '#F5D77F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.periodText, isActive && styles.periodTextActive]}>
                    {period === 'today' ? 'Today' : period === 'tomorrow' ? 'Tomorrow' : 'This Month'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.luckBadge}>
            <Text style={styles.luckBadgeIcon}>⭐</Text>
            <Text style={styles.luckBadgeText}>9.4 / 10 Luck</Text>
          </View>
        </View>

        {/* Main Hero Body: 3D Embossed Crystal Zodiac Sphere & Constellation Badge */}
        <View style={styles.zodiacHeroRow}>
          {/* 3D Crystal Zodiac Sphere */}
          <View style={styles.sphereWrapper}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.zodiacSphere}
            >
              <View style={styles.sphereSpecularGlint} />
              <Text style={styles.zodiacGlyph}>{selectedRashi.symbol || '♈'}</Text>
            </LinearGradient>
            <View style={styles.sphereRings} />
          </View>

          {/* Zodiac Title & Element/Ruling Lord Badges */}
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.rashiName}>{selectedRashi.name}</Text>
              <Text style={styles.sanskritName}>({selectedRashi.sanskrit})</Text>
            </View>
            <Text style={styles.dateRange}>{selectedRashi.dates}</Text>

            <View style={styles.tagsRow}>
              <View style={styles.elementTag}>
                <Text style={styles.elementTagText}>🔥 {selectedRashi.element} Element</Text>
              </View>
              <View style={styles.lordTag}>
                <Text style={styles.lordTagText}>👑 Lord: {selectedRashi.ruler}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Astrological Insight Section with Crisp Slate Typography */}
        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTag}>🌟 CELESTIAL ALIGNMENT INSIGHT</Text>
            <Text style={styles.insightTithi}>Shukla Paksha · Pushya Nakshatra</Text>
          </View>
          <Text style={styles.insightContent}>
            Sun transits auspicious house bringing immense clarity in financial planning and family relationships. Ideal day to launch new initiatives or sign agreements during Abhijit Muhurta.
          </Text>
        </View>

        {/* Quick Astro Metric Chips */}
        <View style={styles.quickMetricsRow}>
          <View style={styles.metricChip}>
            <Text style={styles.metricChipLabel}>Lucky Color</Text>
            <Text style={styles.metricChipValue}>🟡 Imperial Gold</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricChipLabel}>Lucky Number</Text>
            <Text style={styles.metricChipValue}>✨ 3 & 7</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricChipLabel}>Auspicious Direction</Text>
            <Text style={styles.metricChipValue}>🧭 North-East</Text>
          </View>
        </View>

        {/* Full Horoscope CTA Button */}
        <Pressable
          onPress={() => {
            triggerHaptic();
            router.push('/(tabs)/horoscope');
          }}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}
        >
          <LinearGradient
            colors={['#D4AF37', '#F5D77F', '#E6CA65']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.specularTopEdge} />
          <Text style={styles.ctaText}>Explore Full Vedic Horoscope & Remedies →</Text>
        </Pressable>
      </View>
    </SpatialGlassCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  periodPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  periodBtnActive: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  luckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  luckBadgeIcon: { fontSize: 11 },
  luckBadgeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#B45309',
  },

  /* 3D Crystal Zodiac Sphere */
  zodiacHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sphereWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zodiacSphere: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  sphereSpecularGlint: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 24,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ rotate: '-25deg' }],
  },
  zodiacGlyph: {
    fontSize: 32,
    color: '#B45309',
    fontWeight: '900',
  },
  sphereRings: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderStyle: 'dashed',
  },
  rashiName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  sanskritName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B8902A',
  },
  dateRange: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  elementTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  elementTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  lordTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  lordTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  /* Insight Box */
  insightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B8902A',
    letterSpacing: 0.5,
  },
  insightTithi: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  insightContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Quick Metrics */
  quickMetricsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metricChip: {
    flex: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    alignItems: 'center',
    gap: 1,
  },
  metricChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  metricChipValue: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* CTA Button */
  ctaBtn: {
    height: 48,
    marginTop: 4,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
});
