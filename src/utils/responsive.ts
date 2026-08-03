import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design base width (iPhone 14 / standard 390px layout)
const baseWidth = 390;
const scale = SCREEN_WIDTH / baseWidth;

/**
 * Normalizes font size based on screen pixel density and screen scale factor.
 */
export function normalize(size: number): number {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

/**
 * Calculates percentage-based width relative to screen width.
 * @example wp(90) -> 90% of screen width
 */
export function wp(percentage: number): number {
  return Math.round((percentage * SCREEN_WIDTH) / 100);
}

/**
 * Calculates percentage-based height relative to screen height.
 * @example hp(20) -> 20% of screen height
 */
export function hp(percentage: number): number {
  return Math.round((percentage * SCREEN_HEIGHT) / 100);
}

/** Screen Dimension Helpers */
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
export const isTablet = SCREEN_WIDTH >= 768;

export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice,
  isTablet,
};
