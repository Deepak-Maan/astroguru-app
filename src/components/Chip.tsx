import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'default' | 'gold' | 'teal';
}

const TONE_COLORS = {
  default: colors.auroraB,
  gold: colors.gold,
  teal: colors.teal,
};

const TONE_BG = {
  default: 'rgba(194,75,255,0.12)',
  gold: 'rgba(245,197,66,0.12)',
  teal: 'rgba(56,225,195,0.12)',
};

const TONE_BORDER = {
  default: 'rgba(194,75,255,0.35)',
  gold: 'rgba(245,197,66,0.35)',
  teal: 'rgba(56,225,195,0.35)',
};

/** Small pill — used for filters, tags, specialties and suggestion chips. */
export function Chip({ label, selected = false, onPress, style, tone = 'default' }: ChipProps) {
  const accent = TONE_COLORS[tone];

  const container = (
    <View
      style={[
        styles.chip,
        !selected && tone !== 'default' && {
          backgroundColor: TONE_BG[tone],
          borderColor: TONE_BORDER[tone],
        },
        selected && styles.chipSelected,
        style,
      ]}
    >
      {selected && (
        <LinearGradient
          colors={[accent + 'DD', accent + '99']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text
        style={[
          styles.label,
          selected && { color: colors.white },
          !selected && tone !== 'default' && { color: accent },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return container;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.75 }]}
    >
      {container}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    alignSelf: 'flex-start',   // ← prevents vertical stretch in flex containers
    flexShrink: 0,
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  label: { ...typography.small, color: colors.textMuted, lineHeight: 18, fontSize: 13 },
});
