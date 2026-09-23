import React, { useState, useEffect } from 'react';
import { AstrologerProfile, LiveConsultationSession } from '../types';

interface LiveDeskProps {
  sessions: LiveConsultationSession[];
  astrologers: AstrologerProfile[];
  onTerminateSession: (sessionId: string, reason: string) => void;
  onUpdateBoost: (astroId: string, isFeatured: boolean, rank: number) => void;
  onIssueStrike: (astroId: string, reason: string) => void;
  onClearStrikes: (astroId: string) => void;
}

export const LiveDesk: React.FC<LiveDeskProps> = ({
  sessions,
  astrologers,
  onTerminateSession,
  onUpdateBoost,
  onIssueStrike,
  onClearStrikes,
}) => {
  // Live duration tick state
  const [sessionTimes, setSessionTimes] = useState<{ [id: string]: number }>({});
  const [terminatingSession, setTerminatingSession] = useState<LiveConsultationSession | null>(null);
  const [terminationReason, setTerminationReason] = useState('WhatsApp/Direct Phone Number Leak');
  const [customReason, setCustomReason] = useState('');

  // Strike modal state
  const [strikeAstro, setStrikeAstro] = useState<AstrologerProfile | null>(null);
  const [strikeReason, setStrikeReason] = useState('Missed 3 consecutive seeker calls (SLA Breach)');

  // Initialize and tick seconds
  useEffect(() => {
    const initial: { [id: string]: number } = {};
    sessions.forEach((s) => {
      initial[s.id] = s.durationSeconds;
    });
    setSessionTimes(initial);

    const interval = setInterval(() => {
      setSessionTimes((prev) => {
        const next = { ...prev };
        sessions.forEach((s) => {
          if (s.status === 'active') {
            next[s.id] = (next[s.id] || s.durationSeconds) + 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const activeConsultingRate = activeSessions.reduce((acc, s) => acc + s.ratePerMin, 0);
  const flaggedCount = activeSessions.filter((s) => s.flaggedReason).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
              Live Consultation Telemetry & Rank Booster
            </h1>
            <span className="badge-pill badge-rose" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#FB7185' }} />
              LIVE TELEMETRY
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Real-time active call/chat duration & bill tracking, emergency kill switch, and mobile home screen ranking priority.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge-pill badge-emerald">
            {activeSessions.length} Active Sessions
          </span>
          <span className="badge-pill badge-indigo">
            ₹{activeConsultingRate}/min Run-Rate
          </span>
        </div>
      </div>

      {/* 3 Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Ongoing Consultations
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#38BDF8', marginTop: '6px' }}>
            {activeSessions.length} Active
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
            {sessions.filter((s) => s.type === 'audio_call').length} Audio · {sessions.filter((s) => s.type === 'chat').length} Chat · {sessions.filter((s) => s.type === 'video_call').length} Video
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Live Platform Revenue Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10B981', marginTop: '6px' }}>
            ₹{activeConsultingRate.toLocaleString('en-IN')}/min
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
            Billing calculated per elapsed second
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
            Flagged Security Interceptions
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: flaggedCount > 0 ? '#FB7185' : '#10B981', marginTop: '6px' }}>
            {flaggedCount} Flagged
          </div>
          <div style={{ fontSize: '12px', color: flaggedCount > 0 ? '#FB7185' : '#94A3B8', marginTop: '4px' }}>
            {flaggedCount > 0 ? 'Urgent: Direct contact leak suspected' : 'All channels within policy guidelines'}
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Consultations Live Monitor */}
      <div className="liquid-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              🔴 Active Consultation Monitor (Live Meter)
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Real-time timer & billing meters. Terminate in 1 click if off-platform solicitations or harassment occur.
            </p>
          </div>
        </div>

        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Channel</th>
              <th>Astrologer</th>
              <th>Seeker (User)</th>
              <th>Rate / min</th>
              <th>Live Timer</th>
              <th>Accrued Bill</th>
              <th>Status / Threat</th>
              <th>Emergency Control</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((ses) => {
              const currentSecs = sessionTimes[ses.id] || ses.durationSeconds;
              const liveBilled = Math.round((currentSecs / 60) * ses.ratePerMin);

              return (
                <tr key={ses.id} style={{ backgroundColor: ses.flaggedReason ? 'rgba(244, 63, 94, 0.08)' : 'transparent' }}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#FCD34D' }}>
                      {ses.id}
                    </span>
                  </td>
                  <td>
                    <span className="badge-pill badge-indigo">
                      {ses.type === 'audio_call' ? '🎙️ Audio' : ses.type === 'video_call' ? '📹 Video' : '💬 Chat'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={ses.astrologerAvatar}
                        alt=""
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: '600', color: '#EEF2FF' }}>{ses.astrologerName}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', color: '#EEF2FF' }}>{ses.userName}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{ses.userPhone}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#EEF2FF' }}>₹{ses.ratePerMin}</span>
                  </td>
                  <td>
                    {ses.status === 'active' ? (
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#34D399',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                      }}>
                        ⏱️ {formatTimer(currentSecs)}
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>Ended ({formatTimer(currentSecs)})</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', color: '#FCD34D', fontSize: '14px' }}>
                      ₹{liveBilled}
                    </span>
                  </td>
                  <td>
                    {ses.status === 'terminated_by_admin' ? (
                      <span className="badge-pill badge-rose">KILLED BY ADMIN</span>
                    ) : ses.flaggedReason ? (
                      <div>
                        <span className="badge-pill badge-rose" style={{ fontSize: '10px' }}>⚠️ SUSPICIOUS</span>
                        <div style={{ fontSize: '10px', color: '#FB7185', maxWidth: '160px', marginTop: '3px' }}>
                          {ses.flaggedReason}
                        </div>
                      </div>
                    ) : (
                      <span className="badge-pill badge-emerald">HEALTHY</span>
                    )}
                  </td>
                  <td>
                    {ses.status === 'active' ? (
                      <button
                        onClick={() => setTerminatingSession(ses)}
                        className="btn-danger"
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        🔴 Kill Switch
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Refund Processed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SECTION 2: Astrologer Fleet Ranking & Boost Manager */}
      <div className="liquid-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              ⭐ Acharya Home Screen Rank Booster & Strike Control
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Pin top Vedic astrologers to the mobile app home screen, assign priority ranking, and monitor duty strikes.
            </p>
          </div>
        </div>

        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Acharya Profile</th>
              <th>Rating & Consults</th>
              <th>Duty Status</th>
              <th>Feature on Home</th>
              <th>Rank Priority</th>
              <th>Strikes Ledger</th>
              <th>Fleet Actions</th>
            </tr>
          </thead>
          <tbody>
            {astrologers.map((astro) => {
              const isBoosted = astro.isFeatured ?? false;
              const currentRank = astro.boostRank ?? 5;
              const strikes = astro.strikesCount ?? 0;

              return (
                <tr key={astro.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={astro.avatar}
                        alt=""
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{astro.name}</div>
                        <div style={{ fontSize: '11px', color: '#A5B4FC' }}>₹{astro.ratePerMin}/min · {astro.specialties[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#FCD34D' }}>★</span>
                      <span style={{ fontWeight: '700', color: '#EEF2FF' }}>{astro.rating}</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>({astro.totalConsultations} consults)</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-pill ${astro.onDuty ? 'badge-emerald' : 'badge-slate'}`}>
                      {astro.onDuty ? '● ON DUTY' : '○ OFF DUTY'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onUpdateBoost(astro.id, !isBoosted, currentRank)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: isBoosted ? '1px solid #10B981' : '1px solid rgba(148, 163, 184, 0.3)',
                        backgroundColor: isBoosted ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: isBoosted ? '#34D399' : '#94A3B8',
                      }}
                    >
                      {isBoosted ? '⭐ FEATURED' : '+ Boost'}
                    </button>
                  </td>
                  <td>
                    <select
                      value={currentRank}
                      onChange={(e) => onUpdateBoost(astro.id, isBoosted, Number(e.target.value))}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#FCD34D',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      <option value={1}>#1 Primary Pin</option>
                      <option value={2}>#2 Top Banner</option>
                      <option value={3}>#3 Recommended</option>
                      <option value={5}>#5 Standard</option>
                      <option value={10}>#10 Low Priority</option>
                    </select>
                  </td>
                  <td>
                    {strikes === 0 ? (
                      <span className="badge-pill badge-emerald">0 Strikes</span>
                    ) : strikes === 1 ? (
                      <span className="badge-pill badge-amber">⚠️ 1 Warning</span>
                    ) : (
                      <div>
                        <span className="badge-pill badge-rose">⛔ {strikes} Strikes</span>
                        <div style={{ fontSize: '10px', color: '#FB7185', marginTop: '2px' }}>Duty Auto-Paused</div>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setStrikeAstro(astro)}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                      >
                        ⚠️ Strike
                      </button>
                      {strikes > 0 && (
                        <button
                          onClick={() => onClearStrikes(astro.id)}
                          style={{
                            fontSize: '11px',
                            padding: '6px 10px',
                            background: 'transparent',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34D399',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Emergency Kill Switch Modal */}
      {terminatingSession && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="liquid-card" style={{ maxWidth: '520px', width: '90%', padding: '28px', border: '1.5px solid rgba(244, 63, 94, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🚨</span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FB7185' }}>
                  Emergency Session Kill Switch
                </h3>
                <p style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Force-terminating {terminatingSession.id} ({terminatingSession.astrologerName} ↔ {terminatingSession.userName})
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)', marginBottom: '18px' }}>
              <p style={{ fontSize: '12px', color: '#FDA4AF', lineHeight: '1.5' }}>
                Executing this action will immediately cut the call/chat socket, fully refund the user's wallet for this session, and record a Critical Security Audit Log.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                Reason for Emergency Disconnect:
              </label>
              <select
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0F172A',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#EEF2FF',
                  fontSize: '13px',
                }}
              >
                <option value="WhatsApp/Direct Phone Number Leak">WhatsApp / Direct Phone Number Solicitation</option>
                <option value="Direct UPI / GPay Payment Bypass">Direct UPI / GPay Offline Payment Bypass</option>
                <option value="Inappropriate / Abusive Language">Inappropriate / Abusive Language</option>
                <option value="Astrologer Silent / Not Responding">Astrologer Silent / Technical Call Freeze</option>
                <option value="Other">Other Custom Rationale</option>
              </select>
            </div>

            {terminationReason === 'Other' && (
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Specify violation details..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    color: '#EEF2FF',
                    fontSize: '13px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setTerminatingSession(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finalReason = terminationReason === 'Other' ? customReason : terminationReason;
                  onTerminateSession(terminatingSession.id, finalReason || 'Violation of terms');
                  setTerminatingSession(null);
                }}
                className="btn-danger"
              >
                Confirm Terminate & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strike Modal */}
      {strikeAstro && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="liquid-card" style={{ maxWidth: '480px', width: '90%', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FCD34D', marginBottom: '8px' }}>
              Issue Duty Strike to {strikeAstro.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
              Current strikes: {strikeAstro.strikesCount ?? 0}. Note: 2+ strikes will automatically toggle duty status to OFF for 2 hours.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                Violation Cause:
              </label>
              <select
                value={strikeReason}
                onChange={(e) => setStrikeReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0F172A',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#EEF2FF',
                  fontSize: '13px',
                }}
              >
                <option value="Missed 3 consecutive seeker calls (SLA Breach)">Missed 3 consecutive seeker calls (SLA Breach)</option>
                <option value="Poor Audio / Echo Background Noise">Poor Audio / Constant Background Noise</option>
                <option value="Inaccurate / Rushed Horoscope Analysis">Inaccurate / Rushed Horoscope Analysis</option>
                <option value="Late Joining Scheduled Consultation">Late Joining Scheduled Consultation</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setStrikeAstro(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  onIssueStrike(strikeAstro.id, strikeReason);
                  setStrikeAstro(null);
                }}
                className="btn-primary"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Record Strike
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
