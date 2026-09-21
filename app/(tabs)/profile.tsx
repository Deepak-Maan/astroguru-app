import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
import { AnimatedAuthOverlay } from '../../src/components/AnimatedAuthOverlay';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { useWalletStore } from '../../src/store/walletStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { useUpdateStore } from '../../src/store/updateStore';
import { useLiveChatStore } from '../../src/store/liveChatStore';
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';
import { searchCities } from '../../src/data/cities';
import { formatCurrency } from '../../src/utils';
import { City } from '../../src/types';
import {
  fetchUserProfileFromDatabase,
  syncUserProfileToDatabase,
} from '../../src/services/userProfileService';

const AVATAR_OPTIONS = ['☀️', '🔱', '🪷', '🦚', '🕉️', '⚡', '🌙', '🧘'];

function AcharyaLiveQueue({ astrologerId }: { astrologerId: string }) {
  const router = useRouter();
  const roomsMap = useLiveChatStore((s) => s.rooms);
  const acceptRoom = useLiveChatStore((s) => s.acceptRoom);

  const activeRooms = Object.values(roomsMap).filter(
    (r) => r && (r.astrologerId === astrologerId || r.astrologerId === 'astro-1' || true) && r.status !== 'ended'
  );

  if (activeRooms.length === 0) {
    return (
      <Card padded style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)', borderWidth: 1 }}>
        <Text style={{ ...typography.tiny, color: colors.teal, fontWeight: '800' }}>🟢 DUTY STATUS: ONLINE & READY</Text>
        <Text style={{ ...typography.body, color: '#EEF2FF', fontWeight: '700', marginTop: 4 }}>
          No pending chat requests right now. When a seeker initiates a consultation, it will pop up here in real time!
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader title="🔴 Live Consultation Requests" />
      {activeRooms.map((room) => (
        <Card key={room.roomId} padded style={{ backgroundColor: 'rgba(26, 33, 64, 0.78)', borderColor: 'rgba(129, 140, 248, 0.3)', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...typography.tiny, color: colors.gold, fontWeight: '900' }}>
                {room.status === 'waiting' ? '⏳ PENDING REQUEST' : '💬 ACTIVE SESSION'}
              </Text>
              <Text style={{ ...typography.h3, color: '#EEF2FF', fontWeight: '900' }}>
                {room.seekerName}
              </Text>
              <Text style={{ ...typography.small, color: '#A5B4FC', fontWeight: '600' }} numberOfLines={1}>
                {room.messages[room.messages.length - 1]?.text || room.topic}
              </Text>
            </View>
            <Button
              label={room.status === 'waiting' ? 'Accept & Chat' : 'Open Chat'}
              variant="gold"
              size="sm"
              onPress={() => {
                if (room.status === 'waiting') acceptRoom(room.roomId);
                router.push(`/acharya-chat/${room.roomId}`);
              }}
            />
          </View>
        </Card>
      ))}
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  accent,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  accent?: string;
}) {
  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
      }
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && { transform: [{ translateY: 1.5 }], opacity: 0.75 },
      ]}
    >
      <View style={styles.rowIconWrap}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, accent ? { color: accent } : undefined]}>{label}</Text>
      {!!value && (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      )}
      {!!onPress && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

function EditNumField({
  value,
  onChange,
  placeholder,
  max,
  width = 64,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  width?: number;
  label?: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      {!!label && <Text style={styles.modalFieldMicro}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, String(max).length))}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        keyboardType="number-pad"
        style={[styles.modalNumInput, { width, textAlign: 'center' }]}
        maxLength={String(max).length}
      />
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const clear = useUserStore((s) => s.clear);
  const balance = useWalletStore((s) => s.balance);

  const logout = useAuthStore((s) => s.logout);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const vipPlanId = useSubscriptionStore((s) => s.planId);
  const vipExpires = useSubscriptionStore((s) => s.expiresAt);
  const currentVersion = useUpdateStore((s) => s.currentVersion);
  const latestVersion = useUpdateStore((s) => s.latestVersion);
  const triggerUpdateModal = useUpdateStore((s) => s.triggerUpdateModal);

  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>('male');
  const [editAvatar, setEditAvatar] = useState('☀️');
  const [editDd, setEditDd] = useState('');
  const [editMm, setEditMm] = useState('');
  const [editYyyy, setEditYyyy] = useState('');
  const [editHh, setEditHh] = useState('');
  const [editMin, setEditMin] = useState('');
  const [editCity, setEditCity] = useState<City | null>(null);
  const [editCityQuery, setEditCityQuery] = useState('');
  const [showCityList, setShowCityList] = useState(false);
  const [editGotra, setEditGotra] = useState('');
  const [editMaritalStatus, setEditMaritalStatus] = useState<'single' | 'married' | 'divorced' | 'separated' | 'other'>('single');
  const [editError, setEditError] = useState<string | null>(null);

  const cityResults = useMemo(() => searchCities(editCityQuery, 6), [editCityQuery]);

  // Sync cloud profile on load
  useEffect(() => {
    if (authUser?.id) {
      fetchUserProfileFromDatabase(authUser.id)
        .then((cloudData) => {
          if (cloudData) {
            if (cloudData.avatar) setEditAvatar(cloudData.avatar);
            if (cloudData.gotra) setEditGotra(cloudData.gotra);
            if (cloudData.maritalStatus) setEditMaritalStatus(cloudData.maritalStatus as any);
          }
        })
        .catch(() => {});
    }
  }, [authUser?.id]);

  const handleOpenEditModal = () => {
    setEditName(authUser?.name || profile?.name || '');
    setEditEmail(authUser?.email || '');
    setEditPhone(authUser?.phone || '');
    setEditGender((profile?.gender as any) || 'male');
    if (profile?.date) {
      const parts = profile.date.split('-');
      setEditYyyy(parts[0] || '');
      setEditMm(parts[1] || '');
      setEditDd(parts[2] || '');
    } else {
      setEditYyyy('');
      setEditMm('');
      setEditDd('');
    }
    if (profile?.time) {
      const parts = profile.time.split(':');
      setEditHh(parts[0] || '');
      setEditMin(parts[1] || '');
    } else {
      setEditHh('');
      setEditMin('');
    }
    setEditCity(profile?.place || null);
    setEditCityQuery(profile?.place?.name || '');
    setShowCityList(false);
    setEditError(null);
    setSaveSuccessMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setEditError('Please enter your full name.');
      return;
    }

    const d = Number(editDd), m = Number(editMm), y = Number(editYyyy);
    const h = Number(editHh), mi = Number(editMin);

    const hasAnyBirth = editDd || editMm || editYyyy || editHh || editMin || editCity;
    if (hasAnyBirth) {
      if (!editDd || !editMm || !editYyyy) {
        setEditError('Please enter day, month, and year of birth.');
        return;
      }
      if (m < 1 || m > 12) {
        setEditError('Month must be between 1 and 12.');
        return;
      }
      if (y < 1900 || y > 2100) {
        setEditError('Year must be between 1900 and 2100.');
        return;
      }
      const daysInMonth = new Date(y, m, 0).getDate();
      if (d < 1 || d > daysInMonth) {
        setEditError(`Day must be between 1 and ${daysInMonth}.`);
        return;
      }
      if (editHh === '' || editMin === '') {
        setEditError('Please enter hour and minute of birth.');
        return;
      }
      if (h < 0 || h > 23 || mi < 0 || mi > 59) {
        setEditError('Invalid time (hours 00-23, minutes 00-59).');
        return;
      }
      if (!editCity) {
        setEditError('Please select a birth place/city.');
        return;
      }
    }

    setIsSaving(true);
    setEditError(null);

    const pad = (n: string) => n.padStart(2, '0');
    const birthDate = hasAnyBirth ? `${editYyyy}-${pad(editMm)}-${pad(editDd)}` : undefined;
    const birthTime = hasAnyBirth ? `${pad(editHh)}:${pad(editMin)}` : undefined;

    const uid = authUser?.id || `usr_${Date.now()}`;
    const res = await syncUserProfileToDatabase({
      userId: uid,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      gender: editGender,
      avatar: editAvatar,
      date: birthDate,
      time: birthTime,
      place: editCity || undefined,
      gotra: editGotra.trim(),
      maritalStatus: editMaritalStatus,
    });

    setIsSaving(false);

    if (res.success) {
      setSaveSuccessMessage('✨ Profile & Kundli updated in database!');
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }
      setTimeout(() => {
        setSaveSuccessMessage(null);
        setIsEditModalOpen(false);
      }, 1200);
    } else {
      setEditError(res.error || 'Failed to update database. Please try again.');
    }
  };

  const handleSignOut = () => {
    setShowLogoutOverlay(true);
  };

  const handleOverlayFinish = () => {
    router.replace('/(auth)/login');
    setTimeout(() => {
      logout();
    }, 50);
  };

  function confirmReset() {
    const doReset = () => {
      clear();
      router.replace('/(onboarding)/welcome');
    };

    if (Platform.OS === 'web') {
      if (typeof confirm === 'function' && confirm('Reset your birth details and start over?')) {
        doReset();
      }
      return;
    }

    Alert.alert(
      'Reset birth details?',
      'This clears your saved chart. Your wallet balance is not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: doReset },
      ],
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AnimatedAuthOverlay
          visible={showLogoutOverlay}
          type="logout"
          message="Session securely ended."
          onFinished={handleOverlayFinish}
        />

        {!isAuthenticated || !authUser ? (
          <View style={{ flex: 1, backgroundColor: colors.bg }} />
        ) : authUser?.role === 'astrologer' ? (
          /* ─── ACHARYA PROFILE ─── */
          <>
            <ScreenHeader title="Acharya Profile" />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Identity Hero */}
              <View style={styles.identityCard}>
                <Avatar name={authUser?.name ?? 'Acharya'} size={80} />
                <Text style={styles.name}>{authUser?.name ?? 'Acharya'}</Text>
                <Text style={styles.emailText}>{authUser?.email ?? 'acharya@astroguru.app'}</Text>
                <View style={[styles.adminRoleTag, { borderColor: colors.teal, backgroundColor: 'rgba(5,150,105,0.12)' }]}>
                  <Text style={[styles.adminRoleText, { color: colors.teal }]}>🪔 CERTIFIED VEDIC ACHARYA</Text>
                </View>
                <View style={styles.badgeRow}>
                  {[
                    { label: 'Experience', value: '12 Years' },
                    { label: 'Rating', value: '4.95 ★' },
                    { label: 'Sessions', value: '4,200+' },
                  ].map(({ label, value }) => (
                    <View key={label} style={styles.badge}>
                      <Text style={styles.badgeLabel}>{label}</Text>
                      <Text style={styles.badgeValue} numberOfLines={1}>{value}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  label="✏️ Edit Acharya Profile"
                  variant="gold"
                  size="sm"
                  style={{ marginTop: spacing.md, width: '100%' }}
                  onPress={handleOpenEditModal}
                />
              </View>

              {/* Acharya Specialties */}
              <Card padded>
                <Text style={{ ...typography.h3, color: colors.text, fontWeight: '800', marginBottom: spacing.sm }}>🎯 Specializations</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['Vedic Kundli', 'Nadi Jyotish', 'Lal Kitab', 'Prashna', 'KP System', 'Muhurta', 'Gemology', 'Vastu'].map((s) => (
                    <View key={s} style={{ backgroundColor: 'rgba(5,150,105,0.1)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(5,150,105,0.3)' }}>
                      <Text style={{ color: colors.teal, fontSize: 12, fontWeight: '700' }}>{s}</Text>
                    </View>
                  ))}
                </View>
              </Card>

              {/* Acharya Live Consultation Queue */}
              <AcharyaLiveQueue astrologerId={authUser?.id ?? 'astro-1'} />

              {/* Acharya Tools */}
              <View>
                <SectionHeader title="🛠️ Acharya Tools" />
                <Card padded={false}>
                  <Row icon="📋" label="Manage Consultation Profile" onPress={() => router.push('/acharya/consultation-profile')} />
                  <Row icon="📜" label="Certifications & Degrees" onPress={() => router.push('/acharya/certifications')} />
                  <Row icon="💬" label="Client Reviews & Testimonials" onPress={() => router.push('/acharya/reviews')} />
                  <Row icon="📣" label="Broadcast Announcement to Clients" onPress={() => router.push('/acharya/broadcast')} />
                  <Row icon="📅" label="Set Availability Schedule" onPress={() => router.push('/acharya/availability')} />
                  <Row icon="🎓" label="Acharya Training & Resources" onPress={() => router.push('/acharya/training')} accent={colors.primary} />
                </Card>
              </View>

              {/* Platform Tools */}
              <View>
                <SectionHeader title="⚙️ Account & Settings" />
                <Card padded={false}>
                  <Row icon="🏦" label="Bank Account & UPI Settings" onPress={() => router.push('/acharya/bank-settings')} />
                  <Row icon="📊" label="Monthly Earnings Report" onPress={() => router.push('/acharya/earnings-report')} />
                  <Row icon="🔒" label="Security & Privacy Vault" onPress={() => router.push('/acharya/security')} />
                  <Row icon="🔄" label={`Check for In-App Updates · v${latestVersion}`} onPress={triggerUpdateModal} accent={colors.teal} />
                  <Row icon="📞" label="Support & Help Center" onPress={() => router.push('/acharya/support')} />
                  <Row icon="🚪" label="Sign Out" onPress={handleSignOut} accent={colors.danger} />
                </Card>
              </View>

              <Text style={styles.version}>AstroGuru Acharya · v{currentVersion} · {authUser?.email}</Text>
            </ScrollView>
          </>
        ) : (
          /* ─── SEEKER PROFILE ─── */
          <>
            <ScreenHeader title="Profile & Account" />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Identity hero */}
              <View style={styles.identityCard}>
                <View style={{ position: 'relative' }}>
                  <Avatar name={authUser?.name ?? profile?.name ?? 'Seeker'} size={80} />
                  {!!editAvatar && (
                    <View style={styles.avatarPillBadge}>
                      <Text style={{ fontSize: 16 }}>{editAvatar}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.name}>{authUser?.name ?? profile?.name ?? 'Seeker'}</Text>
                <Text style={styles.emailText}>{authUser?.email ?? 'seeker@astroguru.app'}</Text>

                {isVip && (
                  <View style={[styles.adminRoleTag, { borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                    <Text style={[styles.adminRoleText, { color: '#8B5CF6' }]}>
                      👑 VIP PASS · {vipPlanId?.toUpperCase()} · Expires {vipExpires}
                    </Text>
                  </View>
                )}

                {editGotra ? (
                  <View style={[styles.adminRoleTag, { borderColor: colors.teal, backgroundColor: 'rgba(5,150,105,0.15)', marginTop: 4 }]}>
                    <Text style={[styles.adminRoleText, { color: colors.teal }]}>🪔 GOTRA: {editGotra.toUpperCase()}</Text>
                  </View>
                ) : null}

                {profile ? (
                  <Text style={styles.birth}>
                    {profile.date} · {profile.time} · {profile.place.name}
                  </Text>
                ) : (
                  <Text style={styles.birth}>No birth details saved</Text>
                )}

                {kundli && (
                  <View style={styles.badgeRow}>
                    {[
                      { label: 'Lagna', value: RASHIS[kundli.lagnaIndex].glyph + ' ' + RASHIS[kundli.lagnaIndex].sanskrit },
                      { label: 'Rashi', value: RASHIS[kundli.moonRashiIndex].glyph + ' ' + RASHIS[kundli.moonRashiIndex].sanskrit },
                      { label: 'Nakshatra', value: NAKSHATRAS[kundli.moonNakshatraIndex].name },
                    ].map(({ label, value }) => (
                      <View key={label} style={styles.badge}>
                        <Text style={styles.badgeLabel}>{label}</Text>
                        <Text style={styles.badgeValue} numberOfLines={1}>{value}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, width: '100%' }}>
                  <Button
                    label="✏️ Edit Profile"
                    variant="gold"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={handleOpenEditModal}
                  />
                  <Button
                    label={profile ? 'Full Chart' : 'Add Birth Data'}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                    onPress={() => router.push('/(onboarding)/birth-details')}
                  />
                </View>
              </View>

              {/* Wallet snapshot */}
              <Pressable onPress={() => router.push('/wallet')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
                <View style={styles.walletCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                    <Text style={styles.walletValue}>{formatCurrency(balance)}</Text>
                    <Text style={styles.walletSub}>Tap to add money or view history</Text>
                  </View>
                  <Text style={styles.walletIcon}>💰</Text>
                </View>
              </Pressable>

              {/* Super App Features */}
              <View>
                <SectionHeader title="🌟 Super App Cosmic Features" />
                <Card padded={false}>
                  <Row icon="🌌" label="Live Satsang & Virtual Prashad" onPress={() => router.push('/satsang')} accent={colors.primary} />
                  <Row icon="💎" label="AI Gemstone Finder & Lab Scanner" onPress={() => router.push('/gemstone-finder')} />
                  <Row icon="📜" label="432Hz Ambient Vedic Mantra Player" onPress={() => router.push('/mantra-player')} />
                  <Row icon="🛰️" label="Astro-Cartography Relocation Map" onPress={() => router.push('/astro-map')} />
                  <Row icon="📈" label="Astro-Finance & Stock Muhurat" onPress={() => router.push('/astro-finance')} />
                  <Row icon="🏛️" label="24/7 Live Temple Darshan & Prashad" onPress={() => router.push('/live-darshan')} />
                  <Row icon="🕊️" label="AI Soulmate Compatibility" onPress={() => router.push('/soulmate-ai')} />
                  <Row icon="📖" label="Daily Bhagavad Gita Audio Wisdom" onPress={() => router.push('/gita-audio')} />
                  <Row icon="⚡" label="Major Transit Push Alert Radar" onPress={() => router.push('/transit-alerts')} />
                  <Row icon="🤖" label="Samudrika AI Face Reader" onPress={() => router.push('/face-reading')} />
                  <Row icon="⚔️" label="Lal Kitab & Pitru Dosh Remedies" onPress={() => router.push('/lal-kitab')} />
                  <Row icon="🪄" label="Vedic Spells & Manifestation Store" onPress={() => router.push('/spells')} />
                </Card>
              </View>

              {/* Account & Settings */}
              <View>
                <SectionHeader title="⚙️ Account & Settings" />
                <Card padded={false}>
                  <Row icon="🚀" label={`Upgrade / Update App (v${currentVersion})`} onPress={() => triggerUpdateModal()} accent={colors.teal} />
                  <Row icon="👑" label={isVip ? `AstroVIP — ${vipPlanId} (Active)` : 'Get AstroVIP Pass'} onPress={() => router.push('/vip')} accent={colors.coral} />
                  <Row icon="📄" label="10-Page Kundli PDF Export" onPress={() => router.push('/kundli-pdf')} />
                  <Row icon="🔄" label={`Check for In-App Updates · v${latestVersion}`} onPress={triggerUpdateModal} accent={colors.teal} />
                  <Row icon="⚙️" label="Settings & Security Vault" onPress={() => router.push('/settings')} />
                  <Row icon="🚪" label="Sign Out" onPress={handleSignOut} accent={colors.danger} />
                </Card>
              </View>

              {/* Danger zone */}
              <View>
                <SectionHeader title="Danger Zone" />
                <Card padded={false}>
                  <Row
                    icon="🗑️"
                    label="Reset birth details"
                    onPress={confirmReset}
                    accent={colors.danger}
                  />
                </Card>
              </View>

              <Text style={styles.version}>AstroGuru · v{currentVersion} · Signed in as {authUser?.email ?? 'Seeker'}</Text>
            </ScrollView>
          </>
        )}

        {/* ─── EDIT PROFILE & DATABASE SYNC MODAL ─── */}
        <Modal
          visible={isEditModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => !isSaving && setIsEditModalOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>✏️ Update Seeker Profile</Text>
                  <Text style={styles.modalSubtitle}>Data instantly syncs with cloud database & Kundli chart</Text>
                </View>
                <Pressable
                  onPress={() => !isSaving && setIsEditModalOpen(false)}
                  style={styles.modalCloseButton}
                  hitSlop={8}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Spiritual Avatar Selector */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🌟 Spiritual Persona</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
                    {AVATAR_OPTIONS.map((emoji) => {
                      const isSelected = editAvatar === emoji;
                      return (
                        <Pressable
                          key={emoji}
                          onPress={() => setEditAvatar(emoji)}
                          style={[
                            styles.avatarOption,
                            isSelected && styles.avatarOptionSelected,
                          ]}
                        >
                          <Text style={{ fontSize: 24 }}>{emoji}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Personal Information */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>👤 Personal Details</Text>

                  <Text style={styles.modalLabel}>Full Name *</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your legal or spiritual name"
                    placeholderTextColor="#64748B"
                    style={styles.modalInput}
                  />

                  <Text style={styles.modalLabel}>Phone Number</Text>
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    style={styles.modalInput}
                  />

                  <Text style={styles.modalLabel}>Email Address</Text>
                  <TextInput
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="user@astroguru.app"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.modalInput}
                  />

                  <Text style={styles.modalLabel}>Gender</Text>
                  <View style={styles.chipRow}>
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <Chip
                        key={g}
                        label={g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚥ Other'}
                        selected={editGender === g}
                        onPress={() => setEditGender(g)}
                        tone={editGender === g ? 'gold' : 'default'}
                      />
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>Marital Status</Text>
                  <View style={styles.chipRow}>
                    {(['single', 'married', 'divorced', 'other'] as const).map((s) => (
                      <Chip
                        key={s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        selected={editMaritalStatus === s}
                        onPress={() => setEditMaritalStatus(s)}
                        tone={editMaritalStatus === s ? 'teal' : 'default'}
                      />
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>Gotra (Optional)</Text>
                  <TextInput
                    value={editGotra}
                    onChangeText={setEditGotra}
                    placeholder="e.g. Kashyapa, Bharadwaja, Vashistha"
                    placeholderTextColor="#64748B"
                    style={styles.modalInput}
                  />
                </View>

                {/* Vedic Birth & Astrological Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🪐 Vedic Birth & Kundli Coordinates</Text>

                  {/* Date of Birth */}
                  <Text style={styles.modalLabel}>Date of Birth</Text>
                  <View style={styles.rowInputs}>
                    <EditNumField value={editDd} onChange={setEditDd} placeholder="DD" max={31} label="Day" width={56} />
                    <EditNumField value={editMm} onChange={setEditMm} placeholder="MM" max={12} label="Month" width={56} />
                    <EditNumField value={editYyyy} onChange={setEditYyyy} placeholder="YYYY" max={2099} label="Year" width={76} />
                  </View>

                  {/* Time of Birth */}
                  <Text style={[styles.modalLabel, { marginTop: spacing.md }]}>Time of Birth (24-Hour)</Text>
                  <View style={styles.rowInputs}>
                    <EditNumField value={editHh} onChange={setEditHh} placeholder="HH" max={23} label="Hour (0-23)" width={70} />
                    <EditNumField value={editMin} onChange={setEditMin} placeholder="MM" max={59} label="Min (0-59)" width={70} />
                  </View>

                  {/* Place of Birth */}
                  <Text style={[styles.modalLabel, { marginTop: spacing.md }]}>Place of Birth / City</Text>
                  <TextInput
                    value={editCityQuery}
                    onChangeText={(t) => {
                      setEditCityQuery(t);
                      setShowCityList(true);
                    }}
                    onFocus={() => setShowCityList(true)}
                    placeholder="Type city (e.g. Mumbai, Delhi, London)..."
                    placeholderTextColor="#64748B"
                    style={styles.modalInput}
                  />

                  {/* Selected City Confirmation */}
                  {editCity && !showCityList && (
                    <View style={styles.selectedCityBanner}>
                      <Text style={styles.selectedCityText}>
                        📍 {editCity.name}, {editCity.state} · {editCity.lat.toFixed(2)}°, {editCity.lon.toFixed(2)}°
                      </Text>
                    </View>
                  )}

                  {/* City dropdown results */}
                  {showCityList && cityResults.length > 0 && (
                    <View style={styles.dropdown}>
                      {cityResults.map((c) => (
                        <Pressable
                          key={`${c.name}-${c.state}-${c.lat}`}
                          onPress={() => {
                            setEditCity(c);
                            setEditCityQuery(c.name);
                            setShowCityList(false);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text style={styles.dropdownItemText}>{c.name}, {c.state}</Text>
                          <Text style={styles.dropdownItemCoords}>{c.lat.toFixed(2)}°, {c.lon.toFixed(2)}°</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Error Banner */}
                {!!editError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {editError}</Text>
                  </View>
                )}

                {/* Success Banner */}
                {!!saveSuccessMessage && (
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>{saveSuccessMessage}</Text>
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer Actions */}
              <View style={styles.modalFooter}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  size="md"
                  disabled={isSaving}
                  onPress={() => setIsEditModalOpen(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  label={isSaving ? 'Syncing to DB...' : '💾 Save to Database'}
                  variant="gold"
                  size="md"
                  disabled={isSaving}
                  onPress={handleSaveProfile}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },

  identityCard: {
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarPillBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0F172A',
    borderRadius: radius.pill,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  name: { ...typography.h1, color: '#EEF2FF', marginTop: spacing.sm, textAlign: 'center', fontWeight: '800' },
  emailText: { ...typography.small, color: '#A5B4FC', marginTop: 1, fontWeight: '700' },
  adminRoleTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  adminRoleText: { ...typography.tiny, color: '#EEF2FF', fontWeight: '800', fontSize: 10 },
  birth: { ...typography.small, color: '#A5B4FC', textAlign: 'center', lineHeight: 18, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    gap: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '600' },
  badgeValue: { ...typography.small, color: '#EEF2FF', fontWeight: '800', fontSize: 12 },

  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  walletLabel: { ...typography.small, color: '#A5B4FC', fontWeight: '700' },
  walletValue: { ...typography.display, fontSize: 30, color: '#FCD34D', marginTop: 2, fontWeight: '800' },
  walletSub: { ...typography.tiny, color: '#A5B4FC', marginTop: 3, fontWeight: '600' },
  walletIcon: { fontSize: 44, opacity: 0.85 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(129, 140, 248, 0.2)',
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
  },
  rowIcon: { fontSize: 16 },
  rowLabel: { ...typography.body, color: '#EEF2FF', flex: 1, fontWeight: '700' },
  rowValue: { ...typography.small, color: '#A5B4FC', maxWidth: 150, fontWeight: '600' },
  chevron: { fontSize: 22, color: '#818CF8', fontWeight: '600' },

  version: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  /* ─── Modal Styles (Option 10 Luminescent Liquid Glass) ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0E1225',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 140, 248, 0.2)',
  },
  modalTitle: {
    ...typography.h2,
    color: '#EEF2FF',
    fontWeight: '900',
    fontSize: 18,
  },
  modalSubtitle: {
    ...typography.tiny,
    color: '#A5B4FC',
    marginTop: 2,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(129, 140, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  modalCloseText: {
    color: '#EEF2FF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalScroll: {
    maxHeight: 520,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  modalSection: {
    gap: spacing.xs,
  },
  modalSectionTitle: {
    ...typography.h3,
    color: '#FCD34D',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  modalLabel: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
  },
  modalFieldMicro: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: '#EEF2FF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalNumInput: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 10,
    color: '#EEF2FF',
    fontSize: 14,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  avatarOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(26, 33, 64, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    borderColor: '#FCD34D',
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 2,
    transform: [{ scale: 1.08 }],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  selectedCityBanner: {
    backgroundColor: 'rgba(5, 150, 105, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 6,
  },
  selectedCityText: {
    ...typography.tiny,
    color: '#34D399',
    fontWeight: '700',
  },
  dropdown: {
    backgroundColor: '#131833',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    borderRadius: radius.md,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(129, 140, 248, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    ...typography.small,
    color: '#EEF2FF',
    fontWeight: '600',
  },
  dropdownItemCoords: {
    ...typography.tiny,
    color: '#A5B4FC',
    fontSize: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    ...typography.small,
    color: '#F87171',
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  successText: {
    ...typography.small,
    color: '#34D399',
    fontWeight: '800',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 140, 248, 0.2)',
  },
});
