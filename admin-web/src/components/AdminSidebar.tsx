import React from 'react';
import { AdminUser } from '../types';

export type AdminTab =
  | 'overview'
  | 'live'
  | 'website'
  | 'watchtower'
  | 'astrologers'
  | 'users'
  | 'astromall'
  | 'broadcast'
  | 'subadmins'
  | 'updates'
  | 'system';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminUser: AdminUser;
  onLogout: () => void;
  incidentCount: number;
  pendingAstrosCount: number;
  liveSessionsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  onLogout,
  incidentCount,
  pendingAstrosCount,
  liveSessionsCount = 3,
}) => {
  const allNavItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Overview & Heatmap',
      icon: '📊',
      badge: null,
    },
    {
      id: 'live' as AdminTab,
      label: 'Live Sessions & Ranks',
      icon: '🔴',
      badge: liveSessionsCount > 0 ? `${liveSessionsCount} Live` : null,
      badgeClass: 'badge-rose',
    },
    {
      id: 'website' as AdminTab,
      label: 'Website CMS & Live',
      icon: '🌐',
      badge: 'Port 4000',
      badgeClass: 'badge-amber',
    },
    {
      id: 'watchtower' as AdminTab,
      label: 'Fraud Watchtower',
      icon: '🛡️',
      badge: incidentCount > 0 ? `${incidentCount} New` : null,
      badgeClass: 'badge-rose',
    },
    {
      id: 'astrologers' as AdminTab,
      label: 'Astrologer Directory',
      icon: '🔮',
      badge: pendingAstrosCount > 0 ? `${pendingAstrosCount} KYC` : null,
      badgeClass: 'badge-amber',
    },
    {
      id: 'users' as AdminTab,
      label: 'Seeker & Wallet Vault',
      icon: '👥',
      badge: null,
    },
    {
      id: 'astromall' as AdminTab,
      label: 'E-Puja & AstroMall',
      icon: '🪔',
      badge: '3 Orders',
      badgeClass: 'badge-indigo',
    },
    {
      id: 'broadcast' as AdminTab,
      label: 'Dormant Re-Engagement',
      icon: '📢',
      badge: 'WhatsApp & Push',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'subadmins' as AdminTab,
      label: 'Sub-Admin Hierarchy',
      icon: '🛡️',
      badge: '₹599 RBAC',
      badgeClass: 'badge-amber',
    },
    {
      id: 'updates' as AdminTab,
      label: 'App Release & OTA',
      icon: '📱',
      badge: 'v3.0.1',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'system' as AdminTab,
      label: 'System Health & Audit',
      icon: '⚙️',
      badge: 'Audit & CSV',
      badgeClass: 'badge-indigo',
    },
  ];

  // RBAC Filtering based on user role and permissions
  const navItems = allNavItems.filter((item) => {
    if (adminUser.role === 'super_admin') {
      return true; // Super Admin has unrestricted access to all modules
    }

    // Sub-Admin role: restricted modules
    if (item.id === 'subadmins' || item.id === 'system') {
      return false; // Sub-Admins cannot manage other subadmins or system infra
    }

    const perms = adminUser.permissions;
    if (!perms) return ['overview', 'website', 'updates'].includes(item.id);

    if (item.id === 'astrologers') return perms.canViewAstrologers !== false;
    if (item.id === 'live') return perms.canMonitorLiveSessions !== false;
    if (item.id === 'watchtower') return perms.canAccessWatchtower !== false;
    if (item.id === 'users') return perms.canViewUsers !== false;
    if (item.id === 'astromall') return perms.canManageAstroMall !== false;
    if (item.id === 'broadcast') return perms.canDispatchBroadcast !== false;

    return true;
  });


  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      backgroundColor: 'rgba(15, 19, 39, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(129, 140, 248, 0.22)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(129, 140, 248, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)',
        }}>
          🔮
        </div>
        <div>
          <div style={{
            fontSize: '17px',
            fontWeight: '800',
            letterSpacing: '0.3px',
            color: '#EEF2FF',
          }}>
            AstroGuru
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.8px',
            color: '#FCD34D',
            textTransform: 'uppercase',
          }}>
            Web Admin Portal
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        padding: '16px 12px',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <div style={{
          padding: '4px 12px 8px 12px',
          fontSize: '10px',
          fontWeight: '800',
          letterSpacing: '0.8px',
          color: '#64748B',
          textTransform: 'uppercase',
        }}>
          Operations & Control
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: isActive
                  ? '1px solid rgba(129, 140, 248, 0.5)'
                  : '1px solid transparent',
                backgroundColor: isActive
                  ? 'rgba(99, 102, 241, 0.22)'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : '#A5B4FC',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.16s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 33, 64, 0.6)';
                  e.currentTarget.style.color = '#EEF2FF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#A5B4FC';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '17px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge-pill ${item.badgeClass || 'badge-indigo'}`} style={{ fontSize: '10px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin User Footer Profile */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(129, 140, 248, 0.15)',
        backgroundColor: 'rgba(10, 12, 22, 0.5)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: adminUser.role === 'super_admin' ? 'rgba(99, 102, 241, 0.35)' : 'rgba(245, 158, 11, 0.35)',
              border: adminUser.role === 'super_admin' ? '1px solid #818CF8' : '1px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              {adminUser.role === 'super_admin' ? '👑' : '🛡️'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#EEF2FF' }}>
                {adminUser.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: adminUser.role === 'super_admin' ? '#818CF8' : '#FCD34D',
                fontWeight: '600',
              }}>
                {adminUser.role === 'super_admin' ? 'Super Admin' : (adminUser.permissions?.assignedRegion || 'Sub-Admin Partner')}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '8px',
              color: '#FB7185',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
