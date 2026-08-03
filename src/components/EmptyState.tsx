import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '✨', title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <LinearGradient
          colors={['rgba(122,60,255,0.20)', 'rgba(194,75,255,0.08)']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && (
        <Button
          label={actionLabel}
          onPress={onAction}
          size="sm"
          fullWidth={false}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122,60,255,0.3)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  icon: { fontSize: 38 },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', fontSize: 18 },
  message: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  button: { marginTop: spacing.lg, minWidth: 180 },
});
