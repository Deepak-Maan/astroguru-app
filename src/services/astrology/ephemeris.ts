/**
 * Lightweight geocentric ephemeris.
 *
 * Accuracy note: Sun & Moon are computed from standard truncated series
 * (Meeus). Mercury–Saturn use Standish's Keplerian elements (valid ~1800–2050),
 * giving longitudes good to a few arc-minutes / fractions of a degree — more
 * than enough for Rashi (30°) and usually Nakshatra (13°20') resolution, but
 * NOT observatory-grade. Rahu/Ketu use the mean lunar node.
 *
 * All longitudes returned here are J2000 ecliptic longitudes in degrees.
 * The kundli module converts them to sidereal (Lahiri) longitudes.
 */
import { DEG2RAD, RAD2DEG, cosD, norm360, sinD } from '../../utils';
import { PlanetKey } from '../../types';

interface KeplerElements {
  a: number; aDot: number; // AU
  e: number; eDot: number;
  I: number; IDot: number; // deg
  L: number; LDot: number; // deg
  wbar: number; wbarDot: number; // longitude of perihelion, deg
  Om: number; OmDot: number; // longitude of ascending node, deg
}

// Standish (JPL) Keplerian elements & rates, epoch J2000, per Julian century.
const ELEMENTS: Record<'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn', KeplerElements> = {
  mercury: { a: 0.38709927, aDot: 0.00000037, e: 0.20563593, eDot: 0.00001906, I: 7.00497902, IDot: -0.00594749, L: 252.2503235, LDot: 149472.67411175, wbar: 77.45779628, wbarDot: 0.16047689, Om: 48.33076593, OmDot: -0.12534081 },
  venus: { a: 0.72333566, aDot: 0.0000039, e: 0.00677672, eDot: -0.00004107, I: 3.39467605, IDot: -0.0007889, L: 181.9790995, LDot: 58517.81538729, wbar: 131.60246718, wbarDot: 0.00268329, Om: 76.67984255, OmDot: -0.27769418 },
  earth: { a: 1.00000261, aDot: 0.00000562, e: 0.01671123, eDot: -0.00004392, I: -0.00001531, IDot: -0.01294668, L: 100.46457166, LDot: 35999.37244981, wbar: 102.93768193, wbarDot: 0.32327364, Om: 0.0, OmDot: 0.0 },
  mars: { a: 1.52371034, aDot: 0.00001847, e: 0.0933941, eDot: 0.00007882, I: 1.84969142, IDot: -0.00813131, L: -4.55343205, LDot: 19140.30268499, wbar: -23.94362959, wbarDot: 0.44441088, Om: 49.55953891, OmDot: -0.29257343 },
  jupiter: { a: 5.202887, aDot: -0.00011607, e: 0.04838624, eDot: -0.00013253, I: 1.30439695, IDot: -0.00183714, L: 34.39644051, LDot: 3034.74612775, wbar: 14.72847983, wbarDot: 0.21252668, Om: 100.47390909, OmDot: 0.20469106 },
  saturn: { a: 9.53667594, aDot: -0.0012506, e: 0.05386179, eDot: -0.00050991, I: 2.48599187, IDot: 0.00193609, L: 49.95424423, LDot: 1222.49362201, wbar: 92.59887831, wbarDot: -0.41897216, Om: 113.66242448, OmDot: -0.28867794 },
};

interface Vec3 { x: number; y: number; z: number; }

