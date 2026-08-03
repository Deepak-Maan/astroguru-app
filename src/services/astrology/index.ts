/**
 * Vedic Kundli assembler — turns a birth profile into a full chart:
 * Lagna (ascendant), planetary sidereal positions, Rashi/Nakshatra/Pada,
 * whole-sign houses and basic dosha flags.
 */
import { BirthProfile, Kundli, PlanetKey, PlanetPosition } from '../../types';
import { PLANET_ORDER, PLANETS } from '../../data/planets';
import {
  RAD2DEG,
  birthToJulianDay,
  cosD,
  norm360,
  sinD,
  tanD,
} from '../../utils';
import { geoLongitude, gmst, isRetrograde, obliquity } from './ephemeris';

/** Lahiri ayanamsa at J2000 (~23°51'). */
const AYANAMSA_J2000 = 23.853;
/** Precession in longitude, degrees per day. */
const PRECESSION_PER_DAY = 50.2388 / 3600 / 365.25;

/** Lahiri ayanamsa for a given Julian Day (deg). */
export function ayanamsa(jd: number): number {
  return AYANAMSA_J2000 + (jd - 2451545.0) * PRECESSION_PER_DAY;
}

/** Convert a J2000/date longitude to sidereal (Lahiri) longitude. */
function toSidereal(lon: number, jd: number): number {
  return norm360(lon - ayanamsa(jd));
}

export function rashiOf(siderealLon: number): number {
  return Math.floor(norm360(siderealLon) / 30) % 12;
}

export function nakshatraOf(siderealLon: number): { index: number; pada: number } {
  const span = 360 / 27; // 13°20'
  const idx = Math.floor(norm360(siderealLon) / span) % 27;
  const within = norm360(siderealLon) - idx * span;
  const pada = Math.min(4, Math.floor(within / (span / 4)) + 1);
  return { index: idx, pada };
}

/** Sidereal ascendant longitude (deg) for the birth moment & location. */
export function computeLagna(jd: number, latitude: number, eastLongitude: number): number {
  const eps = obliquity(jd);
  const lst = norm360(gmst(jd) + eastLongitude); // local sidereal time as an angle (RAMC)
  const ramc = lst;

  // Tropical ecliptic longitude of the ascendant.
  let asc =
    RAD2DEG *
    Math.atan2(
      cosD(ramc),
      -(sinD(ramc) * cosD(eps) + tanD(latitude) * sinD(eps)),
    );
  asc = norm360(asc);

  // The ascending point must lie on the eastern horizon: keep it within the
  // semicircle rising after the RAMC. Flip 180° if the formula picked Descendant.
  const diff = norm360(asc - ramc);
  if (diff > 180) asc = norm360(asc + 180);

  return toSidereal(asc, jd);
}

const MANGAL_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

export function computeKundli(profile: BirthProfile): Kundli {
  const { date, time, place } = profile;
  const jd = birthToJulianDay(date, time, place.tz);

  const lagnaLongitude = computeLagna(jd, place.lat, place.lon);
  const lagnaIndex = rashiOf(lagnaLongitude);

  const planets: PlanetPosition[] = PLANET_ORDER.map((key: PlanetKey) => {
    const sidereal = toSidereal(geoLongitude(key, jd), jd);
    const rashiIndex = rashiOf(sidereal);
    const nak = nakshatraOf(sidereal);
    const house = ((rashiIndex - lagnaIndex + 12) % 12) + 1;
    return {
      key,
      name: PLANETS[key].name,
      longitude: sidereal,
      rashiIndex,
      nakshatraIndex: nak.index,
      pada: nak.pada,
      house,
      retrograde: isRetrograde(key, jd),
    };
  });

  const houses: Record<number, PlanetKey[]> = {};
  for (let h = 1; h <= 12; h++) houses[h] = [];
  planets.forEach((p) => houses[p.house].push(p.key));

  const moon = planets.find((p) => p.key === 'moon')!;
  const sun = planets.find((p) => p.key === 'sun')!;
  const mars = planets.find((p) => p.key === 'mars')!;
  const moonNak = nakshatraOf(moon.longitude);

  return {
    lagnaIndex,
    lagnaLongitude,
    moonRashiIndex: moon.rashiIndex,
    moonNakshatraIndex: moonNak.index,
    moonPada: moonNak.pada,
    sunRashiIndex: sun.rashiIndex,
    planets,
    houses,
    mangalDosha: MANGAL_HOUSES.has(mars.house),
    ayanamsa: ayanamsa(jd),
    computedAt: Date.now(),
  };
}

/** Current tithi (lunar day 1..30) for a given date. */
export function currentTithi(jd: number): number {
  const sun = geoLongitude('sun', jd);
  const moon = geoLongitude('moon', jd);
  const elong = norm360(moon - sun);
  return Math.floor(elong / 12) + 1;
}

export * from './milan';
export * from './dasha';

