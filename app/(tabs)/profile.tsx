import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { RASHIS } from '../../src/data/rashis';
import { NAKSHATRAS } from '../../src/data/nakshatras';
import { formatCurrency } from '../../src/utils';

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

export default function Profile() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const kundli = useUserStore((s) => s.kundli);
  const clear = useUserStore((s) => s.clear);
  const balance = useWalletStore((s) => s.balance);

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isVip = useSubscriptionStore((s) => s.isVip);
  const vipPlanId = useSubscriptionStore((s) => s.planId);
  const vipExpires = useSubscriptionStore((s) => s.expiresAt);

  const handleSignOut = () => {
    logout();
    router.replace('/(auth)/login');
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
        <ScreenHeader title="Profile & Account" />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Identity hero */}
          <View style={styles.identityCard}>
            <LinearGradient
              colors={['rgba(125,60,152,0.06)', 'rgba(230,126,34,0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Avatar name={authUser?.name ?? profile?.name ?? 'Seeker'} size={80} />
            <Text style={styles.name}>{authUser?.name ?? profile?.name ?? 'Seeker'}</Text>
            <Text style={styles.emailText}>{authUser?.email ?? 'seeker@astroguru.app'}</Text>

            {authUser?.role === 'admin' && (
              <View style={styles.adminRoleTag}>
                <Text style={styles.adminRoleText}>⚡ PLATFORM ADMIN</Text>
              </View>
            )}

            {isVip && (
              <View style={[styles.adminRoleTag, { borderColor: colors.saffron, backgroundColor: 'rgba(230,126,34,0.12)' }]}>
                <Text style={[styles.adminRoleText, { color: colors.saffron }]}>
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

            <Button
              label={profile ? 'Edit birth details' : 'Add birth details'}
              variant="outline"
              size="sm"
              style={{ marginTop: spacing.lg }}
              onPress={() => router.push('/(onboarding)/birth-details')}
            />
          </View>

          {/* Admin Control Panel Button (for Admin roles) */}
          {authUser?.role === 'admin' && (
            <Pressable onPress={() => router.push('/admin')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <LinearGradient
                colors={['#7D3C98', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.adminBanner}
              >
                <Text style={styles.adminBannerIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adminBannerTitle}>Admin Control Panel</Text>
                  <Text style={styles.adminBannerSub}>Manage experts, revenue, stats & platform settings</Text>
                </View>
                <Text style={styles.adminBannerArrow}>›</Text>
              </LinearGradient>
            </Pressable>
          )}

          {/* Wallet snapshot */}
          <Pressable onPress={() => router.push('/wallet')} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
            <View style={styles.walletCard}>
              <LinearGradient
                colors={['rgba(230,126,34,0.12)', 'rgba(212,172,13,0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
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
              <Row icon="🌌" label="Live Satsang & Virtual Prashad" onPress={() => router.push('/satsang')} accent={colors.saffron} />
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
              <Row icon="👑" label={isVip ? `AstroVIP — ${vipPlanId} (Active)` : 'Get AstroVIP Pass'} onPress={() => router.push('/vip')} accent={colors.saffron} />
              <Row icon="📄" label="10-Page Kundli PDF Export" onPress={() => router.push('/kundli-pdf')} />
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

          <Text style={styles.version}>AstroGuru · v1.2.0 · Signed in as {authUser?.email ?? 'Seeker'}</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },

  identityCard: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  name: { ...typography.h1, color: colors.text, marginTop: spacing.sm, textAlign: 'center', fontWeight: '800' },
  emailText: { ...typography.small, color: colors.saffron, marginTop: 1, fontWeight: '700' },
  adminRoleTag: {
    backgroundColor: 'rgba(230,126,34,0.12)',
    borderWidth: 1,
    borderColor: colors.saffron,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  adminRoleText: { ...typography.tiny, color: colors.saffron, fontWeight: '800', fontSize: 10 },
  birth: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 4, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignSelf: 'stretch' },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: 3,
  },
  badgeLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '600' },
  badgeValue: { ...typography.small, color: colors.auroraA, fontWeight: '800', fontSize: 12 },

  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: 'rgba(125,60,152,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  adminBannerIcon: { fontSize: 24 },
  adminBannerTitle: { ...typography.h3, color: '#FFFFFF', fontWeight: '800' },
  adminBannerSub: { ...typography.tiny, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  adminBannerArrow: { fontSize: 24, color: '#FFFFFF', fontWeight: '800' },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  walletLabel: { ...typography.small, color: colors.textMuted, fontWeight: '700' },
  walletValue: { ...typography.display, fontSize: 30, color: colors.saffron, marginTop: 2, fontWeight: '800' },
  walletSub: { ...typography.tiny, color: colors.textFaint, marginTop: 3, fontWeight: '600' },
  walletIcon: { fontSize: 44, opacity: 0.85 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E8F3',
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E8F3',
  },
  rowIcon: { fontSize: 16 },
  rowLabel: { ...typography.body, color: colors.text, flex: 1, fontWeight: '700' },
  rowValue: { ...typography.small, color: colors.textMuted, maxWidth: 150, fontWeight: '600' },
  chevron: { fontSize: 22, color: colors.textFaint, fontWeight: '600' },

  version: {
    ...typography.tiny,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
