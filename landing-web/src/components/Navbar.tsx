import React from 'react';

interface NavbarProps {
  version: string;
  downloadUrl: string;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ version, downloadUrl, onOpenUpload }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#070A17]/85 backdrop-blur-xl border-b border-indigo-500/20 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 p-0.5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#090D1E] flex items-center justify-center text-xl">
              ☀️
            </div>
          </div>
          <div>
            <span className="font-black text-base sm:text-lg tracking-wider text-white flex items-center gap-2">
              ASTROGURU
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                v{version}
              </span>
            </span>
            <span className="text-[10px] text-indigo-300/70 font-medium block">
              Vedic Astrology & AI Voice Portal
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
          <a href="#features" className="hover:text-amber-400 transition-colors">Core Features</a>
          <a href="#sticky-showcase" className="hover:text-amber-400 transition-colors">Live 3D Preview</a>
          <a href="#tarot" className="hover:text-amber-400 transition-colors">5 Tarot Spreads</a>
          <a href="#download" className="hover:text-amber-400 transition-colors">Download APK</a>
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all">
            🖥️ Web Admin
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Admin Upload Button */}
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
            title="Upload new APK build or manage releases"
          >
            <span>🚀</span>
            <span className="hidden sm:inline">Upload App</span>
          </button>

          {/* Primary Download Button */}
          <a
            href={downloadUrl || '/download/apk'}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>📥</span>
            <span>Download APK</span>
          </a>
        </div>

      </div>
    </nav>
  );
};
