import { PlanetKey } from '../types';

export interface PlanetMeta {
  key: PlanetKey;
  name: string;
  sanskrit: string;
  glyph: string;
  short: string;
  color: string;
}

export const PLANETS: Record<PlanetKey, PlanetMeta> = {
  sun: { key: 'sun', name: 'Sun', sanskrit: 'Surya', glyph: '☉', short: 'Su', color: '#F5A623' },
  moon: { key: 'moon', name: 'Moon', sanskrit: 'Chandra', glyph: '☽', short: 'Mo', color: '#C9D2E3' },
  mars: { key: 'mars', name: 'Mars', sanskrit: 'Mangal', glyph: '♂', short: 'Ma', color: '#FF5A5A' },
  mercury: { key: 'mercury', name: 'Mercury', sanskrit: 'Budha', glyph: '☿', short: 'Me', color: '#3DDC84' },
  jupiter: { key: 'jupiter', name: 'Jupiter', sanskrit: 'Guru', glyph: '♃', short: 'Ju', color: '#F5C542' },
  venus: { key: 'venus', name: 'Venus', sanskrit: 'Shukra', glyph: '♀', short: 'Ve', color: '#FF8AD1' },
  saturn: { key: 'saturn', name: 'Saturn', sanskrit: 'Shani', glyph: '♄', short: 'Sa', color: '#7EA6FF' },
  rahu: { key: 'rahu', name: 'Rahu', sanskrit: 'Rahu', glyph: '☊', short: 'Ra', color: '#9B8CFF' },
  ketu: { key: 'ketu', name: 'Ketu', sanskrit: 'Ketu', glyph: '☋', short: 'Ke', color: '#C08CFF' },
};

export const PLANET_ORDER: PlanetKey[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];
