import React, { useState, useEffect } from 'react';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { StickyShowcase } from './components/StickyShowcase';
import { TarotStage } from './components/TarotStage';
import { DownloadSection } from './components/DownloadSection';
import { AppUploadModal } from './components/AppUploadModal';
import { Footer } from './components/Footer';

interface ReleaseData {
  currentVersion: string;
  latestVersion: string;
  buildCode: number;
  downloadUrl: string;
  fileSizeMb: number;
  minAndroidVersion: string;
  sha256?: string;
  releaseNotes: string[];
  isMandatory: boolean;
}

const DEFAULT_RELEASE: ReleaseData = {
  currentVersion: '2.9.6',
  latestVersion: '2.9.6',
  buildCode: 296,
  downloadUrl: 'https://expo.dev/artifacts/eas/KqNVd3oafIKVeEIuHEhYUUB0ll5xTobex7TfgS_0ZvE.apk',
  fileSizeMb: 105,
  minAndroidVersion: '8.0',
  sha256: '3e9b16757b4f3bfa658d3cb1e2aa95dc012a6473210ab6411516eef14f9d2d88',
  releaseNotes: [
    'Official Golden Surya Branding & Adaptive Sacred Icons',
    'WhatsApp-Style Voice Notes in Chat with Live Waveforms',
    '5-Mode 3D Tarot Reading (Daily, Love & Ex, Career, Timeline, ₹99 Yes/No Oracle)',
    'Daily 7:00 AM Shubh Muhurat & Rahu Kaal Lock-Screen Alerts',
    'High-Contrast Vedic Kundli (36-Gun Ashta-Koota Matching)',
    'Direct In-App APK Download & Package Auto-Installer Engine',
  ],
  isMandatory: false,
};

export function App() {
  const [release, setRelease] = useState<ReleaseData>(DEFAULT_RELEASE);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/90 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-emerald-300 animate-bounce text-xs flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      <Navbar
        version={release.latestVersion || release.currentVersion}
        downloadUrl={release.downloadUrl}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Hero Section with 3D Mouse Tilt */}
      <Hero
        version={release.latestVersion || release.currentVersion}
        buildCode={release.buildCode}
        downloadUrl={release.downloadUrl}
        fileSizeMb={release.fileSizeMb}
      />

      {/* GSAP ScrollTrigger Pinned 3D Phone Showcase */}
      <StickyShowcase />

      {/* 3D Interactive Tarot Stage with GuruVani Voice Waveforms */}
      <TarotStage />

      {/* Download & Deployment Hub */}
      <DownloadSection
        version={release.latestVersion || release.currentVersion}
        buildCode={release.buildCode}
        fileSizeMb={release.fileSizeMb}
        downloadUrl={release.downloadUrl}
        minAndroidVersion={release.minAndroidVersion || '8.0'}
        sha256={release.sha256}
      />

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
