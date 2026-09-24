import React, { useState, useEffect } from 'react';
import { WebsiteConfig } from '../types';
import { fetchWebsiteConfigApi, saveWebsiteConfigApi } from '../services/api';

const DEFAULT_CONFIG: WebsiteConfig = {
  heroTitle: 'Your Destiny,',
  heroHighlight: 'Engineered by the Stars.',
  heroSubtitle: 'The ultimate Vedic Astrology platform. High-contrast Lagna Kundlis, conversational GuruVani AI voice readings, WhatsApp audio notes, and 5 specialized 3D Tarot spreads.',
  announcementText: 'OFFICIAL v3.0.1 RELEASE',
  topBannerText: '✨ Special Rahu-Ketu Transit Consultations: 25% Off Today with Code VEDIC25',
  topBannerEnabled: true,
  maintenanceMode: false,
  showcaseEnabled: true,
  tarotEnabled: true,
  voiceEnabled: true,
  downloadEnabled: true,
  ratings: {
    score: '4.9/5',
    reviewCount: '85k+ Reviews',
    todayConsultations: '12,500+ Consultations Today',
  },
  chapters: [
    {
      id: 'kundli',
      title: 'Vedic Kundli & Ashta-Koota Matching',
      badge: 'CHAPTER 01',
      description: 'Full 12-house Vedic Lagna and Navamsha charts rendered with arc-second precision.',
      enabled: true,
    },
    {
      id: 'voice',
      title: 'WhatsApp-Style Voice Notes in Chat',
      badge: 'CHAPTER 02',
      description: 'No more tedious typing. Tap and hold the mic to record your voice queries with live animated soundwaves.',
      enabled: true,
    },
    {
      id: 'tarot',
      title: '5-Mode 3D Tarot & ₹99 Yes/No Oracle',
      badge: 'CHAPTER 03',
      description: 'Featuring 5 specialized spread modes with live certainty probability gauges and spoken GuruVani voice synthesis.',
      enabled: true,
    },
    {
      id: 'muhurat',
      title: 'Daily 7:00 AM Shubh Muhurat Alerts',
      badge: 'CHAPTER 04',
      description: 'Start every morning auspiciously. Automated lock-screen notifications alert you to exact Abhijit Muhurat and Rahu Kaal hours.',
      enabled: true,
    },
  ],
  tarotSettings: {
    yesNoPrice: 99,
    audioReadingEnabled: true,
  },
};

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const WebsiteDesk: React.FC = () => {
  const [config, setConfig] = useState<WebsiteConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'chapters' | 'preview'>('content');

  useEffect(() => {
    fetchWebsiteConfigApi().then((data) => {
      if (data) {
        setConfig(data);
      }
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveWebsiteConfigApi(config);
    setIsSaving(false);
    if (res?.success) {
      setSaveSuccess(true);
      setPreviewKey((k) => k + 1); // refresh preview iframe
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleChapterToggle = (index: number) => {
    const updated = [...config.chapters];
    updated[index].enabled = !updated[index].enabled;
    setConfig({ ...config, chapters: updated });
  };

  const handleChapterChange = (index: number, field: string, val: string) => {
    const updated = [...config.chapters];
    (updated[index] as any)[field] = val;
    setConfig({ ...config, chapters: updated });
  };

  const iframeWidth =
    viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '390px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Action Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(129, 140, 248, 0.25)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
          }}>
            🌐
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Website CMS & Live Control
              </h1>
              <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
                🟢 Port 4000 Live
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
              Directly manage hero narratives, GSAP sticky showcase chapters, 3D Tarot settings, and live preview.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="http://localhost:4000/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#EEF2FF',
              fontSize: '12.5px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🚀</span> Open Live Website
          </a>

          <a
            href="http://localhost:4000/sticky"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#FCD34D',
              fontSize: '12.5px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📱</span> Sticky 3D Showcase
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: saveSuccess
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '800',
              cursor: isSaving ? 'wait' : 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{saveSuccess ? '✓' : isSaving ? '⏳' : '💾'}</span>
            <span>{saveSuccess ? 'Published Live!' : isSaving ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Desk View Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('content')}
          style={{
            padding: '9px 18px',
            borderRadius: '12px',
            border: activeTab === 'content' ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: activeTab === 'content' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.6)',
            color: activeTab === 'content' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✍️</span> Hero & Branding CMS
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          style={{
            padding: '9px 18px',
            borderRadius: '12px',
            border: activeTab === 'chapters' ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: activeTab === 'chapters' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.6)',
            color: activeTab === 'chapters' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🪐</span> 4-Chapter Showcase
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '9px 18px',
            borderRadius: '12px',
            border: activeTab === 'preview' ? '1px solid #818CF8' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: activeTab === 'preview' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.6)',
            color: activeTab === 'preview' ? '#FFFFFF' : '#94A3B8',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>👁️</span> Multi-Device Live Preview
        </button>
      </div>

      {/* TAB 1: HERO & BRANDING CMS */}
      {activeTab === 'content' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
          {/* Main Hero Card */}
          <div style={{
            gridColumn: 'span 8',
            padding: '24px',
            borderRadius: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>☀️</span> Hero Section & Value Proposition
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Hero Headline Prefix
                </label>
                <input
                  type="text"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Hero Highlight (Gold Gradient)
                </label>
                <input
                  type="text"
                  value={config.heroHighlight}
                  onChange={(e) => setConfig({ ...config, heroHighlight: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#FCD34D',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                Announcement Badge Text
              </label>
              <input
                type="text"
                value={config.announcementText}
                onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#FCD34D',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                Hero Subtitle Description
              </label>
              <textarea
                rows={3}
                value={config.heroSubtitle}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#CBD5E1',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Social Proof Numbers */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '10px' }}>
                Social Proof & Credibility Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Rating</label>
                  <input
                    type="text"
                    value={config.ratings.score}
                    onChange={(e) => setConfig({ ...config, ratings: { ...config.ratings, score: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.2)',
                      color: '#FCD34D',
                      fontSize: '13px',
                      fontWeight: '700',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Reviews</label>
                  <input
                    type="text"
                    value={config.ratings.reviewCount}
                    onChange={(e) => setConfig({ ...config, ratings: { ...config.ratings, reviewCount: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Daily Traffic</label>
                  <input
                    type="text"
                    value={config.ratings.todayConsultations}
                    onChange={(e) => setConfig({ ...config, ratings: { ...config.ratings, todayConsultations: e.target.value } })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.2)',
                      color: '#34D399',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side Controls: Banner, Maintenance, Tarot */}
          <div style={{
            gridColumn: 'span 4',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Top Announcement Banner Control */}
            <div style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#EEF2FF' }}>
                  📢 Top Banner Alert
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.topBannerEnabled}
                    onChange={(e) => setConfig({ ...config, topBannerEnabled: e.target.checked })}
                  />
                  <span style={{ fontSize: '11px', color: config.topBannerEnabled ? '#34D399' : '#94A3B8', fontWeight: '700' }}>
                    {config.topBannerEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <textarea
                rows={2}
                value={config.topBannerText}
                onChange={(e) => setConfig({ ...config, topBannerText: e.target.value })}
                placeholder="Announcement displayed at top of website..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#CBD5E1',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* Section Toggles */}
            <div style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#EEF2FF' }}>
                🎛️ Feature Module Toggles
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>Sticky 3D Phone Showcase</span>
                  <input
                    type="checkbox"
                    checked={config.showcaseEnabled}
                    onChange={(e) => setConfig({ ...config, showcaseEnabled: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>3D Tarot Oracle Stage</span>
                  <input
                    type="checkbox"
                    checked={config.tarotEnabled}
                    onChange={(e) => setConfig({ ...config, tarotEnabled: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>GuruVani AI Spoken Voice</span>
                  <input
                    type="checkbox"
                    checked={config.voiceEnabled}
                    onChange={(e) => setConfig({ ...config, voiceEnabled: e.target.checked })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>Direct APK Downloads</span>
                  <input
                    type="checkbox"
                    checked={config.downloadEnabled}
                    onChange={(e) => setConfig({ ...config, downloadEnabled: e.target.checked })}
                  />
                </div>
              </div>
            </div>

            {/* Tarot & Pricing Settings */}
            <div style={{
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#FDA4AF' }}>
                🔮 Tarot Reading Fee
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#FCD34D' }}>₹</span>
                <input
                  type="number"
                  value={config.tarotSettings.yesNoPrice}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tarotSettings: { ...config.tarotSettings, yesNoPrice: Number(e.target.value) },
                    })
                  }
                  style={{
                    width: '100px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                />
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Yes/No Instant Oracle</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 4-CHAPTER STICKY SHOWCASE */}
      {activeTab === 'chapters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#FCD34D',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span>💡</span>
            <span>These 4 chapters control the pinned 3D phone scrolling presentation shown on the website at <strong>/sticky</strong>.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
            {config.chapters.map((ch, idx) => (
              <div
                key={ch.id}
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: ch.enabled ? '1px solid rgba(129, 140, 248, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                  opacity: ch.enabled ? 1 : 0.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge-pill badge-indigo" style={{ fontSize: '10px' }}>
                    {ch.badge}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ch.enabled}
                      onChange={() => handleChapterToggle(idx)}
                    />
                    <span style={{ fontSize: '11px', color: ch.enabled ? '#34D399' : '#94A3B8', fontWeight: '700' }}>
                      {ch.enabled ? 'Active in Pin' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '700',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={ch.description}
                    onChange={(e) => handleChapterChange(idx, 'description', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.25)',
                      color: '#CBD5E1',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-DEVICE LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Viewport Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>Device Viewport:</span>
              <button
                onClick={() => setViewport('desktop')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: viewport === 'desktop' ? '1px solid #818CF8' : '1px solid transparent',
                  backgroundColor: viewport === 'desktop' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: viewport === 'desktop' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                🖥️ Desktop (Full)
              </button>
              <button
                onClick={() => setViewport('tablet')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: viewport === 'tablet' ? '1px solid #818CF8' : '1px solid transparent',
                  backgroundColor: viewport === 'tablet' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: viewport === 'tablet' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                📱 Tablet (768px)
              </button>
              <button
                onClick={() => setViewport('mobile')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: viewport === 'mobile' ? '1px solid #818CF8' : '1px solid transparent',
                  backgroundColor: viewport === 'mobile' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: viewport === 'mobile' ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                📲 Mobile (390px)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setPreviewKey((k) => k + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#EEF2FF',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>↻</span> Refresh Preview
              </button>
            </div>
          </div>

          {/* Iframe Device Frame */}
          <div
            style={{
              width: iframeWidth,
              height: '780px',
              borderRadius: viewport === 'desktop' ? '16px' : '36px',
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.8)',
              border: viewport === 'desktop' ? '1px solid rgba(129, 140, 248, 0.3)' : '8px solid #1E293B',
              backgroundColor: '#05070F',
              transition: 'width 0.3s ease',
            }}
          >
            <iframe
              key={previewKey}
              src="http://localhost:4000/"
              title="AstroGuru Live Landing Web Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
