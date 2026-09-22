import React, { useState } from 'react';

interface PlanetInfo {
  id: string;
  name: string;
  sanskrit: string;
  symbol: string;
  sign: string;
  degree: string;
  status: 'Direct' | 'Retrograde' | 'Exalted' | 'Debilitated' | 'Combust';
  nakshatra: string;
  impact: string;
  benefic: boolean;
  accentColor: string;
  borderColor: string;
}

const PLANETS: PlanetInfo[] = [
  {
    id: 'sun',
    name: 'Sun',
    sanskrit: 'Surya',
    symbol: '☀️',
    sign: 'Pisces (Meena)',
    degree: "06° 42'",
    status: 'Direct',
    nakshatra: 'Uttara Bhadrapada',
    impact: 'Vitality, Soul Purpose & Sovereign Authority',
    benefic: true,
    accentColor: '#F59E0B',
    borderColor: 'border-amber-400/60',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    sanskrit: 'Brihaspati / Guru',
    symbol: '🪐',
    sign: 'Taurus (Vrishabha)',
    degree: "14° 18'",
    status: 'Direct',
    nakshatra: 'Rohini (Pada 2)',
    impact: 'Supreme Dharma, Wealth & Wisdom Expansion',
    benefic: true,
    accentColor: '#FCD34D',
    borderColor: 'border-amber-400/80',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    sanskrit: 'Shani Dev',
    symbol: '🪐',
    sign: 'Aquarius (Kumbha)',
    degree: "19° 54'",
    status: 'Direct',
    nakshatra: 'Shatabhisha',
    impact: 'Karmic Discipline, Justice & Deep Transformation',
    benefic: false,
    accentColor: '#818CF8',
    borderColor: 'border-indigo-400/80',
  },
  {
    id: 'venus',
    name: 'Venus',
    sanskrit: 'Shukra',
    symbol: '✨',
    sign: 'Pisces (Meena)',
    degree: "27° 12'",
    status: 'Exalted',
    nakshatra: 'Revati',
    impact: 'Love Harmony, Artistry, Luxury & Marriage Bliss',
    benefic: true,
    accentColor: '#F472B6',
    borderColor: 'border-pink-400/80',
  },
  {
    id: 'mars',
    name: 'Mars',
    sanskrit: 'Mangal Dev',
    symbol: '🔥',
    sign: 'Gemini (Mithuna)',
    degree: "08° 35'",
    status: 'Direct',
    nakshatra: 'Ardra',
    impact: 'Physical Vitality, Courage, Real Estate & Drive',
    benefic: false,
    accentColor: '#EF4444',
    borderColor: 'border-red-500/80',
  },
  {
    id: 'rahu',
    name: 'Rahu (North Node)',
    sanskrit: 'Rahu Chhaya Graha',
    symbol: '🌑',
    sign: 'Pisces (Meena)',
    degree: "11° 02'",
    status: 'Retrograde',
    nakshatra: 'Uttara Bhadrapada',
    impact: 'Sudden Shifts, International Reach & Ambition',
    benefic: false,
    accentColor: '#A78BFA',
    borderColor: 'border-purple-400/80',
  },
];

