import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { radius, spacing } from '../../theme';

interface ServiceItem {
  id: string;
  title: string;
  icon: string;
  badge?: string;
  bg: string;
  border: string;
  route: string;
}

export function AstrotalkFreeServicesGrid() {
  const router = useRouter();

  const handlePress = (route: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    router.push(route as never);
  };

  const SERVICES: ServiceItem[] = [
    { id: 'kundli', title: 'Free Kundli', icon: '🪐', badge: '10-Pg', bg: '#FFFBEB', border: '#FDE68A', route: '/(tabs)/kundli' },
    { id: 'matching', title: 'Matching', icon: '💖', badge: '36 Guna', bg: '#FDF2F8', border: '#FBCFE8', route: '/matching' },
    { id: 'lovemeter', title: 'Love Meter', icon: '❤️', badge: 'New', bg: '#FFF1F2', border: '#FECDD3', route: '/love-meter' },
    { id: 'vastu', title: 'Vastu Compass', icon: '🧭', badge: 'Energy', bg: '#F0FDF4', border: '#BBF7D0', route: '/vastu-compass' },
    { id: 'horoscope', title: 'Horoscope', icon: '🔮', badge: 'Daily', bg: '#F5F3FF', border: '#DDD6FE', route: '/(tabs)/horoscope' },
    { id: 'panchang', title: 'Panchang', icon: '🌅', badge: 'Today', bg: '#FFF7ED', border: '#FFEDD5', route: '/panchang' },
    { id: 'karma', title: 'Karma Coins', icon: '🪙', badge: 'Cashback', bg: '#FEF3C7', border: '#FDE68A', route: '/karma-rewards' },
    { id: 'tarot', title: 'Tarot Card', icon: '🃏', badge: '3-Card', bg: '#FAF5FF', border: '#E9D5FF', route: '/tarot' },
    { id: 'gemstone', title: 'Gemstone', icon: '💍', badge: 'Rashi', bg: '#ECFDF5', border: '#A7F3D0', route: '/gemstone-finder' },
    { id: 'mantra', title: '108 Japa', icon: '📿', badge: 'Mala', bg: '#FFFBEB', border: '#FDE68A', route: '/japa' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>✨ Complimentary Vedic Tools</Text>
          <Text style={styles.sectionSub}>100% Free Calculations & Instant Reports</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {SERVICES.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item.route)}
            style={({ pressed }) => [
              styles.itemCell,
              { backgroundColor: item.bg, borderColor: item.border },
              pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] },
            ]}
          >
            {/* Top Specular Edge */}
            <View style={styles.specularTopEdge} />

            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}

            <View style={styles.iconWrapper}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            </View>

            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
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
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemCell: {
    width: '18.2%',
    minWidth: 62,
    aspectRatio: 0.9,
    borderRadius: 16,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#D97706',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    zIndex: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  iconWrapper: {
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
});
