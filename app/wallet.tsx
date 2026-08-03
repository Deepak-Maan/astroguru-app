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
          {/* Balance card */}
          <LinearGradient
            colors={['rgba(245,197,66,0.30)', 'rgba(255,138,61,0.12)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.balanceInner}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
              <Text style={styles.balanceHint}>
                Real-time wallet for astrologer consultations & AI chats
              </Text>
            </View>
            <Text style={styles.balanceCoin}>💰</Text>
          </LinearGradient>

          {!!done && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✅ {done}</Text>
            </View>
          )}

          {/* Recharge Packs */}
          <View>
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
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {active && (
                      <LinearGradient
                        colors={['rgba(122,60,255,0.45)', 'rgba(194,75,255,0.20)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={[styles.packAmount, active && { color: colors.white }]}>
                      {formatCurrency(p.amount)}
                    </Text>
                    {p.bonus > 0 ? (
                      <View style={styles.packBonusBadge}>
                        <Text style={styles.packBonus}>+{formatCurrency(p.bonus)}</Text>
                      </View>
                    ) : (
                      <Text style={styles.packNoBonus}>base pack</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Payment Method & UPI App Selector */}
          {!!selected && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Select Real Payment App" />
              
              {/* Method Row */}
              <Card padded={false}>
                {METHODS.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => setMethod(m.id)}
                    style={({ pressed }) => [styles.method, pressed && { opacity: 0.7 }]}
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
                <Card>
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
                          {active && (
                            <LinearGradient
                              colors={['rgba(245,197,66,0.22)', 'rgba(255,138,61,0.08)']}
                              style={StyleSheet.absoluteFill}
                            />
                          )}
                          <Text style={{ fontSize: 22 }}>{app.icon}</Text>
                          <Text style={[styles.upiAppLabel, active && { color: colors.gold }]}>{app.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Card>
              )}

              {/* Order Summary */}
              <Card style={{ gap: spacing.sm }}>
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
                    <Text style={[styles.summaryValue, { color: colors.gold }]}>
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
              <Card>
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
                        <LinearGradient colors={[colors.gold, colors.saffron]} style={styles.couponApplyGrad}>
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
                size="lg"
                loading={processing}
                onPress={handlePay}
              />
            </View>
          )}

          {/* Transaction History */}
          <View>
            <SectionHeader title="Transaction History" subtitle={`${transactions.length} entries`} />
            <View style={styles.filterRow}>
              {(['all', 'topup', 'debit'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilterTxn(f)}
                  style={[styles.filterTab, filterTxn === f && styles.filterTabActive]}
                >
                  {filterTxn === f && (
                    <LinearGradient colors={[colors.auroraA, colors.auroraB]} style={StyleSheet.absoluteFill} />
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
                        { backgroundColor: t.type === 'topup' ? 'rgba(61,220,132,0.16)' : 'rgba(255,90,110,0.16)' },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{t.type === 'topup' ? '↓' : '↑'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txnLabel}>{t.label}</Text>
                      <Text style={styles.txnTime}>{timeAgo(t.at)}</Text>
                    </View>
                    <Text style={[styles.txnAmount, { color: t.type === 'topup' ? colors.success : colors.danger }]}>
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
                Merchant Ref: <Text style={{ color: colors.gold }}>{activeIntent?.txnId}</Text>
              </Text>

              <View style={styles.verifyBox}>
                <Text style={{ fontSize: 24 }}>🏦</Text>
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
                <View style={[styles.diagBox, { borderColor: verifyResult.verified ? colors.success : colors.danger }]}>
                  <Text style={[styles.diagTitle, { color: verifyResult.verified ? colors.success : colors.danger }]}>
                    {verifyResult.verified ? '✓ BANK RECEIPT CONFIRMED' : '❌ VERIFICATION FAILED'}
                  </Text>
                  <Text style={styles.diagRow}>Node: <Text style={{ color: colors.text }}>{verifyResult.bankName}</Text></Text>
                  <Text style={styles.diagRow}>Status: <Text style={{ color: verifyResult.verified ? colors.success : colors.danger }}>{verifyResult.status}</Text></Text>
                  <Text style={styles.diagRow}>Gateway Ref: <Text style={{ color: colors.gold }}>{verifyResult.gatewayRef}</Text></Text>
                </View>
              )}

              {!!verifyError && <Text style={styles.verifyErrorText}>⚠️ {verifyError}</Text>}

              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },

  balanceCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.4)',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInner: { flex: 1, padding: spacing.xl, alignItems: 'flex-start' },
  balanceCoin: { fontSize: 56, marginRight: spacing.xl, opacity: 0.5 },
  balanceLabel: { ...typography.tiny, color: colors.goldSoft, letterSpacing: 1.4 },
  balanceValue: { ...typography.display, fontSize: 38, color: colors.gold, marginTop: spacing.sm },
  balanceHint: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.sm },

  successBanner: {
    backgroundColor: 'rgba(61,220,132,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(61,220,132,0.45)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  successText: { ...typography.small, color: colors.success, fontWeight: '700', textAlign: 'center' },

  packGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pack: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    gap: 4,
  },
  packActive: { borderColor: colors.auroraA },
  packAmount: { ...typography.h3, color: colors.text },
  packBonusBadge: {
    backgroundColor: 'rgba(56,225,195,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  packBonus: { ...typography.tiny, fontSize: 9.5, color: colors.teal, fontWeight: '700' },
  packNoBonus: { ...typography.tiny, fontSize: 9.5, color: colors.textFaint },

  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  methodIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIcon: { fontSize: 18 },
  methodLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  methodSub: { ...typography.tiny, color: colors.textFaint, marginTop: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.gold },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.gold },

  upiAppGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  upiAppCell: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  upiAppCellActive: { borderColor: colors.gold },
  upiAppLabel: { ...typography.small, color: colors.text, fontWeight: '700', fontSize: 13 },

  summaryTitle: { ...typography.h3, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { ...typography.small, color: colors.textMuted },
  summaryValue: { ...typography.small, color: colors.text, fontWeight: '700' },
  summaryTotal: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: { ...typography.h3, fontSize: 15, color: colors.text },
  totalValue: { ...typography.h2, color: colors.gold },

  couponRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, alignItems: 'center' },
  couponInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '700',
  },
  couponApplyBtn: { borderRadius: radius.md, overflow: 'hidden' },
  couponApplyGrad: { paddingHorizontal: spacing.lg, paddingVertical: 11, alignItems: 'center' },
  couponApplyText: { ...typography.small, color: colors.bg, fontWeight: '800' },
  couponError: { ...typography.tiny, color: colors.danger, marginTop: spacing.xs },

  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(245,197,66,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.4)',
    padding: spacing.md,
  },
  couponAppliedIcon: { fontSize: 20 },
  couponAppliedLabel: { ...typography.small, color: colors.gold, fontWeight: '700' },
  couponAppliedBonus: { ...typography.tiny, color: colors.teal, marginTop: 2 },
  couponRemove: { ...typography.tiny, color: colors.danger, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill, overflow: 'hidden' },
  filterTabActive: {},
  filterTabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  filterTabTextActive: { color: colors.white },

  txn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  txnIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  txnLabel: { ...typography.small, color: colors.text, fontWeight: '600' },
  txnTime: { ...typography.tiny, color: colors.textFaint, marginTop: 1 },
  txnAmount: { ...typography.small, fontWeight: '800', fontSize: 15 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.80)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#150C33',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.md,
  },
  modalTitle: { ...typography.h2, color: colors.gold, textAlign: 'center' },
  modalSub: { ...typography.tiny, color: colors.textMuted, textAlign: 'center' },
  verifyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  verifyBoxTitle: { ...typography.small, color: colors.text, fontWeight: '700' },
  verifyBoxSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  utrSection: { gap: 4 },
  utrLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  utrInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  utrHint: { ...typography.tiny, color: colors.textFaint, fontSize: 10.5 },
  diagBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  diagTitle: { ...typography.tiny, fontWeight: '800', fontSize: 11, marginBottom: 2 },
  diagRow: { ...typography.tiny, color: colors.textMuted, fontSize: 11 },
  verifyErrorText: { ...typography.tiny, color: colors.danger, textAlign: 'center' },
});
