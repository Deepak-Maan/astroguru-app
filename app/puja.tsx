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
import { formatCurrency } from '../src/utils';

export interface PujaItem {
  id: string;
  title: string;
  temple: string;
  price: number;
  image: string;
  benefits: string;
  prashadIncluded: boolean;
}

const PUJA_CATALOG: PujaItem[] = [
  {
    id: 'rudrabhishek',
    title: 'Maha Rudrabhishek Puja',
    temple: 'Kashi Vishwanath Temple, Varanasi',
    price: 1100,
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    benefits: 'Destroys negative energy, fulfills desires & grants health prosperity',
    prashadIncluded: true,
  },
  {
    id: 'bhasma_aarti',
    title: 'Special Bhasma Aarti Sankalp',
    temple: 'Mahakaleshwar Temple, Ujjain',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1545232979-fbf592320b9a?auto=format&fit=crop&w=600&q=80',
    benefits: 'Removes untimely death fear, Rahu-Ketu & Shani Dosha',
    prashadIncluded: true,
  },
  {
    id: 'rahu_ketu',
    title: 'Kalsarp & Rahu-Ketu Shanti Puja',
    temple: 'Kamakhya Temple, Assam',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
    benefits: 'Eliminates career hurdles, business stagnation & marriage delays',
    prashadIncluded: true,
  },
];

export default function PujaBookingScreen() {
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);

  const [selectedPuja, setSelectedPuja] = useState<PujaItem | null>(null);
  const [address, setAddress] = useState('123 Temple Road, New Delhi 110001');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingReceipt, setBookingReceipt] = useState<string | null>(null);

  const handleBookPuja = () => {
    if (!selectedPuja) return;
    const success = debit(selectedPuja.price, `Virtual Puja Booking: ${selectedPuja.title}`);
    if (!success) {
      alert('Insufficient Wallet Balance! Please add money to your wallet.');
      return;
    }
    setBookingReceipt(`Puja Booking ID #${Math.floor(Math.random() * 899999 + 100000)} Confirmed! Live link & Prashad dispatch details sent to your registered WhatsApp.`);
    setShowConfirmModal(false);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Virtual Temple Puja & Prashad" subtitle="Book Remote Sankalp at Holy Temples" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Booking Confirmation Receipt */}
          {!!bookingReceipt && (
            <View style={styles.receiptBanner}>
              <Text style={{ fontSize: 32 }}>🕯️ ✅</Text>
              <Text style={styles.receiptText}>{bookingReceipt}</Text>
            </View>
          )}

          {/* Hero Banner */}
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.heroBanner}>
            <Text style={{ fontSize: 36 }}>🔱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Live Video Puja & Home Prashad</Text>
              <Text style={styles.heroSub}>
                Priests perform personalized Sankalp in your name & family Gotra. Watch live stream & receive blessed Prashad at home.
              </Text>
            </View>
          </LinearGradient>

          {/* Catalog */}
          <SectionHeader title="Sacred Temple Pujas" subtitle="Certified Vedic Pandits" />

          {PUJA_CATALOG.map((puja) => (
            <Card key={puja.id} style={styles.pujaCard}>
              <Image source={{ uri: puja.image }} style={styles.pujaImage} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.pujaTitle}>{puja.title}</Text>
                  <Chip label={formatCurrency(puja.price)} tone="gold" />
                </View>

                <Text style={styles.pujaTemple}>📍 {puja.temple}</Text>
                <Text style={styles.pujaBenefits}>{puja.benefits}</Text>

                <Button
                  label="🕯️ Book Sankalp & Prashad"
                  variant="gold"
                  size="sm"
                  onPress={() => {
                    setSelectedPuja(puja);
                    setShowConfirmModal(true);
                  }}
                  style={{ marginTop: spacing.xs }}
                />
              </View>
            </Card>
          ))}
        </ScrollView>

        {/* ── BOOKING CONFIRMATION MODAL ── */}
        <Modal visible={showConfirmModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Puja Booking</Text>
              {selectedPuja && (
                <View style={styles.modalBody}>
                  <Text style={styles.modalPujaName}>{selectedPuja.title}</Text>
                  <Text style={styles.modalTemple}>{selectedPuja.temple}</Text>
                  <Text style={styles.modalPrice}>Fee: {formatCurrency(selectedPuja.price)}</Text>

                  <Text style={styles.addressLabel}>📦 Prashad Delivery Address:</Text>
                  <TextInput
                    style={styles.addressInput}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>
              )}

              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                <Button label="✅ Debit Wallet & Confirm Booking" variant="gold" size="md" onPress={handleBookPuja} />
                <Button label="Cancel" variant="outline" size="sm" onPress={() => setShowConfirmModal(false)} />
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
  receiptText: { ...typography.body, color: colors.success, fontWeight: '800', textAlign: 'center' },

  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTitle: { ...typography.h2, color: colors.text, fontSize: 17, fontWeight: '800' },
  heroSub: { ...typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },

  pujaCard: { flexDirection: 'row', gap: spacing.md, overflow: 'hidden' },
  pujaImage: { width: 90, height: 110, borderRadius: radius.md, resizeMode: 'cover' },
  pujaTitle: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  pujaTemple: { ...typography.tiny, color: colors.saffron, fontWeight: '700' },
  pujaBenefits: { ...typography.tiny, color: colors.textMuted, lineHeight: 16 },

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
  modalBody: { gap: 4 },
  modalPujaName: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  modalTemple: { ...typography.tiny, color: colors.textMuted },
  modalPrice: { ...typography.h2, color: colors.saffron, marginTop: 4, fontWeight: '800' },
  addressLabel: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.md, fontWeight: '700' },
  addressInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    padding: spacing.sm,
    ...typography.small,
    color: colors.text,
    height: 60,
  },
});
