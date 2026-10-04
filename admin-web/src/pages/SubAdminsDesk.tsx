import React, { useState, useMemo } from 'react';
import { SubAdminProfile, SubAdminPermissions } from '../types';
import { DEFAULT_SUBADMIN_PERMISSIONS } from '../services/api';

interface SubAdminsDeskProps {
  subAdmins: SubAdminProfile[];
  onUpdatePermissions: (id: string, permissions: SubAdminPermissions) => void;
  onToggleStatus: (id: string) => void;
  onCreateSubAdmin: (subAdmin: SubAdminProfile) => void;
  onVerifyFee: (id: string, transactionRef: string) => void;
}

export const SubAdminsDesk: React.FC<SubAdminsDeskProps> = ({
  subAdmins,
  onUpdatePermissions,
  onToggleStatus,
  onCreateSubAdmin,
  onVerifyFee,
}) => {
  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');

  // Modals & Drawers
  const [selectedSubAdminForPerms, setSelectedSubAdminForPerms] = useState<SubAdminProfile | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<SubAdminPermissions | null>(null);
  const [selectedSubAdminForCert, setSelectedSubAdminForCert] = useState<SubAdminProfile | null>(null);

  // New Sub-Admin Onboarding Modal
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newId, setNewId] = useState(() => `subadmin_${1000 + subAdmins.length + 1}`);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRegion, setNewRegion] = useState('Delhi-NCR & North Zone');
  const [newFeeMode, setNewFeeMode] = useState<'UPI' | 'Razorpay' | 'Bank Transfer' | 'Cash / Offline'>('UPI');
  const [newTxnRef, setNewTxnRef] = useState('');
  const [newFeeStatus, setNewFeeStatus] = useState<'paid' | 'pending'>('paid');
  const [newCommissionRate, setNewCommissionRate] = useState(5);
  const [createdSuccessSubAdmin, setCreatedSuccessSubAdmin] = useState<SubAdminProfile | null>(null);

  // Transient copy feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Open Onboard Modal
  const handleOpenOnboardModal = () => {
    setNewId(`subadmin_${1000 + subAdmins.length + 1}`);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRegion('Delhi-NCR & North Zone');
    setNewFeeMode('UPI');
    setNewTxnRef(`UPI/${Date.now().toString().slice(-8)}/AXIS`);
    setNewFeeStatus('paid');
    setNewCommissionRate(5);
    setCreatedSuccessSubAdmin(null);
    setIsOnboardModalOpen(true);
  };

  // Submit New Sub-Admin
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = newId.trim() || `subadmin_${Date.now()}`;
    const cleanName = newName.trim() || 'Sub-Admin Partner';
    const cleanEmail = newEmail.trim() || `${finalId}@astroguru.app`;
    const cleanPhone = newPhone.trim() || '+91 98765 00000';

    const newSubAdmin: SubAdminProfile = {
      id: finalId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4F46E5&color=fff&size=200`,
      role: 'sub_admin',
      assignedRegion: newRegion,
      joiningFeeStatus: newFeeStatus,
      joiningFeeAmount: 599,
      transactionRef: newFeeStatus === 'paid' ? newTxnRef.trim() || `TXN-MANUAL-${Date.now()}` : undefined,
      paymentMode: newFeeMode,
      licensedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: newFeeStatus === 'paid' ? 'active' : 'pending_approval',
      permissions: { ...DEFAULT_SUBADMIN_PERMISSIONS },
      totalRevenueManaged: 0,
      subAdminCommissionRate: newCommissionRate,
      totalEarningsWithdrawn: 0,
    };

    onCreateSubAdmin(newSubAdmin);
    setCreatedSuccessSubAdmin(newSubAdmin);
  };

  // Open Permissions Drawer for Sub-Admin
  const handleOpenPermissionsDrawer = (sa: SubAdminProfile) => {
    setSelectedSubAdminForPerms(sa);
    setEditingPermissions({ ...sa.permissions });
  };

  // Toggle individual permission flag
  const handleTogglePermission = (key: keyof SubAdminPermissions) => {
    if (!editingPermissions) return;
    setEditingPermissions((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  // Save Permissions
  const handleSavePermissions = () => {
    if (!selectedSubAdminForPerms || !editingPermissions) return;
    onUpdatePermissions(selectedSubAdminForPerms.id, editingPermissions);
    setSelectedSubAdminForPerms(null);
    setEditingPermissions(null);
  };

  // Filter Sub-Admins
  const filteredSubAdmins = useMemo(() => {
    return subAdmins.filter((sa) => {
      if (statusFilter === 'active' && sa.status !== 'active') return false;
      if (statusFilter === 'pending' && sa.joiningFeeStatus !== 'pending') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          sa.id.toLowerCase().includes(q) ||
          sa.name.toLowerCase().includes(q) ||
          sa.email.toLowerCase().includes(q) ||
          (sa.assignedRegion && sa.assignedRegion.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [subAdmins, statusFilter, searchQuery]);

  // Executive Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCount = subAdmins.length;
    const activeCount = subAdmins.filter((s) => s.status === 'active').length;
    const paidCount = subAdmins.filter((s) => s.joiningFeeStatus === 'paid').length;
    const totalFeesCollected = paidCount * 599;
    const totalRevenueManaged = subAdmins.reduce((acc, s) => acc + (s.totalRevenueManaged || 0), 0);
    const totalCommissionDisbursed = subAdmins.reduce((acc, s) => acc + (s.totalEarningsWithdrawn || 0), 0);

    return { totalCount, activeCount, paidCount, totalFeesCollected, totalRevenueManaged, totalCommissionDisbursed };
  }, [subAdmins]);

  // Universal CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Sub-Admin ID',
      'Name',
      'Phone',
      'Email',
      'Assigned Region',
      'License Fee Status',
      'Amount (INR)',
      'Transaction Ref',
      'Status',
      'Revenue Managed (INR)',
      'Commission Share (%)',
      'Licensed At',
    ];
    const rows = subAdmins.map((s) => [
      s.id,
      s.name,
      s.phone,
      s.email,
      s.assignedRegion || 'General',
      s.joiningFeeStatus.toUpperCase(),
      s.joiningFeeAmount,
      s.transactionRef || 'N/A',
      s.status.toUpperCase(),
      s.totalRevenueManaged || 0,
      `${s.subAdminCommissionRate || 5}%`,
      s.licensedAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Astroguru_SubAdmins_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '-0.3px' }}>
              Sub-Admin Hierarchy & Licensing Command
            </h1>
            <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10B981' }} />
              Enterprise RBAC Active
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Onboard franchise operators, verify ₹599 joining fee licenses, configure granular user-wise permissions, and audit operator activity.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            📥 Export Partners CSV
          </button>
          <button
            onClick={handleOpenOnboardModal}
            className="btn-gold"
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
            }}
          >
            <span>✨</span>
            <span>Onboard Sub-Admin (₹599)</span>
          </button>
        </div>
      </div>

      {/* Executive Financial & Licensing KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Sub-Admin Partners
            </span>
            <span style={{ fontSize: '18px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#EEF2FF', marginTop: '6px' }}>
            {metrics.totalCount} Partners
          </div>
          <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {metrics.activeCount} Active Licensed Operators
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ₹599 Joining Fees Collected
            </span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#FCD34D', marginTop: '6px' }}>
            ₹{metrics.totalFeesCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            {metrics.paidCount} Licenses Fully Verified
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fleet Revenue Managed
            </span>
            <span style={{ fontSize: '18px' }}>🔮</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#38BDF8', marginTop: '6px' }}>
            ₹{metrics.totalRevenueManaged.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            Across all delegated regional zones
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Partner Commission Payouts
            </span>
            <span style={{ fontSize: '18px' }}>🤝</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#34D399', marginTop: '6px' }}>
            ₹{metrics.totalCommissionDisbursed.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            Average ~5% franchise override
          </div>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search Sub-Admin by name, ID, phone or region..."
          style={{
            backgroundColor: 'rgba(10, 12, 22, 0.8)',
            border: '1px solid rgba(129, 140, 248, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#EEF2FF',
            fontSize: '12.5px',
            width: '360px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: `All Partners (${subAdmins.length})` },
            { id: 'active', label: `Active (${subAdmins.filter((s) => s.status === 'active').length})` },
            { id: 'pending', label: `Pending ₹599 (${subAdmins.filter((s) => s.joiningFeeStatus === 'pending').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Admins Table */}
      <div className="liquid-card" style={{ overflow: 'hidden' }}>
        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Sub-Admin Partner & ID</th>
              <th>Assigned Region / Scope</th>
              <th>₹599 License Status</th>
              <th>Active Permissions Summary</th>
              <th style={{ color: '#FCD34D' }}>Revenue Managed</th>
              <th>Operator Status</th>
              <th>Clearance Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubAdmins.map((sa) => (
              <tr key={sa.id}>
                {/* Profile info with copyable License ID */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={sa.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'}
                      alt={sa.name}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(129, 140, 248, 0.4)',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', color: '#EEF2FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{sa.name}</span>
                        {sa.status === 'active' && (
                          <span style={{ color: '#34D399', fontSize: '12px' }} title="Verified Authorized Partner">✓</span>
                        )}
                      </div>

                      {/* Clickable License ID Badge */}
                      <button
                        onClick={() => handleCopy(sa.id)}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(129, 140, 248, 0.35)',
                          borderRadius: '6px',
                          padding: '1px 6px',
                          color: '#A5B4FC',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginTop: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Click to copy Sub-Admin ID"
                      >
                        <span>🆔 {sa.id}</span>
                        <span style={{ fontSize: '10px' }}>{copiedText === sa.id ? '✓' : '📋'}</span>
                      </button>

                      <div style={{ fontSize: '11px', color: '#818CF8', marginTop: '2px' }}>
                        {sa.email} · {sa.phone}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Region / Scope */}
                <td>
                  <div style={{ fontWeight: '600', color: '#EEF2FF', fontSize: '12.5px' }}>
                    {sa.assignedRegion || 'Pan-India Fleet'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#A5B4FC', marginTop: '2px' }}>
                    {sa.assignedAstrologerIds?.length ? `${sa.assignedAstrologerIds.length} Assigned Acharyas` : 'All Regional Astrologers'}
                  </div>
                </td>

                {/* ₹599 License Status */}
                <td>
                  {sa.joiningFeeStatus === 'paid' ? (
                    <div>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
                        ✓ ₹599 Paid
                      </span>
                      {sa.transactionRef && (
                        <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                          {sa.transactionRef}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="badge-pill badge-amber" style={{ fontSize: '11px' }}>
                        ⏳ Pending ₹599
                      </span>
                      <button
                        onClick={() => onVerifyFee(sa.id, `UPI/${Date.now().toString().slice(-6)}`)}
                        className="btn-primary"
                        style={{ fontSize: '10px', padding: '2px 6px', marginTop: '4px', display: 'block' }}
                      >
                        Verify Cash/UPI
                      </button>
                    </div>
                  )}
                </td>

                {/* Active Permissions Summary Pills */}
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '220px' }}>
                    {sa.permissions.canViewAstrologers && (
                      <span className="badge-pill badge-indigo" style={{ fontSize: '9.5px' }}>
                        🔮 Astro Fleet
                      </span>
                    )}
                    {sa.permissions.canApproveKYC && (
                      <span className="badge-pill badge-emerald" style={{ fontSize: '9.5px' }}>
                        ✓ KYC Review
                      </span>
                    )}
                    {sa.permissions.canMonitorLiveSessions && (
                      <span className="badge-pill badge-rose" style={{ fontSize: '9.5px' }}>
                        🔴 Live Radar
                      </span>
                    )}
                    {sa.permissions.canAdjustWallet && (
                      <span className="badge-pill badge-amber" style={{ fontSize: '9.5px' }}>
                        💰 Wallet (₹{sa.permissions.maxWalletCreditLimitPerDay})
                      </span>
                    )}
                    {sa.permissions.canManageAstroMall && (
                      <span className="badge-pill badge-indigo" style={{ fontSize: '9.5px' }}>
                        🪔 AstroMall
                      </span>
                    )}
                    {sa.permissions.canDispatchBroadcast && (
                      <span className="badge-pill badge-emerald" style={{ fontSize: '9.5px' }}>
                        📢 Broadcast
                      </span>
                    )}
                  </div>
                </td>

                {/* Revenue Managed */}
                <td>
                  <div style={{ fontWeight: '800', color: '#FCD34D', fontSize: '13.5px' }}>
                    ₹{(sa.totalRevenueManaged || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#34D399', marginTop: '2px' }}>
                    {sa.subAdminCommissionRate || 5}% Cut: ₹{(sa.totalEarningsWithdrawn || 0).toLocaleString('en-IN')}
                  </div>
                </td>

                {/* Operator Status */}
                <td>
                  <button
                    onClick={() => onToggleStatus(sa.id)}
                    className={sa.status === 'active' ? 'badge-pill badge-emerald' : 'badge-pill badge-indigo'}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {sa.status === 'active' ? '🟢 Active' : '⚪ Suspended'}
                  </button>
                </td>

                {/* Clearance Actions */}
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenPermissionsDrawer(sa)}
                      className="btn-gold"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      title="Configure granular sector rights and limits"
                    >
                      ⚙️ Rights
                    </button>
                    <button
                      onClick={() => setSelectedSubAdminForCert(sa)}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                      title="View official digital franchise partner certificate"
                    >
                      📜 Certificate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===================================================================== */}
      {/* DRAWER: GRANULAR RIGHTS & PERMISSIONS CONFIGURATION                   */}
      {/* ===================================================================== */}
      {selectedSubAdminForPerms && editingPermissions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 140,
            padding: '20px',
          }}
        >
          <div
            className="liquid-card"
            style={{
              width: '740px',
              maxWidth: '96vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#EEF2FF' }}>
                    Operator Clearance & Rights: {selectedSubAdminForPerms.name}
                  </h2>
                </div>
                <div style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '2px' }}>
                  License: <strong style={{ color: '#FCD34D', fontFamily: 'monospace' }}>{selectedSubAdminForPerms.id}</strong> · Region: {selectedSubAdminForPerms.assignedRegion} · Fee: <span style={{ color: '#34D399' }}>₹599 Verified</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubAdminForPerms(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#EEF2FF',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Sector 1: Astrologer Fleet */}
            <div className="inset-box" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#FCD34D', marginBottom: '10px' }}>
                🔮 SECTOR 1: ASTROLOGER DIRECTORY & DAY-WISE LEDGER
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'canViewAstrologers', label: 'View Astrologers Fleet' },
                  { key: 'canEditTariffs', label: 'Modify Tariff Rates (₹/min)' },
                  { key: 'canApproveKYC', label: 'Approve Vedic KYC Degrees' },
                  { key: 'canGenerateAstroId', label: 'Generate New Astro IDs' },
                  { key: 'canViewDayWiseIncome', label: 'Inspect Day-Wise Income' },
                  { key: 'canSettlePayouts', label: 'Settle / Disburse Bank Payouts' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingPermissions[item.key as keyof SubAdminPermissions])}
                      onChange={() => handleTogglePermission(item.key as keyof SubAdminPermissions)}
                      style={{ accentColor: '#6366F1', width: '16px', height: '16px' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sector 2: Live Monitoring & Fraud Watchtower */}
            <div className="inset-box" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#FB7185', marginBottom: '10px' }}>
                🔴 SECTOR 2: LIVE RADAR & FRAUD SECURITY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'canMonitorLiveSessions', label: 'Monitor Live Consultations' },
                  { key: 'canTerminateSessions', label: 'Emergency Session Kill & Refund' },
                  { key: 'canIssueStrikes', label: 'Issue Formal Compliance Strikes' },
                  { key: 'canAccessWatchtower', label: 'Access Fraud Watchtower Radar' },
                  { key: 'canBanDevices', label: 'Sanction Hardware Ban Hammer' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingPermissions[item.key as keyof SubAdminPermissions])}
                      onChange={() => handleTogglePermission(item.key as keyof SubAdminPermissions)}
                      style={{ accentColor: '#E11D48', width: '16px', height: '16px' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sector 3: Users & Wallet Customer Support */}
            <div className="inset-box" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#38BDF8', marginBottom: '10px' }}>
                👥 SECTOR 3: SEEKER SUPPORT & WALLET CREDITS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                  <input
                    type="checkbox"
                    checked={editingPermissions.canViewUsers}
                    onChange={() => handleTogglePermission('canViewUsers')}
                    style={{ accentColor: '#38BDF8', width: '16px', height: '16px' }}
                  />
                  <span>View Seeker Profiles</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                  <input
                    type="checkbox"
                    checked={editingPermissions.canAdjustWallet}
                    onChange={() => handleTogglePermission('canAdjustWallet')}
                    style={{ accentColor: '#38BDF8', width: '16px', height: '16px' }}
                  />
                  <span>Allow Wallet Credit / Refunds</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                  <input
                    type="checkbox"
                    checked={editingPermissions.canSuspendUsers}
                    onChange={() => handleTogglePermission('canSuspendUsers')}
                    style={{ accentColor: '#38BDF8', width: '16px', height: '16px' }}
                  />
                  <span>Suspend Abusive User Accounts</span>
                </label>

                {/* Daily Wallet Adjustment Limit */}
                <div>
                  <label style={{ fontSize: '11px', color: '#A5B4FC', display: 'block' }}>Max Wallet Credit Allowance / Day (₹):</label>
                  <input
                    type="number"
                    value={editingPermissions.maxWalletCreditLimitPerDay}
                    onChange={(e) =>
                      setEditingPermissions((prev) => prev ? { ...prev, maxWalletCreditLimitPerDay: Number(e.target.value) } : prev)
                    }
                    style={{
                      width: '120px',
                      backgroundColor: 'rgba(10, 12, 22, 0.8)',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      borderRadius: '6px',
                      color: '#FCD34D',
                      padding: '4px 8px',
                      fontSize: '12px',
                      marginTop: '4px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sector 4: AstroMall & Re-engagement */}
            <div className="inset-box" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#34D399', marginBottom: '10px' }}>
                🪔 SECTOR 4: ASTROMALL E-PUJA & MARKETING RE-ENGAGEMENT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'canManageAstroMall', label: 'Manage AstroMall Orders' },
                  { key: 'canAssignPandits', label: 'Assign Temple Pandits (Varanasi/Ujjain)' },
                  { key: 'canDispatchBroadcast', label: 'Dispatch WhatsApp & Push Campaigns' },
                  { key: 'canAccessAutomationRules', label: 'Configure 24/7 Automation Rules' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#EEF2FF' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editingPermissions[item.key as keyof SubAdminPermissions])}
                      onChange={() => handleTogglePermission(item.key as keyof SubAdminPermissions)}
                      style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Drawer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setSelectedSubAdminForPerms(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="btn-gold"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                💾 Save Clearance & Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ONBOARD NEW SUB-ADMIN & ₹599 FEE COLLECTION                   */}
      {/* ===================================================================== */}
      {isOnboardModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 140,
            padding: '20px',
          }}
        >
          <div
            className="liquid-card"
            style={{
              width: '660px',
              maxWidth: '96vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#EEF2FF' }}>
                    Onboard Sub-Admin Partner (₹599 License)
                  </h2>
                  <p style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '2px' }}>
                    Create authorized operator credentials and record verified ₹599 franchise joining fee.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  color: '#EEF2FF',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {createdSuccessSubAdmin ? (
              /* Success Card with WhatsApp Welcome Dossier */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1.5px solid #10B981',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '38px', marginBottom: '8px' }}>🎉</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
                    Sub-Admin Partner Onboarded Successfully!
                  </h3>
                  <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
                    ₹599 License Fee verified for {createdSuccessSubAdmin.name}.
                  </p>

                  <div
                    style={{
                      margin: '18px auto',
                      backgroundColor: 'rgba(10, 12, 22, 0.85)',
                      border: '1.5px dashed #FCD34D',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#FCD34D' }}>ASSIGNED OPERATOR ID:</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#EEF2FF', fontFamily: 'monospace' }}>
                      {createdSuccessSubAdmin.id}
                    </span>
                    <button
                      onClick={() => handleCopy(createdSuccessSubAdmin.id)}
                      className="btn-primary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      {copiedText === createdSuccessSubAdmin.id ? '✓ Copied!' : '📋 Copy ID'}
                    </button>
                  </div>
                </div>

                {/* Welcome Kit Dossier ready for WhatsApp */}
                <div className="inset-box" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                      📲 Sub-Admin Welcome Dossier (WhatsApp / SMS):
                    </span>
                    <button
                      onClick={() => {
                        const msg = `🌟 AstroGuru Authorized Sub-Admin Partner Credentials 🌟\nNamaste ${createdSuccessSubAdmin.name} ji,\n\nCongratulations! Your AstroGuru Franchise License has been issued:\n🆔 Sub-Admin ID: ${createdSuccessSubAdmin.id}\n💰 License Fee: ₹599 (Verified Paid)\n📍 Assigned Region: ${createdSuccessSubAdmin.assignedRegion}\n🖥️ Admin Portal: https://astroguru-admin.vercel.app\n🔑 Login Email: ${createdSuccessSubAdmin.email}\n\nYou can now log in to the AstroGuru Admin Portal to manage your regional fleet.`;
                        handleCopy(msg);
                      }}
                      className="btn-gold"
                      style={{ fontSize: '11px', padding: '5px 12px' }}
                    >
                      {copiedText?.includes('AstroGuru Authorized') ? '✓ Dossier Copied!' : '📋 Copy Welcome Message'}
                    </button>
                  </div>
                  <pre
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'rgba(4, 6, 15, 0.7)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      color: '#A5B4FC',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '18px',
                      fontFamily: 'monospace',
                    }}
                  >
{`🌟 AstroGuru Authorized Sub-Admin Partner Credentials 🌟
Namaste ${createdSuccessSubAdmin.name} ji,

Congratulations! Your AstroGuru Franchise License has been issued:
🆔 Sub-Admin ID: ${createdSuccessSubAdmin.id}
💰 License Fee: ₹599 (Verified Paid)
📍 Assigned Region: ${createdSuccessSubAdmin.assignedRegion}
🖥️ Admin Portal: https://astroguru-admin.vercel.app
🔑 Login Email: ${createdSuccessSubAdmin.email}

You can now log in to the AstroGuru Admin Portal to manage your regional fleet.`}
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSelectedSubAdminForCert(createdSuccessSubAdmin);
                      setIsOnboardModalOpen(false);
                    }}
                    className="btn-gold"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >
                    📜 View Partner Certificate
                  </button>
                  <button
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Onboarding Form */
              <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Sub-Admin ID */}
                <div
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block' }}>
                      Assigned Sub-Admin ID
                    </label>
                    <input
                      type="text"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#FCD34D',
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        fontWeight: '800',
                        outline: 'none',
                        marginTop: '2px',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewId(`subadmin_${Date.now()}`)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                  >
                    🎲 Fresh ID
                  </button>
                </div>

                {/* 2. Personal Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Partner Full Name *
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      required
                      className="cosmic-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Mobile Phone Number *
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98112 33445"
                      required
                      className="cosmic-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Login Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={`e.g. ${newId || 'partner'}@astroguru.app`}
                      className="cosmic-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '6px' }}>
                      Assigned Region / Zone
                    </label>
                    <select
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      className="cosmic-input"
                    >
                      <option value="Delhi-NCR & North Zone">Delhi-NCR & North Zone</option>
                      <option value="Gujarat & Maharashtra Zone">Gujarat & Maharashtra Zone</option>
                      <option value="Uttar Pradesh & Bihar Zone">Uttar Pradesh & Bihar Zone</option>
                      <option value="Rajasthan & Haryana Zone">Rajasthan & Haryana Zone</option>
                      <option value="South India Zone">South India Zone</option>
                      <option value="Pan-India General Fleet">Pan-India General Fleet</option>
                    </select>
                  </div>
                </div>

                {/* 3. ₹599 Joining Fee Section */}
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1.5px solid rgba(252, 211, 77, 0.45)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>💳</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#FCD34D' }}>
                        FRANCHISE JOINING FEE: ₹599
                      </span>
                    </div>
                    <span className="badge-pill badge-emerald">Fixed Annual License</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '4px' }}>
                        Payment Method:
                      </label>
                      <select
                        value={newFeeMode}
                        onChange={(e) => setNewFeeMode(e.target.value as any)}
                        className="cosmic-input"
                      >
                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                        <option value="Razorpay">Razorpay Gateway</option>
                        <option value="Bank Transfer">Direct Bank Transfer (NEFT/IMPS)</option>
                        <option value="Cash / Offline">Cash / Founder Verified</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#EEF2FF', display: 'block', marginBottom: '4px' }}>
                        Transaction / UTR Reference:
                      </label>
                      <input
                        type="text"
                        value={newTxnRef}
                        onChange={(e) => setNewTxnRef(e.target.value)}
                        placeholder="e.g. UPI/6029182910"
                        className="cosmic-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#EEF2FF' }}>
                      <input
                        type="checkbox"
                        checked={newFeeStatus === 'paid'}
                        onChange={(e) => setNewFeeStatus(e.target.checked ? 'paid' : 'pending')}
                        style={{ accentColor: '#10B981', width: '16px', height: '16px' }}
                      />
                      <span>Mark ₹599 as Verified & Paid (Activate License Immediately)</span>
                    </label>
                  </div>
                </div>

                {/* 4. Partner Commission Share */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                      Sub-Admin Commission Override: <strong style={{ color: '#34D399' }}>{newCommissionRate}%</strong>
                    </label>
                    <div style={{ fontSize: '11px', color: '#A5B4FC' }}>
                      Partner earns {newCommissionRate}% on all consultation volume completed in their region.
                    </div>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                    style={{ width: '140px', accentColor: '#10B981', cursor: 'pointer' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold"
                    style={{ padding: '8px 20px', fontSize: '13px' }}
                  >
                    ✨ Onboard & Issue License
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: OFFICIAL DIGITAL PARTNER LICENSE CERTIFICATE                  */}
      {/* ===================================================================== */}
      {selectedSubAdminForCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 6, 15, 0.9)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 150,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '640px',
              maxWidth: '96vw',
              backgroundColor: '#0A0C16',
              border: '2px solid #FCD34D',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.25)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedSubAdminForCert(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#A5B4FC',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div style={{ fontSize: '32px' }}>🔮</div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: '800', marginTop: '6px' }}>
              ASTROGURU VEDIC ENTERPRISE NETWORK
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF', marginTop: '6px', fontFamily: 'serif' }}>
              Certificate of Sub-Admin Authorization
            </h2>
            <div style={{ width: '80px', height: '2px', backgroundColor: '#FCD34D', margin: '12px auto' }} />

            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '20px', marginTop: '16px' }}>
              This certifies that the partner designated below has successfully completed franchise onboarding and satisfied the statutory <strong>₹599 Authorized Operator Licensing Fee</strong>.
            </p>

            {/* Partner Details Box */}
            <div
              style={{
                backgroundColor: 'rgba(26, 33, 64, 0.8)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                borderRadius: '12px',
                padding: '18px 24px',
                margin: '20px 0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <div>
                <span style={{ fontSize: '10.5px', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: '700' }}>AUTHORIZED OPERATOR:</span>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#EEF2FF' }}>{selectedSubAdminForCert.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: '700' }}>LICENSE ID:</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#FCD34D', fontFamily: 'monospace' }}>{selectedSubAdminForCert.id}</div>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: '700' }}>ASSIGNED ZONE:</span>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>{selectedSubAdminForCert.assignedRegion || 'General'}</div>
              </div>
              <div>
                <span style={{ fontSize: '10.5px', color: '#A5B4FC', textTransform: 'uppercase', fontWeight: '700' }}>FEE STATUS:</span>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#34D399' }}>✓ ₹599 Paid ({selectedSubAdminForCert.paymentMode || 'UPI'})</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '0 20px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: '#818CF8' }}>Issued: {selectedSubAdminForCert.licensedAt}</div>
                <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '700' }}>Status: Officially Licensed ✓</div>
              </div>
              <button
                onClick={() => setSelectedSubAdminForCert(null)}
                className="btn-gold"
                style={{ fontSize: '12px', padding: '7px 16px' }}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
