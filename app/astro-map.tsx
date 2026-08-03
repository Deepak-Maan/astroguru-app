import React from 'react';
import {
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

export default function AstroMapScreen() {
  const router = useRouter();

  const planetaryLines = [
    { planet: '☀️ Sun Line', effect: 'Career, Leadership & Public Fame', cities: 'London, New York, Tokyo', tone: 'gold' },
    { planet: '♀️ Venus Line', effect: 'Love, Romance & Creative Arts', cities: 'Paris, Venice, Bali', tone: 'rose' },
    { planet: '♃ Jupiter Line', effect: 'Wealth, Spiritual Higher Learning & Fortune', cities: 'Singapore, Dubai, Mumbai', tone: 'teal' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🛰️ Astro-Cartography World Map" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Simulated 3D World Map Box */}
          <View style={styles.mapBox}>
            <LinearGradient
              colors={['#0F172A', '#1E1B4B']}
              style={StyleSheet.absoluteFill}
            />

            <Text style={{ fontSize: 64, alignSelf: 'center', marginVertical: spacing.lg }}>🌍</Text>

            <View style={styles.mapPinRow}>
              <View style={[styles.mapPin, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.pinText}>☀️ Sun Line</Text>
              </View>
              <View style={[styles.mapPin, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.pinText}>♀️ Venus Line</Text>
              </View>
              <View style={[styles.mapPin, { backgroundColor: '#10B981' }]}>
                <Text style={styles.pinText}>♃ Jupiter Line</Text>
              </View>
            </View>
          </View>

          <SectionHeader title="Your Planetary Power Locations" subtitle="Best global cities for success & romance" />

          {planetaryLines.map((line) => (
            <Card key={line.planet} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.lineTitle}>{line.planet}</Text>
                <Chip label="High Power" tone={line.tone as any} />
              </View>
              <Text style={styles.lineEffect}>{line.effect}</Text>
              <Text style={styles.lineCities}>📍 Key Cities: <Text style={{ color: colors.text, fontWeight: '800' }}>{line.cities}</Text></Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  mapBox: {
    height: 200,
    borderRadius: radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  mapPinRow: { flexDirection: 'row', justifyContent: 'space-around' },
  mapPin: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pinText: { ...typography.tiny, color: colors.white, fontWeight: '900', fontSize: 10 },

  lineTitle: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  lineEffect: { ...typography.small, color: colors.textMuted, lineHeight: 18 },
  lineCities: { ...typography.tiny, color: colors.saffron, fontWeight: '700', marginTop: 4 },
});
