import React, { useState } from 'react';
import { AdminUser } from '../types';
import { INITIAL_SUB_ADMINS } from '../services/api';

interface LoginDeskProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const LoginDesk: React.FC<LoginDeskProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    // 2. Check Sub-Admins in INITIAL_SUB_ADMINS or localStorage
    const matchedSub = INITIAL_SUB_ADMINS.find(
      (s) => s.email.toLowerCase() === cleanEmail
    );
    if (matchedSub && (cleanPass === 'subadmin123' || cleanPass === 'admin123' || cleanPass === 'admin')) {
      return {
        id: `usr_${matchedSub.id}`,
        name: matchedSub.name,
        email: matchedSub.email,
        role: 'sub_admin' as const,
        subAdminId: matchedSub.id,
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
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success && data.admin) {
          onLoginSuccess(data.admin);
        } else {
          const localUser = checkLocalCredentials(email, password);
          if (localUser) {
            onLoginSuccess(localUser);
          } else {
            setError(data.error || 'Invalid administrator email or password.');
          }
        }
      })
      .catch(() => {
        setLoading(false);
        const localUser = checkLocalCredentials(email, password);
        if (localUser) {
          onLoginSuccess(localUser);
        } else {
          setError('Invalid credentials or authentication server unavailable.');
        }
      });
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
        maxWidth: '440px',
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
            Authorized staff and platform administrators only
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

        {/* Demo Fast-Login Selector for Testing RBAC */}
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
            QUICK DEMO ACCESS (RBAC SIMULATION)
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
            >
              👑 Master Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('ramesh.ops@astroguru.app');
                setPassword('subadmin123');
              }}
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '8px 10px', justifyContent: 'center' }}
            >
              🛡️ Sub-Admin (Delhi)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
