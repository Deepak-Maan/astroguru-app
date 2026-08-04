export interface NumerologyAnalysis {
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  personalYear2026: number;

  pastLifeInsight: {
    karmicDebt: string;
    pastLifeRole: string;
    karmicLesson: string;
    spiritualGift: string;
  };

  futureForecast: Array<{
    year: number;
    personalYear: number;
    title: string;
    careerPredict: string;
    lovePredict: string;
    wealthPredict: string;
  }>;
}

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function reduceToSingleDigit(num: number): number {
  if (isNaN(num) || num <= 0) return 1;
  let val = Math.abs(Math.floor(num));
  while (val > 9 && val !== 11 && val !== 22 && val !== 33) {
    val = String(val)
      .split('')
      .reduce((acc, digit) => acc + (parseInt(digit, 10) || 0), 0);
  }
  if (val === 11) return 2;
  if (val === 22) return 4;
  if (val === 33) return 6;
  if (val > 9) {
    val = val % 9 || 9;
  }
  return val || 1;
}

function calculateNameScore(text: string, filterVowelsOnly = false, filterConsonantsOnly = false): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);

  let total = 0;
  for (const char of clean) {
    const isVowel = vowels.has(char);
    if (filterVowelsOnly && !isVowel) continue;
    if (filterConsonantsOnly && isVowel) continue;
    total += CHALDEAN_MAP[char] || 1;
  }
  return reduceToSingleDigit(total);
}

