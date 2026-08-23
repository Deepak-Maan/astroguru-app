import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { SpatialGlassCard } from '../SpatialGlassCard';

interface MetricItem {
  id: string;
  label: string;
  percent: number;
  icon: string;
  gradient: [string, string];
  insight: string;
}

const METRICS: MetricItem[] = [
  {
    id: 'love',
    label: 'Love & Harmony',
    percent: 85,
    icon: '💖',
    gradient: ['#F472B6', '#E11D48'],
    insight: 'Venus in 7th House enhances deep emotional connection',
  },
  {
    id: 'career',
    label: 'Career & Wealth',
    percent: 78,
    icon: '👑',
    gradient: ['#D4AF37', '#F5D77F'],
    insight: 'Jupiter transit favors business negotiation & promotions',
  },
  {
    id: 'energy',
    label: 'Cosmic Vitality',
    percent: 92,
    icon: '⚡',
    gradient: ['#38BDF8', '#818CF8'],
    insight: 'Mars alignment brings razor-sharp focus & resilience',
  },
];

export function EnergyTransitMetrics() {
  const animValues = useRef(METRICS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      animValues.map((anim, i) =>
        Animated.timing(anim, {
          toValue: METRICS[i].percent / 100,
          duration: 1000,
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  return (
    <SpatialGlassCard padded elevated borderGold style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 18 }}>📊</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Energy & Planetary Metrics</Text>
          <Text style={styles.subtitle}>Real-time transit alignments & life energy</Text>
        </View>
        <View style={styles.liveTag}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>ACTIVE</Text>
        </View>
      </View>

      {/* Metric Gauge Bars */}
      <View style={styles.metricsContainer}>
        {METRICS.map((metric, i) => {
          const widthInterpolate = animValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${metric.percent}%`],
          });

          return (
            <View key={metric.id} style={styles.metricRow}>
              <View style={styles.labelRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>{metric.icon}</Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                </View>
                <Text style={styles.metricPercent}>{metric.percent}%</Text>
              </View>

              {/* Progress Gauge Track */}
              <View style={styles.gaugeTrack}>
                <Animated.View
                  style={[
                    styles.gaugeFill,
                    {
                      width: widthInterpolate as any,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={metric.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Top Specular Glint */}
                  <View style={styles.gaugeGlint} />
                </Animated.View>
              </View>

              {/* Astrological Micro Insight */}
              <Text style={styles.metricInsight} numberOfLines={1}>
                {metric.insight}
              </Text>
            </View>
          );
        })}
      </View>
    </SpatialGlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    gap: 12,
  },
  metricRow: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricPercent: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B8902A',
  },
  gaugeTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeGlint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  metricInsight: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
});
