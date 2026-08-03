/**
 * Sanity checks for the Vedic astrology engine.
 *
 *   node scripts/verify-engine.mjs
 *
 * The engine is pure TypeScript with no React Native imports, so we can bundle
 * it for Node with esbuild and exercise it directly — no simulator required.
 *
 * The generated entry file must live inside the project tree, otherwise its
 * relative import specifiers cannot resolve.
 */
import { execFileSync, execSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const tmpDir = join(scriptsDir, '.tmp');
mkdirSync(tmpDir, { recursive: true });

const entry = join(tmpDir, 'entry.ts');
const bundle = join(tmpDir, 'out.cjs');

writeFileSync(
  entry,
  `
import { computeKundli, ayanamsa } from '../../src/services/astrology';
import { birthToJulianDay } from '../../src/utils';
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';

const cases = [
  {
    label: 'J2000 epoch (2000-01-01 12:00 UT, Greenwich)',
    date: '2000-01-01', time: '12:00',
    place: { name: 'London', state: 'UK', lat: 51.5074, lon: -0.1278, tz: 0 },
  },
  {
    label: 'Mahatma Gandhi (1869-10-02 07:45 IST, Porbandar)',
    date: '1869-10-02', time: '07:45',
    place: { name: 'Porbandar', state: 'Gujarat', lat: 21.6417, lon: 69.6293, tz: 5.5 },
  },
  {
    label: 'Modern reference (1990-06-15 10:30 IST, New Delhi)',
    date: '1990-06-15', time: '10:30',
    place: { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 },
  },
];

const out: any[] = [];
for (const c of cases) {
  const k = computeKundli({ name: 'Test', gender: 'other', date: c.date, time: c.time, place: c.place } as any);
  out.push({
    label: c.label,
    ayanamsa: Number(k.ayanamsa.toFixed(3)),
    lagna: RASHIS[k.lagnaIndex].sanskrit + ' @ ' + k.lagnaLongitude.toFixed(2) + '°',
    sun: RASHIS[k.sunRashiIndex].sanskrit,
    moon: RASHIS[k.moonRashiIndex].sanskrit,
    nakshatra: NAKSHATRAS[k.moonNakshatraIndex].name + ' pada ' + k.moonPada,
    mangalDosha: k.mangalDosha,
    planets: k.planets.map(p => p.key + ':' + RASHIS[p.rashiIndex].sanskrit + '(h' + p.house + (p.retrograde ? ',R' : '') + ')'),
  });
}

// ---- Structural invariants -------------------------------------------------
const k = computeKundli({
  name: 'T', gender: 'other', date: '1995-03-20', time: '14:20',
  place: { name: 'Mumbai', state: 'MH', lat: 19.076, lon: 72.8777, tz: 5.5 },
} as any);

const houseTotal = Object.values(k.houses).reduce((a: number, b: any) => a + b.length, 0);
const rahu = k.planets.find(p => p.key === 'rahu')!;
const ketu = k.planets.find(p => p.key === 'ketu')!;

const invariants = {
  ninePlanets: k.planets.length === 9,
  housesInRange: k.planets.every(p => p.house >= 1 && p.house <= 12),
  rashisInRange: k.planets.every(p => p.rashiIndex >= 0 && p.rashiIndex <= 11),
  nakshatrasInRange: k.planets.every(p => p.nakshatraIndex >= 0 && p.nakshatraIndex <= 26),
  padasInRange: k.planets.every(p => p.pada >= 1 && p.pada <= 4),
  longitudesInRange: k.planets.every(p => p.longitude >= 0 && p.longitude < 360),
  houseTotalIsNine: houseTotal === 9,
  ketuOppositeRahu: Math.abs(((rahu.longitude - ketu.longitude + 360) % 360) - 180) < 0.001,
  lagnaRashiIsHouseOne: k.planets.filter(p => p.rashiIndex === k.lagnaIndex).every(p => p.house === 1),
  lagnaLongitudeInRange: k.lagnaLongitude >= 0 && k.lagnaLongitude < 360,
};

// ---- Ayanamsa should precess ~50.29 arcsec/year ----------------------------
const a1900 = ayanamsa(birthToJulianDay('1900-01-01', '12:00', 0));
const a2000 = ayanamsa(birthToJulianDay('2000-01-01', '12:00', 0));
const driftArcsecPerYear = ((a2000 - a1900) * 3600) / 100;

// ---- Lagna must advance ~1 rashi per 2 sidereal hours ----------------------
const lagnaSweep: string[] = [];
for (let h = 0; h < 24; h += 2) {
  const t = String(h).padStart(2, '0') + ':00';
  const kk = computeKundli({
    name: 'T', gender: 'other', date: '2000-06-21', time: t,
    place: { name: 'Delhi', state: 'DL', lat: 28.6139, lon: 77.209, tz: 5.5 },
  } as any);
  lagnaSweep.push(t + '=' + RASHIS[kk.lagnaIndex].sanskrit);
}
const distinctLagnas = new Set(lagnaSweep.map(s => s.split('=')[1])).size;

console.log(JSON.stringify({
  cases: out,
  invariants,
  ayanamsa: {
    at1900: Number(a1900.toFixed(3)),
    at2000: Number(a2000.toFixed(3)),
    driftArcsecPerYear: Number(driftArcsecPerYear.toFixed(3)),
  },
  lagnaSweep,
  distinctLagnasIn24h: distinctLagnas,
  allInvariantsPass: Object.values(invariants).every(Boolean),
}, null, 2));
`,
);

try {
  execSync(
    `npx esbuild "${entry}" --bundle --platform=node --format=cjs --outfile="${bundle}" --log-level=error`,
    { stdio: 'inherit', cwd: join(scriptsDir, '..') },
  );
  process.stdout.write(execFileSync(process.execPath, [bundle], { encoding: 'utf8' }));
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