export function NavagrahaOrbitRadar() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo>(PLANETS[1]); // Jupiter default

  return (
    <section id="celestial-radar" className="py-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold mb-4 tracking-wider uppercase">
            <span className="pulse-dot bg-indigo-400 text-indigo-400" />
            LIVE CELESTIAL TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-100 tracking-tight cinzel">
            Navagraha Planetary Orbit Radar &{' '}
            <span className="gold-gradient-text">Real-Time Transit Clock</span>
          </h2>
          <p className="text-sm sm:text-base text-indigo-200/70 mt-3 max-w-2xl mx-auto leading-relaxed">
            Live astronomical telemetry tracking the exact degrees, nakshatras, and planetary alignments
            of the Vedic Grahas synchronized with the Swiss Ephemeris.
          </p>
        </div>

        {/* Interactive Orbit Radar Stage */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-indigo-500/25 shadow-2xl">
          {/* Subtle Rotating Orbits in Background */}
          <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
            <div className="w-[520px] h-[520px] rounded-full border border-indigo-500/20 orbit-spin-1" />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-dashed border-amber-500/20 orbit-spin-2" />
            <div className="absolute w-[240px] h-[240px] rounded-full border border-rose-500/25 orbit-spin-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Col: 3D Orbit Radar Visualization & Planet Selector */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              {/* Orbital Ring Center Visual */}
              <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4">
                {/* Central Surya Core */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[0])}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/50 border-2 border-amber-200 hover:scale-105 transition-all cursor-pointer z-20 group"
                  title="Surya Dev (Sun) - Click to Inspect"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">☀️</span>
                  <span className="text-[9px] font-black text-slate-950 uppercase tracking-tighter">Surya</span>
                </button>

                {/* Jupiter Node (Top) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[1])}
                  className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${
                    selectedPlanet.id === 'jupiter' ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-400/50'
                  } shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 cursor-pointer z-20`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400" />
                  <span className="font-bold text-amber-300">Jupiter (Guru)</span>
                  <span className="text-[10px] text-slate-400">♉ 14°</span>
                </button>

                {/* Saturn Node (Bottom-Right) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[2])}
                  className={`absolute bottom-5 right-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${
                    selectedPlanet.id === 'saturn' ? 'border-indigo-400 ring-2 ring-indigo-400/40' : 'border-indigo-400/50'
                  } shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 cursor-pointer z-20`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block shadow-sm shadow-indigo-400" />
                  <span className="font-bold text-indigo-300">Saturn (Shani)</span>
                  <span className="text-[10px] text-emerald-400">Direct</span>
                </button>

                {/* Venus Node (Bottom-Left) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[3])}
                  className={`absolute bottom-6 left-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${
                    selectedPlanet.id === 'venus' ? 'border-pink-400 ring-2 ring-pink-400/40' : 'border-pink-400/50'
                  } shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 cursor-pointer z-20`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block shadow-sm shadow-pink-400" />
                  <span className="font-bold text-pink-300">Venus (Shukra)</span>
                  <span className="text-[10px] text-pink-200">Exalted</span>
                </button>

                {/* Mars Node (Right) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[4])}
                  className={`absolute top-1/2 right-0 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${
                    selectedPlanet.id === 'mars' ? 'border-red-500 ring-2 ring-red-500/40' : 'border-red-500/50'
                  } shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 cursor-pointer z-20`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm shadow-red-500" />
                  <span className="font-bold text-red-300">Mars (Mangal)</span>
                  <span className="text-[10px] text-amber-400">Active</span>
                </button>

                {/* Rahu Node (Left) */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanet(PLANETS[5])}
                  className={`absolute top-1/2 left-0 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 border ${
                    selectedPlanet.id === 'rahu' ? 'border-purple-400 ring-2 ring-purple-400/40' : 'border-purple-400/50'
                  } shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 cursor-pointer z-20`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block shadow-sm shadow-purple-400" />
                  <span className="font-bold text-purple-300">Rahu</span>
                  <span className="text-[10px] text-purple-200">Retro</span>
                </button>
              </div>

              {/* Active Planet Quick Inspector Pill */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/85 border border-indigo-500/30 backdrop-blur-md mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedPlanet.symbol}</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-100">{selectedPlanet.name} ({selectedPlanet.sanskrit})</h4>
                      <p className="text-[11px] text-indigo-300 font-mono">Sign: {selectedPlanet.sign}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedPlanet.status === 'Exalted'
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-400/40'
                        : selectedPlanet.status === 'Retrograde'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    }`}
                  >
                    {selectedPlanet.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-indigo-500/20">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Degree & Nakshatra</span>
                    <span className="font-semibold text-slate-200">{selectedPlanet.degree} · {selectedPlanet.nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jyotish Influence</span>
                    <span className="font-semibold text-amber-300 truncate block">{selectedPlanet.impact}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs font-semibold text-indigo-300/80 flex items-center justify-center gap-1.5">
                  <span>🔄</span> Live Ephemeris Engine · Synced with Swiss Ephemeris
                </span>
              </div>
            </div>

            {/* Right Col: Live Transit Windows & Muhurat Clocks */}
            <div className="lg:col-span-6 space-y-4">
              {/* Card 1: Auspicious Abhijit Muhurat */}
              <div className="p-5 rounded-2xl bg-slate-900/85 border border-indigo-500/30 hover:border-amber-400/50 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="pulse-dot bg-amber-400 text-amber-400" />
                    Current Auspicious Window
                  </span>
                  <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    11:45 AM – 12:35 PM IST
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Abhijit Muhurat (Victory Hour)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Supreme positive planetary alignment for signing contracts, investing, purchasing gold, or starting auspicious consultations.
                </p>
              </div>

              {/* Card 2: Jupiter Mahadasha & Major Transit */}
              <div className="p-5 rounded-2xl bg-slate-900/85 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Major Planetary Transit
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-400/30">
                    45 Days Left in Sign
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  Jupiter in Taurus · Career & Wealth Acceleration
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Stimulating 10th & 2nd wealth houses. Especially auspicious for promotion, new business ventures, and clearing debts.
                </p>
              </div>

              {/* Card 3: Rahu Kaal Caution Window */}
              <div className="p-5 rounded-2xl bg-slate-900/85 border border-indigo-500/30 hover:border-rose-400/50 transition-all shadow-lg group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Caution Time Today
                  </span>
                  <span className="text-xs text-rose-300 font-mono bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    04:30 PM – 06:00 PM IST
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                  Rahu Kaal Period
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Avoid initiating new partnerships or signing critical agreements during this period. Best utilized for meditation and internal focus.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <a
                  href="#download"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-98"
                >
                  <span>🪐 View My Birth Chart (Kundli) Transits on App →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
