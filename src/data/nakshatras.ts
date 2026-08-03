import { PlanetKey } from '../types';

export interface Nakshatra {
  index: number;
  name: string;
  lord: PlanetKey; // Vimshottari dasha lord
  deity: string;
}

/** 27 Nakshatras with Vimshottari ruling planets, in order. */
export const NAKSHATRAS: Nakshatra[] = [
  { index: 0, name: 'Ashwini', lord: 'ketu', deity: 'Ashwini Kumaras' },
  { index: 1, name: 'Bharani', lord: 'venus', deity: 'Yama' },
  { index: 2, name: 'Krittika', lord: 'sun', deity: 'Agni' },
  { index: 3, name: 'Rohini', lord: 'moon', deity: 'Brahma' },
  { index: 4, name: 'Mrigashira', lord: 'mars', deity: 'Soma' },
  { index: 5, name: 'Ardra', lord: 'rahu', deity: 'Rudra' },
  { index: 6, name: 'Punarvasu', lord: 'jupiter', deity: 'Aditi' },
  { index: 7, name: 'Pushya', lord: 'saturn', deity: 'Brihaspati' },
  { index: 8, name: 'Ashlesha', lord: 'mercury', deity: 'Nagas' },
  { index: 9, name: 'Magha', lord: 'ketu', deity: 'Pitris' },
  { index: 10, name: 'Purva Phalguni', lord: 'venus', deity: 'Bhaga' },
  { index: 11, name: 'Uttara Phalguni', lord: 'sun', deity: 'Aryaman' },
  { index: 12, name: 'Hasta', lord: 'moon', deity: 'Savitar' },
  { index: 13, name: 'Chitra', lord: 'mars', deity: 'Tvashtar' },
  { index: 14, name: 'Swati', lord: 'rahu', deity: 'Vayu' },
  { index: 15, name: 'Vishakha', lord: 'jupiter', deity: 'Indra-Agni' },
  { index: 16, name: 'Anuradha', lord: 'saturn', deity: 'Mitra' },
  { index: 17, name: 'Jyeshtha', lord: 'mercury', deity: 'Indra' },
  { index: 18, name: 'Mula', lord: 'ketu', deity: 'Nirriti' },
  { index: 19, name: 'Purva Ashadha', lord: 'venus', deity: 'Apas' },
  { index: 20, name: 'Uttara Ashadha', lord: 'sun', deity: 'Vishvedevas' },
  { index: 21, name: 'Shravana', lord: 'moon', deity: 'Vishnu' },
  { index: 22, name: 'Dhanishta', lord: 'mars', deity: 'Vasus' },
  { index: 23, name: 'Shatabhisha', lord: 'rahu', deity: 'Varuna' },
  { index: 24, name: 'Purva Bhadrapada', lord: 'jupiter', deity: 'Aja Ekapada' },
  { index: 25, name: 'Uttara Bhadrapada', lord: 'saturn', deity: 'Ahir Budhnya' },
  { index: 26, name: 'Revati', lord: 'mercury', deity: 'Pushan' },
];

export const nakshatraByIndex = (i: number): Nakshatra =>
  NAKSHATRAS[((i % 27) + 27) % 27];