function centuries(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/** Heliocentric J2000 ecliptic rectangular coords for a Keplerian body. */
function heliocentric(el: KeplerElements, T: number): Vec3 {
  const a = el.a + el.aDot * T;
  const e = el.e + el.eDot * T;
  const I = el.I + el.IDot * T;
  const L = el.L + el.LDot * T;
  const wbar = el.wbar + el.wbarDot * T;
  const Om = el.Om + el.OmDot * T;

  const w = wbar - Om; // argument of perihelion
  let M = L - wbar; // mean anomaly
  M = ((M + 180) % 360) - 180; // normalize to -180..180

  // Solve Kepler's equation (M, E in degrees).
  const eStar = RAD2DEG * e;
  let E = M + eStar * sinD(M);
  for (let i = 0; i < 8; i++) {
    const dM = M - (E - eStar * sinD(E));
    const dE = dM / (1 - e * cosD(E));
    E += dE;
    if (Math.abs(dE) < 1e-7) break;
  }

  // Position in orbital plane.
  const xp = a * (cosD(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * sinD(E);

  const cw = cosD(w), sw = sinD(w);
  const cO = cosD(Om), sO = sinD(Om);
  const cI = cosD(I), sI = sinD(I);

  const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
  const y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
  const z = sw * sI * xp + cw * sI * yp;
  return { x, y, z };
}

/** Sun's geocentric J2000 ecliptic longitude (deg). */
function sunLongitude(T: number): number {
  const earth = heliocentric(ELEMENTS.earth, T);
  // Sun is opposite the Earth as seen from the Sun's heliocentric frame.
  return norm360(RAD2DEG * Math.atan2(-earth.y, -earth.x));
}

/** Moon's geocentric ecliptic longitude of date (deg), truncated Meeus series. */
function moonLongitude(T: number): number {
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.272095 + 483202.0175233 * T;

  const lon =
    Lp +
    6.288774 * sinD(Mp) +
    1.274027 * sinD(2 * D - Mp) +
    0.658314 * sinD(2 * D) +
    0.213618 * sinD(2 * Mp) -
    0.185116 * sinD(M) -
    0.114332 * sinD(2 * F) +
    0.058793 * sinD(2 * D - 2 * Mp) +
    0.057066 * sinD(2 * D - M - Mp) +
    0.053322 * sinD(2 * D + Mp) +
    0.045758 * sinD(2 * D - M) -
    0.040923 * sinD(M - Mp) -
    0.03472 * sinD(D) -
    0.030383 * sinD(M + Mp) +
    0.015327 * sinD(2 * D - 2 * F) -
    0.012528 * sinD(Mp + 2 * F) +
    0.01098 * sinD(Mp - 2 * F);
  return norm360(lon);
}

/** Mean lunar ascending node (Rahu), longitude of date (deg). */
function meanNode(T: number): number {
  return norm360(125.04452 - 1934.136261 * T);
}

const KEPLER: Record<string, keyof typeof ELEMENTS> = {
  mercury: 'mercury', venus: 'venus', mars: 'mars', jupiter: 'jupiter', saturn: 'saturn',
};

/**
 * Geocentric J2000 ecliptic longitude (deg) for a planet.
 * Moon & mean node are returned as longitude-of-date but the small precession
 * offset is absorbed by the ayanamsa conversion in the kundli module.
 */
export function geoLongitude(planet: PlanetKey, jd: number): number {
  const T = centuries(jd);
  if (planet === 'sun') return sunLongitude(T);
  if (planet === 'moon') return moonLongitude(T);
  if (planet === 'rahu') return meanNode(T);
  if (planet === 'ketu') return norm360(meanNode(T) + 180);

  const el = ELEMENTS[KEPLER[planet]];
  const planetPos = heliocentric(el, T);
  const earthPos = heliocentric(ELEMENTS.earth, T);
  const gx = planetPos.x - earthPos.x;
  const gy = planetPos.y - earthPos.y;
  return norm360(RAD2DEG * Math.atan2(gy, gx));
}

/** True if the planet's geocentric longitude is decreasing (retrograde). */
export function isRetrograde(planet: PlanetKey, jd: number): boolean {
  if (planet === 'sun' || planet === 'moon') return false;
  if (planet === 'rahu' || planet === 'ketu') return true; // nodes are always retrograde
  const l1 = geoLongitude(planet, jd - 1);
  const l2 = geoLongitude(planet, jd + 1);
  let d = l2 - l1;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

/** Obliquity of the ecliptic (deg). */
export function obliquity(jd: number): number {
  const T = centuries(jd);
  return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T;
}

/** Greenwich Mean Sidereal Time (deg). */
export function gmst(jd: number): number {
  const T = centuries(jd);
  const g =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return norm360(g);
}

export { DEG2RAD };
