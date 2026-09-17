import React, { useState } from 'react';
import { BannedEntity } from '../types';

interface BanHammerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBan: (entity: Omit<BannedEntity, 'id' | 'bannedAt'>) => void;
}

export const BanHammerModal: React.FC<BanHammerModalProps> = ({
  isOpen,
  onClose,
  onConfirmBan,
}) => {
  const [entityType, setEntityType] = useState<'device' | 'phone' | 'user' | 'astrologer'>('device');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('Free-Chat Multi-Account Farming');
  const [duration, setDuration] = useState<BannedEntity['duration']>('Permanent');

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    onConfirmBan({
      entityType,
      identifier: identifier.trim(),
      name: name.trim() || identifier.trim(),
      reason,
      duration,
    });
    onClose();
    setIdentifier('');
    setName('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(4, 6, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    }}>
      <div className="liquid-card" style={{ width: '520px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔨</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              Universal Security Ban Hammer
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#A5B4FC', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '6px' }}>
          Impose an immediate platform-wide block on rogue hardware fingerprints, direct UPI payment bypasses, or abusive accounts.
        </p>

        <form onSubmit={handleExecute} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {/* Target Type Selector */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              SANCTION TARGET TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
              {[
                { id: 'device', label: '📱 Device UUID' },
                { id: 'phone', label: '📞 Phone' },
                { id: 'user', label: '👤 User ID' },
                { id: 'astrologer', label: '🔮 Astrologer' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEntityType(t.id as any)}
                  className={entityType === t.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '11.5px', padding: '6px 8px', justifyContent: 'center' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              TARGET IDENTIFIER (UUID / NUMBER / USER ID)
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. UUID-A781-B110 or +91 98201 00000"
              className="cosmic-input"
              style={{ marginTop: '6px', fontFamily: 'monospace' }}
              required
            />
          </div>

          {/* Entity Name */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              LABEL / ENTITY NAME (OPTIONAL)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rogue Device Farm 3"
              className="cosmic-input"
              style={{ marginTop: '6px' }}
            />
          </div>

          {/* Reason */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              SANCTION REASON
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="cosmic-input"
              style={{ marginTop: '6px' }}
            >
              <option value="Free-Chat Multi-Account Farming">Free-Chat Multi-Account Farming</option>
              <option value="Off-Platform WhatsApp/Call Leak">Off-Platform WhatsApp / Call Leak</option>
              <option value="Direct Payment / UPI Bypass">Direct Payment / UPI Bypass</option>
              <option value="Abusive Language / Harassment">Abusive Language / Harassment</option>
              <option value="Fraudulent Transaction / Chargeback">Fraudulent Transaction / Chargeback</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              SANCTION DURATION
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
              {['24 Hours', '7 Days', '30 Days', 'Permanent'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d as any)}
                  className={duration === d ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '11.5px', padding: '6px 8px', justifyContent: 'center' }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-danger">
              🔨 Enforce Blacklist Ban
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
