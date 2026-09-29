import React, { useEffect, useRef, useState } from 'react';

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
  videoUrl?: string;
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
  videoUrl = '/assets/videos/hero-cosmos-3d.mp4',
}) => {
  const astrolabeRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 3D Parallax Mouse Tracking for Astrolabe
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!astrolabeRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 22;
      const y = (e.clientY / innerHeight - 0.5) * 22;
      astrolabeRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
    };

    const handleMouseLeave = () => {
      if (!astrolabeRef.current) return;
      astrolabeRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative z-10 min-h-[88vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
      
      {/* ── BACKGROUND 3D ANIMATED COSMIC VIDEO ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${
            isVideoLoaded ? 'opacity-55' : 'opacity-0'
          }`}
          style={{ transform: 'scale(1.08)' }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src="https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014935/MW_Anatomy_30fps_4k.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Multi-Stop Ambient Gradients for AAA Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/90 via-[#060913]/60 to-[#060913]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.14),transparent_60%)]" />
        
        {/* Bottom Horizon Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#060913] via-[#060913]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-20">
        
        {/* ── LEFT NARRATIVE & HIGH-CONVERSION CTA ── */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/35 text-amber-300 text-xs font-black tracking-wider shadow-lg shadow-amber-500/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>{announcementText || `OFFICIAL v${version} RELEASE · GOOGLE GEMINI AI ACTIVATED`}</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            {title || 'Your Destiny,'} <br />
            <span className="gold-gradient-text drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
              {highlight || 'Engineered by the Stars.'}
            </span>
          </h1>

          {/* Subtitle with High-Legibility Typography */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal drop-shadow-sm">
            {subtitle || 'Vedic Jyotish meets modern AI. High-contrast Lagna Kundlis, conversational Google Gemini AI astrologer consultations, interactive two-way voice notes, and 5 specialized 3D Tarot spreads.'}
          </p>

          {/* High-Conversion Download Container (Liquid Glass) */}
          <div className="liquid-glass p-6 sm:p-7 rounded-3xl max-w-xl space-y-4 border-amber-500/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Primary APK Download CTA */}
              <a
                href={downloadUrl || '/download/apk'}
                className="w-full sm:w-auto flex-1 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-3.5 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <span className="text-2xl group-hover:translate-y-0.5 transition-transform">📥</span>
                <div className="text-left leading-tight">
                  <div className="font-extrabold text-sm sm:text-base">Download Android APK</div>
                  <div className="text-[11px] font-bold text-slate-900/80">
                    v{version} (Build {buildCode}) · {fileSizeMb} MB
                  </div>
                </div>
              </a>

              {/* Jump to 3D Sticky Showcase */}
              <a
                href="#features"
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
              >
                <span>📱</span>
                <span>3D Showcase ↓</span>
              </a>
            </div>

            {/* Integrity & Compliance Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3.5 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Google Play Protect Verified
              </span>
              <span className="text-indigo-300 font-semibold flex items-center gap-1">
                <span>🤖</span> Google Gemini AI
              </span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <span>🔒</span> 100% Private & Encrypted
              </span>
            </div>
          </div>

          {/* Social Proof & Live Activity */}
          <div className="flex flex-wrap items-center gap-8 pt-1 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400 text-sm tracking-wider">★★★★★</div>
              <strong className="text-white text-sm">{ratings?.score || '4.9/5'}</strong>
              <span>({ratings?.reviewCount || '85,000+ Reviews'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200 font-bold">{ratings?.todayConsultations || '12,500+ Live Consultations Today'}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT 3D INTERACTIVE CELESTIAL ASTROLABE ── */}
        <div className="lg:col-span-5 flex items-center justify-center relative min-h-[460px]">
          
          {/* Orbital Track Rings */}
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-amber-500/25 orbit-slow pointer-events-none" />
          <div className="absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full border border-dashed border-indigo-400/35 orbit-reverse pointer-events-none" />
          <div className="absolute w-96 h-96 sm:w-[460px] sm:h-[460px] rounded-full border border-amber-500/15 orbit-slow pointer-events-none" />

          {/* 3D Holographic Core Astrolabe */}
          <div
            ref={astrolabeRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-64 h-64 sm:w-76 sm:h-76 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-300 flex items-center justify-center aura-pulse cursor-pointer shadow-[0_0_140px_rgba(245,158,11,0.55)] transition-transform duration-200 ease-out"
          >
            {/* Inner Sacred Sun Mandala */}
            <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-yellow-200/60 bg-[#090D1E]/65 backdrop-blur-xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden shadow-inner">
              
              {/* Shimmer Ambient Glow */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              
              <span className="text-7xl mb-1 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.95)] animate-pulse">
                ☀️
              </span>
              <span className="text-xs font-black tracking-widest text-amber-200 uppercase cinzel">
                Golden Surya
              </span>
              <span className="text-[10px] text-indigo-200 font-semibold tracking-wide">
                Atma Karaka · Kundli Core
              </span>
              
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                Live 3D Parallax Active
              </div>
            </div>

            {/* Orbiting Planetary Satellites */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-yellow-400/40 text-[10px] font-black text-yellow-300 shadow-xl backdrop-blur-md flex items-center gap-1.5">
              <span>🪐</span>
              <span>Saturn in Pisces · Retrograde</span>
            </div>
            
            <div className="absolute top-1/2 -right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-400/40 text-[10px] font-black text-cyan-300 shadow-xl backdrop-blur-md flex items-center gap-1.5">
              <span>🌙</span>
              <span>Chandra Waxing · Rohini</span>
            </div>

            <div className="absolute -bottom-3 left-1/4 px-3 py-1 rounded-full bg-slate-950/90 border border-rose-400/40 text-[10px] font-black text-rose-300 shadow-xl backdrop-blur-md flex items-center gap-1.5">
              <span>⚔️</span>
              <span>Mangal · Exalted Energy</span>
            </div>
          </div>

          {/* Floating AI Voice Feature Bubble */}
          <div className="absolute -bottom-7 -right-2 liquid-glass p-4 rounded-2xl border-indigo-400/35 shadow-2xl floating-card backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg shadow-md">
                🎙️
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  GuruVani AI Voice
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-emerald-400 font-bold">Two-Way Interactive Calls Live</div>
              </div>
            </div>
          </div>

          {/* Floating Gemini AI Feature Bubble */}
          <div className="absolute -top-4 -left-4 liquid-glass p-3.5 rounded-2xl border-amber-400/35 shadow-2xl backdrop-blur-xl hidden sm:block">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-xs font-black text-amber-200">Gemini Vedic AI</div>
                <div className="text-[10px] text-slate-300 font-semibold">Real-Time Chart Analysis</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 3D VIDEO PLAYBACK CONTROLLER PILL ── */}
      <aside aria-label="3D Video Background Controls" className="absolute bottom-4 left-6 z-30 hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-950/75 border border-indigo-500/30 backdrop-blur-md text-xs text-slate-300 shadow-xl">
        <button
          onClick={toggleVideoPlayback}
          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition-colors"
          title={isPlaying ? 'Pause 3D animated cosmic video' : 'Play 3D animated cosmic video'}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
        </button>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>3D Galaxy Motion {isPlaying ? 'Active' : 'Paused'}</span>
        </div>
      </aside>

    </section>
  );
};
