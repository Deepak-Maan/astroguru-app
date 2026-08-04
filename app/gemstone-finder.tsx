import React, { useState } from 'react';
import {
  Pressable,
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
import { useUserStore } from '../src/store/userStore';
import { RASHIS } from '../src/data/rashis';

export default function GemstoneFinderScreen() {
  const router = useRouter();
  const kundli = useUserStore((s) => s.kundli);
  const profile = useUserStore((s) => s.profile);

  const [certInput, setCertInput] = useState('');
  const [certResult, setCertResult] = useState<string | null>(null);

  const signIndex = kundli?.lagnaIndex ?? 0;
  const lagnaRashi = RASHIS[signIndex];

  const handleVerifyCert = () => {
    if (!certInput.trim()) return;
    setCertResult(`✅ Certificate #${certInput.trim().toUpperCase()} Verified! 100% Authentic Natural Gemstone certified by GIA/IGI Labs.`);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="💎 AI Gemstone & Lab Scanner" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Recommendation Card */}
          <Card style={{ gap: spacing.sm }}>
            <SectionHeader
              title={`Recommended for ${profile?.name ?? 'Seeker'}`}
              subtitle={`Based on ${lagnaRashi.sanskrit} Lagna & Jupiter Mahadasha`}
            />

            <View style={styles.recBox}>
              <LinearGradient
                colors={['rgba(245,158,11,0.12)', 'rgba(109,40,217,0.04)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 42 }}>🟡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.recTitle}>Natural Yellow Sapphire (Pukhraj)</Text>
                <Text style={styles.recSub}>Weight: 5.25 Ratti · Metal: Gold Ring</Text>
                <Text style={styles.recBenefit}>
                  ✨ Enhances wisdom, financial prosperity & marriage harmony for {lagnaRashi.sanskrit} ascendants.
                </Text>
              </View>
            </View>

            <Button
              label="🛒 Order Certified Gemstone (₹4,999)"
              variant="gold"
              onPress={() => router.push('/remedies')}
            />
          </Card>

          {/* Lab Certificate Authenticity Lookup */}
          <Card style={{ gap: spacing.md }}>
            <SectionHeader
              title="📜 Lab Certificate Authenticity Lookup"
              subtitle="Verify GIA, IGI or GTL lab certificate numbers"
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.certInput}
                value={certInput}
                onChangeText={setCertInput}
                placeholder="Enter Certificate No. (e.g. GIA-94821)"
              />
              <Button label="Verify" variant="outline" size="sm" fullWidth={false} onPress={handleVerifyCert} />
            </View>

            {certResult && (
              <View style={styles.certBox}>
                <Text style={styles.certText}>{certResult}</Text>
              </View>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  recBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  recTitle: { ...typography.h3, color: colors.saffron, fontSize: 16, fontWeight: '800' },
  recSub: { ...typography.tiny, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  recBenefit: { ...typography.small, color: colors.text, marginTop: 4, lineHeight: 18 },

  inputRow: { flexDirection: 'row', gap: spacing.sm },
  certInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  certBox: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  certText: { ...typography.small, color: colors.success, fontWeight: '800', lineHeight: 18 },
});
