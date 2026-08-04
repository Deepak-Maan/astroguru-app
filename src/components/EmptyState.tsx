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
          colors={['rgba(16,185,129,0.18)', 'rgba(245,158,11,0.06)']}
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
    borderColor: 'rgba(16,185,129,0.35)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  icon: { fontSize: 38 },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: '800' },
  message: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  button: { marginTop: spacing.lg, minWidth: 180 },
});
