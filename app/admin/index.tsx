import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Astrologer } from '../../src/types';
import { useRemediesStore } from '../../src/store/remediesStore';
import { useSpellsStore } from '../../src/store/spellsStore';
import { formatCurrency } from '../../src/utils';

import { sendAdminBroadcastPushNotification, scheduleLocalPushNotification } from '../../src/services/pushNotificationService';
import { useUpdateStore } from '../../src/store/updateStore';
import { useAdminIntelStore, BannedEntity, SecurityIncident } from '../../src/store/adminIntelStore';

type AdminTab = 'overview' | 'security' | 'analytics' | 'spells' | 'orders' | 'inventory' | 'astrologers' | 'revenue' | 'users' | 'push_notifications';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([...ASTROLOGERS]);
  // Admin Intelligence & Security Store (Features 6 & 7)
  const intelIncidents = useAdminIntelStore((s) => s.incidents);
  const intelBlacklist = useAdminIntelStore((s) => s.blacklist);
  const blockedFreeChatCount = useAdminIntelStore((s) => s.blockedFreeChatCount);
  const interceptedBypassCount = useAdminIntelStore((s) => s.interceptedBypassCount);
  const hourlyTraffic = useAdminIntelStore((s) => s.hourlyTraffic);
  const astrologerScorecards = useAdminIntelStore((s) => s.astrologerScorecards);
  const dutyAlertSentTime = useAdminIntelStore((s) => s.dutyAlertSentTime);
  const banEntity = useAdminIntelStore((s) => s.banEntity);
  const unbanEntity = useAdminIntelStore((s) => s.unbanEntity);
  const resolveIncident = useAdminIntelStore((s) => s.resolveIncident);
  const issueStrike = useAdminIntelStore((s) => s.issueStrike);
  const banFromIncident = useAdminIntelStore((s) => s.banFromIncident);
  const dismissIncident = useAdminIntelStore((s) => s.dismissIncident);
  const triggerDutyAlert = useAdminIntelStore((s) => s.triggerDutyAlert);

  // Ban Hammer & Action States
  const [showBanModal, setShowBanModal] = useState(false);
  const [banIdentifier, setBanIdentifier] = useState('');
  const [banName, setBanName] = useState('');
  const [banEntityType, setBanEntityType] = useState<'device' | 'user' | 'astrologer' | 'phone'>('device');
  const [banReason, setBanReason] = useState('Free-Chat Multi-Account Farming');
  const [banDuration, setBanDuration] = useState<'24 Hours' | '7 Days' | '30 Days' | 'Permanent'>('Permanent');
  const [securityActionMsg, setSecurityActionMsg] = useState<string | null>(null);
  const [dutyAlertSuccess, setDutyAlertSuccess] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setSecurityActionMsg(msg);
    setTimeout(() => setSecurityActionMsg(null), 4500);
  };

  const handleExecuteBan = () => {
    if (!banIdentifier.trim()) return;
    banEntity({
      entityType: banEntityType,
      identifier: banIdentifier.trim(),
      name: banName.trim() || banIdentifier.trim(),
      reason: banReason,
      duration: banDuration,
    });
    setShowBanModal(false);
    setBanIdentifier('');
    setBanName('');
    triggerFeedback(`🔨 ${banEntityType.toUpperCase()} "${banIdentifier}" successfully placed on Blacklist!`);
  };

  const handleSendDutyAlert = () => {
    triggerDutyAlert();
    setDutyAlertSuccess('📢 Peak Demand Alert sent! 18 off-duty astrologers notified via high-priority push.');
    setTimeout(() => setDutyAlertSuccess(null), 5000);
  };

  // Manual App Update Broadcast States
  const broadcastUpdate = useUpdateStore((s) => s.broadcastUpdate);
  const currentAppVersion = useUpdateStore((s) => s.currentVersion);
  const [updateVerInput, setUpdateVerInput] = useState('1.6.0');
  const [updateNotesInput, setUpdateNotesInput] = useState(
    '⚡ New Performance Enhancements & Vedic Astrology Algorithms\n✨ Theme 4 Dark Obsidian Updates\n📱 Live Experts Consultation Improvements'
  );
  const [otaBroadcastSuccess, setOtaBroadcastSuccess] = useState<string | null>(null);

  const handleBroadcastAppUpdate = () => {
    if (!updateVerInput.trim()) return;
    const notesArray = updateNotesInput
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    broadcastUpdate(updateVerInput.trim(), notesArray, false);

    setOtaBroadcastSuccess(
      `🎉 App Update v${updateVerInput.trim()} broadcasted! Mobile users will now receive the update modal.`
    );
  };

  // Push Broadcast States
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'vip' | 'astrologers'>('all');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  const handleSendBroadcast = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setSendingBroadcast(true);
    setBroadcastSuccess(null);

    await sendAdminBroadcastPushNotification({
      title: notifTitle,
      body: notifBody,
      type: 'astrologer_live',
    });

    setSendingBroadcast(false);
    setBroadcastSuccess('🎉 Broadcast push notification successfully sent to 14,200 active devices!');
    setNotifTitle('');
    setNotifBody('');
  };

  // Remedies & Spells Stores
  const inventory = useRemediesStore((s) => s.inventory);
  const orders = useRemediesStore((s) => s.orders);
  const updateItemPrice = useRemediesStore((s) => s.updateItemPrice);
  const updateItemStock = useRemediesStore((s) => s.updateItemStock);
  const toggleItemAvailable = useRemediesStore((s) => s.toggleItemAvailable);
  const updateOrderStatus = useRemediesStore((s) => s.updateOrderStatus);

  const spells = useSpellsStore((s) => s.spells);
  const spellOrders = useSpellsStore((s) => s.spellOrders);
  const updateSpellPrice = useSpellsStore((s) => s.updateSpellPrice);
  const toggleSpellAvailable = useSpellsStore((s) => s.toggleSpellAvailable);
  const updateSpellOrderStatus = useSpellsStore((s) => s.updateSpellOrderStatus);

  // Modal for adding new astrologer
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Vedic Astrology');
  const [newPrice, setNewPrice] = useState('25');
  const [newExp, setNewExp] = useState('8');
  const [newLang, setNewLang] = useState('Hindi, English');

  // Toggle online/offline status & trigger automatic push notification
  const toggleStatus = (id: string) => {
    setAstrologers((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newStatus = !a.online;
          if (newStatus) {
            scheduleLocalPushNotification({
              title: `🔴 ${a.name} is NOW LIVE!`,
              body: `${a.specialties?.join(', ') || 'Senior Vedic Jyotishi'} is active for instant consultation (₹${a.pricePerMin}/min). Tap to connect now!`,
              type: 'astrologer_live',
              actionUrl: `/astrologer/${a.id}`,
              avatarUrl: a.avatar,
            });
          }
          return { ...a, online: newStatus };
        }
        return a;
      })
    );
  };

  // Edit Astrologer Price & Experience
  const updateAstroPrice = (id: string, newPrice: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pricePerMin: newPrice } : a))
    );
  };

  const updateAstroExp = (id: string, newExp: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, experienceYears: newExp } : a))
    );
  };

  // Add new astrologer
  const handleAddAstrologer = () => {
    if (!newName.trim()) return;
    const newAstro: Astrologer = {
      id: `astro-${Date.now()}`,
      name: newName.trim(),
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200`,
      rating: 4.9,
      reviews: 12,
      pricePerMin: Number(newPrice) || 25,
      experienceYears: Number(newExp) || 5,
      specialties: newSpecialty.split(',').map((s) => s.trim()),
      languages: newLang.split(',').map((l) => l.trim()),
      consultations: 5,
      online: true,
      about: 'Senior Vedic astrologer newly added to AstroGuru panel.',
    };
    setAstrologers([newAstro, ...astrologers]);
    setShowAddModal(false);
    setNewName('');
  };

  const activeCount = astrologers.filter((a) => a.online).length;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Admin Header */}
        <ScreenHeader
          title="⚡ Admin Control Panel"
          subtitle="Platform & E-Commerce Operations"
          showBack
          hideLanguage
        />

        {/* Tab Switcher Wrapper with Fixed Height */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={{ flexGrow: 0 }}
          >
            {[
              { id: 'overview', label: '📊 Stats' },
              { id: 'security', label: `🛡️ Watchtower (${intelIncidents.filter((i) => i.status === 'flagged').length})` },
              { id: 'analytics', label: '🔥 Heatmap & BI' },
              { id: 'spells', label: `🪄 Spells (${spells.length})` },
              { id: 'orders', label: `🛒 Orders (${orders.length})` },
              { id: 'inventory', label: '📦 Inventory' },
              { id: 'astrologers', label: '🔮 Experts' },
              { id: 'revenue', label: '💸 Revenue' },
              { id: 'users', label: '👥 Users' },
              { id: 'push_notifications', label: '🔔 Broadcast Push' },
            ].map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id as AdminTab)}
                style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              >
                {tab === t.id && (
                  <LinearGradient
                    colors={[colors.saffron, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.tabBtnText, tab === t.id && styles.tabBtnTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <View style={{ gap: spacing.md }}>
              {/* Stat Cards Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statNum}>₹1,42,800</Text>
                  <Text style={styles.statTitle}>Total Gross Revenue</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🚨</Text>
                  <Text style={[styles.statNum, { color: '#F87171' }]}>
                    {intelIncidents.filter((i) => i.status === 'flagged').length}
                  </Text>
                  <Text style={styles.statTitle}>Active Threat Alerts</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={[styles.statNum, { color: colors.gold }]}>1,620 / hr</Text>
                  <Text style={styles.statTitle}>Peak Demand (10 PM)</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🔮</Text>
                  <Text style={styles.statNum}>{activeCount} / {astrologers.length}</Text>
                  <Text style={styles.statTitle}>Online Experts</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🪄</Text>
                  <Text style={styles.statNum}>{spellOrders.length} Spells</Text>
                  <Text style={styles.statTitle}>Spells Booked</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🛒</Text>
                  <Text style={styles.statNum}>{orders.length} Orders</Text>
                  <Text style={styles.statTitle}>Shopping Completed</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <Card style={{ gap: spacing.md }}>
                <SectionHeader title="Platform Controls" />
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                  <Button
                    label="🛡️ Anti-Fraud Desk"
                    variant="gold"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('security')}
                  />
                  <Button
                    label="🔥 Traffic Heatmap"
                    variant="coral"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('analytics')}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button
                    label="🛒 Manage Orders"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => setTab('orders')}
                  />
                  <Button
                    label="🪄 Manage Spells"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => setTab('spells')}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* ── 🛡️ SECURITY & ANTI-FRAUD WATCHTOWER TAB ── */}
          {tab === 'security' && (
            <View style={{ gap: spacing.md }}>
              {/* Feedback toast */}
              {securityActionMsg && (
                <View style={styles.actionFeedbackPill}>
                  <Text style={styles.actionFeedbackText}>{securityActionMsg}</Text>
                </View>
              )}

              {/* Top Metrics Row */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🚨</Text>
                  <Text style={[styles.statNum, { color: '#F87171' }]}>
                    {intelIncidents.filter((i) => i.status === 'flagged').length}
                  </Text>
                  <Text style={styles.statTitle}>Active Threat Alerts</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🛡️</Text>
                  <Text style={[styles.statNum, { color: colors.teal }]}>
                    {blockedFreeChatCount}
                  </Text>
                  <Text style={styles.statTitle}>Free-Chat Abuses Blocked</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>👁️</Text>
                  <Text style={[styles.statNum, { color: colors.gold }]}>
                    {interceptedBypassCount}
                  </Text>
                  <Text style={styles.statTitle}>Contact Bypasses Intercepted</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🚫</Text>
                  <Text style={styles.statNum}>{intelBlacklist.length}</Text>
                  <Text style={styles.statTitle}>Active Blacklisted Entities</Text>
                </View>
              </View>

              {/* Ban Hammer CTA Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <SectionHeader
                    title="🚨 Live Threat Interceptions"
                    subtitle="AI heuristic scanner for multi-account farming & off-platform leaks"
                  />
                </View>
                <Button
                  label="🔨 Manual Ban"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setShowBanModal(true)}
                />
              </View>

              {/* Incidents List */}
              {intelIncidents.map((inc) => {
                const isFlagged = inc.status === 'flagged';
                const sevColor =
                  inc.severity === 'critical'
                    ? '#EF4444'
                    : inc.severity === 'warning'
                    ? '#F59E0B'
                    : '#06B6D4';

                return (
                  <Card key={inc.id} style={styles.incidentCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <View
                            style={{
                              backgroundColor: `${sevColor}22`,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: radius.pill,
                              borderWidth: 1,
                              borderColor: `${sevColor}55`,
                            }}
                          >
                            <Text style={{ ...typography.tiny, color: sevColor, fontWeight: '800', fontSize: 10.5 }}>
                              {inc.severity.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.incidentTitle}>{inc.title}</Text>
                        </View>
                        <Text style={styles.incidentTimestamp}>
                          Detected {inc.timestamp} · Target: {inc.targetName} ({inc.targetRole.toUpperCase()})
                        </Text>
                      </View>

                      <Chip
                        label={inc.status.toUpperCase()}
                        tone={inc.status === 'banned' ? 'rose' : inc.status === 'resolved' ? 'teal' : 'gold'}
                      />
                    </View>

                    {/* Evidence Box */}
                    <View style={styles.evidenceBox}>
                      <Text style={styles.evidenceMeta}>
                        📱 Phone: <Text style={{ color: '#EEF2FF' }}>{inc.phone || 'N/A'}</Text>
                        {inc.deviceUuid ? ` · Device UUID: ${inc.deviceUuid}` : ''}
                      </Text>
                      <Text style={styles.evidenceText}>"{inc.evidence}"</Text>
                    </View>

                    {/* Actions */}
                    {isFlagged && (
                      <View style={styles.incidentActionsRow}>
                        <Pressable
                          onPress={() => {
                            banFromIncident(inc.id, inc.title);
                            triggerFeedback(`🔨 Banned ${inc.targetName} & added to Blacklist`);
                          }}
                          style={[styles.incBtn, styles.incBtnBan]}
                        >
                          <Text style={styles.incBtnBanText}>🔨 Ban Device & User</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            issueStrike(inc.id);
                            triggerFeedback(`⚠️ Issued formal strike to ${inc.targetName}`);
                          }}
                          style={[styles.incBtn, styles.incBtnStrike]}
                        >
                          <Text style={styles.incBtnStrikeText}>⚠️ Issue Strike</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => {
                            dismissIncident(inc.id);
                            triggerFeedback(`✅ Incident ${inc.id} dismissed`);
                          }}
                          style={[styles.incBtn, styles.incBtnDismiss]}
                        >
                          <Text style={styles.incBtnDismissText}>Dismiss</Text>
                        </Pressable>
                      </View>
                    )}
                  </Card>
                );
              })}

              {/* Active Blacklist Section */}
              <SectionHeader
                title={`🚫 Active Blacklist Ledger (${intelBlacklist.length})`}
                subtitle="Currently enforced device hardware blocks, phone bans & frozen accounts"
              />

              {intelBlacklist.map((b) => (
                <Card key={b.id} style={styles.blacklistCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                      <Text style={{ fontSize: 24 }}>
                        {b.entityType === 'device' ? '📱' : b.entityType === 'astrologer' ? '🧙‍♂️' : b.entityType === 'phone' ? '📞' : '👤'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.blacklistName}>{b.name}</Text>
                          <View style={styles.durationBadge}>
                            <Text style={styles.durationBadgeText}>{b.duration}</Text>
                          </View>
                        </View>
                        <Text style={styles.blacklistIdentifier}>{b.identifier}</Text>
                        <Text style={styles.blacklistReason}>Reason: {b.reason}</Text>
                        <Text style={styles.blacklistDate}>Banned on: {b.bannedAt}</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => {
                        unbanEntity(b.id);
                        triggerFeedback(`🔓 Restored "${b.name}" from blacklist`);
                      }}
                      style={styles.unbanBtn}
                    >
                      <Text style={styles.unbanBtnText}>🔓 Restore</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── 📊 BUSINESS INTELLIGENCE & TRAFFIC HEATMAP TAB ── */}
          {tab === 'analytics' && (
            <View style={{ gap: spacing.md }}>
              {/* Duty Alert Confirmation Toast */}
              {dutyAlertSuccess && (
                <View style={styles.dutyToast}>
                  <Text style={styles.dutyToastText}>{dutyAlertSuccess}</Text>
                </View>
              )}

              {/* Top Executive KPI Matrix */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>📈</Text>
                  <Text style={[styles.statNum, { color: colors.gold }]}>₹18,45,200</Text>
                  <Text style={styles.statTitle}>Monthly GMV (+24.5%)</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>⏳</Text>
                  <Text style={[styles.statNum, { color: '#818CF8' }]}>14.2 Mins</Text>
                  <Text style={styles.statTitle}>Avg Session Duration</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🔄</Text>
                  <Text style={[styles.statNum, { color: colors.teal }]}>68.4%</Text>
                  <Text style={styles.statTitle}>D-30 Seeker Retention</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🎧</Text>
                  <Text style={[styles.statNum, { color: '#F472B6' }]}>14,820</Text>
                  <Text style={styles.statTitle}>Total Sessions Completed</Text>
                </View>
              </View>

              {/* 24-Hour Peak Consultation Heatmap Card */}
              <Card style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.heatmapCardTitle}>🔥 24-Hour Consultation Traffic Heatmap</Text>
                    <Text style={styles.heatmapCardSub}>Hourly session distribution & peak demand density</Text>
                  </View>
                  <View style={styles.peakTag}>
                    <Text style={styles.peakTagText}>PEAK: 8 PM – 12 AM</Text>
                  </View>
                </View>

                {/* Supply Deficit Warning Box */}
                <View style={styles.deficitBox}>
                  <Text style={{ fontSize: 22 }}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deficitTitle}>Peak Demand Supply Deficit</Text>
                    <Text style={styles.deficitDesc}>
                      Seeker traffic surges to 1,620 consults/hr at 10 PM. Estimated 22 additional astrologers needed on duty to maintain &lt;30s wait queue.
                    </Text>
                  </View>
                </View>

                <Button
                  label="📢 Broadcast Peak Duty Alert to Astrologers"
                  variant="gold"
                  size="sm"
                  onPress={handleSendDutyAlert}
                />

                {dutyAlertSentTime && (
                  <Text style={styles.alertTimestamp}>
                    Last broadcast dispatched today at {dutyAlertSentTime}
                  </Text>
                )}

                {/* 24-Hour Interactive Bar Matrix */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barsContainer}>
                  {hourlyTraffic.map((h) => {
                    const barHeight = Math.max(14, Math.round((h.consultations / 1620) * 120));
                    return (
                      <View key={h.hour} style={styles.barCol}>
                        <Text style={styles.barCount}>{h.consultations}</Text>
                        <View style={styles.barTrack}>
                          <LinearGradient
                            colors={h.isPeak ? ['#FF3366', '#F59E0B'] : ['#818CF8', '#38BDF8']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={[styles.barFill, { height: barHeight }]}
                          />
                        </View>
                        <Text style={[styles.barHourLabel, h.isPeak && { color: colors.gold, fontWeight: '800' }]}>
                          {h.label}
                        </Text>
                        <View style={[styles.astroCountPill, h.isPeak && styles.astroCountPillPeak]}>
                          <Text style={styles.astroCountText}>🧙‍♂️ {h.astrologersOnDuty}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </Card>

              {/* Astrologer Performance Leaderboard */}
              <SectionHeader
                title="🏆 Astrologer Performance Scorecard"
                subtitle="Ranked by repeat consultation retention, customer rating and pickup SLA"
              />

              {astrologerScorecards.map((sc, idx) => (
                <Card key={sc.id} style={styles.scorecardItem}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                    </View>
                    <Avatar uri={sc.avatar} name={sc.name} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scName}>{sc.name}</Text>
                      <Text style={styles.scSpec}>{sc.specialty}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.scRating}>⭐ {sc.rating}</Text>
                      <Text style={styles.scRevenue}>{formatCurrency(sc.grossRevenue)}</Text>
                    </View>
                  </View>

                  {/* Metrics Row */}
                  <View style={styles.scMetricsRow}>
                    <View style={styles.scMetricCell}>
                      <Text style={styles.scMetricLabel}>Repeat Seeker</Text>
                      <Text style={[styles.scMetricVal, { color: colors.teal }]}>{sc.repeatRatePct}%</Text>
                    </View>
                    <View style={styles.scMetricCell}>
                      <Text style={styles.scMetricLabel}>Pickup SLA</Text>
                      <Text style={[styles.scMetricVal, { color: colors.gold }]}>{sc.pickupRatePct}%</Text>
                    </View>
                    <View style={styles.scMetricCell}>
                      <Text style={styles.scMetricLabel}>Total Sessions</Text>
                      <Text style={styles.scMetricVal}>{sc.totalConsultations}</Text>
                    </View>
                    <View style={styles.scMetricCell}>
                      <Text style={styles.scMetricLabel}>Billed Mins</Text>
                      <Text style={styles.scMetricVal}>{(sc.minutesBilled / 60).toFixed(0)}h</Text>
                    </View>
                  </View>
                </Card>
              ))}

              {/* Category Revenue Contribution */}
              <Card style={{ gap: spacing.sm }}>
                <SectionHeader title="📊 Revenue by Category" subtitle="Marketplace gross volume split" />
                {[
                  { label: '❤️ Love & Relationships', pct: 42, amount: '₹7,75,000', color: '#EC4899' },
                  { label: '💼 Career & Business', pct: 28, amount: '₹5,16,000', color: '#38BDF8' },
                  { label: '💍 Marriage & Kundli Milan', pct: 18, amount: '₹3,32,000', color: colors.gold },
                  { label: '🪔 E-Puja & Gemstones Store', pct: 12, amount: '₹2,21,000', color: colors.teal },
                ].map((c) => (
                  <View key={c.label} style={{ gap: 4, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.catLabel}>{c.label}</Text>
                      <Text style={styles.catAmount}>{c.amount} ({c.pct}%)</Text>
                    </View>
                    <View style={styles.catTrack}>
                      <View style={[styles.catFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* ── SPELLS & PRICE MANAGEMENT TAB ── */}
          {tab === 'spells' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Spells Catalog & Price Management" subtitle="Edit Spell Fees & Manage Availability" />

              {spells.map((spell) => (
                <Card key={spell.id} style={styles.inventoryCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: 28 }}>{spell.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTitle}>{spell.title}</Text>
                      <Text style={styles.invSub}>{spell.sanskritName} · {spell.category}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleSpellAvailable(spell.id)}
                      style={[styles.toggleBtn, spell.available ? styles.toggleOnline : styles.toggleOffline]}
                    >
                      <Text style={[styles.toggleText, { color: spell.available ? colors.success : colors.danger }]}>
                        {spell.available ? 'ACTIVE' : 'DISABLED'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Spell Fee (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(spell.price)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateSpellPrice(spell.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}

              <SectionHeader title="Booked Spell Rituals" subtitle={`${spellOrders.length} rituals scheduled`} />
              {spellOrders.map((ord) => (
                <Card key={ord.id} style={styles.orderCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.orderId}>{ord.id}</Text>
                    <Chip
                      label={ord.status}
                      tone={ord.status === 'Ritual Completed' ? 'teal' : ord.status === 'Casting in Progress' ? 'gold' : 'rose'}
                    />
                  </View>

                  <Text style={styles.orderItemName}>{ord.spellTitle}</Text>
                  <Text style={styles.orderPrice}>{formatCurrency(ord.price)}</Text>

                  <View style={styles.userInfoBox}>
                    <Text style={styles.userInfoText}>👤 Seeker Name: <Text style={{ color: colors.text }}>{ord.userName}</Text></Text>
                    <Text style={styles.userInfoText}>👥 Target Name: <Text style={{ color: colors.text }}>{ord.targetName}</Text></Text>
                    <Text style={styles.userInfoText}>🎂 DOB: <Text style={{ color: colors.text }}>{ord.dob}</Text></Text>
                    <Text style={styles.userInfoText}>📝 Intention: <Text style={{ color: colors.text }}>"{ord.intention}"</Text></Text>
                    <Text style={styles.userInfoText}>💳 Payment Mode: <Text style={{ color: colors.saffron }}>{ord.paymentMethod.toUpperCase()}</Text></Text>
                    <Text style={styles.userInfoText}>🕒 Placed On: <Text style={{ color: colors.textMuted }}>{ord.date}</Text></Text>
                  </View>

                  <View style={styles.statusActionRow}>
                    <Button
                      label="Casting in Progress"
                      variant="outline"
                      size="sm"
                      disabled={ord.status === 'Casting in Progress' || ord.status === 'Ritual Completed'}
                      onPress={() => updateSpellOrderStatus(ord.id, 'Casting in Progress')}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Ritual Completed"
                      variant="gold"
                      size="sm"
                      disabled={ord.status === 'Ritual Completed'}
                      onPress={() => updateSpellOrderStatus(ord.id, 'Ritual Completed')}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── USER ORDERS TRACKING TAB ── */}
          {tab === 'orders' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="User Shopping Orders" subtitle={`${orders.length} total orders recorded`} />

              {orders.map((ord) => (
                <Card key={ord.id} style={styles.orderCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.orderId}>{ord.id}</Text>
                    <Chip
                      label={ord.status}
                      tone={ord.status === 'Delivered' ? 'teal' : ord.status === 'Dispatched' ? 'gold' : 'rose'}
                    />
                  </View>

                  <Text style={styles.orderItemName}>{ord.itemName}</Text>
                  <Text style={styles.orderPrice}>{formatCurrency(ord.price)}</Text>

                  <View style={styles.userInfoBox}>
                    <Text style={styles.userInfoText}>👤 Customer: <Text style={{ color: colors.text }}>{ord.userName}</Text></Text>
                    <Text style={styles.userInfoText}>📞 Phone: <Text style={{ color: colors.text }}>{ord.phone}</Text></Text>
                    <Text style={styles.userInfoText}>📍 Address: <Text style={{ color: colors.text }}>{ord.address}</Text></Text>
                    <Text style={styles.userInfoText}>🕒 Placed On: <Text style={{ color: colors.textMuted }}>{ord.date}</Text></Text>
                  </View>

                  <View style={styles.statusActionRow}>
                    <Button
                      label="Mark Dispatched"
                      variant="outline"
                      size="sm"
                      disabled={ord.status === 'Dispatched' || ord.status === 'Delivered'}
                      onPress={() => updateOrderStatus(ord.id, 'Dispatched')}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Mark Delivered"
                      variant="gold"
                      size="sm"
                      disabled={ord.status === 'Delivered'}
                      onPress={() => updateOrderStatus(ord.id, 'Delivered')}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── INVENTORY & PRICE MANAGEMENT TAB ── */}
          {tab === 'inventory' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="AstroRemedies Catalog & Pricing" subtitle="Edit Prices & Manage Item Stock" />

              {inventory.map((item) => (
                <Card key={item.id} style={styles.inventoryCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: 28 }}>{item.planetIcon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTitle}>{item.name}</Text>
                      <Text style={styles.invSub}>{item.sanskritName} · {item.planet}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleItemAvailable(item.id)}
                      style={[styles.toggleBtn, item.available ? styles.toggleOnline : styles.toggleOffline]}
                    >
                      <Text style={[styles.toggleText, { color: item.available ? colors.success : colors.danger }]}>
                        {item.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Price (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(item.price)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateItemPrice(item.id, Number(txt) || 0)}
                      />
                    </View>

                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Stock Count:</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(item.stock)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateItemStock(item.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── ASTROLOGERS TAB (EXPERT PRICE & EXP MANAGEMENT) ── */}
          {tab === 'astrologers' && (
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tabHeading}>Manage Panel ({astrologers.length})</Text>
                <Button
                  label="➕ New Expert"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setShowAddModal(true)}
                />
              </View>

              {astrologers.map((a) => (
                <Card key={a.id} style={styles.manageCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Avatar uri={a.avatar} name={a.name} size={50} online={a.online} showStatus />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.manageName}>{a.name}</Text>
                      <Text style={styles.manageMeta}>
                        ⭐ {a.rating} ({a.reviews} reviews) · {a.specialties.join(' · ')}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleStatus(a.id)}
                      style={[
                        styles.toggleBtn,
                        a.online ? styles.toggleOnline : styles.toggleOffline,
                      ]}
                    >
                      <Text style={[styles.toggleText, { color: a.online ? colors.success : colors.danger }]}>
                        {a.online ? 'ONLINE' : 'OFFLINE'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Inline Price & Experience Editor Inputs */}
                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Price / min (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(a.pricePerMin)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateAstroPrice(a.id, Number(txt) || 0)}
                      />
                    </View>

                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Experience (Yrs):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(a.experienceYears)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateAstroExp(a.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── REVENUE TAB ── */}
          {tab === 'revenue' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="Revenue Share Settings" subtitle="Platform vs Expert Split" />
                <View style={styles.revenueSplitRow}>
                  <View style={styles.splitBox}>
                    <Text style={styles.splitPct}>20%</Text>
                    <Text style={styles.splitLabel}>AstroGuru Platform Fee</Text>
                  </View>
                  <View style={styles.splitBox}>
                    <Text style={[styles.splitPct, { color: colors.teal }]}>80%</Text>
                    <Text style={styles.splitLabel}>Astrologer Payout</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <View style={{ gap: spacing.md }}>
              <Card padded={false}>
                <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
                  <SectionHeader title="Registered Users (1,240)" subtitle="Account statuses & history" />
                </View>
                {[
                  { name: 'Demo Seeker', email: 'seeker@astroguru.app', wallet: '₹310', role: 'User' },
                  { name: 'Master Admin', email: 'admin@astroguru.app', wallet: '₹9,999', role: 'Admin' },
                  { name: 'Rajesh Sharma', email: 'rajesh@gmail.com', wallet: '₹750', role: 'User' },
                  { name: 'Priyanka Verma', email: 'priyanka@gmail.com', wallet: '₹150', role: 'User' },
                ].map((u, idx) => (
                  <View key={idx} style={styles.userRow}>
                    <Avatar name={u.name} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>
                        {u.name}{' '}
                        {u.role === 'Admin' && (
                          <Text style={{ color: colors.saffron, fontSize: 11 }}>⚡ ADMIN</Text>
                        )}
                      </Text>
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                    <Text style={styles.userWallet}>{u.wallet}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* ── PUSH NOTIFICATIONS BROADCAST TAB ── */}
          {tab === 'push_notifications' && (
            <View style={{ gap: spacing.md }}>
              <Card style={{ gap: spacing.md }}>
                <SectionHeader
                  title="📣 Broadcast Push Notification"
                  subtitle="Send instant mobile alerts to seekers & astrologers"
                />

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Notification Title</Text>
                  <TextInput
                    value={notifTitle}
                    onChangeText={setNotifTitle}
                    placeholder="e.g. 🔴 Acharya Dev is NOW LIVE!"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Notification Message Body</Text>
                  <TextInput
                    value={notifBody}
                    onChangeText={setNotifBody}
                    placeholder="e.g. Tap now to join instant live audio/video consultation for Rahu Mahadasha remedies."
                    placeholderTextColor={colors.textFaint}
                    multiline
                    numberOfLines={3}
                    style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
                  />
                </View>

                {broadcastSuccess && (
                  <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' }}>
                    <Text style={{ ...typography.small, color: colors.auroraA, fontWeight: '700', textAlign: 'center' }}>
                      {broadcastSuccess}
                    </Text>
                  </View>
                )}

                <Button
                  label={sendingBroadcast ? 'Broadcasting Push Alerts…' : '🚀 Send Instant Push Broadcast (14,200 Devices)'}
                  variant="gold"
                  size="md"
                  loading={sendingBroadcast}
                  onPress={handleSendBroadcast}
                />
              </Card>

              {/* Scheduled Daily Astro Alerts */}
              <Card style={{ gap: spacing.md }}>
                <SectionHeader
                  title="⏰ Automated Daily Astro Alerts"
                  subtitle="Managed background cron schedules"
                />

                {[
                  { time: '06:00 AM', title: '🌅 Daily Panchang & Shubh Muhurat', desc: 'Brahma Muhurat & Sunrise auspicious timings alert', active: true },
                  { time: '09:00 AM', title: '🔮 Daily Horoscope & Moon Transit', desc: 'Rashi predictions for Mesha to Meena', active: true },
                  { time: '12:30 PM', title: '⚠️ Rahu Kaal Cautionary Alert', desc: 'Avoid new endeavors during Rahu Kaal window', active: true },
                  { time: '07:00 PM', title: '🪔 Evening Sandhya Aarti & Live Darshan', desc: 'Live temple darshan broadcast alert', active: true },
                ].map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#070D18', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ ...typography.tiny, color: colors.saffron, fontWeight: '800' }}>{item.time}</Text>
                        <Text style={{ ...typography.h3, color: '#F8FAFC', fontSize: 13, fontWeight: '800' }}>{item.title}</Text>
                      </View>
                      <Text style={{ ...typography.small, color: colors.textMuted, fontSize: 11.5 }}>{item.desc}</Text>
                    </View>
                    <Chip label={item.active ? 'ACTIVE' : 'OFF'} tone={item.active ? 'gold' : 'default'} selected={item.active} />
                  </View>
                ))}
              </Card>
            </View>
          )}
        </ScrollView>

        {/* ── ADD ASTROLOGER MODAL ── */}
        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Astrologer</Text>
              <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: spacing.md }}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Acharya Dev Sharma"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Specialties (comma separated)</Text>
                  <TextInput
                    value={newSpecialty}
                    onChangeText={setNewSpecialty}
                    placeholder="Vedic, Palmistry, Nadi"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Price / min (₹)</Text>
                    <TextInput
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Experience (yrs)</Text>
                    <TextInput
                      value={newExp}
                      onChangeText={setNewExp}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Languages</Text>
                  <TextInput
                    value={newLang}
                    onChangeText={setNewLang}
                    placeholder="Hindi, English, Gujarati"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={() => setShowAddModal(false)}
                />
                <Button
                  label="Save Expert"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={handleAddAstrologer}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* ── UNIVERSAL BAN HAMMER MODAL ── */}
        <Modal visible={showBanModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#EF4444' }]}>🔨 Universal Ban Hammer</Text>
              <Text style={{ ...typography.tiny, color: '#A5B4FC', textAlign: 'center', marginTop: -8 }}>
                Immediately revoke platform access, drop live sessions & blacklist hardware
              </Text>

              <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: spacing.md }}>
                {/* Entity Type Picker */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Target Entity Type</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['device', 'phone', 'user', 'astrologer'] as const).map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => setBanEntityType(type)}
                        style={[
                          styles.banTypePill,
                          banEntityType === type && styles.banTypePillActive,
                        ]}
                      >
                        <Text style={[styles.banTypePillText, banEntityType === type && styles.banTypePillTextActive]}>
                          {type.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Target Name / Label */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Entity Name / Description</Text>
                  <TextInput
                    value={banName}
                    onChangeText={setBanName}
                    placeholder="e.g. Abusive User / Multi-SIM Spammer"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                {/* Identifier */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {banEntityType === 'device'
                      ? 'Device UUID / Hardware Fingerprint'
                      : banEntityType === 'phone'
                      ? 'Mobile Number (+91...)'
                      : banEntityType === 'astrologer'
                      ? 'Astrologer ID'
                      : 'User ID'}
                  </Text>
                  <TextInput
                    value={banIdentifier}
                    onChangeText={setBanIdentifier}
                    placeholder={
                      banEntityType === 'device'
                        ? 'e.g. AND-9A7F-E102-881B'
                        : banEntityType === 'phone'
                        ? 'e.g. +91 98112 00192'
                        : 'e.g. usr_8192a8'
                    }
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                {/* Reason Selection */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Reason for Enforcement</Text>
                  <View style={{ gap: 6 }}>
                    {[
                      'Free-Chat Multi-Account Farming',
                      'Direct WhatsApp/Phone Contact Bypass',
                      'Off-Platform External Payment Request',
                      'Harassment & Abusive Behavior',
                      'Fraudulent UTR Wallet Top-up',
                    ].map((reason) => (
                      <Pressable
                        key={reason}
                        onPress={() => setBanReason(reason)}
                        style={[
                          styles.reasonSelectRow,
                          banReason === reason && styles.reasonSelectRowActive,
                        ]}
                      >
                        <Text style={{ fontSize: 13 }}>{banReason === reason ? '🔘' : '⚪'}</Text>
                        <Text style={[styles.reasonSelectText, banReason === reason && { color: '#EEF2FF', fontWeight: '800' }]}>
                          {reason}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Duration */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Ban Duration</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['24 Hours', '7 Days', '30 Days', 'Permanent'] as const).map((dur) => (
                      <Pressable
                        key={dur}
                        onPress={() => setBanDuration(dur)}
                        style={[
                          styles.banTypePill,
                          banDuration === dur && styles.banDurationActive,
                        ]}
                      >
                        <Text style={[styles.banTypePillText, banDuration === dur && { color: '#FFFFFF', fontWeight: '800' }]}>
                          {dur}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={() => setShowBanModal(false)}
                />
                <Button
                  label="🔨 Enforce Ban"
                  variant="coral"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  disabled={!banIdentifier.trim()}
                  onPress={handleExecuteBan}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    height: 48,
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.25)',
    justifyContent: 'center',
    zIndex: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabBtn: {
    minWidth: 76,
    paddingHorizontal: spacing.md,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    overflow: 'hidden',
  },
  tabBtnActive: {
    borderColor: 'transparent',
    borderBottomWidth: 2.5,
    borderBottomColor: '#046A4E',
  },
  tabBtnText: { ...typography.tiny, color: '#A5B4FC', fontWeight: '800', fontSize: 11.5 },
  tabBtnTextActive: { color: colors.white },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  /* Overview */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  statBox: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    gap: 2,
  },
  statIcon: { fontSize: 22 },
  statNum: { ...typography.h1, fontSize: 19, color: '#EEF2FF', fontWeight: '800' },
  statTitle: { ...typography.tiny, color: '#A5B4FC', fontWeight: '600', fontSize: 11 },

  /* Orders */
  orderCard: { gap: spacing.xs },
  orderId: { ...typography.h3, color: colors.gold, fontSize: 15, fontWeight: '800' },
  orderItemName: { ...typography.h2, color: '#EEF2FF', fontSize: 15, fontWeight: '800', marginTop: 2 },
  orderPrice: { ...typography.h2, color: colors.gold, fontWeight: '900', fontSize: 17 },
  userInfoBox: {
    backgroundColor: 'rgba(26, 33, 64, 0.65)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    gap: 2,
    marginTop: 4,
  },
  userInfoText: { ...typography.tiny, color: '#A5B4FC', fontWeight: '700' },
  statusActionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },

  /* Inventory */
  inventoryCard: { gap: spacing.sm },
  invTitle: { ...typography.h3, color: '#EEF2FF', fontSize: 15, fontWeight: '800' },
  invSub: { ...typography.tiny, color: '#A5B4FC' },
  invControlsRow: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  inputBoxCol: { flex: 1, gap: 2 },
  inputColLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '700' },
  invInput: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    ...typography.body,
    color: '#EEF2FF',
    fontWeight: '800',
  },

  /* Astrologers */
  tabHeading: { ...typography.h2, color: '#EEF2FF', fontWeight: '800' },
  manageCard: { padding: spacing.md, gap: spacing.xs },
  manageName: { ...typography.h3, color: '#EEF2FF', fontSize: 15, fontWeight: '800' },
  manageMeta: { ...typography.tiny, color: colors.gold, marginTop: 2, fontWeight: '700' },
  manageSpec: { ...typography.tiny, color: '#A5B4FC', marginTop: 1 },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleOnline: {
    backgroundColor: 'rgba(5,150,105,0.2)',
    borderColor: 'rgba(5,150,105,0.4)',
  },
  toggleOffline: {
    backgroundColor: 'rgba(148,163,184,0.15)',
    borderColor: 'rgba(148,163,184,0.35)',
  },
  toggleText: { ...typography.tiny, fontWeight: '800', fontSize: 10 },

  /* Revenue */
  revenueSplitRow: { flexDirection: 'row', gap: spacing.md },
  splitBox: {
    flex: 1,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  splitPct: { ...typography.display, fontSize: 28, color: colors.gold, fontWeight: '900' },
  splitLabel: { ...typography.tiny, color: '#A5B4FC', marginTop: 4, textAlign: 'center', fontWeight: '700' },

  /* Users */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(129, 140, 248, 0.2)',
  },
  userName: { ...typography.small, color: '#EEF2FF', fontWeight: '700' },
  userEmail: { ...typography.tiny, color: '#A5B4FC', marginTop: 1 },
  userWallet: { ...typography.small, color: colors.gold, fontWeight: '800' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    gap: spacing.md,
  },
  modalTitle: { ...typography.h2, color: colors.gold, textAlign: 'center', fontWeight: '800' },
  field: { gap: 4 },
  fieldLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '700' },
  fieldInput: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: '#EEF2FF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Security & Anti-Fraud */
  actionFeedbackPill: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  actionFeedbackText: {
    ...typography.small,
    color: '#34D399',
    fontWeight: '800',
    textAlign: 'center',
  },
  incidentCard: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  incidentTitle: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  incidentTimestamp: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
    fontWeight: '600',
  },
  evidenceBox: {
    backgroundColor: 'rgba(10, 12, 22, 0.65)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    gap: 3,
  },
  evidenceMeta: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  evidenceText: {
    ...typography.small,
    color: '#EEF2FF',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  incidentActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  incBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incBtnBan: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  incBtnBanText: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 11,
  },
  incBtnStrike: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  incBtnStrikeText: {
    color: '#FCD34D',
    fontWeight: '800',
    fontSize: 11,
  },
  incBtnDismiss: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  incBtnDismissText: {
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 11,
  },
  blacklistCard: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  blacklistName: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  durationBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  durationBadgeText: {
    ...typography.tiny,
    color: '#F87171',
    fontWeight: '800',
    fontSize: 10,
  },
  blacklistIdentifier: {
    ...typography.tiny,
    color: colors.gold,
    fontWeight: '700',
  },
  blacklistReason: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
  },
  blacklistDate: {
    ...typography.tiny,
    color: '#64748B',
    fontSize: 10,
  },
  unbanBtn: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
  },
  unbanBtnText: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 11,
  },

  /* Ban Hammer Modal Items */
  banTypePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  banTypePillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
    borderColor: 'rgba(129, 140, 248, 0.8)',
  },
  banTypePillText: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontWeight: '700',
    fontSize: 10.5,
  },
  banTypePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  banDurationActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.7)',
  },
  reasonSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  reasonSelectRowActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  reasonSelectText: {
    ...typography.small,
    color: '#A5B4FC',
    fontSize: 12.5,
  },

  /* Heatmap & Analytics */
  dutyToast: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.4)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  dutyToastText: {
    ...typography.small,
    color: '#34D399',
    fontWeight: '800',
    textAlign: 'center',
  },
  heatmapCardTitle: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 15,
    fontWeight: '800',
  },
  heatmapCardSub: {
    ...typography.tiny,
    color: '#A5B4FC',
  },
  peakTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  peakTagText: {
    ...typography.tiny,
    color: '#F87171',
    fontWeight: '800',
    fontSize: 10.5,
  },
  deficitBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  deficitTitle: {
    ...typography.h3,
    color: '#FCD34D',
    fontSize: 13.5,
    fontWeight: '800',
  },
  deficitDesc: {
    ...typography.tiny,
    color: '#EEF2FF',
    marginTop: 2,
    lineHeight: 16,
  },
  alertTimestamp: {
    ...typography.tiny,
    color: colors.teal,
    textAlign: 'center',
    fontWeight: '700',
  },
  barsContainer: {
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
  },
  barCol: {
    width: 44,
    alignItems: 'center',
    gap: 4,
  },
  barCount: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontSize: 10,
    fontWeight: '800',
  },
  barTrack: {
    width: 14,
    height: 125,
    backgroundColor: 'rgba(10, 12, 22, 0.65)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barHourLabel: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '700',
  },
  astroCountPill: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  astroCountPillPeak: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  astroCountText: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontSize: 9,
    fontWeight: '800',
  },
  scorecardItem: {
    gap: spacing.sm,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  rankText: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontWeight: '800',
    fontSize: 11,
  },
  scName: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  scSpec: {
    ...typography.tiny,
    color: '#A5B4FC',
  },
  scRating: {
    ...typography.tiny,
    color: colors.gold,
    fontWeight: '800',
    fontSize: 12,
  },
  scRevenue: {
    ...typography.tiny,
    color: '#34D399',
    fontWeight: '800',
    fontSize: 12,
  },
  scMetricsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  scMetricCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  scMetricLabel: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontSize: 9.5,
    fontWeight: '700',
  },
  scMetricVal: {
    ...typography.h3,
    color: '#EEF2FF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  catLabel: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '700',
  },
  catAmount: {
    ...typography.small,
    color: colors.gold,
    fontWeight: '800',
  },
  catTrack: {
    height: 8,
    backgroundColor: 'rgba(10, 12, 22, 0.65)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 4,
  },
});
