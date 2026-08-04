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

export default function AstroFinanceScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="📈 Astro-Finance & Muhurat Radar" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="Financial Transit Radar" subtitle="Mercury & Jupiter Market Movements" />

            <View style={styles.radarBox}>
              <LinearGradient
                colors={['rgba(16,185,129,0.12)', 'rgba(245,158,11,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 36 }}>💹</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.radarTitle}>Mercury Direct in Gemini</Text>
                <Text style={styles.radarSub}>Auspicious for Stock Investments & Tech Deals</Text>
              </View>
              <Chip label="BULLISH" tone="teal" />
            </View>

            <View style={styles.muhuratRow}>
              <Text style={styles.muhuratTitle}>⏰ Next Shubh Financial Muhurat:</Text>
              <Text style={styles.muhuratVal}>Tomorrow 11:45 AM – 01:15 PM (Abhijit)</Text>
            </View>
          </Card>

          <SectionHeader title="Business Sector Predictions" subtitle="Based on planetary transits" />

          {[
            { sector: '💻 Tech & IT', forecast: 'High Growth', note: 'Mercury in 3rd House promotes software & AI deals.', tone: 'teal' },
            { sector: '🏠 Real Estate', forecast: 'Stable', note: 'Saturn transit favors long-term land investments.', tone: 'gold' },
            { sector: '🏆 Gold & Precious Metals', forecast: 'Strong Bullish', note: 'Sun conjunct Jupiter favors gold holdings.', tone: 'rose' },
          ].map((item) => (
            <Card key={item.sector} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectorTitle}>{item.sector}</Text>
                <Chip label={item.forecast} tone={item.tone as any} />
              </View>
              <Text style={styles.sectorNote}>{item.note}</Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  radarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    overflow: 'hidden',
  },
  radarTitle: { ...typography.h3, color: colors.teal, fontSize: 16, fontWeight: '800' },
  radarSub: { ...typography.tiny, color: colors.textMuted, fontWeight: '600', marginTop: 2 },

  muhuratRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    marginTop: 4,
  },
  muhuratTitle: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  muhuratVal: { ...typography.small, color: colors.text, fontWeight: '700', marginTop: 2 },

  sectorTitle: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  sectorNote: { ...typography.small, color: colors.textMuted, lineHeight: 18 },
});
