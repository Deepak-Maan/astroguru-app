/**
 * Mock astrologer replies for the paid-consult chat.
 *
 * These are deterministic, chart-aware canned responses so the consult flow is
 * demonstrable without a real astrologer or backend. Swap this module for a
 * Firebase/socket transport when wiring real consultations.
 */
import { Astrologer, Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';
import { hashString, pick, seededRandom } from '../../utils';

const GREETINGS = [
  'Namaste 🙏 I have your kundli in front of me. Tell me what is troubling you.',
  'Namaste 🙏 Welcome. I can see your chart — what would you like to know first?',
  'Namaste 🙏 Thank you for reaching out. Share your concern and I will look at the grahas.',
];

const TOPIC_REPLIES: Record<string, string[]> = {
  marriage: [
    'Looking at your 7th bhava and its lord, a genuine prospect opens once Jupiter transits favourably. Avoid finalising anything in a retrograde Venus period.',
    'Your 7th house indicates a partner met through family or work circles. The window after the next Jupiter transit is more supportive than the present one.',
  ],
  career: [
    'Your 10th bhava is reasonably strong. A role change is supported, but negotiate rather than resign abruptly — Saturn rewards patience here.',
    'The dasha lord favours steady growth over a sudden jump. Build visible proof of your work over the next few months; recognition follows.',
  ],
  money: [
    'The 2nd and 11th houses suggest income improves, but leakage through impulsive spending is the real issue. Track expenses for 40 days.',
    'Avoid lending money during this period. A pending amount does return to you, though later than promised.',
  ],
  health: [
    'The 6th bhava points to stress-related strain rather than anything structural. Regular sleep and lighter evening meals will help considerably.',
    'Watch digestion and nerves. Pranayama in the morning would settle the Vata imbalance indicated here.',
  ],
  education: [
    'Mercury’s placement supports focused study. Break preparation into short daily blocks rather than long irregular sessions.',
    'Your 5th bhava favours learning, but distraction is the obstacle. A fixed study hour will change results within a month.',
  ],
  love: [
    'Venus indicates genuine affection, but a communication gap is creating doubt. Speak plainly and directly this week.',
    'This bond has karmic depth. Give it honesty rather than tests — the 5th house here rewards sincerity.',
  ],
  remedy: [
    'Recite the Hanuman Chalisa on Tuesdays and offer jaggery-chana. Simple, consistent practice matters more than an elaborate ritual.',
    'Donate white items on Monday and offer water to the Sun at sunrise. Do it for 21 days without a break.',
    'A yellow sapphire could suit you, but only after a proper muhurat check. Begin with the mantra before any gemstone.',
  ],
  general: [
    'I see this reflected in your chart. The current phase asks for patience — the planetary period shifts in your favour soon.',
    'Your chart shows resilience. What feels like a delay right now is actually protection from a worse outcome.',
    'This is a transitional phase. Keep your commitments small and reliable, and the next cycle opens up properly.',
  ],
};

const TOPIC_KEYWORDS: Array<[string, string[]]> = [
  ['marriage', ['marriage', 'shaadi', 'wedding', 'spouse', 'match', 'manglik']],
  ['career', ['career', 'job', 'work', 'business', 'promotion', 'office', 'interview']],
  ['money', ['money', 'finance', 'loan', 'debt', 'wealth', 'salary', 'income', 'property']],
  ['health', ['health', 'illness', 'pain', 'disease', 'sick', 'anxiety', 'stress', 'sleep']],
  ['education', ['study', 'exam', 'education', 'college', 'result', 'course', 'degree']],
  ['love', ['love', 'relationship', 'partner', 'girlfriend', 'boyfriend', 'breakup', 'crush']],
  ['remedy', ['remedy', 'upay', 'puja', 'mantra', 'gemstone', 'stone', 'dosha', 'fix']],
];

function detectTopic(text: string): string {
  const t = text.toLowerCase();
  for (const [topic, words] of TOPIC_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return topic;
  }
  return 'general';
}

export function greetingFor(astrologer: Astrologer): string {
  const rnd = seededRandom(hashString(astrologer.id));
  return pick(GREETINGS, rnd);
}

/** Generate a plausible reply to the user's message. */
export function replyTo(
  userText: string,
  astrologer: Astrologer,
  kundli: Kundli | null,
  turnIndex: number,
): string {
  const topic = detectTopic(userText);
  const rnd = seededRandom(hashString(`${astrologer.id}|${topic}|${turnIndex}`));
  const base = pick(TOPIC_REPLIES[topic], rnd);

  if (!kundli) return base;

  // Add a chart-specific line so the reply feels personalised.
  const lagna = RASHIS[kundli.lagnaIndex];
  const moon = RASHIS[kundli.moonRashiIndex];
  const nak = NAKSHATRAS[kundli.moonNakshatraIndex];
  const detail = pick(
    [
      `With ${lagna.sanskrit} lagna, ${lagna.traits.toLowerCase()} That shapes how this plays out for you.`,
      `Your Janma Rashi is ${moon.sanskrit} and Nakshatra ${nak.name} — this makes you more sensitive to timing than most.`,
      `${nak.name} nakshatra under ${nak.deity} gives you staying power once you commit.`,
      kundli.mangalDosha
        ? 'Mangal dosha is present in your chart, so I would advise a proper matching before any alliance.'
        : 'There is no Mangal dosha in your chart, which removes one common obstacle.',
    ],
    rnd,
  );

  return `${base}\n\n${detail}`;
}

/** Simulated typing delay in ms, so replies feel human. */
export function typingDelay(text: string): number {
  return Math.min(3200, 900 + text.length * 12);
}
