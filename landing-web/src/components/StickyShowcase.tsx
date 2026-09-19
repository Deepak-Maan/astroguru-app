import React, { useState, useEffect } from 'react';
import { WebsiteChapter } from '../types';

type StepKey = 'kundli' | 'voice' | 'tarot' | 'muhurat';

interface StepInfo {
  key: StepKey;
  id: string;
  pillLabel: string;
  badge: string;
  icon: string;
  accentColor: string;
  borderColor: string;
  glowShadow: string;
}

interface StickyShowcaseProps {
  chapters?: WebsiteChapter[];
}

const STEPS: StepInfo[] = [
  {
    key: 'kundli',
    id: 'step-kundli',
    pillLabel: '1. Vedic Kundli',
    badge: 'CHAPTER 01 · JYOTISH ENGINE',
    icon: '🪐',
    accentColor: '#F59E0B',
    borderColor: 'rgba(245, 158, 11, 0.65)',
    glowShadow: '0 0 50px rgba(245, 158, 11, 0.35)',
  },
  {
    key: 'voice',
    id: 'step-voice',
    pillLabel: '2. Voice Notes',
    badge: 'CHAPTER 02 · REAL-TIME AUDIO',
    icon: '🎙️',
    accentColor: '#818CF8',
    borderColor: 'rgba(99, 102, 241, 0.65)',
    glowShadow: '0 0 50px rgba(99, 102, 241, 0.35)',
  },
  {
    key: 'tarot',
    id: 'step-tarot',
    pillLabel: '3. Tarot Oracle',
    badge: 'CHAPTER 03 · 3D ARCANA',
    icon: '🔮',
    accentColor: '#F43F5E',
    borderColor: 'rgba(244, 63, 94, 0.65)',
    glowShadow: '0 0 50px rgba(244, 63, 94, 0.35)',
  },
  {
    key: 'muhurat',
    id: 'step-muhurat',
    pillLabel: '4. Shubh Muhurat',
    badge: 'CHAPTER 04 · LOCK SCREEN PUSH',
    icon: '🌅',
    accentColor: '#10B981',
    borderColor: 'rgba(16, 185, 129, 0.65)',
    glowShadow: '0 0 50px rgba(16, 185, 129, 0.35)',
  },
];

