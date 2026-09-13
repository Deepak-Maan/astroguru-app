/**
 * AstroGuru Theme — Option 10: Luminescent Liquid Glass (Neumorphic Soft-Light)
 * Deep Liquid Indigo (#0A0C16), Translucent Frosted Silicone Surfaces,
 * Electric Indigo (#6366F1) & Glow Rose (#EC4899) Accents,
 * Frosted Crystal Luminous Borders (#818CF8) & Soft-Light Neumorphic Extrusion.
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
  // Backgrounds (Luminescent Liquid Indigo Canvas)
  bg: '#0A0C16',
  bgElevated: '#11162B',
  card: 'rgba(26, 33, 64, 0.72)',
  cardSolid: '#131830',
  cardBorder: 'rgba(129, 140, 248, 0.28)',
  cardGlowBorder: '#818CF8',
  surfaceSoft: 'rgba(34, 43, 80, 0.55)',
  surfacePink: 'rgba(236, 72, 153, 0.15)',

  // Shadows
  shadowLight: 'rgba(129, 140, 248, 0.25)',
  shadowDark: '#000000',
  shadowClay: '#6366F1',

  // Luminescent Liquid Brand Accents
  primary: '#6366F1',       // Luminous Violet / Electric Indigo
  primaryDark: '#4F46E5',   // Deep Indigo
  coral: '#EC4899',         // Glow Rose / Pink
  cyan: '#38BDF8',          // Sky Aqua
  violet: '#A5B4FC',        // Frosted Crystal Soft
  indigo: '#818CF8',

  // Background Gradient Nodes
  gradientTop: '#13172E',
  gradientMid: '#0A0C16',
  gradientBottom: '#060810',
  auroraA: '#6366F1',
  auroraB: '#EC4899',

  // High Contrast Interactive Colors
  gold: '#F59E0B',          // Starfire Amber
  goldSoft: '#FCD34D',
  saffron: '#EC4899',       // Glow Rose
  rose: '#EC4899',
  teal: '#38BDF8',          // Sky Aqua

  // Text (Luminous White-Blue for AAA Contrast)
  text: '#EEF2FF',
  textMuted: '#A5B4FC',
  textFaint: '#818CF8',

  // Status Cues
  online: '#10B981',        // Vivid Mint
  offline: '#64748B',
  danger: '#F43F5E',
  success: '#10B981',

  // Overlays & Utilities
  overlay: 'rgba(4, 6, 15, 0.75)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: ['#F59E0B', '#FCD34D'] as const,
  coral: ['#F472B6', '#EC4899'] as const,
  cyan: ['#38BDF8', '#0284C7'] as const,
  soft: ['rgba(34, 43, 80, 0.7)', 'rgba(18, 22, 45, 0.85)'] as const,
  card: ['rgba(34, 43, 80, 0.72)', 'rgba(18, 22, 45, 0.88)'] as const,
  cta: ['#818CF8', '#4F46E5'] as const,
  liquid: ['#6366F1', '#EC4899'] as const,
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
  sm: 14,
  md: 20,
  lg: 26,
  xl: 32,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 0.3, color: colors.text },
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  button3D: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 7,
  },
  card3D: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 8,
  },
  floatingDock: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  clayCard: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
};

export const tactile3D = {
  depth: {
    sm: 3,
    md: 4.5,
    lg: 6,
  },
  bevel: {
    primary: '#4F46E5',
    gold: '#D97706',
    outline: 'rgba(129, 140, 248, 0.4)',
    danger: '#BE185D',
    cyan: '#0284C7',
    violet: '#4F46E5',
  },
  specular: 'rgba(255, 255, 255, 0.45)',
};

export const theme = { colors, gradients, spacing, radius, typography, shadow, tactile3D };
export type Theme = typeof theme;
