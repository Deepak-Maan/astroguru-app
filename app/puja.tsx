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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';
import { useUserStore } from '../src/store/userStore';
import { formatCurrency } from '../src/utils';
import {
  ASTROMALL_CATALOG,
  AstroMallItem,
  getRecommendedRemedies,
} from '../src/data/astroMallCatalog';
import { NAKSHATRAS } from '../src/data/nakshatras';

export default function SacredPujaAndAstroMallScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const debit = useWalletStore((s) => s.debit);
  const kundli = useUserStore((s) => s.kundli);
  const profile = useUserStore((s) => s.profile);

  // Main Category Tab: 'puja' | 'mall'
  const [mainTab, setMainTab] = useState<'puja' | 'mall'>('puja');
  // Mall Sub-Filter: 'all' | 'rudraksha' | 'gemstone' | 'yantra'
  const [mallFilter, setMallFilter] = useState<'all' | 'rudraksha' | 'gemstone' | 'yantra'>('all');

  // Selected item for booking/purchase
  const [selectedItem, setSelectedItem] = useState<AstroMallItem | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Sankalp Form state
  const [seekerName, setSeekerName] = useState(profile?.name || 'Devotee');
  const [gotra, setGotra] = useState('Kashyap');
  const [nakshatra, setNakshatra] = useState(
    kundli?.moonNakshatraIndex !== undefined ? (NAKSHATRAS[kundli.moonNakshatraIndex]?.name || 'Rohini') : 'Rohini'
  );
  const [sankalpWish, setSankalpWish] = useState('Peace, health, and career prosperity');
  const [deliveryAddress, setDeliveryAddress] = useState('123 Divine Sanctuary, Civil Lines, New Delhi 110001');

  // Success Confirmation
  const [orderConfirmation, setOrderConfirmation] = useState<{
    id: string;
    item: AstroMallItem;
    message: string;
  } | null>(null);

  // Prescribed items based on active doshas
  const isSadeSati = kundli ? (kundli.moonRashiIndex === 9 || kundli.moonRashiIndex === 10 || kundli.moonRashiIndex === 11) : false;
  const activeDoshas = [
    kundli?.mangalDosha ? 'Manglik Dosha' : null,
    isSadeSati ? 'Shani Sade Sati' : null,
  ].filter(Boolean) as string[];

  const prescribedItems = getRecommendedRemedies(activeDoshas);

  const displayedCatalog = ASTROMALL_CATALOG.filter((item) => {
    if (mainTab === 'puja') {
      return item.category === 'puja';
    }
    if (mallFilter === 'all') {
      return item.category !== 'puja';
    }
    return item.category === mallFilter;
  });

  const handleInitiateOrder = (item: AstroMallItem) => {
    setSelectedItem(item);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = () => {
    if (!selectedItem) return;

    if (balance < selectedItem.price) {
      Alert.alert(
        'Insufficient Balance',
        `This service requires ${formatCurrency(selectedItem.price)}, but your wallet balance is ${formatCurrency(balance)}. Would you like to recharge?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Recharge Wallet', onPress: () => router.push('/wallet') },
        ]
      );
      return;
    }

    const desc = selectedItem.category === 'puja'
      ? `Puja Booking: ${selectedItem.name}`
      : `Store Order: ${selectedItem.name}`;

    const success = debit(selectedItem.price, desc);
    if (success) {
      const orderId = `AG-${Math.floor(100000 + Math.random() * 900000)}`;
      setShowOrderModal(false);
      setOrderConfirmation({
        id: orderId,
        item: selectedItem,
        message:
          selectedItem.category === 'puja'
            ? `Your puja has been booked in the name of ${seekerName} (Gotra: ${gotra}). The pandits will perform the puja and we will send you the live video link and holy Prasad tracking on WhatsApp.`
            : `Order confirmed! Your genuine ${selectedItem.name} is being prepared and will be delivered to your address with a certificate of authenticity.`,
      });
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Temple Puja & Store"
          subtitle="Book temple pujas & buy genuine remedies"
          showBack
          showWallet
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Main Tab Switcher: E-Puja vs AstroMall */}
          <View style={styles.mainTabBar}>
            <Pressable
              onPress={() => setMainTab('puja')}
              style={[styles.mainTab, mainTab === 'puja' && styles.mainTabActive]}
            >
              <LinearGradient
                colors={mainTab === 'puja' ? ['#6366F1', '#4F46E5'] : ['transparent', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.mainTabIcon}>🪔</Text>
              <Text style={[styles.mainTabText, mainTab === 'puja' && styles.mainTabTextActive]}>
                Temple Pujas
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMainTab('mall')}
              style={[styles.mainTab, mainTab === 'mall' && styles.mainTabActive]}
            >
              <LinearGradient
                colors={mainTab === 'mall' ? ['#F59E0B', '#D97706'] : ['transparent', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.mainTabIcon}>💎</Text>
              <Text style={[styles.mainTabText, mainTab === 'mall' && styles.mainTabTextActive]}>
                Gemstones & Store
              </Text>
            </Pressable>
          </View>

          {/* Personalized Dosha Recommendation Banner */}
          {prescribedItems.length > 0 && (
            <View style={styles.prescriptionCard}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.15)', 'rgba(99, 102, 241, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.prescriptionHeader}>
                <View style={styles.prescripIconWrap}>
                  <Text style={styles.prescripIcon}>🪐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prescripTitle}>Recommended for You</Text>
                  <Text style={styles.prescripSub}>
                    {activeDoshas.length > 0
                      ? `Helpful for ${activeDoshas.join(' & ')}`
                      : 'Personalized remedies based on your birth chart'}
                  </Text>
                </View>
              </View>

              {/* Mini Horizontal Recommendation Scroller */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniScroller}>
                {prescribedItems.slice(0, 3).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => handleInitiateOrder(item)}
                    style={styles.miniCard}
                  >
                    <Image source={{ uri: item.image }} style={styles.miniImage} />
                    <View style={styles.miniContent}>
                      <Text style={styles.miniTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.miniPriceRow}>
                        <Text style={styles.miniPrice}>{formatCurrency(item.price)}</Text>
                        <Text style={styles.miniTag}>Prescribed</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Sub-Filters for AstroMall */}
          {mainTab === 'mall' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subFilterRow}
            >
              {[
                { id: 'all', label: 'All Remedies', icon: '✨' },
                { id: 'rudraksha', label: 'Rudrakshas', icon: '📿' },
                { id: 'gemstone', label: 'Certified Gemstones', icon: '💎' },
                { id: 'yantra', label: 'Sacred Yantras', icon: '🔯' },
              ].map((filter) => (
                <Pressable
                  key={filter.id}
                  onPress={() => setMallFilter(filter.id as any)}
                  style={[styles.filterChip, mallFilter === filter.id && styles.filterChipActive]}
                >
                  <Text style={styles.filterChipText}>
                    {filter.icon} {filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Section Heading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {mainTab === 'puja' ? 'Authorized Vedic Temple Pujas' : 'Energized Astrological Remedies'}
            </Text>
            <Text style={styles.sectionSub}>
              {mainTab === 'puja'
                ? 'Performed by experienced pandits with live video proof'
                : '100% authentic & lab-certified with certificate'}
            </Text>
          </View>

          {/* Product & Puja Grid */}
          <View style={styles.cardList}>
            {displayedCatalog.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />

                {/* Consecration Badge */}
                <View style={styles.consecrationBadge}>
                  <Text style={styles.consecrationIcon}>🛡️</Text>
                  <Text style={styles.consecrationText} numberOfLines={1}>
                    {item.templeOrOrigin}
                  </Text>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  {item.sanskritName && (
                    <Text style={styles.sanskritName}>{item.sanskritName}</Text>
                  )}

                  <Text style={styles.doshaTarget}>
                    Good for: <Text style={{ color: '#FCD34D' }}>{item.doshaTarget}</Text>
                  </Text>

                  {/* Bullet Benefits */}
                  <View style={styles.benefitList}>
                    {item.benefits.map((b, i) => (
                      <View key={i} style={styles.benefitRow}>
                        <Text style={styles.benefitBullet}>•</Text>
                        <Text style={styles.benefitText} numberOfLines={2}>
                          {b}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Certification tag */}
                  <View style={styles.certRow}>
                    <Text style={styles.certIcon}>📜</Text>
                    <Text style={styles.certText} numberOfLines={1}>
                      {item.certification}
                    </Text>
                  </View>

                  {/* Pricing & CTA */}
                  <View style={styles.pricingRow}>
                    <View>
                      <View style={styles.priceFlex}>
                        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                        <Text style={styles.originalPrice}>{formatCurrency(item.originalPrice)}</Text>
                      </View>
                      <Text style={styles.taxNotice}>All Taxes Included</Text>
                    </View>

                    <Pressable
                      onPress={() => handleInitiateOrder(item)}
                      style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.8 }]}
                    >
                      <LinearGradient
                        colors={item.category === 'puja' ? ['#6366F1', '#EC4899'] : ['#F59E0B', '#D97706']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text style={styles.bookBtnText}>
                        {item.category === 'puja' ? 'Book Puja' : 'Order Now'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ─── MODAL 1: SANKALP & ORDER CONFIRMATION MODAL ─── */}
        <Modal visible={showOrderModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.orderModalCard}>
              <View style={styles.modalTopBar}>
                <Text style={styles.modalHeading}>
                  {selectedItem?.category === 'puja' ? 'Book Your Puja' : 'Order Checkout'}
                </Text>
                <Pressable onPress={() => setShowOrderModal(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {/* Item Summary Banner */}
                {selectedItem && (
                  <View style={styles.modalItemPreview}>
                    <Image source={{ uri: selectedItem.image }} style={styles.previewThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.previewTitle}>{selectedItem.name}</Text>
                      <Text style={styles.previewTemple}>{selectedItem.templeOrOrigin}</Text>
                      <Text style={styles.previewPrice}>{formatCurrency(selectedItem.price)}</Text>
                    </View>
                  </View>
                )}

                {/* Form Fields for Sankalp / Delivery */}
                <Text style={styles.formSectionLabel}>
                  {selectedItem?.category === 'puja' ? 'Your Details for Puja' : 'Delivery Address & Details'}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Your Full Name</Text>
                  <TextInput
                    value={seekerName}
                    onChangeText={setSeekerName}
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#64748B"
                  />
                </View>

                {selectedItem?.category === 'puja' && (
                  <>
                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Gotra (Family Lineage)</Text>
                        <TextInput
                          value={gotra}
                          onChangeText={setGotra}
                          style={styles.textInput}
                          placeholder="e.g. Kashyap (or blank if unsure)"
                          placeholderTextColor="#64748B"
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Birth Star (Nakshatra)</Text>
                        <TextInput
                          value={nakshatra}
                          onChangeText={setNakshatra}
                          style={styles.textInput}
                          placeholder="e.g. Rohini, Ashwini"
                          placeholderTextColor="#64748B"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Your Wish or Prayer Focus</Text>
                      <TextInput
                        value={sankalpWish}
                        onChangeText={setSankalpWish}
                        style={[styles.textInput, { height: 60 }]}
                        multiline
                        placeholder="e.g. Health recovery, peace of mind, career growth"
                        placeholderTextColor="#64748B"
                      />
                    </View>
                  </>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {selectedItem?.category === 'puja' ? 'Delivery Address for Holy Prasad' : 'Delivery Address'}
                  </Text>
                  <TextInput
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    style={[styles.textInput, { height: 60 }]}
                    multiline
                    placeholder="Enter complete postal address with PIN code"
                    placeholderTextColor="#64748B"
                  />
                </View>

                {/* Wallet Balance Summary */}
                <View style={styles.balanceSummaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Payable</Text>
                    <Text style={styles.summaryValueGold}>{formatCurrency(selectedItem?.price || 0)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Your Wallet Balance</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(balance)}</Text>
                  </View>
                </View>

                {/* Submit CTA */}
                <Pressable
                  onPress={handleConfirmOrder}
                  style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.confirmBtnText}>
                    Confirm & Pay {formatCurrency(selectedItem?.price || 0)}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ─── MODAL 2: SUCCESS RECEIPT MODAL ─── */}
        <Modal visible={!!orderConfirmation} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Text style={{ fontSize: 36 }}>🪔</Text>
              </View>
              <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>
              <Text style={styles.orderIdBadge}>Order #{orderConfirmation?.id}</Text>

              <Text style={styles.successMsg}>{orderConfirmation?.message}</Text>

              <Pressable
                onPress={() => setOrderConfirmation(null)}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Back to Store</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: 60,
  },
  walletHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 6,
  },
  walletIcon: {
    fontSize: 13,
  },
  walletAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCD34D',
  },
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 12, 22, 0.8)',
    borderRadius: radius.lg,
    padding: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    marginBottom: spacing.md,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
    gap: 6,
  },
  mainTabActive: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  mainTabIcon: {
    fontSize: 16,
  },
  mainTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  mainTabTextActive: {
    color: '#FFFFFF',
  },
  prescriptionCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  prescripIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  prescripIcon: {
    fontSize: 18,
  },
  prescripTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FCD34D',
    letterSpacing: 0.2,
  },
  prescripSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 1,
  },
  miniScroller: {
    gap: 10,
    paddingVertical: 4,
  },
  miniCard: {
    width: 140,
    backgroundColor: 'rgba(26, 33, 64, 0.9)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    overflow: 'hidden',
  },
  miniImage: {
    width: '100%',
    height: 75,
    backgroundColor: '#0F172A',
  },
  miniContent: {
    padding: 8,
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EEF2FF',
    marginBottom: 4,
  },
  miniPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCD34D',
  },
  miniTag: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '700',
  },
  subFilterRow: {
    gap: 8,
    paddingBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: 'rgba(26, 33, 64, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EEF2FF',
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardList: {
    gap: spacing.lg,
  },
  productCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.28)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: 170,
    backgroundColor: '#0F172A',
  },
  consecrationBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 12, 22, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    gap: 5,
    borderWidth: 0.8,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  consecrationIcon: {
    fontSize: 12,
  },
  consecrationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCD34D',
    maxWidth: 200,
  },
  cardBody: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF2FF',
    lineHeight: 22,
  },
  ratingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  sanskritName: {
    fontSize: 13,
    color: '#A5B4FC',
    fontWeight: '600',
    marginTop: 2,
  },
  doshaTarget: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 6,
    fontWeight: '600',
  },
  benefitList: {
    marginTop: 10,
    gap: 5,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  benefitBullet: {
    fontSize: 14,
    color: '#6366F1',
    lineHeight: 18,
  },
  benefitText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 8,
    borderRadius: radius.md,
    marginTop: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.15)',
  },
  certIcon: {
    fontSize: 13,
  },
  certText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 140, 248, 0.15)',
  },
  priceFlex: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FCD34D',
  },
  originalPrice: {
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  taxNotice: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  bookBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 20, 0.85)',
    justifyContent: 'flex-end',
  },
  orderModalCard: {
    backgroundColor: 'rgba(20, 26, 52, 0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EEF2FF',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  modalItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(10, 14, 30, 0.7)',
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  previewThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: '#0F172A',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EEF2FF',
  },
  previewTemple: {
    fontSize: 11,
    color: '#A5B4FC',
    marginTop: 1,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FCD34D',
    marginTop: 2,
  },
  formSectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCD34D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A5B4FC',
  },
  textInput: {
    backgroundColor: 'rgba(10, 12, 22, 0.8)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#EEF2FF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  balanceSummaryBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 0.8,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    marginTop: 6,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  summaryValueGold: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FCD34D',
  },
  confirmBtn: {
    height: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  successCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: 'rgba(20, 26, 52, 0.98)',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignSelf: 'center',
    marginVertical: 'auto',
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EEF2FF',
  },
  orderIdBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FCD34D',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  successMsg: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
