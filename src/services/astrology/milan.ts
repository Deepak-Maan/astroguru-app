/**
 * Ashtakoot 36-Point Gun Milan Engine for Vedic Astrology Matching.
 */
import { Kundli } from '../../types';
import { NAKSHATRAS } from '../../data/nakshatras';
import { RASHIS } from '../../data/rashis';

export interface KootaResult {
  name: string;
  sanskrit: string;
  obtained: number;
  total: number;
  description: string;
}

export interface GunMilanResult {
  totalObtained: number;
  totalMax: number;
  percentage: number;
  rating: 'Exceptional' | 'Excellent' | 'Good' | 'Average' | 'Not Recommended';
  mangalDoshaMatch: boolean;
  kootas: KootaResult[];
  verdict: string;
}

// Gana for 27 Nakshatras: 0 = Deva, 1 = Manushya, 2 = Rakshasa
const NAKSHATRA_GANA = [
  0, 1, 2, 0, 0, 1, 0, 0, 2, // 0-8
  2, 1, 1, 0, 2, 0, 2, 0, 2, // 9-17
  2, 1, 1, 0, 2, 2, 1, 1, 0, // 18-26
];

// Nadi for 27 Nakshatras: 0 = Adi, 1 = Madhya, 2 = Antya
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  0, 1, 2, 2, 1, 0, 0, 1, 2,
  0, 1, 2, 2, 1, 0, 0, 1, 2,
];

// Yoni animal types (0..13)
const NAKSHATRA_YONI = [
  0, 1, 2, 3, 2, 4, 5, 6, 7,
  8, 8, 9, 10, 11, 10, 11, 12, 12,
  4, 13, 13, 6, 1, 5, 0, 9, 3,
];

// Yoni compatibility matrix (0..4 points)
const YONI_MATRIX: number[][] = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 3, 2, 2, 2, 2], // Horse
  [2, 4, 3, 3, 2, 1, 3, 2, 2, 2, 0, 2, 2, 2], // Elephant
  [2, 3, 4, 2, 1, 2, 2, 2, 2, 3, 1, 2, 0, 2], // Sheep
  [3, 3, 2, 4, 2, 1, 2, 2, 2, 2, 2, 0, 2, 3], // Serpent
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2, 0, 2, 2], // Dog
  [2, 1, 2, 1, 2, 4, 2, 0, 2, 2, 2, 2, 2, 1], // Cat
  [2, 3, 2, 2, 1, 2, 4, 2, 1, 2, 2, 2, 2, 0], // Rat
  [1, 2, 2, 2, 2, 0, 2, 4, 2, 1, 2, 2, 2, 2], // Cow
  [0, 2, 2, 2, 2, 2, 1, 2, 4, 1, 2, 2, 1, 2], // Buffalo
  [3, 2, 3, 2, 1, 2, 2, 1, 1, 4, 2, 1, 2, 2], // Tiger
  [2, 0, 1, 2, 2, 2, 2, 2, 2, 2, 4, 2, 1, 2], // Deer
  [2, 2, 2, 0, 0, 2, 2, 2, 2, 1, 2, 4, 2, 2], // Monkey
  [2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 1, 2, 4, 2], // Mongoose
  [2, 2, 2, 3, 2, 1, 0, 2, 2, 2, 2, 2, 2, 4], // Lion
];

// Varna (0 = Brahmin, 1 = Kshatriya, 2 = Vaishya, 3 = Shudra) by Rashi
const RASHI_VARNA = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];

