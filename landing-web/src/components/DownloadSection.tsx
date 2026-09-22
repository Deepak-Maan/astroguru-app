import React from 'react';

interface DownloadSectionProps {
  version: string;
  buildCode: number;
  fileSizeMb: number;
  downloadUrl: string;
  minAndroidVersion: string;
  sha256?: string;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  version,
  buildCode,
  fileSizeMb,
  downloadUrl,
  minAndroidVersion,
  sha256,
}) => {
  return (
    <section id="download" className="relative z-10 py-20 px-4 sm:px-6 bg-[#04060E] border-t border-slate-800">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        
        <div className="space-y-3">
          <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
            Production Ready Deployments
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Download AstroGuru <span className="gold-gradient-text">v{version}</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Built for seamless Android installation. Supports native in-app package installer updates and instant web cloud access.
          </p>
        </div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* APK Card */}
          <div className="liquid-glass p-8 rounded-3xl border-amber-500/40 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">📦</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Official Standalone APK
                </span>
              </div>
              <h3 className="text-xl font-black text-white">Direct Android Package (.apk)</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Native Android build featuring full offline Kundli cache, in-app auto-update streaming, and WhatsApp voice recording.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={downloadUrl || '/download/apk'}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>⚡</span> Download APK v{version} ({fileSizeMb} MB)
              </a>
              <div className="text-[11px] text-center text-slate-400">
                Compatible with Android {minAndroidVersion}+ (Build {buildCode})
              </div>
              {sha256 && (
                <div className="text-[10px] text-center text-indigo-300 font-mono truncate px-2">
                  SHA-256: {sha256}
                </div>
              )}
            </div>
          </div>

          {/* AI Jyotishi & Live Vedic Consultations */}
          <div className="liquid-glass p-8 rounded-3xl border-indigo-500/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🔮</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Google Gemini Vedic AI
                </span>
              </div>
              <h3 className="text-xl font-black text-white">Instant AI Jyotishi & Live Consultations</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Receive instant Vedic Kundli readings, real-time remedies, and multi-lingual astrological guidance 24/7 in Hindi, Hinglish, and English.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={downloadUrl || '/download/apk'}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-sm text-center flex items-center justify-center gap-2 border border-amber-500/30 transition-all"
              >
                <span>✨</span> Start 3-Min Free Consultation
              </a>
              <div className="text-[11px] text-center text-slate-400">
                100% Private, Secure & End-to-End Encrypted Readings
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
