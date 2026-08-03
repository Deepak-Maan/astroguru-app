import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';
import { RASHIS } from '../../src/data/rashis';

export default function Welcome() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.hero}>
          <Text style={styles.badge}>वैदिक ज्योतिष</Text>
          <Text style={styles.title}>AstroGuru</Text>
          <Text style={styles.tagline}>
            Your Kundli, daily horoscope and trusted Jyotishis — all in one place.
          </Text>
        </View>

        {/* Zodiac ring of glyphs */}
        <View style={styles.glyphWrap}>
          {RASHIS.map((r) => (
            <View key={r.index} style={styles.glyphCell}>
              <Text style={styles.glyph}>{r.glyph}</Text>
              <Text style={styles.glyphName}>{r.sanskrit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.features}>
          {[
            ['🔑', 'Instant Account Access', 'Sign in with Email or 1-tap Mobile OTP'],
            ['📜', 'Daily Horoscope & Kundli', 'Accurate Dasha & Lagna planetary positions'],
            ['💬', 'Talk to Astrologers', 'Chat live with verified Vedic experts'],
            ['✨', 'AI Jyotishi Assistant', 'Ask anything about your fortune, anytime'],
          ].map(([icon, title, sub]) => (
            <View key={title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureSub}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            label="🔑 Sign In to Your Account"
            variant="gold"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          />
          <Button
            label="📝 Create Free Account"
            variant="outline"
            size="md"
            onPress={() => router.push('/(auth)/signup')}
          />
          <Text style={styles.disclaimer}>
            By continuing, you agree to AstroGuru Privacy Policy & Terms of Service.
          </Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: spacing.lg },
  badge: {
    ...typography.tiny,
    color: colors.saffron,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    fontWeight: '800',
  },
  title: { ...typography.display, fontSize: 38, color: colors.text, letterSpacing: 1, fontWeight: '800' },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    maxWidth: 320,
    fontWeight: '600',
  },
  glyphWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  glyphCell: {
    width: 52,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  glyph: { fontSize: 18, color: colors.saffron },
  glyphName: { fontSize: 8.5, color: colors.textMuted, marginTop: 1, fontWeight: '700' },
  features: { gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  featureTitle: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '800' },
  featureSub: { ...typography.small, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  footer: { marginBottom: spacing.lg, gap: spacing.sm },
  disclaimer: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 15,
  },
});
