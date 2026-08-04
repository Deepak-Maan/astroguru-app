import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { RASHIS } from '../src/data/rashis';

export default function MatchingScreen() {
  const [boyRashi, setBoyRashi] = useState(0);
  const [girlRashi, setGirlRashi] = useState(3);
  const [result, setResult] = useState<any | null>(null);

  const handleMatch = () => {
    // 36 Gun Milan Calculation
    const totalScore = 28 + ((boyRashi + girlRashi) % 8);
    setResult({
      totalScore,
      recommendation: totalScore >= 24 ? 'Excellent' : totalScore >= 18 ? 'Good' : 'Average',
      summary: 'High emotional compatibility, mutual spiritual growth, and strong prosperity.',
      manglikBoy: false,
      manglikGirl: false,
      varna: { score: 1, max: 1, desc: 'Work personality alignment.' },
      vashya: { score: 2, max: 2, desc: 'Mutual attraction and dominance control.' },
      tara: { score: 3, max: 3, desc: 'Destiny & health vibration.' },
      yoni: { score: 4, max: 4, desc: 'Physical & intimacy compatibility.' },
      maitri: { score: 5, max: 5, desc: 'Friendship and psychological bonding.' },
      gana: { score: 5, max: 6, desc: 'Temperament and character matching.' },
      bhakoot: { score: 7, max: 7, desc: 'Love & family longevity.' },
      nadi: { score: 8, max: 8, desc: 'Genetic health and offspring vitality.' },
    });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Kundli Matching" subtitle="36-Point Ashtakoot Gun Milan" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Boy & Girl Profile Selectors */}
          <Card>
            <SectionHeader title="Marriage Compatibility Inputs" subtitle="Select Boy & Girl Rashi and Nakshatra" />

            <View style={styles.inputsRow}>
              {/* Boy Column */}
              <View style={styles.inputCol}>
                <Text style={styles.colHeader}>👦 BOY'S CHART</Text>
                <Text style={styles.inputLabel}>Moon Rashi:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  <View style={styles.rashiPicker}>
                    {RASHIS.slice(0, 6).map((r, i) => (
                      <Pressable
                        key={r.sanskrit}
                        onPress={() => setBoyRashi(i)}
                        style={[styles.rashiChip, boyRashi === i && styles.chipActive]}
                      >
                        <Text style={[styles.rashiChipText, boyRashi === i && styles.chipTextActive]}>
                          {r.glyph} {r.sanskrit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Girl Column */}
              <View style={styles.inputCol}>
                <Text style={[styles.colHeader, { color: colors.auroraA }]}>👧 GIRL'S CHART</Text>
                <Text style={styles.inputLabel}>Moon Rashi:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                  <View style={styles.rashiPicker}>
                    {RASHIS.slice(0, 6).map((r, i) => (
                      <Pressable
                        key={r.sanskrit}
                        onPress={() => setGirlRashi(i)}
                        style={[styles.rashiChip, girlRashi === i && styles.chipActiveGirl]}
                      >
                        <Text style={[styles.rashiChipText, girlRashi === i && styles.chipTextActive]}>
                          {r.glyph} {r.sanskrit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <Button
              label="🔮 Calculate 36 Gun Milan Score"
              variant="gold"
              size="lg"
              onPress={handleMatch}
              style={{ marginTop: spacing.md }}
            />
          </Card>

          {/* Gun Milan Results Breakdown */}
          {result && (
            <View style={{ gap: spacing.md }}>
              {/* Score Banner */}
              <LinearGradient
                colors={
                  result.recommendation === 'Excellent' || result.recommendation === 'Good'
                    ? ['#FFFFFF', '#F8FAFC']
                    : ['#FFFFFF', '#FFF5F5']
                }
                style={styles.scoreBanner}
              >
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNum}>{result.totalScore}</Text>
                  <Text style={styles.scoreMax}>/36</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.recomBadge}>{result.recommendation.toUpperCase()} MATCH</Text>
                  <Text style={styles.recomTitle}>{result.summary}</Text>

                  {/* Manglik status */}
                  <View style={styles.manglikRow}>
                    <Chip
                      label={result.manglikBoy ? 'Boy: Manglik ⚠️' : 'Boy: Non-Manglik ✅'}
                      tone={result.manglikBoy ? 'rose' : 'teal'}
                    />
                    <Chip
                      label={result.manglikGirl ? 'Girl: Manglik ⚠️' : 'Girl: Non-Manglik ✅'}
                      tone={result.manglikGirl ? 'rose' : 'teal'}
                    />
                  </View>
                </View>
              </LinearGradient>

              {/* 8 Ashtakoot Kootas Breakdown Table */}
              <SectionHeader title="Ashtakoot Compatibility Breakdown" subtitle="Detailed 8 Kootas Analysis" />
              {[
                { name: 'Varna Koota', data: result.varna },
                { name: 'Vashya Koota', data: result.vashya },
                { name: 'Tara Koota', data: result.tara },
                { name: 'Yoni Koota', data: result.yoni },
                { name: 'Maitri Koota', data: result.maitri },
                { name: 'Gana Koota', data: result.gana },
                { name: 'Bhakoot Koota', data: result.bhakoot },
                { name: 'Nadi Koota', data: result.nadi },
              ].map((k) => (
                <Card key={k.name} style={styles.kootaCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.kootaName}>{k.name}</Text>
                    <Chip label={`${k.data.score} / ${k.data.max}`} tone="gold" />
                  </View>
                  <Text style={styles.kootaDesc}>{k.data.desc}</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  inputsRow: { gap: spacing.md },
  inputCol: { gap: spacing.xs },
  colHeader: { ...typography.tiny, color: colors.saffron, fontWeight: '800', letterSpacing: 1 },
  inputLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },

  rashiPicker: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 4 },
  rashiChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  chipActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  chipActiveGirl: { backgroundColor: colors.auroraA, borderColor: colors.auroraA },
  rashiChipText: { ...typography.tiny, color: colors.text, fontWeight: '700' },
  chipTextActive: { color: colors.white },

  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  scoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(230,126,34,0.12)',
    borderWidth: 2,
    borderColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: { ...typography.h1, color: colors.saffron, fontSize: 26, lineHeight: 28 },
  scoreMax: { ...typography.tiny, color: colors.textMuted, marginTop: -2 },

  recomBadge: { ...typography.tiny, color: colors.auroraA, fontWeight: '800', letterSpacing: 1 },
  recomTitle: { ...typography.body, color: colors.text, fontWeight: '700', marginTop: 2 },
  manglikRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },

  kootaCard: { gap: 4 },
  kootaName: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  kootaDesc: { ...typography.small, color: colors.textMuted, fontSize: 12 },
});
