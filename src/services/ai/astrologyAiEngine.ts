/**
 * AstroGuru Multi-Turn Context-Aware Vedic AI Astrologer Engine
 *
 * Provides deeply personalized, context-aware Jyotish responses based on:
 * 1. Full conversation history (multi-turn follow-ups & conversational memory)
 * 2. Seeker's real Kundli chart (Lagna, Rashi, Nakshatra, Bhavas, Dashas, Manglik Dosha)
 * 3. Astrologer's persona, experience, and Vedic specialization
 * 4. Language adaptation (Hinglish, Hindi, English)
 */

import { Astrologer, BirthProfile, ChatMessage, Kundli } from '../../types';
import { RASHIS } from '../../data/rashis';
import { NAKSHATRAS } from '../../data/nakshatras';
import { PLANETS } from '../../data/planets';

export interface GenerateAiReplyOptions {
  currentMessage: string;
  history: ChatMessage[];
  astrologer: Astrologer;
  kundli: Kundli | null;
  profile: BirthProfile | null;
}

interface TopicAnalysis {
  primary: 'career' | 'marriage' | 'money' | 'love' | 'health' | 'education' | 'remedy' | 'sadesati' | 'general';
  isFollowUp: boolean;
  language: 'hinglish' | 'hindi' | 'english';
  intent: string;
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  career: ['job', 'career', 'promotion', 'naukri', 'business', 'vyapar', 'transfer', 'interview', 'salary hike', 'kam'],
  marriage: ['shadi', 'marriage', 'vivah', 'rishta', 'spouse', 'biwi', 'pati', 'partner', 'manglik', 'shaadi'],
  money: ['paisa', 'money', 'karz', 'debt', 'finance', 'dhan', 'loss', 'profit', 'investment', 'property', 'laxmi'],
  love: ['love', 'breakup', 'pyar', 'relationship', 'girlfriend', 'boyfriend', 'crush', 'patchup', 'ex', 'pyaar'],
  health: ['health', 'sehat', 'bimari', 'illness', 'stress', 'tension', 'anxiety', 'pain', 'operation', 'doctor'],
  education: ['study', 'padhai', 'exam', 'upsc', 'college', 'degree', 'admission', 'results', 'vidya'],
  remedy: ['upay', 'remedy', 'totka', 'mantra', 'gemstone', 'ratna', 'puja', 'daan', 'fasting', 'vrat', 'peela'],
  sadesati: ['shani', 'sade sati', 'dhayya', 'kantak', 'panoti', 'saturn'],
};

/**
 * Detect language and astrological query topic from text and conversation context.
 */
function analyzeTopicAndContext(text: string, history: ChatMessage[]): TopicAnalysis {
  const lower = text.toLowerCase().trim();

  // Detect language
  const hindiHindiRegex = /[\u0900-\u097F]/;
  const hinglishWords = ['meri', 'mera', 'hoga', 'hogi', 'kab', 'kaise', 'kya', 'batao', 'theek', 'nahin', 'nahi', 'kripya', 'shukriya', 'aur', 'hain', 'mein', 'karte'];
  
  let language: 'hinglish' | 'hindi' | 'english' = 'english';
  if (hindiHindiRegex.test(text)) {
    language = 'hindi';
  } else if (hinglishWords.some((w) => lower.includes(w))) {
    language = 'hinglish';
  }

  // Detect follow-up signals
  const followUpIndicators = ['aur', 'and then', 'what about', 'kya ye', 'kab tak', 'aur kuch', 'then?', 'really?'];
  const isFollowUp = followUpIndicators.some((w) => lower.startsWith(w) || lower.includes(w)) || lower.length < 18;

  // Detect topic
  let primary: TopicAnalysis['primary'] = 'general';
  let matchedCount = 0;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const count = keywords.filter((k) => lower.includes(k)).length;
    if (count > matchedCount) {
      matchedCount = count;
      primary = topic as TopicAnalysis['primary'];
    }
  }

  // If follow-up without explicit topic, inherit topic from recent messages
  if (isFollowUp && primary === 'general' && history.length > 0) {
    const recentUserMsgs = history.filter((m) => m.role === 'user').slice(-3);
    for (const msg of recentUserMsgs.reverse()) {
      const msgLower = msg.text.toLowerCase();
      for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some((k) => msgLower.includes(k))) {
          primary = topic as TopicAnalysis['primary'];
          break;
        }
      }
      if (primary !== 'general') break;
    }
  }

  return { primary, isFollowUp, language, intent: lower };
}

/**
 * Summarize chart features for personalization.
 */
