import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'default' | 'gold' | 'teal' | 'rose';
}

const TONE_COLORS = {
  default: colors.teal,
  gold: colors.gold,
  teal: colors.teal,
  rose: colors.rose,
};

const TONE_BG = {
  default: 'rgba(16,185,129,0.14)',
  gold: 'rgba(245,158,11,0.14)',
  teal: 'rgba(16,185,129,0.14)',
  rose: 'rgba(244,63,94,0.14)',
};

const TONE_BORDER = {
  default: 'rgba(16,185,129,0.35)',
  gold: 'rgba(245,158,11,0.35)',
  teal: 'rgba(16,185,129,0.35)',
  rose: 'rgba(244,63,94,0.35)',
};

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
          selected && { color: colors.white, fontWeight: '800' },
          !selected && tone !== 'default' && { color: accent, fontWeight: '700' },
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
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  label: { ...typography.small, color: colors.textMuted, lineHeight: 18, fontSize: 13, fontWeight: '600' },
});
