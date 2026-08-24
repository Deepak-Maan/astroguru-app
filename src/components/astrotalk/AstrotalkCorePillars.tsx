import React from 'react';
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
import { colors, radius, spacing } from '../../theme';

interface Props {
  onSelectService?: (service: string) => void;
}

export function AstrotalkCorePillars({ onSelectService }: Props) {
  const router = useRouter();

  const handlePress = (route: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push(route as never);
  };

  const PILLARS = [
    {
      id: 'chat',
      title: 'Chat with\nAstrologer',
      subtitle: '500+ Online • ₹10/min',
      badge: 'POPULAR',
      icon: '💬',
      route: '/(tabs)/consult',
      bgGradient: ['#FFFFFF', '#FFFBEB'],
      border: '#FDE68A',
      iconBg: '#FEF3C7',
      accent: '#D97706',
    },
    {
      id: 'call',
      title: 'Talk to\nAstrologer',
      subtitle: 'Instant Voice Call',
      badge: 'HOT',
      icon: '📞',
      route: '/(tabs)/consult',
      bgGradient: ['#FFFFFF', '#ECFDF5'],
      border: '#A7F3D0',
      iconBg: '#D1FAE5',
      accent: '#059669',
    },
    {
      id: 'live',
      title: 'Live\nAstrologers',
      subtitle: 'Free Question Queue',
      badge: '🔴 LIVE',
      icon: '📹',
      route: '/live-darshan',
      bgGradient: ['#FFFFFF', '#FEF2F2'],
      border: '#FECACA',
      iconBg: '#FEE2E2',
      accent: '#DC2626',
    },
    {
      id: 'store',
      title: 'Astrotalk\nStore & Puja',
      subtitle: 'Gemstones & Yantras',
      badge: 'CERTIFIED',
      icon: '🛍️',
      route: '/gemstone-finder',
      bgGradient: ['#FFFFFF', '#F5F3FF'],
      border: '#DDD6FE',
      iconBg: '#EDE9FE',
      accent: '#7C3AED',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {PILLARS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.route)}
            style={({ pressed }) => [
              styles.pillarCard,
              { borderColor: item.border },
              pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
            ]}
          >
            <LinearGradient
              colors={item.bgGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Pill Badge */}
            <View style={[styles.badge, { backgroundColor: item.accent }]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>

            {/* Icon Bubble */}
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.pillarTitle}>{item.title}</Text>
            <Text style={styles.pillarSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  pillarCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 18,
  },
  pillarSubtitle: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 3,
  },
});
