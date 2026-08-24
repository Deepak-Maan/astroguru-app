import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../../theme';
import { useUserStore } from '../../store/userStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const RECHARGE_PACKS = [
  { amount: 50, cashback: '₹50 Balance', extra: '', popular: false },
  { amount: 100, cashback: 'Get ₹200', extra: '100% Extra', popular: true },
  { amount: 200, cashback: 'Get ₹400', extra: '100% Extra', popular: false },
  { amount: 500, cashback: 'Get ₹1,100', extra: '120% Bonus', popular: true },
  { amount: 1000, cashback: 'Get ₹2,500', extra: '150% Mega', popular: false },
  { amount: 2000, cashback: 'Get ₹5,500', extra: 'VIP 175%', popular: false },
];

export function AstrotalkRechargeModal({ visible, onClose }: Props) {
  const { wallet, addWalletFunds } = useUserStore();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSelectPack = (amt: number) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handlePay = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}

    // Calculate bonus credit
    let bonusMultiplier = 1;
    if (finalAmount >= 1000) bonusMultiplier = 2.5;
    else if (finalAmount >= 500) bonusMultiplier = 2.2;
    else if (finalAmount >= 100) bonusMultiplier = 2.0;

    const creditAmount = finalAmount * bonusMultiplier;
    addWalletFunds(creditAmount);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add Money to Astrotalk Wallet</Text>
              <Text style={styles.headerSub}>
                Current Balance: <Text style={{ color: '#059669', fontWeight: '900' }}>₹{wallet.balance.toFixed(0)}</Text>
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Success State */}
          {isSuccess ? (
            <View style={styles.successBox}>
              <Text style={{ fontSize: 50 }}>🎉</Text>
              <Text style={styles.successTitle}>Recharge Successful!</Text>
              <Text style={styles.successSub}>Your wallet balance has been updated instantly.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md }}>
              {/* Promo Cashback Banner */}
              <View style={styles.promoBanner}>
                <LinearGradient
                  colors={['#FFFBEB', '#FEF3C7']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 24 }}>🎁</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTitle}>100% EXTRA CASHBACK</Text>
                  <Text style={styles.promoSub}>Recharge ₹100 or more & get double balance for consultations!</Text>
                </View>
              </View>

              {/* Recharge Packs Grid */}
              <Text style={styles.sectionLabel}>Select Recharge Pack</Text>
              <View style={styles.packsGrid}>
                {RECHARGE_PACKS.map((pack) => {
                  const isSelected = selectedAmount === pack.amount && !customAmount;
                  return (
                    <Pressable
                      key={pack.amount}
                      onPress={() => handleSelectPack(pack.amount)}
                      style={[
                        styles.packCard,
                        isSelected && styles.packCardSelected,
                      ]}
                    >
                      {pack.extra ? (
                        <View style={[styles.extraPill, isSelected && { backgroundColor: '#F59E0B' }]}>
                          <Text style={styles.extraText}>{pack.extra}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.packAmount}>₹{pack.amount}</Text>
                      <Text style={styles.packCashback}>{pack.cashback}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Custom Amount Input */}
              <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Or Enter Custom Amount (₹)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  placeholder="e.g. 250"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={(val) => {
                    setCustomAmount(val);
                    setSelectedAmount(0);
                  }}
                  style={styles.textInput}
                />
              </View>

              {/* Pay Button */}
              <Pressable
                onPress={handlePay}
                style={({ pressed }) => [styles.payBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}
              >
                <LinearGradient
                  colors={['#FFC107', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.payBtnText}>
                  Proceed to Pay ₹{customAmount || selectedAmount} ➔
                </Text>
              </Pressable>

              <Text style={styles.secureText}>🔒 256-Bit SSL Encrypted • Instant 100% Refund Guarantee</Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4B5563',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    overflow: 'hidden',
    marginBottom: 14,
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  promoSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  packCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 2,
  },
  packCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  extraPill: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  extraText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  packAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 4,
  },
  packCashback: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  payBtn: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  secureText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  successBox: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
  },
  successSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
