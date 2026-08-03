import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Elevated light surface with soft drop shadow. */
  elevated?: boolean;
  padded?: boolean;
}

/** Crisp Pure White Surface for Light Theme. */
export function Card({ children, style, elevated = false, padded = true }: Props) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.card,
  },
  padded: { padding: spacing.lg },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(125,60,152,0.20)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
});
