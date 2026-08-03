/**
 * AstroGuru Theme — Royal Celestial Light Palette
 * Luxurious pearlescent platinum backdrop, pure white elevated cards, deep royal navy typography, and vibrant saffron-gold & amethyst accents.
 */

export const colors = {
  // Backgrounds (Clean Airy Light Palette)
  bg: '#F8FAFC',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardGlowBorder: 'rgba(217,119,6,0.40)',

  // Neumorphic Dual Shadows for Light Theme
  shadowLight: '#FFFFFF',
  shadowDark: 'rgba(148,163,184,0.25)',

  // Brand Accents (Royal Amethyst & Amber Saffron)
  gradientTop: '#FAF5FF',
  gradientMid: '#FFFBEB',
  gradientBottom: '#F1F5F9',
  auroraA: '#6D28D9',
  auroraB: '#D97706',

  // Luminous Warm Gold & Emerald Highlights
  gold: '#F59E0B',
  goldSoft: '#FEF3C7',
  saffron: '#D97706',
  rose: '#EF4444',
  teal: '#0D9488',

  // Text (High Contrast Deep Slate Navy)
  text: '#0F172A',
  textMuted: '#475569',
  textFaint: '#64748B',

  // Status Cues
  online: '#10B981',
  offline: '#94A3B8',
  danger: '#EF4444',
  success: '#10B981',

  // Overlays
  overlay: 'rgba(15,23,42,0.60)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  screen: [colors.gradientTop, colors.gradientMid, colors.gradientBottom] as const,
  aurora: [colors.auroraA, colors.auroraB] as const,
  gold: [colors.saffron, colors.gold] as const,
  soft: ['#FFFFFF', '#F8FAFC'] as const,
  card: ['#FFFFFF', '#F8FAFC'] as const,
  cta: ['#6D28D9', '#D97706'] as const,
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
    shadowColor: 'rgba(148, 163, 184, 0.35)',
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
