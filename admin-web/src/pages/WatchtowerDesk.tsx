import React, { useState } from 'react';
import { BannedEntity, SecurityIncident } from '../types';

interface WatchtowerDeskProps {
  incidents: SecurityIncident[];
  blacklist: BannedEntity[];
  onIssueStrike: (incidentId: string) => void;
  onBanFromIncident: (incident: SecurityIncident) => void;
  onDismissIncident: (incidentId: string) => void;
  onUnban: (entityId: string) => void;
  onOpenBanModal: () => void;
}

export const WatchtowerDesk: React.FC<WatchtowerDeskProps> = ({
  incidents,
  blacklist,
  onIssueStrike,
  onBanFromIncident,
  onDismissIncident,
  onUnban,
  onOpenBanModal,
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'blacklist'>('incidents');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
            Anti-Fraud & Abuse Watchtower Desk
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Real-time interception of multi-account free-chat farming, direct WhatsApp leakage, and UPI bypass attempts.
          </p>
        </div>
        <button onClick={onOpenBanModal} className="btn-danger">
          🔨 Open Universal Ban Hammer
        </button>
      </div>

      {/* 4 Security KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Flagged Interceptions (24h)
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#FB7185', marginTop: '8px' }}>
            {incidents.filter((i) => i.status === 'pending').length} Active
          </div>
          <div style={{ fontSize: '12px', color: '#FB7185', marginTop: '4px' }}>
            Requires admin disposition
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Active Blacklist Ledger
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#FCD34D', marginTop: '8px' }}>
            {blacklist.length} Sanctioned
          </div>
          <div style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '4px' }}>
            Hardware UUIDs & Phone hashes
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Revenue Saved (Est.)
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#34D399', marginTop: '8px' }}>
            ₹48,500
          </div>
          <div style={{ fontSize: '12px', color: '#34D399', marginTop: '4px' }}>
            By-passed consultation value
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Platform Threat Level
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#38BDF8', marginTop: '8px' }}>
            LOW (12/100)
          </div>
          <div style={{ fontSize: '12px', color: '#38BDF8', marginTop: '4px' }}>
            Automated firewall engaged
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(129, 140, 248, 0.2)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('incidents')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '700',
            color: activeTab === 'incidents' ? '#EEF2FF' : '#64748B',
            borderBottom: activeTab === 'incidents' ? '2px solid #6366F1' : 'none',
            cursor: 'pointer',
          }}
        >
          🚨 Live Intercepted Incidents ({incidents.filter((i) => i.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('blacklist')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '700',
            color: activeTab === 'blacklist' ? '#EEF2FF' : '#64748B',
            borderBottom: activeTab === 'blacklist' ? '2px solid #6366F1' : 'none',
            cursor: 'pointer',
          }}
        >
          🔨 Active Blacklist Ledger ({blacklist.length})
        </button>
      </div>

      {/* TAB 1: Live Incidents */}
      {activeTab === 'incidents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {incidents.filter((i) => i.status === 'pending').length === 0 ? (
            <div className="liquid-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '42px' }}>🛡️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#EEF2FF', marginTop: '12px' }}>
                All Clear! No Pending Security Incidents
              </h3>
              <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
                Automated regex filters and multi-accounting sentinels are continuously monitoring consultation traffic.
              </p>
            </div>
          ) : (
            incidents
              .filter((i) => i.status === 'pending')
              .map((inc) => (
                <div key={inc.id} className="liquid-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge-pill ${inc.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                        {inc.severity.toUpperCase()} PRIORITY
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>
                        {inc.type === 'DIRECT_CONTACT_LEAK' && '📵 Off-Platform WhatsApp / Phone Leak'}
                        {inc.type === 'MULTI_ACCOUNT_FREE_CHAT' && '🤖 Multi-Account Free Trial Farming'}
                        {inc.type === 'PAYMENT_BYPASS_UPI' && '💳 Direct UPI Payment Bypass'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        · {inc.timestamp}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onIssueStrike(inc.id)}
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        ⚠️ Issue Strike
                      </button>
                      <button
                        onClick={() => onBanFromIncident(inc)}
                        className="btn-danger"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        🔨 Ban Hardware UUID
                      </button>
                      <button
                        onClick={() => onDismissIncident(inc.id)}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(129, 140, 248, 0.3)',
                          color: '#A5B4FC',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Evidence Box */}
                  <div className="inset-box" style={{ padding: '14px', marginTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D', textTransform: 'uppercase' }}>
                      Flagged Message & Telemetry Evidence:
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#EEF2FF', marginTop: '6px', lineHeight: '20px' }}>
                      {inc.evidence}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '12px', color: '#A5B4FC' }}>
                    <div>
                      <strong style={{ color: '#EEF2FF' }}>Seeker:</strong> {inc.userName} ({inc.userId})
                    </div>
                    {inc.astrologerName && (
                      <div>
                        <strong style={{ color: '#EEF2FF' }}>Acharya:</strong> {inc.astrologerName}
                      </div>
                    )}
                    <div>
                      <strong style={{ color: '#EEF2FF' }}>Hardware Fingerprint:</strong>{' '}
                      <span style={{ fontFamily: 'monospace', color: '#FCD34D' }}>{inc.deviceFingerprint}</span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB 2: Active Blacklist Ledger */}
      {activeTab === 'blacklist' && (
        <div className="liquid-card" style={{ overflow: 'hidden' }}>
          <table className="cosmic-table">
            <thead>
              <tr>
                <th>Target Type</th>
                <th>Target Identifier</th>
                <th>Entity Name</th>
                <th>Sanction Reason</th>
                <th>Banned Date</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blacklist.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="badge-pill badge-indigo">
                      {item.entityType.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#FCD34D', fontWeight: '700' }}>
                    {item.identifier}
                  </td>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td style={{ color: '#FB7185' }}>{item.reason}</td>
                  <td>{item.bannedAt}</td>
                  <td>
                    <span className="badge-pill badge-rose">{item.duration}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => onUnban(item.id)}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      Pardon / Unban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
