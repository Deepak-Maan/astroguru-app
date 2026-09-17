import React, { useState } from 'react';

export const BroadcastDesk: React.FC = () => {
  const [title, setTitle] = useState('✨ Rare Jupiter Transit Alert: Check Your Kundli!');
  const [body, setBody] = useState('Jupiter shifts houses tonight! Auspicious career & wealth yogas are activating for your Rashi. Tap to read your personalized transit forecast.');
  const [segment, setSegment] = useState('all');
  const [targetLink, setTargetLink] = useState('/(tabs)/kundli');
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
          Broadcast & Push Notification Hub
        </h1>
        <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
          Compose engaging mobile push notifications with live lockscreen rendering and targeted audience segmentation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Composer Form */}
        <div className="liquid-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', marginBottom: '20px' }}>
            Push Campaign Composer
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                TARGET AUDIENCE SEGMENT
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              >
                <option value="all">🌍 All Registered Seekers (45,280 Devices)</option>
                <option value="vip">👑 VIP Pass Members (1,840 High-Value Seekers)</option>
                <option value="inactive">💤 Inactive Seekers &gt; 14 Days (12,190 Devices)</option>
                <option value="acharyas">🔮 Astrologers Fleet Only (45 Acharyas)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                NOTIFICATION TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catchy headline with emoji"
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                MESSAGE BODY COPY
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter notification copy..."
                className="cosmic-input"
                rows={4}
                style={{ marginTop: '6px', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                DEEP LINK DESTINATION ROUTE
              </label>
              <select
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              >
                <option value="/(tabs)/kundli">🪐 Birth Chart & Kundli Screen</option>
                <option value="/(tabs)/horoscope">☀️ Daily Horoscope & Directives</option>
                <option value="/puja">🪔 Sacred Temple E-Puja Hub</option>
                <option value="/(tabs)/consult">💬 Astrologer Consultation Grid</option>
                <option value="/wallet">💰 Wallet Recharge Offers</option>
              </select>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                onClick={handleDispatch}
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {dispatched ? '✅ Campaign Dispatched Successfully!' : '🚀 Send Push Broadcast to Fleet'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Device Preview */}
        <div className="liquid-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', marginBottom: '16px', alignSelf: 'flex-start' }}>
            Live Device Preview
          </h2>

          <div style={{
            width: '280px',
            height: '460px',
            backgroundColor: '#0F121F',
            borderRadius: '36px',
            border: '8px solid #222B48',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            padding: '20px 14px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Notch */}
            <div style={{
              width: '100px',
              height: '18px',
              backgroundColor: '#222B48',
              borderRadius: '0 0 12px 12px',
              margin: '-20px auto 16px auto',
            }} />

            {/* Lockscreen Clock */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '-1px' }}>
                08:45
              </div>
              <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '-4px' }}>
                Wednesday, September 17
              </div>
            </div>

            {/* Notification Bubble */}
            <div style={{
              marginTop: '36px',
              backgroundColor: 'rgba(26, 33, 64, 0.94)',
              border: '1px solid rgba(129, 140, 248, 0.5)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px' }}>🔮</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D' }}>ASTROGURU</span>
                <span style={{ fontSize: '10px', color: '#64748B', marginLeft: 'auto' }}>now</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', lineHeight: '16px' }}>
                {title}
              </div>
              <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px', lineHeight: '15px' }}>
                {body}
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', fontSize: '10px', color: '#64748B' }}>
              Swipe up to open deep link
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
