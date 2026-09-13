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
    backgroundColor: 'rgba(26, 33, 64, 0.72)',
    borderRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.4)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 3,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.95)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'hidden',
  },
  cardGlow: {
    borderTopColor: '#818CF8',
    borderBottomColor: '#4F46E5',
    borderBottomWidth: 3.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  cardElevated: {
    borderBottomWidth: 4,
    borderBottomColor: '#312E81',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
  inner: { flex: 1 },
  padded: { padding: spacing.lg },
  pressed: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
    shadowOpacity: 0.2,
    elevation: 3,
    borderBottomWidth: 1.8,
  },
});
