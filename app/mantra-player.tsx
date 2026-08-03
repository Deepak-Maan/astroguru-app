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

export default function MantraPlayerScreen() {
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Mahamrityunjaya Mantra (108 Chants)',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्',
    freq: '432 Hz Solfeggio Meditation',
    duration: '15:42',
  });

  const tracks = [
    { title: 'Mahamrityunjaya Mantra (108 Chants)', sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्', freq: '432 Hz Solfeggio', duration: '15:42' },
    { title: 'Shri Hanuman Chalisa (Deep Ambient)', sanskrit: 'श्रीगुरु चरण सरोज रज निज मनु मुकुरु सुधारि', freq: '528 Hz Healing', duration: '09:15' },
    { title: 'Kanakadhara Stotram (Wealth & Grace)', sanskrit: 'अङ्गं हरेः पुलकभूषणमाश्रयन्ती', freq: '432 Hz Abundance', duration: '12:30' },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="📜 432Hz Vedic Mantra Player" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Main Audio Player Card */}
          <Card style={{ gap: spacing.md, alignItems: 'center' }}>
            <LinearGradient
              colors={['#6D28D9', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.discCircle}
            >
              <Text style={{ fontSize: 44 }}>🕉️</Text>
            </LinearGradient>

            <Text style={styles.trackTitle}>{currentTrack.title}</Text>
            <Text style={styles.trackSanskrit}>{currentTrack.sanskrit}</Text>
            <Chip label={currentTrack.freq} tone="gold" />

            {/* Playback Controls */}
            <View style={styles.controlRow}>
              <Pressable style={styles.ctrlBtn}>
                <Text style={{ fontSize: 22 }}>⏮️</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.playBtn}
              >
                <Text style={{ fontSize: 28, color: colors.white }}>{isPlaying ? '⏸️' : '▶️'}</Text>
              </Pressable>

              <Pressable style={styles.ctrlBtn}>
                <Text style={{ fontSize: 22 }}>⏭️</Text>
              </Pressable>
            </View>
          </Card>

          {/* Playlist */}
          <SectionHeader title="Sacred Vedic Tracks" subtitle="High frequency 432Hz / 528Hz audio" />

          {tracks.map((t) => (
            <Pressable
              key={t.title}
              onPress={() => {
                setCurrentTrack(t);
                setIsPlaying(true);
              }}
              style={({ pressed }) => [styles.trackRow, pressed && { opacity: 0.8 }]}
            >
              <Text style={{ fontSize: 24 }}>🎵</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{t.title}</Text>
                <Text style={styles.rowSub}>{t.freq} · {t.duration}</Text>
              </View>
              <Text style={styles.rowPlay}>{currentTrack.title === t.title && isPlaying ? '🔊' : '▶️'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  discCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: 'rgba(109,40,217,0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  trackTitle: { ...typography.h2, color: colors.text, textAlign: 'center', fontWeight: '800' },
  trackSanskrit: { ...typography.small, color: colors.saffron, textAlign: 'center', fontWeight: '700' },

  controlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.xs },
  ctrlBtn: { padding: spacing.sm },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  rowTitle: { ...typography.small, color: colors.text, fontWeight: '800' },
  rowSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  rowPlay: { fontSize: 18 },
});
