export interface TarotCard {
  id: string;
  name: string;
  number: number;
  glyph: string;
  element: string;
  keywords: string[];
  upright: string;
  reversed: string;
  advice: string;
  image: string;
}

export const TAROT_DECK: TarotCard[] = [
  {
    id: 'fool',
    name: '0 · The Fool',
    number: 0,
    glyph: '🃏',
    element: 'Air',
    keywords: ['New Beginnings', 'Innocence', 'Leap of Faith', 'Spontaneity'],
    upright: 'A fresh journey begins. Trust your instinct and embrace the unknown without fear. Opportunity beckons.',
    reversed: 'Recklessness or hesitance. Beware of taking unnecessary risks without checking where you land.',
    advice: 'Step forward with an open heart. The universe protects those who venture with pure intent.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'magician',
    name: 'I · The Magician',
    number: 1,
    glyph: '✨',
    element: 'Air',
    keywords: ['Manifestation', 'Resourcefulness', 'Power', 'Inspired Action'],
    upright: 'You possess all the tools needed to turn your vision into reality. Focus your willpower and act.',
    reversed: 'Unused talent, trickery, or lack of focus. Align your intentions before taking action.',
    advice: 'Channel your creative energy today. What you focus on will multiply rapidly.',
    image: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'priestess',
    name: 'II · High Priestess',
    number: 2,
    glyph: '🌙',
    element: 'Water',
    keywords: ['Intuition', 'Sacred Knowledge', 'Divine Feminine', 'Subconscious'],
    upright: 'Listen to your inner voice. Secrets and subconscious wisdom are coming to light. Be quiet and observe.',
    reversed: 'Ignoring your intuition or holding secrets. Trust what your gut tells you over logic.',
    advice: 'Spend quiet time in reflection today. Meditate before making major decisions.',
    image: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'empress',
    name: 'III · The Empress',
    number: 3,
    glyph: '👑',
    element: 'Earth',
    keywords: ['Abundance', 'Nurturing', 'Fertility', 'Nature & Harmony'],
    upright: 'A period of growth and prosperity. Express unconditional love, create art, and nurture your body.',
    reversed: 'Creative block, dependence, or neglect. Reconnect with nature and self-care.',
    advice: 'Allow yourself to receive. Surround yourself with beauty, warmth and comfort today.',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'emperor',
    name: 'IV · The Emperor',
    number: 4,
    glyph: '⚔️',
    element: 'Fire',
    keywords: ['Authority', 'Structure', 'Leadership', 'Stability'],
    upright: 'Time to take control and build strong foundations. Set clear boundaries and lead with discipline.',
    reversed: 'Rigidity, control issues, or lack of discipline. Balance authority with empathy.',
    advice: 'Organize your priorities. Clear plans and decisive action bring security.',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'lovers',
    name: 'VI · The Lovers',
    number: 6,
    glyph: '💞',
    element: 'Air',
    keywords: ['Love', 'Harmonious Union', 'Values', 'Soul Alignment'],
    upright: 'Deep connection, mutual respect, and choices aligned with your true values. Trust your partner.',
    reversed: 'Disharmony, misaligned values, or hesitation in commitment. Seek inner alignment first.',
    advice: 'Choose from love rather than fear. True partnerships flourish when values align.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'wheel',
    name: 'X · Wheel of Fortune',
    number: 10,
    glyph: '🎡',
    element: 'Fire',
    keywords: ['Destiny', 'Karma', 'Turning Point', 'Good Luck'],
    upright: 'The wheel turns in your favor! Unexpected positive shifts, lucky breakthroughs, and karmic rewards.',
    reversed: 'Temporary setbacks or resistance to change. Remember that cycles always turn again.',
    advice: 'Flow with momentum. A major shift is occurring for your highest good.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'sun',
    name: 'XIX · The Sun',
    number: 19,
    glyph: '☀️',
    element: 'Fire',
    keywords: ['Joy', 'Success', 'Vitality', 'Clarity'],
    upright: 'Radiant success, happiness and warmth! Doubts dissipate and celebration is at hand.',
    reversed: 'Temporary cloudiness or pessimism. Joy is still present, shift your focus to gratitude.',
    advice: 'Shine your light brightly. Your optimism inspires everyone around you.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
  },
];
