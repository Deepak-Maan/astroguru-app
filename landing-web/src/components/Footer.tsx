import React from 'react';

interface FooterProps {
  version: string;
  buildCode: number;
}

export const Footer: React.FC<FooterProps> = ({ version, buildCode }) => {
  return (
    <footer className="border-t border-slate-900 bg-[#02040A] py-12 text-xs text-slate-500 text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">☀️</span>
          <span className="font-extrabold text-slate-300">AstroGuru Official Platform</span>
          <span>· Version {version} (Build {buildCode})</span>
        </div>
        <div className="flex items-center gap-6 text-slate-400 font-medium">
          <a href="#sticky-showcase" className="hover:text-amber-400 transition-colors">3D Showcase</a>
          <a href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
          <a href="/delete-account" className="hover:text-amber-400 transition-colors">Delete Account</a>
          <a href="https://github.com/Deepak-Maan/astroguru-app" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">GitHub</a>
          <span>© 2026 AstroGuru Inc.</span>
        </div>
      </div>
    </footer>
  );
};
