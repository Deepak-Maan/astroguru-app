import React, { useState } from 'react';
import {
  AdminAuditLog,
  AdminUser,
  AstrologerProfile,
  BannedEntity,
  LiveConsultationSession,
  OrderItem,
  SecurityIncident,
  SystemHealthConfig,
  UserRecord,
} from './types';
import {
  INITIAL_ASTROLOGERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BLACKLIST,
  INITIAL_INCIDENTS,
  INITIAL_LIVE_SESSIONS,
  INITIAL_ORDERS,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_USERS,
  fetchLiveAdminData,
  adjustUserWalletApi,
  toggleUserStatusApi,
  toggleAstrologerDutyApi,
  verifyAstrologerApi,
  updateAstrologerRateApi,
  fetchLiveSessionsApi,
  terminateLiveSessionApi,
  toggleAstrologerBoostApi,
  issueAstrologerStrikeApi,
  fetchAuditLogsApi,
  recordAuditLogApi,
  fetchSystemHealthApi,
  saveSystemHealthApi,
} from './services/api';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { AdminTopNav } from './components/AdminTopNav';
import { BanHammerModal } from './components/BanHammerModal';
import { OverviewDesk } from './pages/OverviewDesk';
import { WatchtowerDesk } from './pages/WatchtowerDesk';
import { AstrologersDesk } from './pages/AstrologersDesk';
import { UsersDesk } from './pages/UsersDesk';
import { AstroMallDesk } from './pages/AstroMallDesk';
import { BroadcastDesk } from './pages/BroadcastDesk';
import { UpdatesDesk } from './pages/UpdatesDesk';
import { WebsiteDesk } from './pages/WebsiteDesk';
import { LoginDesk } from './pages/LoginDesk';
import { LiveDesk } from './pages/LiveDesk';
import { SystemAuditDesk } from './pages/SystemAuditDesk';


