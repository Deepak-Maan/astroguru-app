import React, { useState } from 'react';
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

export default function GitaAudioScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="📖 Daily Bhagavad Gita Audio" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={{ gap: spacing.md, alignItems: 'center' }}>
            <Chip label="CHAPTER 2 · SHLOKA 47" tone="gold" />

            <Text style={styles.shlokaSanskrit}>
              कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।{'\n'}मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
            </Text>

            <Text style={styles.shlokaTrans}>
              "You have a right to perform your prescribed duty, but you are never entitled to the fruits of action."
            </Text>

            <Pressable
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playBtn}
            >
              <Text style={{ fontSize: 26, color: colors.white }}>{isPlaying ? '⏸️ Pause Commentary' : '▶️ Play 2-Min Audio Guidance'}</Text>
            </Pressable>
          </Card>

          <SectionHeader title="Modern Life Application" subtitle="Practical wisdom for daily stress & focus" />

          <Card style={{ gap: spacing.xs }}>
            <Text style={styles.appTitle}>🎯 Overcoming Fear of Failure at Work</Text>
            <Text style={styles.appBody}>
              Focus 100% of your energy on executing your project today without anxiety over the final outcome. When expectations are detached, performance peaks naturally.
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  shlokaSanskrit: { ...typography.h3, color: colors.saffron, textAlign: 'center', lineHeight: 26, fontWeight: '800' },
  shlokaTrans: { ...typography.body, color: colors.text, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },

  playBtn: {
    backgroundColor: colors.saffron,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    elevation: 4,
  },

  appTitle: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  appBody: { ...typography.small, color: colors.textMuted, lineHeight: 20 },
});
