import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export default function LiveDarshanScreen() {
  const router = useRouter();
  const [prashadOrdered, setPrashadOrdered] = useState<string | null>(null);

  const temples = [
    { name: 'Shri Kashi Vishwanath Temple', city: 'Varanasi, UP', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=600', icon: '🔱' },
    { name: 'Shri Mahakaleshwar Jyotirlinga', city: 'Ujjain, MP', image: 'https://images.unsplash.com/photo-1609766857041-ed403ea6948c?auto=format&fit=crop&q=80&w=600', icon: '🛕' },
    { name: 'Shri Tirupati Balaji Temple', city: 'Tirumala, AP', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=600', icon: '🕉️' },
  ];

  const handleOrderPrashad = (templeName: string) => {
    setPrashadOrdered(`Home Prashad delivery booked for ${templeName}! Dispatching via SpeedPost.`);
    setTimeout(() => setPrashadOrdered(null), 4000);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🏛️ 24/7 Live Temple Darshan" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {prashadOrdered && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✨ {prashadOrdered}</Text>
            </View>
          )}

          <SectionHeader title="Live 4K HD Temple Streams" subtitle="Direct feeds from India's sacred shrines" />

          {temples.map((temple) => (
            <Card key={temple.name} style={{ gap: spacing.sm, padding: 0, overflow: 'hidden' }}>
              <View style={styles.streamBox}>
                <Image source={{ uri: temple.image }} style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.liveTagRow}>
                  <View style={styles.liveTag}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>24/7 LIVE</Text>
                  </View>
                  <Chip label="4K Ultra HD" tone="gold" />
                </View>

                <View style={styles.streamInfo}>
                  <Text style={styles.templeName}>{temple.icon} {temple.name}</Text>
                  <Text style={styles.templeCity}>📍 {temple.city}</Text>
                </View>
              </View>

              <View style={{ padding: spacing.md, flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label="🎥 Watch Live Stream"
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  label="🍯 Order Home Prashad (₹251)"
                  variant="gold"
                  size="sm"
                  style={{ flex: 1.2 }}
                  onPress={() => handleOrderPrashad(temple.name)}
                />
              </View>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  streamBox: {
    height: 180,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  liveTagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { ...typography.tiny, color: colors.white, fontWeight: '900' },

  streamInfo: { gap: 2 },
  templeName: { ...typography.h3, color: colors.white, fontSize: 16, fontWeight: '800' },
  templeCity: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  successBanner: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  successText: { ...typography.small, color: colors.success, fontWeight: '800', textAlign: 'center' },
});
