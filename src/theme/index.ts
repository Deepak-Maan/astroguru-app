/**
 * AstroGuru Theme — Mystical Celestial Spatial UI
 * Deep Celestial Obsidian Midnight (#0B0D17), Deep Nebula Indigo (#1A1A3A),
 * Starlight Gold/Bronze (#D4AF37, #F5D77F), and Ethereal Cyan/Lavender Glow.
 */

import { Dimensions, Platform } from 'react-native';

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
  // Deep Celestial Backgrounds
  bg: '#0B0D17', // Obsidian Midnight
  bgElevated: '#121428', // Deep Nebula Indigo
  bgCosmic: '#07080F', // Void Black

  // Glassmorphic Card Surfaces
  card: 'rgba(18, 20, 42, 0.78)', // Frosted Deep Glass
  cardSolid: '#13152C',
  cardElevated: 'rgba(26, 26, 58, 0.85)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderGold: 'rgba(212, 175, 55, 0.25)',
  cardGlowBorder: '#D4AF37',

  // Deep Spatial Shadows
  shadowLight: 'rgba(212, 175, 55, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.75)',

  // Celestial Gradients
  gradientTop: '#0B0D17',
  gradientMid: '#121428',
  gradientBottom: '#1A1A3A',
  auroraA: '#8B5CF6', // Nebula Purple
  auroraB: '#D4AF37', // Starlight Gold

  // High-End Celestial Accents
  gold: '#D4AF37', // Starlight Pure Gold
  goldSoft: '#F5D77F', // Luminous Celestial Gold
  goldDark: '#B8902A', // Antique Temple Gold
  saffron: '#F59E0B',
  rose: '#F43F5E',
  teal: '#10B981', // Sacred Emerald
  cyan: '#38BDF8', // Ethereal Cyan
  lavender: '#A78BFA', // Ethereal Lavender
  purple: '#8B5CF6',

  // Celestial Typography Colors
  text: '#F8FAFC', // Pure Starlight White
  textMuted: '#94A3B8', // Moon Dust Muted
  textFaint: '#64748B', // Deep Space Dust
  textGold: '#F5D77F',

  // Status Cues
  online: '#10B981',
  offline: '#64748B',
  danger: '#F43F5E',
  success: '#10B981',

  // Overlays & Utilities
  overlay: 'rgba(7, 8, 15, 0.75)',
  glassOverlay: 'rgba(18, 20, 42, 0.65)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.gold, colors.goldSoft] as const,
  nebula: ['#1A1A3A', '#121428', '#0B0D17'] as const,
  soft: ['rgba(26, 26, 58, 0.85)', 'rgba(18, 20, 42, 0.75)'] as const,
  card: ['rgba(26, 26, 58, 0.8)', 'rgba(18, 20, 42, 0.7)'] as const,
  cta: ['#D4AF37', '#B8902A'] as const,
  cyanGlow: ['#38BDF8', '#818CF8'] as const,
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

// Fonts: Serif for mystic headlines & sans-serif for crisp readings
const SERIF_FONT = Platform.OS === 'web' ? 'Cinzel, "Cormorant Garamond", Georgia, serif' : undefined;
const SANS_FONT = Platform.OS === 'web' ? 'Inter, -apple-system, system-ui, sans-serif' : undefined;

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
    color: colors.text,
    fontFamily: SERIF_FONT,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 0.5,
    fontFamily: SERIF_FONT,
  },
  h2: {
    fontSize: 21,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: 0.4,
    fontFamily: SERIF_FONT,
  },
  h3: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    fontFamily: SANS_FONT,
    lineHeight: 22,
  },
  bodyMuted: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
    lineHeight: 22,
  },
  small: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    color: colors.textFaint,
    fontFamily: SANS_FONT,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  cyanGlow: {
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = { colors, gradients, spacing, radius, typography, shadow };
export type Theme = typeof theme;
