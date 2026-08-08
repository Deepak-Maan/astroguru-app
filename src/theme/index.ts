/**
 * AstroGuru Theme — Option C: Nordic Frost & Emerald Teal
 * Luminous White 3D Extruded Surfaces, Ice-Blue Shadows & Sacred Emerald Teal Accents.
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function normalize(size: number): number {
  return size;
}

export function wp(percentage: number): number {
  return Math.round((percentage * SCREEN_WIDTH) / 100);
}

export function hp(percentage: number): number {
  return Math.round((percentage * SCREEN_HEIGHT) / 100);
}

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= 768;

export const colors = {
  // Backgrounds (Nordic Frost Ice Blue Slate)
  bg: '#F3F7FC',
  bgElevated: '#F8FAFC',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardBorder: '#FFFFFF',
  cardGlowBorder: '#059669',

  // Dual Shadows for Nordic Frost Neumorphism
  shadowLight: '#FFFFFF',
  shadowDark: '#BFDBFE',

  // Brand Accents (Sacred Emerald Teal & Solar Gold)
  gradientTop: '#FFFFFF',
  gradientMid: '#F3F7FC',
  gradientBottom: '#E8F1FC',
  auroraA: '#059669',
  auroraB: '#D97706',

  // High Contrast Accent Colors
  gold: '#D97706',
  goldSoft: '#B45309',
  saffron: '#E67E22',
  rose: '#E11D48',
  teal: '#059669',

  // Text (Deep Royal Purple/Navy for Crisp Contrast)
  text: '#1E1B4B',
  textMuted: '#475569',
  textFaint: '#94A3B8',

  // Status Cues
  online: '#059669',
  offline: '#94A3B8',
  danger: '#E11D48',
  success: '#059669',

  // Overlays & Utilities
  overlay: 'rgba(15, 23, 42, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.teal, colors.gold] as const,
  soft: ['#FFFFFF', '#F8FAFC'] as const,
  card: ['#FFFFFF', '#F8FAFC'] as const,
  cta: ['#059669', '#047857'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 0.3 },
  h1: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 21, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '500' as const, color: colors.text },
  bodyMuted: { fontSize: 15, fontWeight: '500' as const, color: colors.textMuted },
  small: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4, color: colors.textFaint },
} as const;

export const shadow = {
  card: {
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const theme = { colors, gradients, spacing, radius, typography, shadow };
export type Theme = typeof theme;
