import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface SoulmateProfile {
  archetype: string;
  avatarIcon: string;
  portraitGradient: [string, string];
  title: string;
  quote: string;
  physicalTraits: {
    eyes: string;
    complexion: string;
    stature: string;
    aura: string;
  };
  meetingTimeline: {
    window: string;
    transit: string;
    locationScenario: string;
    compatibleSigns: string[];
  };
  karmicScore: number;
  rulingPlanets: string;
  summary: string;
}

const ARCHETYPES: SoulmateProfile[] = [
  {
    archetype: 'The Celestial Mystic',
    avatarIcon: '🧝‍♀️',
    portraitGradient: ['#6366F1', '#EC4899'],
    title: 'Deep Soulful Visionary',
    quote: '"Their presence brings tranquility and emotional healing to your spirit."',
    physicalTraits: {
      eyes: 'Hypnotic, almond-shaped with contemplative emotional depth',
      complexion: 'Radiant fair with a soft luminescent moonlight undertone',
      stature: 'Poised, graceful demeanor with delicate artistic gestures',
      aura: 'Luminous Violet & Indigo (High Intuition & Wisdom)',
    },
    meetingTimeline: {
      window: 'November 2026 – March 2027',
      transit: 'Jupiter transiting natal 9th House trine to Venus',
      locationScenario: 'At a peaceful cultural retreat, seminar, or through a trusted family wedding',
      compatibleSigns: ['Cancer', 'Scorpio', 'Pisces'],
    },
    karmicScore: 94,
    rulingPlanets: 'Venus (Shukra) & Jupiter (Guru)',
    summary:
      'Your 7th House lord interacts harmoniously with Venus and Ketu, indicating a partner whose karmic purpose is mutual spiritual awakening, emotional safety, and unwavering fidelity.',
  },
  {
    archetype: 'The Solar Sovereign',
    avatarIcon: '👑',
    portraitGradient: ['#F59E0B', '#EF4444'],
    title: 'Dynamic Charismatic Leader',
    quote: '"A bold protector whose drive and warmth will inspire your greatest ambitions."',
    physicalTraits: {
      eyes: 'Bright, penetrating gaze full of enthusiasm and self-assurance',
      complexion: 'Warm golden wheatish with a healthy sun-kissed vitality',
      stature: 'Athletic, upright posture exuding innate authority and dignity',
      aura: 'Gilded Amber & Crimson (Courage & Solar Radiance)',
    },
    meetingTimeline: {
      window: 'August 2026 – December 2026',
      transit: 'Sun conjunct Mars in the 11th House of Gains',
      locationScenario: 'In a professional conference, leadership summit, or sports arena',
      compatibleSigns: ['Aries', 'Leo', 'Sagittarius'],
    },
    karmicScore: 91,
    rulingPlanets: 'Sun (Surya) & Mars (Mangal)',
    summary:
      'Mars aspects your 7th House with Raja Yoga strength, bringing a proactive, fiercely loyal companion who celebrates your achievements and stands as an unshakeable pillar.',
  },
  {
    archetype: 'The Balanced Harmonizer',
    avatarIcon: '🕊️',
    portraitGradient: ['#10B981', '#3B82F6'],
    title: 'Cultured Intellectual Companion',
    quote: '"Witty, polite, and deeply ethical—every conversation with them feels timeless."',
    physicalTraits: {
      eyes: 'Expressive, sparkling with curiosity and subtle humor',
      complexion: 'Smooth porcelain tone with clear gentle features',
      stature: 'Slim, elegant silhouette with sophisticated sartorial taste',
      aura: 'Emerald Green & Cyan (Balance & Truth)',
    },
    meetingTimeline: {
      window: 'January 2027 – May 2027',
      transit: 'Mercury Direct in 7th House with benefic aspect of Jupiter',
      locationScenario: 'At an airport lounge, high-end cafe, or through shared creative interests',
      compatibleSigns: ['Taurus', 'Libra', 'Gemini'],
    },
    karmicScore: 89,
    rulingPlanets: 'Mercury (Budh) & Venus (Shukra)',
    summary:
      'Mercury in a Kendra house ensures an effortless intellectual wavelength. You will share deep late-night conversations, mutual love for literature or travel, and smooth financial synergy.',
  },
];

