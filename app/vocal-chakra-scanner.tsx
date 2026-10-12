import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

interface ChakraData {
  name: string;
  sanskrit: string;
  color: string;
  level: number; // percentage
  status: 'Depleted' | 'Balanced' | 'Radiant';
  element: string;
  planet: string;
}

const DEFAULT_CHAKRAS: ChakraData[] = [
  { name: 'Root Chakra', sanskrit: 'Muladhara', color: '#EF4444', level: 86, status: 'Radiant', element: 'Earth', planet: 'Mars / Saturn' },
  { name: 'Sacral Chakra', sanskrit: 'Svadhisthana', color: '#F97316', level: 75, status: 'Balanced', element: 'Water', planet: 'Moon / Venus' },
  { name: 'Solar Plexus', sanskrit: 'Manipura', color: '#FACC15', level: 82, status: 'Balanced', element: 'Fire', planet: 'Sun / Mars' },
  { name: 'Heart Chakra', sanskrit: 'Anahata', color: '#10B981', level: 91, status: 'Radiant', element: 'Air', planet: 'Venus' },
  { name: 'Throat Chakra', sanskrit: 'Vishuddha', color: '#06B6D4', level: 41, status: 'Depleted', element: 'Ether / Space', planet: 'Mercury (Budh)' },
  { name: 'Third Eye', sanskrit: 'Ajna', color: '#6366F1', level: 78, status: 'Balanced', element: 'Light', planet: 'Jupiter / Moon' },
  { name: 'Crown Chakra', sanskrit: 'Sahasrara', color: '#A855F7', level: 88, status: 'Radiant', element: 'Cosmic Pure Light', planet: 'Ketu / Sun' },
];

