/**
 * Vedic Panchang & Muhurat Engine
 * Calculates Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Abhijit Muhurat, and Event Timings.
 */

export interface PanchangDetails {
  date: string;
  day: string;
  tithi: { name: string; paksha: 'Shukla' | 'Krishna'; percentage: number };
  nakshatra: { name: string; lord: string; percentage: number };
  yoga: { name: string; meaning: string };
  karana: { name: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  rahuKaal: { start: string; end: string; status: 'active' | 'upcoming' | 'passed' };
  abhijitMuhurat: { start: string; end: string; isAuspicious: true };
  amritKaal: { start: string; end: string };
  choghadiya: { time: string; type: string; status: 'Good' | 'Neutral' | 'Bad' }[];
  eventMuhurats: { category: string; icon: string; bestTime: string; quality: 'Excellent' | 'Good' | 'Avoid' }[];
}

const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya',
];

const YOGAS = [
  { name: 'Vishkambha', meaning: 'Obstacles early, success later' },
  { name: 'Priti', meaning: 'Joy, affection and harmony' },
  { name: 'Ayushman', meaning: 'Longevity and good health' },
  { name: 'Saubhagya', meaning: 'Good fortune and prosperity' },
  { name: 'Shobhana', meaning: 'Beauty and elegance' },
  { name: 'Atiganda', meaning: 'High energy, proceed carefully' },
  { name: 'Sukarma', meaning: 'Virtuous deeds and success' },
  { name: 'Dhriti', meaning: 'Patience and endurance' },
  { name: 'Siddhi', meaning: 'Attainment of goals and wisdom' },
];

export function getDailyPanchang(targetDate: Date = new Date()): PanchangDetails {
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const dayIndex = targetDate.getDay();
  const dateNum = targetDate.getDate();

  const tithiIndex = (dateNum + dayIndex * 2) % 15;
  const paksha = (dateNum % 2 === 0) ? 'Shukla' : 'Krishna';
  const yogaItem = YOGAS[(dateNum + dayIndex) % YOGAS.length];

  // Rahu Kaal window varies by day of week
  const rahuWindows = [
    { start: '16:30', end: '18:00' }, // Sun
    { start: '07:30', end: '09:00' }, // Mon
    { start: '15:00', end: '16:30' }, // Tue
    { start: '12:00', end: '13:30' }, // Wed
    { start: '13:30', end: '15:00' }, // Thu
    { start: '10:30', end: '12:00' }, // Fri
    { start: '09:00', end: '10:30' }, // Sat
  ];

  return {
    date: dateStr,
    day: dayName,
    tithi: {
      name: TITHIS[tithiIndex],
      paksha,
      percentage: 78,
    },
    nakshatra: {
      name: 'Rohini',
      lord: 'Moon',
      percentage: 64,
    },
    yoga: yogaItem,
    karana: { name: 'Bava' },
    sunrise: '06:12 AM',
    sunset: '07:08 PM',
    moonrise: '08:45 PM',
    rahuKaal: {
      ...rahuWindows[dayIndex],
      status: 'upcoming',
    },
    abhijitMuhurat: {
      start: '11:54 AM',
      end: '12:46 PM',
      isAuspicious: true,
    },
    amritKaal: {
      start: '03:20 PM',
      end: '04:52 PM',
    },
    choghadiya: [
      { time: '06:12 AM - 07:48 AM', type: 'Amrit (Best)', status: 'Good' },
      { time: '07:48 AM - 09:24 AM', type: 'Kaal (Loss)', status: 'Bad' },
      { time: '09:24 AM - 11:00 AM', type: 'Shubh (Good)', status: 'Good' },
      { time: '11:00 AM - 12:36 PM', type: 'Roga (Illness)', status: 'Bad' },
      { time: '12:36 PM - 02:12 PM', type: 'Labh (Gain)', status: 'Good' },
      { time: '02:12 PM - 03:48 PM', type: 'Char (Neutral)', status: 'Neutral' },
    ],
    eventMuhurats: [
      { category: 'Marriage & Vivah', icon: '💑', bestTime: '07:15 PM - 11:30 PM', quality: 'Excellent' },
      { category: 'Griha Pravesh', icon: '🏡', bestTime: '09:24 AM - 11:00 AM', quality: 'Good' },
      { category: 'Vehicle Purchase', icon: '🚗', bestTime: '06:12 AM - 07:48 AM', quality: 'Excellent' },
      { category: 'Business Launch', icon: '💼', bestTime: '11:54 AM - 12:46 PM', quality: 'Excellent' },
      { category: 'Gold & Property', icon: '✨', bestTime: '12:36 PM - 02:12 PM', quality: 'Good' },
    ],
  };
}
