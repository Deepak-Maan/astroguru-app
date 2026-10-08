import React, { useState } from 'react';
import { UserRecord } from '../types';

interface UsersDeskProps {
  users: UserRecord[];
  onAdjustWallet: (userId: string, delta: number, note: string) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const UsersDesk: React.FC<UsersDeskProps> = ({
  users,
  onAdjustWallet,
  onToggleUserStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVip, setFilterVip] = useState<'all' | 'vip' | 'standard'>('all');
  const [filterDosha, setFilterDosha] = useState<'all' | 'manglik' | 'sade_sati'>('all');

  // Selected User for Wallet Adjustment Modal
  const [adjustingUser, setAdjustingUser] = useState<UserRecord | null>(null);
  const [amount, setAmount] = useState('');
  const [isCredit, setIsCredit] = useState(true);
  const [note, setNote] = useState('Customer support courtesy credit');

  // Selected User for Deep Kundli & Wallet History Drawer
  const [inspectedUser, setInspectedUser] = useState<UserRecord | null>(null);

  const handleSaveAdjustment = () => {
    if (!adjustingUser || !amount) return;
    const delta = Number(amount) * (isCredit ? 1 : -1);
    onAdjustWallet(adjustingUser.id, delta, note);
    setAdjustingUser(null);
    setAmount('');
  };

  const handleQuickCredit = (user: UserRecord, val: number) => {
    onAdjustWallet(user.id, val, `Quick +₹${val} credit bonus`);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.moonSign || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVip =
      filterVip === 'all' ||
      (filterVip === 'vip' && u.isVip) ||
      (filterVip === 'standard' && !u.isVip);

    const matchesDosha =
      filterDosha === 'all' ||
      (filterDosha === 'manglik' && u.mangalDosha) ||
      (filterDosha === 'sade_sati' && u.sadeSatiActive);

    return matchesSearch && matchesVip && matchesDosha;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
              Seeker Vault & Wallet Management
            </h1>
            <span className="badge-pill badge-indigo">
              App Connected · Kundli & Wallet Ledger
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Inspect seeker Janma Rashi, Kundli doshas, recharge packs (₹100–₹5,000), and perform authorized wallet balance adjustments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="liquid-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>👥</span>
            <div>
              <div style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '700' }}>TOTAL SEEKERS</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>{users.length} Registered</div>
            </div>
          </div>

