import React, { useState, useEffect } from 'react';

interface AdminTopNavProps {
  onOpenBanModal: () => void;
  onSendDutyAlert: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onOpenBanModal,
  onSendDutyAlert,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-nav-container">
      {/* Left Area: Mobile Menu Toggle + Mobile Brand Pill + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Hamburger Menu Toggle (Visible on screens < 1024px) */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="mobile-hamburger-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              backgroundColor: 'rgba(26, 33, 64, 0.8)',
              color: '#EEF2FF',
              fontSize: '18px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        )}

        {/* Global Search Bar */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '380px', minWidth: '130px' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            color: '#818CF8',
            pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search seeker, phone, UUID, astro..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="cosmic-input"
            style={{
              paddingLeft: '34px',
              fontSize: '12.5px',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          />
        </div>
      </div>

      {/* Right Area: System Status, Live Time, Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Live Backend Pill */}
        <div
          className="top-nav-pill-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(10, 12, 22, 0.65)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            borderRadius: '999px',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: '700',
          }}
        >
          <span className="pulse-dot" style={{ backgroundColor: '#10B981', color: '#10B981' }} />
          <span style={{ color: '#EEF2FF' }}>:5000</span>
          <span style={{ color: '#34D399' }}>Live</span>
        </div>

        {/* Real-time Clock */}
        <div
          className="top-nav-pill-secondary"
          style={{
            fontSize: '11.5px',
            color: '#A5B4FC',
            fontWeight: '600',
            fontVariantNumeric: 'tabular-nums',
            padding: '5px 10px',
            background: 'rgba(10, 12, 22, 0.45)',
            borderRadius: '8px',
            border: '1px solid rgba(129, 140, 248, 0.15)',
          }}
        >
          🕒 {timeStr}
        </div>

        {/* Live Website Button */}
        <a
          href={typeof window !== 'undefined' && window.location.port === '3000' ? `http://${window.location.hostname}:4000` : '/'}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '6px 12px',
            textDecoration: 'none',
            color: '#EEF2FF',
            borderRadius: '10px',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            background: 'rgba(30, 41, 75, 0.5)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Open live public landing website in a new tab"
        >
          <span>🌐</span>
          <span className="top-nav-action-label">Website</span>
        </a>

        {/* Quick Operational Actions */}
        <button
          onClick={onSendDutyAlert}
          className="btn-gold"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          title="Notify off-duty astrologers with +25% surge bonus"
        >
          <span>🚀</span>
          <span className="top-nav-action-label">Surge Alert</span>
        </button>

        <button
          onClick={onOpenBanModal}
          className="btn-danger"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          title="Sanction bad actors, multi-account burner UUIDs, or UPI leak bypasses"
        >
          <span>🔨</span>
          <span className="top-nav-action-label">Universal Ban</span>
        </button>
      </div>
    </header>
  );
};
