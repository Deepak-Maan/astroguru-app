import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export default function TransitAlertsScreen() {
  const router = useRouter();

  const alerts = [
    { planet: '🪐 Saturn (Shani Gochar)', event: 'Enters Aquarius Sign', impact: '3 Rashis enter Sade Sati phase', date: 'Today · 14:00', tone: 'rose' },
    { planet: '🟡 Jupiter (Guru Gochar)', event: 'Enters Taurus Sign', impact: 'Financial & career luck boost for Taurus & Virgo', date: 'In 3 Days', tone: 'teal' },
    { planet: '🔴 Mars (Mangal Gochar)', event: 'Combust with Sun in 10th House', impact: 'Avoid heated workplace arguments', date: 'In 7 Days', tone: 'gold' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="⚡ Major Transit Push Radar" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SectionHeader title="Active & Upcoming Planetary Movements" subtitle="Real-time transit push alerts" />

          {alerts.map((a) => (
            <Card key={a.planet} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.planetTitle}>{a.planet}</Text>
                <Chip label={a.date} tone={a.tone as any} />
              </View>
              <Text style={styles.eventText}>{a.event}</Text>
              <Text style={styles.impactText}>⚠️ <Text style={{ fontWeight: '800' }}>Impact: </Text>{a.impact}</Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  planetTitle: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  eventText: { ...typography.small, color: colors.saffron, fontWeight: '700' },
  impactText: { ...typography.small, color: colors.textMuted, lineHeight: 18, marginTop: 2 },
});
