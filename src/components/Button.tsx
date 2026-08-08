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
              ? [colors.gold, colors.saffron]
              : [colors.teal, '#047857']
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
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: { flex: 1, justifyContent: 'center' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
  },
  label: { ...typography.h3, color: colors.white, fontWeight: '800' },
  outline: {
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    backgroundColor: '#FFFFFF',
  },
  ghost: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  danger: {
    borderWidth: 1,
    borderColor: 'rgba(225,29,72,0.30)',
    backgroundColor: 'rgba(225,29,72,0.08)',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});
