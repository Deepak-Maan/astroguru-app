/**
 * AstroGuru Theme — Luxury 3D Light Mode Design System
 * Canvas: Alabaster Silk (#F8FAFC) & Opal Pearl (#FDFBF7)
 * Accents: Imperial Starlight Gold (#D4AF37, #E6CA65), Celestial Rose Quartz (#F472B6), Ethereal Dawn Lavender (#818CF8)
 * Typography: Deep Celestial Navy (#0F172A, #1E1B4B) [WCAG AAA 12:1 Contrast]
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
  // Luxury Light Backgrounds
  bg: '#F8FAFC', // Alabaster Silk
  bgElevated: '#FFFFFF', // Pure White
  bgCosmic: '#FDFBF7', // Opal Pearl Morning Dawn

  // Ultra-Clear Crystalline Glassmorphic Surfaces
  card: 'rgba(255, 255, 255, 0.85)', // Ultra-Clear Crystal Glass (0.85 to 0.65)
  cardSolid: '#FFFFFF',
  cardElevated: 'rgba(255, 255, 255, 0.94)',
  cardBorder: 'rgba(255, 255, 255, 0.9)', // Clean Glass Border
  cardBorderBottom: 'rgba(212, 175, 55, 0.3)', // Gold bottom accent rim
  cardBorderGold: 'rgba(212, 175, 55, 0.42)',
  cardGlowBorder: '#D4AF37',

  // Soft Dawn Iridescence Glows
  glowGold: '#FDE68A',
  glowLavender: '#E9D5FF',
  glowSky: '#BAE6FD',
  glowRose: '#FBCFE8',

  // Spatial Light Shadows
  shadowLight: 'rgba(100, 116, 139, 0.12)',
  shadowDark: 'rgba(15, 23, 42, 0.08)',

  // Morning Dawn Gradients
  gradientTop: '#FDFBF7',
  gradientMid: '#F8FAFC',
  gradientBottom: '#F1F5F9',
  auroraA: '#E9D5FF', // Mystic Lavender
  auroraB: '#FDE68A', // Champagne Gold
  auroraC: '#BAE6FD', // Sky Blue
  auroraD: '#FBCFE8', // Rose

  // Astrotalk Brand Yellows & Saffron
  brandYellow: '#FFC107',
  brandYellowLight: '#FFF9E6',
  brandGold: '#F59E0B',
  brandSaffron: '#D97706',
  astrotalkBg: '#F7F8FA',
  verifiedBlue: '#2563EB',
  onlineGreen: '#10B981',
  busyAmber: '#F59E0B',

  // High-End Celestial Accents
  gold: '#D4AF37', // Imperial Starlight Gold
  goldSoft: '#F5D77F', // Metallic Gold Highlight
  goldDark: '#B8902A', // Antique Temple Gold
  saffron: '#D97706',
  rose: '#F472B6', // Celestial Rose Quartz
  teal: '#0D9488', // Sacred Emerald
  cyan: '#0284C7', // Ethereal Cyan
  lavender: '#818CF8', // Ethereal Dawn Lavender
  purple: '#7C3AED',

  // Deep Celestial High-Contrast Typography (WCAG AAA)
  text: '#1A1A1A', // Deep Charcoal
  textHeading: '#111827', // Crisp Black
  textMuted: '#64748B', // Slate Lavender
  textFaint: '#94A3B8', // Soft Morning Slate
  textGold: '#B8902A', // Rich Temple Gold for text

  // Status Cues
  online: '#10B981',
  offline: '#94A3B8',
  danger: '#EF4444',
  success: '#10B981',

  // Overlays & Utilities
  overlay: 'rgba(15, 23, 42, 0.45)',
  glassOverlay: 'rgba(255, 255, 255, 0.75)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB, colors.auroraC, colors.auroraD] as const,
  gold: ['#D4AF37', '#F5D77F'] as const, // Imperial Gold Metallic
  goldRich: ['#E6CA65', '#D4AF37', '#B8902A'] as const,
  nebula: ['#FDFBF7', '#F8FAFC', '#EEF2F6'] as const,
  glass: ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.65)'] as const,
  glassElevated: ['rgba(255, 255, 255, 0.94)', 'rgba(255, 255, 255, 0.82)'] as const,
  card: ['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.72)'] as const,
  cta: ['#D4AF37', '#F5D77F'] as const,
  cyanGlow: ['#0284C7', '#818CF8'] as const,
  gaugeLove: ['#F472B6', '#E11D48'] as const,
  gaugeCareer: ['#D4AF37', '#F5D77F'] as const,
  gaugeEnergy: ['#38BDF8', '#818CF8'] as const,
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

// Fonts: Option 4 "Ethereal Celestial Grace" (Marcellus display with Manrope body)
const SERIF_FONT = Platform.OS === 'web' ? 'Marcellus, Cinzel, "Cormorant Garamond", Georgia, serif' : undefined;
const SANS_FONT = Platform.OS === 'web' ? 'Manrope, "Plus Jakarta Sans", -apple-system, system-ui, sans-serif' : undefined;

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: 0.9,
    lineHeight: 38,
    color: colors.text,
    fontFamily: SERIF_FONT,
  },
  h1: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    lineHeight: 30,
    color: colors.text,
    fontFamily: SERIF_FONT,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
    lineHeight: 26,
    color: colors.text,
    fontFamily: SERIF_FONT,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    lineHeight: 22,
    color: colors.text,
    fontFamily: SERIF_FONT,
  },
  body: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 0.15,
    color: colors.text,
    fontFamily: SANS_FONT,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 22,
    letterSpacing: 0.15,
    color: colors.text,
    fontFamily: SANS_FONT,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
    letterSpacing: 0.2,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 17,
    letterSpacing: 0.2,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
  },
  small: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.4,
    color: colors.textMuted,
    fontFamily: SANS_FONT,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  gold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  crystal: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 6,
  },
};
