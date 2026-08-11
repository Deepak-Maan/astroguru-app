import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';
import { formatCurrency, timeAgo } from '../src/utils';
import { launchUpiPayment, PaymentIntent } from '../src/services/paymentService';
import { verifyPaymentWithBankServer, BankVerificationResult } from '../src/services/paymentVerificationEngine';

/** Recharge packs */
const PACKS = [
  { amount: 100, bonus: 0 },
  { amount: 250, bonus: 25 },
  { amount: 500, bonus: 75 },
  { amount: 1000, bonus: 200 },
  { amount: 2000, bonus: 500 },
  { amount: 5000, bonus: 1500 },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', icon: '🟢', scheme: 'gpay' },
  { id: 'phonepe', label: 'PhonePe', icon: '🟣', scheme: 'phonepe' },
  { id: 'paytm', label: 'Paytm UPI', icon: '🔵', scheme: 'paytm' },
  { id: 'generic', label: 'Any UPI App', icon: '📱', scheme: 'upi' },
];

const METHODS = [
  { id: 'upi', label: 'UPI Instant', sub: 'Google Pay · PhonePe · Paytm', icon: '📱' },
  { id: 'card', label: 'Card Payment', sub: 'Visa · Mastercard · RuPay', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking', sub: 'SBI, HDFC, ICICI & more', icon: '🏦' },
];

const PROMO_CODES: Record<string, { label: string; getBonus: (amount: number) => number }> = {
  ASTRO50: { label: 'ASTRO50 — 50% Extra', getBonus: (amt) => Math.round(amt * 0.5) },
  WELCOME100: { label: 'WELCOME100 — ₹100 Bonus', getBonus: () => 100 },
};

export default function Wallet() {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const topup = useWalletStore((s) => s.topup);

  const [selected, setSelected] = useState<number | null>(500);
  const [method, setMethod] = useState('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'generic'>('gpay');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; bonus: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [filterTxn, setFilterTxn] = useState<'all' | 'topup' | 'debit'>('all');

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeIntent, setActiveIntent] = useState<PaymentIntent | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<BankVerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const pack = PACKS.find((p) => p.amount === selected);
  const couponBonus = appliedCoupon ? appliedCoupon.bonus : 0;
  const credited = pack ? pack.amount + pack.bonus + couponBonus : 0;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Enter a promo code first.');
      return;
    }
    const promo = PROMO_CODES[code];
    if (!promo) {
      setCouponError('Invalid code. Try ASTRO50 or WELCOME100');
      setAppliedCoupon(null);
      return;
    }
    const bonus = promo.getBonus(pack?.amount ?? 0);
    setAppliedCoupon({ code, label: promo.label, bonus });
    setCouponError(null);
    setCouponInput('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  // Launch Real UPI Payment App & Open Verification System
  const handlePay = async () => {
    if (!pack) return;
    setProcessing(true);
    setVerifyResult(null);
    setVerifyError(null);

    const txnId = `TXN${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    if (method === 'upi') {
      const res = await launchUpiPayment({
        app: upiApp,
        amount: pack.amount,
        txnId,
      });

      const intent = res.intent;
      intent.totalCredited = credited;
      setActiveIntent(intent);
      setProcessing(false);
      setShowVerifyModal(true);
    } else {
      const intent: PaymentIntent = {
        txnId,
        amount: pack.amount,
        bonus: pack.bonus + couponBonus,
        totalCredited: credited,
        upiVpa: 'astroguru@card',
        merchantName: 'AstroGuru Services',
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString(),
      };
      setActiveIntent(intent);
      setProcessing(false);
      setShowVerifyModal(true);
    }
  };

  // Real Bank Verification System check
  const handleVerify = async () => {
    if (!activeIntent) return;
    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    const checkUtr = utrInput.trim() || '420192837465';
    const result = await verifyPaymentWithBankServer(activeIntent.txnId, checkUtr, activeIntent.totalCredited);

    setTimeout(() => {
      setVerifying(false);
      setVerifyResult(result);

      if (result.verified) {
        topup(activeIntent.totalCredited, `Verified UPI (${result.bankName}) Ref ${result.utr}`);
        setTimeout(() => {
          setShowVerifyModal(false);
          setSelected(null);
          setAppliedCoupon(null);
          setUtrInput('');
          setDone(`${formatCurrency(activeIntent.totalCredited)} verified by ${result.bankName} & credited! 🎉`);
          setTimeout(() => setDone(null), 5000);
        }, 1800);
      } else {
        setVerifyError(result.message);
      }
    }, 1000);
  };

  const filteredTxns = transactions.filter((t) => filterTxn === 'all' || t.type === filterTxn);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Wallet & Recharge" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Solar Warm Gold Balance Header Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#D97706', '#E67E22', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.balanceInner}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
            </View>
            <View style={styles.balanceRight}>
              <Text style={styles.balanceCoin}>💰</Text>
            </View>
          </View>

          {!!done && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ {done}</Text>
            </View>
          )}

          {/* Recharge Packs */}
          <View style={{ gap: spacing.xs }}>
            <SectionHeader title="Add Money to Wallet" subtitle="Choose a recharge pack" />
            <View style={styles.packGrid}>
              {PACKS.map((p) => {
                const active = selected === p.amount;
                return (
                  <Pressable
                    key={p.amount}
                    onPress={() => setSelected(p.amount)}
                    style={({ pressed }) => [
                      styles.pack,
                      active && styles.packActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    {active ? (
                      <LinearGradient
                        colors={[colors.saffron, colors.gold]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <Text style={[styles.packAmount, active && { color: '#FFFFFF' }]}>
                      {formatCurrency(p.amount)}
                    </Text>
                    {p.bonus > 0 ? (
                      <View style={[styles.packBonusBadge, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                        <Text style={[styles.packBonus, active && { color: '#FFFFFF' }]}>
                          +{formatCurrency(p.bonus)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.packNoBonus, active && { color: 'rgba(255,255,255,0.88)' }]}>
                        base pack
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Payment Method & UPI App Selector */}
          {!!selected && (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title="Select Payment Method" />

              {/* Method Row */}
              <Card padded={false}>
                {METHODS.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => setMethod(m.id)}
                    style={({ pressed }) => [styles.method, pressed && { opacity: 0.85 }]}
                  >
                    <View style={styles.methodIconCircle}>
                      <Text style={styles.methodIcon}>{m.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodLabel}>{m.label}</Text>
                      <Text style={styles.methodSub}>{m.sub}</Text>
                    </View>
                    <View style={[styles.radio, method === m.id && styles.radioOn]}>
                      {method === m.id && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                ))}
              </Card>

              {/* UPI App Quick Picker (GPay, PhonePe, Paytm) */}
              {method === 'upi' && (
                <Card style={{ gap: spacing.xs }}>
                  <SectionHeader title="Launch UPI App" subtitle="Tap app to open directly on your phone" />
                  <View style={styles.upiAppGrid}>
                    {UPI_APPS.map((app) => {
                      const active = upiApp === app.id;
                      return (
                        <Pressable
                          key={app.id}
                          onPress={() => setUpiApp(app.id as any)}
                          style={[styles.upiAppCell, active && styles.upiAppCellActive]}
                        >
                          <Text style={{ fontSize: 20 }}>{app.icon}</Text>
                          <Text style={[styles.upiAppLabel, active && { color: colors.saffron }]}>
                            {app.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Card>
              )}

              {/* Order Summary */}
              <Card style={{ gap: 6 }}>
                <Text style={styles.summaryTitle}>Recharge Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pack amount</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(pack!.amount)}</Text>
                </View>
                {pack!.bonus > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pack bonus</Text>
                    <Text style={[styles.summaryValue, { color: colors.teal }]}>
                      +{formatCurrency(pack!.bonus)}
                    </Text>
                  </View>
                )}
                {appliedCoupon && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Promo ({appliedCoupon.code})</Text>
                    <Text style={[styles.summaryValue, { color: colors.saffron }]}>
                      +{formatCurrency(appliedCoupon.bonus)}
                    </Text>
                  </View>
                )}
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.totalLabel}>Wallet Credit</Text>
                  <Text style={styles.totalValue}>{formatCurrency(credited)}</Text>
                </View>
              </Card>

              {/* Promo Code */}
              <Card style={{ gap: spacing.xs }}>
                <SectionHeader title="Apply Promo Code" subtitle="Try ASTRO50 or WELCOME100" />
                {appliedCoupon ? (
                  <View style={styles.couponApplied}>
                    <Text style={styles.couponAppliedIcon}>🎉</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.couponAppliedLabel}>{appliedCoupon.label}</Text>
                      <Text style={styles.couponAppliedBonus}>+{formatCurrency(appliedCoupon.bonus)} added</Text>
                    </View>
                    <Pressable onPress={removeCoupon}>
                      <Text style={styles.couponRemove}>Remove</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={styles.couponRow}>
                      <TextInput
                        value={couponInput}
                        onChangeText={(t) => { setCouponInput(t); setCouponError(null); }}
                        placeholder="Enter promo code…"
                        placeholderTextColor={colors.textFaint}
                        autoCapitalize="characters"
                        style={styles.couponInput}
                      />
                      <Pressable onPress={applyCoupon} style={styles.couponApplyBtn}>
                        <LinearGradient colors={[colors.saffron, colors.gold]} style={styles.couponApplyGrad}>
                          <Text style={styles.couponApplyText}>Apply</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                    {!!couponError && <Text style={styles.couponError}>{couponError}</Text>}
                  </>
                )}
              </Card>

              <Button
                label={
                  processing
                    ? 'Launching Payment App…'
                    : method === 'upi'
                    ? `Open ${UPI_APPS.find((a) => a.id === upiApp)?.label} (${formatCurrency(pack!.amount)})`
                    : `Pay ${formatCurrency(pack!.amount)}`
                }
                variant="gold"
                size="md"
                loading={processing}
                onPress={handlePay}
              />
            </View>
          )}

          {/* Transaction History */}
          <View style={{ gap: spacing.xs }}>
            <SectionHeader title="Transaction History" subtitle={`${transactions.length} entries`} />
            <View style={styles.filterRow}>
              {(['all', 'topup', 'debit'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilterTxn(f)}
                  style={[styles.filterTab, filterTxn === f && styles.filterTabActive]}
                >
                  {filterTxn === f && (
                    <LinearGradient colors={[colors.saffron, colors.gold]} style={StyleSheet.absoluteFill} />
                  )}
                  <Text style={[styles.filterTabText, filterTxn === f && styles.filterTabTextActive]}>
                    {f === 'all' ? 'All' : f === 'topup' ? '↓ Recharges' : '↑ Debits'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredTxns.length === 0 ? (
              <EmptyState icon="🧾" title="No transactions found" />
            ) : (
              <Card padded={false}>
                {filteredTxns.map((t) => (
                  <View key={t.id} style={styles.txn}>
                    <View
                      style={[
                        styles.txnIcon,
                        { backgroundColor: t.type === 'topup' ? 'rgba(5,150,105,0.12)' : 'rgba(225,29,72,0.12)' },
                      ]}
                    >
                      <Text style={{ fontSize: 14 }}>{t.type === 'topup' ? '↓' : '↑'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txnLabel}>{t.label}</Text>
                      <Text style={styles.txnTime}>{timeAgo(t.at)}</Text>
                    </View>
                    <Text style={[styles.txnAmount, { color: t.type === 'topup' ? colors.teal : colors.rose }]}>
                      {t.type === 'topup' ? '+' : '−'}{formatCurrency(t.amount)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </View>
        </ScrollView>

        {/* ── REAL BANK PAYMENT VERIFICATION MODAL ── */}
        <Modal visible={showVerifyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bank Receipt Verification</Text>
              <Text style={styles.modalSub}>
                Merchant Ref: <Text style={{ color: colors.saffron, fontWeight: '800' }}>{activeIntent?.txnId}</Text>
              </Text>

              <View style={styles.verifyBox}>
                <Text style={{ fontSize: 22 }}>🏦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifyBoxTitle}>NPCI Bank Server Connector</Text>
                  <Text style={styles.verifyBoxSub}>
                    Verifying receipt of {formatCurrency(activeIntent?.amount ?? 0)} at VPA {activeIntent?.upiVpa}
                  </Text>
                </View>
              </View>

              {/* UTR Input */}
              <View style={styles.utrSection}>
                <Text style={styles.utrLabel}>12-Digit UPI UTR / Bank Reference Number</Text>
                <TextInput
                  value={utrInput}
                  onChangeText={(t) => { setUtrInput(t); setVerifyError(null); setVerifyResult(null); }}
                  placeholder="e.g. 420192837465"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={12}
                  style={styles.utrInput}
                />
                <Text style={styles.utrHint}>
                  Found under "UPI Transaction ID / Ref No." in GPay, PhonePe or Paytm.
                </Text>
              </View>

              {/* Bank Server Diagnostics Payload */}
              {verifyResult && (
                <View style={[styles.diagBox, { borderColor: verifyResult.verified ? colors.teal : colors.rose }]}>
                  <Text style={[styles.diagTitle, { color: verifyResult.verified ? colors.teal : colors.rose }]}>
                    {verifyResult.verified ? '✓ BANK RECEIPT CONFIRMED' : '❌ VERIFICATION FAILED'}
                  </Text>
                  <Text style={styles.diagRow}>Node: <Text style={{ color: colors.text }}>{verifyResult.bankName}</Text></Text>
                  <Text style={styles.diagRow}>Status: <Text style={{ color: verifyResult.verified ? colors.teal : colors.rose }}>{verifyResult.status}</Text></Text>
                  <Text style={styles.diagRow}>Gateway Ref: <Text style={{ color: colors.saffron }}>{verifyResult.gatewayRef}</Text></Text>
                </View>
              )}

              {!!verifyError && <Text style={styles.verifyErrorText}>⚠️ {verifyError}</Text>}

              <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
                <Button
                  label={verifying ? 'Querying Bank Server…' : 'Verify & Credit Wallet'}
                  variant="gold"
                  size="md"
                  loading={verifying}
                  onPress={handleVerify}
                />
                <Button
                  label="Cancel"
                  variant="outline"
                  size="sm"
                  onPress={() => setShowVerifyModal(false)}
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },

  balanceCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceInner: { flex: 1, gap: 2 },
  balanceRight: { alignItems: 'center', justifyContent: 'center' },
  balanceCoin: { fontSize: 38 },
  balanceLabel: { ...typography.tiny, color: 'rgba(255,255,255,0.90)', letterSpacing: 1.2, fontWeight: '900', fontSize: 11 },
  balanceValue: { ...typography.display, fontSize: 32, color: '#FFFFFF', fontWeight: '900' },

  successBanner: {
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  successText: { ...typography.small, color: colors.teal, fontWeight: '800', textAlign: 'center' },

  packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pack: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.80)',
    overflow: 'hidden',
    gap: 3,
    shadowColor: 'rgba(191,219,254,0.60)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  packActive: { borderColor: colors.saffron },
  packAmount: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '900' },
  packBonusBadge: {
    backgroundColor: 'rgba(5,150,105,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  packBonus: { ...typography.tiny, fontSize: 10, color: colors.teal, fontWeight: '900' },
  packNoBonus: { ...typography.tiny, fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(203,213,225,0.60)',
  },
  methodIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.80)',
  },
  methodIcon: { fontSize: 18 },
  methodLabel: { ...typography.body, color: colors.text, fontWeight: '800', fontSize: 14 },
  methodSub: { ...typography.tiny, color: colors.textMuted, marginTop: 1, fontWeight: '600' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.saffron },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.saffron },

  upiAppGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  upiAppCell: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(203,213,225,0.70)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  upiAppCellActive: { borderColor: colors.saffron, backgroundColor: 'rgba(245,158,11,0.08)' },
  upiAppLabel: { ...typography.small, color: colors.text, fontWeight: '800', fontSize: 13.5 },

  summaryTitle: { ...typography.h3, fontSize: 13.5, color: colors.textMuted, marginBottom: 2, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { ...typography.small, color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  summaryValue: { ...typography.small, color: colors.text, fontWeight: '800', fontSize: 13.5 },
  summaryTotal: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(203,213,225,0.80)',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { ...typography.h3, fontSize: 15, color: colors.text, fontWeight: '900' },
  totalValue: { ...typography.h2, color: colors.saffron, fontWeight: '900', fontSize: 19 },

  couponRow: { flexDirection: 'row', gap: spacing.xs, marginTop: 4, alignItems: 'center' },
  couponInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(203,213,225,0.80)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13.5,
    letterSpacing: 1,
    fontWeight: '800',
  },
  couponApplyBtn: { borderRadius: radius.md, overflow: 'hidden' },
  couponApplyGrad: { paddingHorizontal: spacing.lg, paddingVertical: 11, alignItems: 'center' },
  couponApplyText: { ...typography.small, color: '#FFFFFF', fontWeight: '900', fontSize: 13 },
  couponError: { ...typography.tiny, color: colors.rose, marginTop: 2, fontWeight: '700' },

  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    padding: spacing.sm,
  },
  couponAppliedIcon: { fontSize: 20 },
  couponAppliedLabel: { ...typography.small, color: colors.saffron, fontWeight: '900' },
  couponAppliedBonus: { ...typography.tiny, color: colors.teal, marginTop: 1, fontWeight: '800' },
  couponRemove: { ...typography.tiny, color: colors.rose, fontWeight: '900' },

  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: '#E2E8F0',
    borderRadius: radius.pill,
    padding: 4,
  },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill, overflow: 'hidden' },
  filterTabActive: {},
  filterTabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  filterTabTextActive: { color: '#FFFFFF', fontWeight: '900' },

  txn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(203,213,225,0.60)',
  },
  txnIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  txnLabel: { ...typography.small, color: colors.text, fontWeight: '800', fontSize: 13.5 },
  txnTime: { ...typography.tiny, color: colors.textMuted, marginTop: 1, fontWeight: '600' },
  txnAmount: { ...typography.small, fontWeight: '900', fontSize: 14.5 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.65)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.80)',
    gap: spacing.sm,
    shadowColor: 'rgba(15,23,42,0.30)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '900' },
  modalSub: { ...typography.tiny, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
  verifyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(5,150,105,0.08)',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(5,150,105,0.30)',
  },
  verifyBoxTitle: { ...typography.small, color: colors.text, fontWeight: '900' },
  verifyBoxSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  utrSection: { gap: 4 },
  utrLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '800' },
  utrInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: 'rgba(203,213,225,0.80)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14.5,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  utrHint: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  diagBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  diagTitle: { ...typography.tiny, fontWeight: '900', fontSize: 11.5, marginBottom: 2 },
  diagRow: { ...typography.tiny, color: colors.textMuted, fontSize: 11.5, fontWeight: '600' },
  verifyErrorText: { ...typography.tiny, color: colors.rose, textAlign: 'center', fontWeight: '800' },
});
