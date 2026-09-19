import React, { useState, useEffect } from 'react';

type StepKey = 'kundli' | 'voice' | 'tarot' | 'muhurat';

interface StepInfo {
  key: StepKey;
  id: string;
  pillLabel: string;
  borderColor: string;
}

const STEPS: StepInfo[] = [
  { key: 'kundli', id: 'step-kundli', pillLabel: '1. Kundli', borderColor: 'rgba(245, 158, 11, 0.55)' },
  { key: 'voice', id: 'step-voice', pillLabel: '2. Voice Notes', borderColor: 'rgba(99, 102, 241, 0.55)' },
  { key: 'tarot', id: 'step-tarot', pillLabel: '3. Tarot Oracle', borderColor: 'rgba(244, 63, 94, 0.55)' },
  { key: 'muhurat', id: 'step-muhurat', pillLabel: '4. Muhurat', borderColor: 'rgba(16, 185, 129, 0.55)' },
];

export const StickyShowcase: React.FC = () => {
  const [activeStep, setActiveStep] = useState<StepKey>('kundli');

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      let matched: StepKey = 'kundli';

      STEPS.forEach((step) => {
        const el = document.getElementById(step.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.55 && rect.bottom >= windowHeight * 0.15) {
            matched = step.key;
          }
        }
      });

      setActiveStep(matched);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleManualSwitch = (stepKey: StepKey) => {
    setActiveStep(stepKey);
    const target = document.getElementById(`step-${stepKey}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const currentStepInfo = STEPS.find((s) => s.key === activeStep) || STEPS[0];

  return (
    <section id="features" className="relative z-10 py-24 px-4 sm:px-6 border-t border-indigo-500/20 bg-gradient-to-b from-[#060815] to-[#080D21]">
      <div id="sticky-showcase" />

      <div className="max-w-7xl mx-auto">
        {/* Section Intro Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            Interactive Hardware & App Canvas
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            One Engine. <span className="gold-gradient-text">Five Divine Breakthroughs.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Scroll down below — watch the 3D device stay pinned while each astrological module seamlessly morphs.
          </p>
        </div>

        {/* Two-Column Sticky Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          
          {/* LEFT COLUMN: Scrollable Story Cards */}
          <div className="lg:col-span-6 space-y-24 py-12">
            
            {/* Chapter 1: Kundli */}
            <div
              id="step-kundli"
              className={`p-8 rounded-3xl liquid-glass border transition-all duration-500 space-y-4 ${
                activeStep === 'kundli' ? 'border-amber-400 shadow-2xl shadow-amber-500/10' : 'border-slate-800'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs">
                CHAPTER 01
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Vedic Kundli & Ashta-Koota Matching
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Full 12-house Vedic Lagna and Navamsha charts rendered with crystalline clarity. Evaluates all 36 points of compatibility (Nadi, Bhakoot, Gana, Yoni, Tara) with instant Mangal Dosha detection.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-semibold">All 12 Rashis</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-semibold">10-Page PDF Export</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-semibold">Arc-Second Accuracy</span>
              </div>
            </div>

            {/* Chapter 2: Voice Notes */}
            <div
              id="step-voice"
              className={`p-8 rounded-3xl liquid-glass border transition-all duration-500 space-y-4 ${
                activeStep === 'voice' ? 'border-indigo-400 shadow-2xl shadow-indigo-500/10' : 'border-slate-800'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs">
                CHAPTER 02
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                WhatsApp-Style Voice Notes in Chat
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                No more tedious typing. Tap and hold the mic to record your voice queries with live audio waveform bars. Certified Jyotishis respond with personalized voice audio bubbles with instant playback.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-rose-300 font-semibold">Hold to Record</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-semibold">Audio Waveforms</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-semibold">Real-Time Sync</span>
              </div>
            </div>

            {/* Chapter 3: Tarot Oracle */}
            <div
              id="step-tarot"
              className={`p-8 rounded-3xl liquid-glass border transition-all duration-500 space-y-4 ${
                activeStep === 'tarot' ? 'border-rose-400 shadow-2xl shadow-rose-500/10' : 'border-slate-800'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs">
                CHAPTER 03
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                5-Mode 3D Tarot & ₹99 Yes/No Oracle
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Featuring 5 specialized spread modes: Daily Guidance, Love & Ex-Partner, Career & Wealth, Timeline Spread, and Instant Yes/No Oracle with live certainty progress meters and timing forecasts.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-semibold">Interactive 3D Deck Cut</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-yellow-300 font-semibold">Spoken GuruVani Voice</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-rose-300 font-semibold">Love & Ex-Partner</span>
              </div>
            </div>

            {/* Chapter 4: Shubh Muhurat */}
            <div
              id="step-muhurat"
              className={`p-8 rounded-3xl liquid-glass border transition-all duration-500 space-y-4 ${
                activeStep === 'muhurat' ? 'border-emerald-400 shadow-2xl shadow-emerald-500/10' : 'border-slate-800'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs">
                CHAPTER 04
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Daily 7:00 AM Shubh Muhurat Alerts
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Start every morning auspiciously. Automated lock-screen notifications alert you to the exact Abhijit Muhurat and Rahu Kaal hours for your location, along with your Rashi's daily lucky color and number.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-semibold">Lock Screen Pushes</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 font-semibold">Abhijit Timing</span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-indigo-300 font-semibold">AstroGold Card</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Pinned 3D Phone Showcase */}
          <div className="lg:col-span-6 lg:sticky lg:top-20 flex flex-col items-center justify-center perspective-1000 py-4 gap-4">
            
            {/* Quick Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md text-[11px] font-bold shadow-xl z-30">
              {STEPS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleManualSwitch(s.key)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeStep === s.key
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.pillLabel}
                </button>
              ))}
            </div>

            {/* 3D Phone Shell */}
            <div
              className="w-72 sm:w-80 h-[520px] rounded-[40px] p-3 bg-gradient-to-tr from-slate-800 via-slate-900 to-indigo-950 border-4 shadow-[0_25px_70px_rgba(0,0,0,0.8)] preserve-3d transition-all duration-700 hover:rotate-1"
              style={{ borderColor: currentStepInfo.borderColor }}
            >
              <div className="w-full h-full rounded-[32px] bg-[#070A18] overflow-hidden flex flex-col relative border border-white/10">
                
                {/* Phone Top Notch & Status Bar */}
                <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] text-slate-400 font-bold z-20">
                  <span>09:41</span>
                  <div className="w-20 h-3.5 rounded-full bg-black/70 mx-auto" />
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* SCREEN VIEW 1: KUNDLI */}
                {activeStep === 'kundli' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center pt-2">
                      <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">Vedic Lagna Chart</span>
                      <h4 className="text-sm font-black text-white">Rohit Sharma · Aries</h4>
                    </div>

                    <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto my-auto border-2 border-amber-400/50 relative flex items-center justify-center bg-slate-950/60 rounded-xl shadow-inner shadow-amber-500/20">
                      <div className="absolute inset-0 border border-indigo-400/40 transform rotate-45" />
                      <div className="absolute w-full h-[1px] bg-amber-400/30" />
                      <div className="absolute h-full w-[1px] bg-amber-400/30" />

                      <span className="absolute top-2 font-bold text-[10px] text-amber-300">☀️ Sun (10°)</span>
                      <span className="absolute bottom-2 font-bold text-[10px] text-cyan-300">🌙 Moon (24°)</span>
                      <span className="absolute left-2 font-bold text-[10px] text-rose-400">⚔️ Mars (18°)</span>
                      <span className="absolute right-2 font-bold text-[10px] text-yellow-300">👑 Jup (05°)</span>

                      <div className="text-center bg-black/80 px-2.5 py-1.5 rounded-lg border border-amber-500/40 z-10">
                        <div className="text-lg">🪐</div>
                        <div className="text-[9px] font-black text-emerald-400">32/36 Points Match</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-center text-slate-300 font-medium">
                      ✨ Sarva Karya Siddhi Yoga Active
                    </div>
                  </div>
                )}

                {/* SCREEN VIEW 2: VOICE NOTES */}
                {activeStep === 'voice' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center pt-2">
                      <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Acharya Radheshyam Ji</span>
                      <h4 className="text-sm font-black text-white">Live Voice Consultation</h4>
                    </div>

                    <div className="my-auto flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-rose-500/30 animate-pulse">
                        🎙️
                      </div>

                      <div className="flex items-center gap-1.5 h-10">
                        <div className="w-1.5 bg-rose-500 rounded-full animate-bounce h-6" />
                        <div className="w-1.5 bg-amber-400 rounded-full animate-bounce h-8" />
                        <div className="w-1.5 bg-indigo-500 rounded-full animate-bounce h-4" />
                        <div className="w-1.5 bg-cyan-400 rounded-full animate-bounce h-10" />
                        <div className="w-1.5 bg-rose-500 rounded-full animate-bounce h-7" />
                        <div className="w-1.5 bg-amber-400 rounded-full animate-bounce h-5" />
                      </div>
                      <span className="text-xs text-rose-300 font-bold">🔴 00:34 Voice Note Streaming</span>
                    </div>

                    <div className="bg-rose-500/20 p-2.5 rounded-xl border border-rose-500/30 text-[11px] text-center text-rose-200 font-semibold">
                      +5 Mins Auto-Recharge Ready (₹99)
                    </div>
                  </div>
                )}

                {/* SCREEN VIEW 3: TAROT ORACLE */}
                {activeStep === 'tarot' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center pt-2">
                      <span className="text-[10px] uppercase font-black text-rose-400 tracking-wider">Instant Oracle</span>
                      <h4 className="text-sm font-black text-white">The Wheel of Fortune</h4>
                    </div>

                    <div className="w-40 h-56 mx-auto my-auto rounded-2xl bg-gradient-to-b from-amber-500 via-orange-600 to-slate-950 p-1 border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-between text-center">
                      <span className="text-3xl mt-3">🎡</span>
                      <div className="p-2">
                        <div className="text-xs font-black text-white">X · Wheel of Fortune</div>
                        <div className="text-[9px] text-amber-200 font-bold">STRONG YES · 97%</div>
                      </div>
                      <div className="w-full bg-emerald-500/30 p-1.5 rounded-xl text-[10px] text-emerald-300 font-black">
                        Timing: Within 3 to 7 Days
                      </div>
                    </div>

                    <div className="bg-amber-500/15 p-2 rounded-xl border border-amber-500/30 text-[11px] text-center text-amber-300 font-bold">
                      🎙️ GuruVani Voice Reading Ready
                    </div>
                  </div>
                )}

                {/* SCREEN VIEW 4: MUHURAT */}
                {activeStep === 'muhurat' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center pt-2">
                      <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Daily Lock-Screen Push</span>
                      <h4 className="text-sm font-black text-white">Subah Ka Shubh Muhurat</h4>
                    </div>

                    <div className="my-auto space-y-3 px-2">
                      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/40 space-y-1 shadow-lg">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                          <span>🌅 7:00 AM PUSH</span>
                          <span>Now</span>
                        </div>
                        <div className="text-xs font-black text-white">Aaj Ka Abhijit Muhurat</div>
                        <div className="text-[10px] text-slate-300">
                          11:45 AM - 12:35 PM (Sarva Karya Siddhi) | ⚠️ Rahu Kaal: 04:30 PM - 06:00 PM.
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-between shadow-md">
                        <span>AstroGold Metal Card</span>
                        <span>₹1,450 Bal</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-[11px] text-center text-emerald-300 font-bold">
                      Daily Panchang Synchronized
                    </div>
                  </div>
                )}

                {/* Home Indicator */}
                <div className="w-24 h-1 rounded-full bg-white/40 mx-auto my-2" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
