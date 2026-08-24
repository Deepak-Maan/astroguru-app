import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.min(SCREEN_WIDTH - 32, 420);

const PROMO_BANNERS = [
  {
    id: 'b1',
    tag: '⚡ SPECIAL OFFER',
    title: 'First Chat Consultation FREE!',
    subtitle: 'Get answers to your Love, Career & Marriage queries with verified Acharyas.',
    cta: 'Chat Now ₹0',
    icon: '🎁',
    route: '/(tabs)/consult',
    gradient: ['#FFF8E1', '#FFE082', '#FFCA28'],
    accent: '#D97706',
  },
  {
    id: 'b2',
    tag: '🔴 LIVE SESSIONS',
    title: 'Ask Free Question in Live Stream',
    subtitle: 'Top celebrity astrologers are streaming live right now with instant tarot reading.',
    cta: 'Join Live →',
    icon: '📹',
    route: '/(tabs)/consult',
    gradient: ['#FEE2E2', '#FECACA', '#FCA5A5'],
    accent: '#DC2626',
  },
  {
    id: 'b3',
    tag: '🪔 VEDIC PUJA',
    title: 'Maha Mrityunjaya Daily Anushthan',
    subtitle: 'Book customized sankalp puja performed by certified Vedic pandits in Varanasi.',
    cta: 'Book Puja ₹501',
    icon: '🕉️',
    route: '/store' as any,
    gradient: ['#FEF3C7', '#FDE68A', '#FCD34D'],
    accent: '#B45309',
  },
];

export function AstrotalkHeroBannerCarousel() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % PROMO_BANNERS.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleBannerPress = (route: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    router.push(route as never);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PROMO_BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
          setActiveIndex(Math.max(0, Math.min(index, PROMO_BANNERS.length - 1)));
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleBannerPress(item.route)}
            style={({ pressed }) => [
              styles.bannerCard,
              { width: BANNER_WIDTH },
              pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
            ]}
          >
            <LinearGradient
              colors={item.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Left Content Column */}
            <View style={styles.textColumn}>
              <View style={[styles.tagBadge, { backgroundColor: item.accent }]}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>

              <View style={[styles.ctaPill, { borderColor: item.accent }]}>
                <Text style={[styles.ctaText, { color: item.accent }]}>{item.cta}</Text>
              </View>
            </View>

            {/* Right Giant 3D Icon */}
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 44 }}>{item.icon}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {PROMO_BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  bannerCard: {
    height: 146,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  textColumn: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
    gap: 4,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
    fontWeight: '500',
  },
  ctaPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: radius.pill,
    marginTop: 2,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '900',
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#F59E0B',
  },
});
