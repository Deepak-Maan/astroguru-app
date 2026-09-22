import React, { useState, useEffect } from 'react';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StickyShowcase } from './components/StickyShowcase';
import { TarotStage } from './components/TarotStage';
import { DownloadSection } from './components/DownloadSection';
import { AppUploadModal } from './components/AppUploadModal';
import { Footer } from './components/Footer';
import { WebsiteConfig, ReleaseData } from './types';

const DEFAULT_RELEASE: ReleaseData = {
  currentVersion: '3.0.0',
  latestVersion: '3.0.0',
  buildCode: 300,
  downloadUrl: '/download/apk',
  fileSizeMb: 105,
  minAndroidVersion: '8.0',
  sha256: '3e9b16757b4f3bfa658d3cb1e2aa95dc012a6473210ab6411516eef14f9d2d88',
  releaseNotes: [
    'Official v3.0.0 Milestone Release: In-App Download Engine',
    '100% In-App Direct APK Download without external website redirects',
    'Real-time streaming download progress bar with background session support',
    'Instant native APK package installer prompt upon completion',
    'GSAP Sticky 3D Phone Showcase with live interactive screens',
    'Synchronized single update action button across Seeker & Acharya profiles',
  ],
  isMandatory: false,
};

export function App() {
  const [release, setRelease] = useState<ReleaseData>(DEFAULT_RELEASE);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStickyMode, setIsStickyMode] = useState<boolean>(false);

  useEffect(() => {
    // Fetch latest app release
    fetch('/api/releases/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.release) {
          setRelease(data.release);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch latest release from server, using defaults:', err.message);
      });

    // Fetch dynamic website CMS config
    fetch('/api/website/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setWebsiteConfig(data.config);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch website config from server:', err.message);
      });

    // Detect if user navigated directly to /sticky or #sticky-showcase
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('sticky') || hash.includes('sticky') || hash.includes('features')) {
      setIsStickyMode(true);
      setTimeout(() => {
        const showcase = document.getElementById('features') || document.getElementById('sticky-showcase');
        if (showcase) {
          showcase.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, []);

  const handleReleasePublished = (newRelease: any) => {
    setRelease(newRelease);
    setToastMessage(`🚀 Build v${newRelease.latestVersion || newRelease.currentVersion} published successfully!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen text-slate-100 relative selection:bg-amber-500 selection:text-slate-950">
      {/* 3D Background Canvas */}
      <StarfieldCanvas />

      {/* Top Dynamic Announcement Ticker Banner */}
      {websiteConfig?.topBannerEnabled && websiteConfig?.topBannerText && (
        <aside aria-label="Announcement" className="relative z-50 bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm py-2 px-4 text-center tracking-wide shadow-xl flex items-center justify-center gap-2 border-b border-amber-400/40">
          <span className="animate-pulse">🔔</span>
          <span>{websiteConfig.topBannerText}</span>
        </aside>
      )}

      {/* Maintenance Mode Warning Bar */}
      {websiteConfig?.maintenanceMode && (
        <aside aria-label="System Notice" className="relative z-50 bg-rose-600/95 text-white font-black text-xs py-1.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2 border-b border-rose-400">
          <span>⚠️</span>
          <span>Cosmic Maintenance Mode Active · Some Live Predictions May Experience Brief Sync Delays</span>
        </aside>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/90 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-emerald-300 animate-bounce text-xs flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Sticky Showcase Control Pill */}
      {isStickyMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-amber-500/50 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold text-amber-300 animate-fadeIn">
          <span>✨ GSAP Sticky Pinned Mode</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-yellow-400 transition-colors"
          >
            ↑ Back to Top
          </button>
          <a
            href={release.downloadUrl || '/download/apk'}
            className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition-colors"
          >
            📥 Download APK
          </a>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      <Navbar
        version={release.latestVersion || release.currentVersion}
        downloadUrl={release.downloadUrl}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Hero Section with 3D Mouse Tilt and dynamic CMS copy */}
      <Hero
        version={release.latestVersion || release.currentVersion}
        buildCode={release.buildCode}
        downloadUrl={release.downloadUrl}
        fileSizeMb={release.fileSizeMb}
        title={websiteConfig?.heroTitle}
        highlight={websiteConfig?.heroHighlight}
        subtitle={websiteConfig?.heroSubtitle}
        announcementText={websiteConfig?.announcementText}
        ratings={websiteConfig?.ratings}
      />

      {/* GSAP ScrollTrigger Pinned 3D Phone Showcase */}
      {(websiteConfig?.showcaseEnabled ?? true) && (
        <StickyShowcase chapters={websiteConfig?.chapters} />
      )}

      {/* 3D Interactive Tarot Stage with GuruVani Voice Waveforms */}
      {(websiteConfig?.tarotEnabled ?? true) && (
        <TarotStage />
      )}

      {/* Download & Deployment Hub */}
      {(websiteConfig?.downloadEnabled ?? true) && (
        <DownloadSection
          version={release.latestVersion || release.currentVersion}
          buildCode={release.buildCode}
          fileSizeMb={release.fileSizeMb}
          downloadUrl={release.downloadUrl}
          minAndroidVersion={release.minAndroidVersion || '8.0'}
          sha256={release.sha256}
        />
      )}

      {/* Footer */}
      <Footer
        version={release.latestVersion || release.currentVersion}
        buildCode={release.buildCode}
      />

      {/* Admin App Release Upload Modal */}
      <AppUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentVersion={release.latestVersion || release.currentVersion}
        onReleasePublished={handleReleasePublished}
      />
    </div>
  );
}

export default App;
