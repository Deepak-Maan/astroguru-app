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
          <ActivityIndicator size="large" color={colors.primary} />
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
          {/* Compact Hero Identity Card — Claymorphism 3D */}
          <View style={styles.head}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F3FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Online glow ring */}
            <View
              style={[
                styles.avatarRing,
                { borderColor: astrologer.online ? colors.primary : colors.textFaint },
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
                <Chip key={s} label={s} tone="rose" />
              ))}
            </View>
            <Text style={styles.subLabel}>Languages</Text>
            <View style={styles.chips}>
              {astrologer.languages.map((l) => (
                <Chip key={l} label={l} tone="default" />
              ))}
            </View>
          </Card>

          {/* Pricing */}
          <Card padded={false} style={styles.compactCard}>
            <Text style={styles.sectionTitle}>Consultation Rate</Text>
            <View style={styles.priceRow}>
              <LinearGradient
                colors={['rgba(124,58,237,0.08)', 'rgba(124,58,237,0.02)']}
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
            style={({ pressed }) => [styles.mediaCallBtn, pressed && { transform: [{ translateY: 1.5 }], opacity: 0.85 }]}
          >
            <Text style={{ fontSize: 15 }}>📞</Text>
            <Text style={styles.mediaCallText}>Audio</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(`/consultation/${astrologer.id}?type=video`)}
            style={({ pressed }) => [
              styles.mediaCallBtn,
              { borderColor: '#DDD6FE', backgroundColor: '#EDE9FE' },
              pressed && { transform: [{ translateY: 1.5 }], opacity: 0.85 },
            ]}
          >
            <Text style={{ fontSize: 15 }}>📹</Text>
            <Text style={[styles.mediaCallText, { color: colors.primary }]}>Video</Text>
          </Pressable>

          <Button
            label={canAfford ? '💬 Chat' : 'Add Money'}
            variant={canAfford ? 'coral' : 'primary'}
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
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: 10 },

  head: {
    alignItems: 'center',
    borderRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 3.5,
    borderRightWidth: 1.5,
    borderBottomColor: '#DDD6FE',
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: 1,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  name: {
    ...typography.h2,
    color: '#0F172A',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 18,
    marginTop: 2,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { ...typography.tiny, fontWeight: '800', fontSize: 11.5 },

  statRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderRightWidth: 1,
    borderBottomColor: '#DDD6FE',
    borderRightColor: '#E2E8F0',
    gap: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: { fontSize: 13 },
  statValue: { ...typography.h3, fontSize: 13.5, color: '#7C3AED', fontWeight: '900' },
  statLabel: { ...typography.tiny, fontSize: 9.5, color: colors.textMuted, fontWeight: '700' },

  compactCard: { paddingHorizontal: 16, paddingVertical: 14 },
  sectionTitle: { ...typography.h3, fontSize: 15, color: '#0F172A', fontWeight: '900', marginBottom: 6 },

  about: { ...typography.body, color: colors.textMuted, lineHeight: 18, fontWeight: '600', fontSize: 13 },
  subLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 10, marginBottom: 4, fontWeight: '800', fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  priceRow: { marginBottom: 6 },
  priceBox: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderRightWidth: 1,
    borderBottomColor: '#DDD6FE',
    borderRightColor: '#E2E8F0',
    backgroundColor: '#EDE9FE',
    overflow: 'hidden',
  },
  price: { ...typography.display, fontSize: 24, color: '#7C3AED', fontWeight: '900' },
  perMin: { ...typography.body, color: colors.textMuted, fontWeight: '700', fontSize: 13.5 },
  priceSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600', fontSize: 11 },

  affordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#DDD6FE',
    borderBottomWidth: 2.5,
    borderBottomColor: '#C4B5FD',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  affordBoxDanger: {
    borderColor: '#FECDD3',
    borderBottomColor: '#FDA4AF',
    backgroundColor: '#FFF1F2',
  },
  affordIcon: { fontSize: 13, fontWeight: '900' },
  affordText: { ...typography.small, color: '#7C3AED', lineHeight: 15, flex: 1, fontWeight: '700', fontSize: 11.5 },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#DDD6FE',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  mediaCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderRightWidth: 1,
    borderBottomColor: '#DDD6FE',
    borderRightColor: '#E2E8F0',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  mediaCallText: {
    color: '#7C3AED',
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
