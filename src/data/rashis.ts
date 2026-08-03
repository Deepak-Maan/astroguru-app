import { PlanetKey } from '../types';

export interface Rashi {
  index: number;
  sanskrit: string;
  english: string;
  symbol: string;
  glyph: string; // unicode astrological glyph
  lord: PlanetKey;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Movable' | 'Fixed' | 'Dual';
  luckyColor: string;
  luckyColorHex: string;
  luckyNumbers: number[];
  traits: string;
}

/** 12 Vedic Rashis in order (sidereal Aries = Mesha at 0°). */
export const RASHIS: Rashi[] = [
  { index: 0, sanskrit: 'Mesha', english: 'Aries', symbol: '🐏', glyph: '♈', lord: 'mars', element: 'Fire', quality: 'Movable', luckyColor: 'Red', luckyColorHex: '#FF5A5A', luckyNumbers: [9, 18], traits: 'Bold, energetic and pioneering.' },
  { index: 1, sanskrit: 'Vrishabha', english: 'Taurus', symbol: '🐂', glyph: '♉', lord: 'venus', element: 'Earth', quality: 'Fixed', luckyColor: 'White', luckyColorHex: '#F2F2F2', luckyNumbers: [6, 24], traits: 'Grounded, loyal and patient.' },
  { index: 2, sanskrit: 'Mithuna', english: 'Gemini', symbol: '👯', glyph: '♊', lord: 'mercury', element: 'Air', quality: 'Dual', luckyColor: 'Green', luckyColorHex: '#3DDC84', luckyNumbers: [5, 14], traits: 'Curious, witty and communicative.' },
  { index: 3, sanskrit: 'Karka', english: 'Cancer', symbol: '🦀', glyph: '♋', lord: 'moon', element: 'Water', quality: 'Movable', luckyColor: 'Silver', luckyColorHex: '#C9D2E3', luckyNumbers: [2, 11], traits: 'Nurturing, intuitive and caring.' },
  { index: 4, sanskrit: 'Simha', english: 'Leo', symbol: '🦁', glyph: '♌', lord: 'sun', element: 'Fire', quality: 'Fixed', luckyColor: 'Gold', luckyColorHex: '#F5C542', luckyNumbers: [1, 10], traits: 'Regal, confident and generous.' },
  { index: 5, sanskrit: 'Kanya', english: 'Virgo', symbol: '🌾', glyph: '♍', lord: 'mercury', element: 'Earth', quality: 'Dual', luckyColor: 'Emerald', luckyColorHex: '#2ECC71', luckyNumbers: [5, 23], traits: 'Analytical, precise and helpful.' },
  { index: 6, sanskrit: 'Tula', english: 'Libra', symbol: '⚖️', glyph: '♎', lord: 'venus', element: 'Air', quality: 'Movable', luckyColor: 'Sky Blue', luckyColorHex: '#7EC8E3', luckyNumbers: [6, 15], traits: 'Balanced, charming and fair.' },
  { index: 7, sanskrit: 'Vrishchika', english: 'Scorpio', symbol: '🦂', glyph: '♏', lord: 'mars', element: 'Water', quality: 'Fixed', luckyColor: 'Maroon', luckyColorHex: '#8B2C3B', luckyNumbers: [9, 21], traits: 'Intense, passionate and secretive.' },
  { index: 8, sanskrit: 'Dhanu', english: 'Sagittarius', symbol: '🏹', glyph: '♐', lord: 'jupiter', element: 'Fire', quality: 'Dual', luckyColor: 'Yellow', luckyColorHex: '#F5C542', luckyNumbers: [3, 12], traits: 'Adventurous, optimistic and free.' },
  { index: 9, sanskrit: 'Makara', english: 'Capricorn', symbol: '🐐', glyph: '♑', lord: 'saturn', element: 'Earth', quality: 'Movable', luckyColor: 'Black', luckyColorHex: '#2C2C3A', luckyNumbers: [8, 17], traits: 'Disciplined, ambitious and steady.' },
  { index: 10, sanskrit: 'Kumbha', english: 'Aquarius', symbol: '🏺', glyph: '♒', lord: 'saturn', element: 'Air', quality: 'Fixed', luckyColor: 'Blue', luckyColorHex: '#4A6CF7', luckyNumbers: [4, 22], traits: 'Innovative, humane and independent.' },
  { index: 11, sanskrit: 'Meena', english: 'Pisces', symbol: '🐟', glyph: '♓', lord: 'jupiter', element: 'Water', quality: 'Dual', luckyColor: 'Sea Green', luckyColorHex: '#38E1C3', luckyNumbers: [3, 30], traits: 'Compassionate, dreamy and artistic.' },
];

export const rashiByIndex = (i: number): Rashi => RASHIS[((i % 12) + 12) % 12];
