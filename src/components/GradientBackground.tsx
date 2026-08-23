import React from 'react';
import { ViewStyle } from 'react-native';
import { CelestialSpaceBackground } from './CelestialSpaceBackground';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  stars?: boolean;
}

/**
 * Universal Mystical Celestial Spatial Background:
 * 3D WebGL particle constellation, rotating celestial sphere, and mouse parallax.
 */
export function GradientBackground({ children, style }: Props) {
  return (
    <CelestialSpaceBackground style={style}>
      {children}
    </CelestialSpaceBackground>
  );
}
