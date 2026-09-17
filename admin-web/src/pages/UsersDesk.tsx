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
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [amount, setAmount] = useState('');
  const [isCredit, setIsCredit] = useState(true);
  const [note, setNote] = useState('Customer support courtesy credit');

  const handleSaveAdjustment = () => {
    if (!selectedUser || !amount) return;
    const delta = Number(amount) * (isCredit ? 1 : -1);
    onAdjustWallet(selectedUser.id, delta, note);
    setSelectedUser(null);
    setAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
            Seeker Vault & Wallet Management
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Inspect client accounts, audit consultation spend, and perform manual wallet credits or dispute debits.
          </p>
        </div>
      </div>

      <div className="liquid-card" style={{ overflow: 'hidden' }}>
        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Seeker Profile</th>
              <th>Phone</th>
              <th>Wallet Balance</th>
              <th>Lifetime Spend</th>
              <th>Kundli Saved</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{u.name}</div>
                  <div style={{ fontSize: '11px', color: '#818CF8' }}>{u.email} · {u.id}</div>
                </td>
                <td style={{ fontFamily: 'monospace' }}>{u.phone}</td>
                <td style={{ fontWeight: '800', color: '#FCD34D' }}>
                  ₹{u.walletBalance.toLocaleString()}
                </td>
                <td style={{ fontWeight: '600', color: '#EEF2FF' }}>
                  ₹{u.totalSpent.toLocaleString()}
                </td>
                <td>
                  {u.kundliCreated ? (
                    <span className="badge-pill badge-emerald">✓ Saved</span>
                  ) : (
                    <span className="badge-pill badge-indigo">None</span>
                  )}
                </td>
                <td>
                  {u.isVip ? (
                    <span className="badge-pill badge-amber">👑 VIP Pass</span>
                  ) : (
                    <span className="badge-pill badge-indigo">Standard</span>
                  )}
                </td>
                <td>
                  <span className={`badge-pill ${u.status === 'active' ? 'badge-emerald' : 'badge-rose'}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="btn-gold"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      💳 Adjust Wallet
                    </button>
                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className={u.status === 'active' ? 'btn-danger' : 'btn-secondary'}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjust Wallet Modal */}
      {selectedUser && (
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
          <div className="liquid-card" style={{ width: '460px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              Manual Wallet Adjustment
            </h2>
            <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
              Target: <strong style={{ color: '#EEF2FF' }}>{selectedUser.name}</strong> ({selectedUser.phone})
            </p>
            <div style={{ fontSize: '13px', color: '#FCD34D', marginTop: '8px' }}>
              Current Balance: ₹{selectedUser.walletBalance}
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
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                AUDIT REASON / SUPPORT NOTE
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for adjustment"
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setSelectedUser(null)} className="btn-secondary">
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