export const StickyShowcase: React.FC<StickyShowcaseProps> = ({ chapters }) => {
  const kundliChapter = chapters?.find((c) => c.id === 'kundli');
  const voiceChapter = chapters?.find((c) => c.id === 'voice');
  const tarotChapter = chapters?.find((c) => c.id === 'tarot');
  const muhuratChapter = chapters?.find((c) => c.id === 'muhurat');

  const [activeStep, setActiveStep] = useState<StepKey>('kundli');
  const [activeKundliTab, setActiveKundliTab] = useState<'d1' | 'd9'>('d1');
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(true);
  const [isPhoneTarotFlipped, setIsPhoneTarotFlipped] = useState<boolean>(false);
  const [isRecordingNote, setIsRecordingNote] = useState<boolean>(false);
  const [recordTimer, setRecordTimer] = useState<number>(0);

  // Dynamic audio waveform simulation
  const [audioBars, setAudioBars] = useState<number[]>([14, 28, 18, 36, 22, 38, 16, 30, 20, 34, 18, 26]);

  useEffect(() => {
    let interval: any;
    if (isVoicePlaying || isRecordingNote) {
      interval = setInterval(() => {
        setAudioBars((prev) => prev.map(() => Math.floor(Math.random() * 26) + 8));
      }, 110);
    } else {
      setAudioBars([6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
    }
    return () => clearInterval(interval);
  }, [isVoicePlaying, isRecordingNote]);

  useEffect(() => {
    let timer: any;
    if (isRecordingNote) {
      timer = setInterval(() => {
        setRecordTimer((t) => t + 1);
      }, 1000);
    } else {
      setRecordTimer(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingNote]);

  // Sticky Scroll Spy Engine
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const midPoint = windowHeight * 0.45;

      let currentMatch: StepKey = 'kundli';
      let minDistance = Infinity;

      STEPS.forEach((step) => {
        const el = document.getElementById(step.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - midPoint);
          if (distance < minDistance && rect.bottom > 100 && rect.top < windowHeight - 100) {
            minDistance = distance;
            currentMatch = step.key;
          }
        }
      });

      setActiveStep(currentMatch);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
    <section id="features" className="relative z-10 py-20 px-4 sm:px-6 border-t border-indigo-500/20 bg-gradient-to-b from-[#060815] via-[#070B1C] to-[#04060E]">
      <div id="sticky-showcase" />

      <div className="max-w-7xl mx-auto">
        {/* Section Intro Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-widest uppercase">
            <span>✨</span> GSAP ScrollTrigger Pinned 3D Experience
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            One Engine. <span className="gold-gradient-text">Five Divine Breakthroughs.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Scroll down slowly — the titanium 3D device stays pinned in the center while each astrological module smoothly transforms.
          </p>
        </div>

        {/* Two-Column Sticky Pinning Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* LEFT COLUMN: Deep Scroll Runways for each Chapter */}
          <div className="lg:col-span-6 flex flex-col space-y-36 pb-32">
            
            {/* Chapter 1: Kundli */}
            <div
              id="step-kundli"
              className={`min-h-[70vh] flex flex-col justify-center transition-all duration-700 ${
                activeStep === 'kundli' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
              }`}
            >
              <div className="p-8 sm:p-10 rounded-3xl liquid-glass border transition-all duration-500 space-y-5 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.18)]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs">
                  <span>🪐</span> {kundliChapter?.badge || 'CHAPTER 01'}
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {kundliChapter?.title || 'Vedic Kundli & Ashta-Koota Matching'}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {kundliChapter?.description || 'Full 12-house Vedic Lagna and Navamsha charts rendered with arc-second precision. Evaluates all 36 points of compatibility (Nadi, Bhakoot, Gana, Yoni, Tara) with instant Mangal Dosha detection and planetary dignity calculations.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-amber-300 font-bold">All 12 Houses</div>
                    <div className="text-slate-400 text-[11px]">D1 & D9 Charts</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-emerald-300 font-bold">36/36 Points</div>
                    <div className="text-slate-400 text-[11px]">Nadi & Bhakoot</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs col-span-2 sm:col-span-1">
                    <div className="text-indigo-300 font-bold">10-Page PDF</div>
                    <div className="text-slate-400 text-[11px]">Instant Share</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter 2: Voice Notes */}
            <div
              id="step-voice"
              className={`min-h-[70vh] flex flex-col justify-center transition-all duration-700 ${
                activeStep === 'voice' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
              }`}
            >
              <div className="p-8 sm:p-10 rounded-3xl liquid-glass border transition-all duration-500 space-y-5 border-indigo-400/80 shadow-[0_0_50px_rgba(99,102,241,0.22)]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs">
                  <span>🎙️</span> {voiceChapter?.badge || 'CHAPTER 02'}
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {voiceChapter?.title || 'WhatsApp-Style Voice Notes in Chat'}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {voiceChapter?.description || 'No more tedious typing. Tap and hold the mic to record your voice queries with live animated soundwaves. Verified astrologers respond with high-fidelity audio notes featuring real-time playback and speed controls.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-rose-400 font-bold">Hold-to-Talk</div>
                    <div className="text-slate-400 text-[11px]">Mic Bar Audio</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-cyan-300 font-bold">Instant Sync</div>
                    <div className="text-slate-400 text-[11px]">Sub-50ms Latency</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs col-span-2 sm:col-span-1">
                    <div className="text-emerald-300 font-bold">Auto-Recharge</div>
                    <div className="text-slate-400 text-[11px]">₹99 Quick Refills</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter 3: Tarot Oracle */}
            <div
              id="step-tarot"
              className={`min-h-[70vh] flex flex-col justify-center transition-all duration-700 ${
                activeStep === 'tarot' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
              }`}
            >
              <div className="p-8 sm:p-10 rounded-3xl liquid-glass border transition-all duration-500 space-y-5 border-rose-400/80 shadow-[0_0_50px_rgba(244,63,94,0.22)]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs">
                  <span>🔮</span> {tarotChapter?.badge || 'CHAPTER 03'}
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {tarotChapter?.title || '5-Mode 3D Tarot & ₹99 Yes/No Oracle'}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {tarotChapter?.description || 'Featuring 5 specialized spread modes: Daily Guidance, Love & Ex-Partner, Career & Wealth, Timeline Forecast, and Instant Yes/No Oracle with live certainty probability gauges and spoken GuruVani voice synthesis.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-amber-300 font-bold">Interactive 3D Cut</div>
                    <div className="text-slate-400 text-[11px]">3 Stacks Shuffling</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-yellow-300 font-bold">GuruVani AI</div>
                    <div className="text-slate-400 text-[11px]">Spoken Predictions</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs col-span-2 sm:col-span-1">
                    <div className="text-rose-400 font-bold">Love Spreads</div>
                    <div className="text-slate-400 text-[11px]">Ex-Partner Transits</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter 4: Muhurat */}
            <div
              id="step-muhurat"
              className={`min-h-[70vh] flex flex-col justify-center transition-all duration-700 ${
                activeStep === 'muhurat' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
              }`}
            >
              <div className="p-8 sm:p-10 rounded-3xl liquid-glass border transition-all duration-500 space-y-5 border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.22)]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs">
                  <span>🌅</span> {muhuratChapter?.badge || 'CHAPTER 04'}
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {muhuratChapter?.title || 'Daily 7:00 AM Shubh Muhurat Alerts'}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {muhuratChapter?.description || 'Start every morning auspiciously. Automated lock-screen notifications alert you to the exact Abhijit Muhurat and Rahu Kaal hours for your GPS coordinates, along with your Rashi\'s daily lucky color and number.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-emerald-300 font-bold">Lock Screen Push</div>
                    <div className="text-slate-400 text-[11px]">7:00 AM Daily</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs">
                    <div className="text-amber-300 font-bold">Abhijit Muhurat</div>
                    <div className="text-slate-400 text-[11px]">Exact Timing Window</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs col-span-2 sm:col-span-1">
                    <div className="text-cyan-300 font-bold">AstroGold Card</div>
                    <div className="text-slate-400 text-[11px]">VIP Wallet System</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TRUE GSAP PINNED VIEWPORT (Locked at top-24) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 flex flex-col items-center justify-center perspective-1000 py-6 z-20">
            
            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl text-xs font-bold shadow-2xl mb-4">
              {STEPS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleManualSwitch(s.key)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    activeStep === s.key
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.pillLabel}</span>
                  <span className="sm:hidden">{s.key.toUpperCase()}</span>
                </button>
              ))}
            </div>

            {/* Titanium 3D Phone Shell */}
            <div
              className="w-[300px] sm:w-[340px] h-[580px] rounded-[48px] p-3.5 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-4 shadow-[0_30px_90px_rgba(0,0,0,0.85)] preserve-3d transition-all duration-700 hover:rotate-1 relative"
              style={{
                borderColor: currentStepInfo.borderColor,
                boxShadow: `0 25px 80px rgba(0,0,0,0.8), ${currentStepInfo.glowShadow}`,
              }}
            >
              {/* Phone Outer Edge Highlight */}
              <div className="absolute inset-0 rounded-[44px] pointer-events-none border border-white/10" />

              {/* Dynamic Inner Screen */}
              <div className="w-full h-full rounded-[38px] bg-[#070A18] overflow-hidden flex flex-col relative border border-white/15 select-none">
                
                {/* Dynamic Island / Top Notch & Status Bar */}
                <div className="px-5 pt-3.5 pb-2 flex items-center justify-between text-[11px] text-slate-400 font-bold z-30">
                  <span className="font-mono">09:41</span>
                  {/* Dynamic Island */}
                  <div className="w-24 h-4 rounded-full bg-black flex items-center justify-between px-2.5 border border-slate-800 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] text-amber-400 font-mono tracking-wider font-bold">ASTROGURU</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span>5G</span>
                    <span className="text-emerald-400">100%</span>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* SCREEN VIEW 1: KUNDLI (D1 & D9 Interactive Visualizer)   */}
                {/* ======================================================== */}
                {activeStep === 'kundli' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 uppercase tracking-wider">
                        <span>✨</span> Ashta-Koota Match: 32 / 36
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">Rohit Sharma · Mesha Lagna</h4>
                    </div>

                    {/* Chart Tab Switcher (D1 vs D9) */}
                    <div className="flex items-center justify-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 max-w-[200px] mx-auto">
                      <button
                        onClick={() => setActiveKundliTab('d1')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          activeKundliTab === 'd1' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                        }`}
                      >
                        Lagna (D1)
                      </button>
                      <button
                        onClick={() => setActiveKundliTab('d9')}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          activeKundliTab === 'd9' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                        }`}
                      >
                        Navamsha (D9)
                      </button>
                    </div>

                    {/* 3D Sacred Geometry Diamond Chart */}
                    <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto my-auto border-2 border-amber-400/60 relative flex items-center justify-center bg-slate-950/80 rounded-2xl shadow-inner shadow-amber-500/20">
                      {/* Diagonal diamond overlay */}
                      <div className="absolute inset-0 border border-indigo-400/40 transform rotate-45" />
                      <div className="absolute w-full h-[1px] bg-amber-400/30" />
                      <div className="absolute h-full w-[1px] bg-amber-400/30" />

                      {/* Planet Positions */}
                      <span className="absolute top-2 font-black text-[10px] text-amber-300">☀️ Su (10°)</span>
                      <span className="absolute bottom-2 font-black text-[10px] text-cyan-300">🌙 Mo (24°)</span>
                      <span className="absolute left-2 font-black text-[10px] text-rose-400">⚔️ Ma (18°)</span>
                      <span className="absolute right-2 font-black text-[10px] text-yellow-300">👑 Ju (05°)</span>

                      <div className="text-center bg-black/90 px-3 py-2 rounded-xl border border-amber-500/50 z-10 shadow-lg">
                        <div className="text-xl">🪐</div>
                        <div className="text-[10px] font-black text-emerald-400">
                          {activeKundliTab === 'd1' ? 'Sarva Karya Siddhi' : 'Pushkara Navamsha'}
                        </div>
                        <div className="text-[8px] text-slate-400">No Mangal Dosha</div>
                      </div>
                    </div>

                    {/* Footer Status Bar */}
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30 text-[11px] text-center text-amber-300 font-semibold flex items-center justify-between px-3">
                      <span>Nadi Koota: 8/8</span>
                      <span className="text-emerald-400">● Auspicious Match</span>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN VIEW 2: VOICE NOTES (Interactive Consultation)    */}
                {/* ======================================================== */}
                {activeStep === 'voice' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-black text-indigo-300 uppercase tracking-wider">
                        <span>🔴</span> Live Voice Consultation
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">Acharya Radheshyam Ji</h4>
                      <span className="text-[10px] text-emerald-400">● 18 Years Jyotish Experience</span>
                    </div>

                    {/* Audio Bubble Centerpiece */}
                    <div className="my-auto flex flex-col items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/30">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/30 animate-pulse">
                          🎙️
                        </div>
                        <button
                          onClick={() => setIsVoicePlaying(!isVoicePlaying)}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                          title="Toggle Playback"
                        >
                          {isVoicePlaying ? '⏸️' : '▶️'}
                        </button>
                      </div>

                      {/* Dancing Frequency Waveform Bars */}
                      <div className="flex items-center gap-1 h-12 px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800">
                        {audioBars.map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 rounded-full transition-all duration-100"
                            style={{
                              height: `${h}px`,
                              backgroundColor: i % 3 === 0 ? '#818CF8' : i % 3 === 1 ? '#F43F5E' : '#F59E0B',
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono px-2">
                        <span>{isVoicePlaying ? '00:34 / 02:15' : 'Paused'}</span>
                        <span className="text-rose-400 font-bold">128 kbps HD Voice</span>
                      </div>
                    </div>

                    {/* Hold-to-Record Simulated Mic */}
                    <div className="space-y-2">
                      <button
                        onMouseDown={() => setIsRecordingNote(true)}
                        onMouseUp={() => setIsRecordingNote(false)}
                        onTouchStart={() => setIsRecordingNote(true)}
                        onTouchEnd={() => setIsRecordingNote(false)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs text-center flex items-center justify-center gap-2 border transition-all ${
                          isRecordingNote
                            ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/40'
                            : 'bg-slate-900 border-indigo-500/40 text-indigo-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>{isRecordingNote ? '🔴' : '🎤'}</span>
                        <span>{isRecordingNote ? `Recording Query... (${recordTimer}s)` : 'Hold to Speak Voice Query'}</span>
                      </button>

                      <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 text-[10px] text-center text-indigo-200 font-semibold">
                        +5 Mins Auto-Recharge Ready (₹99)
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN VIEW 3: TAROT ORACLE (Interactive 3D Card Inside)  */}
                {/* ======================================================== */}
                {activeStep === 'tarot' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-black text-rose-300 uppercase tracking-wider">
                        <span>🔮</span> 3D Arcana Oracle
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">Daily Guidance Spread</h4>
                    </div>

                    {/* Interactive Flipping Card Inside Phone */}
                    <div
                      className="w-44 h-64 mx-auto my-auto perspective-1000 cursor-pointer select-none"
                      onClick={() => setIsPhoneTarotFlipped(!isPhoneTarotFlipped)}
                      title="Tap to Flip Card"
                    >
                      <div
                        className="w-full h-full duration-700 preserve-3d rounded-2xl relative shadow-2xl transition-transform"
                        style={{ transform: isPhoneTarotFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                      >
                        {/* Front (Back of Deck) */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl [backface-visibility:hidden] bg-gradient-to-b from-[#111827] via-[#1e1b4b] to-[#0f172a] p-3 flex flex-col items-center justify-between border-2 border-amber-400/60">
                          <div className="text-[9px] text-amber-300 font-mono">ASTROGURU TAROT</div>
                          <div className="w-20 h-20 rounded-full border border-dashed border-amber-400/60 flex items-center justify-center">
                            <span className="text-3xl">☸️</span>
                          </div>
                          <div className="text-[10px] text-amber-200 font-black">Tap Card to Flip ⚡</div>
                        </div>

                        {/* Back (Revealed Card) */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-amber-600 via-orange-600 to-slate-950 p-3 flex flex-col items-center justify-between border-2 border-yellow-300 shadow-xl text-center">
                          <span className="text-3xl mt-1">🎡</span>
                          <div>
                            <div className="text-[11px] font-black text-white">X · Wheel of Fortune</div>
                            <div className="text-[9px] text-yellow-200 font-bold">STRONG YES · 97%</div>
                          </div>
                          <div className="w-full bg-emerald-500/30 p-1.5 rounded-lg text-[9px] text-emerald-300 font-black">
                            Timing: In 3 to 7 Days
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-center">
                      <div className="bg-amber-500/15 p-2 rounded-xl border border-amber-500/30 text-[10px] text-amber-300 font-bold">
                        🎙️ GuruVani Voice Audio Synthesized
                      </div>
                      <div className="text-[9px] text-slate-400">Tap card to inspect front / back</div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN VIEW 4: SHUBH MUHURAT (Lock Screen Push Banner)   */}
                {/* ======================================================== */}
                {activeStep === 'muhurat' && (
                  <div className="flex-1 p-4 flex flex-col justify-between animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                        <span>🌅</span> Daily Lock-Screen Push
                      </div>
                      <h4 className="text-sm font-black text-white mt-1">Panchang Synchronized</h4>
                    </div>

                    {/* Realistic Lock-Screen Push Card */}
                    <div className="my-auto space-y-3 px-1">
                      <div className="bg-slate-900/95 p-3.5 rounded-2xl border border-amber-500/50 space-y-1.5 shadow-2xl">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                          <span className="flex items-center gap-1">
                            <span>🌅</span> 7:00 AM SHUBH MUHURAT
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Now</span>
                        </div>
                        <div className="text-xs font-black text-white">Aaj Ka Abhijit Muhurat</div>
                        <div className="text-[10px] text-slate-300 leading-tight">
                          <strong className="text-emerald-400">11:45 AM - 12:35 PM</strong>: Sarva Karya Siddhi Window. Ideal for new beginnings, contracts, and travel.
                        </div>
                        <div className="text-[9px] text-rose-300 font-medium pt-1 border-t border-slate-800">
                          ⚠️ Rahu Kaal: 04:30 PM - 06:00 PM (Avoid important tasks)
                        </div>
                      </div>

                      {/* AstroGold VIP Metal Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg shadow-amber-500/20">
                        <div>
                          <div className="text-[8px] uppercase tracking-wider text-slate-900/80">Membership Card</div>
                          <div className="text-sm font-black">AstroGold Metal</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] text-slate-900/80">Available Balance</div>
                          <div className="text-xs font-black text-slate-950">₹1,450.00</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30 text-[10px] text-center text-emerald-300 font-bold">
                      ✨ Lucky Color: Golden Saffron · Lucky No: 9
                    </div>
                  </div>
                )}

                {/* Home Indicator Bar */}
                <div className="w-28 h-1 rounded-full bg-white/40 mx-auto my-2" />
              </div>
            </div>

            {/* Hint Caption */}
            <div className="text-center text-[11px] text-slate-400 font-medium pt-2">
              💡 Scroll up or down to cycle through all 4 chapters, or tap the switcher pills above
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

