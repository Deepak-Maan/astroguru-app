/**
 * AstroGuru Dynamic Daily Astrological Directives & Do's/Don'ts
 * Computes personalized cosmic directives per Moon/Lagna Rashi based on daily planetary transits.
 */

export interface DailyDirective {
  rashiId: string;
  rashiName: string;
  sanskritName: string;
  element: string;
  rulingPlanet: string;
  transitSummary: string;
  embrace: string[]; // Auspicious activities (Do's)
  avoid: string[];   // Inauspicious activities (Don'ts)
  powerMatrix: {
    luckyColor: string;
    luckyColorHex: string;
    luckyNumber: number;
    luckyDirection: string;
    abhijitMuhurat: string;
    favorableGraha: string;
  };
  affirmation: string;
}

export const DAILY_DIRECTIVES: Record<string, DailyDirective> = {
  aries: {
    rashiId: 'aries',
    rashiName: 'Aries',
    sanskritName: 'Mesha',
    element: 'Fire',
    rulingPlanet: 'Mars (Mangal)',
    transitSummary: 'Dynamic Mars energy fuels decisive leadership today. Favorable planetary alignment for initiating long-delayed projects and physical vitality.',
    embrace: [
      'Lead negotiations, initiate key proposals, and take confident decisions before 2 PM.',
      'Morning Surya Arghya (offering water to the rising sun) to enhance focus.',
      'Physical workouts and organizing strategic financial workflows.',
    ],
    avoid: [
      'Impulsive confrontations or arguing over minor details during Rahu Kaal.',
      'Lending large sums of money to unverified acquaintances.',
      'Rushing through legal agreements without thoroughly reading fine print.',
    ],
    powerMatrix: {
      luckyColor: 'Crimson Red',
      luckyColorHex: '#EF4444',
      luckyNumber: 9,
      luckyDirection: 'East',
      abhijitMuhurat: '11:48 AM – 12:38 PM',
      favorableGraha: 'Mars',
    },
    affirmation: 'My courage is guided by wisdom; I channel dynamic energy into victorious actions.',
  },
  taurus: {
    rashiId: 'taurus',
    rashiName: 'Taurus',
    sanskritName: 'Vrishabha',
    element: 'Earth',
    rulingPlanet: 'Venus (Shukra)',
    transitSummary: 'Venusian grace amplifies artistic intuition and material stability. Excellent day for luxury investments, home harmony, and relationship bonding.',
    embrace: [
      'Review investment portfolios and lock in stable, long-term savings schemes.',
      'Express heartfelt gratitude to spouse or partner with thoughtful gestures.',
      'Wearing fragrant oils or white/pastel clothing to enhance Venusian aura.',
    ],
    avoid: [
      'Stubborn resistance to practical compromises in family discussions.',
      'Overspending on impulse luxury items during evening hours.',
      'Consuming excessively heavy or tamasic food after sunset.',
    ],
    powerMatrix: {
      luckyColor: 'Silk Opal White',
      luckyColorHex: '#E2E8F0',
      luckyNumber: 6,
      luckyDirection: 'Southeast',
      abhijitMuhurat: '11:52 AM – 12:42 PM',
      favorableGraha: 'Venus',
    },
    affirmation: 'I attract abundance and tranquil harmony effortlessly into my sanctuary.',
  },
  gemini: {
    rashiId: 'gemini',
    rashiName: 'Gemini',
    sanskritName: 'Mithuna',
    element: 'Air',
    rulingPlanet: 'Mercury (Budha)',
    transitSummary: 'Mercury elevates intellect and communicative eloquence. Superb transit for interviews, public speaking, trading, and digital creative endeavors.',
    embrace: [
      'Schedule high-stakes client calls, presentations, and creative brainstorming.',
      'Feed green grass or fresh spinach to cows to propitiate Budha Deva.',
      'Clear your inbox, resolve pending correspondence, and learn new technical skills.',
    ],
    avoid: [
      'Overthinking multiple paths simultaneously to the point of analysis paralysis.',
      'Spreading unverified workplace gossip or engaging in online arguments.',
      'Multitasking while driving or operating complex machinery.',
    ],
    powerMatrix: {
      luckyColor: 'Emerald Green',
      luckyColorHex: '#10B981',
      luckyNumber: 5,
      luckyDirection: 'North',
      abhijitMuhurat: '11:45 AM – 12:35 PM',
      favorableGraha: 'Mercury',
    },
    affirmation: 'My mind is razor-sharp and my words carry truth, clarity, and prosperity.',
  },
  cancer: {
    rashiId: 'cancer',
    rashiName: 'Cancer',
    sanskritName: 'Karka',
    element: 'Water',
    rulingPlanet: 'Moon (Chandra)',
    transitSummary: 'The Moon heightens intuitive psychic sensitivity and emotional depth. Ideal for spiritual sadhana, domestic improvements, and healing rituals.',
    embrace: [
      'Listen closely to your gut instinct regarding new business partnerships.',
      'Chant the Om Namah Shivaya mantra with pure water offering to Shivling.',
      'Spend peaceful quality time with mother or maternal elders to earn blessings.',
    ],
    avoid: [
      'Taking casual workplace feedback as a personal emotional slight.',
      'Dwelling on past nostalgic regrets or old romantic attachments.',
      'Making hurried life commitments during late-night emotional lows.',
    ],
    powerMatrix: {
      luckyColor: 'Moonlight Silver',
      luckyColorHex: '#CBD5E1',
      luckyNumber: 2,
      luckyDirection: 'Northwest',
      abhijitMuhurat: '11:50 AM – 12:40 PM',
      favorableGraha: 'Moon',
    },
    affirmation: 'My emotional tides are anchored in peace; divine serenity flows through my soul.',
  },
  leo: {
    rashiId: 'leo',
    rashiName: 'Leo',
    sanskritName: 'Simha',
    element: 'Fire',
    rulingPlanet: 'Sun (Surya)',
    transitSummary: 'Surya Deva blesses you with magnetic charisma and executive authority. Prime transit for meeting senior officials, receiving recognition, and public visibility.',
    embrace: [
      'Step up to take command of challenging projects and lead with generosity.',
      'Chant the sacred Gayatri Mantra 24 times during morning sunrise.',
      'Encourage subordinates and share credit graciously to build fierce loyalty.',
    ],
    avoid: [
      'Allowing pride or ego to cloud rational decision-making in meetings.',
      'Dismissing dissenting opinions from trusted family members.',
      'Excessive exposure to harsh midday sun without proper hydration.',
    ],
    powerMatrix: {
      luckyColor: 'Royal Solar Gold',
      luckyColorHex: '#F59E0B',
      luckyNumber: 1,
      luckyDirection: 'East',
      abhijitMuhurat: '11:46 AM – 12:36 PM',
      favorableGraha: 'Sun',
    },
    affirmation: 'I shine with noble dignity, radiating warmth, strength, and divine purpose.',
  },
  virgo: {
    rashiId: 'virgo',
    rashiName: 'Virgo',
    sanskritName: 'Kanya',
    element: 'Earth',
    rulingPlanet: 'Mercury (Budha)',
    transitSummary: 'Analytical precision is peaked. An exceptional day for financial auditing, health diagnostics, meticulous project execution, and organizing environments.',
    embrace: [
      'Conduct thorough audits of expenses, bills, and pending tax records.',
      'Introduce wholesome organic remedies, green herbal teas, or yoga to your routine.',
      'Help someone in need through selfless service (Seva) to dissolve karmic debts.',
    ],
    avoid: [
      'Hyper-critical micro-management of coworkers and loved ones.',
      'Obsessing over minor imperfections that do not impact the bigger picture.',
      'Postponing necessary medical consultations or ignoring subtle body cues.',
    ],
    powerMatrix: {
      luckyColor: 'Olive Sage',
      luckyColorHex: '#84CC16',
      luckyNumber: 5,
      luckyDirection: 'South',
      abhijitMuhurat: '11:55 AM – 12:45 PM',
      favorableGraha: 'Mercury',
    },
    affirmation: 'I bring sacred order and perfection to all tasks with quiet grace and patience.',
  },
  libra: {
    rashiId: 'libra',
    rashiName: 'Libra',
    sanskritName: 'Tula',
    element: 'Air',
    rulingPlanet: 'Venus (Shukra)',
    transitSummary: 'Harmonious Venusian vibrations bring sweet diplomacy and romantic rejuvenation. Excellent for mediations, artistic ventures, and legal settlements.',
    embrace: [
      'Resolve long-standing interpersonal misunderstandings through calm mediation.',
      'Decorate your workspace with fresh aromatic flowers to attract positive Prana.',
      'Invest in personal grooming, elegant attire, or tasteful lifestyle upgrades.',
    ],
    avoid: [
      'People-pleasing at the expense of your personal peace and boundaries.',
      'Hesitating on important career decisions out of fear of causing friction.',
      'Over-indulging in sweet, sugary foods during late evening.',
    ],
    powerMatrix: {
      luckyColor: 'Rose Quartz Pink',
      luckyColorHex: '#EC4899',
      luckyNumber: 7,
      luckyDirection: 'West',
      abhijitMuhurat: '11:49 AM – 12:39 PM',
      favorableGraha: 'Venus',
    },
    affirmation: 'I walk the path of perfect balance, welcoming love, beauty, and fairness.',
  },
  scorpio: {
    rashiId: 'scorpio',
    rashiName: 'Scorpio',
    sanskritName: 'Vrishchika',
    element: 'Water',
    rulingPlanet: 'Mars & Ketu',
    transitSummary: 'Intense transformational energy unlocks occult wisdom and profound strategic insights. Deep research and uncovering hidden truths are strongly favored.',
    embrace: [
      'Engage in deep introspection, Jyotish study, meditation, and secret strategies.',
      'Recite Hanuman Chalisa to channel intense internal energy productively.',
      'Confront and let go of deep-seated resentments to experience spiritual rebirth.',
    ],
    avoid: [
      'Plotting secretive retribution or harboring toxic jealousy toward peers.',
      'Participating in speculative gambling or unverified crypto schemes.',
      'Isolating yourself completely when trusted friends offer genuine support.',
    ],
    powerMatrix: {
      luckyColor: 'Deep Maroon',
      luckyColorHex: '#991B1B',
      luckyNumber: 8,
      luckyDirection: 'North',
      abhijitMuhurat: '11:53 AM – 12:43 PM',
      favorableGraha: 'Mars',
    },
    affirmation: 'I transform all obstacles into spiritual gold; my inner power is limitless.',
  },
  sagittarius: {
    rashiId: 'sagittarius',
    rashiName: 'Sagittarius',
    sanskritName: 'Dhanu',
    element: 'Fire',
    rulingPlanet: 'Jupiter (Brihaspati)',
    transitSummary: 'Brihaspati radiates expansive optimism, higher philosophical wisdom, and good fortune. Outstanding day for higher education, mentorship, and pilgrimage.',
    embrace: [
      'Seek guidance from spiritual Gurus, mentors, and senior learned scholars.',
      'Apply saffron (kesar) or turmeric tilak on your forehead for Jupiterian protection.',
      'Plan an auspicious long-distance journey, academic upgrade, or philanthropic donation.',
    ],
    avoid: [
      'Dogmatic self-righteous preaching during casual friendly conversations.',
      'Making over-promising commitments that stretch your financial bandwidth.',
      'Neglecting immediate operational details while dreaming only of the distant horizon.',
    ],
    powerMatrix: {
      luckyColor: 'Sacred Saffron Yellow',
      luckyColorHex: '#FBBF24',
      luckyNumber: 3,
      luckyDirection: 'Northeast',
      abhijitMuhurat: '11:47 AM – 12:37 PM',
      favorableGraha: 'Jupiter',
    },
    affirmation: 'Divine wisdom illuminates my path; abundance and good fortune follow my footsteps.',
  },
  capricorn: {
    rashiId: 'capricorn',
    rashiName: 'Capricorn',
    sanskritName: 'Makara',
    element: 'Earth',
    rulingPlanet: 'Saturn (Shani)',
    transitSummary: 'Shani Deva rewards relentless discipline, integrity, and patient endurance. Powerful transit for career advancement, industrial work, and building lasting foundations.',
    embrace: [
      'Tackle the most demanding and tedious structural tasks with relentless focus.',
      'Feed black sesame seeds or mustard oil to stray animals or laborers.',
      'Honour punctuality and uphold solemn ethical promises without compromise.',
    ],
    avoid: [
      'Pessimistic cynicism or adopting a scarcity mindset regarding money.',
      'Ignoring physical fatigue; ensure adequate restorative rest for bones and joints.',
      'Judging the shortcomings of others with cold, unempathetic detachment.',
    ],
    powerMatrix: {
      luckyColor: 'Cosmic Midnight Blue',
      luckyColorHex: '#6366F1',
      luckyNumber: 8,
      luckyDirection: 'South',
      abhijitMuhurat: '11:51 AM – 12:41 PM',
      favorableGraha: 'Saturn',
    },
    affirmation: 'Through patient discipline and unwavering faith, I erect an unbreakable empire.',
  },
  aquarius: {
    rashiId: 'aquarius',
    rashiName: 'Aquarius',
    sanskritName: 'Kumbha',
    element: 'Air',
    rulingPlanet: 'Saturn & Rahu',
    transitSummary: 'Visionary thinking and unconventional problem-solving peak. Excellent for community activism, humanitarian initiatives, and breakthrough technological inventions.',
    embrace: [
      'Collaborate on innovative group projects, masterminds, and tech disruptions.',
      'Support underprivileged communities through collective charity drives.',
      'Practice Pranayama and breathwork to balance mental electrical currents.',
    ],
    avoid: [
      'Aloof emotional detachment when close friends or spouse need warmth.',
      'Rebelling against established systems purely for the sake of confrontation.',
      'Disrupted irregular sleep schedules that drain nervous system vitality.',
    ],
    powerMatrix: {
      luckyColor: 'Electric Cyan',
      luckyColorHex: '#38BDF8',
      luckyNumber: 4,
      luckyDirection: 'West',
      abhijitMuhurat: '11:44 AM – 12:34 PM',
      favorableGraha: 'Saturn',
    },
    affirmation: 'I am a conduit of progressive light, building a harmonious future for all beings.',
  },
  pisces: {
    rashiId: 'pisces',
    rashiName: 'Pisces',
    sanskritName: 'Meena',
    element: 'Water',
    rulingPlanet: 'Jupiter (Brihaspati)',
    transitSummary: 'Transcendent spiritual bliss and boundless compassion surround you. Ideal for meditation, artistic poetry, dream analysis, and selfless devotion.',
    embrace: [
      'Devote quiet dawn or dusk time to silent meditation, Japa, and visualization.',
      'Keep a dream journal beside your bed to capture prophetic subconscious signals.',
      'Practice unconditional forgiveness toward those who have wronged you in the past.',
    ],
    avoid: [
      'Escaping into delusion, daydreaming, or ungrounded spiritual bypassing.',
      'Letting opportunistic individuals exploit your empathetic, generous nature.',
      'Signing complex commercial agreements without verified third-party counsel.',
    ],
    powerMatrix: {
      luckyColor: 'Celestial Seafoam Gold',
      luckyColorHex: '#FCD34D',
      luckyNumber: 3,
      luckyDirection: 'Northeast',
      abhijitMuhurat: '11:54 AM – 12:44 PM',
      favorableGraha: 'Jupiter',
    },
    affirmation: 'I flow with the cosmic ocean; divine grace dissolves all fears and grants peace.',
  },
};

/**
 * Helper to retrieve daily directive for any given Rashi name or ID with fallback
 */
export function getDailyDirective(rashiKey?: string): DailyDirective {
  if (!rashiKey) return DAILY_DIRECTIVES.aries;
  const cleanKey = rashiKey.toLowerCase().trim();
  return DAILY_DIRECTIVES[cleanKey] || DAILY_DIRECTIVES.aries;
}
