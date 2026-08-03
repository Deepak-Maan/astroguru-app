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

const heights: Record<Size, number> = { sm: 38, md: 48, lg: 56 };
const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 17 };

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
        <ActivityIndicator size="small" color={colors.white} />
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
              ? ['#E67E22', '#D4AC0D']
              : ['#7D3C98', '#E67E22']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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
    shadowColor: 'rgba(125,60,152,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: { flex: 1, justifyContent: 'center' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  label: { ...typography.h3, color: colors.white, fontWeight: '800' },
  outline: {
    borderWidth: 1.5,
    borderColor: 'rgba(125,60,152,0.35)',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  ghost: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  danger: {
    borderWidth: 1.5,
    borderColor: 'rgba(231,76,60,0.5)',
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
});
