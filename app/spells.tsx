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
import { useSpellsStore, SpellItem } from '../src/store/spellsStore';
import { formatCurrency } from '../src/utils';

export default function SpellsScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);

  const profile = useUserStore((s) => s.profile);
  const authUser = useAuthStore((s) => s.user);

  const spells = useSpellsStore((s) => s.spells);
  const placeSpellOrder = useSpellsStore((s) => s.placeSpellOrder);

  const [selectedSpell, setSelectedSpell] = useState<SpellItem | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Form Fields
  const [userName, setUserName] = useState(authUser?.name || profile?.name || 'Demo Seeker');
  const [targetName, setTargetName] = useState('Priyanka & Demo');
  const [dob, setDob] = useState(profile?.date || '01-07-2003');
  const [intention, setIntention] = useState('Manifest deep love, mutual harmony and spiritual protection.');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');

  const [purchasing, setPurchasing] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<{ id: string; title: string } | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const handleOpenCheckout = () => {
    if (!selectedSpell) return;
    if (!selectedSpell.available) {
      alert('Sorry, this ritual is currently unavailable!');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleFinalSubmit = () => {
    if (!selectedSpell) return;
    if (!userName.trim() || !intention.trim()) {
      alert('Please fill in your Name and Personal Intention Note!');
      return;
    }

    if (paymentMethod === 'wallet' && balance < selectedSpell.price) {
      setShowCheckoutModal(false);
      setShowRechargeModal(true);
      return;
    }

    setPurchasing(true);

    setTimeout(() => {
      if (paymentMethod === 'wallet') {
        debit(selectedSpell.price, `Spell Casting Booking: ${selectedSpell.title}`);
      }

      const order = placeSpellOrder({
        spellId: selectedSpell.id,
        spellTitle: selectedSpell.title,
        price: selectedSpell.price,
        userName: userName,
        targetName: targetName,
        dob: dob,
        intention: intention,
        paymentMethod: paymentMethod,
      });

      setPurchasing(false);
      setShowCheckoutModal(false);
      setSelectedSpell(null);
      setReceiptInfo({ id: order.id, title: selectedSpell.title });
    }, 1200);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Vedic Spells & Rituals" subtitle="Authentic Tantrik & Vedic Casting" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!!receiptInfo && (
            <View style={styles.receiptBanner}>
              <Text style={{ fontSize: 36 }}>✨ 🪄</Text>
              <Text style={styles.receiptTitle}>Spell Casting Order Confirmed!</Text>
              <Text style={styles.receiptSub}>
                Order #{receiptInfo.id} for <Text style={{ fontWeight: '800', color: colors.saffron }}>{receiptInfo.title}</Text> has been scheduled with Vedic Priests.
              </Text>
              <Button label="Dismiss" variant="outline" size="sm" onPress={() => setReceiptInfo(null)} />
            </View>
          )}

          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <LinearGradient
              colors={['rgba(125,60,152,0.12)', 'rgba(230,126,34,0.04)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={{ fontSize: 36 }}>🪄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Sacred Manifestation Spells</Text>
              <Text style={styles.heroSub}>
                Energized by certified Vedic Upasaks during auspicious Muhurats. Flat rate <Text style={{ color: colors.saffron, fontWeight: '800' }}>{formatCurrency(1100)}</Text> per spell.
              </Text>
            </View>
          </View>

          {/* Catalog */}
          <SectionHeader title="Available Spells & Rituals" subtitle="100% Confidential · Personal Intention" />

          <View style={styles.grid}>
            {spells.map((spell) => (
              <Card key={spell.id} style={styles.spellCard}>
                <Image source={{ uri: spell.image }} style={styles.spellImage} />
                <LinearGradient colors={['transparent', 'rgba(27,20,56,0.92)']} style={styles.spellOverlay} />

                <View style={styles.spellContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={spell.category} tone="gold" />
                    <Chip label={formatCurrency(spell.price)} tone="teal" />
                  </View>

                  <Text style={styles.spellTitle}>{spell.title}</Text>
                  <Text style={styles.spellSanskrit}>{spell.sanskritName}</Text>
                  <Text style={styles.spellDesc} numberOfLines={2}>{spell.description}</Text>

                  <Button
                    label={`🪄 Book Ritual (${formatCurrency(spell.price)})`}
                    variant="gold"
                    size="sm"
                    onPress={() => setSelectedSpell(spell)}
                    style={{ marginTop: spacing.xs }}
                  />
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>

        {/* ── SPELL DETAIL MODAL ── */}
        <Modal visible={!!selectedSpell && !showCheckoutModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedSpell && (
                <>
                  <Image source={{ uri: selectedSpell.image }} style={styles.modalImage} />
                  <Text style={styles.modalTitle}>{selectedSpell.title}</Text>
                  <Text style={styles.modalSub}>{selectedSpell.sanskritName} · {selectedSpell.category}</Text>
                  <Text style={styles.modalDesc}>{selectedSpell.description}</Text>

                  <Text style={styles.benefitHeader}>Ritual Manifestation Benefits:</Text>
                  {selectedSpell.benefits.map((b, i) => (
                    <Text key={i} style={styles.benefitItem}>• {b}</Text>
                  ))}

                  <View style={styles.priceRow}>
                    <Text style={styles.totalPriceLabel}>Ritual Fee:</Text>
                    <Text style={styles.totalPriceVal}>{formatCurrency(selectedSpell.price)}</Text>
                  </View>

                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    <Button
                      label={`Book Spell Casting (${formatCurrency(selectedSpell.price)})`}
                      variant="gold"
                      size="md"
                      onPress={handleOpenCheckout}
                    />
                    <Button label="Close" variant="outline" size="md" onPress={() => setSelectedSpell(null)} />
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* ── INTENTION & PAYMENT CHECKOUT MODAL ── */}
        <Modal visible={showCheckoutModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Spell Booking & Intention</Text>
              <Text style={styles.modalSubText}>Priests use your intention note during the sacred altar casting</Text>

              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: spacing.sm }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>👤 Seeker Name:</Text>
                  <TextInput style={styles.textInput} value={userName} onChangeText={setUserName} placeholder="Full Name" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>👥 Target Name (Optional for Love/Marriage):</Text>
                  <TextInput style={styles.textInput} value={targetName} onChangeText={setTargetName} placeholder="Target Name" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🎂 Date of Birth:</Text>
                  <TextInput style={styles.textInput} value={dob} onChangeText={setDob} placeholder="DD-MM-YYYY" />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>📝 Personal Intention / Wish Note:</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    value={intention}
                    onChangeText={setIntention}
                    multiline
                    placeholder="Describe your wish for the priests..."
                  />
                </View>

                {/* Payment Options */}
                <Text style={styles.inputLabel}>💳 Select Payment Method:</Text>
                {[
                  { id: 'wallet', label: `Wallet Balance (${formatCurrency(balance)} Available)`, icon: '💰' },
                  { id: 'upi', label: 'UPI / GPay / PhonePe / Paytm', icon: '📱' },
                  { id: 'card', label: 'Credit / Debit Card / NetBanking', icon: '💳' },
                ].map((pm) => (
                  <Pressable
                    key={pm.id}
                    onPress={() => setPaymentMethod(pm.id as any)}
                    style={[styles.pmRow, paymentMethod === pm.id && styles.pmRowActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{pm.icon}</Text>
                    <Text style={styles.pmText}>{pm.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.priceRow}>
                <Text style={styles.totalPriceLabel}>Total Fee:</Text>
                <Text style={styles.totalPriceVal}>{formatCurrency(selectedSpell?.price || 1100)}</Text>
              </View>

              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                <Button
                  label={purchasing ? 'Casting Order…' : 'Confirm & Schedule Ritual'}
                  variant="gold"
                  size="md"
                  loading={purchasing}
                  onPress={handleFinalSubmit}
                />
                <Button label="Back" variant="outline" size="md" onPress={() => setShowCheckoutModal(false)} />
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
                  Spell Booking requires <Text style={{ color: colors.saffron, fontWeight: '800' }}>{formatCurrency(selectedSpell?.price || 1100)}</Text>.
                </Text>
                <Text style={styles.modalSubText}>
                  Your wallet balance is <Text style={{ color: colors.danger }}>{formatCurrency(balance)}</Text>. Please recharge or choose UPI/Card payment.
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
                  size="md"
                  onPress={() => {
                    setShowRechargeModal(false);
                    setPaymentMethod('upi');
                    setShowCheckoutModal(true);
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

  receiptBanner: {
    backgroundColor: 'rgba(39,174,96,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  receiptTitle: { ...typography.h2, color: colors.success, fontWeight: '800' },
  receiptSub: { ...typography.small, color: colors.text, textAlign: 'center', lineHeight: 18 },

  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTitle: { ...typography.h3, color: colors.saffron, fontSize: 15, fontWeight: '800' },
  heroSub: { ...typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18, fontWeight: '600' },

  grid: { gap: spacing.md },
  spellCard: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    position: 'relative',
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  spellImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  spellOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  spellContent: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    gap: 3,
  },
  spellTitle: { ...typography.h2, color: colors.white, fontSize: 18, fontWeight: '800' },
  spellSanskrit: { ...typography.tiny, color: colors.saffron, fontWeight: '700' },
  spellDesc: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', lineHeight: 15 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(4,7,13,0.80)', justifyContent: 'center', padding: spacing.lg },
  modalContent: {
    backgroundColor: '#0E1726',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    gap: spacing.md,
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  modalImage: { width: '100%', height: 140, borderRadius: radius.md, resizeMode: 'cover' },
  modalTitle: { ...typography.h1, color: colors.text, fontSize: 20, fontWeight: '800' },
  modalSub: { ...typography.small, color: colors.saffron, fontWeight: '700', marginTop: -4 },
  modalDesc: { ...typography.small, color: colors.textMuted, lineHeight: 18 },

  benefitHeader: { ...typography.tiny, color: colors.saffron, fontWeight: '800' },
  benefitItem: { ...typography.small, color: colors.text, lineHeight: 19, fontWeight: '500' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  totalPriceLabel: { ...typography.h3, color: colors.text, fontWeight: '800' },
  totalPriceVal: { ...typography.display, fontSize: 26, color: colors.saffron, fontWeight: '900' },

  inputGroup: { gap: 3 },
  inputLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  textInput: {
    backgroundColor: '#080E1A',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },

  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#080E1A',
  },
  pmRowActive: { borderColor: colors.saffron, backgroundColor: 'rgba(245,158,11,0.14)' },
  pmText: { ...typography.small, color: colors.text, fontWeight: '700' },

  modalBody: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  modalText: { ...typography.body, color: colors.text, textAlign: 'center', fontWeight: '600' },
  modalSubText: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
