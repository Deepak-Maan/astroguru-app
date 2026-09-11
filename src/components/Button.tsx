import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography, tactile3D, shadow } from '../theme';

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

const heights: Record<Size, number> = { sm: 38, md: 46, lg: 54 };
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
  const isFlat = variant === 'ghost';
  const inactive = disabled || loading;
  const depth = tactile3D.depth[size];

  const handlePress = () => {
    if (inactive) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    onPress?.();
  };

  const bevelColor =
    variant === 'gold'
      ? tactile3D.bevel.gold
      : variant === 'danger'
      ? tactile3D.bevel.danger
      : variant === 'outline'
      ? tactile3D.bevel.outline
      : tactile3D.bevel.primary;

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.text : colors.white} />
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
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { height: heights[size] },
        fullWidth && { alignSelf: 'stretch' },
        variant !== 'ghost' && {
          borderBottomWidth: pressed ? 1 : depth,
          borderBottomColor: bevelColor,
          borderTopWidth: 1.2,
          borderTopColor: variant === 'outline' ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
        },
        isFlat && styles.ghost,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        pressed && !inactive && {
          transform: [{ translateY: depth - 1 }],
          shadowOpacity: 0.1,
          elevation: 1,
        },
        inactive && styles.disabled,
        style,
      ]}
    >
      {isFlat || variant === 'outline' || variant === 'danger' ? (
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(0, 0, 0, 0.08)',
  },
  gradient: { flex: 1, justifyContent: 'center' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
  },
  label: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
  },
  ghost: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0,
  },
  danger: {
    backgroundColor: '#FFF1F2',
  },
  disabled: { opacity: 0.45 },
});
