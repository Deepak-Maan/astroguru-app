/**
 * Vimshottari Dasha timeline computation engine.
 */
import { PlanetKey } from '../../types';
import { NAKSHATRAS } from '../../data/nakshatras';

export interface DashaPeriod {
  lord: PlanetKey;
  lordName: string;
  startDate: string;
  endDate: string;
  years: number;
  isActive: boolean;
}

const DASHA_PERIODS: { lord: PlanetKey; name: string; years: number }[] = [
  { lord: 'ketu', name: 'Ketu', years: 7 },
  { lord: 'venus', name: 'Venus', years: 20 },
  { lord: 'sun', name: 'Sun', years: 6 },
  { lord: 'moon', name: 'Moon', years: 10 },
  { lord: 'mars', name: 'Mars', years: 7 },
  { lord: 'rahu', name: 'Rahu', years: 18 },
  { lord: 'jupiter', name: 'Jupiter', years: 16 },
  { lord: 'saturn', name: 'Saturn', years: 19 },
  { lord: 'mercury', name: 'Mercury', years: 17 },
];

export function calculateVimshottariDasha(
  moonNakshatraIndex: number,
  moonPada: number,
  birthDateIso: string
): DashaPeriod[] {
  const birthYear = new Date(birthDateIso).getFullYear() || 1995;
  const nak = NAKSHATRAS[moonNakshatraIndex % 27];
  
  // Find index in DASHA_PERIODS matching ruling lord
  let lordIdx = DASHA_PERIODS.findIndex((p) => p.lord === nak.lord);
  if (lordIdx === -1) lordIdx = 0;

  // Fraction of nakshatra completed based on pada (approximate 0.25 per pada)
  const fractionElapsed = ((moonPada - 1) * 0.25) + 0.125;
  const currentLordTotalYears = DASHA_PERIODS[lordIdx].years;
  const balanceYears = currentLordTotalYears * (1 - fractionElapsed);

  const periods: DashaPeriod[] = [];
  const currentYear = new Date().getFullYear();
  let cursorYear = birthYear - (currentLordTotalYears - balanceYears);

  for (let i = 0; i < 9; i++) {
    const pIdx = (lordIdx + i) % 9;
    const item = DASHA_PERIODS[pIdx];
    const startY = Math.round(cursorYear);
    const endY = Math.round(cursorYear + item.years);
    const isActive = currentYear >= startY && currentYear <= endY;

    periods.push({
      lord: item.lord,
      lordName: item.name,
      startDate: `${startY}`,
      endDate: `${endY}`,
      years: item.years,
      isActive,
    });

    cursorYear += item.years;
  }

  return periods;
}
