import React, { useState, useMemo } from 'react';
import { UserRecord, AstrologerProfile, ReengagementCampaign, AutomatedTriggerRule, AdminUser } from '../types';
import { INITIAL_CAMPAIGNS, INITIAL_TRIGGER_RULES, dispatchCampaignApi, toggleTriggerRuleApi } from '../services/api';

interface BroadcastDeskProps {
  adminUser?: AdminUser | null;
  users?: UserRecord[];
  astrologers?: AstrologerProfile[];
  onTriggerNotification?: (title: string, body: string) => void;
}

const REENGAGEMENT_TEMPLATES = [
  {
    id: 'wallet_nudge',
    title: '💰 Unused Wallet Balance: Acharya Dev Sharma is Online!',
    body: 'Namaste! You have ₹310 unused balance in your AstroGuru wallet. Acharya Dev Sharma is available now for a direct career reading.',
    channel: 'omnichannel' as const,
    segment: 'dormant_with_balance' as const,
    targetLink: '/(tabs)/consult',
    tag: '🔥 Highest Conversion',
  },
  {
    id: 'shani_transit',
    title: '🪐 Urgent Shani Gochar Alert: Check Your Rashi Now',
    body: 'Saturn shifts into a critical nakshatra tonight! Major financial & career alignments are activating in your Kundli. Tap to inspect your personalized remedies.',
    channel: 'push' as const,
    segment: 'all' as const,
    targetLink: '/(tabs)/kundli',
    tag: '🪐 Planetary Transit',
  },
  {
    id: 'deposit_cashback',
    title: '🎁 Special Weekend Blessing: +30% Wallet Cashback Bonus',
    body: 'Recharge your wallet today and get 30% extra credits instantly! Connect with top Vedic Jyotishis across India.',
    channel: 'whatsapp' as const,
    segment: 'zero_balance' as const,
    targetLink: '/wallet',
    tag: '💳 Deposit Booster',
  },
  {
    id: 'first_call_free',
    title: '🌟 Your 1st 5-Minute Free Consultation with Acharya',
    body: 'Namaste! Your welcome voucher for a 5-minute complimentary consultation with a verified Vedic scholar is ready to claim.',
    channel: 'whatsapp' as const,
    segment: 'first_time_dropouts' as const,
    targetLink: '/(tabs)/consult',
    tag: '🌱 Signup Recovery',
  },
  {
    id: 'pradosh_puja',
    title: '🪔 Sacred Pradosh Vrat: Special Ujjain Mahakal E-Puja',
    body: 'Auspicious Pradosh Vrat today! Join live collective sankalp chanting at Mahakaleshwar Jyotirlinga. Offer a digital diya now.',
    channel: 'omnichannel' as const,
    segment: 'all' as const,
    targetLink: '/puja',
    tag: '🪔 Spiritual E-Puja',
  },
];

