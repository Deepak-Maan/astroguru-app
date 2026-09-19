import React, { useState, useEffect } from 'react';

type TarotSpreadKey = 'daily' | 'love' | 'career' | 'timeline' | 'yesno';

interface TarotCardInfo {
  roman: string;
  element: string;
  emoji: string;
  name: string;
  outcome: string;
  quote: string;
  details: string;
  label: string;
}

const TAROT_DATA: Record<TarotSpreadKey, TarotCardInfo> = {
  daily: {
    roman: 'X',
    element: 'FIRE · JUPITER',
    emoji: '🎡',
    name: 'The Wheel of Fortune',
    outcome: 'STRONG YES · 97%',
    quote: '"Karmic tides turn in your favor within 3 to 7 days."',
    details: 'The Wheel of Fortune indicates an unstoppable cycle of auspicious momentum. Jupiter enters your 9th trine house, eliminating prior stagnation in career contracts and family harmony.',
    label: 'Daily Guidance',
  },
  love: {
    roman: 'VI',
    element: 'AIR · VENUS',
    emoji: '❤️‍🔥',
    name: 'The Lovers',
    outcome: 'DEEP RECONCILIATION · 94%',
    quote: '"Past partner communication barriers dissolve after Chandra transit."',
    details: 'Venus forms an auspicious Trine with your 7th house lord. Honest confessions and unresolved knots untangle swiftly over the next 14 days.',
    label: 'Love & Ex-Partner',
  },
  career: {
    roman: 'IV',
    element: 'EARTH · MARS',
    emoji: '👑',
    name: 'The Emperor',
    outcome: 'HIGH PROMOTION · 91%',
    quote: '"Solar authority yoga active. Executive leadership confirmed."',
    details: 'Sun enters Digbala in the 10th house. Perfect astrological window for corporate pitch reviews, funding rounds, and higher salary negotiations.',
    label: 'Career & Wealth',
  },
  timeline: {
    roman: 'VII',
    element: 'WATER · MOON',
    emoji: '🏇',
    name: 'The Chariot',
    outcome: 'TRANSIT IN 2-4 WEEKS · 96%',
    quote: '"Decisive acceleration across travel, property, and relocations."',
    details: 'Mars and Moon converge to give swift kinetic breakthroughs. Do not hesitate on agreements signed during Abhijit Muhurat windows.',
    label: 'Timeline Spread',
  },
  yesno: {
    roman: 'XIX',
    element: 'FIRE · SURYA',
    emoji: '☀️',
    name: 'The Sun',
    outcome: 'INSTANT ABSOLUTE YES · 99%',
    quote: '"Complete illumination and victory. Surya Deva removes all obstacles."',
    details: 'The ultimate hard positive benchmark card. Whatever doubt you held in mind has divine cosmic backing to succeed flawlessly.',
    label: '₹99 Yes/No Oracle',
  },
};

