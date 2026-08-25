import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { radius, spacing } from '../../theme';
import { useWalletStore } from '../../store/walletStore';
import { launchUpiPayment } from '../../services/paymentService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface RechargePack {
  id: string;
  amount: number;
  bonus: number;
  tag?: string;
  badgeColor?: string;
  popular?: boolean;
}

const PACKS: RechargePack[] = [
  { id: 'p1', amount: 50, bonus: 50, tag: '100% EXTRA', popular: false },
  { id: 'p2', amount: 100, bonus: 100, tag: 'MOST POPULAR', popular: true },
  { id: 'p3', amount: 200, bonus: 200, tag: '100% EXTRA', popular: false },
  { id: 'p4', amount: 500, bonus: 500, tag: 'MEGA SAVER', popular: false },
  { id: 'p5', amount: 1000, bonus: 1000, tag: 'VIP BONUS', popular: false },
  { id: 'p6', amount: 2000, bonus: 2000, tag: 'ACHARYA PACK', popular: false },
];

export function AstrotalkRechargeModal({ visible, onClose }: Props) {
  const balance = useWalletStore((s) => s.balance ?? 100);
  const topup = useWalletStore((s) => s.topup);

  const [selectedPack, setSelectedPack] = useState<RechargePack>(PACKS[1]);
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSelect = (pack: RechargePack) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (_) {}
    setSelectedPack(pack);
  };

  const handleProceedPay = async () => {
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}

    const txnId = `AGW${Date.now().toString().slice(-6)}`;
    await launchUpiPayment({
      app: 'generic',
      amount: selectedPack.amount,
      txnId,
    });

    const totalCredit = selectedPack.amount + selectedPack.bonus;
    topup(totalCredit, `Instant Wallet Recharge (₹${selectedPack.amount} + ₹${selectedPack.bonus} Bonus)`);

    setSuccessNotice(`₹${totalCredit} successfully added to your AstroGuru Wallet!`);
    setLoading(false);

    setTimeout(() => {
      setSuccessNotice(null);
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
              <Text style={styles.headerTitle}>Add Money to AstroGuru Wallet</Text>
              <Text style={styles.headerSub}>
                Current Balance: <Text style={{ color: '#059669', fontWeight: '900' }}>₹{Number(balance || 0).toFixed(0)}</Text>
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Success Banner */}
          {!!successNotice && (
            <View style={styles.successBanner}>
              <Text style={{ fontSize: 20 }}>🎉</Text>
              <Text style={styles.successText}>{successNotice}</Text>
            </View>
          )}

          {/* Promotional Banner */}
          <View style={styles.offerBanner}>
            <LinearGradient
              colors={['#78350F', '#B45309', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={{ fontSize: 28 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>Get 100% Extra Cashback</Text>
              <Text style={styles.offerSub}>Recharge ₹100 and get ₹200 wallet balance instantly!</Text>
            </View>
          </View>

          {/* Recharge Packs Grid */}
          <ScrollView contentContainerStyle={styles.packsGrid} showsVerticalScrollIndicator={false}>
            {PACKS.map((pack) => {
              const active = selectedPack.id === pack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => handleSelect(pack)}
                  style={[
                    styles.packCard,
                    active && styles.packCardActive,
                  ]}
                >
                  {active && (
                    <LinearGradient
                      colors={['#FFFBEB', '#FEF3C7']}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  {pack.tag && (
                    <View style={[styles.packTag, pack.popular && { backgroundColor: '#D97706' }]}>
                      <Text style={styles.packTagText}>{pack.tag}</Text>
                    </View>
                  )}

                  <Text style={styles.packAmount}>₹{pack.amount}</Text>
                  <Text style={styles.packBonus}>+ ₹{pack.bonus} Free Cash</Text>
                  <Text style={styles.packTotal}>Total: ₹{pack.amount + pack.bonus}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Footer Checkout CTA */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerPayAmount}>
                Pay <Text style={{ color: '#D97706', fontWeight: '900' }}>₹{selectedPack.amount}</Text>
              </Text>
              <Text style={styles.footerGetAmount}>
                Get ₹{selectedPack.amount + selectedPack.bonus} in Wallet
              </Text>
            </View>

            <Pressable
              onPress={handleProceedPay}
              disabled={loading}
              style={({ pressed }) => [styles.payBtn, pressed && { opacity: 0.88 }]}
            >
              <LinearGradient
                colors={['#D4AF37', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.payBtnText}>
                {loading ? 'Processing…' : 'Proceed to Pay ➔'}
              </Text>
            </Pressable>
          </View>
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
    paddingTop: 18,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#64748B',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065F46',
    flex: 1,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  offerSub: {
    color: '#FEF3C7',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  packCard: {
    width: '31%',
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  packCardActive: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  packTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    backgroundColor: '#059669',
    paddingVertical: 2,
    alignItems: 'center',
  },
  packTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  packAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 6,
  },
  packBonus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  packTotal: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  footerInfo: {
    gap: 2,
  },
  footerPayAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  footerGetAmount: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  payBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
