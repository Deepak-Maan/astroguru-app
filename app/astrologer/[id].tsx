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
            colors={['rgba(16,185,129,0.16)', 'rgba(245,158,11,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.head}
          >
            {/* Online glow ring */}
            <View style={[styles.avatarRing, { borderColor: astrologer.online ? 'rgba(16,185,129,0.60)' : 'rgba(100,116,139,0.40)' }]}>
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
                colors={['rgba(245,158,11,0.18)', 'rgba(16,185,129,0.06)']}
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

        {/* Sticky CTA with sleek medium buttons */}
        <View style={styles.actions}>
          <LinearGradient
            colors={['rgba(6,10,18,0.0)', 'rgba(6,10,18,0.96)']}
            style={styles.actionsGradient}
          />
          <Button
            label={canAfford ? '💬 Chat now' : 'Add money'}
            variant={canAfford ? 'gold' : 'primary'}
            size="md"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={startChat}
          />
          <Button
            label="📞 Call"
            variant="outline"
            size="md"
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
    borderColor: 'rgba(16,185,129,0.30)',
    backgroundColor: '#0E1726',
    padding: spacing.xl,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.60)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
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
  name: { ...typography.h1, color: colors.text, textAlign: 'center', fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.small, fontWeight: '700' },

  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(6,10,18,0.60)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    gap: 3,
  },
  statIcon: { fontSize: 16 },
  statValue: { ...typography.h3, fontSize: 14, color: colors.goldSoft, fontWeight: '800' },
  statLabel: { ...typography.tiny, fontSize: 9.5, color: colors.textFaint, fontWeight: '600' },

  about: { ...typography.body, color: colors.textMuted, lineHeight: 22, fontWeight: '600' },
  subLabel: { ...typography.tiny, color: colors.textFaint, marginBottom: spacing.sm, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  priceRow: { marginBottom: spacing.md },
  priceBox: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.40)',
    overflow: 'hidden',
  },
  price: { ...typography.display, fontSize: 30, color: colors.saffron, fontWeight: '900' },
  perMin: { ...typography.body, color: colors.textMuted, fontWeight: '600', fontSize: 16 },
  priceSub: { ...typography.tiny, color: colors.textFaint, marginTop: 4, fontWeight: '600' },

  affordBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.40)',
    backgroundColor: 'rgba(16,185,129,0.08)',
    padding: spacing.md,
  },
  affordBoxDanger: {
    borderColor: 'rgba(244,63,94,0.40)',
    backgroundColor: 'rgba(244,63,94,0.08)',
  },
  affordIcon: { fontSize: 16, fontWeight: '800', marginTop: 1 },
  affordText: { ...typography.small, color: colors.teal, lineHeight: 18, flex: 1, fontWeight: '600' },

  mockNote: { ...typography.tiny, color: colors.textFaint, textAlign: 'center', lineHeight: 15 },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16,185,129,0.25)',
    backgroundColor: 'rgba(6,10,18,0.96)',
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
