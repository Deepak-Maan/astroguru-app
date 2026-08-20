/**
 * Intelligent Astrologer Consultation Reply Engine
 * 
 * Generates rich, personalized, chart-aware Vedic guidance in response to seeker questions.
 */
import { Astrologer, Kundli } from '../../types';
import { hashString, pick, seededRandom } from '../../utils';
import { generateAIAstrologyReply } from '../ai/aiAstrologyEngine';

const GREETINGS = [
  'Namaste 🙏 I have your Kundli open in front of me. Share your question or what is troubling you, and we will look into the grahas.',
  'Namaste 🙏 Welcome. I am looking at your birth chart right now — what would you like guidance on today?',
  'Namaste 🙏 Blessings to you. Tell me your concern regarding Career, Marriage, Finance or Health, and I will analyze the planetary transits for you.',
];

export function greetingFor(astrologer: Astrologer): string {
  const rnd = seededRandom(hashString(astrologer.id));
  return pick(GREETINGS, rnd);
}

/** Generate an intelligent AI astrologer reply according to the seeker's question */
export function replyTo(
  userText: string,
  astrologer: Astrologer,
  kundli: Kundli | null,
  turnIndex: number,
): string {
  return generateAIAstrologyReply(userText, astrologer, kundli);
}

/** Simulated typing delay in ms, so replies feel natural and thoughtful */
export function typingDelay(text: string): number {
  return Math.min(2600, 800 + Math.min(text.length, 120) * 10);
}
