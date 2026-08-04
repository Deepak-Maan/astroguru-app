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

export interface MantraItem {
  id: string;
  name: string;
  sanskrit: string;
  benefit: string;
  deity: string;
}

const MANTRAS_LIST: MantraItem[] = [
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    benefit: 'Illuminates intellect, grants spiritual wisdom & inner peace',
    deity: 'Goddess Gayatri / Sun',
  },
  {
    id: 'mahamrityunjaya',
    name: 'Mahamrityunjaya Mantra',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
    benefit: 'Grants longevity, physical healing & freedom from fear of death',
    deity: 'Lord Shiva',
  },
  {
    id: 'shiva',
    name: 'Om Namah Shivaya',
    sanskrit: 'ॐ नमः शिवाय',
    benefit: 'Purifies negative karma, calms the mind & elevates consciousness',
    deity: 'Lord Shiva',
  },
  {
    id: 'krishna',
    name: 'Hare Krishna Mahamantra',
    sanskrit: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे॥',
    benefit: 'Awakens divine love, removes anxiety & brings bliss',
    deity: 'Lord Krishna & Radha',
  },
];

export default function JapaMalaScreen() {
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS_LIST[0]);
  const [beadCount, setBeadCount] = useState(0); // 0 to 108
  const [completedMalas, setCompletedMalas] = useState(0);
  const [totalChants, setTotalChants] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  const incrementBead = () => {
    setTotalChants((prev) => prev + 1);
    if (beadCount + 1 >= 108) {
      setBeadCount(0);
      setCompletedMalas((prev) => prev + 1);
      setCelebrated(true);
      setTimeout(() => setCelebrated(false), 4000);
    } else {
      setBeadCount((prev) => prev + 1);
    }
  };

  const resetCounter = () => {
    setBeadCount(0);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Digital 108 Japa Mala" subtitle="Mantra Chanting & Meditation" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Completion Celebration Banner */}
          {celebrated && (
            <View style={styles.celebrationBanner}>
              <Text style={{ fontSize: 32 }}>🎉 📿</Text>
              <Text style={styles.celebrationText}>
                Haraye Namah! 1 Mala (108 Beads) Completed Successfully!
              </Text>
            </View>
          )}

          {/* Mantra Selector */}
          <Card>
            <SectionHeader title="Select Sacred Mantra" subtitle="Choose mantra for your daily Japa" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={styles.mantraRow}>
                {MANTRAS_LIST.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      setSelectedMantra(m);
                      setBeadCount(0);
                    }}
                    style={[styles.mantraChip, selectedMantra.id === m.id && styles.mantraChipActive]}
                  >
                    <Text style={[styles.mantraChipText, selectedMantra.id === m.id && styles.chipTextActive]}>
                      📿 {m.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.mantraBox}>
              <Text style={styles.mantraSanskrit}>{selectedMantra.sanskrit}</Text>
              <Text style={styles.mantraBenefit}>✨ {selectedMantra.benefit}</Text>
            </View>
          </Card>

          {/* Interactive 108 Bead Tap Counter */}
          <Card style={styles.malaCard}>
            <Text style={styles.deityLabel}>CHANTING TO: {selectedMantra.deity.toUpperCase()}</Text>

            <Pressable
              onPress={incrementBead}
              style={({ pressed }) => [styles.beadTapCircle, pressed && styles.beadTapPressed]}
            >
              <LinearGradient
                colors={['#7D3C98', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.beadNumber}>{beadCount}</Text>
              <Text style={styles.beadMax}>/ 108 BEADS</Text>
              <Text style={styles.tapInstruction}>TAP TO CHANT</Text>
            </Pressable>

            {/* Mala Statistics */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{completedMalas}</Text>
                <Text style={styles.statLabel}>Completed Malas</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.saffron }]}>{totalChants}</Text>
                <Text style={styles.statLabel}>Total Chants Today</Text>
              </View>
            </View>

            <Button label="🔄 Reset Bead Counter" variant="outline" size="sm" onPress={resetCounter} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  celebrationBanner: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  celebrationText: { ...typography.body, color: colors.success, fontWeight: '800', textAlign: 'center' },

  mantraRow: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 4 },
  mantraChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  mantraChipActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  mantraChipText: { ...typography.tiny, color: colors.text, fontWeight: '700' },
  chipTextActive: { color: colors.white },

  mantraBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.xs,
  },
  mantraSanskrit: { ...typography.body, color: colors.auroraA, fontWeight: '800', textAlign: 'center', lineHeight: 24 },
  mantraBenefit: { ...typography.tiny, color: colors.textMuted, textAlign: 'center', fontStyle: 'italic' },

  malaCard: { alignItems: 'center', gap: spacing.md },
  deityLabel: { ...typography.tiny, color: colors.saffron, fontWeight: '800', letterSpacing: 1.2 },

  beadTapCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(125,60,152,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 8,
  },
  beadTapPressed: { transform: [{ scale: 0.95 }] },
  beadNumber: { ...typography.display, fontSize: 52, color: colors.white, fontWeight: '900' },
  beadMax: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', fontWeight: '800' },
  tapInstruction: { ...typography.tiny, color: colors.white, marginTop: 4, letterSpacing: 1.5, fontWeight: '900' },

  statsRow: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  statNum: { ...typography.h1, fontSize: 26, color: colors.auroraA, fontWeight: '800' },
  statLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});
