import React, { useState } from 'react';
import {
  FlatList,
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
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { ASTROLOGERS } from '../../src/data/astrologers';
import { Astrologer } from '../../src/types';
import { useRemediesStore } from '../../src/store/remediesStore';
import { useSpellsStore } from '../../src/store/spellsStore';
import { formatCurrency } from '../../src/utils';

type AdminTab = 'overview' | 'spells' | 'orders' | 'inventory' | 'astrologers' | 'revenue' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [astrologers, setAstrologers] = useState<Astrologer[]>([...ASTROLOGERS]);

  // Remedies & Spells Stores
  const inventory = useRemediesStore((s) => s.inventory);
  const orders = useRemediesStore((s) => s.orders);
  const updateItemPrice = useRemediesStore((s) => s.updateItemPrice);
  const updateItemStock = useRemediesStore((s) => s.updateItemStock);
  const toggleItemAvailable = useRemediesStore((s) => s.toggleItemAvailable);
  const updateOrderStatus = useRemediesStore((s) => s.updateOrderStatus);

  const spells = useSpellsStore((s) => s.spells);
  const spellOrders = useSpellsStore((s) => s.spellOrders);
  const updateSpellPrice = useSpellsStore((s) => s.updateSpellPrice);
  const toggleSpellAvailable = useSpellsStore((s) => s.toggleSpellAvailable);
  const updateSpellOrderStatus = useSpellsStore((s) => s.updateSpellOrderStatus);

  // Modal for adding new astrologer
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Vedic Astrology');
  const [newPrice, setNewPrice] = useState('25');
  const [newExp, setNewExp] = useState('8');
  const [newLang, setNewLang] = useState('Hindi, English');

  // Toggle online/offline status
  const toggleStatus = (id: string) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, online: !a.online } : a))
    );
  };

  // Edit Astrologer Price & Experience
  const updateAstroPrice = (id: string, newPrice: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pricePerMin: newPrice } : a))
    );
  };

  const updateAstroExp = (id: string, newExp: number) => {
    setAstrologers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, experienceYears: newExp } : a))
    );
  };

  // Add new astrologer
  const handleAddAstrologer = () => {
    if (!newName.trim()) return;
    const newAstro: Astrologer = {
      id: `astro-${Date.now()}`,
      name: newName.trim(),
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200`,
      rating: 4.9,
      reviews: 12,
      pricePerMin: Number(newPrice) || 25,
      experienceYears: Number(newExp) || 5,
      specialties: newSpecialty.split(',').map((s) => s.trim()),
      languages: newLang.split(',').map((l) => l.trim()),
      consultations: 5,
      online: true,
      about: 'Senior Vedic astrologer newly added to AstroGuru panel.',
    };
    setAstrologers([newAstro, ...astrologers]);
    setShowAddModal(false);
    setNewName('');
  };

  const activeCount = astrologers.filter((a) => a.online).length;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Admin Header */}
        <ScreenHeader
          title="⚡ Admin Control Panel"
          subtitle="Platform & E-Commerce Operations"
          showBack
          hideLanguage
        />

        {/* Tab Switcher Wrapper with Fixed Height */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={{ flexGrow: 0 }}
          >
            {[
              { id: 'overview', label: '📊 Stats' },
              { id: 'spells', label: `🪄 Spells (${spells.length})` },
              { id: 'orders', label: `🛒 Orders (${orders.length})` },
              { id: 'inventory', label: '📦 Inventory' },
              { id: 'astrologers', label: '🔮 Experts' },
              { id: 'revenue', label: '💸 Revenue' },
              { id: 'users', label: '👥 Users' },
            ].map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id as AdminTab)}
                style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              >
                {tab === t.id && (
                  <LinearGradient
                    colors={[colors.saffron, colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.tabBtnText, tab === t.id && styles.tabBtnTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <View style={{ gap: spacing.md }}>
              {/* Stat Cards Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statNum}>₹1,42,800</Text>
                  <Text style={styles.statTitle}>Total Gross Revenue</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🪄</Text>
                  <Text style={styles.statNum}>{spellOrders.length} Spells</Text>
                  <Text style={styles.statTitle}>Spells Booked</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🛒</Text>
                  <Text style={styles.statNum}>{orders.length} Orders</Text>
                  <Text style={styles.statTitle}>Shopping Completed</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statIcon}>🔮</Text>
                  <Text style={styles.statNum}>{activeCount} / {astrologers.length}</Text>
                  <Text style={styles.statTitle}>Online Experts</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <Card style={{ gap: spacing.md }}>
                <SectionHeader title="Platform Controls" />
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Button
                    label="🛒 Manage Orders"
                    variant="gold"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => setTab('orders')}
                  />
                  <Button
                    label="🪄 Manage Spells"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => setTab('spells')}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* ── SPELLS & PRICE MANAGEMENT TAB ── */}
          {tab === 'spells' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="Spells Catalog & Price Management" subtitle="Edit Spell Fees & Manage Availability" />

              {spells.map((spell) => (
                <Card key={spell.id} style={styles.inventoryCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: 28 }}>{spell.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTitle}>{spell.title}</Text>
                      <Text style={styles.invSub}>{spell.sanskritName} · {spell.category}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleSpellAvailable(spell.id)}
                      style={[styles.toggleBtn, spell.available ? styles.toggleOnline : styles.toggleOffline]}
                    >
                      <Text style={[styles.toggleText, { color: spell.available ? colors.success : colors.danger }]}>
                        {spell.available ? 'ACTIVE' : 'DISABLED'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Spell Fee (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(spell.price)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateSpellPrice(spell.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}

              <SectionHeader title="Booked Spell Rituals" subtitle={`${spellOrders.length} rituals scheduled`} />
              {spellOrders.map((ord) => (
                <Card key={ord.id} style={styles.orderCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.orderId}>{ord.id}</Text>
                    <Chip
                      label={ord.status}
                      tone={ord.status === 'Ritual Completed' ? 'teal' : ord.status === 'Casting in Progress' ? 'gold' : 'rose'}
                    />
                  </View>

                  <Text style={styles.orderItemName}>{ord.spellTitle}</Text>
                  <Text style={styles.orderPrice}>{formatCurrency(ord.price)}</Text>

                  <View style={styles.userInfoBox}>
                    <Text style={styles.userInfoText}>👤 Seeker Name: <Text style={{ color: colors.text }}>{ord.userName}</Text></Text>
                    <Text style={styles.userInfoText}>👥 Target Name: <Text style={{ color: colors.text }}>{ord.targetName}</Text></Text>
                    <Text style={styles.userInfoText}>🎂 DOB: <Text style={{ color: colors.text }}>{ord.dob}</Text></Text>
                    <Text style={styles.userInfoText}>📝 Intention: <Text style={{ color: colors.text }}>"{ord.intention}"</Text></Text>
                    <Text style={styles.userInfoText}>💳 Payment Mode: <Text style={{ color: colors.saffron }}>{ord.paymentMethod.toUpperCase()}</Text></Text>
                    <Text style={styles.userInfoText}>🕒 Placed On: <Text style={{ color: colors.textMuted }}>{ord.date}</Text></Text>
                  </View>

                  <View style={styles.statusActionRow}>
                    <Button
                      label="Casting in Progress"
                      variant="outline"
                      size="sm"
                      disabled={ord.status === 'Casting in Progress' || ord.status === 'Ritual Completed'}
                      onPress={() => updateSpellOrderStatus(ord.id, 'Casting in Progress')}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Ritual Completed"
                      variant="gold"
                      size="sm"
                      disabled={ord.status === 'Ritual Completed'}
                      onPress={() => updateSpellOrderStatus(ord.id, 'Ritual Completed')}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── USER ORDERS TRACKING TAB ── */}
          {tab === 'orders' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="User Shopping Orders" subtitle={`${orders.length} total orders recorded`} />

              {orders.map((ord) => (
                <Card key={ord.id} style={styles.orderCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.orderId}>{ord.id}</Text>
                    <Chip
                      label={ord.status}
                      tone={ord.status === 'Delivered' ? 'teal' : ord.status === 'Dispatched' ? 'gold' : 'rose'}
                    />
                  </View>

                  <Text style={styles.orderItemName}>{ord.itemName}</Text>
                  <Text style={styles.orderPrice}>{formatCurrency(ord.price)}</Text>

                  <View style={styles.userInfoBox}>
                    <Text style={styles.userInfoText}>👤 Customer: <Text style={{ color: colors.text }}>{ord.userName}</Text></Text>
                    <Text style={styles.userInfoText}>📞 Phone: <Text style={{ color: colors.text }}>{ord.phone}</Text></Text>
                    <Text style={styles.userInfoText}>📍 Address: <Text style={{ color: colors.text }}>{ord.address}</Text></Text>
                    <Text style={styles.userInfoText}>🕒 Placed On: <Text style={{ color: colors.textMuted }}>{ord.date}</Text></Text>
                  </View>

                  <View style={styles.statusActionRow}>
                    <Button
                      label="Mark Dispatched"
                      variant="outline"
                      size="sm"
                      disabled={ord.status === 'Dispatched' || ord.status === 'Delivered'}
                      onPress={() => updateOrderStatus(ord.id, 'Dispatched')}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Mark Delivered"
                      variant="gold"
                      size="sm"
                      disabled={ord.status === 'Delivered'}
                      onPress={() => updateOrderStatus(ord.id, 'Delivered')}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── INVENTORY & PRICE MANAGEMENT TAB ── */}
          {tab === 'inventory' && (
            <View style={{ gap: spacing.md }}>
              <SectionHeader title="AstroRemedies Catalog & Pricing" subtitle="Edit Prices & Manage Item Stock" />

              {inventory.map((item) => (
                <Card key={item.id} style={styles.inventoryCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Text style={{ fontSize: 28 }}>{item.planetIcon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invTitle}>{item.name}</Text>
                      <Text style={styles.invSub}>{item.sanskritName} · {item.planet}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggleItemAvailable(item.id)}
                      style={[styles.toggleBtn, item.available ? styles.toggleOnline : styles.toggleOffline]}
                    >
                      <Text style={[styles.toggleText, { color: item.available ? colors.success : colors.danger }]}>
                        {item.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Price (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(item.price)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateItemPrice(item.id, Number(txt) || 0)}
                      />
                    </View>

                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Stock Count:</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(item.stock)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateItemStock(item.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── ASTROLOGERS TAB (EXPERT PRICE & EXP MANAGEMENT) ── */}
          {tab === 'astrologers' && (
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tabHeading}>Manage Panel ({astrologers.length})</Text>
                <Button
                  label="➕ New Expert"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setShowAddModal(true)}
                />
              </View>

              {astrologers.map((a) => (
                <Card key={a.id} style={styles.manageCard}>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <Avatar uri={a.avatar} name={a.name} size={50} online={a.online} showStatus />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.manageName}>{a.name}</Text>
                      <Text style={styles.manageMeta}>
                        ⭐ {a.rating} ({a.reviews} reviews) · {a.specialties.join(' · ')}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => toggleStatus(a.id)}
                      style={[
                        styles.toggleBtn,
                        a.online ? styles.toggleOnline : styles.toggleOffline,
                      ]}
                    >
                      <Text style={[styles.toggleText, { color: a.online ? colors.success : colors.danger }]}>
                        {a.online ? 'ONLINE' : 'OFFLINE'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Inline Price & Experience Editor Inputs */}
                  <View style={styles.invControlsRow}>
                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Price / min (₹):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(a.pricePerMin)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateAstroPrice(a.id, Number(txt) || 0)}
                      />
                    </View>

                    <View style={styles.inputBoxCol}>
                      <Text style={styles.inputColLabel}>Experience (Yrs):</Text>
                      <TextInput
                        style={styles.invInput}
                        value={String(a.experienceYears)}
                        keyboardType="numeric"
                        onChangeText={(txt) => updateAstroExp(a.id, Number(txt) || 0)}
                      />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* ── REVENUE TAB ── */}
          {tab === 'revenue' && (
            <View style={{ gap: spacing.md }}>
              <Card>
                <SectionHeader title="Revenue Share Settings" subtitle="Platform vs Expert Split" />
                <View style={styles.revenueSplitRow}>
                  <View style={styles.splitBox}>
                    <Text style={styles.splitPct}>20%</Text>
                    <Text style={styles.splitLabel}>AstroGuru Platform Fee</Text>
                  </View>
                  <View style={styles.splitBox}>
                    <Text style={[styles.splitPct, { color: colors.teal }]}>80%</Text>
                    <Text style={styles.splitLabel}>Astrologer Payout</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <View style={{ gap: spacing.md }}>
              <Card padded={false}>
                <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
                  <SectionHeader title="Registered Users (1,240)" subtitle="Account statuses & history" />
                </View>
                {[
                  { name: 'Demo Seeker', email: 'seeker@astroguru.app', wallet: '₹310', role: 'User' },
                  { name: 'Master Admin', email: 'admin@astroguru.app', wallet: '₹9,999', role: 'Admin' },
                  { name: 'Rajesh Sharma', email: 'rajesh@gmail.com', wallet: '₹750', role: 'User' },
                  { name: 'Priyanka Verma', email: 'priyanka@gmail.com', wallet: '₹150', role: 'User' },
                ].map((u, idx) => (
                  <View key={idx} style={styles.userRow}>
                    <Avatar name={u.name} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>
                        {u.name}{' '}
                        {u.role === 'Admin' && (
                          <Text style={{ color: colors.saffron, fontSize: 11 }}>⚡ ADMIN</Text>
                        )}
                      </Text>
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                    <Text style={styles.userWallet}>{u.wallet}</Text>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </ScrollView>

        {/* ── ADD ASTROLOGER MODAL ── */}
        <Modal visible={showAddModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Astrologer</Text>
              <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ gap: spacing.md }}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Acharya Dev Sharma"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Specialties (comma separated)</Text>
                  <TextInput
                    value={newSpecialty}
                    onChangeText={setNewSpecialty}
                    placeholder="Vedic, Palmistry, Nadi"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Price / min (₹)</Text>
                    <TextInput
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Experience (yrs)</Text>
                    <TextInput
                      value={newExp}
                      onChangeText={setNewExp}
                      keyboardType="numeric"
                      style={styles.fieldInput}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Languages</Text>
                  <TextInput
                    value={newLang}
                    onChangeText={setNewLang}
                    placeholder="Hindi, English, Gujarati"
                    placeholderTextColor={colors.textFaint}
                    style={styles.fieldInput}
                  />
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={() => setShowAddModal(false)}
                />
                <Button
                  label="Save Expert"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={handleAddAstrologer}
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
  tabsWrapper: {
    height: 48,
    backgroundColor: '#060A12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16,185,129,0.25)',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tabBtn: {
    minWidth: 76,
    paddingHorizontal: spacing.md,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#0E1726',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    overflow: 'hidden',
  },
  tabBtnActive: { borderColor: 'transparent' },
  tabBtnText: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', fontSize: 11.5 },
  tabBtnTextActive: { color: colors.white },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  /* Overview */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  statBox: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    backgroundColor: '#0E1726',
    gap: 2,
    shadowColor: 'rgba(0,0,0,0.50)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: { fontSize: 22 },
  statNum: { ...typography.h1, fontSize: 19, color: colors.text, fontWeight: '800' },
  statTitle: { ...typography.tiny, color: colors.textMuted, fontWeight: '600', fontSize: 11 },

  /* Orders */
  orderCard: { gap: spacing.xs },
  orderId: { ...typography.h3, color: colors.saffron, fontSize: 15, fontWeight: '800' },
  orderItemName: { ...typography.h2, color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  orderPrice: { ...typography.h2, color: colors.saffron, fontWeight: '900', fontSize: 17 },
  userInfoBox: {
    backgroundColor: '#080E1A',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    gap: 2,
    marginTop: 4,
  },
  userInfoText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  statusActionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },

  /* Inventory */
  inventoryCard: { gap: spacing.sm },
  invTitle: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  invSub: { ...typography.tiny, color: colors.textMuted },
  invControlsRow: { flexDirection: 'row', gap: spacing.md, marginTop: 4 },
  inputBoxCol: { flex: 1, gap: 2 },
  inputColLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  invInput: {
    backgroundColor: '#080E1A',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
  },

  /* Astrologers */
  tabHeading: { ...typography.h2, color: colors.text, fontWeight: '800' },
  manageCard: { padding: spacing.md, gap: spacing.xs },
  manageName: { ...typography.h3, color: colors.text, fontSize: 15, fontWeight: '800' },
  manageMeta: { ...typography.tiny, color: colors.saffron, marginTop: 2, fontWeight: '700' },
  manageSpec: { ...typography.tiny, color: colors.textMuted, marginTop: 1 },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleOnline: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderColor: 'rgba(16,185,129,0.40)',
  },
  toggleOffline: {
    backgroundColor: 'rgba(100,116,139,0.14)',
    borderColor: 'rgba(100,116,139,0.30)',
  },
  toggleText: { ...typography.tiny, fontWeight: '800', fontSize: 10 },

  /* Revenue */
  revenueSplitRow: { flexDirection: 'row', gap: spacing.md },
  splitBox: {
    flex: 1,
    backgroundColor: '#080E1A',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  splitPct: { ...typography.display, fontSize: 28, color: colors.saffron, fontWeight: '900' },
  splitLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 4, textAlign: 'center', fontWeight: '700' },

  /* Users */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(16,185,129,0.20)',
  },
  userName: { ...typography.small, color: colors.text, fontWeight: '700' },
  userEmail: { ...typography.tiny, color: colors.textMuted, marginTop: 1 },
  userWallet: { ...typography.small, color: colors.saffron, fontWeight: '800' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4,7,13,0.80)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
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
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  field: { gap: 4 },
  fieldLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  fieldInput: {
    backgroundColor: '#080E1A',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
