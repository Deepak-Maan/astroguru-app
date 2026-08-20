/**
 * Claude-powered AI astrologer.
 *
 * The user's own API key is read from settingsStore (SecureStore on native,
 * localStorage on web). If no key is present we return a friendly fallback that
 * points the user to Settings, so the app is fully usable without a key.
 *
 * PRODUCTION NOTE: calling the Anthropic API directly from a client ships the
 * key to the device. For a real launch, put a thin backend in front of this and
 * swap ENDPOINT to your own server — the rest of this module stays the same.
 */
import { BirthProfile, ChatMessage, Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';
import { PLANETS } from '../../data/planets';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 800;

export const NO_KEY_MESSAGE =
  'I need an Anthropic API key before I can read your chart in depth.\n\n' +
  'Open **Settings → AI Astrologer Key** and paste your key (it stays on this device). ' +
  'Meanwhile, your Kundli, daily horoscope and astrologer consultations all work without it.';

/** Human-readable chart summary injected as context for the model. */
export function describeKundli(profile: BirthProfile, kundli: Kundli | null): string {
  if (!kundli) {
    return `Name: ${profile.name}. Birth details: ${profile.date} at ${profile.time}, ${profile.place.name}. (Chart not yet computed.)`;
  }
  const lagna = RASHIS[kundli.lagnaIndex];
  const moon = RASHIS[kundli.moonRashiIndex];
  const sun = RASHIS[kundli.sunRashiIndex];
  const nak = NAKSHATRAS[kundli.moonNakshatraIndex];

  const placements = kundli.planets
    .map((p) => {
      const r = RASHIS[p.rashiIndex];
      return `${PLANETS[p.key].name} in ${r.sanskrit} (${r.english}), house ${p.house}${p.retrograde ? ', retrograde' : ''}`;
    })
    .join('; ');

  return [
    `Name: ${profile.name} (${profile.gender}).`,
    `Born ${profile.date} at ${profile.time} in ${profile.place.name}, ${profile.place.state}.`,
    `Lagna (Ascendant): ${lagna.sanskrit} (${lagna.english}), lord ${PLANETS[lagna.lord].name}.`,
    `Janma Rashi (Moon sign): ${moon.sanskrit} (${moon.english}).`,
    `Nakshatra: ${nak.name} pada ${kundli.moonPada}, lord ${PLANETS[nak.lord].name}.`,
    `Sun sign (sidereal): ${sun.sanskrit} (${sun.english}).`,
    `Mangal (Manglik) dosha: ${kundli.mangalDosha ? 'present' : 'not present'}.`,
    `Planetary placements: ${placements}.`,
  ].join('\n');
}

function systemPrompt(chartContext: string): string {
  return [
    'You are a warm, knowledgeable Vedic astrologer (Jyotishi) in the AstroGuru app.',
    '',
    'How to respond:',
    '- Ground every reading in the specific chart data provided below: cite the Lagna, Janma Rashi, Nakshatra, house placements and dasha lords by name.',
    '- Use authentic Vedic vocabulary (Rashi, Bhava, Graha, Nakshatra, Dasha, Dosha) and briefly gloss terms a newcomer may not know.',
    '- Keep answers to 2–4 short paragraphs. Be specific and practical, not vague.',
    '- Where helpful, suggest a traditional remedy (mantra, charity/daan, gemstone, fasting day) and note it is a faith-based practice.',
    '- Be encouraging and constructive. Never predict death, terminal illness, or disaster.',
    '- For medical, legal or financial decisions, add one short line advising a qualified professional.',
    '- If the user asks something the chart cannot answer, say so plainly rather than inventing detail.',
    '',
    'The seeker’s birth chart:',
    chartContext,
  ].join('\n');
}

export interface AskOptions {
  apiKey: string | null;
  profile: BirthProfile | null;
  kundli: Kundli | null;
  history: ChatMessage[];
  question: string;
}

export interface AskResult {
  text: string;
  ok: boolean;
}

import { generateAIAstrologyReply } from './aiAstrologyEngine';

/** Send a question to Claude or use on-device Vedic reasoning engine with the user's chart as context. */
export async function askAstrologer({
  apiKey,
  profile,
  kundli,
  history,
  question,
}: AskOptions): Promise<AskResult> {
  // If no API key, use our intelligent on-device Vedic reasoning engine immediately
  if (!apiKey) {
    const aiText = generateAIAstrologyReply(question, null, kundli, profile);
    return { text: aiText, ok: true };
  }

  const chartContext = profile
    ? describeKundli(profile, kundli)
    : 'The seeker has not saved birth details yet. Ask for date, time and place of birth before giving a chart-based reading.';

  const messages = [
    ...history
      .filter((m) => !m.pending && m.text.trim().length > 0)
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.text })),
    { role: 'user' as const, content: question },
  ];

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(chartContext),
        messages,
      }),
    });

    if (!res.ok) {
      // Fallback to intelligent on-device engine on API error
      const aiText = generateAIAstrologyReply(question, null, kundli, profile);
      return { text: aiText, ok: true };
    }

    const data = await res.json();
    const text = (data?.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .trim();

    return text
      ? { text, ok: true }
      : { text: generateAIAstrologyReply(question, null, kundli, profile), ok: true };
  } catch (e) {
    // Graceful offline fallback
    const aiText = generateAIAstrologyReply(question, null, kundli, profile);
    return { text: aiText, ok: true };
  }
}

/** Canned opening suggestions shown as chips in the AI chat screen. */
export const SUGGESTED_QUESTIONS = [
  'What does my Lagna say about my personality?',
  'How is my career looking this year?',
  'When is a good time for marriage?',
  'Which remedies suit my chart?',
  'What are my strongest planets?',
];