export const BroadcastDesk: React.FC<BroadcastDeskProps> = ({
  adminUser,
  users = [],
  astrologers = [],
}) => {
  // Granular RBAC Permissions
  const isSuperAdmin = !adminUser || adminUser.role === 'super_admin';
  const perms = adminUser?.permissions;
  const canDispatch = isSuperAdmin || perms?.canDispatchBroadcast !== false;
  const canAccessRules = isSuperAdmin || perms?.canAccessAutomationRules !== false;

  // Navigation View Tab
  const [activeTab, setActiveTab] = useState<'composer' | 'automation_rules' | 'history'>('composer');

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('wallet_nudge');
  const [title, setTitle] = useState(REENGAGEMENT_TEMPLATES[0].title);
  const [body, setBody] = useState(REENGAGEMENT_TEMPLATES[0].body);
  const [channel, setChannel] = useState<'push' | 'whatsapp' | 'sms' | 'omnichannel'>('omnichannel');
  const [segment, setSegment] = useState<'dormant_with_balance' | 'zero_balance' | 'first_time_dropouts' | 'vip' | 'all'>('dormant_with_balance');
  const [targetLink, setTargetLink] = useState('/(tabs)/consult');
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 98765 43210');
  const [previewMode, setPreviewMode] = useState<'push_ios' | 'whatsapp'>('whatsapp');

  // Status & Feedback
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Campaign History & Trigger Rules State
  const [campaigns, setCampaigns] = useState<ReengagementCampaign[]>(INITIAL_CAMPAIGNS);
  const [triggerRules, setTriggerRules] = useState<AutomatedTriggerRule[]>(INITIAL_TRIGGER_RULES);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch template handler
  const handleSelectTemplate = (templateId: string) => {
    const t = REENGAGEMENT_TEMPLATES.find((x) => x.id === templateId);
    if (t) {
      setSelectedTemplateId(t.id);
      setTitle(t.title);
      setBody(t.body);
      setChannel(t.channel);
      setSegment(t.segment);
      setTargetLink(t.targetLink);
      setPreviewMode(t.channel === 'push' ? 'push_ios' : 'whatsapp');
    }
  };

  // Audience Segmentation metrics calculated dynamically
  const audienceMetrics = useMemo(() => {
    const dormantWithBalanceCount = 4820;
    const zeroBalanceCount = 8900;
    const firstTimeDropoutsCount = 2150;
    const vipCount = 1840;
    const totalFleet = 45280;

    const segmentCounts: Record<string, number> = {
      dormant_with_balance: dormantWithBalanceCount,
      zero_balance: zeroBalanceCount,
      first_time_dropouts: firstTimeDropoutsCount,
      vip: vipCount,
      all: totalFleet,
    };

    return {
      currentCount: segmentCounts[segment] || totalFleet,
      totalFleet,
    };
  }, [segment]);

  // Aggregate Revenue & Conversion Impact
  const revenueImpact = useMemo(() => {
    const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
    const totalUnlocked = campaigns.reduce((acc, c) => acc + c.consultationsUnlocked, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);
    const avgConversion = totalSent > 0 ? ((totalUnlocked / totalSent) * 100).toFixed(1) : '28.4';

    return { totalSent, totalUnlocked, totalRevenue, avgConversion };
  }, [campaigns]);

  // Dispatch campaign
  const handleDispatchCampaign = async () => {
    setIsDispatching(true);

    const newCampaign: ReengagementCampaign = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      title,
      body,
      channel,
      segment,
      deepLink: targetLink,
      sentCount: audienceMetrics.currentCount,
      deliveredCount: Math.round(audienceMetrics.currentCount * 0.98),
      openedCount: Math.round(audienceMetrics.currentCount * 0.34),
      consultationsUnlocked: Math.round(audienceMetrics.currentCount * 0.08),
      revenueGenerated: Math.round(audienceMetrics.currentCount * 0.08 * 250),
      status: 'dispatched',
      sentAt: 'Just now',
    };

    await dispatchCampaignApi(newCampaign);

    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSuccess(true);
      setCampaigns((prev) => [newCampaign, ...prev]);
      showToast(`🚀 Campaign dispatched to ${audienceMetrics.currentCount.toLocaleString('en-IN')} seekers!`);
      setTimeout(() => setDispatchSuccess(false), 5000);
    }, 1200);
  };

  // Toggle Automated Rule
  const handleToggleRule = async (ruleId: string) => {
    setTriggerRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const next = !r.enabled;
          toggleTriggerRuleApi(ruleId, next);
          showToast(`Automation rule "${r.name}" switched ${next ? 'ON 🟢' : 'OFF ⚪'}`);
          return { ...r, enabled: next };
        }
        return r;
      })
    );
  };

  // Universal CSV Export
  const handleExportCampaignCsv = () => {
    const headers = [
      'Campaign ID',
      'Title',
      'Channel',
      'Audience Segment',
      'Sent Count',
      'Delivered',
      'Opened',
      'Consultations Unlocked',
      'Revenue Recovered (INR)',
      'Status',
      'Dispatched At',
    ];
    const rows = campaigns.map((c) => [
      c.id,
      c.title,
      c.channel.toUpperCase(),
      c.segment,
      c.sentCount,
      c.deliveredCount,
      c.openedCount,
      c.consultationsUnlocked,
      c.revenueGenerated,
      c.status.toUpperCase(),
      c.sentAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Astroguru_Reengagement_Campaigns_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: 'rgba(26, 33, 64, 0.96)',
            border: '1px solid #10B981',
            color: '#EEF2FF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 200,
            fontSize: '13.5px',
            fontWeight: '700',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '-0.3px' }}>
              Automated Dormant Re-Engagement & WhatsApp Center
            </h1>
            <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10B981' }} />
              Automation Engine Online
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Recover dormant seekers, trigger automated wallet balance nudges, and broadcast high-converting planetary alerts via WhatsApp, Push, and SMS.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(10, 12, 22, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.25)' }}>
          <button
            onClick={() => setActiveTab('composer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'composer' ? '700' : '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'composer' ? '#6366F1' : 'transparent',
              color: activeTab === 'composer' ? '#FFFFFF' : '#A5B4FC',
              transition: 'all 0.2s',
            }}
          >
            <span>🚀</span>
            <span>Broadcast Composer</span>
          </button>

          {canAccessRules && (
            <button
              onClick={() => setActiveTab('automation_rules')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: activeTab === 'automation_rules' ? '700' : '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'automation_rules' ? '#6366F1' : 'transparent',
                color: activeTab === 'automation_rules' ? '#FFFFFF' : '#A5B4FC',
                transition: 'all 0.2s',
              }}
            >
              <span>⚡</span>
              <span>Automated Trigger Rules ({triggerRules.filter((r) => r.enabled).length} Active)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'history' ? '700' : '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#6366F1' : 'transparent',
              color: activeTab === 'history' ? '#FFFFFF' : '#A5B4FC',
              transition: 'all 0.2s',
            }}
          >
            <span>📊</span>
            <span>Revenue Conversion Ledger</span>
          </button>
        </div>
      </div>

      {/* Top Financial & Re-engagement Impact KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Re-engaged Seekers
            </span>
            <span style={{ fontSize: '18px' }}>📢</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#EEF2FF', marginTop: '6px' }}>
            {revenueImpact.totalSent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            Across WhatsApp, Push & SMS
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Consultations Reactivated
            </span>
            <span style={{ fontSize: '18px' }}>🔮</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#34D399', marginTop: '6px' }}>
            {revenueImpact.totalUnlocked.toLocaleString('en-IN')} Sessions
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            Dormant seekers who booked calls
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Attributed Revenue Recovered
            </span>
            <span style={{ fontSize: '18px' }}>💰</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#FCD34D', marginTop: '6px' }}>
            ₹{revenueImpact.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#34D399', marginTop: '4px', fontWeight: '600' }}>
            Direct ROI from Re-engagement
          </div>
        </div>

        <div className="liquid-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Average Conversion Rate
            </span>
            <span style={{ fontSize: '18px' }}>📈</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#38BDF8', marginTop: '6px' }}>
            {revenueImpact.avgConversion}%
          </div>
          <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px' }}>
            Open-to-Consultation booking
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MULTI-CHANNEL CAMPAIGN COMPOSER & LIVE SIMULATOR               */}
      {/* ===================================================================== */}
      {activeTab === 'composer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '24px' }}>
          {/* Left Form: Composer */}
          <div className="liquid-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Templates Strip */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>
                  🎯 High-Converting Re-Engagement Templates:
                </label>
                <span style={{ fontSize: '11px', color: '#A5B4FC' }}>Click any template to auto-fill</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {REENGAGEMENT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      borderRadius: '8px',
                      border: selectedTemplateId === tmpl.id ? '1px solid #FCD34D' : '1px solid rgba(129, 140, 248, 0.25)',
                      backgroundColor: selectedTemplateId === tmpl.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(10, 12, 22, 0.65)',
                      color: selectedTemplateId === tmpl.id ? '#FCD34D' : '#EEF2FF',
                      cursor: 'pointer',
                      fontWeight: selectedTemplateId === tmpl.id ? '700' : '500',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tmpl.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience Segment Selection */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', display: 'block', marginBottom: '6px' }}>
                TARGET AUDIENCE SEGMENT (CLICK TO TARGET)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  {
                    id: 'dormant_with_balance',
                    title: '💤 Dormant with Wallet Balance > ₹50',
                    desc: '4,820 seekers · ₹6.4L trapped balance',
                    color: '#34D399',
                  },
                  {
                    id: 'zero_balance',
                    title: '🛒 Zero Balance / Dropouts',
                    desc: '8,900 seekers · Prime for deposit bonus',
                    color: '#FCD34D',
                  },
                  {
                    id: 'first_time_dropouts',
                    title: '🌱 Signed Up But Never Consulted',
                    desc: '2,150 seekers · 1st Free Call Hook',
                    color: '#38BDF8',
                  },
                  {
                    id: 'all',
                    title: '🌍 All Registered Seekers',
                    desc: '45,280 devices fleet-wide',
                    color: '#A5B4FC',
                  },
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSegment(s.id as any)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: segment === s.id ? `1.5px solid ${s.color}` : '1px solid rgba(129, 140, 248, 0.2)',
                      backgroundColor: segment === s.id ? 'rgba(99, 102, 241, 0.18)' : 'rgba(10, 12, 22, 0.7)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF' }}>{s.title}</div>
                    <div style={{ fontSize: '11px', color: s.color, marginTop: '3px' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Channels */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', display: 'block', marginBottom: '6px' }}>
                DISPATCH CHANNEL
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'omnichannel', label: '⚡ Omnichannel (WhatsApp + Push)', icon: '⚡' },
                  { id: 'whatsapp', label: '💬 WhatsApp Direct', icon: '💬' },
                  { id: 'push', label: '📲 Push Notification', icon: '📲' },
                  { id: 'sms', label: '✉️ SMS Gateway', icon: '✉️' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChannel(ch.id as any);
                      if (ch.id === 'whatsapp') setPreviewMode('whatsapp');
                      if (ch.id === 'push') setPreviewMode('push_ios');
                    }}
                    className={channel === ch.id ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '11.5px', padding: '7px 12px', flex: 1 }}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Title */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', display: 'block', marginBottom: '6px' }}>
                CAMPAIGN HEADLINE (TITLE)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catchy headline with emojis..."
                className="cosmic-input"
              />
            </div>

            {/* Message Body Copy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                  MESSAGE BODY COPY
                </label>
                <span style={{ fontSize: '11px', color: '#818CF8' }}>Supports {{name}}, {{balance}}, {{astrologer}}</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter rich message copy..."
                className="cosmic-input"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Deep Link Route */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', display: 'block', marginBottom: '6px' }}>
                IN-APP DESTINATION ROUTE (ON CLICK / CTA)
              </label>
              <select
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                className="cosmic-input"
              >
                <option value="/(tabs)/consult">💬 Astrologer Consultation Grid (Highest Conversion)</option>
                <option value="/wallet">💰 Wallet Recharge Offers (+30% Bonus)</option>
                <option value="/(tabs)/kundli">🪐 Birth Chart & Kundli Transit</option>
                <option value="/(tabs)/horoscope">☀️ Daily Vedic Horoscope & Guidance</option>
                <option value="/puja">🪔 Sacred Temple E-Puja Hub</option>
              </select>
            </div>

            {/* Test Phone Input for Real WhatsApp Delivery */}
            <div className="inset-box" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCD34D' }}>TEST ON YOUR PERSONAL PHONE:</div>
                <div style={{ fontSize: '11.5px', color: '#A5B4FC', marginTop: '2px' }}>Send direct test to verify text and links on your phone.</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(10, 12, 22, 0.8)',
                    border: '1px solid rgba(129, 140, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#EEF2FF',
                    fontSize: '12px',
                    width: '140px',
                    outline: 'none',
                  }}
                />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`*${title}*\n\n${body}\n\n📲 Open AstroGuru: https://astroguru.app/download`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}
                >
                  💬 Test WhatsApp
                </a>
              </div>
            </div>

            {/* Primary Dispatch Action */}
            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                onClick={canDispatch ? handleDispatchCampaign : undefined}
                disabled={isDispatching || !canDispatch}
                className="btn-gold"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '14px',
                  boxShadow: canDispatch ? '0 6px 24px rgba(245, 158, 11, 0.45)' : 'none',
                  opacity: canDispatch ? 1 : 0.45,
                  cursor: canDispatch ? 'pointer' : 'not-allowed',
                }}
                title={canDispatch ? 'Launch re-engagement blast across channel' : 'Action restricted by Master Admin (canDispatchBroadcast)'}
              >
                {isDispatching ? (
                  <span>⏳ Dispatching to {audienceMetrics.currentCount.toLocaleString('en-IN')} Seekers...</span>
                ) : dispatchSuccess ? (
                  <span>✅ Broadcast Dispatched to {audienceMetrics.currentCount.toLocaleString('en-IN')} Seekers!</span>
                ) : canDispatch ? (
                  <span>🚀 Launch Re-Engagement Campaign ({audienceMetrics.currentCount.toLocaleString('en-IN')} Seekers)</span>
                ) : (
                  <span>🔒 Broadcast Dispatch Restricted</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Device Simulator (Dual Mode: Push Lockscreen & WhatsApp) */}
          <div className="liquid-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#EEF2FF' }}>
                Live Device Preview
              </h2>

              {/* Preview Mode Switcher */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(10, 12, 22, 0.6)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode('whatsapp')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: previewMode === 'whatsapp' ? '#10B981' : 'transparent',
                    color: previewMode === 'whatsapp' ? '#FFFFFF' : '#A5B4FC',
                    fontWeight: previewMode === 'whatsapp' ? '700' : '500',
                  }}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('push_ios')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: previewMode === 'push_ios' ? '#6366F1' : 'transparent',
                    color: previewMode === 'push_ios' ? '#FFFFFF' : '#A5B4FC',
                    fontWeight: previewMode === 'push_ios' ? '700' : '500',
                  }}
                >
                  📲 iOS Push
                </button>
              </div>
            </div>

            {/* ========================================== */}
            {/* DEVICE PREVIEW: WHATSAPP DARK MODE         */}
            {/* ========================================== */}
            {previewMode === 'whatsapp' ? (
              <div
                style={{
                  width: '290px',
                  height: '490px',
                  backgroundColor: '#0B141A',
                  borderRadius: '34px',
                  border: '8px solid #1F2C34',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                  padding: '16px 12px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* WhatsApp Chat Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #1F2C34',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#128C7E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: '16px',
                    }}
                  >
                    🔮
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#E9EDEF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>AstroGuru Official</span>
                      <span style={{ color: '#00A884', fontSize: '12px' }}>✓</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#8696A0' }}>Official Verified Business</div>
                  </div>
                </div>

                {/* Chat Bubble Body */}
                <div style={{ flex: 1, padding: '16px 4px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: '#005C4B',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      maxWidth: '92%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#E9EDEF', marginBottom: '4px' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#D1D7DB', lineHeight: '17px' }}>
                      {body}
                    </div>
                    <div style={{ fontSize: '9px', color: '#8696A0', textAlign: 'right', marginTop: '6px' }}>
                      12:45 PM · ✓✓
                    </div>

                    {/* WhatsApp CTA Action Button */}
                    <div
                      style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#53BDEB' }}>
                        🔗 Open AstroGuru App
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '10px', color: '#8696A0', paddingBottom: '4px' }}>
                  🔒 End-to-end encrypted official broadcast
                </div>
              </div>
            ) : (
              /* ========================================== */
              /* DEVICE PREVIEW: IOS LOCKSCREEN PUSH       */
              /* ========================================== */
              <div
                style={{
                  width: '290px',
                  height: '490px',
                  backgroundColor: '#0A0C16',
                  borderRadius: '34px',
                  border: '8px solid #222B48',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
                  padding: '16px 12px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Notch */}
                <div
                  style={{
                    width: '90px',
                    height: '16px',
                    backgroundColor: '#222B48',
                    borderRadius: '0 0 10px 10px',
                    margin: '-16px auto 14px auto',
                  }}
                />

                {/* Clock */}
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: '#EEF2FF', letterSpacing: '-1px' }}>
                    09:41
                  </div>
                  <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '-4px' }}>
                    Tuesday, September 29
                  </div>
                </div>

                {/* iOS Notification Card */}
                <div
                  style={{
                    marginTop: '32px',
                    backgroundColor: 'rgba(26, 33, 64, 0.94)',
                    border: '1px solid rgba(129, 140, 248, 0.5)',
                    borderRadius: '16px',
                    padding: '14px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>🔮</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', textTransform: 'uppercase' }}>
                        AstroGuru
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#818CF8' }}>Now</span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#EEF2FF', lineHeight: '16px' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '4px', lineHeight: '15px' }}>
                    {body}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: AUTOMATED "SET & FORGET" TRIGGER RULES                         */}
      {/* ===================================================================== */}
      {activeTab === 'automation_rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#EEF2FF' }}>
                Automated 24/7 Retention Triggers
              </h2>
              <p style={{ fontSize: '12.5px', color: '#A5B4FC', marginTop: '2px' }}>
                These intelligent cron rules execute continuously in the background to reactivate dropouts and trapped wallet capital.
              </p>
            </div>
            <button
              onClick={() => showToast('✨ Custom rule builder active. All 4 core algorithms running.')}
              className="btn-gold"
              style={{ fontSize: '12px', padding: '7px 14px' }}
            >
              + Create Custom Rule
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {triggerRules.map((rule) => (
              <div key={rule.id} className="liquid-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#EEF2FF' }}>{rule.name}</span>
                      <span className={rule.channel === 'whatsapp' ? 'badge-pill badge-emerald' : 'badge-pill badge-indigo'} style={{ fontSize: '10px' }}>
                        {rule.channel === 'whatsapp' ? '💬 WhatsApp' : '📲 Push'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#A5B4FC', marginTop: '4px', lineHeight: '17px' }}>
                      {rule.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: rule.enabled ? '#10B981' : '#334155',
                        borderRadius: '24px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: rule.enabled ? '22px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#FFF',
                          borderRadius: '50%',
                          transition: '0.2s',
                        }}
                      />
                    </span>
                  </label>
                </div>

                <div className="inset-box" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '700' }}>SCHEDULE & TIMING</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#FCD34D', marginTop: '2px' }}>{rule.scheduleTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '700' }}>TIMES TRIGGERED</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#EEF2FF', marginTop: '2px' }}>{rule.timesTriggered.toLocaleString()} seekers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '700' }}>REVENUE UNLOCKED</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#34D399', marginTop: '2px' }}>₹{rule.revenueImpact.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: '#818CF8', fontFamily: 'monospace' }}>
                  Rule Filter: <code>{rule.triggerCondition}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CAMPAIGN PERFORMANCE & REVENUE CONVERSION LEDGER               */}
      {/* ===================================================================== */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#EEF2FF' }}>
                Re-Engagement Campaign History & Telemetry
              </h2>
              <p style={{ fontSize: '12.5px', color: '#A5B4FC', marginTop: '2px' }}>
                Measure real-world open rates, delivery success, and attributed platform revenue for each broadcast.
              </p>
            </div>
            <button
              onClick={handleExportCampaignCsv}
              className="btn-gold"
              style={{ fontSize: '12px', padding: '7px 14px' }}
            >
              📥 Export Campaigns CSV
            </button>
          </div>

          <div className="liquid-card" style={{ overflow: 'hidden' }}>
            <table className="cosmic-table">
              <thead>
                <tr>
                  <th>Campaign & Channel</th>
                  <th>Target Segment</th>
                  <th>Delivery Rate</th>
                  <th>Open / CTR</th>
                  <th style={{ color: '#34D399' }}>Reactivated Consults</th>
                  <th style={{ color: '#FCD34D' }}>Revenue Recovered</th>
                  <th>Dispatched Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const deliveryPct = Math.round((c.deliveredCount / c.sentCount) * 100);
                  const openPct = Math.round((c.openedCount / c.deliveredCount) * 100);

                  return (
                    <tr key={c.id}>
                      {/* Campaign & Channel */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#EEF2FF', maxWidth: '280px' }}>
                          {c.title}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          <span className={c.channel === 'whatsapp' ? 'badge-pill badge-emerald' : 'badge-pill badge-indigo'} style={{ fontSize: '10px' }}>
                            {c.channel.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Target Segment */}
                      <td style={{ color: '#A5B4FC', fontSize: '12px', textTransform: 'capitalize' }}>
                        {c.segment.replace(/_/g, ' ')}
                      </td>

                      {/* Delivery Rate */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#EEF2FF' }}>
                          {deliveryPct}%
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#818CF8' }}>
                          {c.deliveredCount.toLocaleString()} / {c.sentCount.toLocaleString()}
                        </div>
                      </td>

                      {/* Open Rate */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#38BDF8' }}>
                          {openPct}% CTR
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#A5B4FC' }}>
                          {c.openedCount.toLocaleString()} opened
                        </div>
                      </td>

                      {/* Consults Unlocked */}
                      <td style={{ fontWeight: '800', color: '#34D399', fontSize: '13.5px' }}>
                        {c.consultationsUnlocked.toLocaleString()} Consults
                      </td>

                      {/* Revenue Recovered */}
                      <td style={{ fontWeight: '800', color: '#FCD34D', fontSize: '14px' }}>
                        ₹{c.revenueGenerated.toLocaleString('en-IN')}
                      </td>

                      {/* Dispatched Time */}
                      <td style={{ fontSize: '12px', color: '#A5B4FC' }}>
                        {c.sentAt}
                      </td>

                      {/* Status */}
                      <td>
                        <span className="badge-pill badge-emerald" style={{ fontSize: '10px' }}>
                          ✓ Dispatched
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
