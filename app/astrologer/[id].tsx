import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
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
import { colors, radius, spacing, typography } from '../../src/theme';
import { astrologerById } from '../../src/data/astrologers';
import { useWalletStore } from '../../src/store/walletStore';
import { formatCurrency } from '../../src/utils';
import { getAstrologerByIdFromFirebase } from '../../src/services/firebaseAuthService';
import { Astrologer } from '../../src/types';

export default function AstrologerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const balance = useWalletStore((s) => s.balance);
  const [astrologer, setAstrologer] = useState<Astrologer | null>(() => astrologerById(String(id)) || null);
  const [loading, setLoading] = useState(!astrologer);

  useEffect(() => {
    if (id && !astrologer) {
      getAstrologerByIdFromFirebase(String(id)).then((data) => {
        if (data) {
          setAstrologer(data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

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
        <ScreenHeader title="Astrologer Profile" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Compact Hero Identity Card — Nordic Frost Light & Emerald Teal */}
          <View style={styles.head}>
            <LinearGradient
              colors={['#FFFFFF', '#F0FDF4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Online glow ring */}
            <View
              style={[
                styles.avatarRing,
                { borderColor: astrologer.online ? colors.teal : colors.textFaint },
              ]}
            >
              <Avatar
                uri={astrologer.avatar}
                name={astrologer.name}
                size={58}
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
              <Text
                style={[
                  styles.statusText,
                  { color: astrologer.online ? colors.online : colors.textMuted },
                ]}
              >
                {astrologer.online ? 'Available now' : 'Currently offline'}
              </Text>
            </View>

            {/* Compact Stats Grid */}
            <View style={styles.statRow}>
              {[
                {
                  icon: '⭐',
                  value: astrologer.rating.toFixed(1),
                  label: `${(astrologer.reviews / 1000).toFixed(1)}k reviews`,
                },
                { icon: '🎓', value: `${astrologer.experienceYears} yrs`, label: 'experience' },
                {
                  icon: '💬',
                  value: `${(astrologer.consultations / 1000).toFixed(0)}k`,
                  label: 'consultations',
                },
              ].map(({ icon, value, label }) => (
                <View key={label} style={styles.stat}>
                  <Text style={styles.statIcon}>{icon}</Text>
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About */}
          <Card padded={false} style={styles.compactCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.about}>{astrologer.about}</Text>
          </Card>

          {/* Expertise */}
          <Card padded={false} style={styles.compactCard}>
            <Text style={styles.sectionTitle}>Expertise</Text>
            <View style={styles.chips}>
              {astrologer.specialties.map((s) => (
                <Chip key={s} label={s} tone="gold" />
              ))}
            </View>
            <Text style={styles.subLabel}>Languages</Text>
            <View style={styles.chips}>
              {astrologer.languages.map((l) => (
                <Chip key={l} label={l} tone="teal" />
              ))}
            </View>
          </Card>

          {/* Pricing */}
          <Card padded={false} style={styles.compactCard}>
            <Text style={styles.sectionTitle}>Consultation Rate</Text>
            <View style={styles.priceRow}>
              <LinearGradient
                colors={['rgba(245,158,11,0.10)', 'rgba(217,119,6,0.03)']}
                style={styles.priceBox}
              >
                <Text style={styles.price}>
                  {formatCurrency(astrologer.pricePerMin)}
                  <Text style={styles.perMin}> / min</Text>
                </Text>
                <Text style={styles.priceSub}>Billed per minute from your wallet balance</Text>
              </LinearGradient>
            </View>

            <View style={[styles.affordBox, !canAfford && styles.affordBoxDanger]}>
              <Text style={[styles.affordIcon, { color: canAfford ? colors.teal : colors.danger }]}>
                {canAfford ? '✓' : '!'}
              </Text>
              <Text style={[styles.affordText, !canAfford && { color: colors.danger }]}>
                {canAfford
                  ? `Your balance of ${formatCurrency(balance)} covers about ${minutesAffordable} minute${
                      minutesAffordable === 1 ? '' : 's'
                    }.`
                  : `Your balance of ${formatCurrency(balance)} is not enough. Add money to start.`}
              </Text>
            </View>
          </Card>
        </ScrollView>

        {/* Compact Sticky Action Bar */}
        <View style={styles.actions}>
          <LinearGradient
            colors={['rgba(239,246,255,0.0)', 'rgba(255,255,255,0.98)']}
            style={styles.actionsGradient}
          />
          <Pressable
            onPress={() => router.push(`/consultation/${astrologer.id}?type=audio`)}
            style={({ pressed }) => [styles.mediaCallBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={{ fontSize: 15 }}>📞</Text>
            <Text style={styles.mediaCallText}>Audio</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(`/consultation/${astrologer.id}?type=video`)}
            style={({ pressed }) => [
              styles.mediaCallBtn,
              { borderColor: colors.teal, backgroundColor: 'rgba(5,150,105,0.12)' },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={{ fontSize: 15 }}>📹</Text>
            <Text style={[styles.mediaCallText, { color: colors.teal }]}>Video</Text>
          </Pressable>

          <Button
            label={canAfford ? '💬 Chat' : 'Add Money'}
            variant={canAfford ? 'gold' : 'primary'}
            size="md"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={startChat}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: 8 },

  head: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.80)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 1,
    overflow: 'hidden',
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    ...typography.h2,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 17,
    marginTop: 1,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { ...typography.tiny, fontWeight: '800', fontSize: 11.5 },

  statRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191,219,254,0.80)',
    gap: 1,
  },
  statIcon: { fontSize: 13 },
  statValue: { ...typography.h3, fontSize: 13, color: colors.goldSoft, fontWeight: '900' },
  statLabel: { ...typography.tiny, fontSize: 9, color: colors.textMuted, fontWeight: '700' },

  compactCard: { paddingHorizontal: 12, paddingVertical: 10 },
  sectionTitle: { ...typography.h3, fontSize: 14.5, color: '#0F172A', fontWeight: '900', marginBottom: 5 },

  about: { ...typography.body, color: colors.textMuted, lineHeight: 18, fontWeight: '600', fontSize: 13 },
  subLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 8, marginBottom: 4, fontWeight: '800', fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },

  priceRow: { marginBottom: 6 },
  priceBox: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.30)',
    overflow: 'hidden',
  },
  price: { ...typography.display, fontSize: 22, color: colors.saffron, fontWeight: '900' },
  perMin: { ...typography.body, color: colors.textMuted, fontWeight: '700', fontSize: 13.5 },
  priceSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600', fontSize: 10.5 },

  affordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(5,150,105,0.30)',
    backgroundColor: 'rgba(5,150,105,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  affordBoxDanger: {
    borderColor: 'rgba(225,29,72,0.30)',
    backgroundColor: 'rgba(225,29,72,0.08)',
  },
  affordIcon: { fontSize: 13, fontWeight: '900' },
  affordText: { ...typography.small, color: colors.teal, lineHeight: 15, flex: 1, fontWeight: '700', fontSize: 11.5 },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(203,213,225,0.80)',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: 'rgba(15,23,42,0.10)',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  mediaCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  mediaCallText: {
    color: colors.goldSoft,
    fontSize: 12.5,
    fontWeight: '900',
  },
  actionsGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
});
