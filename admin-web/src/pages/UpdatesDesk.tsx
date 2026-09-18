import React, { useState } from 'react';

export const UpdatesDesk: React.FC = () => {
  const [currentRelease, setCurrentRelease] = useState('2.9.6');
  const [minMandatoryVersion, setMinMandatoryVersion] = useState('2.9.0');
  const [isMandatory, setIsMandatory] = useState(false);
  const [apkUrl, setApkUrl] = useState('https://expo.dev/artifacts/eas/eY0X9nAAY9q7HAFZhMJ0rj_JfkMmeysSEdLwn0HHlq8.apk');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
          Mobile App Release & Over-The-Air (OTA) Controller
        </h1>
        <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
          Manage global in-app update policies, force critical security updates, and configure APK download mirrors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Version Settings Form */}
        <div className="liquid-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', marginBottom: '20px' }}>
            Version Control Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                LATEST PUBLIC PRODUCTION VERSION
              </label>
              <input
                type="text"
                value={currentRelease}
                onChange={(e) => setCurrentRelease(e.target.value)}
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                MINIMUM SUPPORTED MANDATORY VERSION
              </label>
              <input
                type="text"
                value={minMandatoryVersion}
                onChange={(e) => setMinMandatoryVersion(e.target.value)}
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Users on versions below this will be blocked until they update.
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'rgba(10, 12, 22, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(129, 140, 248, 0.2)',
            }}>
              <div>
                <div style={{ fontWeight: '700', color: '#EEF2FF', fontSize: '14px' }}>
                  Force Mandatory Update
                </div>
                <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '2px' }}>
                  Prevents users from bypassing the in-app update modal
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#6366F1', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                DIRECT STANDALONE APK CDN DOWNLOAD MIRROR URL
              </label>
              <input
                type="text"
                value={apkUrl}
                onChange={(e) => setApkUrl(e.target.value)}
                className="cosmic-input"
                style={{ marginTop: '6px', fontSize: '12px', fontFamily: 'monospace' }}
              />
            </div>

            <button onClick={handleSave} className="btn-primary" style={{ padding: '12px', justifyContent: 'center' }}>
              {saved ? '✓ Policies Saved & Propagated!' : 'Save & Publish Live Release Policy'}
            </button>
          </div>
        </div>

        {/* Live Status Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="liquid-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#EEF2FF', marginBottom: '14px' }}>
              Current EAS OTA Pipeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#A5B4FC' }}>Branch:</span>{' '}
                <strong style={{ color: '#34D399' }}>preview</strong>
              </div>
              <div>
                <span style={{ color: '#A5B4FC' }}>Runtime:</span>{' '}
                <strong style={{ color: '#EEF2FF' }}>1.0.0</strong>
              </div>
              <div>
                <span style={{ color: '#A5B4FC' }}>Update Group ID:</span>{' '}
                <span style={{ fontFamily: 'monospace', color: '#FCD34D' }}>93f176b9-1cc0-46b7</span>
              </div>
              <div>
                <span style={{ color: '#A5B4FC' }}>Android Update ID:</span>{' '}
                <span style={{ fontFamily: 'monospace', color: '#38BDF8' }}>01a0ade7-5780-7dfe</span>
              </div>
              <div>
                <span style={{ color: '#A5B4FC' }}>Status:</span>{' '}
                <span className="badge-pill badge-emerald">Live & Active</span>
              </div>
            </div>
          </div>

          <div className="liquid-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#EEF2FF', marginBottom: '14px' }}>
              Indus App Store & Play Store Assets
            </h3>
            <div style={{ fontSize: '12.5px', color: '#A5B4FC', lineHeight: '20px' }}>
              • App Name: <strong>AstroGuru</strong><br />
              • Package: <code style={{ color: '#FCD34D' }}>com.deepak00007.astrologerapp</code><br />
              • Official Build Code: <strong>296 (v2.9.6)</strong><br />
              • App Store Icons: 3 Gilded High-Res 512x512 assets generated in brand vault.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
