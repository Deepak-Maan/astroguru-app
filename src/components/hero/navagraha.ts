/**
 * Navagraha presentation vocabulary.
 *
 * Colours follow the traditional temple convention for the nine grahas rather
 * than modern "planet colours" — Budha green, Guru yellow, Shani blue-black,
 * and the two chhaya (shadow) grahas Rahu and Ketu in smoke and ash.
 *
 * `order` is the canonical navagraha sequence used when reciting or installing
 * them. The hero's entrance animation staggers along this order, so the motion
 * carries real information instead of being an arbitrary cascade.
 *
 * Two deliberate readings: Chandra and Shukra are both "white" in the tradition,
 * so they are split into a warm pearl and a cool brilliant white to stay legible
 * as separate points of light.
 */
import { PlanetKey } from '../../types';

export interface GrahaStyle {
  key: PlanetKey;
  /** Sanskrit name of the graha. */
  sanskrit: string;
  /** Canonical navagraha position, 0-indexed. */
  order: number;
  /** Point colour as [r, g, b] in 0..1, ready for a buffer attribute. */
  rgb: [number, number, number];
  /** Relative visual weight — the two luminaries dominate. */
  size: number;
}

/** Hex → normalised rgb triple. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const NAVAGRAHA: Record<PlanetKey, GrahaStyle> = {
  sun: { key: 'sun', sanskrit: 'Surya', order: 0, rgb: rgb('#FF7A45'), size: 1.0 },
  moon: { key: 'moon', sanskrit: 'Chandra', order: 1, rgb: rgb('#FFF6E0'), size: 0.92 },
  mars: { key: 'mars', sanskrit: 'Mangala', order: 2, rgb: rgb('#FF4A4A'), size: 0.66 },
  mercury: { key: 'mercury', sanskrit: 'Budha', order: 3, rgb: rgb('#4FE38B'), size: 0.6 },
  jupiter: { key: 'jupiter', sanskrit: 'Guru', order: 4, rgb: rgb('#FFD34E'), size: 0.8 },
  venus: { key: 'venus', sanskrit: 'Shukra', order: 5, rgb: rgb('#DCE8FF'), size: 0.72 },
  saturn: { key: 'saturn', sanskrit: 'Shani', order: 6, rgb: rgb('#6E7BC8'), size: 0.74 },
  rahu: { key: 'rahu', sanskrit: 'Rahu', order: 7, rgb: rgb('#9AA0B5'), size: 0.56 },
  ketu: { key: 'ketu', sanskrit: 'Ketu', order: 8, rgb: rgb('#C08A6A'), size: 0.56 },
};

/**
 * Brass, as used for the astrolabes and the Jantar Mantar instruments — duller
 * and more metallic than the app's UI gold, which stays reserved for controls.
 */
export const BRASS = {
  base: rgb('#C9A227'),
  bright: rgb('#F0DFA0'),
  dim: rgb('#7C6420'),
};

export const AURORA = rgb('#7A3CFF');
