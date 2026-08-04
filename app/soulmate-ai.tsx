import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function SoulmateAiScreen() {
  const router = useRouter();

  const [partnerName, setPartnerName] = useState('');
  const [partnerDob, setPartnerDob] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const handleCalculateChemistry = () => {
    if (!partnerName.trim()) return;
    setResult({
      score: 88,
      verdict: '✨ Exceptional Karmic Chemistry',
      aspects: [
        { label: '💖 Emotional Resonance', val: '92%' },
        { label: '🗣️ Intellectual Alignment', val: '85%' },
        { label: '🔥 Physical Attraction', val: '90%' },
        { label: '💰 Financial Growth', val: '86%' },
      ],
      summary: `${partnerName}’s Venus and your Moon form a highly harmonious Trine aspect, indicating deep mutual understanding and long-term marital bliss.`,
    });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🕊️ AI Soulmate Chemistry" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Partner Compatibility Input" subtitle="Analyze planetary attraction with your partner" />

            <View style={styles.field}>
              <Text style={styles.label}>Partner's Name</Text>
              <TextInput
                style={styles.input}
                value={partnerName}
                onChangeText={setPartnerName}
                placeholder="e.g. Priya Sharma"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Partner's DOB (Optional)</Text>
              <TextInput
                style={styles.input}
                value={partnerDob}
                onChangeText={setPartnerDob}
                placeholder="14/08/1998"
              />
            </View>

            <Button label="✨ Calculate Soulmate Chemistry" variant="gold" onPress={handleCalculateChemistry} />
          </Card>

          {result && (
            <Card style={{ gap: spacing.md }}>
              <View style={styles.scoreBox}>
                <LinearGradient
                  colors={['rgba(239,68,68,0.12)', 'rgba(245,158,11,0.04)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.scoreText}>{result.score}%</Text>
                <Text style={styles.verdictText}>{result.verdict}</Text>
              </View>

              <SectionHeader title="Chemistry Breakdown" />

              <View style={{ gap: spacing.xs }}>
                {result.aspects.map((asp: any) => (
                  <View key={asp.label} style={styles.aspectRow}>
                    <Text style={styles.aspectLabel}>{asp.label}</Text>
                    <Chip label={asp.val} tone="rose" />
                  </View>
                ))}
              </View>

              <Text style={styles.summaryText}>{result.summary}</Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  field: { gap: 4 },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  scoreBox: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  scoreText: { ...typography.display, fontSize: 44, color: colors.rose, fontWeight: '900' },
  verdictText: { ...typography.h3, color: colors.text, fontWeight: '800' },

  aspectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E8F3',
  },
  aspectLabel: { ...typography.small, color: colors.text, fontWeight: '700' },
  summaryText: { ...typography.small, color: colors.textMuted, lineHeight: 20, marginTop: 4 },
});
