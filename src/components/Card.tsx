import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, shadow } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Inner content padding (default true). */
  padded?: boolean;
  glow?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  style,
  onPress,
  padded = true,
  glow = false,
  elevated = false,
}: Props) {
  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
      }
      onPress();
    }
  };

  const content = (
    <View style={[styles.inner, padded && styles.padded]}>
      {children}
    </View>
  );

  const containerStyle = [
    styles.card,
    glow && styles.cardGlow,
    elevated && styles.cardElevated,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          ...containerStyle,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 3.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#DDD6FE',
    borderRightColor: '#E2E8F0',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardGlow: {
    borderBottomWidth: 4,
    borderBottomColor: '#C4B5FD',
    borderRightColor: '#DDD6FE',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 6,
  },
  cardElevated: {
    borderBottomWidth: 4.5,
    borderBottomColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  inner: { flex: 1 },
  padded: { padding: spacing.lg },
  pressed: {
    transform: [{ translateY: 2 }, { scale: 0.96 }],
    shadowOpacity: 0.05,
    elevation: 2,
    borderBottomWidth: 1.8,
  },
});
