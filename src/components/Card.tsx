import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

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
        onPress={onPress}
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
    borderRadius: radius.lg,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardGlow: {
    borderBottomColor: 'rgba(5, 150, 105, 0.4)',
    borderRightColor: 'rgba(5, 150, 105, 0.4)',
    shadowColor: 'rgba(5, 150, 105, 0.25)',
  },
  cardElevated: {
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  inner: { flex: 1 },
  padded: { padding: spacing.lg },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
