import React, { useState } from 'react';
import { AdminUser, AstrologerProfile, BannedEntity, OrderItem, SecurityIncident, UserRecord } from './types';
import {
  INITIAL_ASTROLOGERS,
  INITIAL_BLACKLIST,
  INITIAL_INCIDENTS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  fetchLiveAdminData,
  adjustUserWalletApi,
  toggleUserStatusApi,
  toggleAstrologerDutyApi,
  verifyAstrologerApi,
  updateAstrologerRateApi,
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

  // Load live data from database on mount
  React.useEffect(() => {
    fetchLiveAdminData().then((data) => {
      if (data.users && data.users.length > 0) setUsers(data.users);
      if (data.astrologers && data.astrologers.length > 0) setAstrologers(data.astrologers);
      if (data.orders && data.orders.length > 0) setOrders(data.orders);
      if (data.incidents && data.incidents.length > 0) setIncidents(data.incidents);
      if (data.blacklist && data.blacklist.length > 0) setBlacklist(data.blacklist);
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