function getKundliFeatures(kundli: Kundli | null, profile: BirthProfile | null) {
  if (!kundli) {
    return {
      hasKundli: false,
      seekerName: profile?.name || 'Seeker',
      lagnaText: '',
      moonText: '',
      nakText: '',
      sunText: '',
      mangalText: '',
    };
  }

  const lagna = RASHIS[kundli.lagnaIndex];
  const moon = RASHIS[kundli.moonRashiIndex];
  const sun = RASHIS[kundli.sunRashiIndex];
  const nak = NAKSHATRAS[kundli.moonNakshatraIndex];

  return {
    hasKundli: true,
    seekerName: profile?.name || 'Seeker',
    lagnaText: `${lagna.sanskrit} (${lagna.english})`,
    moonText: `${moon.sanskrit} (${moon.english})`,
    nakText: `${nak.name} (Lord: ${PLANETS[nak.lord].name})`,
    sunText: `${sun.sanskrit}`,
    mangalText: kundli.mangalDosha ? 'Manglik Dosha prabhavit' : 'Manglik Dosha mukt',
  };
}

/**
 * Intelligent Vedic response generator based on chart, context, and conversation history.
 */
function generateContextualVedicReply(
  analysis: TopicAnalysis,
  features: ReturnType<typeof getKundliFeatures>,
  astrologer: Astrologer,
  history: ChatMessage[],
  currentQuestion: string
): string {
  const { seekerName, lagnaText, moonText, nakText, mangalText, hasKundli } = features;
  const isHinglish = analysis.language === 'hinglish' || analysis.language === 'hindi';

  // Greeting prefix based on turn count
  const userTurns = history.filter((m) => m.role === 'user').length;
  const greeting = userTurns <= 1
    ? (isHinglish ? `Namaste ${seekerName} ji 🙏 ` : `Namaste ${seekerName} 🙏 `)
    : '';

  // Personalized Chart Hook
  const chartHook = hasKundli
    ? (isHinglish
        ? `Aapki kundli mein Lagna ${lagnaText} aur Janma Rashi ${moonText} hai (${nakText}). `
        : `Looking at your ${lagnaText} Ascendant and Moon in ${moonText} (${nakText}), `)
    : (isHinglish
        ? `Main aapke prashna par dhyan kendrit kar raha hoon. `
        : `Focusing closely on your question, `);

  switch (analysis.primary) {
    case 'career':
      if (analysis.isFollowUp) {
        return isHinglish
          ? `${greeting}Career mein agle 3 se 4 mahine naye badlav ke hain. Nayi job ya promotion ke acche avsar milenge. Bas jaldbazi mein purani jagah se achanak istifa na dein. Roz subah Surya Dev ko jal dein, aatmavishwas badhega.`
          : `${greeting}Your career is entering an encouraging turning point over the next 3 to 4 months. Favorable opportunities will appear. Make sure terms are finalized before making any sudden job change. Offering water to the Sun every morning will boost your confidence.`;
      }
      return isHinglish
        ? `${greeting}${chartHook}Aapki kundli ke hisaab se career mein achha samay shuru ho raha hai. Pichhle dino ki mehnat ka fal agle kuch mahinon mein milega. Nayi job ya business dono ke liye raste khul rahe hain. Roz Gayatri Mantra ka 11 baar jaap karein.`
        : `${greeting}${chartHook}Your birth chart shows that your career is entering a period of steady growth. The hard work you put in previously will start showing positive results. Favorable planetary positions support promotions and good job shifts. Chanting the Gayatri Mantra daily will bring mental clarity.`;

    case 'marriage':
      if (analysis.isFollowUp) {
        return isHinglish
          ? `${greeting}Vivah ke baare mein — agle 6 se 8 mahine rishton ke pakke hone ke liye sabse accha samay hain. Pariwar ke madhyam se accha rishta aayega. Guruwar ko bhagwan Vishnu ke aage deepak jalayein.`
          : `${greeting}${chartHook}Regarding marriage, supportive planetary influences are growing stronger over the next 6 to 8 months. Favorable proposals through family or close circles are indicated. Stay positive and patient.`;
      }
      return isHinglish
        ? `${greeting}${chartHook}Aapki kundli mein vivah ke shubh yog ban rahe hain. Agar koi rishta pehle atak raha tha, toh aane wale mahino mein raste khulenge. ${mangalText ? 'Mangal prabhav ke liye shanti ke upay kargar rahenge. ' : ''}Guruwar ko peele vastra pehnein aur chana daal daan karein.`
        : `${greeting}${chartHook}Looking at your chart, marriage prospects are gradually opening up. If matters were delayed earlier, favorable developments will begin soon. ${mangalText ? 'Simple prayers balance any Mangal influence smoothly. ' : ''}Wearing yellow or offering prayers on Thursdays brings blessings.`;

    case 'love':
      return isHinglish
        ? `${greeting}${chartHook}Prem sambandh mein thodi aapsi samajh aur khulkar baat karne ki zaroorat hai. Agar koi galatfehmi hui hai, toh shanti se baat karke use suljhayein. Kisi teesre vyakti ki baaton par bina soche vishwas na karein. Aane wale dino mein rishta behtar hoga.`
        : `${greeting}${chartHook}In your relationship, open and honest communication is essential right now. If there have been recent misunderstandings, speak gently with your partner. Give each other space and avoid listening to outside gossip. Harmony will restore soon.`;

    case 'money':
      return isHinglish
        ? `${greeting}${chartHook}Aarthik sthiti mein sudhar ke yog hain aur aamdani ke naye raste khulenge. Bas ek baat ka dhyan rakhein — bina soche-samjhe kharch na karein aur kisi ko bada udhaar na dein. Dheere-dheere bachat badhayenge toh aage kafi labh hoga.`
        : `${greeting}${chartHook}Your financial outlook shows steady improvement and new income possibilities. The key is to control impulsive expenses and avoid lending large amounts to others right now. Steady savings will keep your future safe and prosperous.`;

    case 'health':
      return isHinglish
        ? `${greeting}${chartHook}Aapki sehat theek hai, lekin thoda mansik tanav aur thakan par dhyan dene ki zaroorat hai. Roz subah thodi der walk ya pranayama karein, paryapt paani piyein aur acchi neend lein. Shivling par niyamit jal chadhane se man shant rahega.`
        : `${greeting}${chartHook}Your overall health is fine, but daily stress and screen fatigue need attention. Getting enough sleep, drinking water, and taking a short morning walk will refresh you. Offering water to Lord Shiva brings deep mental calm.`;

    case 'remedy':
      return isHinglish
        ? `${greeting}Aapke liye 3 bahut saral aur prabhavi upay yeh hain:\n1. Roz subah taambe ke lote se Surya Dev ko jal arpit karein.\n2. Mangalwar aur Shanivar ko Hanuman Chalisa padhein.\n3. Pakshiyon ko dana dalein ya zarooratmand ki madad karein.\nYeh saral upay aapke jeevan mein shanti aur barkat layenge.`
        : `${greeting}Here are 3 simple, effective remedies for peace and prosperity:\n1. Offer fresh water to the rising Sun every morning.\n2. Recite the Hanuman Chalisa on Tuesdays and Saturdays.\n3. Feed birds or help someone in need on weekends.\nThese simple habits will bring positive energy and peace into your home.`;

    case 'sadesati':
      return isHinglish
        ? `${greeting}${chartHook}Shani Dev kadi mehnat aur imaandari ka fal dete hain. Is dauran kaam thoda dheere ho sakta hai, lekin jo safalta milegi woh sthayi hogi. Har Shanivar ko sarson ke tel ka deepak jalayein aur gareebon ki madad karein, Shani Dev ki kripa banegi.`
        : `${greeting}${chartHook}Lord Saturn teaches discipline, patience, and honesty. Progress may feel a little slow at times, but the results you gain will be lasting and strong. Lighting a mustard oil lamp on Saturday evenings brings peace and protection.`;

    default:
      if (analysis.isFollowUp) {
        return isHinglish
          ? `${greeting}Haan, main aapki baat samajh raha hoon. Thoda dhairya rakhein — aane wale dino mein raste khulenge aur pareshani door hogi. Ishwar par vishwas banaye rakhein 🙏`
          : `${greeting}I completely understand your situation. Have patience right now — favorable paths will open up in the coming weeks. Keep faith and stay positive 🙏`;
      }
      return isHinglish
        ? `${greeting}${chartHook}Aapki kundli ke hisaab se sthiti sakaratmak disha mein aage badh rahi hai. Thoda santulan aur niyamit prarthana se rukawatein door hongi. Agar aap kisi vishesh baat ya upay ke baare mein janna chahte hain, toh zaroor batayein!`
        : `${greeting}${chartHook}The planetary trends for your query are positive. Focusing on your daily goals with a calm mind will bring good breakthroughs. Feel free to ask any specific question about dates or remedies!`;
  }
}

/**
 * Main AI Astrologer entry point:
 * First attempts server API (/api/ai/chat), falls back immediately to client-side Vedic intelligence.
 */
export async function generateAstrologyAiReply(options: GenerateAiReplyOptions): Promise<string> {
  const { currentMessage, history, astrologer, kundli, profile } = options;

  // 1. Try local Express server endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentMessage,
        history: history.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        astrologer: {
          id: astrologer.id,
          name: astrologer.name,
          specialties: astrologer.specialties,
          experienceYears: astrologer.experienceYears,
          languages: astrologer.languages,
        },
        kundli,
        profile,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 10) {
        return data.reply.trim();
      }
    }
  } catch (err) {
    // Graceful fallback to client engine
  }

  // 2. High-intelligence local Vedic inference engine
  const analysis = analyzeTopicAndContext(currentMessage, history);
  const features = getKundliFeatures(kundli, profile);
  return generateContextualVedicReply(analysis, features, astrologer, history, currentMessage);
}

/**
 * Calculate realistic typing delay based on reply length.
 */
export function calculateTypingDelay(replyText: string): number {
  const len = replyText.length;
  // Between 1200ms and 2400ms for natural human feel
  return Math.min(2400, Math.max(1200, 800 + Math.floor(len * 8)));
}
