import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../src/components/GradientBackground';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';

export interface DreamSymbol {
  icon: string;
  name: string;
  category: string;
  omen: 'Auspicious (Shubh)' | 'Inauspicious (Ashubh)' | 'Neutral';
  meaning: string;
  remedy?: string;
}

const DREAM_DICTIONARY: DreamSymbol[] = [
  {
    icon: '🐍',
    name: 'Snake / Cobra (Saamp)',
    category: 'Animals',
    omen: 'Auspicious (Shubh)',
    meaning: 'Seeing a snake in a dream indicates incoming wealth, kundalini awakening, or sudden financial gains.',
  },
  {
    icon: '🪽',
    name: 'Flying in the Sky (Udana)',
    category: 'Actions',
    omen: 'Auspicious (Shubh)',
    meaning: 'Symbolizes freedom from trouble, career promotion, and spiritual elevation.',
  },
  {
    icon: '🌊',
    name: 'Clear Water / River (Nadi)',
    category: 'Nature',
    omen: 'Auspicious (Shubh)',
    meaning: 'Purity, emotional peace, and purification of past bad karma.',
  },
  {
    icon: '🛕',
    name: 'Temple / Deity Idol (Mandir)',
    category: 'Spiritual',
    omen: 'Auspicious (Shubh)',
    meaning: 'Divine protection, fulfillment of long-pending desires & peace.',
  },
  {
    icon: '🦷',
    name: 'Teeth Falling Out (Daant Tootna)',
    category: 'Body',
    omen: 'Inauspicious (Ashubh)',
    meaning: 'Indicates temporary health issues in family or financial worry.',
    remedy: 'Donate milk or silver to a needy person on Monday.',
  },
  {
    icon: '🌧️',
    name: 'Heavy Rain / Storm (Varsha)',
    category: 'Nature',
    omen: 'Neutral',
    meaning: 'Heavy rainfall indicates intense emotional processing and upcoming major lifestyle changes.',
  },
];

export default function DreamsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDreams = DREAM_DICTIONARY.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Swapna Shastra" subtitle="Vedic Dream Meaning Interpreter" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Search Input */}
          <Card style={{ gap: spacing.xs }}>
            <Text style={styles.searchLabel}>🔍 Search Dream Symbol or Keyword:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. Snake, Flying, Water, Temple..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textFaint}
            />
          </Card>

          <SectionHeader title="Vedic Dream Interpretations" subtitle={`${filteredDreams.length} Omens Found`} />

          {filteredDreams.map((dream) => (
            <Card key={dream.name} style={styles.dreamCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Text style={{ fontSize: 32 }}>{dream.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dreamName}>{dream.name}</Text>
                  <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 2 }}>
                    <Chip
                      label={dream.omen}
                      tone={dream.omen.includes('Shubh') ? 'teal' : dream.omen.includes('Ashubh') ? 'rose' : 'gold'}
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.dreamMeaning}>{dream.meaning}</Text>

              {!!dream.remedy && (
                <View style={styles.remedyBox}>
                  <Text style={styles.remedyText}>💡 Recommended Remedy: {dream.remedy}</Text>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  searchLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },

  dreamCard: { gap: spacing.xs },
  dreamName: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  dreamMeaning: { ...typography.small, color: colors.textMuted, lineHeight: 20, marginTop: 4 },

  remedyBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 4,
  },
  remedyText: { ...typography.tiny, color: colors.danger, fontWeight: '800' },
});
