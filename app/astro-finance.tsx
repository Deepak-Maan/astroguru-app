import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { colors, radius, spacing, typography } from '../src/theme';
import { useUserStore } from '../src/store/userStore';

interface SectorInsight {
  sector: string;
  rulingPlanet: string;
  sentiment: 'BULLISH' | 'ACCUMULATE' | 'VOLATILE' | 'CONSOLIDATE' | 'BEARISH';
  tone: 'teal' | 'gold' | 'rose' | 'default';
  insight: string;
  momentum: string;
}

const SECTOR_DATA: SectorInsight[] = [
  {
    sector: '💻 Tech, Software & AI',
    rulingPlanet: 'Mercury (Budh) in 3rd House',
    sentiment: 'BULLISH',
    tone: 'teal',
    insight: 'Direct transit of Mercury fosters swift deal execution, cloud expansion, and tech earnings upside.',
    momentum: '+4.2% Cosmic Upside',
  },
  {
    sector: '🏦 Banking & Private NBFCs',
    rulingPlanet: 'Jupiter (Guru) in Kendra',
    sentiment: 'ACCUMULATE',
    tone: 'gold',
    insight: 'Jupiter aspect over the 9th house indicates steady credit expansion and strong institutional support.',
    momentum: '+2.8% Steady Growth',
  },
  {
    sector: '🏆 Gold & Precious Bullion',
    rulingPlanet: 'Sun conjunct Venus',
    sentiment: 'BULLISH',
    tone: 'gold',
    insight: 'Benefic Sun-Venus conjunction triggers safe-haven buying. Favorable window for physical gold/silver purchases.',
    momentum: 'Strong Safe-Haven Demand',
  },
  {
    sector: '⚡ Energy, Metals & Infra',
    rulingPlanet: 'Saturn & Mars Mutual Aspect',
    sentiment: 'CONSOLIDATE',
    tone: 'default',
    insight: 'Mars-Saturn opposition creates supply-chain bottlenecks. Favor value plays over speculative momentum.',
    momentum: 'Range-bound Consolidation',
  },
  {
    sector: '🪙 Crypto & Digital Tokens',
    rulingPlanet: 'Rahu (North Node) Volatility',
    sentiment: 'VOLATILE',
    tone: 'rose',
    insight: 'Rahu induces sharp liquidity swings and fake-outs. Strictly hedge stop-losses and avoid excessive leverage.',
    momentum: 'High Whipsaw Risk',
  },
];

const RASHIS = [
  'Aries (मेष)',
  'Taurus (वृषभ)',
  'Gemini (मिथुन)',
  'Cancer (कर्क)',
  'Leo (सिंह)',
  'Virgo (कन्या)',
  'Libra (तुला)',
  'Scorpio (वृश्चिक)',
  'Sagittarius (धनु)',
  'Capricorn (मकर)',
  'Aquarius (कुम्भ)',
  'Pisces (मीन)',
];

