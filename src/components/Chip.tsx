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
      {/* Top Specular Glint */}
      <View style={styles.topGlint} pointerEvents="none" />
      {selected && (
        <LinearGradient
          colors={['#D4AF37', '#F5D77F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text
        style={[
          styles.label,
          selected && { color: '#0F172A', fontWeight: '900' },
          !selected && tone !== 'default' && { color: accent, fontWeight: '800' },
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
      style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] }]}
    >
      {container}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
    backdropFilter: 'blur(16px) saturate(180%)' as any,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  topGlint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 2,
  },
  chipSelected: {
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    ...typography.small,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
    zIndex: 3,
  },
});
