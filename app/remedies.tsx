import React, { useState } from 'react';
import {
  Image,
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
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { useRemediesStore, InventoryItem } from '../src/store/remediesStore';
import { formatCurrency } from '../src/utils';

export default function RemediesScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);

  const profile = useUserStore((s) => s.profile);
  const authUser = useAuthStore((s) => s.user);

  const inventory = useRemediesStore((s) => s.inventory);
  const placeOrder = useRemediesStore((s) => s.placeOrder);

  const [selectedGem, setSelectedGem] = useState<InventoryItem | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Form Fields
  const [name, setName] = useState(authUser?.name || profile?.name || 'Demo Seeker');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('123 Temple Road, Connaught Place, New Delhi 110001');

  const [purchasing, setPurchasing] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{ id: string; name: string } | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const handleOpenCheckout = () => {
    if (!selectedGem) return;
    if (selectedGem.stock <= 0 || !selectedGem.available) {
      alert('Sorry, this item is currently out of stock!');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleFinalSubmit = () => {
    if (!selectedGem) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in your Name, Phone Number, and Delivery Address!');
      return;
    }

    setPurchasing(true);

    setTimeout(() => {
      const ok = debit(selectedGem.price, `Ordered ${selectedGem.name} (${selectedGem.sanskritName})`);
      setPurchasing(false);

      if (ok) {
        const order = placeOrder({
          itemId: selectedGem.id,
          itemName: selectedGem.name,
          price: selectedGem.price,
          userName: name,
          phone: phone,
          address: address,
        });

        setShowCheckoutModal(false);
        setSelectedGem(null);
        setPlacedOrderInfo({ id: order.id, name: selectedGem.name });
      } else {
        setShowCheckoutModal(false);
        setShowRechargeModal(true);
      }
    }, 1200);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="AstroRemedies Shop" subtitle="Certified Gemstones & Yantras" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!!placedOrderInfo && (
            <View style={styles.successBanner}>
              <Text style={{ fontSize: 32 }}>🎉 📦</Text>
              <Text style={styles.successText}>
                Order #{placedOrderInfo.id} Confirmed! {placedOrderInfo.name} will be dispatched shortly.
              </Text>
              <Button label="Dismiss" variant="outline" size="sm" onPress={() => setPlacedOrderInfo(null)} />
            </View>
          )}

          {/* Personalized Kundli Remedy Recommendation */}
          <View style={styles.recomBanner}>
            <LinearGradient
              colors={['rgba(230,126,34,0.12)', 'rgba(212,172,13,0.04)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={{ fontSize: 32 }}>💎</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.recomTitle}>Recommended for Your Kundli</Text>
              <Text style={styles.recomSub}>
                Based on your Lagna & Moon position, wearing <Text style={{ color: colors.saffron, fontWeight: '800' }}>Yellow Sapphire (Pukhraj)</Text> strengthens your Jupiter lord.
              </Text>
            </View>
          </View>

          {/* Catalog Grid */}
          <SectionHeader title="Certified Vedic Gemstones" subtitle="100% Natural · Lab Certified" />
          <View style={styles.grid}>
            {inventory.map((gem) => (
              <Pressable
                key={gem.id}
                onPress={() => setSelectedGem(gem)}
                style={({ pressed }) => [styles.gemCard, pressed && { opacity: 0.85 }]}
              >
                <Image source={{ uri: gem.image }} style={styles.gemImage} />
                <LinearGradient colors={['transparent', 'rgba(27,20,56,0.92)']} style={styles.gemOverlay} />

                <View style={styles.gemContent}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 14 }}>{gem.planetIcon}</Text>
                      <Text style={styles.gemPlanet}>{gem.planet}</Text>
                    </View>
                    <Chip
                      label={gem.stock > 0 && gem.available ? `Stock: ${gem.stock}` : 'Out of Stock'}
                      tone={gem.stock > 0 && gem.available ? 'teal' : 'rose'}
                    />
                  </View>

                  <Text style={styles.gemName}>{gem.name}</Text>
                  <Text style={styles.gemSanskrit}>{gem.sanskritName}</Text>

                  <View style={styles.gemFooter}>
                    <Text style={styles.gemPrice}>{formatCurrency(gem.price)}</Text>
                    <Chip label={`★ ${gem.rating}`} tone="gold" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* ── GEMSTONE DETAIL MODAL ── */}
        <Modal visible={!!selectedGem && !showCheckoutModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedGem && (
                <>
                  <Image source={{ uri: selectedGem.image }} style={styles.modalImage} />
                  <Text style={styles.modalTitle}>{selectedGem.name}</Text>
                  <Text style={styles.modalSub}>{selectedGem.sanskritName} · {selectedGem.planet}</Text>

                  <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>WEAR ON FINGER</Text>
                      <Text style={styles.infoVal}>{selectedGem.finger}</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>METAL</Text>
                      <Text style={styles.infoVal}>{selectedGem.metal}</Text>
                    </View>
                  </View>

                  <Text style={styles.benefitHeader}>Vedic Astrological Benefits:</Text>
                  {selectedGem.benefits.map((b, i) => (
                    <Text key={i} style={styles.benefitItem}>• {b}</Text>
                  ))}

                  <View style={styles.priceRow}>
                    <Text style={styles.totalPriceLabel}>Total Price:</Text>
                    <Text style={styles.totalPriceVal}>{formatCurrency(selectedGem.price)}</Text>
                  </View>

                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    <Button
                      label={`Proceed to Checkout (${formatCurrency(selectedGem.price)})`}
                      variant="gold"
                      size="md"
                      disabled={selectedGem.stock <= 0 || !selectedGem.available}
                      onPress={handleOpenCheckout}
                    />
                    <Button
                      label="Close"
                      variant="outline"
                      size="md"
                      onPress={() => setSelectedGem(null)}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* ── SHIPPING DETAILS CHECKOUT MODAL ── */}
        <Modal visible={showCheckoutModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Shipping & Delivery Details</Text>
              <Text style={styles.modalSubText}>Please provide your contact info for insured courier delivery</Text>

              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>👤 Full Name:</Text>
                  <TextInput style={styles.textInput} value={name} onChangeText={setName} placeholder="Full Name" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>📞 Phone Number:</Text>
                  <TextInput style={styles.textInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>📍 Delivery Address & Pincode:</Text>
                  <TextInput
                    style={[styles.textInput, { height: 64 }]}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    placeholder="House No, Street, Landmark, City, Pincode"
                  />
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.totalPriceLabel}>Wallet Payment:</Text>
                <Text style={styles.totalPriceVal}>{formatCurrency(selectedGem?.price || 0)}</Text>
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                <Button
                  label={purchasing ? 'Placing Order…' : 'Confirm Order & Pay'}
                  variant="gold"
                  size="md"
                  loading={purchasing}
                  onPress={handleFinalSubmit}
                />
                <Button
                  label="Back"
                  variant="outline"
                  size="md"
                  onPress={() => setShowCheckoutModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* ── RECHARGE REQUIRED MODAL ── */}
        <Modal visible={showRechargeModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insufficient Wallet Balance</Text>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 40 }}>💰</Text>
                <Text style={styles.modalText}>
                  Your wallet balance is <Text style={{ color: colors.danger }}>{formatCurrency(balance)}</Text>.
                </Text>
                <Text style={styles.modalSubText}>
                  Please recharge your wallet to complete your gemstone purchase.
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
                <Button label="Cancel" variant="outline" size="md" onPress={() => setShowRechargeModal(false)} />
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

  successBanner: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  successText: { ...typography.body, color: colors.success, fontWeight: '800', textAlign: 'center' },

  recomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  recomTitle: { ...typography.h3, color: colors.saffron, fontSize: 16, fontWeight: '800' },
  recomSub: { ...typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18, fontWeight: '600' },

  grid: { gap: spacing.md },
  gemCard: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  gemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gemOverlay: { ...StyleSheet.absoluteFillObject },
  gemContent: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    gap: 2,
  },
  gemPlanet: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  gemName: { ...typography.h2, color: colors.white, fontSize: 18, fontWeight: '800' },
  gemSanskrit: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  gemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  gemPrice: { ...typography.h2, color: colors.saffron, fontWeight: '800' },

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
  modalImage: { width: '100%', height: 160, borderRadius: radius.lg, resizeMode: 'cover' },
  modalTitle: { ...typography.h1, color: colors.text, fontSize: 20, fontWeight: '800' },
  modalSub: { ...typography.small, color: colors.saffron, fontWeight: '700', marginTop: -4 },

  infoRow: { flexDirection: 'row', gap: spacing.sm },
  infoBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  infoLabel: { ...typography.tiny, color: colors.textMuted, fontSize: 9.5, fontWeight: '700' },
  infoVal: { ...typography.small, color: colors.text, fontWeight: '800', marginTop: 2, fontSize: 13 },

  benefitHeader: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  benefitItem: { ...typography.small, color: colors.text, lineHeight: 19, fontWeight: '500' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  totalPriceLabel: { ...typography.h3, color: colors.text, fontWeight: '800' },
  totalPriceVal: { ...typography.display, fontSize: 26, color: colors.saffron, fontWeight: '900' },

  inputGroup: { gap: 3 },
  inputLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },

  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: colors.text, textAlign: 'center', fontWeight: '600' },
  modalSubText: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
