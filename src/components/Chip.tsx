import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  tone?: 'default' | 'gold' | 'teal' | 'rose';
}

const TONE_COLORS = {
  default: colors.primary,
  gold: colors.coral, // Replaced gold with punch rose
  teal: colors.teal,
  rose: colors.rose,
};

const TONE_BG = {
  default: 'rgba(124, 58, 237, 0.10)',
  gold: 'rgba(219, 39, 119, 0.10)',
  teal: 'rgba(6, 182, 212, 0.10)',
  rose: 'rgba(219, 39, 119, 0.10)',
};

const TONE_BORDER = {
  default: 'rgba(124, 58, 237, 0.25)',
  gold: 'rgba(219, 39, 119, 0.25)',
  teal: 'rgba(6, 182, 212, 0.25)',
  rose: 'rgba(219, 39, 119, 0.25)',
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
      onPress={() => {
        if (Platform.OS !== 'web') {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (_) {}
        }
        onPress();
      }}
      style={({ pressed }) => [
        pressed && { transform: [{ translateY: 1.5 }], opacity: 0.88 },
      ]}
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
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.35)',
    borderLeftColor: 'rgba(129, 140, 248, 0.2)',
    borderRightWidth: 1.2,
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    flexShrink: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  chipSelected: {
    borderColor: 'transparent',
    borderBottomWidth: 3,
    borderBottomColor: '#312E81',
  },
  label: { ...typography.small, color: '#EEF2FF', lineHeight: 18, fontSize: 13, fontWeight: '700' },
});
