/**
 * Google Gemini AI Astrologer Engine
 *
 * Real-time Vedic Astrology AI consultation engine with:
 * - Seeker's birth chart (Kundli, Lagna, Janma Rashi, Nakshatra, Bhavas, Dashas, Manglik Dosha)
 * - Multi-turn conversational memory (follow-up questions)
 * - Astrologer persona (experience, tone, Vedic specialties)
 * - Multi-lingual fluency (Hinglish, Hindi, English)
 * - Uplifting, ethical, authentic traditional remedies
 */

import { Astrologer, BirthProfile, ChatMessage, Kundli } from '../../types';
import { describeKundli } from './anthropic';

// Primary Gemini 1.5 Flash endpoint (high speed, Vedic-fluent, generous quota)
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Fallback public demo keys and environment variables
const ENV_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export interface GeminiAskOptions {
  currentMessage: string;
  history: ChatMessage[];
  astrologer?: Astrologer;
  kundli: Kundli | null;
  profile: BirthProfile | null;
  customApiKey?: string;
}

export interface GeminiAskResult {
  ok: boolean;
  text: string;
  source: 'gemini' | 'fallback';
}

function buildSystemPrompt(
  astrologer: Astrologer | undefined,
  profile: BirthProfile | null,
  kundli: Kundli | null
): string {
  const chartContext = profile
    ? describeKundli(profile, kundli)
    : 'Seeker birth details are not fully filled. Offer intuitive Vedic guidance based on their questions.';

  const astrologerName = astrologer?.name || 'AI Jyotishi (Divya Drishti)';
  const specialties = astrologer?.specialties?.join(', ') || 'Vedic Kundli, Planetary Transits, Dasha Remedies, Prashna';
  const experience = astrologer?.experienceYears || 25;

  return [
    `You are ${astrologerName}, a revered and compassionate Vedic Astrologer (Jyotishi) in the AstroGuru app with ${experience} years of spiritual experience.`,
    `Your areas of Vedic mastery: ${specialties}.`,
    '',
    '### CORE DIRECTIVES & PERSONA:',
    '1. Language Matching: Automatically match the seeker\'s language. If they write in Hinglish (e.g. "meri job kab lagegi", "shadi me delay kyu hai"), reply in warm, comforting Hinglish. If they write in Hindi (Devanagari), reply in polite Hindi. If in English, reply in crisp English.',
    '2. Authentic Vedic Knowledge: Mention relevant planetary placements, houses (Bhavas), Dashas (Mahadasha/Antardasha), Nakshatras, and transits (Gochara) using natural Jyotish terms.',
    '3. Constructive & Compassionate: Be warm, empowering, and respectful. Never predict death, terminal illnesses, irreversible disaster, or instill fearful panic. Frame challenging planetary periods as karmic lessons that can be navigated.',
    '4. Practical Vedic Remedies: Recommend simple, authentic satvik remedies when helpful: chanting sacred mantras (Gayatri Mantra, Maha Mrityunjaya, Hanuman Chalisa), morning Surya Arghya, charitable donations (daan to the needy), fasting on auspicious days, or lighting evening lamps.',
    '5. Length & Tone: Keep responses engaging, focused, and conversational (around 2 to 4 concise paragraphs). Add occasional gentle blessings (e.g. "Ishwar ki kripa aap par bani rahe 🙏").',
    '',
    '### SEEKER BIRTH CHART & PROFILE:',
    chartContext,
  ].join('\n');
}

/**
 * Sends a multi-turn chat request to Google Gemini API.
 */
export async function askGeminiAstrologer(options: GeminiAskOptions): Promise<GeminiAskResult> {
  const { currentMessage, history, astrologer, kundli, profile, customApiKey } = options;

  const apiKey = customApiKey || ENV_GEMINI_KEY;

  // Build system instruction and conversation history
  const systemInstruction = buildSystemPrompt(astrologer, profile, kundli);

  // Filter and format message history for Gemini (roles: 'user' | 'model')
  const validHistory = history
    .filter((m) => !m.pending && m.text && m.text.trim().length > 0)
    .slice(-10);

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const m of validHistory) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    // Ensure alternating roles and starting with user
    if (contents.length === 0 && role === 'model') {
      contents.push({ role: 'user', parts: [{ text: 'Pranam Guruji, kripya mera margdarshan karein.' }] });
    }
    const lastRole = contents[contents.length - 1]?.role;
    if (lastRole === role) {
      // Append text to previous part to avoid consecutive same-role error
      contents[contents.length - 1].parts[0].text += `\n${m.text}`;
    } else {
      contents.push({ role, parts: [{ text: m.text }] });
    }
  }

  // Add current user prompt
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${currentMessage}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });
  }

  if (apiKey) {
    try {
      const url = `${GEMINI_API_ENDPOINT}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
            topP: 0.95,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && typeof candidate === 'string' && candidate.trim().length > 10) {
          return {
            ok: true,
            text: candidate.trim(),
            source: 'gemini',
          };
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.warn('[Gemini API response error]', response.status, errText);
      }
    } catch (err) {
      console.warn('[Gemini API network error]', err);
    }
  }

  return {
    ok: false,
    text: '',
    source: 'fallback',
  };
}
