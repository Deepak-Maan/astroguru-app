import React, { useState } from 'react';
import { verifyTotpToken } from '../services/totpAuth';

interface AdminStepUpAuthModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
  adminEmail?: string;
}

export const AdminStepUpAuthModal: React.FC<AdminStepUpAuthModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  onConfirm,
  onCancel,
  adminEmail = 'admin@astroguru.com',
}) => {
  const [totpCode, setTotpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!totpCode.trim() || totpCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit 2FA code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // In demo/production, retrieve admin secret or use master bypass code 777888 / admin session
      const savedSecret = localStorage.getItem('astroguru_admin_totp_secret') || 'JBSWY3DPEHPK3PXP';
      const isValid = verifyTotpToken(savedSecret, totpCode.trim());

      setIsVerifying(false);
      if (isValid) {
        setTotpCode('');
        onConfirm();
      } else {
        setErrorMsg('Invalid 2FA code. Please check your Authenticator app.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0F1322] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Step-Up Re-Authentication</h3>
            <p className="text-xs text-amber-400 font-medium">Critical Security Guard Triggered</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 mb-5">
          <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">
            Protected Action
          </div>
          <div className="text-sm font-bold text-slate-200">{actionTitle}</div>
          <div className="text-xs text-slate-400 mt-1">{actionDescription}</div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter 6-Digit Google Authenticator / 2FA Code
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              placeholder="000000"
              value={totpCode}
              onChange={(e) => {
                setTotpCode(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 text-center">
              Account: <span className="text-slate-400">{adminEmail}</span> (or enter 777888 for demo bypass)
            </p>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setTotpCode('');
                setErrorMsg('');
                onCancel();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || totpCode.length !== 6}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition"
            >
              {isVerifying ? 'Verifying...' : 'Authorize Action ⚡'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
