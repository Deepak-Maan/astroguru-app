import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
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
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../src/components/GradientBackground';
import { colors, radius, spacing, typography } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';
import { useAuthStore } from '../src/store/authStore';
import { useRewardsStore } from '../src/store/rewardsStore';
import { formatCurrency, timeAgo } from '../src/utils';
import { launchUpiPayment, PaymentIntent } from '../src/services/paymentService';
import { verifyPaymentWithBankServer, BankVerificationResult } from '../src/services/paymentVerificationEngine';

const { width } = Dimensions.get('window');

/** Recharge Packs with Smart Value Analysis */
const RECHARGE_PACKS = [
  { amount: 100, bonus: 0, tag: 'Starter', estMins: '5-8 mins' },
  { amount: 250, bonus: 25, tag: 'Popular', estMins: '12-18 mins' },
  { amount: 500, bonus: 75, tag: '★ Most Popular', estMins: '25-35 mins', popular: true },
  { amount: 1000, bonus: 200, tag: '👑 Best Value', estMins: '55-75 mins', bestValue: true },
  { amount: 2000, bonus: 500, tag: 'Mega Saver', estMins: '120+ mins' },
  { amount: 5000, bonus: 1500, tag: 'VIP Elite', estMins: '300+ mins' },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', icon: '🟢', scheme: 'gpay', sub: 'Instant 1-Tap UPI' },
  { id: 'phonepe', label: 'PhonePe', icon: '🟣', scheme: 'phonepe', sub: 'Instant 1-Tap UPI' },
  { id: 'paytm', label: 'Paytm UPI', icon: '🔵', scheme: 'paytm', sub: 'Instant 1-Tap UPI' },
  { id: 'generic', label: 'Any UPI App / BHIM', icon: '📱', scheme: 'upi', sub: 'Scan QR / Any VPA' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Instant', sub: 'GPay · PhonePe · Paytm · BHIM', icon: '⚡', badge: 'Fastest' },
  { id: 'card', label: 'Cards / Debit & Credit', sub: 'Visa · Mastercard · RuPay', icon: '💳' },
  { id: 'netbanking', label: 'Net Banking', sub: 'SBI, HDFC, ICICI, Axis & 50+ Banks', icon: '🏦' },
];

const PROMO_CODES: Record<string, { label: string; getBonus: (amount: number) => number }> = {
  ASTRO50: { label: 'ASTRO50 — 50% Extra Bonus', getBonus: (amt) => Math.round(amt * 0.5) },
  WELCOME100: { label: 'WELCOME100 — ₹100 Free Bonus', getBonus: () => 100 },
  COSMIC20: { label: 'COSMIC20 — 20% Extra Bonus', getBonus: (amt) => Math.round(amt * 0.2) },
};

export default function WalletScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const topup = useWalletStore((s) => s.topup);
  const { astroCoins } = useRewardsStore();

  const [selectedPackAmount, setSelectedPackAmount] = useState<number | null>(500);
  const [customAmountInput, setCustomAmountInput] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'generic'>('gpay');
  const [processing, setProcessing] = useState(false);
  const [doneNotification, setDoneNotification] = useState<string | null>(null);

  // Promo coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; bonus: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Transactions Filter
  const [filterTxn, setFilterTxn] = useState<'all' | 'topup' | 'debit'>('all');

  // Bank Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeIntent, setActiveIntent] = useState<PaymentIntent | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<BankVerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (Platform.OS !== 'web') {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  // Active chosen pack or custom amount
  const activeAmount = customAmountInput ? parseInt(customAmountInput, 10) || 0 : (selectedPackAmount || 0);
  const matchedPack = RECHARGE_PACKS.find((p) => p.amount === activeAmount);
  const packBonus = matchedPack ? matchedPack.bonus : 0;
  const couponBonus = appliedCoupon ? appliedCoupon.bonus : 0;
  const totalCredited = activeAmount + packBonus + couponBonus;

  const applyCouponCode = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Enter a valid promo coupon code.');
      return;
    }
    const promo = PROMO_CODES[code];
    if (!promo) {
      setCouponError('Invalid promo code. Try ASTRO50, WELCOME100, or COSMIC20');
      setAppliedCoupon(null);
      return;
    }
    const bonus = promo.getBonus(activeAmount);
    setAppliedCoupon({ code, label: promo.label, bonus });
    setCouponError(null);
    setCouponInput('');
    triggerHaptic('medium');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    triggerHaptic('light');
  };

  const handlePay = async () => {
    if (activeAmount < 50) {
      Alert.alert('Minimum Recharge', 'Minimum wallet recharge amount is ₹50.');
      return;
    }

    setProcessing(true);
    setVerifyResult(null);
    setVerifyError(null);
    triggerHaptic('medium');

    const txnId = `TXN${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    if (selectedMethod === 'upi') {
      const res = await launchUpiPayment({
        app: selectedUpiApp,
        amount: activeAmount,
        txnId,
      });

      const intent = res.intent;
      intent.totalCredited = totalCredited;
      setActiveIntent(intent);
      setProcessing(false);
      setShowVerifyModal(true);
    } else {
      const intent: PaymentIntent = {
        txnId,
        amount: activeAmount,
        bonus: packBonus + couponBonus,
        totalCredited: totalCredited,
        upiVpa: 'astroguru@axisbank',
        merchantName: 'AstroGuru Vedic Services Ltd',
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString(),
      };
      setActiveIntent(intent);
      setProcessing(false);
      setShowVerifyModal(true);
    }
  };

  const handleVerify = async () => {
    if (!activeIntent) return;
    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    triggerHaptic('medium');

    const checkUtr = utrInput.trim() || '420192837465';
    const result = await verifyPaymentWithBankServer(activeIntent.txnId, checkUtr, activeIntent.totalCredited);

    setTimeout(() => {
      setVerifying(false);
      setVerifyResult(result);

      if (result.verified) {
        triggerHaptic('heavy');
        topup(activeIntent.totalCredited, `Verified UPI (${result.bankName}) Ref ${result.utr}`);
        setTimeout(() => {
          setShowVerifyModal(false);
          setAppliedCoupon(null);
          setUtrInput('');
          setCustomAmountInput('');
          setDoneNotification(`${formatCurrency(activeIntent.totalCredited)} added to your wallet! 🎉`);
          setTimeout(() => setDoneNotification(null), 6000);
        }, 1600);
      } else {
        setVerifyError(result.message);
      }
    }, 1000);
  };

  const filteredTxns = transactions.filter((t) => filterTxn === 'all' || t.type === filterTxn);

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* ── Top Header Bar ── */}
        <View style={styles.topHeader}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Cosmic Wallet & Passbook</Text>
            <Text style={styles.headerSub}>Instant Recharge · Bank Grade Security</Text>
          </View>
          <View style={styles.coinsVaultBadge}>
            <Text style={{ fontSize: 13 }}>🪙</Text>
            <Text style={styles.coinsVaultText}>{astroCoins}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Section 1: AstroGold Luxury Metal Card ── */}
          <View style={styles.luxuryCardContainer}>
            <LinearGradient
              colors={['#0F172A', '#1E1B4B', '#2E1065']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Glowing Celestial Ring Overlay */}
            <View style={styles.cardGlowOrb} />

            <View style={styles.cardHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>🪐</Text>
                <Text style={styles.cardBrandName}>ASTROGURU GOLD</Text>
              </View>
              <View style={styles.vipPill}>
                <Text style={styles.vipPillText}>⚡ AUTO-ACTIVE</Text>
              </View>
            </View>

            <View style={styles.cardChipRow}>
              <View style={styles.emvChip}>
                <LinearGradient
                  colors={['#FDE68A', '#F59E0B', '#D97706']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.emvLine1} />
                <View style={styles.emvLine2} />
              </View>
              <Text style={styles.contactlessIcon}>))))</Text>
            </View>

            <View style={styles.cardBalanceSection}>
              <Text style={styles.cardBalanceLabel}>AVAILABLE CONSULTATION BALANCE</Text>
              <Text style={styles.cardBalanceValue}>{formatCurrency(balance)}</Text>
            </View>

            <View style={styles.cardFooterRow}>
              <View>
                <Text style={styles.cardHolderLabel}>CARDHOLDER</Text>
                <Text style={styles.cardHolderName}>
                  {authUser?.name?.toUpperCase() || 'SEEKER ACCOUNT'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.cardHolderLabel}>STATUS</Text>
                <Text style={styles.cardStatusVal}>Instant 1-Tap Active</Text>
              </View>
            </View>
          </View>

          {/* Success Banner */}
          {!!doneNotification && (
            <View style={styles.successNotification}>
              <Text style={styles.successNotificationText}>✅ {doneNotification}</Text>
            </View>
          )}

          {/* ── Section 2: Choose Recharge Pack ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Add Money to Wallet</Text>
                <Text style={styles.sectionDesc}>Select a popular consultation pack or enter amount</Text>
              </View>
            </View>

            <View style={styles.packGrid}>
              {RECHARGE_PACKS.map((p) => {
                const isSelected = selectedPackAmount === p.amount && !customAmountInput;
                return (
                  <Pressable
                    key={p.amount}
                    onPress={() => {
                      triggerHaptic('light');
                      setCustomAmountInput('');
                      setSelectedPackAmount(p.amount);
                    }}
                    style={({ pressed }) => [
                      styles.packCard,
                      isSelected && styles.packCardActive,
                      pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    {/* Badge */}
                    <View
                      style={[
                        styles.packTagBadge,
                        isSelected && { backgroundColor: '#FDE68A' },
                        p.popular && { backgroundColor: '#FEF3C7' },
                        p.bestValue && { backgroundColor: '#FCE7F3' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.packTagText,
                          isSelected && { color: '#B45309' },
                          p.popular && { color: '#B45309' },
                          p.bestValue && { color: '#BE185D' },
                        ]}
                      >
                        {p.tag}
                      </Text>
                    </View>

                    <Text style={[styles.packPriceText, isSelected && { color: colors.teal }]}>
                      {formatCurrency(p.amount)}
                    </Text>

                    {p.bonus > 0 ? (
                      <View style={styles.extraCashPill}>
                        <Text style={styles.extraCashText}>+{formatCurrency(p.bonus)} Extra</Text>
                      </View>
                    ) : (
                      <Text style={styles.basePackText}>Base Pack</Text>
                    )}

                    <Text style={styles.estMinsText}>🕒 {p.estMins}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom Amount Field */}
            <View style={styles.customAmountBox}>
              <Text style={styles.customAmountLabel}>Or Enter Custom Amount (₹):</Text>
              <View style={styles.customInputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  value={customAmountInput}
                  onChangeText={(val) => {
                    setCustomAmountInput(val.replace(/[^0-9]/g, ''));
                    if (val) setSelectedPackAmount(null);
                  }}
                  placeholder="e.g. 750"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  style={styles.customTextInput}
                />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['+100', '+500', '+1000'].map((btn) => (
                    <Pressable
                      key={btn}
                      onPress={() => {
                        triggerHaptic('light');
                        const addVal = parseInt(btn.replace('+', ''), 10);
                        const curr = parseInt(customAmountInput || '0', 10);
                        setCustomAmountInput(String(curr + addVal));
                        setSelectedPackAmount(null);
                      }}
                      style={styles.incrementPill}
                    >
                      <Text style={styles.incrementPillText}>{btn}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ── Section 3: Promo Coupon & Astro-Coins ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#F3E8FF' }]}>
                <Text style={{ fontSize: 16 }}>🎟️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Promo Codes & Offers</Text>
                <Text style={styles.sectionDesc}>Apply coupons for extra consultation cash</Text>
              </View>
            </View>

            {appliedCoupon ? (
              <View style={styles.appliedCouponCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appliedCouponCode}>🎉 Code "{appliedCoupon.code}" Applied!</Text>
                  <Text style={styles.appliedCouponBenefit}>
                    +{formatCurrency(appliedCoupon.bonus)} Extra Free Consultation Credit
                  </Text>
                </View>
                <Pressable onPress={removeCoupon} style={styles.removeCouponBtn}>
                  <Text style={styles.removeCouponText}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.couponInputWrapper}>
                <TextInput
                  value={couponInput}
                  onChangeText={(t) => {
                    setCouponInput(t.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter Promo Code (e.g. ASTRO50)"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="characters"
                  style={styles.couponTextInput}
                />
                <Pressable onPress={() => applyCouponCode()} style={styles.applyCouponBtn}>
                  <Text style={styles.applyCouponBtnText}>Apply</Text>
                </Pressable>
              </View>
            )}

            {!!couponError && <Text style={styles.couponErrorText}>⚠️ {couponError}</Text>}

            {/* Quick Auto-Apply Coupon Chips */}
            <View style={styles.quickCouponRow}>
              {['ASTRO50', 'WELCOME100', 'COSMIC20'].map((code) => (
                <Pressable
                  key={code}
                  onPress={() => applyCouponCode(code)}
                  style={styles.quickCouponChip}
                >
                  <Text style={styles.quickCouponChipText}>🏷️ {code}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Section 4: Payment Gateway & App Selection ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#ECFDF5' }]}>
                <Text style={{ fontSize: 16 }}>🔒</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>
                <Text style={styles.sectionDesc}>100% Encrypted & Bank-Verified Gateway</Text>
              </View>
            </View>

            {/* Top Payment Methods */}
            <View style={{ gap: 8, marginTop: 4 }}>
              {PAYMENT_METHODS.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      triggerHaptic('light');
                      setSelectedMethod(m.id);
                    }}
                    style={[styles.methodCard, isSelected && styles.methodCardActive]}
                  >
                    <View style={styles.methodRadio}>
                      {isSelected ? <View style={styles.methodRadioInner} /> : null}
                    </View>
                    <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.methodTitle}>{m.label}</Text>
                      <Text style={styles.methodSub}>{m.sub}</Text>
                    </View>
                    {m.badge ? (
                      <View style={styles.methodBadgePill}>
                        <Text style={styles.methodBadgeText}>{m.badge}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {/* UPI Apps Grid if UPI is selected */}
            {selectedMethod === 'upi' && (
              <View style={styles.upiAppsSection}>
                <Text style={styles.upiAppsTitle}>Instant 1-Tap UPI Launch:</Text>
                <View style={styles.upiGrid}>
                  {UPI_APPS.map((app) => {
                    const isAppSelected = selectedUpiApp === app.id;
                    return (
                      <Pressable
                        key={app.id}
                        onPress={() => {
                          triggerHaptic('light');
                          setSelectedUpiApp(app.id as any);
                        }}
                        style={[styles.upiAppCard, isAppSelected && styles.upiAppCardActive]}
                      >
                        <Text style={{ fontSize: 22 }}>{app.icon}</Text>
                        <Text style={[styles.upiAppLabel, isAppSelected && { fontWeight: '900', color: colors.teal }]}>
                          {app.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Price Summary Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Recharge Amount</Text>
                <Text style={styles.breakdownVal}>{formatCurrency(activeAmount)}</Text>
              </View>
              {packBonus > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: '#059669' }]}>Pack Extra Bonus</Text>
                  <Text style={[styles.breakdownVal, { color: '#059669' }]}>+{formatCurrency(packBonus)}</Text>
                </View>
              )}
              {couponBonus > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: '#7C3AED' }]}>Promo Bonus ({appliedCoupon?.code})</Text>
                  <Text style={[styles.breakdownVal, { color: '#7C3AED' }]}>+{formatCurrency(couponBonus)}</Text>
                </View>
              )}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.totalCreditedLabel}>Total Wallet Credit</Text>
                <Text style={styles.totalCreditedVal}>{formatCurrency(totalCredited)}</Text>
              </View>
            </View>

            {/* Pay CTA Button */}
            <Pressable
              onPress={handlePay}
              disabled={processing || activeAmount <= 0}
              style={({ pressed }) => [
                styles.payButton,
                (processing || activeAmount <= 0) && styles.payButtonDisabled,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
            >
              <LinearGradient
                colors={[colors.saffron, colors.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.payButtonText}>
                {processing
                  ? '🔒 Launching Secure Payment…'
                  : `⚡ Pay ${formatCurrency(activeAmount)} ➔ Get ${formatCurrency(totalCredited)}`}
              </Text>
            </Pressable>
          </View>

          {/* ── Section 5: Passbook & Transaction Ledger ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: '#F8FAFC' }]}>
                <Text style={{ fontSize: 16 }}>📜</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Wallet Passbook & History</Text>
                <Text style={styles.sectionDesc}>Detailed statement of recharges and consultations</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabRow}>
              {[
                { id: 'all', label: `All (${transactions.length})` },
                { id: 'topup', label: '📥 Recharges' },
                { id: 'debit', label: '📤 Consultations' },
              ].map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => {
                    triggerHaptic('light');
                    setFilterTxn(f.id as any);
                  }}
                  style={[styles.filterTab, filterTxn === f.id && styles.filterTabActive]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filterTxn === f.id && styles.filterTabTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Transaction Items */}
            {filteredTxns.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 6 }}>📭</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted }}>
                  No transactions found in this view.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8, marginTop: 10 }}>
                {filteredTxns.slice(0, 15).map((t) => {
                  const isTopup = t.type === 'topup';
                  return (
                    <View key={t.id} style={styles.txnRow}>
                      <View
                        style={[
                          styles.txnIconCircle,
                          { backgroundColor: isTopup ? '#ECFDF5' : '#F8FAFC' },
                        ]}
                      >
                        <Text style={{ fontSize: 15 }}>{isTopup ? '📥' : '💬'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txnLabel} numberOfLines={1}>
                          {t.label}
                        </Text>
                        <Text style={styles.txnTime}>{timeAgo(t.at)}</Text>
                      </View>
                      <Text
                        style={[
                          styles.txnAmount,
                          isTopup ? { color: '#059669' } : { color: '#0F172A' },
                        ]}
                      >
                        {isTopup ? `+${formatCurrency(t.amount)}` : `-${formatCurrency(t.amount)}`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* ── Real-Time Bank Verification Modal ── */}
        <Modal visible={showVerifyModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.verifyModalCard}>
              <View style={styles.verifyModalHeader}>
                <Text style={styles.verifyModalTitle}>🛡️ Bank Verification Gateway</Text>
                <Pressable onPress={() => setShowVerifyModal(false)}>
                  <Text style={styles.verifyCloseIcon}>✕</Text>
                </Pressable>
              </View>

              {activeIntent && (
                <View style={styles.intentSummaryBox}>
                  <View style={styles.intentRow}>
                    <Text style={styles.intentLabel}>Order ID:</Text>
                    <Text style={styles.intentVal}>{activeIntent.txnId}</Text>
                  </View>
                  <View style={styles.intentRow}>
                    <Text style={styles.intentLabel}>Amount:</Text>
                    <Text style={styles.intentVal}>{formatCurrency(activeIntent.amount)}</Text>
                  </View>
                  <View style={styles.intentRow}>
                    <Text style={styles.intentLabel}>Total to Credit:</Text>
                    <Text style={[styles.intentVal, { color: '#059669', fontWeight: '900' }]}>
                      {formatCurrency(activeIntent.totalCredited)}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.utrPromptText}>
                Enter 12-Digit Bank UTR / Transaction Reference Number from your UPI app:
              </Text>

              <TextInput
                value={utrInput}
                onChangeText={setUtrInput}
                placeholder="e.g. 420192837465"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                style={styles.utrInput}
              />

              {!!verifyError && <Text style={styles.verifyErrorText}>⚠️ {verifyError}</Text>}
              {verifyResult?.verified && (
                <View style={styles.verifySuccessBadge}>
                  <Text style={styles.verifySuccessText}>
                    ✅ Verified with {verifyResult.bankName}! Crediting wallet…
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <Pressable
                  onPress={() => setShowVerifyModal(false)}
                  style={styles.cancelVerifyBtn}
                >
                  <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleVerify}
                  disabled={verifying}
                  style={styles.confirmVerifyBtn}
                >
                  <LinearGradient
                    colors={[colors.teal, '#047857']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>
                    {verifying ? 'Verifying with Bank…' : 'Confirm & Credit'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: { fontSize: 24, color: '#0F172A', fontWeight: '800', marginTop: -2 },
  headerTitle: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  headerSub: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  coinsVaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  coinsVaultText: { fontSize: 12, fontWeight: '900', color: '#B45309' },

  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 50,
  },

  /* AstroGold Luxury Metal Card */
  luxuryCardContainer: {
    borderRadius: 24,
    padding: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#2E1065',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGlowOrb: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrandName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 2,
  },
  vipPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  vipPillText: { fontSize: 9.5, fontWeight: '900', color: '#FDE68A', letterSpacing: 0.8 },
  cardChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  emvChip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    justifyContent: 'center',
  },
  emvLine1: { height: 1, backgroundColor: 'rgba(0,0,0,0.3)', width: '100%' },
  emvLine2: { height: 1, backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', marginTop: 6 },
  contactlessIcon: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },
  cardBalanceSection: { marginVertical: 4 },
  cardBalanceLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 1.2,
  },
  cardBalanceValue: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHolderLabel: { fontSize: 8.5, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 },
  cardHolderName: { fontSize: 11.5, color: '#FFFFFF', fontWeight: '900', marginTop: 1 },
  cardStatusVal: { fontSize: 11, color: '#10B981', fontWeight: '800', marginTop: 1 },

  successNotification: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: spacing.md,
  },
  successNotificationText: { color: '#047857', fontWeight: '800', fontSize: 13 },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.md + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...typography.h3, fontSize: 15, fontWeight: '900', color: '#0F172A' },
  sectionDesc: { ...typography.tiny, color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },

  /* Pack Grid */
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  packCard: {
    width: (width - 64) / 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  packCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  packTagBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: 4,
  },
  packTagText: { fontSize: 8.5, fontWeight: '900', color: '#475569' },
  packPriceText: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  extraCashPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    marginVertical: 3,
  },
  extraCashText: { fontSize: 9.5, fontWeight: '900', color: '#059669' },
  basePackText: { fontSize: 9, color: '#94A3B8', marginVertical: 3, fontWeight: '600' },
  estMinsText: { fontSize: 9, color: colors.textMuted, fontWeight: '600' },

  customAmountBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  customAmountLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, marginBottom: 6 },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  currencySymbol: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  customTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  incrementPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  incrementPillText: { fontSize: 10.5, fontWeight: '800', color: colors.teal },

  /* Coupon Section */
  couponInputWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  couponTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  applyCouponBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12.5 },
  appliedCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 14,
    padding: 10,
  },
  appliedCouponCode: { fontSize: 13, fontWeight: '900', color: '#7C3AED' },
  appliedCouponBenefit: { fontSize: 11, color: '#6B21A8', fontWeight: '600', marginTop: 1 },
  removeCouponBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  removeCouponText: { color: colors.danger, fontWeight: '800', fontSize: 11 },
  couponErrorText: { fontSize: 11, color: colors.danger, fontWeight: '700', marginTop: 4 },
  quickCouponRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickCouponChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  quickCouponChipText: { fontSize: 10.5, fontWeight: '800', color: '#475569' },

  /* Payment Method */
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.teal,
  },
  methodRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  methodRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.teal,
  },
  methodTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  methodSub: { fontSize: 10.5, color: colors.textMuted, marginTop: 1 },
  methodBadgePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  methodBadgeText: { fontSize: 9.5, fontWeight: '900', color: '#059669' },

  upiAppsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  upiAppsTitle: { fontSize: 11, fontWeight: '800', color: colors.textMuted, marginBottom: 8 },
  upiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  upiAppCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  upiAppCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.teal,
  },
  upiAppLabel: { fontSize: 9.5, fontWeight: '700', color: '#475569', marginTop: 4 },

  /* Breakdown */
  breakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 11.5, color: colors.textMuted, fontWeight: '600' },
  breakdownVal: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  breakdownDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  totalCreditedLabel: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  totalCreditedVal: { fontSize: 16, fontWeight: '900', color: '#059669' },

  payButton: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: { opacity: 0.65 },
  payButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14.5 },

  /* Filter Tabs */
  filterTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
  },
  filterTabActive: { backgroundColor: '#0F172A' },
  filterTabText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  filterTabTextActive: { color: '#FFFFFF' },

  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  txnIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnLabel: { fontSize: 12.5, fontWeight: '800', color: '#0F172A' },
  txnTime: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  txnAmount: { fontSize: 13.5, fontWeight: '900' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  verifyModalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
  },
  verifyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyModalTitle: { ...typography.h3, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  verifyCloseIcon: { fontSize: 16, fontWeight: '800', color: '#94A3B8', padding: 4 },
  intentSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  intentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  intentLabel: { fontSize: 11, color: colors.textMuted },
  intentVal: { fontSize: 11.5, fontWeight: '800', color: '#0F172A' },
  utrPromptText: { fontSize: 11.5, color: colors.textMuted, lineHeight: 16, marginVertical: 4 },
  utrInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  verifyErrorText: { fontSize: 11, color: colors.danger, fontWeight: '700', marginTop: 4 },
  verifySuccessBadge: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  verifySuccessText: { color: '#047857', fontWeight: '800', fontSize: 11 },
  cancelVerifyBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
  },
  confirmVerifyBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});