import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const heights: Record<Size, number> = { sm: 36, md: 44, lg: 50 };
const fontSizes: Record<Size, number> = { sm: 13, md: 14.5, lg: 15.5 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  icon,
  fullWidth = true,
}: Props) {
  const isFlat = variant === 'outline' || variant === 'ghost' || variant === 'danger';
  const inactive = disabled || loading;

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator size="small" color={isFlat ? colors.text : colors.white} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { fontSize: fontSizes[size] },
              variant === 'outline' && { color: colors.text },
              variant === 'ghost' && { color: colors.textMuted },
              variant === 'danger' && { color: colors.danger },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { height: heights[size] },
        fullWidth && { alignSelf: 'stretch' },
        isFlat && styles[variant],
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      {isFlat ? (
        content
      ) : (
        <LinearGradient
          colors={
            variant === 'gold'
              ? ['#D4AF37', '#E6CA65', '#B8902A']
              : ['#D4AF37', '#E6CA65']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  gradient: { flex: 1, justifyContent: 'center' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
  },
  label: { ...typography.h3, color: '#0F172A', fontWeight: '900', letterSpacing: 0.2 },
  outline: {
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(12px)' as any,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
  },
  ghost: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  danger: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
  pressed: { opacity: 0.90, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
