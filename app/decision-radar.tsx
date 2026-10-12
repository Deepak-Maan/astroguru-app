import React, { useEffect, useState } from 'react';
import {
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

interface ChoghadiyaSlot {
  name: string;
  type: 'amrit' | 'shubh' | 'labh' | 'char' | 'rog' | 'kaal' | 'udveg';
  timeRange: string;
  verdict: 'Auspicious' | 'Favorable' | 'Neutral' | 'Inauspicious' | 'Avoid';
  color: string;
  meaning: string;
}

const TODAY_SLOTS: ChoghadiyaSlot[] = [
  { name: 'Shubh', type: 'shubh', timeRange: '06:15 AM – 07:45 AM', verdict: 'Auspicious', color: '#10B981', meaning: 'Optimal for spiritual rites & fresh beginnings' },
  { name: 'Rog', type: 'rog', timeRange: '07:45 AM – 09:15 AM', verdict: 'Inauspicious', color: '#F43F5E', meaning: 'Avoid medical surgeries or heated debates' },
  { name: 'Udveg', type: 'udveg', timeRange: '09:15 AM – 10:45 AM', verdict: 'Inauspicious', color: '#FB7185', meaning: 'High stress window; avoid speculative risks' },
  { name: 'Char', type: 'char', timeRange: '10:45 AM – 12:15 PM', verdict: 'Neutral', color: '#38BDF8', meaning: 'Favorable for swift travel & transport' },
  { name: 'Labh', type: 'labh', timeRange: '12:15 PM – 01:45 PM', verdict: 'Favorable', color: '#FCD34D', meaning: 'Lucrative for commercial deals & profits' },
  { name: 'Amrit', type: 'amrit', timeRange: '01:45 PM – 03:15 PM', verdict: 'Auspicious', color: '#10B981', meaning: 'Golden nectar period; guaranteed success' },
  { name: 'Kaal (Rahu Kaal)', type: 'kaal', timeRange: '03:15 PM – 04:45 PM', verdict: 'Avoid', color: '#E11D48', meaning: 'Strictly avoid signing deeds, money transfers or romance' },
  { name: 'Shubh', type: 'shubh', timeRange: '04:45 PM – 06:15 PM', verdict: 'Auspicious', color: '#10B981', meaning: 'Auspicious closure for business & evening pujas' },
];

export default function DecisionRadarScreen() {
  const router = useRouter();

  const [selectedActivity, setSelectedActivity] = useState<string>('💼 Sign Contract');
  const [customQuery, setCustomQuery] = useState('');
  const [verdictData, setVerdictData] = useState<{
    tone: 'green' | 'yellow' | 'red';
    statusText: string;
    headline: string;
    explanation: string;
    nextBestWindow: string;
  } | null>(null);

  // Time remaining countdown simulation
  const [minsRemaining, setMinsRemaining] = useState(38);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinsRemaining((prev) => (prev > 1 ? prev - 1 : 45));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleEvaluateTiming = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }

    const currentHour = new Date().getHours();
    // Deterministic yet realistic dynamic evaluation
    if (selectedActivity.includes('Contract') || selectedActivity.includes('Trade')) {
      if (currentHour >= 15 && currentHour < 17) {
        // Rahu Kaal window
        setVerdictData({
          tone: 'red',
          statusText: '🔴 STRICT HOLD — RAHU KAAL ACTIVE',
          headline: 'High Probability of Misunderstandings or Hidden Clauses',
          explanation:
            'Rahu’s shadow transit currently dominates the horizon. Avoid committing funds, finalizing agreements, or clicking execute on high-leverage trades for the next 35 minutes.',
          nextBestWindow: 'Optimal Golden Window opens at 04:45 PM (Shubh Choghadiya)',
        });
      } else {
        setVerdictData({
          tone: 'green',
          statusText: '🟢 GO AHEAD — LABH / AMRIT WINDOW ACTIVE',
          headline: 'Planetary Transits Strongly Favor Commercial Growth',
          explanation:
            'Mercury & Jupiter aspect is currently benevolent. Your communicative clarity and negotiating leverage are peaked right now. Safe to execute.',
          nextBestWindow: 'Peak potency holds for the next 42 minutes.',
        });
      }
    } else {
      setVerdictData({
        tone: 'yellow',
        statusText: '🟡 PROCEED WITH CAUTION (CHAR WINDOW)',
        headline: 'Acceptable for Minor Actions, Re-Check Critical Details',
        explanation:
          'Char indicates momentum and change. Good for movement, short travels, or routine tasks, but not ideal for binding lifelong commitments.',
        nextBestWindow: 'Next highly auspicious period starts at 01:45 PM (Amrit)',
      });
    }

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="🛡️ Cosmic Decision Radar" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Live Status Beacon Card */}
          <Card padded style={styles.beaconCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(56, 189, 248, 0.08)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.livePill}>
                <View style={styles.pulsingDot} />
                <Text style={styles.liveText}>LIVE CHOGHADIYA RADAR</Text>
              </View>
              <Text style={styles.countdownBadge}>⏳ {minsRemaining}m remaining in slot</Text>
            </View>

            <View style={{ marginTop: 14, gap: 4 }}>
              <Text style={styles.activeSlotName}>✨ Current Period: AMRIT (अमृत)</Text>
              <Text style={styles.activeSlotSub}>
                The highest nectar period. Highly auspicious for signing deals, launching projects, and starting sacred journeys.
              </Text>
            </View>

            <View style={styles.rahuWarningRow}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
              <Text style={styles.rahuWarningText}>
                Upcoming Rahu Kaal: <Text style={{ color: '#FB7185', fontWeight: '800' }}>03:15 PM – 04:45 PM</Text> (Plan around it)
              </Text>
            </View>
          </Card>

          {/* Instant Decision Maker Card */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="⚡ 1-Tap 'Should I Do This Now?'"
              subtitle="Get instantaneous Vedic Muhurat clearance before making a move"
            />

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Select Planned Activity</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[
                  '💼 Sign Contract',
                  '💰 Stock / F&O Trade',
                  '✈️ Start Journey',
                  '💍 Propose / Romance',
                  '🚗 Buy Vehicle / House',
                  '📱 Tech / Gold Buy',
                ].map((act) => (
                  <Chip
                    key={act}
                    label={act}
                    selected={selectedActivity === act}
                    onPress={() => setSelectedActivity(act)}
                    tone={selectedActivity === act ? 'gold' : 'default'}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Or Type Specific Question (Optional)</Text>
              <TextInput
                style={styles.input}
                value={customQuery}
                onChangeText={setCustomQuery}
                placeholder="e.g. Can I submit my job application right now?"
                placeholderTextColor={colors.textFaint}
              />
            </View>

            <Pressable
              onPress={handleEvaluateTiming}
              style={({ pressed }) => [styles.evalBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            >
              <Text style={styles.evalBtnText}>🎯 Check Cosmic Timing Verdict</Text>
            </Pressable>

            {/* Verdict Display */}
            {verdictData && (
              <View
                style={[
                  styles.verdictBox,
                  verdictData.tone === 'red'
                    ? styles.verdictRed
                    : verdictData.tone === 'yellow'
                    ? styles.verdictYellow
                    : styles.verdictGreen,
                ]}
              >
                <Text
                  style={[
                    styles.verdictStatus,
                    {
                      color:
                        verdictData.tone === 'red'
                          ? '#FB7185'
                          : verdictData.tone === 'yellow'
                          ? '#FCD34D'
                          : '#34D399',
                    },
                  ]}
                >
                  {verdictData.statusText}
                </Text>
                <Text style={styles.verdictHeadline}>{verdictData.headline}</Text>
                <Text style={styles.verdictExp}>{verdictData.explanation}</Text>

                <View style={styles.bestWindowRow}>
                  <Text style={{ fontSize: 16 }}>🌟</Text>
                  <Text style={styles.bestWindowText}>{verdictData.nextBestWindow}</Text>
                </View>
              </View>
            )}
          </Card>

          {/* 24-Hour Choghadiya Timeline Card */}
          <Card padded style={{ gap: spacing.md }}>
            <SectionHeader
              title="📅 Today's Vedic Choghadiya Timeline"
              subtitle="Full daylight & evening energy transit slots"
            />

            <View style={{ gap: 10 }}>
              {TODAY_SLOTS.map((slot, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.slotRow,
                    slot.type === 'kaal' && { borderColor: 'rgba(244, 63, 94, 0.45)', backgroundColor: 'rgba(244, 63, 94, 0.1)' },
                  ]}
                >
                  <View style={[styles.slotBadge, { backgroundColor: slot.color + '25', borderColor: slot.color }]}>
                    <Text style={[styles.slotName, { color: slot.color }]}>{slot.name}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.slotTime}>{slot.timeRange}</Text>
                    <Text style={styles.slotMeaning}>{slot.meaning}</Text>
                  </View>
                  <View
                    style={[
                      styles.verdictTag,
                      {
                        backgroundColor:
                          slot.verdict === 'Auspicious'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : slot.verdict === 'Avoid'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color:
                          slot.verdict === 'Auspicious'
                            ? '#34D399'
                            : slot.verdict === 'Avoid'
                            ? '#FB7185'
                            : '#FCD34D',
                      }}
                    >
                      {slot.verdict}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  beaconCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    overflow: 'hidden',
  },
  livePill: {
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
  pulsingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#6EE7B7', letterSpacing: 0.6 },
  countdownBadge: { fontSize: 11, color: '#FCD34D', fontWeight: '700' },
  activeSlotName: { fontSize: 20, fontWeight: '900', color: '#FDE68A' },
  activeSlotSub: { fontSize: 12.5, color: '#CBD5E1', lineHeight: 18 },
  rahuWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  rahuWarningText: { fontSize: 12, color: '#E2E8F0', fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '700', color: '#A5B4FC' },
  input: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    padding: 12,
    fontSize: 14,
    color: '#EEF2FF',
  },
  evalBtn: {
    backgroundColor: colors.teal,
    borderRadius: radius.lg,
    padding: 15,
    alignItems: 'center',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  evalBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  verdictBox: {
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1.5,
    gap: 6,
    marginTop: 6,
  },
  verdictGreen: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.45)' },
  verdictYellow: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.45)' },
  verdictRed: { backgroundColor: 'rgba(244, 63, 94, 0.18)', borderColor: 'rgba(244, 63, 94, 0.5)' },
  verdictStatus: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  verdictHeadline: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  verdictExp: { fontSize: 12, color: '#CBD5E1', lineHeight: 17 },
  bestWindowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  bestWindowText: { fontSize: 12, fontWeight: '700', color: '#FDE68A' },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  slotBadge: {
    width: 64,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  slotName: { fontSize: 12, fontWeight: '900' },
  slotTime: { fontSize: 12, fontWeight: '700', color: '#EEF2FF' },
  slotMeaning: { fontSize: 10.5, color: '#94A3B8' },
  verdictTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
});
