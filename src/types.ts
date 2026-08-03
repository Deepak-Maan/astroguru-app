/** Shared domain types for AstroGuru. */

export interface City {
  name: string;
  state: string;
  lat: number; // degrees, north positive
  lon: number; // degrees, east positive
  tz: number; // UTC offset in hours (e.g. 5.5 for IST)
}

export interface BirthProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** 24h time HH:mm */
  time: string;
  place: City;
}

export interface PlanetPosition {
  key: PlanetKey;
  name: string;
  /** sidereal ecliptic longitude 0..360 */
  longitude: number;
  rashiIndex: number; // 0..11
  nakshatraIndex: number; // 0..26
  pada: number; // 1..4
  house: number; // 1..12 (whole sign from lagna)
  retrograde: boolean;
}

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export interface Kundli {
  lagnaIndex: number; // ascendant rashi 0..11
  lagnaLongitude: number;
  moonRashiIndex: number; // Rashi (janma rashi)
  moonNakshatraIndex: number;
  moonPada: number;
  sunRashiIndex: number;
  planets: PlanetPosition[];
  /** houses[h] = array of planet keys in house h (1..12) */
  houses: Record<number, PlanetKey[]>;
  mangalDosha: boolean;
  ayanamsa: number;
  computedAt: number;
}

export interface Astrologer {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  rating: number; // 0..5
  reviews: number;
  pricePerMin: number; // in ₹
  online: boolean;
  about: string;
  consultations: number;
}

export interface WalletTransaction {
  id: string;
  type: 'topup' | 'debit';
  amount: number; // positive number
  label: string;
  at: number; // epoch ms
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
  pending?: boolean;
}

export interface ConsultSession {
  astrologerId: string;
  messages: ChatMessage[];
  startedAt: number | null;
  costSoFar: number;
}

export type HoroscopePeriod = 'daily' | 'weekly' | 'monthly';

export interface HoroscopeReading {
  sign: number; // rashi index 0..11
  period: HoroscopePeriod;
  dateKey: string;
  summary: string;
  love: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  mood: number; // 0..100
}
