import React, { useEffect, useRef } from 'react';

interface HeroProps {
  version: string;
  buildCode: number;
  downloadUrl: string;
  fileSizeMb: number;
  title?: string;
  highlight?: string;
  subtitle?: string;
  announcementText?: string;
  ratings?: {
    score: string;
    reviewCount: string;
    todayConsultations: string;
  };
}

export const Hero: React.FC<HeroProps> = ({
  version,
  buildCode,
  downloadUrl,
  fileSizeMb,
  title,
  highlight,
  subtitle,
  announcementText,
  ratings,
}) => {
  const suryaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!suryaRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 24;
      const y = (e.clientY / innerHeight - 0.5) * 24;
      suryaRef.current.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };

    const handleMouseLeave = () => {
      if (!suryaRef.current) return;
      suryaRef.current.style.transform = `perspective(800px) rotateY(0deg) rotateX(0deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative z-10 min-h-[82vh] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 overflow-hidden">
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-600/15 via-orange-500/10 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Narrative */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold tracking-wider">
            <span className="animate-pulse">✨</span> {announcementText || `OFFICIAL v${version} PLATFORM RELEASE`}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            {title || 'Your Destiny,'} <br />
            <span className="gold-gradient-text">{highlight || 'Engineered by the Stars.'}</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
            {subtitle || 'The ultimate Vedic Astrology platform. High-contrast Lagna Kundlis, conversational GuruVani AI voice readings, WhatsApp audio notes, and 5 specialized 3D Tarot spreads.'}
          </p>

          {/* High-Conversion Download Container */}
          <div className="liquid-glass p-6 rounded-3xl max-w-xl space-y-4 border-amber-500/30">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Primary APK Download CTA */}
              <a
                href={downloadUrl || '/download/apk'}
                className="w-full sm:w-auto flex-1 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span className="text-xl">📥</span>
                <div className="text-left leading-tight">
                  <div>Download Android APK</div>
                  <div className="text-[11px] font-semibold opacity-90">
                    v{version} (Build {buildCode}) · {fileSizeMb} MB
                  </div>
                </div>
              </a>

              {/* Jump to 3D Sticky Device Showcase */}
              <a
                href="#features"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>📱</span>
                <span>3D Showcase ↓</span>
              </a>
            </div>

            {/* Integrity Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Google Play Protect Verified
              </span>
              <span className="text-indigo-300 font-medium">Direct APK Mirror</span>
              <span className="text-amber-300 font-bold">SHA-256 Validated</span>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap items-center gap-8 pt-1 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <strong className="text-white text-sm">{ratings?.score || '4.9/5'}</strong>
              <span>({ratings?.reviewCount || '85k+ Reviews'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">●</span>
              <span className="text-slate-200">{ratings?.todayConsultations || '12,500+ Consultations Today'}</span>
            </div>
          </div>
        </div>

        {/* Right 3D Interactive Solar Astrolabe */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[420px]">
          
          {/* Rotating Orbital Track Rings */}
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-amber-500/25 orbit-slow pointer-events-none" />
          <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-dashed border-indigo-400/30 orbit-reverse pointer-events-none" />
          <div className="absolute w-96 h-96 sm:w-[450px] sm:h-[450px] rounded-full border border-amber-500/15 orbit-slow pointer-events-none" />

          {/* Floating Golden Surya 3D Core */}
          <div
            ref={suryaRef}
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-300 flex items-center justify-center aura-pulse cursor-pointer shadow-[0_0_120px_rgba(245,158,11,0.6)] transition-transform duration-200"
          >
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-2 border-yellow-200/60 bg-[#090D1E]/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-4">
              <span className="text-7xl mb-1 filter drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]">☀️</span>
              <span className="text-xs font-black tracking-widest text-amber-200 uppercase">Golden Surya</span>
              <span className="text-[10px] text-indigo-200 font-semibold">Atma Karaka</span>
            </div>

            {/* Orbiting Satellites */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-yellow-300/40 text-[10px] font-bold text-yellow-300 shadow-lg">
              🪐 Saturn Retrograde
            </div>
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 text-[10px] font-bold text-cyan-300 shadow-lg">
              🌙 Chandra Waxing
            </div>
            <div className="absolute -bottom-3 left-1/3 px-2.5 py-1 rounded-full bg-slate-900/90 border border-rose-400/40 text-[10px] font-bold text-rose-300 shadow-lg">
              ⚔️ Mars in 1st House
            </div>
          </div>

          {/* Floating Feature Bubble */}
          <div className="absolute -bottom-6 -right-2 liquid-glass p-3.5 rounded-2xl border-indigo-400/30 shadow-2xl floating-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎙️</span>
              <div>
                <div className="text-xs font-black text-white">GuruVani AI Voice</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Waveform Audio Active</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