export default function SoulmatePortraitScreen() {
  const router = useRouter();
  const userProfile = useUserStore((s) => s.profile);

  const [seekerName, setSeekerName] = useState(userProfile?.name || '');
  const [partnerPreference, setPartnerPreference] = useState<'female' | 'male' | 'any'>('female');
  const [focusArea, setFocusArea] = useState<'marriage' | 'karmic_love' | 'soul_connection'>('marriage');
  const [isGenerating, setIsGenerating] = useState(false);
  const [soulmateResult, setSoulmateResult] = useState<SoulmateProfile | null>(null);

  const handleGeneratePortrait = () => {
    if (!seekerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to align your natal coordinates.');
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (_) {}
    }

    setIsGenerating(true);
    setSoulmateResult(null);

    // Simulate high-precision 7th House / Darakaraka planetary synthesis
    setTimeout(() => {
      setIsGenerating(false);
      // Select archetype based on name hash or preference
      const charCode = seekerName.charCodeAt(0) || 0;
      const archetypeIndex = charCode % ARCHETYPES.length;
      setSoulmateResult(ARCHETYPES[archetypeIndex]);

      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }
    }, 1800);
  };

  const handleSharePortrait = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
    Alert.alert(
      '✨ Cosmic Portrait Saved',
      'Soulmate reading & meeting timeline copied! You can now share it with friends or save it to your sacred journal.'
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🎨 AI Soulmate Kundli Portrait" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Explainer Card */}
          <Card padded style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.25)', 'rgba(99, 102, 241, 0.15)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 36 }}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>7th House Cosmic Manifestation</Text>
                <Text style={styles.heroSub}>
                  Synthesizing your Kalatra Bhava, Venus degrees, and Darakaraka to reveal your soulmate's likeness and meeting window.
                </Text>
              </View>
            </View>
          </Card>

          {/* Input Controls Card */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader title="Your Natal Alignment" subtitle="Enter your preferences for precise planetary matching" />

            <View style={styles.field}>
              <Text style={styles.label}>Seeker Full Name *</Text>
              <TextInput
                style={styles.input}
                value={seekerName}
                onChangeText={setSeekerName}
                placeholder="e.g. Aarav Sharma"
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Looking For</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { id: 'female', label: '👩 Bride / Female' },
                  { id: 'male', label: '👨 Groom / Male' },
                  { id: 'any', label: '✨ Cosmic Energy' },
                ].map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    selected={partnerPreference === item.id}
                    onPress={() => setPartnerPreference(item.id as any)}
                    tone={partnerPreference === item.id ? 'gold' : 'default'}
                  />
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Consultation Purpose</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'marriage', label: '💍 Lifelong Marriage' },
                  { id: 'karmic_love', label: '💖 Karmic Love' },
                  { id: 'soul_connection', label: '🪷 Spiritual Twin Flame' },
                ].map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    selected={focusArea === item.id}
                    onPress={() => setFocusArea(item.id as any)}
                    tone={focusArea === item.id ? 'teal' : 'default'}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleGeneratePortrait}
              disabled={isGenerating}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                isGenerating && { opacity: 0.7 },
              ]}
            >
              {isGenerating ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color="#0A0C16" />
                  <Text style={styles.actionBtnText}>Calculating 7th House & Synthesizing Likeness…</Text>
                </View>
              ) : (
                <Text style={styles.actionBtnText}>✨ Reveal My Cosmic Soulmate Portrait</Text>
              )}
            </Pressable>
          </Card>

          {/* Generated Result Section */}
          {soulmateResult && (
            <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
              {/* Portrait Visualizer Card */}
              <Card padded style={styles.resultCard}>
                <LinearGradient
                  colors={soulmateResult.portraitGradient}
                  style={[StyleSheet.absoluteFill, { opacity: 0.18 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />

                <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
                  <View style={styles.avatarHalo}>
                    <Text style={{ fontSize: 56 }}>{soulmateResult.avatarIcon}</Text>
                  </View>
                  <Text style={styles.resultTitle}>{soulmateResult.archetype}</Text>
                  <Text style={styles.resultTag}>{soulmateResult.title}</Text>
                  <Text style={styles.resultQuote}>{soulmateResult.quote}</Text>
                </View>

                {/* Compatibility Meter */}
                <View style={styles.scoreRow}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreNum}>{soulmateResult.karmicScore}%</Text>
                    <Text style={styles.scoreLabel}>Karmic Resonance</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.planetsTitle}>🪐 Planetary Aligners:</Text>
                    <Text style={styles.planetsVal}>{soulmateResult.rulingPlanets}</Text>
                  </View>
                </View>

                {/* Physical Characteristics */}
                <View style={styles.sectionDivider} />
                <Text style={styles.subHeader}>👁️ Predicted Physical Likeness</Text>

                <View style={styles.traitsGrid}>
                  <View style={styles.traitBox}>
                    <Text style={styles.traitLabel}>EYES & GAZE</Text>
                    <Text style={styles.traitVal}>{soulmateResult.physicalTraits.eyes}</Text>
                  </View>
                  <View style={styles.traitBox}>
                    <Text style={styles.traitLabel}>COMPLEXION & TONE</Text>
                    <Text style={styles.traitVal}>{soulmateResult.physicalTraits.complexion}</Text>
                  </View>
                  <View style={styles.traitBox}>
                    <Text style={styles.traitLabel}>BEARING & STATURE</Text>
                    <Text style={styles.traitVal}>{soulmateResult.physicalTraits.stature}</Text>
                  </View>
                  <View style={styles.traitBox}>
                    <Text style={styles.traitLabel}>AURIC RADIANCE</Text>
                    <Text style={styles.traitVal}>{soulmateResult.physicalTraits.aura}</Text>
                  </View>
                </View>

                {/* Meeting Scenario & Timeline */}
                <View style={styles.sectionDivider} />
                <Text style={styles.subHeader}>⏳ Manifestation & Meeting Timeline</Text>

                <View style={styles.timelineCard}>
                  <View style={styles.timelineRow}>
                    <Text style={styles.timelineIcon}>🗓️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineLabel}>ESTIMATED TIME WINDOW</Text>
                      <Text style={styles.timelineVal}>{soulmateResult.meetingTimeline.window}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineRow}>
                    <Text style={styles.timelineIcon}>🪐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineLabel}>KEY ASTROLOGICAL TRANSIT</Text>
                      <Text style={styles.timelineVal}>{soulmateResult.meetingTimeline.transit}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineRow}>
                    <Text style={styles.timelineIcon}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineLabel}>LIKELY MEETING SCENARIO</Text>
                      <Text style={styles.timelineVal}>{soulmateResult.meetingTimeline.locationScenario}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineRow}>
                    <Text style={styles.timelineIcon}>♊</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineLabel}>HIGHLY RESONANT RASHIS</Text>
                      <Text style={styles.timelineVal}>
                        {soulmateResult.meetingTimeline.compatibleSigns.join(' · ')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>{soulmateResult.summary}</Text>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <Pressable onPress={handleSharePortrait} style={styles.shareBtn}>
                    <Text style={styles.shareBtnText}>📲 Save & Share Portrait</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/instant-consult')}
                    style={styles.consultBtn}
                  >
                    <Text style={styles.consultBtnText}>🔮 Consult Astrologer</Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  heroCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: '#FCD34D' },
  heroSub: { fontSize: 12, color: '#CBD5E1', marginTop: 3, lineHeight: 17 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#A5B4FC' },
  input: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    padding: 12,
    fontSize: 14,
    color: '#EEF2FF',
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: radius.lg,
    padding: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: { color: '#0A0C16', fontWeight: '900', fontSize: 15 },
  resultCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.9)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(252, 211, 77, 0.45)',
    overflow: 'hidden',
    gap: spacing.md,
  },
  avatarHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
    borderWidth: 2,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FCD34D',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  resultTitle: { fontSize: 22, fontWeight: '900', color: '#FDE68A', marginTop: 4 },
  resultTag: { fontSize: 13, fontWeight: '700', color: '#38BDF8', letterSpacing: 0.5 },
  resultQuote: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#CBD5E1',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: radius.md,
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  scoreBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  scoreNum: { fontSize: 20, fontWeight: '900', color: '#FCD34D' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: '#FDE68A', textTransform: 'uppercase' },
  planetsTitle: { fontSize: 11, fontWeight: '700', color: '#A5B4FC' },
  planetsVal: { fontSize: 13, fontWeight: '800', color: '#EEF2FF' },
  sectionDivider: { height: 1, backgroundColor: 'rgba(129, 140, 248, 0.2)', marginVertical: 2 },
  subHeader: { fontSize: 14, fontWeight: '800', color: '#EEF2FF', letterSpacing: 0.3 },
  traitsGrid: { gap: 8 },
  traitBox: {
    backgroundColor: 'rgba(10, 12, 22, 0.55)',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.18)',
  },
  traitLabel: { fontSize: 10, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.6 },
  traitVal: { fontSize: 12.5, color: '#E2E8F0', marginTop: 2, fontWeight: '500' },
  timelineCard: {
    backgroundColor: 'rgba(10, 12, 22, 0.65)',
    borderRadius: radius.lg,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  timelineIcon: { fontSize: 18, marginTop: 2 },
  timelineLabel: { fontSize: 10, fontWeight: '800', color: '#38BDF8', letterSpacing: 0.5 },
  timelineVal: { fontSize: 12.5, fontWeight: '600', color: '#F1F5F9', marginTop: 1 },
  summaryBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#818CF8',
  },
  summaryText: { fontSize: 12, color: '#C7D2FE', lineHeight: 18, fontStyle: 'italic' },
  shareBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  shareBtnText: { color: '#EEF2FF', fontWeight: '700', fontSize: 13 },
  consultBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  consultBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