export default function AstroFinanceScreen() {
  const router = useRouter();
  const userProfile = useUserStore((s) => s.profile);

  const [selectedRashi, setSelectedRashi] = useState(RASHIS[0]);

  const handleRashiChange = (rashi: string) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    setSelectedRashi(rashi);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="📈 Astro-Finance & Wealth Timing Radar" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Market Mood & Planetary Barometer Card */}
          <Card padded style={styles.barometerCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.25)', 'rgba(56, 189, 248, 0.1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.marketStatusPill}>
                <View style={styles.greenPulse} />
                <Text style={styles.marketStatusText}>MACRO PLANETARY MOOD</Text>
              </View>
              <Chip label="BULLISH BIAS (78%)" tone="teal" />
            </View>

            <View style={{ marginTop: 12, gap: 4 }}>
              <Text style={styles.barometerTitle}>Mercury & Jupiter Prosperity Alignment</Text>
              <Text style={styles.barometerSub}>
                Favorable planetary aspect between Budh and Brihaspati creates strong liquidity and investment confidence across markets.
              </Text>
            </View>

            {/* Next Financial Golden Muhurat */}
            <View style={styles.muhuratBanner}>
              <Text style={{ fontSize: 20 }}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.muhuratHeading}>NEXT FINANCIAL GOLDEN WINDOW (ABHIJIT)</Text>
                <Text style={styles.muhuratTime}>Today 11:45 AM – 01:15 PM</Text>
                <Text style={styles.muhuratNote}>Ideal for stock buying, major banking transactions & signing asset deeds.</Text>
              </View>
            </View>
          </Card>

          {/* Personal Wealth Timing (Dhana & Labha Bhava) */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="🪙 Personal Wealth Muhurat (Dhana Bhava)"
              subtitle="Align your natal Moon rashi with today's financial Gochar"
            />

            {/* Rashi Selector Horizontal Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {RASHIS.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={selectedRashi === r}
                  onPress={() => handleRashiChange(r)}
                  tone={selectedRashi === r ? 'gold' : 'default'}
                />
              ))}
            </ScrollView>

            <View style={styles.personalAdviceBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 28 }}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adviceTitle}>Personalized Wealth Outlook for {selectedRashi.split(' ')[0]}</Text>
                  <Text style={styles.adviceTag}>2nd (Liquid Wealth) & 11th (Gains) House Analysis</Text>
                </View>
              </View>

              <View style={styles.adviceList}>
                <View style={styles.adviceItem}>
                  <Text style={styles.itemBullet}>✓</Text>
                  <Text style={styles.itemText}>
                    <Text style={{ fontWeight: '800', color: '#34D399' }}>Profits & Dividends:</Text> High probability of unexpected financial inflow or pending invoice clearance today.
                  </Text>
                </View>
                <View style={styles.adviceItem}>
                  <Text style={styles.itemBullet}>✓</Text>
                  <Text style={styles.itemText}>
                    <Text style={{ fontWeight: '800', color: '#FCD34D' }}>F&O / Intraday Caution:</Text> Avoid taking aggressive speculative positions between 03:15 PM and 04:45 PM (Rahu Kaal).
                  </Text>
                </View>
                <View style={styles.adviceItem}>
                  <Text style={styles.itemBullet}>✓</Text>
                  <Text style={styles.itemText}>
                    <Text style={{ fontWeight: '800', color: '#38BDF8' }}>Auspicious Allocation:</Text> Long-term mutual funds, gold sovereign bonds, and blue-chip IT equities favored.
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Sector Predictions */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="📊 Sector Breakdown & Planetary Trends"
              subtitle="Planetary influence on commodities, indices and industries"
            />

            <View style={{ gap: 10 }}>
              {SECTOR_DATA.map((item) => (
                <View key={item.sector} style={styles.sectorCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.sectorHeading}>{item.sector}</Text>
                    <Chip label={item.sentiment} tone={item.tone} />
                  </View>
                  <Text style={styles.sectorPlanet}>{item.rulingPlanet}</Text>
                  <Text style={styles.sectorInsight}>{item.insight}</Text>
                  <View style={styles.momentumRow}>
                    <Text style={styles.momentumLabel}>Planetary Momentum:</Text>
                    <Text style={styles.momentumVal}>{item.momentum}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Consultation Bridge */}
          <Card padded style={styles.consultCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>💼</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.consultTitle}>Need Bespoke Financial Timing?</Text>
                <Text style={styles.consultSub}>
                  Consult a Certified Vedic Wealth & Business Jyotishi to audit your D10 Dasamsa career chart.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/instant-consult')}
              style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.consultBtnText}>⚡ Consult Financial Astrologer</Text>
            </Pressable>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  barometerCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    overflow: 'hidden',
  },
  marketStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  greenPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  marketStatusText: { fontSize: 9.5, fontWeight: '800', color: '#6EE7B7', letterSpacing: 0.5 },
  barometerTitle: { fontSize: 18, fontWeight: '900', color: '#FDE68A' },
  barometerSub: { fontSize: 12.5, color: '#CBD5E1', lineHeight: 18 },
  muhuratBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  muhuratHeading: { fontSize: 9.5, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.6 },
  muhuratTime: { fontSize: 15, fontWeight: '900', color: '#EEF2FF', marginTop: 2 },
  muhuratNote: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  personalAdviceBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    gap: 12,
  },
  adviceTitle: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  adviceTag: { fontSize: 11, color: '#A5B4FC', fontWeight: '600' },
  adviceList: { gap: 8 },
  adviceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemBullet: { color: '#10B981', fontWeight: '900', fontSize: 13, marginTop: 1 },
  itemText: { flex: 1, fontSize: 12, color: '#CBD5E1', lineHeight: 17 },
  sectorCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    gap: 4,
  },
  sectorHeading: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  sectorPlanet: { fontSize: 10.5, fontWeight: '700', color: '#FCD34D' },
  sectorInsight: { fontSize: 12, color: '#CBD5E1', lineHeight: 17, marginTop: 2 },
  momentumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  momentumLabel: { fontSize: 10.5, color: '#94A3B8' },
  momentumVal: { fontSize: 11, fontWeight: '800', color: '#38BDF8' },
  consultCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    gap: 12,
  },
  consultTitle: { fontSize: 14.5, fontWeight: '800', color: '#EEF2FF' },
  consultSub: { fontSize: 11.5, color: '#C7D2FE', lineHeight: 16, marginTop: 2 },
  consultBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  consultBtnText: { color: '#0A0C16', fontWeight: '900', fontSize: 13 },
});
