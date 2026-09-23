import React, { useState } from 'react';
import {
  AdminAuditLog,
  AstrologerProfile,
  OrderItem,
  SystemHealthConfig,
  UserRecord,
} from '../types';

interface SystemAuditDeskProps {
  systemHealth: SystemHealthConfig;
  onUpdateSystemHealth: (config: SystemHealthConfig) => void;
  auditLogs: AdminAuditLog[];
  users: UserRecord[];
  astrologers: AstrologerProfile[];
  orders: OrderItem[];
}

export const SystemAuditDesk: React.FC<SystemAuditDeskProps> = ({
  systemHealth,
  onUpdateSystemHealth,
  auditLogs,
  users,
  astrologers,
  orders,
}) => {
  // Local state for maintenance mode editing
  const [maintenanceMode, setMaintenanceMode] = useState(systemHealth.maintenanceMode);
  const [notice, setNotice] = useState(systemHealth.maintenanceNotice);
  const [downtime, setDowntime] = useState(systemHealth.estimatedDowntime);
  const [allowBypass, setAllowBypass] = useState(systemHealth.allowAdminsBypass);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Search & Filter for Audit Logs
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const handleSaveMaintenance = () => {
    setIsSaving(true);
    onUpdateSystemHealth({
      maintenanceMode,
      maintenanceNotice: notice,
      estimatedDowntime: downtime,
      allowAdminsBypass: allowBypass,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  // CSV Exporter Helper Function
  const triggerDownloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUsersCsv = () => {
    const headers = ['User ID', 'Name', 'Phone', 'Email', 'Wallet Balance (₹)', 'Total Spent (₹)', 'VIP Status', 'Account Status', 'Created At'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.phone,
      u.email,
      u.walletBalance,
      u.totalSpent,
      u.isVip ? 'YES' : 'NO',
      u.status,
      u.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownloadCsv(`astroguru-users-ledger-${Date.now()}.csv`, csv);
  };

  const exportAstrologersCsv = () => {
    const headers = ['Acharya ID', 'Name', 'Phone', 'Email', 'Rate/Min (₹)', 'Rating', 'Reviews', 'Total Consultations', 'Commission %', 'Duty Status', 'Featured', 'Strikes'];
    const rows = astrologers.map((a) => [
      a.id,
      `"${a.name}"`,
      a.phone,
      a.email,
      a.ratePerMin,
      a.rating,
      a.reviewsCount,
      a.totalConsultations,
      a.commissionRate,
      a.onDuty ? 'ON_DUTY' : 'OFF_DUTY',
      a.isFeatured ? 'YES' : 'NO',
      a.strikesCount ?? 0,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownloadCsv(`astroguru-astrologers-fleet-${Date.now()}.csv`, csv);
  };

  const exportOrdersCsv = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Item Type', 'Title', 'Amount (₹)', 'Status', 'Tracking AWB', 'Created At'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      o.phone,
      o.itemType,
      `"${o.title}"`,
      o.amount,
      o.status,
      o.trackingNumber || 'N/A',
      `"${o.createdAt}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownloadCsv(`astroguru-astromall-orders-${Date.now()}.csv`, csv);
  };

  const exportAuditLogsCsv = () => {
    const headers = ['Audit ID', 'Timestamp', 'Admin Name', 'Action Code', 'Target Entity', 'Severity', 'IP Address', 'Details'];
    const rows = auditLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.adminName}"`,
      l.action,
      `"${l.targetEntity}"`,
      l.severity,
      l.ipAddress || '127.0.0.1',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerDownloadCsv(`astroguru-security-audit-ledger-${Date.now()}.csv`, csv);
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      log.adminName.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.targetEntity.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query);
    return matchesSeverity && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
              System Health, Audit Ledger & CSV Exporter
            </h1>
            <span className={`badge-pill ${maintenanceMode ? 'badge-rose' : 'badge-emerald'}`}>
              {maintenanceMode ? '⚠️ MAINTENANCE MODE ACTIVE' : '● PLATFORM HEALTHY'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Emergency platform maintenance toggle, tamper-proof administrative audit trail, and 1-click ledger exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportAuditLogsCsv} className="btn-secondary" style={{ fontSize: '12px' }}>
            📄 Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* TOP ROW: Maintenance Mode Switch & Universal 1-Click Exporters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Maintenance Mode Controller Card */}
        <div className="liquid-card" style={{ padding: '24px', border: maintenanceMode ? '1.5px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(129, 140, 248, 0.22)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🛡️</span>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>
                  Platform Maintenance Controller
                </h3>
                <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Temporarily disable consultations and show Vedic maintenance banner
                </p>
              </div>
            </div>

            {/* Switch */}
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: maintenanceMode ? '#F43F5E' : '#334155',
                color: '#FFFFFF',
                boxShadow: maintenanceMode ? '0 0 16px rgba(244, 63, 94, 0.5)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {maintenanceMode ? 'ACTIVE (OFFLINE)' : 'INACTIVE (ONLINE)'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                Maintenance Banner Notice:
              </label>
              <textarea
                rows={2}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0F172A',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#EEF2FF',
                  fontSize: '12px',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Estimated Downtime:
                </label>
                <select
                  value={downtime}
                  onChange={(e) => setDowntime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    color: '#EEF2FF',
                    fontSize: '12px',
                  }}
                >
                  <option value="15 mins">15 Minutes</option>
                  <option value="30 mins">30 Minutes</option>
                  <option value="1 hour">1 Hour</option>
                  <option value="2 hours">2 Hours</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#CBD5E1', marginBottom: '6px' }}>
                  Admin IP Bypass:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', height: '36px', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="bypassCheck"
                    checked={allowBypass}
                    onChange={(e) => setAllowBypass(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="bypassCheck" style={{ fontSize: '12px', color: '#A5B4FC', cursor: 'pointer' }}>
                    Allow admin dashboard access
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                Last updated: {systemHealth.lastUpdated || 'Recently'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {savedSuccess && <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '700' }}>✓ Applied!</span>}
                <button
                  onClick={handleSaveMaintenance}
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '6px 16px' }}
                >
                  {isSaving ? 'Applying...' : 'Apply Maintenance Config'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Universal CSV Data Exporters */}
        <div className="liquid-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '22px' }}>📊</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#EEF2FF' }}>
                1-Click Universal Data Exporters
              </h3>
              <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                Export operational datasets to CSV for Excel, accounting, and compliance
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={exportUsersCsv}
              className="btn-secondary"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                textAlign: 'left',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>👥 Users Ledger</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{users.length} Seekers & Wallets</span>
              <span style={{ fontSize: '10px', color: '#818CF8', marginTop: '4px' }}>📥 Download CSV</span>
            </button>

            <button
              onClick={exportAstrologersCsv}
              className="btn-secondary"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                textAlign: 'left',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>🔮 Astrologers Fleet</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{astrologers.length} Verified Acharyas</span>
              <span style={{ fontSize: '10px', color: '#818CF8', marginTop: '4px' }}>📥 Download CSV</span>
            </button>

            <button
              onClick={exportOrdersCsv}
              className="btn-secondary"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                textAlign: 'left',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>🪔 AstroMall Orders</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{orders.length} Puja & Gemstones</span>
              <span style={{ fontSize: '10px', color: '#818CF8', marginTop: '4px' }}>📥 Download CSV</span>
            </button>

            <button
              onClick={exportAuditLogsCsv}
              className="btn-secondary"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '14px',
                textAlign: 'left',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>🛡️ Security Audit Log</span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{auditLogs.length} Recorded Actions</span>
              <span style={{ fontSize: '10px', color: '#818CF8', marginTop: '4px' }}>📥 Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Tamper-Proof Administrative Audit Ledger */}
      <div className="liquid-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              📜 Administrative Action Audit Trail
            </h2>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Immutable log recording all admin interventions: wallet adjustments, ban hammer strikes, rank boosts, and session kills.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search admin, action, target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0F172A',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '6px',
                color: '#EEF2FF',
                fontSize: '12px',
                width: '240px',
              }}
            />

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#0F172A',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '6px',
                color: '#EEF2FF',
                fontSize: '12px',
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>Admin Operator</th>
              <th>Action Code</th>
              <th>Target Entity</th>
              <th>Operational Details</th>
              <th>Severity</th>
              <th>Origin IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuditLogs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                  No audit logs matching query
                </td>
              </tr>
            ) : (
              filteredAuditLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#818CF8' }}>
                      {log.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#CBD5E1' }}>{log.timestamp}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#EEF2FF' }}>{log.adminName}</span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#FCD34D',
                      padding: '3px 8px',
                      backgroundColor: 'rgba(252, 211, 77, 0.1)',
                      borderRadius: '4px',
                      border: '1px solid rgba(252, 211, 77, 0.25)',
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: '#EEF2FF', fontSize: '12px' }}>
                      {log.targetEntity}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{log.details}</span>
                  </td>
                  <td>
                    <span className={`badge-pill ${
                      log.severity === 'critical'
                        ? 'badge-rose'
                        : log.severity === 'warning'
                        ? 'badge-amber'
                        : 'badge-indigo'
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748B' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
