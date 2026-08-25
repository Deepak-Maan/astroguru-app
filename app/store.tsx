import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { AstrotalkHeader } from '../src/components/astrotalk/AstrotalkHeader';
import { AstrotalkRechargeModal } from '../src/components/astrotalk/AstrotalkRechargeModal';
import { colors, radius, spacing } from '../src/theme';
import { useWalletStore } from '../src/store/walletStore';

type Category = 'puja' | 'gemstones' | 'rudraksha' | 'yantras';

interface ProductItem {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  rating: number;
  orders: number;
  image: string;
  badge?: string;
  benefits: string;
}

const PRODUCTS: ProductItem[] = [
  // E-Pujas
  {
    id: 'p1',
    category: 'puja',
    title: 'Maha Rudrabhishek Puja',
    subtitle: 'Kashi Vishwanath Temple, Varanasi',
    price: 1100,
    originalPrice: 2100,
    rating: 4.9,
    orders: 4320,
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
    badge: 'MOST POPULAR',
    benefits: 'Destroys negative energy, fulfills desires & grants health & prosperity.',
  },
  {
    id: 'p2',
    category: 'puja',
    title: 'Special Bhasma Aarti Sankalp',
    subtitle: 'Mahakaleshwar Temple, Ujjain',
    price: 2100,
    originalPrice: 3500,
    rating: 5.0,
    orders: 3120,
    image: 'https://images.unsplash.com/photo-1545232979-fbf592320b9a?auto=format&fit=crop&w=600&q=80',
    badge: 'HIGHLY AUSPICIOUS',
    benefits: 'Removes untimely death fears, pacifies active Rahu-Ketu & Shani Dosha.',
  },
  {
    id: 'p3',
    category: 'puja',
    title: 'Kalsarp & Rahu-Ketu Shanti',
    subtitle: 'Trimbakeshwar Temple, Nashik',
    price: 1500,
    originalPrice: 2800,
    rating: 4.8,
    orders: 5120,
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
    benefits: 'Eliminates career stagnation, financial blockages & marriage delays.',
  },

  // Gemstones
  {
    id: 'g1',
    category: 'gemstones',
    title: 'Natural Yellow Sapphire (Pukhraj)',
    subtitle: 'Ceylon Origin • 5.25 Ratti • IGI Certified',
    price: 4999,
    originalPrice: 8500,
    rating: 4.9,
    orders: 1890,
    image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=600&q=80',
    badge: 'GOVT CERTIFIED',
    benefits: 'Energizes Jupiter (Guru) for immense wisdom, business expansion & high status.',
  },
  {
    id: 'g2',
    category: 'gemstones',
    title: 'Natural Blue Sapphire (Neelam)',
    subtitle: 'Burma Origin • 4.5 Ratti • Lab Tested',
    price: 6499,
    originalPrice: 11000,
    rating: 4.9,
    orders: 980,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    badge: '100% NATURAL',
    benefits: 'Shani Graha remedy for instant breakthrough, discipline & karmic protection.',
  },
  {
    id: 'g3',
    category: 'gemstones',
    title: 'Natural Emerald (Panna)',
    subtitle: 'Zambian Origin • 4.25 Ratti • Pure Green',
    price: 3899,
    originalPrice: 6200,
    rating: 4.8,
    orders: 1420,
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=600&q=80',
    benefits: 'Mercury (Budh) stone for razor-sharp intellect, trading success & communication.',
  },

  // Rudraksha
  {
    id: 'r1',
    category: 'rudraksha',
    title: 'Nepal 5 Mukhi Rudraksha Mala (108+1)',
    subtitle: 'Direct from Pashupatinath, Nepal',
    price: 899,
    originalPrice: 1600,
    rating: 4.9,
    orders: 8400,
    image: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80',
    badge: 'BESTSELLER',
    benefits: 'Calms anxiety, lowers blood pressure, ideal for daily Japa & spiritual awakening.',
  },
  {
    id: 'r2',
    category: 'rudraksha',
    title: 'Original 1 Mukhi (Eka Mukhi) Rudraksha',
    subtitle: 'Rare Half-Moon Indonesian Bead with Silver Casing',
    price: 3499,
    originalPrice: 5999,
    rating: 5.0,
    orders: 1120,
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=600&q=80',
    badge: 'RARE SACRED',
    benefits: 'Represents Lord Shiva directly — enhances supreme consciousness & leadership.',
  },

  // Yantras
  {
    id: 'y1',
    category: 'yantras',
    title: 'Gold Plated Sampurna Shree Yantra (9x9)',
    subtitle: 'Vedic Consecrated with Pran Pratishtha',
    price: 1299,
    originalPrice: 2499,
    rating: 4.9,
    orders: 6210,
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=600&q=80',
    badge: 'ENERGIZED',
    benefits: 'Attracts Goddess Lakshmi, wealth, prosperity and clears Vastu doshas.',
  },
  {
    id: 'y2',
    category: 'yantras',
    title: 'Kuber Dhan Varsha Yantra & Coin',
    subtitle: 'Ashta Dhatu Gold Polished Sacred Geometry',
    price: 999,
    originalPrice: 1999,
    rating: 4.8,
    orders: 3900,
    image: 'https://images.unsplash.com/photo-1545232979-fbf592320b9a?auto=format&fit=crop&w=600&q=80',
    benefits: 'Lord Kuber treasury guardian for financial accumulation & recovery of blocked money.',
  },
];

