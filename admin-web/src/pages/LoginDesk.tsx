import React, { useState } from 'react';
import { AdminUser, SubAdminProfile } from '../types';
import { INITIAL_SUB_ADMINS, clearSubAdminFeeAtLoginApi } from '../services/api';

interface LoginDeskProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const LoginDesk: React.FC<LoginDeskProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ₹599 Fee Clearance Gate State
  const [pendingFeeSubAdmin, setPendingFeeSubAdmin] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    assignedRegion?: string;
    joiningFeeAmount: number;
    upiId?: string;
  } | null>(null);

  const [paymentUtr, setPaymentUtr] = useState('');
  const [isClearingFee, setIsClearingFee] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const checkLocalCredentials = (testEmail: string, testPass: string) => {
    const cleanEmail = testEmail.trim().toLowerCase();
    const cleanPass = testPass.trim();

    // 1. Check Super Admin
    if (cleanEmail === 'admin@astroguru.app' && (cleanPass === 'admin123' || cleanPass === 'admin')) {
      return {
        id: 'usr_admin_1',
        name: 'Master Admin',
        email: 'admin@astroguru.app',
        role: 'super_admin' as const,
      };
    }

    // 2. Check Sub-Admins in INITIAL_SUB_ADMINS
    const matchedSub = INITIAL_SUB_ADMINS.find(
      (s) => s.email.toLowerCase() === cleanEmail
    );
    if (matchedSub && (cleanPass === 'subadmin123' || cleanPass === 'admin123' || cleanPass === 'admin')) {
      // Check joining fee
      if (matchedSub.joiningFeeStatus === 'pending' || matchedSub.status === 'pending_approval') {
        setPendingFeeSubAdmin({
          id: matchedSub.id,
          name: matchedSub.name,
          email: matchedSub.email,
          phone: matchedSub.phone,
          assignedRegion: matchedSub.assignedRegion,
          joiningFeeAmount: 599,
          upiId: 'astroguru.business@axisbank',
        });
        return 'FEE_PENDING';
      }

      return {
        id: `usr_${matchedSub.id}`,
        name: matchedSub.name,
        email: matchedSub.email,
        phone: matchedSub.phone,
        avatar: matchedSub.avatar,
        role: 'sub_admin' as const,
        subAdminId: matchedSub.id,
        assignedRegion: matchedSub.assignedRegion,
        licenseId: matchedSub.licenseId || matchedSub.id,
        permissions: matchedSub.permissions,
      };
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    // Verify credentials with backend API
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    })
      .then(async (res) => {
        let data: any = null;
        try {
          data = await res.json();
        } catch (_) {
          data = null;
        }
        setLoading(false);

        if (data && (res.status === 402 || data.error === 'FEE_PENDING')) {
          // Open mandatory ₹599 Fee Clearance Gate
          setPendingFeeSubAdmin(data.subAdmin || {
            id: 'subadmin_1003',
            name: 'Amitabh Verma',
            email: email.trim(),
            assignedRegion: 'Uttar Pradesh & Bihar Zone',
            joiningFeeAmount: 599,
            upiId: 'astroguru.business@axisbank',
          });
          return;
        }

        if (data && data.success && data.admin) {
          onLoginSuccess(data.admin);
        } else {
          const localUser = checkLocalCredentials(email, password);
          if (localUser === 'FEE_PENDING') {
            // Handled in checkLocalCredentials
            return;
          }
          if (localUser) {
            onLoginSuccess(localUser as AdminUser);
          } else {
            setError(data?.error || data?.message || 'Invalid administrator email or password.');
          }
        }
      })
      .catch(() => {
        setLoading(false);
        const localUser = checkLocalCredentials(email, password);
        if (localUser === 'FEE_PENDING') {
          return;
        }
        if (localUser) {
          onLoginSuccess(localUser as AdminUser);
        } else {
          setError('Invalid credentials or authentication server unavailable.');
        }
      });
  };

  const handleClearFeeAndUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFeeSubAdmin) return;
    const cleanUtr = paymentUtr.trim();
    if (!cleanUtr) {
      setFeeError('Please provide the 12-digit UPI Reference / UTR Number.');
      return;
    }

    setIsClearingFee(true);
    setFeeError(null);

    try {
      const res = await clearSubAdminFeeAtLoginApi(
        pendingFeeSubAdmin.id || pendingFeeSubAdmin.email,
        cleanUtr
      );
      setIsClearingFee(false);

      if (res.success && res.admin) {
        setPendingFeeSubAdmin(null);
        onLoginSuccess(res.admin);
      } else {
        setFeeError(res.error || 'Fee verification failed. Please check UTR and retry.');
      }
    } catch (_) {
      setIsClearingFee(false);
      setFeeError('Payment verification gateway temporarily offline. Please try again.');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('astroguru.business@axisbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div className="liquid-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* Glow Logo */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '34px',
          boxShadow: '0 0 28px rgba(99, 102, 241, 0.6)',
        }}>
          🔮
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="badge-pill badge-indigo" style={{ marginBottom: '8px' }}>
            ENTERPRISE DESKTOP CONSOLE
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#EEF2FF' }}>
            AstroGuru Admin Portal
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Master Admin & Sub-Admin Franchise Switchboard
          </p>
        </div>

        {error && (
          <div style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '10px',
            color: '#FB7185',
            fontSize: '12.5px',
            fontWeight: '600',
            textAlign: 'center',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              ADMINISTRATOR EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@astroguru.app"
              className="cosmic-input"
              style={{ marginTop: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="cosmic-input"
              style={{ marginTop: '6px' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Authenticating…' : 'Sign In to Console ⚡'}
          </button>
        </form>

        {/* Demo Fast-Login Selector for Testing RBAC & ₹599 Gate */}
        <div style={{
          width: '100%',
          marginTop: '6px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(129, 140, 248, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textAlign: 'center', letterSpacing: '0.5px' }}>
            QUICK ROLE DEMO & RBAC TESTING
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@astroguru.app');
                setPassword('admin123');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px 10px', justifyContent: 'center' }}
              title="Full Master Root Authority"
            >
              👑 Master Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('rohan.ops@astroguru.app');
                setPassword('subadmin123');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px 10px', justifyContent: 'center' }}
              title="Active Sub-Admin (₹599 Paid)"
            >
              🛡️ Sub-Admin (Delhi)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('priya.support@astroguru.app');
                setPassword('subadmin123');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px 10px', justifyContent: 'center' }}
              title="Support & Broadcast Sub-Admin"
            >
              🛡️ Sub-Admin (Gujarat)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('amitabh.verma@gmail.com');
                setPassword('subadmin123');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px 10px', justifyContent: 'center', borderColor: '#F59E0B', color: '#FCD34D' }}
              title="Triggers Mandatory ₹599 Joining Fee Gate"
            >
              ⏳ Amitabh (Fee Pending)
            </button>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* MODAL: MANDATORY ₹599 SUB-ADMIN FRANCHISE CLEARANCE GATE               */}
      {/* ===================================================================== */}
      {pendingFeeSubAdmin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 20, 0.94)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px',
        }}>
          <div className="liquid-card" style={{
            width: '100%',
            maxWidth: '520px',
            border: '2px solid rgba(245, 158, 11, 0.6)',
            boxShadow: '0 0 50px rgba(245, 158, 11, 0.25)',
            padding: '32px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Close / Return */}
            <button
              onClick={() => {
                setPendingFeeSubAdmin(null);
                setFeeError(null);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Header Badge */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div className="badge-pill badge-amber" style={{ display: 'inline-flex', marginBottom: '8px' }}>
                FRANCHISE PARTNER ONBOARDING GATE
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FCD34D' }}>
                Mandatory License Fee Clearance
              </h2>
              <p style={{ fontSize: '12.5px', color: '#E2E8F0', marginTop: '4px' }}>
                Welcome, <strong style={{ color: '#FDE68A' }}>{pendingFeeSubAdmin.name}</strong>! Your franchise territory for <strong style={{ color: '#FDE68A' }}>{pendingFeeSubAdmin.assignedRegion || 'Assigned Zone'}</strong> is reserved.
              </p>
            </div>

            {/* Price Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                ONE-TIME FRANCHISE OPERATING LICENSE
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#FDE68A', margin: '4px 0' }}>
                ₹599 <span style={{ fontSize: '13px', fontWeight: '600', color: '#94A3B8' }}>/ Annual License</span>
              </div>
              <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
                Includes 18-Point Granular RBAC, Regional Seeker Control & Official Gilded License
              </div>
            </div>

            {/* UPI Payment Instructions Card */}
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#A5B4FC' }}>
                  ASTROGURU MERCHANT UPI ID
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  {copiedUpi ? '✓ Copied!' : '📋 Copy UPI ID'}
                </button>
              </div>

              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: '700',
                color: '#38BDF8',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                textAlign: 'center',
              }}>
                astroguru.business@axisbank
              </div>

              {/* Simulated QR Code Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginTop: '12px',
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                  📱
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#EEF2FF' }}>
                    Pay via Any UPI App
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Open GPay, PhonePe, Paytm, or BHIM. Pay ₹599 to the merchant ID and enter the 12-digit transaction UTR below.
                  </div>
                </div>
              </div>
            </div>

            {feeError && (
              <div style={{
                marginBottom: '14px',
                padding: '10px 14px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: '8px',
                color: '#FB7185',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                ⚠️ {feeError}
              </div>
            )}

            {/* UTR Verification Form */}
            <form onSubmit={handleClearFeeAndUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D' }}>
                  UPI TRANSACTION REFERENCE / UTR NUMBER (12 DIGITS)
                </label>
                <input
                  type="text"
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  placeholder="e.g. UPI/8920192831/AXIS or 429182910291"
                  className="cosmic-input"
                  style={{ marginTop: '6px', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentUtr(`UPI/${Date.now().toString().slice(-8)}/AXIS`)}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 10px' }}
                >
                  ⚡ Auto-Fill Demo UTR
                </button>
              </div>

              <button
                type="submit"
                disabled={isClearingFee}
                className="btn-gold"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  marginTop: '6px',
                }}
              >
                {isClearingFee ? 'Verifying with NPCI & Activating…' : 'Verify ₹599 & Enter Console Now 🚀'}
              </button>

              <button
                type="button"
                onClick={() => setPendingFeeSubAdmin(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px',
                  textDecoration: 'underline',
                }}
              >
                Cancel and return to login screen
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