export function calculateGunMilan(groom: Kundli, bride: Kundli): GunMilanResult {
  const kootas: KootaResult[] = [];

  // 1. Varna (1 Point)
  const vGroom = RASHI_VARNA[groom.moonRashiIndex];
  const vBride = RASHI_VARNA[bride.moonRashiIndex];
  const varnaPts = vGroom >= vBride ? 1 : 0;
  kootas.push({
    name: 'Varna',
    sanskrit: 'वर्ण',
    obtained: varnaPts,
    total: 1,
    description: varnaPts === 1 ? 'Spiritual ego and work affinity align well.' : 'Minor variance in work style temperament.',
  });

  // 2. Vashya (2 Points)
  const diffRashi = Math.abs(groom.moonRashiIndex - bride.moonRashiIndex);
  let vashyaPts = 0;
  if (groom.moonRashiIndex === bride.moonRashiIndex) vashyaPts = 2;
  else if (diffRashi === 6 || diffRashi === 5) vashyaPts = 1;
  else if (diffRashi === 1 || diffRashi === 11) vashyaPts = 1.5;
  else vashyaPts = 0.5;
  kootas.push({
    name: 'Vashya',
    sanskrit: 'वश्य',
    obtained: vashyaPts,
    total: 2,
    description: vashyaPts >= 1.5 ? 'Strong mutual attraction and understanding.' : 'Balanced power dynamics in relationship.',
  });

  // 3. Tara (3 Points)
  const tara1 = (bride.moonNakshatraIndex - groom.moonNakshatraIndex + 27) % 9;
  const tara2 = (groom.moonNakshatraIndex - bride.moonNakshatraIndex + 27) % 9;
  const t1Ok = [1, 2, 4, 6, 8].includes(tara1) ? 1.5 : 0;
  const t2Ok = [1, 2, 4, 6, 8].includes(tara2) ? 1.5 : 0;
  const taraPts = t1Ok + t2Ok;
  kootas.push({
    name: 'Tara',
    sanskrit: 'तारा',
    obtained: taraPts,
    total: 3,
    description: taraPts >= 2 ? 'Favorable destiny compatibility and health luck.' : 'Auspicious balance required in mutual care.',
  });

  // 4. Yoni (4 Points)
  const y1 = NAKSHATRA_YONI[groom.moonNakshatraIndex];
  const y2 = NAKSHATRA_YONI[bride.moonNakshatraIndex];
  const yoniPts = YONI_MATRIX[y1][y2];
  kootas.push({
    name: 'Yoni',
    sanskrit: 'योनि',
    obtained: yoniPts,
    total: 4,
    description: yoniPts >= 3 ? 'Deep physical & psychological harmony.' : yoniPts >= 2 ? 'Moderate instinctual compatibility.' : 'Requires patience for physical harmony.',
  });

  // 5. Graha Maitri (5 Points)
  const lord1 = RASHIS[groom.moonRashiIndex].lord;
  const lord2 = RASHIS[bride.moonRashiIndex].lord;
  let maitriPts = 0;
  if (lord1 === lord2) maitriPts = 5;
  else if (['sun', 'jupiter', 'moon', 'mars'].includes(lord1) && ['sun', 'jupiter', 'moon', 'mars'].includes(lord2)) maitriPts = 4;
  else if (['venus', 'saturn', 'mercury'].includes(lord1) && ['venus', 'saturn', 'mercury'].includes(lord2)) maitriPts = 4;
  else maitriPts = 1 + Math.abs((groom.moonRashiIndex - bride.moonRashiIndex) % 3);
  maitriPts = Math.min(5, maitriPts);
  kootas.push({
    name: 'Graha Maitri',
    sanskrit: 'ग्रह मैत्री',
    obtained: maitriPts,
    total: 5,
    description: maitriPts >= 4 ? 'Intellectual friendship and deep mental rapport.' : 'Diverse perspectives enrich communication.',
  });

  // 6. Gana (6 Points)
  const g1 = NAKSHATRA_GANA[groom.moonNakshatraIndex];
  const g2 = NAKSHATRA_GANA[bride.moonNakshatraIndex];
  let ganaPts = 0;
  if (g1 === g2) ganaPts = 6;
  else if ((g1 === 0 && g2 === 1) || (g1 === 1 && g2 === 0)) ganaPts = 5;
  else if ((g1 === 0 && g2 === 2) || (g1 === 2 && g2 === 0)) ganaPts = 1;
  else ganaPts = 0;
  kootas.push({
    name: 'Gana',
    sanskrit: 'गण',
    obtained: ganaPts,
    total: 6,
    description: ganaPts >= 5 ? 'Harmonious temperaments (Deva/Manushya).' : ganaPts >= 1 ? 'Balanced mix of sensitive & pragmatic natures.' : 'Needs mutual adjustment in daily routines.',
  });

  // 7. Bhakoot (7 Points)
  const bhakootDiff = (bride.moonRashiIndex - groom.moonRashiIndex + 12) % 12 + 1;
  const isBadBhakoot = [2, 12, 6, 8, 5, 9].includes(bhakootDiff) && groom.moonRashiIndex !== bride.moonRashiIndex;
  const bhakootPts = isBadBhakoot ? 0 : 7;
  kootas.push({
    name: 'Bhakoot',
    sanskrit: 'भकूट',
    obtained: bhakootPts,
    total: 7,
    description: bhakootPts === 7 ? 'Excellent wealth, prosperity & emotional connection.' : 'Requires financial transparency & emotional expression.',
  });

  // 8. Nadi (8 Points)
  const n1 = NAKSHATRA_NADI[groom.moonNakshatraIndex];
  const n2 = NAKSHATRA_NADI[bride.moonNakshatraIndex];
  const nadiPts = n1 !== n2 ? 8 : 0;
  kootas.push({
    name: 'Nadi',
    sanskrit: 'नाडी',
    obtained: nadiPts,
    total: 8,
    description: nadiPts === 8 ? 'Ideal genetic vitality & lineage harmony.' : 'Nadi Dosha detected; recommended remedies enhance longevity.',
  });

  const totalObtained = kootas.reduce((acc, k) => acc + k.obtained, 0);
  const percentage = Math.round((totalObtained / 36) * 100);

  let rating: GunMilanResult['rating'] = 'Average';
  if (totalObtained >= 28) rating = 'Exceptional';
  else if (totalObtained >= 24) rating = 'Excellent';
  else if (totalObtained >= 18) rating = 'Good';
  else if (totalObtained >= 14) rating = 'Average';
  else rating = 'Not Recommended';

  const mangalDoshaMatch = groom.mangalDosha === bride.mangalDosha;
  let verdict = '';
  if (totalObtained >= 25) {
    verdict = `Highly auspicious match (${totalObtained}/36 Points). Both charts exhibit compatible mental, physical, and financial vibrations.`;
  } else if (totalObtained >= 18) {
    verdict = `Good match (${totalObtained}/36 Points). Standard remedies for Nadi or Bhakoot will ensure lasting harmony.`;
  } else {
    verdict = `Moderate match (${totalObtained}/36 Points). Specific planetary remedies and mutual understanding are recommended before proceeding.`;
  }

  return {
    totalObtained,
    totalMax: 36,
    percentage,
    rating,
    mangalDoshaMatch,
    kootas,
    verdict,
  };
}
