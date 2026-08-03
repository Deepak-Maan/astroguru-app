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
import { useUserStore } from '../src/store/userStore';
import { RASHIS } from '../src/data/rashis';

export default function AudioBriefingScreen() {
  const kundli = useUserStore((s) => s.kundli);
  const rashi = RASHIS[kundli?.moonRashiIndex ?? 0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [ambientTanpura, setAmbientTanpura] = useState(true);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Daily Voice Briefing" subtitle="AI Astrological Podcast" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Main Audio Player Card */}
          <Card style={styles.playerCard}>
            <LinearGradient colors={['#7D3C98', '#E67E22']} style={styles.heroArtwork}>
              <Text style={{ fontSize: 52 }}>🎙️</Text>
              <Text style={styles.podcastSign}>{rashi.sanskrit} ({rashi.english})</Text>
              <Text style={styles.podcastTitle}>Daily Cosmic Audio Forecast</Text>
            </LinearGradient>

            {/* 12-Bar Animated Soundwave Visualizer */}
            <View style={styles.visualizerRow}>
              {Array.from({ length: 14 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.soundBar,
                    {
                      height: isPlaying ? Math.max(10, Math.sin(i + Date.now() * 0.005) * 36 + 18) : 12,
                      backgroundColor: i % 2 === 0 ? colors.saffron : colors.auroraA,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Player Controls */}
            <View style={styles.controlsRow}>
              <Pressable style={styles.skipBtn}>
                <Text style={styles.skipText}>⏮️ 15s</Text>
              </Pressable>

              <Pressable onPress={() => setIsPlaying(!isPlaying)} style={styles.playPauseBtn}>
                <LinearGradient colors={['#E67E22', '#D4AC0D']} style={StyleSheet.absoluteFill} />
                <Text style={{ fontSize: 32 }}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </Pressable>

              <Pressable style={styles.skipBtn}>
                <Text style={styles.skipText}>15s ⏭️</Text>
              </Pressable>
            </View>

            {/* Ambient Sound Toggle */}
            <View style={styles.ambientRow}>
              <Chip
                label={ambientTanpura ? '🪕 Ambient Tanpura: ON' : '🪕 Ambient Tanpura: OFF'}
                tone={ambientTanpura ? 'gold' : 'teal'}
              />
              <Button
                label="Toggle Background Music"
                variant="outline"
                size="sm"
                onPress={() => setAmbientTanpura(!ambientTanpura)}
              />
            </View>
          </Card>

          {/* Podcast Transcript */}
          <SectionHeader title="Voice Briefing Transcript" subtitle="Full AI Audio Summary" />

          <Card style={{ gap: spacing.xs }}>
            <Text style={styles.transcriptText}>
              "Namaste Seeker! Today, Jupiter aligns gracefully with your Moon sign <Text style={{ fontWeight: '800', color: colors.saffron }}>{rashi.sanskrit}</Text>. You will feel a surge of creative clarity and financial confidence before 02:00 PM. Avoid major arguments in the evening as Saturn casts a subtle glance. Your lucky color today is Saffron Gold."
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  playerCard: { alignItems: 'center', gap: spacing.lg },
  heroArtwork: {
    width: '100%',
    height: 180,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: 'rgba(125,60,152,0.40)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  podcastSign: { ...typography.h1, color: colors.white, fontSize: 24, fontWeight: '800' },
  podcastTitle: { ...typography.tiny, color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: 1 },

  visualizerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 44 },
  soundBar: { width: 4, borderRadius: 2 },

  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  skipBtn: { padding: spacing.sm },
  skipText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800' },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(230,126,34,0.40)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },

  ambientRow: { gap: spacing.xs, alignItems: 'center', width: '100%' },
  transcriptText: { ...typography.body, color: colors.text, lineHeight: 22, fontStyle: 'italic' },
});
