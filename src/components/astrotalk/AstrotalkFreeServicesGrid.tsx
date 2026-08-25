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
import { colors, radius, spacing } from '../../theme';

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

  const SERVICES = [
    { id: 'kundli', title: 'Free Kundli', icon: '🪐', badge: '10-Pg', bg: '#FFFBEB', border: '#FDE68A', route: '/(tabs)/kundli' },
    { id: 'matching', title: 'Matching', icon: '💖', badge: '36 Guna', bg: '#FDF2F8', border: '#FBCFE8', route: '/matching' },
    { id: 'horoscope', title: 'Horoscope', icon: '🔮', badge: 'Daily', bg: '#F5F3FF', border: '#DDD6FE', route: '/(tabs)/horoscope' },
    { id: 'panchang', title: 'Panchang', icon: '🌅', badge: 'Today', bg: '#FFF7ED', border: '#FFEDD5', route: '/panchang' },
    { id: 'numerology', title: 'Numerology', icon: '🔢', badge: 'Grid', bg: '#F0F9FF', border: '#BAE6FD', route: '/numerology' },
    { id: 'tarot', title: 'Tarot Card', icon: '🃏', badge: '3-Card', bg: '#FAF5FF', border: '#E9D5FF', route: '/tarot' },
    { id: 'gemstone', title: 'Gemstone', icon: '💍', badge: 'Rashi', bg: '#ECFDF5', border: '#A7F3D0', route: '/gemstone-finder' },
    { id: 'mantra', title: '108 Japa', icon: '📿', badge: 'Mala', bg: '#FFFBEB', border: '#FDE68A', route: '/japa' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>✨ Complimentary Vedic Tools</Text>
        <Text style={styles.sectionSub}>100% Free Calculations</Text>
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
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  itemCell: {
    width: '23%',
    aspectRatio: 0.92,
    borderRadius: 16,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
});
