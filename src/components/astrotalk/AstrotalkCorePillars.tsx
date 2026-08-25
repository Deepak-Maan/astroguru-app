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
import { radius, spacing } from '../../theme';

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: string;
  route: string;
  bgGradient: string[];
  border: string;
  iconBg: string;
  accent: string;
}

export function AstrotalkCorePillars() {
  const router = useRouter();

  const handlePress = (route: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    router.push(route as never);
  };

  const PILLARS: Pillar[] = [
    {
      id: 'chat',
      title: 'Chat with\nAstrologer',
      subtitle: 'Instant 1-on-1 Chat',
      badge: 'POPULAR',
      icon: '💬',
      route: '/(tabs)/consult',
      bgGradient: ['#FFFFFF', '#FFFDF5', '#FFFBEB'],
      border: '#FDE68A',
      iconBg: '#FEF3C7',
      accent: '#D97706',
    },
    {
      id: 'call',
      title: 'Talk to\nAstrologer',
      subtitle: 'Voice Consultation',
      badge: '⚡ FAST',
      icon: '📞',
      route: '/(tabs)/consult',
      bgGradient: ['#FFFFFF', '#F7FDF9', '#ECFDF5'],
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
      bgGradient: ['#FFFFFF', '#FFF8F8', '#FEF2F2'],
      border: '#FECACA',
      iconBg: '#FEE2E2',
      accent: '#DC2626',
    },
    {
      id: 'store',
      title: 'AstroGuru\nStore & Puja',
      subtitle: 'Gemstones & Yantras',
      badge: 'CERTIFIED',
      icon: '🛍️',
      route: '/store',
      bgGradient: ['#FFFFFF', '#FAF8FF', '#F5F3FF'],
      border: '#DDD6FE',
      iconBg: '#EDE9FE',
      accent: '#7C3AED',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {PILLARS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => handlePress(p.route)}
            style={({ pressed }) => [
              styles.pillarCard,
              { borderColor: p.border },
              pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
            ]}
          >
            <LinearGradient
              colors={p.bgGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Specular Edge */}
            <View style={styles.specularTopEdge} />

            {/* Badge Ribbon */}
            {p.badge && (
              <View style={[styles.badgePill, { backgroundColor: p.accent }]}>
                <Text style={styles.badgeText}>{p.badge}</Text>
              </View>
            )}

            {/* Icon Bubble */}
            <View style={[styles.iconCircle, { backgroundColor: p.iconBg }]}>
              <Text style={{ fontSize: 24 }}>{p.icon}</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.textWrap}>
              <Text style={styles.titleText}>{p.title}</Text>
              <Text style={styles.subText}>{p.subtitle}</Text>
            </View>

            {/* Arrow Action */}
            <View style={styles.arrowRow}>
              <Text style={[styles.arrowText, { color: p.accent }]}>Connect ➔</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  pillarCard: {
    width: '48%',
    height: 154,
    borderRadius: 22,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    zIndex: 2,
  },
  badgePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    zIndex: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  textWrap: {
    gap: 2,
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 18,
  },
  subText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 11,
    fontWeight: '900',
  },
});
