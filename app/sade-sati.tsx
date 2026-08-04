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
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { RASHIS } from '../src/data/rashis';
import { useUserStore } from '../src/store/userStore';

export default function SadeSatiScreen() {
  const kundli = useUserStore((s) => s.kundli);
  const [selectedRashi, setSelectedRashi] = useState(kundli?.moonRashiIndex ?? 0);

  const rashi = RASHIS[selectedRashi];

  // Saturn (Shani) Sade Sati calculation logic
  const sadeSatiStatus =
    selectedRashi === 9 || selectedRashi === 10 || selectedRashi === 11
      ? { active: true, phase: selectedRashi === 10 ? 'Phase 2 · Peak (Core Impact)' : 'Phase 1 · Rising', risk: 'High', remediesNeeded: true }
      : { active: false, phase: 'No Active Sade Sati', risk: 'Low', remediesNeeded: false };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Saturn Sade Sati & Transit" subtitle="Real-time Planetary Gochar Analysis" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Rashi Picker Selector */}
          <Card>
            <SectionHeader title="Select Your Moon Sign (Rashi)" subtitle="To check Saturn Sade Sati & Jupiter Transit" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={styles.rashiPicker}>
                {RASHIS.map((r, i) => (
                  <Pressable
                    key={r.sanskrit}
                    onPress={() => setSelectedRashi(i)}
                    style={[styles.rashiChip, selectedRashi === i && styles.chipActive]}
                  >
                    <Text style={[styles.rashiChipText, selectedRashi === i && styles.chipTextActive]}>
                      {r.glyph} {r.sanskrit}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Card>

          {/* Sade Sati Phase Status Banner */}
          <LinearGradient
            colors={sadeSatiStatus.active ? ['#FFFFFF', '#FFF5F5'] : ['#FFFFFF', '#F8FAFC']}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <Text style={{ fontSize: 32 }}>🪐</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rashiTitle}>{rashi.sanskrit} ({rashi.english})</Text>

                <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 4 }}>
                  <Chip
                    label={sadeSatiStatus.phase}
                    tone={sadeSatiStatus.active ? 'rose' : 'teal'}
                  />
                  <Chip label={`Saturn Transit Risk: ${sadeSatiStatus.risk}`} tone={sadeSatiStatus.active ? 'gold' : 'teal'} />
                </View>
              </View>
            </View>

            <Text style={styles.statusDesc}>
              {sadeSatiStatus.active
                ? `Saturn is currently transiting through your 12th, 1st, or 2nd house from your Moon sign. This indicates major transformation, career shifts, and spiritual discipline.`
                : `Saturn is currently in a favorable house from your Moon sign. No active Sade Sati or Dhaiya phase present for ${rashi.sanskrit}.`}
            </Text>
          </LinearGradient>

          {/* Jupiter & Rahu-Ketu Gochar Impacts */}
          <SectionHeader title="2026 Major Planetary Transits" subtitle="Current Gochar Effects on Your Rashi" />

          {[
            {
              planet: 'Jupiter (Guru Gochar)',
              icon: '👑',
              status: 'Transiting 5th House',
              effect: 'Extremely favorable for wealth, higher education, career promotion, and auspicious family events.',
              tone: 'teal',
            },
            {
              planet: 'Saturn (Shani Gochar)',
              icon: '🪐',
              status: sadeSatiStatus.phase,
              effect: 'Demands patience, hard work, and strict discipline in finances & health.',
              tone: sadeSatiStatus.active ? 'rose' : 'gold',
            },
            {
              planet: 'Rahu-Ketu Axis Gochar',
              icon: '🌌',
              status: 'Transiting 11th & 5th Houses',
              effect: 'Unlocks sudden speculative gains, foreign opportunities, and creative breakthroughs.',
              tone: 'gold',
            },
          ].map((item) => (
            <Card key={item.planet} style={styles.transitCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transitPlanet}>{item.planet}</Text>
                  <Text style={styles.transitStatus}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.transitEffect}>{item.effect}</Text>
            </Card>
          ))}

          {/* Remedial Measures */}
          {sadeSatiStatus.active && (
            <Card style={styles.remedyCard}>
              <SectionHeader title="Recommended Saturn Remedies" subtitle="Perform on Saturdays for relief" />
              {[
                '• Recite Hanuman Chalisa or Shani Beej Mantra daily (108 times).',
                '• Donate Mustard Oil, Black Til, or Iron utensils on Saturday evenings.',
                '• Wear an energised Blue Sapphire (Neelam) or Iron Ring on middle finger.',
              ].map((rem, idx) => (
                <Text key={idx} style={styles.remedyText}>{rem}</Text>
              ))}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

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
  rashiChipText: { ...typography.tiny, color: colors.text, fontWeight: '700' },
  chipTextActive: { color: colors.white },

  statusCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rashiTitle: { ...typography.h1, color: colors.text, fontSize: 20, fontWeight: '800' },
  statusDesc: { ...typography.small, color: colors.textMuted, lineHeight: 20 },

  transitCard: { gap: spacing.xs },
  transitPlanet: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  transitStatus: { ...typography.tiny, color: colors.saffron, fontWeight: '700' },
  transitEffect: { ...typography.small, color: colors.textMuted, lineHeight: 20, marginTop: 2 },

  remedyCard: { gap: spacing.xs },
  remedyText: { ...typography.small, color: colors.text, lineHeight: 20 },
});
