import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 370);
const CARD_HEIGHT = 185;

export interface SlideItem {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  meta: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaColor: string;
  accentGradient: readonly [string, string];
  route: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 'free-chat',
    badge: '🎁 1ST CHAT FREE',
    badgeColor: '#FFFFFF',
    badgeBg: '#EC4899',
    meta: '3:00 Min Free',
    title: 'First 3 Minutes 100% Free Consultation',
    subtitle: 'Talk to certified Vedic Acharyas with zero wallet deductions.',
    ctaText: 'Start Free Chat ›',
    ctaColor: '#EC4899',
    accentGradient: ['#6366F1', '#EC4899'] as const,
    route: '/instant-consult',
  },
  {
    id: 'astrogold-vip',
    badge: '💳 ASTROGOLD PASS',
    badgeColor: '#FFFFFF',
    badgeBg: '#4F46E5',
    meta: 'VIP Metal',
    title: 'Cosmic Luxury VIP Membership',
    subtitle: '1-Tap UPI wallet recharge, 20% bonus credits & priority queues.',
    ctaText: 'View Perks ›',
    ctaColor: '#38BDF8',
    accentGradient: ['#1E1B4B', '#4F46E5'] as const,
    route: '/wallet',
  },
  {
    id: 'kundli-transit',
    badge: '🪐 KUNDLI TRANSIT',
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    meta: 'Mesha Lagna',
    title: 'Jupiter Transit in 10th Bhava',
    subtitle: 'High career acceleration yoga active over the next 45 days.',
    ctaText: 'Check Chart ›',
    ctaColor: '#818CF8',
    accentGradient: ['#0F172A', '#0284C7'] as const,
    route: '/(tabs)/kundli',
  },
  {
    id: 'daily-spin',
    badge: '🎡 SPIN & WIN',
    badgeColor: '#FBBF24',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    meta: '1 Free Spin',
    title: 'Navagraha Chakra Rewards',
    subtitle: 'Win instant consultation cash credits, Astro-coins & remedies.',
    ctaText: 'Spin Now ›',
    ctaColor: '#F59E0B',
    accentGradient: ['#31103F', '#9333EA'] as const,
    route: '/daily-rewards',
  },
];

export function WarpZoomSlider() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const target = (index + SLIDES.length) % SLIDES.length;
      triggerHaptic();
      setActiveIndex(target);
      Animated.spring(animValue, {
        toValue: target,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
    },
    [animValue, triggerHaptic]
  );

  const handleNext = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  // Touch Swipe Gesture Handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          handleNext();
        } else if (gestureState.dx > 40) {
          handlePrev();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Header bar with Mode badge & Navigation chevrons */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>COSMIC HIGHLIGHTS</Text>
          <View style={styles.warpBadge}>
            <Text style={styles.warpBadgeText}>3D Warp Zoom</Text>
          </View>
        </View>
        <View style={styles.arrowsRow}>
          <Pressable onPress={handlePrev} style={styles.arrowBtn} hitSlop={8}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Pressable onPress={handleNext} style={styles.arrowBtn} hitSlop={8}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* 3D Warp Zoom Stack Arena */}
      <View style={styles.stackArena} {...panResponder.panHandlers}>
        {SLIDES.map((slide, i) => {
          let diff = i - activeIndex;
          if (diff > 2) diff -= SLIDES.length;
          if (diff < -1) diff += SLIDES.length;

          // Warp Zoom Spatial Layout:
          // Active (diff === 0): scaled forward 1.05x, front Z
          // diff === 1: scaled 0.88x, elevated slightly upwards, opacity 0.8
          // diff === -1: scaled 0.88x, elevated, opacity 0.8
          // diff other: pushed back into tunnel 0.76x, opacity 0.3
          const isActive = diff === 0;
          let scale = 1.04;
          let translateY = 0;
          let opacity = 1;
          let zIndex = 40;

          if (diff === 0) {
            scale = 1.04;
            translateY = 0;
            opacity = 1;
            zIndex = 40;
          } else if (diff === 1 || diff === -1) {
            scale = 0.90;
            translateY = -14;
            opacity = 0.80;
            zIndex = 20;
          } else {
            scale = 0.78;
            translateY = -28;
            opacity = 0.35;
            zIndex = 10;
          }

          return (
            <Animated.View
              key={slide.id}
              style={[
                styles.cardWrapper,
                {
                  zIndex,
                  opacity,
                  transform: [{ scale }, { translateY }],
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  if (isActive) {
                    triggerHaptic();
                    router.push(slide.route as any);
                  } else {
                    goToSlide(i);
                  }
                }}
                style={({ pressed }) => [
                  styles.cardInner,
                  isActive && styles.cardActiveGlow,
                  pressed && { opacity: 0.92 },
                ]}
              >
                {/* Translucent Liquid Glass Background */}
                <LinearGradient
                  colors={['rgba(28, 36, 70, 0.88)', 'rgba(14, 18, 40, 0.95)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {/* Top Subtle Luminous Sheen Arc */}
                <LinearGradient
                  colors={['rgba(129, 140, 248, 0.25)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 0.6 }}
                  style={styles.topSheen}
                />

                {/* Card Header: Pill + Meta */}
                <View style={styles.cardHeader}>
                  <View style={[styles.pillBadge, { backgroundColor: slide.badgeBg }]}>
                    <Text style={[styles.pillBadgeText, { color: slide.badgeColor }]}>
                      {slide.badge}
                    </Text>
                  </View>
                  <Text style={styles.metaText}>{slide.meta}</Text>
                </View>

                {/* Title & Subtitle */}
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {slide.title}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {slide.subtitle}
                  </Text>
                </View>

                {/* Card Footer: Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.perkRow}>
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                    <Text style={styles.perkText}>Instant Connect</Text>
                  </View>
                  <Text style={[styles.ctaText, { color: slide.ctaColor }]}>
                    {slide.ctaText}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <Pressable
              key={idx}
              onPress={() => goToSlide(idx)}
              style={[styles.dot, isSelected && styles.dotActive]}
              hitSlop={6}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  warpBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
  },
  warpBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#818CF8',
  },
  arrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#EEF2FF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  stackArena: {
    height: CARD_HEIGHT + 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    bottom: 4,
  },
  cardInner: {
    flex: 1,
    borderRadius: 24,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  cardActiveGlow: {
    borderColor: '#818CF8',
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
  },
  cardContent: {
    marginVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EEF2FF',
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 12,
    color: '#A5B4FC',
    lineHeight: 16,
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981',
  },
  perkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EEF2FF',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#818CF8',
  },
});
