import React from 'react';
import { ViewStyle } from 'react-native';
import { SpatialGlassCard } from './SpatialGlassCard';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Inner content padding (default true). */
  padded?: boolean;
  glow?: boolean;
  elevated?: boolean;
  tilt?: boolean;
  borderGold?: boolean;
}

export function Card({
  children,
  style,
  onPress,
  padded = true,
  glow = false,
  elevated = false,
  tilt = true,
  borderGold = false,
}: Props) {
  return (
    <SpatialGlassCard
      style={style}
      onPress={onPress}
      padded={padded}
      glow={glow}
      elevated={elevated}
      tilt={tilt}
      borderGold={borderGold}
    >
      {children}
    </SpatialGlassCard>
  );
}
