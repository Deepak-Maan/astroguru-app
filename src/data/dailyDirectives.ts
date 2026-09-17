/**
 * AstroGuru Daily Astrological Guide & Do's / Don'ts
 * Written in simple, easy-to-understand language for everyday users.
 */

export interface DailyDirective {
  rashiId: string;
  rashiName: string;
  sanskritName: string;
  element: string;
  rulingPlanet: string;
  transitSummary: string;
  embrace: string[]; // Good things to do today
  avoid: string[];   // Things to be careful with
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
    transitSummary: 'Your energy and confidence are high today. It is a great time to start tasks you have put off and take bold steps at work.',
    embrace: [
      'Take the lead in meetings and make important decisions with confidence.',
      'Spend a few minutes in morning prayer or light exercise to stay focused.',
      'Plan your daily budget and organize your pending work early.',
    ],
    avoid: [
      'Avoid losing your temper or arguing over small matters.',
      'Do not lend large sums of money to casual acquaintances today.',
      'Don’t sign important papers in a hurry without reading carefully.',
    ],
    powerMatrix: {
      luckyColor: 'Bright Red',
      luckyColorHex: '#EF4444',
      luckyNumber: 9,
      luckyDirection: 'East',
      abhijitMuhurat: '11:48 AM – 12:38 PM',
      favorableGraha: 'Mars',
    },
    affirmation: 'I am confident, patient, and successful in everything I do today.',
  },
  taurus: {
    rashiId: 'taurus',
    rashiName: 'Taurus',
    sanskritName: 'Vrishabha',
    element: 'Earth',
    rulingPlanet: 'Venus (Shukra)',
    transitSummary: 'Venus brings peace, comfort, and financial balance today. A wonderful day to spend quality time with family and plan long-term savings.',
    embrace: [
      'Review your savings, pay bills on time, and make a practical family budget.',
      'Show extra care and appreciation to your spouse or partner.',
      'Wear light or white clothes to stay calm, relaxed, and cheerful.',
    ],
    avoid: [
      'Avoid being overly stubborn during discussions at home.',
      'Do not buy expensive luxury items on an impulse tonight.',
      'Avoid eating very oily or heavy junk food late at night.',
    ],
    powerMatrix: {
      luckyColor: 'Soft White',
      luckyColorHex: '#E2E8F0',
      luckyNumber: 6,
      luckyDirection: 'Southeast',
      abhijitMuhurat: '11:52 AM – 12:42 PM',
      favorableGraha: 'Venus',
    },
    affirmation: 'I welcome peace, good health, and steady success into my life.',
  },
  gemini: {
    rashiId: 'gemini',
    rashiName: 'Gemini',
    sanskritName: 'Mithuna',
    element: 'Air',
    rulingPlanet: 'Mercury (Budha)',
    transitSummary: 'Mercury helps you think clearly and speak persuasively. Excellent day for job interviews, phone calls, studying, and learning new things.',
    embrace: [
      'Have important conversations, attend interviews, or pitch fresh ideas.',
      'Clear your pending messages, emails, and phone calls early.',
      'Do a kind deed or feed an animal or bird to bring good luck.',
    ],
    avoid: [
      'Avoid overthinking multiple options to the point of getting confused.',
      'Do not participate in workplace gossip or online arguments.',
      'Avoid checking your phone while driving or walking on busy roads.',
    ],
    powerMatrix: {
      luckyColor: 'Fresh Green',
      luckyColorHex: '#10B981',
      luckyNumber: 5,
      luckyDirection: 'North',
      abhijitMuhurat: '11:45 AM – 12:35 PM',
      favorableGraha: 'Mercury',
    },
    affirmation: 'My thoughts are clear, my words are kind, and my day is productive.',
  },
  cancer: {
    rashiId: 'cancer',
    rashiName: 'Cancer',
    sanskritName: 'Karka',
    element: 'Water',
    rulingPlanet: 'Moon (Chandra)',
    transitSummary: 'The Moon gives you strong intuition and a caring heart today. A great day to take care of loved ones, pray, and trust your inner feelings.',
    embrace: [
      'Trust your instincts when making personal or family decisions.',
      'Offer fresh water to plants or a Shivling in the morning for peace of mind.',
      'Spend loving time with your mother or elders and seek their blessings.',
    ],
    avoid: [
      'Do not take casual comments from colleagues too personally.',
      'Avoid thinking about past mistakes or old relationship regrets.',
      'Don’t make sudden major life promises when feeling emotional late at night.',
    ],
    powerMatrix: {
      luckyColor: 'Pearl Silver',
      luckyColorHex: '#CBD5E1',
      luckyNumber: 2,
      luckyDirection: 'Northwest',
      abhijitMuhurat: '11:50 AM – 12:40 PM',
      favorableGraha: 'Moon',
    },
    affirmation: 'I am calm, protected, and surrounded by positive energy.',
  },
  leo: {
    rashiId: 'leo',
    rashiName: 'Leo',
    sanskritName: 'Simha',
    element: 'Fire',
    rulingPlanet: 'Sun (Surya)',
    transitSummary: 'The Sun blesses you with respect, leadership, and charm today. Great day to meet bosses, ask for promotions, or present your work proudly.',
    embrace: [
      'Take charge of projects at work and motivate your teammates.',
      'Offer fresh water to the rising Sun in the morning for strength and focus.',
      'Give compliments and share credit with others to build lasting goodwill.',
    ],
    avoid: [
      'Avoid letting pride or ego cause friction during meetings.',
      'Do not ignore good advice from trusted family members.',
      'Avoid standing out in direct harsh sunlight without drinking water.',
    ],
    powerMatrix: {
      luckyColor: 'Golden Yellow',
      luckyColorHex: '#F59E0B',
      luckyNumber: 1,
      luckyDirection: 'East',
      abhijitMuhurat: '11:46 AM – 12:36 PM',
      favorableGraha: 'Sun',
    },
    affirmation: 'I lead with a warm heart, courage, and genuine honesty.',
  },
  virgo: {
    rashiId: 'virgo',
    rashiName: 'Virgo',
    sanskritName: 'Kanya',
    element: 'Earth',
    rulingPlanet: 'Mercury (Budha)',
    transitSummary: 'Your eye for detail is sharp today. A perfect time to balance your accounts, clean your room or desk, and plan your health routine.',
    embrace: [
      'Organize your finances, clear pending bills, and tidy up your workspace.',
      'Eat fresh, simple home-cooked food and drink plenty of water.',
      'Help someone quietly without expecting anything in return.',
    ],
    avoid: [
      'Avoid finding fault with every small thing your coworkers or family do.',
      'Do not stress yourself out over minor imperfections.',
      'Don’t ignore minor body aches or health checkups you need.',
    ],
    powerMatrix: {
      luckyColor: 'Light Green',
      luckyColorHex: '#84CC16',
      luckyNumber: 5,
      luckyDirection: 'South',
      abhijitMuhurat: '11:55 AM – 12:45 PM',
      favorableGraha: 'Mercury',
    },
    affirmation: 'I work with patience, clarity, and peace of mind.',
  },
  libra: {
    rashiId: 'libra',
    rashiName: 'Libra',
    sanskritName: 'Tula',
    element: 'Air',
    rulingPlanet: 'Venus (Shukra)',
    transitSummary: 'Venus brings friendly relationships, balance, and sweetness today. Ideal for solving old misunderstandings and enjoying romantic moments.',
    embrace: [
      'Resolve arguments with friends or family with a polite, calm talk.',
      'Keep fresh flowers or a pleasant fragrance near you for good vibes.',
      'Dress well and wear your favorite clothes to boost your confidence.',
    ],
    avoid: [
      'Avoid saying "yes" to everyone just to please them when you are tired.',
      'Don’t delay important work decisions out of fear of disagreement.',
      'Avoid eating too many sweets or sugary drinks today.',
    ],
    powerMatrix: {
      luckyColor: 'Pastel Pink',
      luckyColorHex: '#EC4899',
      luckyNumber: 7,
      luckyDirection: 'West',
      abhijitMuhurat: '11:49 AM – 12:39 PM',
      favorableGraha: 'Venus',
    },
    affirmation: 'I bring harmony, kindness, and happiness wherever I go.',
  },
  scorpio: {
    rashiId: 'scorpio',
    rashiName: 'Scorpio',
    sanskritName: 'Vrishchika',
    element: 'Water',
    rulingPlanet: 'Mars & Ketu',
    transitSummary: 'You have strong willpower and deep focus today. Perfect for solving tough problems, studying complex topics, and making quiet future plans.',
    embrace: [
      'Spend quiet time planning your next steps and focusing on your goals.',
      'Read or listen to the Hanuman Chalisa for courage and peace.',
      'Forgive and let go of any old grudges to feel lighter inside.',
    ],
    avoid: [
      'Avoid holding onto jealousy or thinking about taking revenge.',
      'Do not put money into risky get-rich-quick schemes or unverified bets.',
      'Don’t isolate yourself completely when good friends reach out to you.',
    ],
    powerMatrix: {
      luckyColor: 'Dark Maroon',
      luckyColorHex: '#991B1B',
      luckyNumber: 8,
      luckyDirection: 'North',
      abhijitMuhurat: '11:53 AM – 12:43 PM',
      favorableGraha: 'Mars',
    },
    affirmation: 'I am strong, resilient, and in control of my future.',
  },
  sagittarius: {
    rashiId: 'sagittarius',
    rashiName: 'Sagittarius',
    sanskritName: 'Dhanu',
    element: 'Fire',
    rulingPlanet: 'Jupiter (Brihaspati)',
    transitSummary: 'Jupiter brings good fortune, optimism, and wise ideas today. A wonderful day to learn, seek guidance from teachers or elders, and explore new horizons.',
    embrace: [
      'Talk with a teacher, mentor, or elder for helpful life advice.',
      'Start reading an inspiring book or begin an educational course.',
      'Help a student with their studies or donate books/stationery.',
    ],
    avoid: [
      'Avoid making promises that you cannot realistically keep.',
      'Do not talk down to others or sound like you know everything.',
      'Avoid driving recklessly or speeding when in a hurry.',
    ],
    powerMatrix: {
      luckyColor: 'Saffron Gold',
      luckyColorHex: '#FBBF24',
      luckyNumber: 3,
      luckyDirection: 'Northeast',
      abhijitMuhurat: '11:51 AM – 12:41 PM',
      favorableGraha: 'Jupiter',
    },
    affirmation: 'I am open to learning, growing, and sharing positive blessings.',
  },
  capricorn: {
    rashiId: 'capricorn',
    rashiName: 'Capricorn',
    sanskritName: 'Makara',
    element: 'Earth',
    rulingPlanet: 'Saturn (Shani)',
    transitSummary: 'Saturn rewards disciplined, honest effort today. A great day to finish work ahead of schedule and lay strong building blocks for your future.',
    embrace: [
      'Focus on completing your most important task before starting new ones.',
      'Show kindness to helpers, workers, or security staff around you.',
      'Save money and avoid unnecessary purchases today.',
    ],
    avoid: [
      'Avoid feeling cynical or negative if things move a little slowly.',
      'Do not work continuously without taking short eye and stretch breaks.',
      'Don’t neglect family members while focusing only on office work.',
    ],
    powerMatrix: {
      luckyColor: 'Navy Blue',
      luckyColorHex: '#1E3A8A',
      luckyNumber: 8,
      luckyDirection: 'West',
      abhijitMuhurat: '11:47 AM – 12:37 PM',
      favorableGraha: 'Saturn',
    },
    affirmation: 'My hard work and patience will bring lasting rewards.',
  },
  aquarius: {
    rashiId: 'aquarius',
    rashiName: 'Aquarius',
    sanskritName: 'Kumbha',
    element: 'Air',
    rulingPlanet: 'Saturn & Rahu',
    transitSummary: 'You have unique, creative ideas today. Excellent for working on technology, team projects, social causes, and connecting with good friends.',
    embrace: [
      'Brainstorm creative solutions to difficult everyday problems.',
      'Call or message a close friend you haven’t talked with recently.',
      'Support a community or charitable initiative that helps others.',
    ],
    avoid: [
      'Avoid acting distant or cold with family members who need your warmth.',
      'Do not argue with elders over traditional beliefs.',
      'Avoid staying up too late staring at computer or phone screens.',
    ],
    powerMatrix: {
      luckyColor: 'Electric Cyan',
      luckyColorHex: '#06B6D4',
      luckyNumber: 4,
      luckyDirection: 'North',
      abhijitMuhurat: '11:54 AM – 12:44 PM',
      favorableGraha: 'Saturn',
    },
    affirmation: 'I use my unique talents to help myself and everyone around me.',
  },
  pisces: {
    rashiId: 'pisces',
    rashiName: 'Pisces',
    sanskritName: 'Meena',
    element: 'Water',
    rulingPlanet: 'Jupiter (Brihaspati)',
    transitSummary: 'Your imagination, kindness, and spiritual awareness are highlighted today. Great day for prayer, meditation, creative arts, and helping people.',
    embrace: [
      'Spend 10 minutes in morning meditation, prayer, or listening to calm music.',
      'Help someone quietly or feed birds in the morning.',
      'Trust your creative instincts when designing or writing.',
    ],
    avoid: [
      'Avoid daydreaming when you have deadlines to meet today.',
      'Do not lend money without a clear agreement on when it will be returned.',
      'Avoid negative people who drain your energy with constant complaints.',
    ],
    powerMatrix: {
      luckyColor: 'Soft Yellow',
      luckyColorHex: '#FDE047',
      luckyNumber: 3,
      luckyDirection: 'Northeast',
      abhijitMuhurat: '11:50 AM – 12:40 PM',
      favorableGraha: 'Jupiter',
    },
    affirmation: 'I am surrounded by peace, love, and divine blessings.',
  },
};

export function getDailyDirective(rashiId?: string): DailyDirective {
  if (!rashiId) return DAILY_DIRECTIVES.aries;
  const key = rashiId.toLowerCase().trim();
  return DAILY_DIRECTIVES[key] || DAILY_DIRECTIVES.aries;
}
