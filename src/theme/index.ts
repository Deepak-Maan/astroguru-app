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
  // Backgrounds (Clean, luminous crystal air)
  bg: '#F8FAFC',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardGlowBorder: '#6366F1',

  // Shadows
  shadowLight: '#FFFFFF',
  shadowDark: '#CBD5E1',

  // Modern Cosmic Brand Accents
  primary: '#6366F1',       // Electric Indigo
  primaryDark: '#4F46E5',   // Royal Iris
  coral: '#FF3366',         // Neon Coral Punch
  cyan: '#06B6D4',          // Cyber Cyan
  violet: '#8B5CF6',        // Vivid Amethyst
  indigo: '#4F46E5',

  // Background Gradient Nodes
  gradientTop: '#FFFFFF',
  gradientMid: '#F8FAFC',
  gradientBottom: '#F1F5F9',
  auroraA: '#6366F1',
  auroraB: '#FF3366',

  // High Contrast Interactive Colors (Legacy-mapped to Modern Non-Gold Palette)
  gold: '#06B6D4',          // Replaced with Cyber Cyan (zero yellow!)
  goldSoft: '#4F46E5',      // Replaced with Royal Iris
  saffron: '#FF3366',       // Replaced with Neon Coral Punch
  rose: '#F43F5E',          // Vivid Rose
  teal: '#6366F1',          // Replaced with Electric Indigo

  // Text (Obsidian Slate for Razor-Sharp AAA Contrast)
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#94A3B8',

  // Status Cues
  online: '#10B981',        // Vivid Mint
  offline: '#94A3B8',
  danger: '#F43F5E',
  success: '#10B981',

  // Overlays & Utilities
  overlay: 'rgba(15, 23, 42, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.primary, colors.violet] as const, // Modern Indigo to Violet
  coral: ['#FF3366', '#F43F5E'] as const,
  cyan: ['#06B6D4', '#0EA5E9'] as const,
  soft: ['#FFFFFF', '#F8FAFC'] as const,
  card: ['#FFFFFF', '#F8FAFC'] as const,
  cta: ['#6366F1', '#4F46E5'] as const,
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
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  button3D: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  card3D: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  floatingDock: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const tactile3D = {
  depth: {
    sm: 2.5,
    md: 4,
    lg: 5.5,
  },
  bevel: {
    primary: '#4338CA', // Deep Indigo bevel
    gold: '#BE123C',    // Deep Coral/Ruby bevel (legacy gold alias)
    outline: '#CBD5E1', // Clean Slate Silver bevel
    danger: '#BE123C',  // Deep Ruby bevel
    cyan: '#0E7490',    // Deep Ocean Cyan bevel
    violet: '#6D28D9',  // Deep Violet bevel
  },
  specular: 'rgba(255, 255, 255, 0.55)',
};

export const theme = { colors, gradients, spacing, radius, typography, shadow, tactile3D };
export type Theme = typeof theme;
