import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useSubscriptionStore, VIP_PLANS } from '../src/store/subscriptionStore';
import { useWalletStore } from '../src/store/walletStore';
import { formatCurrency } from '../src/utils';

export default function VipScreen() {
  const router = useRouter();
  const isVip = useSubscriptionStore((s) => s.isVip);
  const planId = useSubscriptionStore((s) => s.planId);
  const expiresAt = useSubscriptionStore((s) => s.expiresAt);
  const subscribe = useSubscriptionStore((s) => s.subscribe);
  const cancel = useSubscriptionStore((s) => s.cancel);

  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');

  const [purchasing, setPurchasing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const plan = VIP_PLANS.find((p) => p.id === selectedPlan) || VIP_PLANS[1];

  const handleSubscribe = () => {
    if (paymentMethod === 'wallet') {
      if (balance < plan.price) {
        setShowRechargeModal(true);
        return;
      }
      setPurchasing(true);
      setTimeout(() => {
        debit(plan.price, `AstroVIP Subscription (${plan.name})`);
        subscribe(selectedPlan);
        setPurchasing(false);
        setShowSuccessModal(true);
      }, 1000);
    } else {
      setPurchasing(true);
      setTimeout(() => {
        subscribe(selectedPlan);
        setPurchasing(false);
        setShowSuccessModal(true);
      }, 1400);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="AstroVIP Pass" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero VIP Gold Card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['rgba(230,126,34,0.14)', 'rgba(212,172,13,0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.crownCircle}>
              <Text style={{ fontSize: 36 }}>👑</Text>
            </View>
            <Text style={styles.heroTitle}>AstroVIP Membership</Text>
            <Text style={styles.heroSub}>
              {isVip
                ? `Active ${planId?.toUpperCase()} Pass · Expires ${expiresAt}`
                : 'Unlock 15% discount on all consultations & premium cosmic features'}
            </Text>

            {isVip && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>⚡ VIP PASS ACTIVE</Text>
              </View>
            )}
          </View>

          {/* Plan Selector Grid */}
          {!isVip && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Choose Subscription Duration" subtitle="Flexible Monthly or Value Yearly Pass" />
              <View style={styles.planGrid}>
                {VIP_PLANS.map((p) => {
                  const active = selectedPlan === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelectedPlan(p.id)}
                      style={({ pressed }) => [
                        styles.planCard,
                        active && styles.planCardActive,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      {active && (
                        <LinearGradient
                          colors={['rgba(230,126,34,0.12)', 'rgba(212,172,13,0.04)']}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      {!!p.savings && (
                        <View style={styles.savingsTag}>
                          <Text style={styles.savingsText}>{p.savings}</Text>
                        </View>
                      )}
                      <Text style={styles.planName}>{p.name}</Text>
                      <Text style={styles.planPrice}>
                        {formatCurrency(p.price)}
                        <Text style={styles.planPeriod}> {p.period}</Text>
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Payment Method Selector */}
          {!isVip && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Select Payment Method" subtitle="Secure 256-Bit Encrypted Checkout" />
              <Card style={{ gap: spacing.sm }}>
                {[
                  {
                    id: 'wallet',
                    label: `Wallet Balance (${formatCurrency(balance)} Available)`,
                    icon: '💰',
                    recommended: true,
                  },
                  {
                    id: 'upi',
                    label: 'UPI / GPay / PhonePe / Paytm',
                    icon: '📱',
                  },
                  {
                    id: 'card',
                    label: 'Credit / Debit Card / NetBanking',
                    icon: '💳',
                  },
                ].map((pm) => {
                  const active = paymentMethod === pm.id;
                  return (
                    <Pressable
                      key={pm.id}
                      onPress={() => setPaymentMethod(pm.id as any)}
                      style={({ pressed }) => [
                        styles.pmRow,
                        active && styles.pmRowActive,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={{ fontSize: 22 }}>{pm.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pmLabel}>{pm.label}</Text>
                        {pm.recommended && <Text style={styles.pmRec}>Fastest 1-Tap Payment</Text>}
                      </View>
                      <View style={[styles.radioCircle, active && styles.radioActive]}>
                        {active && <View style={styles.radioInner} />}
                      </View>
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          )}

          {/* Member Perks List */}
          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="VIP Member Perks Included" />
            {plan.perks.map((perk, idx) => (
              <View key={idx} style={styles.perkRow}>
                <View style={styles.checkWrap}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </Card>

          {/* Action Buttons */}
          {!isVip ? (
            <View style={{ gap: spacing.sm }}>
              <Button
                label={purchasing ? 'Processing Payment…' : `Pay ${formatCurrency(plan.price)} & Activate VIP`}
                variant="gold"
                size="lg"
                loading={purchasing}
                onPress={handleSubscribe}
              />
              <Text style={styles.mockNote}>
                🔒 100% Safe & Secure Payment · Cancel anytime in settings.
              </Text>
            </View>
          ) : (
            <Button
              label="Cancel VIP Subscription"
              variant="danger"
              size="md"
              onPress={cancel}
            />
          )}
        </ScrollView>

        {/* ── SUCCESS RECEIPT MODAL ── */}
        <Modal visible={showSuccessModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎉 AstroVIP Activated!</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 52 }}>👑</Text>
                <Text style={styles.modalText}>
                  Welcome to AstroVIP! Your <Text style={{ color: colors.saffron, fontWeight: '800' }}>{plan.name}</Text> is now active.
                </Text>

                <View style={styles.receiptBox}>
                  <Text style={styles.receiptLine}>• Amount Paid: {formatCurrency(plan.price)}</Text>
                  <Text style={styles.receiptLine}>• Payment Mode: {paymentMethod.toUpperCase()}</Text>
                  <Text style={styles.receiptLine}>• Pass Duration: {plan.period}</Text>
                  <Text style={styles.receiptLine}>• 15% Consultation Discount: Enabled ✅</Text>
                </View>
              </View>

              <Button
                label="Awesome! Continue to App"
                variant="gold"
                size="md"
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push('/(tabs)');
                }}
              />
            </View>
          </View>
        </Modal>

        {/* ── INSUFFICIENT WALLET RECHARGE MODAL ── */}
        <Modal visible={showRechargeModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insufficient Wallet Balance</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 44 }}>💰</Text>
                <Text style={styles.modalText}>
                  {plan.name} requires <Text style={{ color: colors.saffron, fontWeight: '800' }}>{formatCurrency(plan.price)}</Text>.
                </Text>
                <Text style={styles.modalSubText}>
                  Your current wallet balance is <Text style={{ color: colors.danger }}>{formatCurrency(balance)}</Text>. Please add money to continue or choose another payment method.
                </Text>
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="💰 Recharge Wallet Now"
                  variant="gold"
                  size="md"
                  onPress={() => {
                    setShowRechargeModal(false);
                    router.push('/wallet');
                  }}
                />
                <Button
                  label="Use UPI / GPay Instead"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setShowRechargeModal(false);
                    setPaymentMethod('upi');
                  }}
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
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  heroCard: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  crownCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(230,126,34,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.saffron,
    marginBottom: spacing.xs,
  },
  heroTitle: { ...typography.display, fontSize: 26, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  heroSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18, fontWeight: '600' },
  activeBadge: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  activeBadgeText: { ...typography.tiny, color: colors.success, fontWeight: '800' },

  planGrid: { flexDirection: 'row', gap: spacing.sm },
  planCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E3E8F3',
    gap: 4,
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  planCardActive: { borderColor: colors.saffron, borderWidth: 2 },
  savingsTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.saffron,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
  },
  savingsText: { ...typography.tiny, color: colors.white, fontWeight: '900', fontSize: 9 },
  planName: { ...typography.h3, fontSize: 14, color: colors.text, marginTop: spacing.xs, fontWeight: '800' },
  planPrice: { ...typography.h2, color: colors.saffron, marginTop: 2, fontWeight: '800' },
  planPeriod: { ...typography.tiny, color: colors.textMuted, fontSize: 11, fontWeight: '600' },

  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#F8FAFC',
  },
  pmRowActive: { borderColor: colors.saffron, backgroundColor: 'rgba(230,126,34,0.06)' },
  pmLabel: { ...typography.small, color: colors.text, fontWeight: '700' },
  pmRec: { ...typography.tiny, color: colors.saffron, fontSize: 10, fontWeight: '800' },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.saffron },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.saffron },

  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(230,126,34,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { color: colors.saffron, fontSize: 12, fontWeight: '900' },
  perkText: { ...typography.small, color: colors.text, flex: 1, fontSize: 13.5, fontWeight: '600' },

  mockNote: { ...typography.tiny, color: colors.textFaint, textAlign: 'center' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(27,20,56,0.60)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: colors.text, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  modalSubText: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },

  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 4,
    marginTop: 4,
  },
  receiptLine: { ...typography.small, color: colors.text, fontSize: 13, fontWeight: '600' },
});