export default function VocalChakraScannerScreen() {
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(5);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [soundBathPlaying, setSoundBathPlaying] = useState(false);
  const [chakras, setChakras] = useState<ChakraData[]>(DEFAULT_CHAKRAS);

  // Audio recording countdown simulation
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishRecording();
            return 0;
          }
          if (Platform.OS !== 'web') {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (_) {}
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (_) {}
    }
    setRecordSecondsLeft(5);
    setIsRecording(true);
  };

  const finishRecording = () => {
    setIsRecording(false);
    setAnalyzing(true);

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }

    // Simulate spectral frequency analysis
    setTimeout(() => {
      setAnalyzing(false);
      setHasScanned(true);

      // Randomize slightly for dynamic feel
      const updated = DEFAULT_CHAKRAS.map((c) => {
        if (c.name.includes('Throat')) {
          return { ...c, level: 38 + Math.floor(Math.random() * 10), status: 'Depleted' as const };
        }
        return { ...c, level: Math.min(95, c.level + Math.floor(Math.random() * 8) - 4) };
      });
      setChakras(updated);
    }, 1500);
  };

  const toggleSoundBath = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
    setSoundBathPlaying(!soundBathPlaying);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🎙️ Vocal Aura & 7-Chakra Scanner" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Explainer Card */}
          <Card padded style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.25)', 'rgba(6, 182, 212, 0.15)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 36 }}>🧘</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Nada Yoga Bio-Acoustic Analysis</Text>
                <Text style={styles.heroSub}>
                  Your vocal pitch, micro-tremors, and tone stability mirror your subtle energy body and active planetary blockages.
                </Text>
              </View>
            </View>
          </Card>

          {/* Recording & Scanner Interactive Card */}
          <Card padded style={styles.scannerCard}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={styles.scannerInstruction}>
                {isRecording
                  ? `Chant "OM" or speak naturally (${recordSecondsLeft}s)…`
                  : analyzing
                  ? 'Analyzing Vocal Pitch & Harmonic Overtones…'
                  : 'Tap & hold the microphone, then chant "OM" for 5 seconds'}
              </Text>
            </View>

            {/* Pulsing Mic Circle */}
            <Pressable
              onPress={startRecording}
              disabled={isRecording || analyzing}
              style={({ pressed }) => [
                styles.micCircle,
                isRecording && styles.micCircleRecording,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
            >
              {analyzing ? (
                <ActivityIndicator size="large" color="#FCD34D" />
              ) : (
                <Text style={{ fontSize: 44 }}>{isRecording ? '🔴' : '🎙️'}</Text>
              )}
              <Text style={styles.micSubText}>
                {isRecording ? `${recordSecondsLeft}s` : analyzing ? 'Scanning' : 'TAP TO SCAN'}
              </Text>
            </Pressable>

            {/* Soundwave Simulation Bars */}
            <View style={styles.waveRow}>
              {[12, 28, 42, 60, 34, 52, 68, 44, 26, 58, 70, 36, 18, 50, 64, 30].map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: isRecording ? Math.min(50, h + Math.random() * 20) : 8 },
                    isRecording && { backgroundColor: '#38BDF8' },
                  ]}
                />
              ))}
            </View>
          </Card>

          {/* Diagnostic Results (Shows after scan or default) */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="🌈 7-Chakra Bio-Energy Heatmap"
              subtitle="Current alignment level of your subtle spiritual vortexes"
            />

            <View style={{ gap: 10 }}>
              {chakras.map((chk) => (
                <View key={chk.name} style={styles.chakraRow}>
                  <View style={[styles.chakraDot, { backgroundColor: chk.color }]}>
                    <Text style={{ color: '#0A0C16', fontWeight: '900', fontSize: 11 }}>●</Text>
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.chakraTitle}>
                        {chk.name} · <Text style={{ color: '#A5B4FC' }}>{chk.sanskrit}</Text>
                      </Text>
                      <Text
                        style={[
                          styles.statusLabel,
                          chk.status === 'Depleted'
                            ? { color: '#FB7185' }
                            : chk.status === 'Radiant'
                            ? { color: '#34D399' }
                            : { color: '#FCD34D' },
                        ]}
                      >
                        {chk.level}% · {chk.status}
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${chk.level}%`, backgroundColor: chk.color }]} />
                    </View>
                    <Text style={styles.chakraSub}>
                      Element: {chk.element} · Ruled by {chk.planet}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Identified Blockage & Astrological Prescription */}
          <Card padded style={styles.diagnosticCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.diagnosticTitle}>PRIMARY BLOCKAGE: THROAT CHAKRA (VISHUDDHA)</Text>
                <Text style={styles.diagnosticTag}>Associated with Afflicted Mercury / Budh</Text>
              </View>
            </View>

            <Text style={styles.diagnosticBody}>
              Your vocal harmonic jitter indicates suppressed communication, boundary hesitation, or racing thoughts.
              In Vedic astrology, this is linked to Mercury transit stress.
            </Text>

            {/* Instant 432 Hz Sound Bath Player */}
            <View style={styles.soundBathBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.soundBathTitle}>🎵 432 Hz Tibetan Sound Bath Remedy</Text>
                <Text style={styles.soundBathSub}>
                  {soundBathPlaying ? 'Playing harmonic realignment frequency…' : 'Harmonic frequency to unblock Vishuddha space energy'}
                </Text>
              </View>

              <Pressable onPress={toggleSoundBath} style={styles.playBtn}>
                <Text style={styles.playBtnText}>{soundBathPlaying ? '⏸️ PAUSE' : '▶️ LISTEN'}</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push('/instant-consult')}
              style={({ pressed }) => [styles.consultBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.consultBtnText}>🔮 Consult Chakra Healing Pandit</Text>
            </Pressable>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  heroCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#38BDF8' },
  heroSub: { fontSize: 12, color: '#CBD5E1', marginTop: 3, lineHeight: 17 },
  scannerCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 20,
  },
  scannerInstruction: { fontSize: 13, color: '#EEF2FF', fontWeight: '700', textAlign: 'center', paddingHorizontal: 16 },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 3,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 6,
  },
  micCircleRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
    transform: [{ scale: 1.08 }],
    shadowColor: '#EF4444',
  },
  micSubText: { fontSize: 10, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.8, marginTop: 4 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  chakraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  chakraDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chakraTitle: { fontSize: 13, fontWeight: '800', color: '#EEF2FF' },
  statusLabel: { fontSize: 11, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, marginVertical: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
  chakraSub: { fontSize: 10.5, color: '#94A3B8' },
  diagnosticCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    gap: 12,
  },
  diagnosticTitle: { fontSize: 13, fontWeight: '900', color: '#FB7185', letterSpacing: 0.5 },
  diagnosticTag: { fontSize: 11, fontWeight: '700', color: '#FCD34D', marginTop: 1 },
  diagnosticBody: { fontSize: 12, color: '#E2E8F0', lineHeight: 18 },
  soundBathBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  soundBathTitle: { fontSize: 12.5, fontWeight: '800', color: '#38BDF8' },
  soundBathSub: { fontSize: 10.5, color: '#CBD5E1', marginTop: 2 },
  playBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  playBtnText: { color: '#0A0C16', fontWeight: '900', fontSize: 11 },
  consultBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: radius.md,
    padding: 13,
    alignItems: 'center',
  },
  consultBtnText: { color: '#0A0C16', fontWeight: '900', fontSize: 13.5 },
});
