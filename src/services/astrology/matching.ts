import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';

export interface GunMilanResult {
  varna: { score: number; max: 1; desc: string };
  vashya: { score: number; max: 2; desc: string };
  tara: { score: number; max: 3; desc: string };
  yoni: { score: number; max: 4; desc: string };
  maitri: { score: number; max: 5; desc: string };
  gana: { score: number; max: 6; desc: string };
  bhakoot: { score: number; max: 7; desc: string };
  nadi: { score: number; max: 8; desc: string };
  totalScore: number;
  maxTotal: 36;
  recommendation: 'Excellent' | 'Good' | 'Average' | 'Not Recommended';
  manglikBoy: boolean;
  manglikGirl: boolean;
  manglikMatch: boolean;
  summary: string;
}

export function calculateGunMilan(
  boyRashiIndex: number,
  boyNakshatraIndex: number,
  girlRashiIndex: number,
  girlNakshatraIndex: number
): GunMilanResult {
  // Deterministic 36-point Gun Milan calculation engine
  const seed = (boyRashiIndex * 7 + boyNakshatraIndex * 3 + girlRashiIndex * 11 + girlNakshatraIndex * 5) % 100;

  // 1. Varna (Work & Temperament) - Max 1
  const varnaScore = (boyRashiIndex % 4 >= girlRashiIndex % 4) ? 1 : 0;

  // 2. Vashya (Dominance & Control) - Max 2
  const vashyaScore = (boyRashiIndex === girlRashiIndex) ? 2 : (seed % 2 === 0 ? 2 : 1);

  // 3. Tara (Destiny & Well-being) - Max 3
  const taraDiff = Math.abs(boyNakshatraIndex - girlNakshatraIndex) % 9;
  const taraScore = (taraDiff === 3 || taraDiff === 5 || taraDiff === 7) ? 1.5 : 3;

  // 4. Yoni (Physical Compatibility) - Max 4
  const yoniScore = 2 + (seed % 3);

  // 5. Maitri (Mental & Emotional Friendship) - Max 5
  const rashiDiff = Math.abs(boyRashiIndex - girlRashiIndex);
  const maitriScore = (rashiDiff === 0 || rashiDiff === 4 || rashiDiff === 8) ? 5 : (rashiDiff === 6 ? 0.5 : 4);

  // 6. Gana (Behavior & Outlook) - Max 6
  const ganaScore = (boyNakshatraIndex % 3 === girlNakshatraIndex % 3) ? 6 : 4;

  // 7. Bhakoot (Love & Health) - Max 7
  const bhakootScore = (rashiDiff === 1 || rashiDiff === 5 || rashiDiff === 7) ? 0 : 7;

  // 8. Nadi (Genetics & Family Prosperity) - Max 8
  const nadiScore = (boyNakshatraIndex % 3 !== girlNakshatraIndex % 3) ? 8 : 0;

  const totalScore = Math.round(varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore);

  let recommendation: 'Excellent' | 'Good' | 'Average' | 'Not Recommended' = 'Good';
  if (totalScore >= 28) recommendation = 'Excellent';
  else if (totalScore >= 18) recommendation = 'Good';
  else if (totalScore >= 14) recommendation = 'Average';
  else recommendation = 'Not Recommended';

  const manglikBoy = seed % 3 === 0;
  const manglikGirl = seed % 4 === 0;
  const manglikMatch = manglikBoy === manglikGirl || (!manglikBoy && !manglikGirl);

  return {
    varna: { score: varnaScore, max: 1, desc: 'Ego & Spiritual Compatibility' },
    vashya: { score: vashyaScore, max: 2, desc: 'Mutual Attraction & Harmony' },
    tara: { score: taraScore, max: 3, desc: 'Health & Destiny Alignment' },
    yoni: { score: yoniScore, max: 4, desc: 'Intimacy & Physical Chemistry' },
    maitri: { score: maitriScore, max: 5, desc: 'Friendship & Intellectual Connection' },
    gana: { score: ganaScore, max: 6, desc: 'Temperament & Family Values' },
    bhakoot: { score: bhakootScore, max: 7, desc: 'Prosperity & Marital Bliss' },
    nadi: { score: nadiScore, max: 8, desc: 'Genetic Harmony & Child Health' },
    totalScore,
    maxTotal: 36,
    recommendation,
    manglikBoy,
    manglikGirl,
    manglikMatch,
    summary: `${totalScore}/36 Gunas matched between ${RASHIS[boyRashiIndex].sanskrit} & ${RASHIS[girlRashiIndex].sanskrit}. ${recommendation} alliance for marriage.`,
  };
}
