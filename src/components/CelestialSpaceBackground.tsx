import React from 'react';
import { ViewStyle } from 'react-native';
import { ScrollDrivenCelestialBackground } from './ScrollDrivenCelestialBackground';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
  scrollProgress?: number;
  enableFloatingGlass?: boolean;
}

/**
 * CelestialSpaceBackground
 * ----------------------------------------------------
 * High-End 3D Celestial WebGL & GSAP ScrollTrigger Background.
 */
export function CelestialSpaceBackground({
  children,
  style,
  interactive = true,
  scrollProgress,
  enableFloatingGlass = true,
}: Props) {
  return (
    <ScrollDrivenCelestialBackground
      style={style}
      interactive={interactive}
      scrollProgress={scrollProgress}
      enableFloatingGlass={enableFloatingGlass}
    >
      {children}
    </ScrollDrivenCelestialBackground>
  );
}

export { ScrollDrivenCelestialBackground };