export const App: React.FC = () => {
  // Authentication State with secure sessionStorage
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('astroguru_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (u: AdminUser) => {
    try {
      sessionStorage.setItem('astroguru_admin_session', JSON.stringify(u));
    } catch (_) {}
    setAdminUser(u);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('astroguru_admin_session');
    } catch (_) {}
    setAdminUser(null);
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Operational State
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [blacklist, setBlacklist] = useState<BannedEntity[]>(INITIAL_BLACKLIST);
  const [astrologers, setAstrologers] = useState<AstrologerProfile[]>(INITIAL_ASTROLOGERS);
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [liveSessions, setLiveSessions] = useState<LiveConsultationSession[]>(INITIAL_LIVE_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [systemHealth, setSystemHealth] = useState<SystemHealthConfig>(INITIAL_SYSTEM_HEALTH);

  // Load live data from database on mount
  React.useEffect(() => {
    fetchLiveAdminData().then((data) => {
      if (data.users && data.users.length > 0) setUsers(data.users);
      if (data.astrologers && data.astrologers.length > 0) setAstrologers(data.astrologers);
      if (data.orders && data.orders.length > 0) setOrders(data.orders);
      if (data.incidents && data.incidents.length > 0) setIncidents(data.incidents);
      if (data.blacklist && data.blacklist.length > 0) setBlacklist(data.blacklist);
    });

    fetchLiveSessionsApi().then((data) => {
      if (data && data.length > 0) setLiveSessions(data);
    });

    fetchAuditLogsApi().then((data) => {
      if (data && data.length > 0) setAuditLogs(data);
    });

    fetchSystemHealthApi().then((data) => {
      if (data) setSystemHealth(data);
    });
  }, []);


  // Modals & Feedback
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [dutyAlertSent, setDutyAlertSent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Watchtower Actions
  const handleIssueStrike = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'resolved' } : inc))
    );
    showToast('⚠️ Formal compliance strike issued to user.');
  };

  const handleBanFromIncident = (incident: SecurityIncident) => {
    const newBan: BannedEntity = {
      id: `ban-${Date.now()}`,
      entityType: 'device',
      identifier: incident.deviceFingerprint,
      name: `${incident.userName} (Hardware Block)`,
      reason: incident.type.replace(/_/g, ' '),
      bannedAt: 'Just now',
      duration: 'Permanent',
    };
    setBlacklist((prev) => [newBan, ...prev]);
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incident.id ? { ...inc, status: 'resolved' } : inc))
    );
    showToast(`🔨 Hardware UUID ${incident.deviceFingerprint} permanently banned!`);
  };

  const handleDismissIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: 'dismissed' } : inc))
    );
    showToast('🛡️ Incident marked as false-positive and cleared.');
  };

  const handleUnban = (entityId: string) => {
    setBlacklist((prev) => prev.filter((b) => b.id !== entityId));
    showToast('✓ Entity pardoned and removed from blacklist.');
  };

  const handleConfirmUniversalBan = (entity: Omit<BannedEntity, 'id' | 'bannedAt'>) => {
    const newBan: BannedEntity = {
      ...entity,
      id: `ban-${Date.now()}`,
      bannedAt: 'Just now',
    };
    setBlacklist((prev) => [newBan, ...prev]);
    showToast(`🔨 ${entity.entityType.toUpperCase()} "${entity.identifier}" sanctioned!`);
  };

  // Astrologer Actions
  const handleToggleDuty = (id: string) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, onDuty: !a.onDuty } : a))
    );
    toggleAstrologerDutyApi(id);
  };

  const handleUpdateCommission = (id: string, newRate: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, commissionRate: newRate } : a))
    );
    showToast(`Acharya commission updated to ${newRate}%`);
  };

  const handleApproveAstro = (id: string) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'active', onDuty: true } : a))
    );
    verifyAstrologerApi(id);
    showToast('✓ Astrologer credentials verified and approved for duty!');
  };

  // User Actions
  const handleAdjustWallet = (userId: string, delta: number, note: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, walletBalance: Math.max(0, u.walletBalance + delta) } : u
      )
    );
    adjustUserWalletApi(userId, delta, note);
    showToast(`Wallet adjusted by ₹${delta > 0 ? '+' : ''}${delta} (${note})`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
    toggleUserStatusApi(userId);
  };

  // AstroMall Actions
  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderItem['status'],
    tracking?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status, trackingNumber: tracking || o.trackingNumber } : o
      )
    );
    showToast(`Order ${orderId} updated to ${status.replace('_', ' ').toUpperCase()}`);
  };

  // Peak Duty Surge Alert
  const handleSendDutyAlert = () => {
    setDutyAlertSent(true);
    showToast('🚀 Peak Demand Alert broadcast to 18 off-duty astrologers with +25% surge bonus!');
    setTimeout(() => setDutyAlertSent(false), 5000);
  };

  // Live Sessions Actions (Option 3)
  const handleTerminateSession = (sessionId: string, reason: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'terminated_by_admin' } : s))
    );
    const newLog: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: 'Just now',
      adminName: adminUser?.name || 'Master Admin',
      action: 'EMERGENCY_SESSION_KILL',
      targetEntity: `Session: ${sessionId}`,
      details: `Force terminated session. Reason: ${reason}. Full refund credited.`,
      severity: 'warning',
      ipAddress: '223.185.59.145',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    terminateLiveSessionApi(sessionId, reason, adminUser?.name || 'Master Admin');
    showToast(`🚨 Session ${sessionId} terminated & seeker refunded.`);
  };

  const handleUpdateBoost = (astroId: string, isFeatured: boolean, rank: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === astroId ? { ...a, isFeatured, boostRank: rank } : a))
    );
    const astro = astrologers.find((a) => a.id === astroId);
    const newLog: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: 'Just now',
      adminName: adminUser?.name || 'Master Admin',
      action: 'ASTRO_BOOST_UPDATED',
      targetEntity: `Acharya: ${astro?.name || astroId}`,
      details: isFeatured ? `Boosted to mobile slot #${rank}` : 'Removed from featured rank',
      severity: 'info',
      ipAddress: '223.185.59.145',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    toggleAstrologerBoostApi(astroId, isFeatured, rank);
    showToast(`⭐ ${astro?.name || 'Acharya'} rank updated to ${isFeatured ? `#${rank} Featured` : 'Standard'}`);
  };

  const handleIssueAstroStrike = (astroId: string, reason: string) => {
    setAstrologers((prev) =>
      prev.map((a) => {
        if (a.id === astroId) {
          const nextCount = (a.strikesCount || 0) + 1;
          const shouldPause = nextCount >= 2;
          return {
            ...a,
            strikesCount: nextCount,
            onDuty: shouldPause ? false : a.onDuty,
          };
        }
        return a;
      })
    );
    const astro = astrologers.find((a) => a.id === astroId);
    const nextCount = (astro?.strikesCount || 0) + 1;
    const newLog: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: 'Just now',
      adminName: adminUser?.name || 'Master Admin',
      action: 'ASTRO_STRIKE_ISSUED',
      targetEntity: `Acharya: ${astro?.name || astroId}`,
      details: `Recorded strike #${nextCount}. Reason: ${reason}.${nextCount >= 2 ? ' Duty automatically paused.' : ''}`,
      severity: 'warning',
      ipAddress: '223.185.59.145',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    issueAstrologerStrikeApi(astroId, reason, adminUser?.name || 'Master Admin');
    showToast(`⚠️ Strike #${nextCount} issued to ${astro?.name}. ${nextCount >= 2 ? 'Duty paused for 2h.' : ''}`);
  };

  const handleClearStrikes = (astroId: string) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === astroId ? { ...a, strikesCount: 0 } : a))
    );
    const astro = astrologers.find((a) => a.id === astroId);
    const newLog: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: 'Just now',
      adminName: adminUser?.name || 'Master Admin',
      action: 'ASTRO_STRIKES_CLEARED',
      targetEntity: `Acharya: ${astro?.name || astroId}`,
      details: 'Pardoned and cleared all strikes back to 0',
      severity: 'info',
      ipAddress: '223.185.59.145',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`✓ Strikes cleared for ${astro?.name || 'Astrologer'}`);
  };

  // System Health & Maintenance (Option 6)
  const handleUpdateSystemHealth = (newConfig: SystemHealthConfig) => {
    setSystemHealth(newConfig);
    const newLog: AdminAuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: 'Just now',
      adminName: adminUser?.name || 'Master Admin',
      action: 'MAINTENANCE_MODE_TOGGLED',
      targetEntity: 'Platform Infrastructure',
      details: `Maintenance mode switched to: ${newConfig.maintenanceMode ? 'ACTIVE (OFFLINE)' : 'INACTIVE (ONLINE)'}`,
      severity: newConfig.maintenanceMode ? 'critical' : 'info',
      ipAddress: '223.185.59.145',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveSystemHealthApi(newConfig);
    showToast(`System Health updated: ${newConfig.maintenanceMode ? '⚠️ Maintenance Mode Activated' : '● System Online'}`);
  };


  // If not logged in, render dedicated Admin Login screen
  if (!adminUser) {
    return <LoginDesk onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          backgroundColor: 'rgba(26, 33, 64, 0.96)',
          border: '1px solid #818CF8',
          color: '#EEF2FF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          zIndex: 200,
          fontSize: '13.5px',
          fontWeight: '700',
        }}>
          {toastMessage}
        </div>
      )}

      {/* Desktop Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        adminUser={adminUser}
        onLogout={handleLogout}
        incidentCount={incidents.filter((i) => i.status === 'pending').length}
        pendingAstrosCount={astrologers.filter((a) => a.status === 'pending_verification').length}
        liveSessionsCount={liveSessions.filter((s) => s.status === 'active').length}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminTopNav
          onOpenBanModal={() => setIsBanModalOpen(true)}
          onSendDutyAlert={handleSendDutyAlert}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
        />

        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {currentTab === 'overview' && (
            <OverviewDesk
              onSendDutyAlert={handleSendDutyAlert}
              dutyAlertSent={dutyAlertSent}
            />
          )}

          {currentTab === 'live' && (
            <LiveDesk
              sessions={liveSessions}
              astrologers={astrologers}
              onTerminateSession={handleTerminateSession}
              onUpdateBoost={handleUpdateBoost}
              onIssueStrike={handleIssueAstroStrike}
              onClearStrikes={handleClearStrikes}
            />
          )}

          {currentTab === 'website' && <WebsiteDesk />}

          {currentTab === 'watchtower' && (
            <WatchtowerDesk
              incidents={incidents}
              blacklist={blacklist}
              onIssueStrike={handleIssueStrike}
              onBanFromIncident={handleBanFromIncident}
              onDismissIncident={handleDismissIncident}
              onUnban={handleUnban}
              onOpenBanModal={() => setIsBanModalOpen(true)}
            />
          )}

          {currentTab === 'astrologers' && (
            <AstrologersDesk
              astrologers={astrologers}
              onToggleDuty={handleToggleDuty}
              onUpdateCommission={handleUpdateCommission}
              onApproveAstro={handleApproveAstro}
            />
          )}

          {currentTab === 'users' && (
            <UsersDesk
              users={users}
              onAdjustWallet={handleAdjustWallet}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {currentTab === 'astromall' && (
            <AstroMallDesk
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentTab === 'broadcast' && <BroadcastDesk />}

          {currentTab === 'updates' && <UpdatesDesk />}

          {currentTab === 'system' && (
            <SystemAuditDesk
              systemHealth={systemHealth}
              onUpdateSystemHealth={handleUpdateSystemHealth}
              auditLogs={auditLogs}
              users={users}
              astrologers={astrologers}
              orders={orders}
            />
          )}
        </main>
      </div>

      {/* Universal Ban Hammer Modal */}
      <BanHammerModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirmBan={handleConfirmUniversalBan}
      />
    </div>
  );
};
