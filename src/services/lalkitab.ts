import { Kundli, PlanetPosition } from '../types';
import { RASHIS } from '../data/rashis';
import { PLANETS } from '../data/planets';

export interface LalKitabDebt {
  id: string;
  name: string;
  sanskritName: string;
  cause: string;
  symptoms: string[];
  severity: 'High' | 'Medium' | 'Low';
  remedyDuration: string;
  remedies: string[];
  icon: string;
  isPresent: boolean;
}

export interface LalKitabHouseInfo {
  house: number;
  sign: string;
  pakkaGharLord: string;
  occupants: string[];
  isSoya: boolean; // Dormant house
  isAndha: boolean; // Blind house
}

export function calculateLalKitab(kundli: Kundli) {
  // In Lal Kitab, House 1 is always Aries (Mesh)
  const houses: LalKitabHouseInfo[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const rashi = RASHIS[i]; // Pakka Ghar 1=Aries, 2=Taurus, etc.
    const occupants = (kundli.planets || [])
      .filter((p: PlanetPosition) => p.house === houseNum)
      .map((p: PlanetPosition) => PLANETS[p.key as keyof typeof PLANETS]?.name || p.name);

    return {
      house: houseNum,
      sign: rashi.sanskrit,
      pakkaGharLord: PLANETS[rashi.lord as keyof typeof PLANETS]?.name || rashi.lord,
      occupants: occupants,
      isSoya: occupants.length === 0 && houseNum !== 1 && houseNum !== 7,
      isAndha: houseNum === 10 && occupants.length > 1,
    };
  });

  // Calculate 9 Ancestral Debts (Pitru Rina, Matru Rina, etc.)
  const debts: LalKitabDebt[] = [
    {
      id: 'pitru_rina',
      name: 'Pitru Rina (Father’s Ancestral Debt)',
      sanskritName: 'पितृ ऋण',
      cause: 'Afflicted Sun or Jupiter in 9th/10th house due to ancestral disrespect to elders or family priests.',
      symptoms: ['Hair loss or baldness at early age', 'Stagnation in career despite effort', 'Gold jewelry lost or stolen'],
      severity: kundli.sunRashiIndex === 6 || kundli.mangalDosha ? 'High' : 'Low',
      remedyDuration: '43 Consecutive Days',
      remedies: [
        'Collect equal money from all blood family members and donate 43 copper coins in running river water.',
        'Offer water to the rising Sun daily at dawn with a pinch of red kumkum.',
        'Respect elders and serve elderly Brahmins on Amavasya.',
      ],
      icon: '☀️',
      isPresent: true,
    },
    {
      id: 'matru_rina',
      name: 'Matru Rina (Mother’s Ancestral Debt)',
      sanskritName: 'मातृ ऋण',
      cause: 'Moon afflicted by Ketu or Rahu, caused by neglect of mother or sacred water bodies in past lineage.',
      symptoms: ['Frequent mental stress and anxiety', 'Financial instability & cash drain', 'Drinking water pollution at home'],
      severity: kundli.moonNakshatraIndex % 2 === 0 ? 'Medium' : 'Low',
      remedyDuration: '40 Days',
      remedies: [
        'Collect silver coins from all family members and submerge them in running river water.',
        'Touch mother’s feet every morning before leaving home to seek blessings.',
        'Donate white rice, milk and silver to needy women on Mondays.',
      ],
      icon: '🌙',
      isPresent: kundli.moonNakshatraIndex % 2 === 0,
    },
    {
      id: 'stree_rina',
      name: 'Stree Rina (Wife / Women’s Debt)',
      sanskritName: 'स्त्री ऋण',
      cause: 'Venus afflicted by Sun or Rahu due to ill-treatment or disrespect towards women in the lineage.',
      symptoms: ['Marital discord & misunderstandings', 'Skin issues or lack of glow', 'Loss of luxury and vehicles'],
      severity: 'Medium',
      remedyDuration: '43 Days',
      remedies: [
        'Feed 100 cows with fresh green fodder or jaggery.',
        'Gift silk clothes or silver ornaments to women in the household.',
        'Keep a solid silver square piece in your wallet at all times.',
      ],
      icon: '💃',
      isPresent: true,
    },
    {
      id: 'bhartru_rina',
      name: 'Bhartru Rina (Brother / Relative Debt)',
      sanskritName: 'भ्रातृ ऋण',
      cause: 'Mars afflicted by Saturn or Rahu due to property disputes or betrayal among siblings in past generations.',
      symptoms: ['Blood-related health issues', 'Frequent property or land legal battles', 'Lack of support from brothers'],
      severity: kundli.mangalDosha ? 'High' : 'Low',
      remedyDuration: '43 Days',
      remedies: [
        'Bury sweet jaggery rewri or 43 pieces of copper in an uninhabited secluded ground.',
        'Donate sweet red boondi prasad at Hanuman temple on Tuesdays.',
        'Avoid arguments with younger brothers and treat workers with fairness.',
      ],
      icon: '⚔️',
      isPresent: kundli.mangalDosha,
    },
    {
      id: 'guru_rina',
      name: 'Guru Rina (Teacher / Spiritual Debt)',
      sanskritName: 'गुरु ऋण',
      cause: 'Jupiter placed with Rahu (Guru Chandal Dosh) or afflicted in 1st/8th house.',
      symptoms: ['Obstacles in higher education', 'Misunderstandings with mentors or bosses', 'Lack of spiritual peace'],
      severity: 'Medium',
      remedyDuration: '40 Days',
      remedies: [
        'Apply yellow sandalwood or saffron (Kesar) tilak on your forehead and navel daily.',
        'Donate turmeric, yellow clothes, and chana dal at a Vishnu or Shiva temple on Thursdays.',
        'Offer water to Peepal tree without touching its roots on Thursdays.',
      ],
      icon: '🕉️',
      isPresent: true,
    },
  ];

  return { houses, debts };
}
