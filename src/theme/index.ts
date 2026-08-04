/**
 * AstroGuru Theme — Cyber-Vedic Emerald & Obsidian Palette (Theme 4)
 * Futuristic Obsidian Space, Glowing Emerald & Holographic Saffron Gold.
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
  // Backgrounds (Cyber-Vedic Obsidian Dark Palette)
  bg: '#060A12',
  bgElevated: '#0E1726',
  card: '#0E1726',
  cardSolid: '#0E1726',
  cardBorder: 'rgba(16,185,129,0.25)',
  cardGlowBorder: 'rgba(245,158,11,0.50)',

  // Dual Shadows for Dark Obsidian Theme
  shadowLight: 'rgba(16,185,129,0.20)',
  shadowDark: 'rgba(0,0,0,0.70)',

  // Brand Accents (Cyber Emerald & Holographic Saffron Gold)
  gradientTop: '#04070D',
  gradientMid: '#0A1322',
  gradientBottom: '#050B14',
  auroraA: '#10B981',
  auroraB: '#F59E0B',

  // Luminous Warm Gold & Emerald Highlights
  gold: '#F59E0B',
  goldSoft: '#FDE68A',
  saffron: '#F59E0B',
  rose: '#F43F5E',
  teal: '#10B981',

  // Text (High Contrast Starlight White & Slate Muted)
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',

  // Status Cues
  online: '#10B981',
  offline: '#64748B',
  danger: '#F43F5E',
  success: '#10B981',

  // Overlays
  overlay: 'rgba(4,7,13,0.80)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.saffron, colors.gold] as const,
  soft: ['#0E1726', '#060A12'] as const,
  card: ['#0E1726', '#09101D'] as const,
  cta: ['#10B981', '#F59E0B'] as const,
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
  md: 14,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: 0.3 },
  h1: { fontSize: 26, fontWeight: '800' as const },
  h2: { fontSize: 21, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodyMuted: { fontSize: 15, fontWeight: '500' as const, color: colors.textMuted },
  small: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

export const shadow = {
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.60)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = { colors, gradients, spacing, radius, typography, shadow };
export type Theme = typeof theme;
