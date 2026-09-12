/**
 * AstroGuru Theme — Modern Interactive Cyber-Cosmic System
 * Luminous Pure White 3D Extruded Surfaces, Electric Indigo, Neon Coral & Cyber Cyan Accents.
 * Zero yellow/gold tones for an ultra-modern, crisp, and interactive aesthetic.
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
  // Backgrounds (Silky Soft Clay Canvas)
  bg: '#F4F1FA',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardBorder: 'rgba(124, 58, 237, 0.08)',
  cardGlowBorder: '#7C3AED',
  surfaceSoft: '#EDE9FE',
  surfacePink: '#FCE7F3',

  // Shadows
  shadowLight: '#FFFFFF',
  shadowDark: '#D1D5DB',
  shadowClay: '#7C3AED',

  // Claymorphism 3D Brand Accents (Strictly Non-Gold)
  primary: '#7C3AED',       // Vivid Violet
  primaryDark: '#6D28D9',   // Deep Violet
  coral: '#DB2777',         // Punch Rose
  cyan: '#06B6D4',          // Sky Cyan
  violet: '#A78BFA',        // Soft Lilac Clay
  indigo: '#6366F1',

  // Background Gradient Nodes
  gradientTop: '#F8F6FC',
  gradientMid: '#F4F1FA',
  gradientBottom: '#ECE7F6',
  auroraA: '#7C3AED',
  auroraB: '#DB2777',

  // High Contrast Interactive Colors (Legacy-mapped to Clay Palette)
  gold: '#06B6D4',          // Replaced with Sky Cyan (zero yellow!)
  goldSoft: '#7C3AED',      // Replaced with Vivid Violet
  saffron: '#DB2777',       // Replaced with Punch Rose
  rose: '#DB2777',          // Punch Rose
  teal: '#7C3AED',          // Replaced with Vivid Violet

  // Text (Obsidian Clay for Razor-Sharp AAA Contrast)
  text: '#2E2836',
  textMuted: '#6B6675',
  textFaint: '#9E9AA7',

  // Status Cues
  online: '#10B981',        // Vivid Mint
  offline: '#9E9AA7',
  danger: '#F43F5E',
  success: '#10B981',

  // Overlays & Utilities
  overlay: 'rgba(46, 40, 54, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.primary, colors.violet] as const,
  coral: ['#F472B6', '#DB2777'] as const,
  cyan: ['#06B6D4', '#0EA5E9'] as const,
  soft: ['#FFFFFF', '#F8F6FC'] as const,
  card: ['#FFFFFF', '#FAF8FD'] as const,
  cta: ['#A78BFA', '#7C3AED'] as const,
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
  sm: 12,
  md: 18,
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
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  button3D: {
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  card3D: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },
  floatingDock: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  clayCard: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const tactile3D = {
  depth: {
    sm: 3,
    md: 4.5,
    lg: 6,
  },
  bevel: {
    primary: '#5B21B6', // Deep Violet clay bevel
    gold: '#BE185D',    // Deep Rose clay bevel (legacy alias)
    outline: '#DDD6FE', // Soft Lilac Clay outline bevel
    danger: '#BE185D',  // Deep Rose clay bevel
    cyan: '#0E7490',    // Deep Ocean Cyan bevel
    violet: '#5B21B6',  // Deep Violet bevel
  },
  specular: 'rgba(255, 255, 255, 0.65)',
};

export const theme = { colors, gradients, spacing, radius, typography, shadow, tactile3D };
export type Theme = typeof theme;