export const TarotStage: React.FC = () => {
  const [activeSpread, setActiveSpread] = useState<TarotSpreadKey>('daily');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>([12, 24, 16, 32, 20, 36, 16, 28, 12]);

  const current = TAROT_DATA[activeSpread];

  const handleSpreadChange = (key: TarotSpreadKey) => {
    setActiveSpread(key);
    setIsFlipped(true); // reveal new card immediately
  };

  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setBarHeights((prev) => prev.map(() => Math.floor(Math.random() * 28) + 8));
      }, 120);
    } else {
      setBarHeights([6, 6, 6, 6, 6, 6, 6, 6, 6]);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  return (
    <section id="tarot" className="relative z-10 py-24 px-4 sm:px-6 border-t border-purple-500/20 bg-gradient-to-b from-[#080D21] to-[#04060E]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-black tracking-wider uppercase">
            <span>🔮</span> 5 Specialized Spread Modes
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Touch the Arcana. <span className="gold-gradient-text">Hear Your Future.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Choose a spread, tap a card to reveal its 3D flip animation, and listen to the GuruVani AI voice interpretation in real time.
          </p>
        </div>

        {/* Spread Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {(Object.keys(TAROT_DATA) as TarotSpreadKey[]).map((key) => {
            const isSelected = activeSpread === key;
            return (
              <button
                key={key}
                onClick={() => handleSpreadChange(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'border border-amber-500/40 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'border border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                {TAROT_DATA[key].label}
              </button>
            );
          })}
        </div>

        {/* Interactive 3D Card Stage & Reading Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
          
          {/* Left: 3D Flip Card Container */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="relative w-64 h-96 perspective-1000 cursor-pointer group select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className="w-full h-full duration-700 preserve-3d rounded-3xl relative shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.25)] border-2 border-amber-400/50 transition-transform"
                style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front Face (Card Back / Deck Face) */}
                <div className="absolute inset-0 w-full h-full rounded-3xl [backface-visibility:hidden] bg-gradient-to-tr from-[#0b0f24] via-[#161f48] to-[#0d122b] p-4 flex flex-col items-center justify-between border border-amber-400/30">
                  <div className="w-full flex justify-between text-amber-300/60 text-xs font-mono">
                    <span>ASTRO</span>
                    <span>GURU</span>
                  </div>
                  {/* Sacred Geometry Mandala */}
                  <div className="w-36 h-36 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center relative">
                    <div className="w-28 h-28 rounded-full border border-yellow-300/40 flex items-center justify-center">
                      <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]">☸️</span>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase">Surya Deck Stasis</span>
                    <div className="text-[10px] text-indigo-200/70 font-semibold">Click / Tap to Flip Card ⚡</div>
                  </div>
                </div>

                {/* Back Face (Revealed Major Arcana Card) */}
                <div className="absolute inset-0 w-full h-full rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-[#1a120b] via-[#2a1708] to-[#09070a] p-4 flex flex-col items-center justify-between border-2 border-amber-400">
                  <div className="w-full flex justify-between text-amber-300 text-xs font-black">
                    <span>{current.roman}</span>
                    <span>{current.element}</span>
                  </div>
                  {/* Card Illustration & Title */}
                  <div className="text-center space-y-2">
                    <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-bounce">
                      {current.emoji}
                    </div>
                    <h4 className="text-base font-black text-white">{current.name}</h4>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                      {current.outcome}
                    </div>
                  </div>
                  <div className="text-[10px] text-amber-200/80 text-center font-medium bg-black/50 p-2 rounded-xl border border-amber-500/20 w-full">
                    {current.quote}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-3 font-semibold">👆 Tap card above to flip in 3D</span>
          </div>

          {/* Right: AI GuruVani Spoken Audio & Interpretation Console */}
          <div className="lg:col-span-7 liquid-glass p-8 rounded-3xl border-amber-500/30 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-lg">
                  🎙️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">GuruVani AI Spoken Reading</h3>
                  <div className="text-xs text-amber-400 font-semibold">
                    Active Mode: <span className="text-white">{current.label}</span>
                  </div>
                </div>
              </div>

              {/* Audio Play Button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <span>{isPlayingAudio ? '⏸️' : '▶️'}</span>
                <span>{isPlayingAudio ? 'Pause GuruVani Reading' : 'Play Spoken Reading'}</span>
              </button>
            </div>

            {/* Live Audio Waveform Visualizer */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-center gap-1.5 h-16">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full transition-all duration-100"
                  style={{
                    height: `${h}px`,
                    backgroundColor: i % 3 === 0 ? '#F59E0B' : i % 3 === 1 ? '#F43F5E' : '#6366F1',
                  }}
                />
              ))}
            </div>

            {/* Interpretation Narrative Details */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <span>🌟</span>
                <span>Divine Synthesis & Astrological Transit</span>
              </div>
              <p>{current.details}</p>
            </div>

            {/* 3 Stacks Cutting Tray Demo */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 font-medium">
              <span>3D Cut Stacks:</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">☀️ Surya</span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">🌙 Chandra</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">🔱 Shiva</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
