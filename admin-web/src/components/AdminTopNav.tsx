import React, { useState, useEffect } from 'react';

interface AdminTopNavProps {
  onOpenBanModal: () => void;
  onSendDutyAlert: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onOpenBanModal,
  onSendDutyAlert,
  searchQuery,
  onSearchChange,
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
    <header style={{
      height: '70px',
      backgroundColor: 'rgba(15, 19, 39, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(129, 140, 248, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '15px',
          color: '#818CF8',
        }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Search user ID, phone, device UUID, UPI ID, or astrologer..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="cosmic-input"
          style={{ paddingLeft: '40px', fontSize: '13px' }}
        />
      </div>

      {/* System Health Status Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(10, 12, 22, 0.65)',
          border: '1px solid rgba(129, 140, 248, 0.25)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '11px',
          fontWeight: '700',
        }}>
          <span className="pulse-dot" style={{ backgroundColor: '#10B981', color: '#10B981' }} />
          <span style={{ color: '#EEF2FF' }}>Backend API :5000</span>
          <span style={{ color: '#64748B' }}>·</span>
          <span style={{ color: '#34D399' }}>Live</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(10, 12, 22, 0.65)',
          border: '1px solid rgba(129, 140, 248, 0.25)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '11px',
          fontWeight: '700',
        }}>
          <span style={{ color: '#FCD34D' }}>⚡ EAS OTA</span>
          <span style={{ color: '#EEF2FF' }}>v3.0.0</span>
        </div>

        {/* Real-time Clock */}
        <div style={{
          fontSize: '12px',
          color: '#A5B4FC',
          fontWeight: '600',
          fontVariantNumeric: 'tabular-nums',
          minWidth: '95px',
        }}>
          🕒 {timeStr}
        </div>

        {/* View Live Website Button */}
        <a
          href={typeof window !== 'undefined' && window.location.port === '3000' ? `http://${window.location.hostname}:4000` : '/'}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '7px 12px',
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
          <span>Live Website</span>
        </a>

        {/* Quick Operational Actions */}
        <button
          onClick={onSendDutyAlert}
          className="btn-gold"
          style={{ fontSize: '12.5px', padding: '7px 14px' }}
          title="Notify off-duty astrologers with +25% surge bonus"
        >
          <span>🚀</span>
          <span>Surge Broadcast</span>
        </button>

        <button
          onClick={onOpenBanModal}
          className="btn-danger"
          style={{ fontSize: '12.5px', padding: '7px 14px' }}
          title="Sanction bad actors, multi-account burner UUIDs, or UPI leak bypasses"
        >
          <span>🔨</span>
          <span>Universal Ban</span>
        </button>
      </div>
    </header>
  );
};
