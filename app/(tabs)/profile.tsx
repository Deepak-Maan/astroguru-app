import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useUserStore } from '../../src/store/userStore';
import { useAuthStore } from '../../src/store/authStore';
import { useWalletStore } from '../../src/store/walletStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import { useUpdateStore } from '../../src/store/updateStore';
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';
import { formatCurrency } from '../../src/utils';
import { useLiveChatStore } from '../../src/store/liveChatStore';

function AcharyaLiveQueue({ astrologerId }: { astrologerId: string }) {
  const router = useRouter();
  const roomsMap = useLiveChatStore((s) => s.rooms);
  const acceptRoom = useLiveChatStore((s) => s.acceptRoom);

  const activeRooms = Object.values(roomsMap).filter(
    (r) => r && (r.astrologerId === astrologerId || r.astrologerId === 'astro-1' || true) && r.status !== 'ended'
  );

  if (activeRooms.length === 0) {
    return (
      <Card padded style={{ backgroundColor: '#F0FDF4', borderColor: 'rgba(5,150,105,0.3)', borderWidth: 1 }}>
        <Text style={{ ...typography.tiny, color: colors.teal, fontWeight: '800' }}>🟢 DUTY STATUS: ONLINE & READY</Text>
        <Text style={{ ...typography.body, color: colors.text, fontWeight: '700', marginTop: 4 }}>
          No pending chat requests right now. When a seeker initiates a consultation, it will pop up here in real time!
        </Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <SectionHeader title="🔴 Live Consultation Requests" />
      {activeRooms.map((room) => (
        <Card key={room.roomId} padded style={{ backgroundColor: '#FFFBEB', borderColor: colors.gold, borderWidth: 1.5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...typography.tiny, color: colors.goldSoft, fontWeight: '900' }}>
                {room.status === 'waiting' ? '⏳ PENDING REQUEST' : '💬 ACTIVE SESSION'}
              </Text>
              <Text style={{ ...typography.h3, color: colors.text, fontWeight: '900' }}>
                {room.seekerName}
              </Text>
              <Text style={{ ...typography.small, color: colors.textMuted, fontWeight: '600' }} numberOfLines={1}>
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
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.65 }]}
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

import { AnimatedAuthOverlay } from '../../src/components/AnimatedAuthOverlay';

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
  const checkUpdatesManual = useUpdateStore((s) => s.checkUpdatesManual);
  const isCheckingUpdates = useUpdateStore((s) => s.isChecking);
  const manualCheckMessage = useUpdateStore((s) => s.manualCheckMessage);

  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

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
          message={`Signing out ${authUser?.name || 'user'} safely... ✨`}
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
                  <Row icon="🪪" label="Govt ID & Watermark KYC Vault" onPress={() => router.push('/acharya/kyc-verification')} accent={colors.teal} />
                  <Row icon="📋" label="Manage Consultation Profile" onPress={() => router.push('/acharya/consultation-profile')} />
                  <Row icon="📜" label="Certifications & Degrees" onPress={() => router.push('/acharya/certifications')} />
                  <Row icon="💬" label="Client Reviews & Testimonials" onPress={() => router.push('/acharya/reviews')} />
                  <Row icon="📣" label="Broadcast Announcement to Clients" onPress={() => router.push('/acharya/broadcast')} />
                  <Row icon="📅" label="Set Availability Schedule" onPress={() => router.push('/acharya/availability')} />
                  <Row icon="🎓" label="Acharya Training & Resources" onPress={() => router.push('/acharya/training')} accent={colors.gold} />
                </Card>
              </View>

              {/* Platform Tools */}
              <View>
                <SectionHeader title="⚙️ Account & Settings" />
                <Card padded={false}>
                  <Row icon="🏦" label="Bank Account & UPI Settings" onPress={() => router.push('/acharya/bank-settings')} />
                  <Row icon="📊" label="Monthly Earnings Report" onPress={() => router.push('/acharya/earnings-report')} />
                  <Row icon="🔒" label="Security & Privacy Vault" onPress={() => router.push('/acharya/security')} />
                  <Row icon="🛡️" label="Anti-Hacking & Cyber Defense" onPress={() => router.push('/acharya/anti-hacking-hub')} accent={colors.teal} />
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
                <Avatar name={authUser?.name ?? profile?.name ?? 'Seeker'} size={80} />
                <Text style={styles.name}>{authUser?.name ?? profile?.name ?? 'Seeker'}</Text>
                <Text style={styles.emailText}>{authUser?.email ?? 'seeker@astroguru.app'}</Text>

                {authUser?.role === 'admin' && (
                  <View style={styles.adminRoleTag}>
                    <Text style={styles.adminRoleText}>⚡ PLATFORM ADMIN</Text>
                  </View>
                )}

                {isVip && (
                  <View style={[styles.adminRoleTag, { borderColor: colors.gold, backgroundColor: 'rgba(217,119,6,0.12)' }]}>
                    <Text style={[styles.adminRoleText, { color: colors.gold }]}>
                      👑 VIP PASS · {vipPlanId?.toUpperCase()} · Expires {vipExpires}
                    </Text>
                  </View>
                )}

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

                <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.md, width: '100%' }}>
                  <Pressable
                    onPress={() => router.push('/edit-profile')}
                    style={({ pressed }) => [styles.editProfileBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
                  >
                    <LinearGradient
                      colors={[colors.saffron, colors.gold]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.editProfileBtnText}>✏️ Edit Profile & Kundli</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(profile ? '/(tabs)/kundli' : '/(onboarding)/birth-details')}
                    style={styles.viewKundliBtn}
                  >
                    <Text style={styles.viewKundliBtnText}>🪐 Chart</Text>
                  </Pressable>
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
                  <Row icon="🌌" label="Live Satsang & Virtual Prashad" onPress={() => router.push('/satsang')} accent={colors.gold} />
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
                  <Row icon="✏️" label="Edit Profile & Birth Details" onPress={() => router.push('/edit-profile')} accent={colors.teal} />
                  <Row icon="🪪" label="Govt ID & Watermark KYC Vault" onPress={() => router.push('/acharya/kyc-verification')} accent={colors.teal} />
                  <Row icon="🚀" label={`Upgrade / Update App (v${currentVersion})`} onPress={() => triggerUpdateModal()} accent={colors.teal} />
                  <Row icon="👑" label={isVip ? `AstroVIP — ${vipPlanId} (Active)` : 'Get AstroVIP Pass'} onPress={() => router.push('/vip')} accent={colors.gold} />
                  <Row icon="📄" label="10-Page Kundli PDF Export" onPress={() => router.push('/kundli-pdf')} />
                  <Row
                    icon="🔄"
                    label={isCheckingUpdates ? 'Checking GitHub for updates…' : `Check for In-App Updates · v${currentVersion}`}
                    onPress={checkUpdatesManual}
                    accent={colors.teal}
                  />
                  <Row icon="⚙️" label="Settings & Security Vault" onPress={() => router.push('/settings')} />
                  <Row icon="🚪" label="Sign Out" onPress={handleSignOut} accent={colors.danger} />
                </Card>

                {!!manualCheckMessage && (
                  <View style={{ backgroundColor: '#ECFDF5', borderWidth: 1.2, borderColor: '#A7F3D0', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12.5, fontWeight: '800', color: '#065F46' }}>{manualCheckMessage}</Text>
                  </View>
                )}
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

              <Text style={styles.version}>AstroGuru · v2.8.3 · Signed in as {authUser?.email ?? 'Seeker'}</Text>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },

  identityCard: {
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    backdropFilter: 'blur(20px) saturate(180%)' as any,
  },
  name: { ...typography.h1, color: '#0F172A', marginTop: spacing.sm, textAlign: 'center', fontWeight: '800' },
  emailText: { ...typography.small, color: '#B8902A', marginTop: 1, fontWeight: '700' },
  adminRoleTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  adminRoleText: { ...typography.tiny, color: '#0D9488', fontWeight: '800', fontSize: 10 },
  birth: { ...typography.small, color: '#475569', textAlign: 'center', lineHeight: 18, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 3,
  },
  badgeLabel: { ...typography.tiny, color: '#64748B', fontWeight: '600' },
  badgeValue: { ...typography.small, color: '#B8902A', fontWeight: '800', fontSize: 12 },

  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  adminBannerIcon: { fontSize: 24 },
  adminBannerTitle: { ...typography.h3, color: '#0F172A', fontWeight: '800' },
  adminBannerSub: { ...typography.tiny, color: '#334155', marginTop: 1 },
  adminBannerArrow: { fontSize: 24, color: '#0F172A', fontWeight: '800' },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    backdropFilter: 'blur(20px) saturate(180%)' as any,
  },
  walletLabel: { ...typography.small, color: '#64748B', fontWeight: '700' },
  walletValue: { ...typography.display, fontSize: 30, color: '#B8902A', marginTop: 2, fontWeight: '800' },
  walletSub: { ...typography.tiny, color: '#64748B', marginTop: 3, fontWeight: '600' },
  walletIcon: { fontSize: 44, opacity: 0.85 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(212, 175, 55, 0.15)',
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  rowIcon: { fontSize: 16 },
  rowLabel: { ...typography.body, color: '#0F172A', flex: 1, fontWeight: '700' },
  rowValue: { ...typography.small, color: '#475569', maxWidth: 150, fontWeight: '600' },
  chevron: { fontSize: 22, color: '#94A3B8', fontWeight: '600' },

  version: {
    ...typography.tiny,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  editProfileBtn: {
    flex: 2,
    height: 42,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  viewKundliBtn: {
    flex: 1,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  viewKundliBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B8902A',
  },
});