export function computeNumerologyDetails(name: string, dobString: string): NumerologyAnalysis {
  // 1. Life Path Number from DOB (DD-MM-YYYY or YYYY-MM-DD)
  const dobDigits = dobString.replace(/\D/g, '').split('').map((d) => parseInt(d, 10) || 0);
  const dobSum = dobDigits.reduce((a, b) => a + b, 0);
  const lifePathNumber = reduceToSingleDigit(dobSum) || 7;

  // 2. Destiny Number
  const destinyNumber = calculateNameScore(name);

  // 3. Soul Urge Number (Vowels)
  const soulUrgeNumber = calculateNameScore(name, true, false);

  // 4. Personality Number (Consonants)
  const personalityNumber = calculateNameScore(name, false, true);

  // 5. Personal Year 2026 (Day + Month + 2026)
  const dayMonthSum = dobDigits.slice(0, 4).reduce((a, b) => a + b, 0);
  const personalYear2026 = reduceToSingleDigit(dayMonthSum + 2 + 0 + 2 + 6) || 5;

  // 6. Past Life & Karmic Insights
  const PAST_LIFE_MAP: Record<number, { karmicDebt: string; pastLifeRole: string; karmicLesson: string; spiritualGift: string }> = {
    1: {
      karmicDebt: 'Karma of Independence & Willpower',
      pastLifeRole: 'Vedic Scholar or Monarch in Ancient India',
      karmicLesson: 'Overcoming reliance on others and asserting authentic soul authority.',
      spiritualGift: 'Natural leadership aura and unwavering focus.',
    },
    2: {
      karmicDebt: 'Karma of Diplomacy & Harmony',
      pastLifeRole: 'Court Musician, Mystic, or Healer in Temple Cities',
      karmicLesson: 'Balancing selflessness with emotional boundaries.',
      spiritualGift: 'Deep intuitive clairvoyance and psychic empathy.',
    },
    3: {
      karmicDebt: 'Karma of Creative Expression',
      pastLifeRole: 'Sanskrit Poet, Philosopher, or Master Artisan',
      karmicLesson: 'Using words and art to uplift others rather than seek approval.',
      spiritualGift: 'Mesmerizing speech and joyful manifestation energy.',
    },
    4: {
      karmicDebt: 'Karmic Debt 14/4 - Foundation & Patience',
      pastLifeRole: 'Temple Architect, Agronomist, or Fortress General',
      karmicLesson: 'Patience and building long-lasting spiritual foundations.',
      spiritualGift: 'Rock-solid practical wisdom and organizational power.',
    },
    5: {
      karmicDebt: 'Karma of Freedom & Versatility',
      pastLifeRole: 'Silk Road Merchant, Voyager, or Vedic Astrologer',
      karmicLesson: 'Channeling restless energy into purposeful spiritual growth.',
      spiritualGift: 'Rapid adaptability and high cosmic IQ.',
    },
    6: {
      karmicDebt: 'Karmic Debt 16/6 - Domestic Responsibility & Love',
      pastLifeRole: 'Ashram Administrator, Royal Vaidya (Healer), or Guardian',
      karmicLesson: 'Unconditional love without expectation of reward.',
      spiritualGift: 'Healing touch and aura of warmth.',
    },
    7: {
      karmicDebt: 'Karma of Sacred Inquiry & Wisdom',
      pastLifeRole: 'Himalayan Hermit or Vedic Astronomical Researcher',
      karmicLesson: 'Trusting spiritual truths beyond material appearances.',
      spiritualGift: 'Profound metaphysical insight and meditative depth.',
    },
    8: {
      karmicDebt: 'Karmic Debt 19/8 - Power & Abundance',
      pastLifeRole: 'Minister of Finance or Land Overseer in Ancient Empires',
      karmicLesson: 'Using wealth and power ethically for society benefit.',
      spiritualGift: 'Midas touch for material abundance and strategic vision.',
    },
    9: {
      karmicDebt: 'Karma of Universal Compassion & Completion',
      pastLifeRole: 'Renounced Teacher, Philanthropist, or Spiritual Guide',
      karmicLesson: 'Releasing past attachments and forgiving old souls.',
      spiritualGift: 'Higher cosmic consciousness and global empathy.',
    },
  };

  const pastLifeInsight = PAST_LIFE_MAP[lifePathNumber] || PAST_LIFE_MAP[1];

  // 7. Future Forecast 2026 - 2030
  const futureForecast = [
    {
      year: 2026,
      personalYear: reduceToSingleDigit(personalYear2026),
      title: 'Year of Breakthroughs & Financial Expansion',
      careerPredict: 'Major professional promotion or lucrative business pivot expected in Q3 2026.',
      lovePredict: 'Harmonious relationship stability; ideal time for marriage or commitment.',
      wealthPredict: 'Unexpected wealth inflows through investments & property gains.',
    },
    {
      year: 2027,
      personalYear: reduceToSingleDigit(personalYear2026 + 1),
      title: 'Year of Spiritual Awakening & Travel',
      careerPredict: 'Expansion through overseas contracts or digital leadership roles.',
      lovePredict: 'Deeper soulmate connection and family celebrations.',
      wealthPredict: 'Steady passive income growth and gemstone investments.',
    },
    {
      year: 2028,
      personalYear: reduceToSingleDigit(personalYear2026 + 2),
      title: 'Year of Golden Prosperity & Recognition',
      careerPredict: 'Public honors, awards, and establishment of legacy projects.',
      lovePredict: 'Joyful family harmony and birth of auspicious ventures.',
      wealthPredict: 'Peak financial returns and real estate acquisition.',
    },
    {
      year: 2029,
      personalYear: reduceToSingleDigit(personalYear2026 + 3),
      title: 'Year of Higher Wisdom & Inner Peace',
      careerPredict: 'Transition towards mentorship, executive leadership, or advisory roles.',
      lovePredict: 'Serene emotional contentment and spiritual companionship.',
      wealthPredict: 'Solid financial security and charitable endowments.',
    },
    {
      year: 2030,
      personalYear: reduceToSingleDigit(personalYear2026 + 4),
      title: 'Year of New Beginnings & Master Achievements',
      careerPredict: 'Fresh 9-year cycle launch with high prestige and global reach.',
      lovePredict: 'Passionate renewal and lifelong stability.',
      wealthPredict: 'Exponential multiplier on long-term assets.',
    },
  ];

  return {
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    personalYear2026,
    pastLifeInsight,
    futureForecast,
  };
}