export default function StoreScreen() {
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance ?? 100);
  const debit = useWalletStore((s) => s.debit);

  const [category, setCategory] = useState<Category>('puja');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [seekerName, setSeekerName] = useState('Seeker');
  const [gotra, setGotra] = useState('Kashyap');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Lotus Towers, New Delhi');
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const filteredProducts = PRODUCTS.filter((p) => p.category === category);

  const handleBuy = (product: ProductItem) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    setSelectedProduct(product);
  };

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;

    if (balance < selectedProduct.price) {
      Alert.alert(
        'Insufficient Balance',
        `You need ₹${selectedProduct.price} but your balance is ₹${balance.toFixed(0)}. Please recharge your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Recharge Now', onPress: () => setRechargeModalVisible(true) },
        ]
      );
      return;
    }

    const success = debit(selectedProduct.price, `Order: ${selectedProduct.title}`);
    if (success) {
      try {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (_) {}
      const orderId = `AG-STORE-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccess(`Order #${orderId} Confirmed!\nYour Sankalp & Dispatch details have been recorded.`);
      setSelectedProduct(null);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* AstroGuru Header with Wallet */}
        <AstrotalkHeader onOpenRecharge={() => setRechargeModalVisible(true)} />

        {/* Categories Bar */}
        <View style={styles.categoriesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {[
              { id: 'puja', label: '🕉️ E-Puja & Sankalp' },
              { id: 'gemstones', label: '💎 Certified Gemstones' },
              { id: 'rudraksha', label: '📿 Genuine Rudraksha' },
              { id: 'yantras', label: '🔱 Sacred Yantras' },
            ].map((cat) => {
              const active = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id as Category)}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Order Success Toast */}
          {!!orderSuccess && (
            <View style={styles.successCard}>
              <Text style={{ fontSize: 28 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                <Text style={styles.successSub}>{orderSuccess}</Text>
              </View>
              <Pressable onPress={() => setOrderSuccess(null)}>
                <Text style={{ fontSize: 16, color: '#059669', fontWeight: '900' }}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Product Cards List */}
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {/* Product Image & Badge */}
              <View style={styles.imageWrapper}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                {product.badge && (
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{product.badge}</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                </View>
                <Text style={styles.productSub}>{product.subtitle}</Text>
                <Text style={styles.productBenefits}>{product.benefits}</Text>

                {/* Rating & Orders */}
                <View style={styles.metaRow}>
                  <Text style={styles.starText}>⭐ {product.rating.toFixed(1)}</Text>
                  <Text style={styles.ordersText}>• {product.orders}+ devotees booked</Text>
                </View>

                {/* Price & Buy Button */}
                <View style={styles.priceActionRow}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={styles.priceCurrent}>₹{product.price}</Text>
                      <Text style={styles.priceOriginal}>₹{product.originalPrice}</Text>
                    </View>
                    <Text style={styles.taxText}>Inc. All taxes & shipping</Text>
                  </View>

                  <Pressable
                    onPress={() => handleBuy(product)}
                    style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.85 }]}
                  >
                    <LinearGradient
                      colors={['#FFC107', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.buyBtnText}>
                      {product.category === 'puja' ? 'Book Puja ➔' : 'Order Now ➔'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Checkout & Sankalp Details Modal */}
      <Modal visible={!!selectedProduct} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Confirm Order Details</Text>
                <Text style={styles.modalSub}>{selectedProduct?.title}</Text>
              </View>
              <Pressable onPress={() => setSelectedProduct(null)} style={styles.closeBtn}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#6B7280' }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              <Text style={styles.inputLabel}>Devotee / Seeker Name</Text>
              <TextInput
                value={seekerName}
                onChangeText={setSeekerName}
                style={styles.modalInput}
                placeholder="Enter full name"
              />

              {selectedProduct?.category === 'puja' && (
                <>
                  <Text style={styles.inputLabel}>Gotra (Optional / Unknown)</Text>
                  <TextInput
                    value={gotra}
                    onChangeText={setGotra}
                    style={styles.modalInput}
                    placeholder="e.g. Kashyap, Bhardwaj or Shiva Gotra"
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Prashad & Delivery Address</Text>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                style={[styles.modalInput, { height: 60 }]}
                multiline
                placeholder="House, Street, City, Pin Code"
              />

              {/* Price Breakdown */}
              <View style={styles.billBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billVal}>₹{selectedProduct?.price}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Vedic Consecration & Sankalp</Text>
                  <Text style={[styles.billVal, { color: '#059669' }]}>FREE</Text>
                </View>
                <View style={styles.billDivider} />
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { fontWeight: '900', color: '#1A1A1A' }]}>Grand Total</Text>
                  <Text style={[styles.billVal, { fontWeight: '900', color: '#D97706', fontSize: 16 }]}>
                    ₹{selectedProduct?.price}
                  </Text>
                </View>
              </View>

              {/* Confirm & Pay Button */}
              <Pressable
                onPress={handleConfirmOrder}
                style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.88 }]}
              >
                <LinearGradient
                  colors={['#FFC107', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.confirmBtnText}>
                  Pay ₹{selectedProduct?.price} via AstroGuru Wallet ➔
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Instant Recharge Modal */}
      <AstrotalkRechargeModal
        visible={rechargeModalVisible}
        onClose={() => setRechargeModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  categoriesBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  categoryPillActive: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.2,
    borderColor: '#F59E0B',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#D97706',
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 100,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  successSub: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 2,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  productInfo: {
    padding: 14,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  productSub: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  productBenefits: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  starText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706',
  },
  ordersText: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceCurrent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  priceOriginal: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  taxText: {
    fontSize: 9.5,
    color: '#9CA3AF',
  },
  buyBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buyBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  modalSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  billBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
    gap: 6,
    marginTop: 6,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  billVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 2,
  },
  confirmBtn: {
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
