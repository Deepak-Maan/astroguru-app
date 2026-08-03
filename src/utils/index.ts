/** Small date / math / formatting helpers. */

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function norm360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function sinD(deg: number): number {
  return Math.sin(deg * DEG2RAD);
}
export function cosD(deg: number): number {
  return Math.cos(deg * DEG2RAD);
}
export function tanD(deg: number): number {
  return Math.tan(deg * DEG2RAD);
}

/** Julian Day from a UTC date/time. */
export function toJulianDayUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + (hour + minute / 60) / 24;
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    dayFrac +
    B -
    1524.5
  );
}

/**
 * Build a Julian Day from a local birth date/time + timezone offset (hours).
 * Converts local -> UTC by subtracting the offset.
 */
export function birthToJulianDay(
  dateISO: string,
  timeHHmm: string,
  tzOffsetHours: number,
): number {
  const [y, mo, d] = dateISO.split('-').map(Number);
  const [hh, mm] = timeHHmm.split(':').map(Number);
  // local time -> UTC
  const utcHourDecimal = hh + mm / 60 - tzOffsetHours;
  return toJulianDayUTC(y, mo, d, Math.floor(utcHourDecimal), (utcHourDecimal % 1) * 60);
}

export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Deterministic string -> 32-bit hash (for seeded content). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG factory. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function clockTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
