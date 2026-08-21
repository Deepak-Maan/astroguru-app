import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
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
import { useAdminStore, PromoCoupon } from '../../src/store/adminStore';
import { useAuthStore } from '../../src/store/authStore';
import { useAntiHackingStore } from '../../src/store/antiHackingStore';
import { formatCurrency } from '../../src/utils';
import {
  sendAdminBroadcastPushNotification,
  scheduleLocalPushNotification,
} from '../../src/services/pushNotificationService';
import { useUpdateStore } from '../../src/store/updateStore';

type AdminTab =
  | 'overview'
  | 'kyc'
  | 'payouts'
  | 'coupons'
  | 'radar'
  | 'security'
  | 'astrologers'
  | 'revenue'
  | 'users'
  | 'orders'
  | 'spells'
  | 'inventory'
  | 'push_notifications';

export default function AdminDashboard() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const [tab, setTab] = useState<AdminTab>('overview');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([...ASTROLOGERS]);

  // Admin Expanded Store
  const {
    kycQueue,
    payoutQueue,
    coupons,
    liveSessions,
    securityIncidents,
    bannedFingerprints,
    platformFeePercent,
    vipMonthlyPrice,
    vipAnnualPrice,
    approveKyc,
    rejectKyc,
    approvePayout,
    rejectPayout,
    createCoupon,
    toggleCouponActive,
    deleteCoupon,
    refundConsultation,
    terminateSession,
    banDevice,
    unbanDevice,
    updatePlatformFee,
    updateVipPricing,
  } = useAdminStore();

  const antiHackingAudit = useAntiHackingStore((s) => s.lastAudit);

  // Manual App Update Broadcast States
  const broadcastUpdate = useUpdateStore((s) => s.broadcastUpdate);
  const currentAppVersion = useUpdateStore((s) => s.currentVersion);
  const [updateVerInput, setUpdateVerInput] = useState('1.6.0');
  const [updateNotesInput, setUpdateNotesInput] = useState(
    '⚡ New Performance Enhancements & Vedic Algorithms\n🛡️ High-Security RASP Anti-Hacking Protection\n🪪 Aadhaar Watermarking & KYC Verification'
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

  // Modal for creating promo coupon
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('50');
  const [newCouponMin, setNewCouponMin] = useState('200');
  const [newCouponMax, setNewCouponMax] = useState('1000');

  // Modal for rejecting KYC
  const [rejectKycModal, setRejectKycModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Document text is blurry or cropped.');

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

  const updateAstroPrice = (id: string, newP: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pricePerMin: newP } : a))
    );
  };

  const updateAstroExp = (id: string, newE: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, experienceYears: newE } : a))
    );
  };

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

  const handleCreateCoupon = () => {
    if (!newCouponCode.trim()) return;
    createCoupon({
      code: newCouponCode.trim().toUpperCase(),
      title: newCouponTitle.trim() || `${newCouponDiscount}% Discount Voucher`,
      discountType: 'percentage',
      discountValue: Number(newCouponDiscount) || 50,
      minRecharge: Number(newCouponMin) || 200,
      maxUsage: Number(newCouponMax) || 1000,
      expiresAt: '2026-12-31',
      active: true,
    });
    setShowCouponModal(false);
    setNewCouponCode('');
    setNewCouponTitle('');
  };

  const pendingKycCount = kycQueue.filter((k) => k.status === 'pending').length;
  const pendingPayoutCount = payoutQueue.filter((p) => p.status === 'pending').length;
  const activeConsultationsCount = liveSessions.filter((s) => s.status === 'active').length;
  const activeCount = astrologers.filter((a) => a.online).length;

  const handleAdminSignOut = () => {
    router.replace('/(auth)/login');
    setTimeout(() => {
      logout();
    }, 50);
  };

  // Strict Admin Gate: non-admins are routed away safely after hooks execute
  if (!isAuthenticated || authUser?.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Admin Header with 1-Tap Sign Out */}
        <View style={styles.adminTopBar}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.adminTitle}>⚡ Master Admin Console</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>SUPERUSER</Text>
              </View>
            </View>
            <Text style={styles.adminSub}>
              Signed in as: <Text style={{ color: colors.gold, fontWeight: '700' }}>{authUser?.email}</Text>
            </Text>
          </View>

          <Pressable
            onPress={handleAdminSignOut}
            style={({ pressed }) => [
              styles.adminSignOutBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={styles.adminSignOutText}>🚪 Sign Out</Text>
          </Pressable>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={{ flexGrow: 0 }}
          >
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'kyc', label: `🪪 KYC Desk (${pendingKycCount})` },
              { id: 'payouts', label: `💸 Payouts (${pendingPayoutCount})` },
              { id: 'coupons', label: `🏷️ Coupons (${coupons.length})` },
              { id: 'radar', label: `📞 Live Radar (${activeConsultationsCount})` },
              { id: 'security', label: '🚨 Cyber Defense' },
              { id: 'astrologers', label: `🔮 Experts (${astrologers.length})` },
              { id: 'revenue', label: '💰 Revenue & VIP' },
              { id: 'users', label: '👥 Users' },
              { id: 'push_notifications', label: '📣 Broadcast Push' },
              { id: 'orders', label: `🛒 Orders (${orders.length})` },
              { id: 'spells', label: `🪄 Spells (${spells.length})` },
              { id: 'inventory', label: '📦 Inventory' },
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
          {/* ══════════════════════════════════════════════════
              1. OVERVIEW TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'overview' && (
            <View style={{ gap: spacing.md }}>
              {/* Quick Stat Cards */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statNum}>₹4,28,500</Text>
                  <Text style={styles.statTitle}>Total Gross GMV</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>📞</Text>
                  <Text style={[styles.statNum, { color: '#10B981' }]}>{activeConsultationsCount} Active</Text>
                  <Text style={styles.statTitle}>Live Calls & Chats</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🪪</Text>
                  <Text style={[styles.statNum, { color: '#F59E0B' }]}>{pendingKycCount} Pending</Text>
                  <Text style={styles.statTitle}>KYC Approvals</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>💸</Text>
                  <Text style={[styles.statNum, { color: '#EC4899' }]}>{pendingPayoutCount} Requests</Text>
                  <Text style={styles.statTitle}>Pending Payouts</Text>
                </View>
              </View>

              {/* RASP Cyber Sentinel Snapshot */}
              <Card style={{ backgroundColor: '#090D16', borderColor: '#1E293B', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 24 }}>🛡️</Text>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: '#FFFFFF' }}>
                        RASP Cyber Sentinel & Threat Radar
                      </Text>
                      <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                        Memory shielding · Anti-Reverse Engineering · HMAC Signing
                      </Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#065F46', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '900', color: '#A7F3D0' }}>100% FORTIFIED</Text>
                  </View>
                </View>
              </Card>

              {/* Quick Operation Jumpers */}
              <Card style={{ gap: spacing.md }}>
                <SectionHeader title="⚡ Instant Operational Actions" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <Button
                    label="🪪 Review KYC"
                    variant="gold"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('kyc')}
                  />
                  <Button
                    label="💸 Release Payouts"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('payouts')}
                  />
                  <Button
                    label="🏷️ Promo Coupons"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('coupons')}
                  />
                  <Button
                    label="📞 Live Radar"
                    variant="gold"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1, minWidth: 140 }}
                    onPress={() => setTab('radar')}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              2. KYC APPROVALS DESK TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'kyc' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader
                title="🪪 Astrologer KYC & Document Approvals Desk"
                subtitle="Review watermarked Aadhaar, PAN and Jyotish certificates"
              />

              {kycQueue.map((item) => (
                <Card key={item.id} style={{ gap: 10, borderLeftWidth: 4, borderLeftColor: item.status === 'approved' ? '#10B981' : item.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: colors.text }}>
                        {item.astrologerName}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700', textTransform: 'capitalize', marginTop: 2 }}>
                        📄 {item.docType.replace('_', ' ')} · {item.docNumberMasked}
                      </Text>
                      <Text style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 2 }}>
                        🔒 Cryptographic Hash: {item.securityHash} · Submitted {item.submittedAt}
                      </Text>
                    </View>

                    <Chip
                      label={item.status.toUpperCase()}
                      tone={item.status === 'approved' ? 'teal' : item.status === 'rejected' ? 'rose' : 'gold'}
                    />
                  </View>

                  {item.rejectionReason && (
                    <View style={{ backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                      <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '700' }}>
                        ❌ Rejection Note: {item.rejectionReason}
                      </Text>
                    </View>
                  )}

                  {item.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <Button
                        label="❌ Reject Document"
                        variant="outline"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => {
                          setRejectKycModal(item.id);
                        }}
                      />
                      <Button
                        label="✅ Approve & Issue Badge"
                        variant="gold"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => approveKyc(item.id)}
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              3. PAYOUTS DESK TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'payouts' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader
                title="💸 Astrologer Bank & UPI Withdrawal Desk"
                subtitle="Review and release net consultation earnings"
              />

              {payoutQueue.map((p) => (
                <Card key={p.id} style={{ gap: 10, borderLeftWidth: 4, borderLeftColor: p.status === 'processed' ? '#10B981' : p.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
                        {p.astrologerName}
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: colors.gold, marginTop: 2 }}>
                        {formatCurrency(p.amount)}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
                        🏦 {p.payoutMethod}: {p.payoutDetails}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.textFaint, marginTop: 2 }}>
                        Requested on: {p.requestedAt}
                      </Text>
                    </View>

                    <Chip
                      label={p.status.toUpperCase()}
                      tone={p.status === 'processed' ? 'teal' : p.status === 'rejected' ? 'rose' : 'gold'}
                    />
                  </View>

                  {p.utrNumber && (
                    <View style={{ backgroundColor: '#ECFDF5', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#A7F3D0' }}>
                      <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '800' }}>
                        🧾 Bank Reference: {p.utrNumber}
                      </Text>
                    </View>
                  )}

                  {p.status === 'pending' && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <Button
                        label="❌ Reject Request"
                        variant="outline"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => rejectPayout(p.id)}
                      />
                      <Button
                        label="⚡ Approve & Release (Auto UTR)"
                        variant="gold"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => approvePayout(p.id)}
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              4. PROMO COUPONS & DISCOUNTS TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'coupons' && (
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader
                  title="🏷️ Promo Coupons & Cash Bonus Engine"
                  subtitle="Manage discount codes for consultations & remedies"
                />
                <Button
                  label="➕ New Coupon"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setShowCouponModal(true)}
                />
              </View>

              {coupons.map((c) => (
                <Card key={c.code} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' }}>
                        <Text style={{ fontSize: 13, fontWeight: '900', color: '#1D4ED8', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                          {c.code}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                        {c.discountValue}% OFF
                      </Text>
                    </View>

                    <Switch
                      value={c.active}
                      onValueChange={() => toggleCouponActive(c.code)}
                      trackColor={{ true: '#10B981', false: '#CBD5E1' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{c.title}</Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.textFaint }}>
                      Min Recharge: ₹{c.minRecharge}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.teal, fontWeight: '700' }}>
                      Redeemed: {c.redeemedCount} / {c.maxUsage}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textFaint }}>
                      Exp: {c.expiresAt}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              5. LIVE RADAR & DISPUTE REFUND DESK TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'radar' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader
                title="📞 Live Consultation Radar & Dispute Resolution"
                subtitle="Monitor active sessions & settle seeker refund disputes"
              />

              {liveSessions.map((sess) => (
                <Card key={sess.id} style={{ gap: 10, borderLeftWidth: 4, borderLeftColor: sess.status === 'active' ? '#10B981' : sess.status === 'disputed' ? '#EF4444' : '#64748B' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '900', color: colors.text }}>
                        👤 {sess.seekerName} ↔ 🔮 {sess.astrologerName}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        {sess.channel} · Duration: {sess.durationMins} mins · Billed: {formatCurrency(sess.billedAmount)}
                      </Text>
                      <Text style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 2 }}>
                        Session ID: {sess.id} · Started {sess.startedAt}
                      </Text>
                    </View>

                    <Chip
                      label={sess.status.toUpperCase()}
                      tone={sess.status === 'active' ? 'teal' : sess.status === 'disputed' ? 'rose' : 'default'}
                    />
                  </View>

                  {sess.disputeReason && (
                    <View style={{ backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                      <Text style={{ fontSize: 11.5, color: '#DC2626', fontWeight: '800' }}>
                        ⚠️ Seeker Dispute: "{sess.disputeReason}"
                      </Text>
                    </View>
                  )}

                  {sess.status === 'disputed' && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <Button
                        label="❌ Reject Dispute"
                        variant="outline"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => terminateSession(sess.id)}
                      />
                      <Button
                        label={`💸 1-Tap Refund (${formatCurrency(sess.billedAmount)})`}
                        variant="gold"
                        size="sm"
                        style={{ flex: 1 }}
                        onPress={() => refundConsultation(sess.id)}
                      />
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              6. CYBER DEFENSE & INCIDENT LOGS TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'security' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader
                title="🚨 Cyber Defense & Security Incident Logs"
                subtitle="Live stream of blocked RASP threats, root hooks & banned devices"
              />

              <Card style={{ backgroundColor: '#090D16', borderColor: '#1E293B', gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#FFFFFF' }}>
                  🚫 Blacklisted Device Fingerprints ({bannedFingerprints.length})
                </Text>
                {bannedFingerprints.map((fp) => (
                  <View key={fp} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 8, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11.5, color: '#F59E0B', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800' }}>
                      {fp}
                    </Text>
                    <Pressable onPress={() => unbanDevice(fp)} style={{ backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '800' }}>UNBAN</Text>
                    </Pressable>
                  </View>
                ))}
              </Card>

              {securityIncidents.map((inc) => (
                <Card key={inc.id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16 }}>🚨</Text>
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>
                        {inc.threatType}
                      </Text>
                    </View>
                    <Chip label={inc.actionTaken} tone={inc.actionTaken === 'BANNED' ? 'rose' : 'gold'} />
                  </View>

                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Device: <Text style={{ color: colors.text, fontWeight: '700' }}>{inc.deviceFingerprint}</Text> · IP: {inc.ipAddress}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.textFaint }}>
                    Detected: {inc.timestamp}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <Button
                      label="🔨 1-Tap Ban Device Fingerprint"
                      variant="outline"
                      size="sm"
                      onPress={() => banDevice(inc.deviceFingerprint)}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              7. ASTROLOGERS TAB
             ══════════════════════════════════════════════════ */}
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

          {/* ══════════════════════════════════════════════════
              8. REVENUE & VIP PRICING CONTROLLER TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'revenue' && (
            <View style={{ gap: spacing.md }}>
              <Card style={{ gap: 12 }}>
                <SectionHeader title="Revenue Share & Commission Split" subtitle="Set Global Platform Margin" />
                <View style={styles.revenueSplitRow}>
                  <View style={styles.splitBox}>
                    <Text style={styles.splitPct}>{platformFeePercent}%</Text>
                    <Text style={styles.splitLabel}>Platform Commission</Text>
                  </View>
                  <View style={styles.splitBox}>
                    <Text style={[styles.splitPct, { color: colors.teal }]}>{100 - platformFeePercent}%</Text>
                    <Text style={styles.splitLabel}>Astrologer Share</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  {[15, 20, 25, 30].map((fee) => (
                    <Button
                      key={fee}
                      label={`${fee}% Fee`}
                      variant={platformFeePercent === fee ? 'gold' : 'outline'}
                      size="sm"
                      style={{ flex: 1 }}
                      onPress={() => updatePlatformFee(fee)}
                    />
                  ))}
                </View>
              </Card>

              <Card style={{ gap: 12 }}>
                <SectionHeader title="👑 AstroVIP Pass Pricing Controller" subtitle="Configure subscription rates" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A' }}>
                    <Text style={{ fontSize: 11, color: '#B45309', fontWeight: '800' }}>MONTHLY VIP PASS</Text>
                    <Text style={{ fontSize: 18, color: '#D97706', fontWeight: '900', marginTop: 2 }}>₹{vipMonthlyPrice}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#ECFDF5', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' }}>
                    <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '800' }}>ANNUAL VIP PASS</Text>
                    <Text style={{ fontSize: 18, color: '#059669', fontWeight: '900', marginTop: 2 }}>₹{vipAnnualPrice}</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              9. USERS TAB
             ══════════════════════════════════════════════════ */}
          {tab === 'users' && (
            <View style={{ gap: spacing.md }}>
              <Card padded={false}>
                <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
                  <SectionHeader title="Registered Users (1,240)" subtitle="Account statuses & wallet balances" />
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

          {/* ══════════════════════════════════════════════════
              10. PUSH BROADCAST & OTA TAB
             ══════════════════════════════════════════════════ */}
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
                    placeholder="e.g. Tap now to join instant live audio/video consultation."
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

              {/* OTA App Updates Broadcaster */}
              <Card style={{ gap: spacing.md }}>
                <SectionHeader
                  title="🚀 In-App Over-The-Air (OTA) Update Broadcaster"
                  subtitle={`Current App Version: v${currentAppVersion}`}
                />

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>New Version Number</Text>
                  <TextInput
                    value={updateVerInput}
                    onChangeText={setUpdateVerInput}
                    placeholder="e.g. 1.6.0"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Release Notes (one per line)</Text>
                  <TextInput
                    value={updateNotesInput}
                    onChangeText={setUpdateNotesInput}
                    multiline
                    numberOfLines={4}
                    style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                  />
                </View>

                {otaBroadcastSuccess && (
                  <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' }}>
                    <Text style={{ ...typography.small, color: colors.auroraA, fontWeight: '700', textAlign: 'center' }}>
                      {otaBroadcastSuccess}
                    </Text>
                  </View>
                )}

                <Button
                  label="📡 Broadcast OTA Update to All Users"
                  variant="outline"
                  size="md"
                  onPress={handleBroadcastAppUpdate}
                />
              </Card>
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              11. ORDERS TAB
             ══════════════════════════════════════════════════ */}
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

          {/* ══════════════════════════════════════════════════
              12. SPELLS TAB
             ══════════════════════════════════════════════════ */}
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
            </View>
          )}

          {/* ══════════════════════════════════════════════════
              13. INVENTORY TAB
             ══════════════════════════════════════════════════ */}
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

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* ── CREATE COUPON MODAL ── */}
        <Modal visible={showCouponModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Promo Coupon</Text>
              <View style={{ gap: spacing.sm }}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Coupon Code (e.g. DIWALI50)</Text>
                  <TextInput
                    value={newCouponCode}
                    onChangeText={setNewCouponCode}
                    placeholder="e.g. MAHASHIVRATRI"
                    placeholderTextColor={colors.textFaint}
                    autoCapitalize="characters"
                    style={styles.fieldInput}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Coupon Description</Text>
                  <TextInput
                    value={newCouponTitle}
                    onChangeText={setNewCouponTitle}
                    placeholder="e.g. 50% Off On All Consultations"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Discount (%)</Text>
                    <TextInput
                      value={newCouponDiscount}
                      onChangeText={setNewCouponDiscount}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Min Recharge (₹)</Text>
                    <TextInput
                      value={newCouponMin}
                      onChangeText={setNewCouponMin}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 10 }}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={() => setShowCouponModal(false)}
                  />
                  <Button
                    label="Create Coupon"
                    variant="gold"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={handleCreateCoupon}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── REJECT KYC MODAL ── */}
        <Modal visible={!!rejectKycModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reject Astrologer Document</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
                Provide a reason so the astrologer can re-upload a valid document:
              </Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                style={[styles.fieldInput, { height: 70, textAlignVertical: 'top' }]}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 12 }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                  onPress={() => setRejectKycModal(null)}
                />
                <Button
                  label="Confirm Reject"
                  variant="danger"
                  size="md"
                  style={{ flex: 1 }}
                  onPress={() => {
                    if (rejectKycModal) {
                      rejectKyc(rejectKycModal, rejectReason);
                      setRejectKycModal(null);
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

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

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 10 }}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={() => setShowAddModal(false)}
                  />
                  <Button
                    label="Save Astrologer"
                    variant="gold"
                    size="md"
                    style={{ flex: 1 }}
                    onPress={handleAddAstrologer}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  adminTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,219,254,0.5)',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  adminBadge: {
    backgroundColor: 'rgba(217,119,6,0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(217,119,6,0.3)',
  },
  adminBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  adminSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  adminSignOutBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  adminSignOutText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  tabsWrapper: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191,219,254,0.4)',
    backgroundColor: '#FFFFFF',
  },
  tabsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
    height: 48,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  tabBtnActive: {
    backgroundColor: colors.saffron,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 50,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  statTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  manageCard: {
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  manageName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.text,
  },
  manageMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleOnline: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: colors.success,
  },
  toggleOffline: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: colors.danger,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  invControlsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing.sm,
  },
  inputBoxCol: {
    flex: 1,
    gap: 4,
  },
  inputColLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  invInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  revenueSplitRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  splitBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  splitPct: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.saffron,
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  userWallet: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gold,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  orderCard: {
    gap: spacing.xs,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gold,
  },
  userInfoBox: {
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: 3,
    marginTop: 6,
  },
  userInfoText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statusActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inventoryCard: {
    gap: spacing.sm,
  },
  invTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.text,
  },
  invSub: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
});
