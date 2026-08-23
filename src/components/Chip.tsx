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
  default: 'rgba(5,150,105,0.12)',
  gold: 'rgba(217,119,6,0.12)',
  teal: 'rgba(5,150,105,0.12)',
  rose: 'rgba(225,29,72,0.12)',
};

const TONE_BORDER = {
  default: 'rgba(5,150,105,0.30)',
  gold: 'rgba(217,119,6,0.30)',
  teal: 'rgba(5,150,105,0.30)',
  rose: 'rgba(225,29,72,0.30)',
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
          colors={[accent + 'EE', accent + 'CC']}
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
    backdropFilter: 'blur(8px)' as any,
  },
  chipSelected: {
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    ...typography.tiny,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
