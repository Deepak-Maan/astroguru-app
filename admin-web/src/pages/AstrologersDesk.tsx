import React, { useState } from 'react';
import { AstrologerProfile } from '../types';

interface AstrologersDeskProps {
  astrologers: AstrologerProfile[];
  onToggleDuty: (id: string) => void;
  onUpdateCommission: (id: string, newRate: number) => void;
  onApproveAstro: (id: string) => void;
}

export const AstrologersDesk: React.FC<AstrologersDeskProps> = ({
  astrologers,
  onToggleDuty,
  onUpdateCommission,
  onApproveAstro,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [selectedAstro, setSelectedAstro] = useState<AstrologerProfile | null>(null);

  const filtered = astrologers.filter((a) => {
    if (filter === 'active') return a.status === 'active' && a.onDuty;
    if (filter === 'pending') return a.status === 'pending_verification';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
            Astrologer Verification & Fleet Management
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Verify Vedic degrees, manage consultation tariffs, adjust commission splits, and audit duty status.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: `All (${astrologers.length})` },
            { id: 'active', label: `On Duty (${astrologers.filter((a) => a.onDuty).length})` },
            { id: 'pending', label: `KYC Review (${astrologers.filter((a) => a.status === 'pending_verification').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={filter === tab.id ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Astrologers Table */}
      <div className="liquid-card" style={{ overflow: 'hidden' }}>
        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Acharya Profile</th>
              <th>Specialties</th>
              <th>Rate / min</th>
              <th>Rating & Reviews</th>
              <th>Consults</th>
              <th>Commission Split</th>
              <th>Duty Status</th>
              <th>KYC / Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((astro) => (
              <tr key={astro.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={astro.avatar}
                      alt={astro.name}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(129, 140, 248, 0.4)',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{astro.name}</div>
                      <div style={{ fontSize: '11px', color: '#818CF8' }}>{astro.email} · {astro.experienceYears}y exp</div>
                    </div>
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                    {astro.specialties.map((s, idx) => (
                      <span key={idx} className="badge-pill badge-indigo" style={{ fontSize: '10px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ fontWeight: '800', color: '#FCD34D' }}>
                  ₹{astro.ratePerMin}/min
                </td>

                <td>
                  <div style={{ fontWeight: '700', color: '#FCD34D' }}>
                    {astro.rating} ★
                  </div>
                  <div style={{ fontSize: '11px', color: '#A5B4FC' }}>
                    ({astro.reviewsCount} reviews)
                  </div>
                </td>

                <td style={{ fontWeight: '600' }}>
                  {astro.totalConsultations.toLocaleString()}
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#34D399' }}>
                      {astro.commissionRate}%
                    </span>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      step="5"
                      value={astro.commissionRate}
                      onChange={(e) => onUpdateCommission(astro.id, Number(e.target.value))}
                      style={{ width: '80px', accentColor: '#6366F1', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    Platform gets {100 - astro.commissionRate}%
                  </div>
                </td>

                <td>
                  <button
                    onClick={() => onToggleDuty(astro.id)}
                    className={astro.onDuty ? 'badge-pill badge-emerald' : 'badge-pill badge-indigo'}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {astro.onDuty ? '🟢 Online Duty' : '⚪ Offline'}
                  </button>
                </td>

                <td>
                  {astro.status === 'pending_verification' ? (
                    <button
                      onClick={() => onApproveAstro(astro.id)}
                      className="btn-gold"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      ✓ Approve KYC
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedAstro(astro)}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      Audit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Drawer Modal */}
      {selectedAstro && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 6, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <div className="liquid-card" style={{ width: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
                Acharya Dossier & Credentials
              </h2>
              <button
                onClick={() => setSelectedAstro(null)}
                style={{ background: 'none', border: 'none', color: '#A5B4FC', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px', alignItems: 'center' }}>
              <img
                src={selectedAstro.avatar}
                alt={selectedAstro.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #818CF8' }}
              />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>{selectedAstro.name}</h3>
                <p style={{ fontSize: '12px', color: '#A5B4FC' }}>{selectedAstro.email} · {selectedAstro.phone}</p>
                <div style={{ marginTop: '6px' }}>
                  <span className="badge-pill badge-emerald">Verified Vedic Scholar</span>
                </div>
              </div>
            </div>

            <div className="inset-box" style={{ padding: '16px', marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D' }}>VERIFIED CREDENTIALS:</div>
              <ul style={{ fontSize: '13px', color: '#EEF2FF', marginTop: '8px', paddingLeft: '18px', lineHeight: '22px' }}>
                <li>Aadhaar & PAN Identity Verification: <span style={{ color: '#34D399' }}>Verified ✓</span></li>
                <li>Vedic Jyotish Acharya Degree (Sampurnanand Sanskrit Vishwavidyalaya): <span style={{ color: '#34D399' }}>Verified ✓</span></li>
                <li>Test Audition Audio Quality Score: <span style={{ color: '#34D399' }}>98/100 ✓</span></li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setSelectedAstro(null)} className="btn-primary">
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
