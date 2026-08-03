import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../../src/theme';
import { astrologerById } from '../../src/data/astrologers';
import { useWalletStore } from '../../src/store/walletStore';
import { formatCurrency } from '../../src/utils';

export default function AstrologerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const astrologer = astrologerById(String(id));

  if (!astrologer) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScreenHeader title="Astrologer" showBack />
          <EmptyState
            icon="🔭"
            title="Astrologer not found"
            actionLabel="Back to list"
            onAction={() => router.replace('/(tabs)/consult')}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const minutesAffordable = Math.floor(balance / astrologer.pricePerMin);
  const canAfford = minutesAffordable >= 1;

  function startChat() {
    if (!astrologer) return;
    if (!canAfford) {
      router.push('/wallet');
      return;
    }
    router.push(`/chat/${astrologer.id}`);
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Astrologer" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero identity card */}
          <LinearGradient
            colors={['rgba(122,60,255,0.25)', 'rgba(194,75,255,0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.head}
          >
            {/* Online glow ring */}
            <View style={[styles.avatarRing, { borderColor: astrologer.online ? 'rgba(61,220,132,0.5)' : 'rgba(107,103,133,0.4)' }]}>
              <Avatar
                uri={astrologer.avatar}
                name={astrologer.name}
                size={88}
                online={astrologer.online}
                showStatus
              />
            </View>

            <Text style={styles.name}>{astrologer.name}</Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: astrologer.online ? colors.online : colors.offline },
                ]}
              />
              <Text style={[styles.statusText, { color: astrologer.online ? colors.online : colors.textMuted }]}>
                {astrologer.online ? 'Available now' : 'Currently offline'}
              </Text>
            </View>

            {/* Stats row */}
            <View style={styles.statRow}>
              {[
                { icon: '⭐', value: astrologer.rating.toFixed(1), label: `${(astrologer.reviews / 1000).toFixed(1)}k reviews` },
                { icon: '🎓', value: `${astrologer.experienceYears} yrs`, label: 'experience' },
                { icon: '💬', value: `${(astrologer.consultations / 1000).toFixed(0)}k`, label: 'consultations' },
              ].map(({ icon, value, label }) => (
                <View key={label} style={styles.stat}>
                  <Text style={styles.statIcon}>{icon}</Text>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* About */}
          <Card>
            <SectionHeader title="About" />
            <Text style={styles.about}>{astrologer.about}</Text>
          </Card>

          {/* Expertise */}
          <Card>
            <SectionHeader title="Expertise" />
            <View style={styles.chips}>
              {astrologer.specialties.map((s) => (
                <Chip key={s} label={s} tone="gold" />
              ))}
            </View>
            <Text style={[styles.subLabel, { marginTop: spacing.lg }]}>Languages</Text>
            <View style={styles.chips}>
              {astrologer.languages.map((l) => (
                <Chip key={l} label={l} tone="teal" />
              ))}
            </View>
          </Card>

          {/* Pricing */}
          <Card>
            <SectionHeader title="Consultation Rate" />
            <View style={styles.priceRow}>
              <LinearGradient
                colors={['rgba(245,197,66,0.18)', 'rgba(255,138,61,0.08)']}
                style={styles.priceBox}
              >
                <Text style={styles.price}>
                  {formatCurrency(astrologer.pricePerMin)}
                  <Text style={styles.perMin}> / min</Text>
                </Text>
                <Text style={styles.priceSub}>Billed per minute from your wallet</Text>
              </LinearGradient>
            </View>

            <View
              style={[
                styles.affordBox,
                !canAfford && styles.affordBoxDanger,
              ]}
            >
              <Text style={[styles.affordIcon, { color: canAfford ? colors.teal : colors.danger }]}>
                {canAfford ? '✓' : '!'}
              </Text>
              <Text style={[styles.affordText, !canAfford && { color: colors.danger }]}>
                {canAfford
                  ? `Your balance of ${formatCurrency(balance)} covers about ${minutesAffordable} minute${minutesAffordable === 1 ? '' : 's'}.`
                  : `Your balance of ${formatCurrency(balance)} is not enough. Add money to start.`}
              </Text>
            </View>
          </Card>

          <Text style={styles.mockNote}>
            This is a demonstration profile. Starting a chat opens a simulated consultation —
            replies are generated locally and no real astrologer is contacted.
          </Text>
        </ScrollView>

        {/* Sticky CTA */}
        <View style={styles.actions}>
          <LinearGradient
            colors={['rgba(11,6,32,0.0)', 'rgba(11,6,32,0.95)']}
            style={styles.actionsGradient}
          />
          <Button
            label={canAfford ? '💬 Chat now' : 'Add money'}
            variant={canAfford ? 'gold' : 'primary'}
            size="lg"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={startChat}
          />
          <Button
            label="📞 Call"
            variant="outline"
            size="lg"
            fullWidth={false}
            style={{ flex: 1 }}
            disabled={!astrologer.online}
            onPress={() => {
              if (Platform.OS === 'web' && typeof alert === 'function') {
                alert('Voice calls are not part of this MVP build. Use "Chat now" instead.');
              } else {
                router.push(`/chat/${astrologer.id}`);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },

  head: {
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(122,60,255,0.3)',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  avatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: { ...typography.h1, color: colors.text, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.small, fontWeight: '700' },

  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 3,
  },
  statIcon: { fontSize: 16 },
  statValue: { ...typography.h3, fontSize: 14, color: colors.goldSoft },
  statLabel: { ...typography.tiny, fontSize: 9.5, color: colors.textFaint },

  about: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  subLabel: { ...typography.tiny, color: colors.textFaint, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  priceRow: { marginBottom: spacing.md },
  priceBox: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.35)',
    overflow: 'hidden',
  },
  price: { ...typography.display, fontSize: 30, color: colors.gold },
  perMin: { ...typography.body, color: colors.textMuted, fontWeight: '600', fontSize: 16 },
  priceSub: { ...typography.tiny, color: colors.textFaint, marginTop: 4 },

  affordBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(56,225,195,0.4)',
    backgroundColor: 'rgba(56,225,195,0.08)',
    padding: spacing.md,
  },
  affordBoxDanger: {
    borderColor: 'rgba(255,90,110,0.4)',
    backgroundColor: 'rgba(255,90,110,0.08)',
  },
  affordIcon: { fontSize: 16, fontWeight: '800', marginTop: 1 },
  affordText: { ...typography.small, color: colors.teal, lineHeight: 18, flex: 1 },

  mockNote: { ...typography.tiny, color: colors.textFaint, textAlign: 'center', lineHeight: 15 },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: 'rgba(11,6,32,0.96)',
    position: 'relative',
  },
  actionsGradient: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    height: 32,
  },
});
