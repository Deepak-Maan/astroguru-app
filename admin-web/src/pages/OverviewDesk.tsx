import React from 'react';

interface OverviewDeskProps {
  onSendDutyAlert: () => void;
  dutyAlertSent: boolean;
}

export const OverviewDesk: React.FC<OverviewDeskProps> = ({
  onSendDutyAlert,
  dutyAlertSent,
}) => {
  // 24-Hour Consultation Volume Curve
  const hourlyData = [
    { hour: '00:00', consults: 210 },
    { hour: '02:00', consults: 95 },
    { hour: '04:00', consults: 40 },
    { hour: '06:00', consults: 110 },
    { hour: '08:00', consults: 380 },
    { hour: '10:00', consults: 640 },
    { hour: '12:00', consults: 820 },
    { hour: '14:00', consults: 710 },
    { hour: '16:00', consults: 890 },
    { hour: '18:00', consults: 1120 },
    { hour: '20:00', consults: 1480, isPeak: true },
    { hour: '21:00', consults: 1590, isPeak: true },
    { hour: '22:00', consults: 1620, isPeak: true },
    { hour: '23:00', consults: 1340, isPeak: true },
  ];

  const maxVolume = 1700;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '0.2px' }}>
            Executive Business Intelligence & Traffic Heatmap
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Real-time consultation demand, astrologer supply equilibrium, and platform financial metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge-pill badge-emerald">
            <span className="pulse-dot" style={{ backgroundColor: '#10B981', color: '#10B981' }} />
            Telemetry Live Sync
          </span>
          <span className="badge-pill badge-indigo">
            Updated 12s ago
          </span>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '18px',
      }}>
        {/* KPI 1 */}
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              Today's Gross Revenue
            </span>
            <span style={{ fontSize: '20px' }}>💰</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#FCD34D', marginTop: '10px' }}>
            ₹1,84,520
          </div>
          <div style={{ fontSize: '12px', color: '#34D399', fontWeight: '600', marginTop: '6px' }}>
            ↑ +18.4% vs same day last week
          </div>
        </div>

        {/* KPI 2 */}
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              Live Consultations
            </span>
            <span style={{ fontSize: '20px' }}>💬</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#EEF2FF', marginTop: '10px' }}>
            38 Active
          </div>
          <div style={{ fontSize: '12px', color: '#818CF8', fontWeight: '600', marginTop: '6px' }}>
            24 Chat · 14 Audio Calls
          </div>
        </div>

        {/* KPI 3 */}
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              Acharyas on Duty
            </span>
            <span style={{ fontSize: '20px' }}>🔮</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#34D399', marginTop: '10px' }}>
            28 / 45
          </div>
          <div style={{ fontSize: '12px', color: '#A5B4FC', fontWeight: '600', marginTop: '6px' }}>
            62% Fleet Utilization
          </div>
        </div>

        {/* KPI 4 */}
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              Waiting Seeker Queue
            </span>
            <span style={{ fontSize: '20px' }}>⏳</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#FB7185', marginTop: '10px' }}>
            41 Seekers
          </div>
          <div style={{ fontSize: '12px', color: '#FB7185', fontWeight: '600', marginTop: '6px' }}>
            Average wait: 3m 40s
          </div>
        </div>
      </div>

      {/* Peak Surge Warning & 1-Click Broadcast Banner */}
      <div className="liquid-card" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.12) 100%)',
        borderColor: 'rgba(245, 158, 11, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '32px',
            backgroundColor: 'rgba(245, 158, 11, 0.25)',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(252, 211, 77, 0.5)',
          }}>
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FCD34D' }}>
                Astrologer Supply Deficit Warning
              </h3>
              <span className="badge-pill badge-rose" style={{ fontSize: '10px' }}>
                DEFICIT: -22 ACHARYAS
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#EEF2FF', marginTop: '4px' }}>
              Customer queue exceeds on-duty astrologer capacity by 41 seekers. Estimated revenue loss: ₹34,200/hr.
            </p>
          </div>
        </div>

        <button
          onClick={onSendDutyAlert}
          className="btn-gold"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          {dutyAlertSent ? '✅ Surge Alert Dispatched!' : '🚀 Broadcast Peak Duty Alert (+25% Surge Bonus)'}
        </button>
      </div>

      {/* 24-Hour Consultation Traffic Heatmap */}
      <div className="liquid-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>
              24-Hour Consultation Traffic Heatmap
            </h2>
            <p style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '2px' }}>
              Hourly consultation volume across India Standard Time (IST). Gold bars highlight the 8:00 PM – 12:30 AM surge window.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EEF2FF' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#6366F1', display: 'inline-block' }} />
              Regular Traffic
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FCD34D' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F59E0B', display: 'inline-block' }} />
              Peak Traffic Surge (8 PM - 12 AM)
            </span>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '220px',
          gap: '16px',
          padding: '10px 0',
          borderBottom: '1px solid rgba(129, 140, 248, 0.2)',
        }}>
          {hourlyData.map((d, i) => {
            const heightPct = Math.round((d.consults / maxVolume) * 100);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: d.isPeak ? '#FCD34D' : '#A5B4FC',
                }}>
                  {d.consults}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    backgroundColor: d.isPeak ? '#F59E0B' : '#6366F1',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: d.isPeak
                      ? '0 0 16px rgba(245, 158, 11, 0.45)'
                      : '0 0 8px rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.2s ease',
                  }}
                  title={`${d.hour}: ${d.consults} consultations`}
                />
                <div style={{
                  fontSize: '11px',
                  color: '#64748B',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}>
                  {d.hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Revenue Breakdown & Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Category Share */}
        <div className="liquid-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', marginBottom: '16px' }}>
            Category Revenue Distribution
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { category: 'Vedic Kundli Consultations', pct: 42, revenue: '₹77,498', color: '#6366F1' },
              { category: 'Tarot & Intuitive Reading', pct: 26, revenue: '₹47,975', color: '#EC4899' },
              { category: 'Love & Marriage Compatibility', pct: 18, revenue: '₹33,213', color: '#38BDF8' },
              { category: 'AstroMall Consecrated Remedies & E-Puja', pct: 14, revenue: '₹25,834', color: '#F59E0B' },
            ].map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#EEF2FF' }}>{cat.category}</span>
                  <span style={{ fontWeight: '700', color: '#FCD34D' }}>{cat.revenue} ({cat.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(10, 12, 22, 0.6)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.pct}%`, height: '100%', backgroundColor: cat.color, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Scorecard Leaderboard */}
        <div className="liquid-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF', marginBottom: '16px' }}>
            Acharya Quality Scorecard Leaderboard
          </h2>
          <table className="cosmic-table">
            <thead>
              <tr>
                <th>Acharya</th>
                <th>Consults</th>
                <th>Rating</th>
                <th>Repeat Rate</th>
                <th>Strikes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Acharya Dev Sharma', consults: '8,520', rating: '4.97★', repeat: '92%', strikes: 0 },
                { name: 'Dr. Radhika Veda', consults: '4,310', rating: '4.88★', repeat: '88%', strikes: 0 },
                { name: 'Pt. Rameshwar Shastri', consults: '11,400', rating: '4.95★', repeat: '94%', strikes: 0 },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700' }}>{row.name}</td>
                  <td>{row.consults}</td>
                  <td style={{ color: '#FCD34D', fontWeight: '700' }}>{row.rating}</td>
                  <td style={{ color: '#34D399', fontWeight: '700' }}>{row.repeat}</td>
                  <td>
                    <span className="badge-pill badge-emerald">0 Clean</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
