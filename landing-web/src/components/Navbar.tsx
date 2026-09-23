import React from 'react';

interface NavbarProps {
  version: string;
  downloadUrl: string;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ version, downloadUrl, onOpenUpload }) => {
  const adminUrl = typeof window !== 'undefined' && window.location.port === '4000'
    ? `http://${window.location.hostname}:3000`
    : '/admin';

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
          <a href="#download" className="hover:text-amber-400 transition-colors">Download App</a>
          <a
            href={adminUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-indigo-300"
          >
            <span className="text-amber-400">🛡️</span>
            <span>Admin Panel</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Admin Panel Button */}
          <a
            href={adminUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/35 hover:border-amber-400/60 text-indigo-100 hover:text-amber-300 font-bold text-xs shadow-md shadow-indigo-950/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md group"
            title="Launch AstroGuru Enterprise Web Admin Dashboard"
          >
            <span className="text-amber-400 group-hover:rotate-12 transition-transform">🛡️</span>
            <span className="hidden sm:inline">Admin Panel</span>
            <span className="text-[10px] text-indigo-400 group-hover:text-amber-300 transition-colors font-mono">↗</span>
          </a>

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
