/**
 * Deterministic horoscope generator.
 *
 * Readings are seeded by (sign + period + dateKey) so the same sign always sees
 * the same reading for a given day/week/month — it never reshuffles on
 * re-render — yet it changes when the period rolls over. No API key needed.
 */
import { HoroscopePeriod, HoroscopeReading } from '../../types';
import { RASHIS } from '../../data/rashis';
import { hashString, pick, seededRandom, todayKey } from '../../utils';

const OPENERS = [
  'The Moon favours your sign today',
  'Jupiter’s gaze brings expansion',
  'A steady Saturn transit rewards patience',
  'Mercury sharpens your thinking',
  'Venus softens the mood around you',
  'Mars lends you momentum',
  'The nakshatra lord supports fresh starts',
  'Planetary alignment turns quietly in your favour',
];

const SUMMARIES = [
  'Long-pending matters begin to move. Trust the process and avoid forcing outcomes.',
  'Your energy is high and your judgement clear — a good window for decisions you have delayed.',
  'Keep expectations realistic. Small consistent effort will outperform a single grand gesture.',
  'Communication is your strength now. A conversation you have avoided may bring relief.',
  'Finances need a second look. Review before you commit to anything long-term.',
  'Family matters take priority. Your presence matters more than your advice.',
  'A creative idea deserves attention. Note it down before the day slips away.',
  'Rest is not idleness today. Recovery will multiply tomorrow’s output.',
  'An old contact may resurface with something useful. Stay open but verify.',
  'Discipline beats inspiration in this phase. Show up and the results will follow.',
];

const LOVE = [
  'Warmth returns to a close bond — speak first, explain later.',
  'Avoid old arguments. Silence is kinder than being right today.',
  'A gesture, however small, will be remembered longer than you expect.',
  'Single natives may notice interest from an unexpected quarter.',
  'Give your partner room. Space now prevents friction later.',
  'Honest words heal faster than perfect words. Say the true thing.',
];

const CAREER = [
  'A senior notices your consistency. Keep the quality steady.',
  'Do not take on new commitments until current work is closed.',
  'A delayed payment or approval finally clears.',
  'Collaboration outperforms solo effort — ask for the help you need.',
  'Document your work today. It protects you tomorrow.',
  'A learning opportunity is worth more than a small raise right now.',
];

const HEALTH = [
  'Hydration and sleep are your best remedies this week.',
  'Watch your posture and eye strain — screen fatigue is building.',
  'Light exercise will lift your mood more than rest alone.',
  'Digestion needs simpler food for a few days.',
  'Breathing practice in the morning will steady your mind.',
  'Do not ignore a minor ache; early attention avoids delay.',
];

const COLORS = [
  'Saffron', 'Deep Blue', 'Emerald Green', 'Gold', 'White', 'Maroon',
  'Turquoise', 'Silver', 'Yellow', 'Rose Pink',
];

/** Period key: daily -> date, weekly -> ISO week, monthly -> year-month. */
function periodKey(period: HoroscopePeriod, d: Date): string {
  if (period === 'daily') return todayKey(d);
  if (period === 'monthly') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  // weekly: year + week number
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function getHoroscope(
  sign: number,
  period: HoroscopePeriod = 'daily',
  date: Date = new Date(),
): HoroscopeReading {
  const dateKey = periodKey(period, date);
  const rashi = RASHIS[((sign % 12) + 12) % 12];
  const rnd = seededRandom(hashString(`${rashi.sanskrit}|${period}|${dateKey}`));

  const opener = pick(OPENERS, rnd);
  const body = pick(SUMMARIES, rnd);

  const horizon =
    period === 'daily' ? 'today' : period === 'weekly' ? 'this week' : 'this month';

  return {
    sign: rashi.index,
    period,
    dateKey,
    summary: `${opener}. ${body} Overall, ${horizon} rewards a calm and measured approach.`,
    love: pick(LOVE, rnd),
    career: pick(CAREER, rnd),
    health: pick(HEALTH, rnd),
    luckyNumber: Math.floor(rnd() * 9) + 1,
    luckyColor: pick(COLORS, rnd),
    mood: 45 + Math.floor(rnd() * 55), // 45..99
  };
}