          <div className="liquid-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>💰</span>
            <div>
              <div style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '700' }}>TOTAL VAULT BALANCE</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#FCD34D' }}>
                ₹{users.reduce((s, u) => s + u.walletBalance, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by seeker name, phone, city, or Janma Rashi..."
            className="cosmic-input"
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>PLAN:</span>
            <button
              onClick={() => setFilterVip('all')}
              className={filterVip === 'all' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              All
            </button>
            <button
              onClick={() => setFilterVip('vip')}
              className={filterVip === 'vip' ? 'btn-gold' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              👑 VIP Only
            </button>
            <button
              onClick={() => setFilterVip('standard')}
              className={filterVip === 'standard' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Standard
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>DOSHA:</span>
            <button
              onClick={() => setFilterDosha('all')}
              className={filterDosha === 'all' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              All
            </button>
            <button
              onClick={() => setFilterDosha('manglik')}
              className={filterDosha === 'manglik' ? 'btn-danger' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              🔴 Manglik
            </button>
            <button
              onClick={() => setFilterDosha('sade_sati')}
              className={filterDosha === 'sade_sati' ? 'btn-gold' : 'btn-secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              🪐 Sade Sati
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="liquid-card table-responsive-wrapper">
        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Seeker Profile</th>
              <th>Vedic Astrology Chart</th>
              <th>Wallet Balance</th>
              <th>Lifetime Spend</th>
              <th>Consults</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  No seekers match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#EEF2FF', fontSize: '13.5px' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#818CF8' }}>{u.phone}</div>
                    {u.city && (
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>📍 {u.city}</div>
                    )}
                  </td>
                  <td>
                    {u.moonSign ? (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#FCD34D' }}>
                          🌙 {u.moonSign}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#A5B4FC' }}>
                          Asc: {u.ascendant || 'Lagna'} · {u.nakshatra || ''}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                          {u.mangalDosha && (
                            <span className="badge-pill badge-rose" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                              Manglik
                            </span>
                          )}
                          {u.sadeSatiActive && (
                            <span className="badge-pill badge-amber" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                              Sade Sati
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="badge-pill badge-slate" style={{ fontSize: '10.5px' }}>
                        No Kundli Saved
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FCD34D', fontSize: '14.5px' }}>
                      ₹{u.walletBalance.toLocaleString()}
                    </div>
                    {u.rechargeHistory && u.rechargeHistory.length > 0 && (
                      <div style={{ fontSize: '10px', color: '#34D399', marginTop: '2px' }}>
                        Last: ₹{u.rechargeHistory[0].amount} ({u.rechargeHistory[0].method})
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#EEF2FF', fontSize: '13.5px' }}>
                      ₹{u.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#38BDF8' }}>
                      {u.consultationsCount || 0} sessions
                    </div>
                  </td>
                  <td>
                    {u.isVip ? (
                      <span className="badge-pill badge-amber" style={{ fontSize: '11px', fontWeight: '800' }}>
                        👑 VIP Pass
                      </span>
                    ) : (
                      <span className="badge-pill badge-indigo" style={{ fontSize: '11px' }}>
                        Standard
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-pill ${u.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setInspectedUser(u)}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '5px 10px' }}
                        title="View Detailed Kundli & Wallet History"
                      >
                        🔍 Details
                      </button>
                      <button
                        onClick={() => {
                          setAdjustingUser(u);
                          setIsCredit(true);
                          setAmount('');
                        }}
                        className="btn-gold"
                        style={{ fontSize: '11px', padding: '5px 10px', fontWeight: '700' }}
                      >
                        💳 Adjust
                      </button>
                      <button
                        onClick={() => onToggleUserStatus(u.id)}
                        className={u.status === 'active' ? 'btn-danger' : 'btn-secondary'}
                        style={{ fontSize: '11px', padding: '5px 8px' }}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: DETAILED KUNDLI & WALLET HISTORY DRAWER */}
      {inspectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 6, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '16px',
        }}>
          <div className="liquid-card responsive-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge-pill badge-indigo" style={{ fontSize: '10px' }}>
                  SEEKER MASTER RECORD
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#EEF2FF', marginTop: '4px' }}>
                  {inspectedUser.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#A5B4FC' }}>
                  {inspectedUser.phone} · {inspectedUser.email}
                </div>
              </div>
              <button onClick={() => setInspectedUser(null)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            {/* Astrological Chart Card */}
            <div style={{
              margin: '18px 0',
              padding: '16px',
              backgroundColor: 'rgba(26, 33, 64, 0.75)',
              border: '1px solid rgba(129, 140, 248, 0.25)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🪐 VEDIC BIRTH CHART (KUNDLI PROFILE)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#94A3B8' }}>Moon Sign (Rashi):</span>{' '}
                  <strong style={{ color: '#FDE68A' }}>{inspectedUser.moonSign || 'Not Computed'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Ascendant (Lagna):</span>{' '}
                  <strong style={{ color: '#EEF2FF' }}>{inspectedUser.ascendant || 'Lagna 01'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Janma Nakshatra:</span>{' '}
                  <strong style={{ color: '#38BDF8' }}>{inspectedUser.nakshatra || 'Rohini'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94A3B8' }}>Birth City:</span>{' '}
                  <strong style={{ color: '#EEF2FF' }}>{inspectedUser.city || 'India'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span className={`badge-pill ${inspectedUser.mangalDosha ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '11px' }}>
                  {inspectedUser.mangalDosha ? '⚠️ Mangal Dosha Detected' : '✓ No Manglik Affliction'}
                </span>
                <span className={`badge-pill ${inspectedUser.sadeSatiActive ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '11px' }}>
                  {inspectedUser.sadeSatiActive ? '🪐 Shani Sade Sati Active' : '✓ Shani Neutral'}
                </span>
              </div>
            </div>

            {/* Wallet & Recharge History */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#A5B4FC', textTransform: 'uppercase' }}>
                  💳 APP WALLET RECHARGE LEDGER
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#FCD34D' }}>
                  Current Balance: ₹{inspectedUser.walletBalance}
                </span>
              </div>

              {inspectedUser.rechargeHistory && inspectedUser.rechargeHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectedUser.rechargeHistory.map((txn) => (
                    <div key={txn.id} style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      border: '1px solid rgba(129, 140, 248, 0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#EEF2FF' }}>
                          ₹{txn.amount} Recharge {txn.bonus > 0 && <span style={{ color: '#34D399' }}>(+₹{txn.bonus} Bonus)</span>}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                          {txn.date} via {txn.method} {txn.utr && `· ${txn.utr}`}
                        </div>
                      </div>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '10px' }}>
                        ✓ Success
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                  No top-ups recorded yet.
                </div>
              )}
            </div>

            {/* Quick Credit Actions */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(129, 140, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[100, 250, 500].map((bonus) => (
                  <button
                    key={bonus}
                    onClick={() => handleQuickCredit(inspectedUser, bonus)}
                    className="btn-gold"
                    style={{ fontSize: '10.5px', padding: '5px 8px' }}
                  >
                    +₹{bonus}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setAdjustingUser(inspectedUser);
                  setInspectedUser(null);
                }}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                Custom Wallet Adjustment ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST WALLET MODAL */}
      {adjustingUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 6, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '16px',
        }}>
          <div className="liquid-card responsive-modal-box" style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              Manual Wallet Adjustment
            </h2>
            <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
              Seeker: <strong style={{ color: '#FDE68A' }}>{adjustingUser.name}</strong> ({adjustingUser.phone})
            </p>
            <div style={{ fontSize: '13px', color: '#FCD34D', marginTop: '8px' }}>
              Current Vault Balance: ₹{adjustingUser.walletBalance}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => setIsCredit(true)}
                className={isCredit ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1 }}
              >
                + Credit Rupees
              </button>
              <button
                onClick={() => setIsCredit(false)}
                className={!isCredit ? 'btn-danger' : 'btn-secondary'}
                style={{ flex: 1 }}
              >
                - Debit Rupees
              </button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                AMOUNT (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
              {/* Quick Amount Pills */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[100, 250, 500, 1000, 2000].map((pack) => (
                  <button
                    key={pack}
                    type="button"
                    onClick={() => setAmount(String(pack))}
                    className="btn-secondary"
                    style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  >
                    ₹{pack}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                AUDIT REASON / SUPPORT NOTE
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Compensation for audio call network jitter"
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setAdjustingUser(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveAdjustment} className="btn-gold">
                Confirm Adjustment ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
