import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { ASTROLOGERS } from '../src/data/astrologers';
import { formatCurrency } from '../src/utils';

export default function InstantConsultScreen() {
  const router = useRouter();
  const [inQueue, setInQueue] = useState(false);
  const [queueToken, setQueueToken] = useState<number | null>(null);
  const [selectedAstrologer, setSelectedAstrologer] = useState(ASTROLOGERS[0]);

  const joinQueue = () => {
    setInQueue(true);
    setQueueToken(Math.floor(Math.random() * 3) + 1);
  };

  const cancelQueue = () => {
    setInQueue(false);
    setQueueToken(null);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader title="Instant Consultation Queue" subtitle="Priority Audio & Video Calls" showBack showWallet />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Live Queue Status Banner */}
          {inQueue ? (
            <Card style={styles.queueActiveCard}>
              <View style={styles.queueHeader}>
                <Text style={{ fontSize: 36 }}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.queueStatusTitle}>IN LIVE CONSULTATION QUEUE</Text>
                  <Text style={styles.queueTokenText}>Queue Position: #{queueToken} in line</Text>
                </View>
                <Chip label="Estimated wait ~2 mins" tone="gold" />
              </View>

              <Text style={styles.queueInstruction}>
                Your astrologer <Text style={{ color: colors.saffron, fontWeight: '800' }}>{selectedAstrologer.name}</Text> will connect automatically. Keep your app open!
              </Text>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label="📞 Launch Call Now"
                  variant="gold"
                  size="md"
                  onPress={() => router.push(`/chat/${selectedAstrologer.id}`)}
                  style={{ flex: 1 }}
                />
                <Button label="Cancel Queue" variant="outline" size="md" onPress={cancelQueue} style={{ flex: 1 }} />
              </View>
            </Card>
          ) : (
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.heroBanner}
            >
              <Text style={{ fontSize: 32 }}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Instant 1-on-1 Consultation</Text>
                <Text style={styles.heroSub}>
                  No appointment needed. Connect with top verified Vedic Jyotishis in under 60 seconds.
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Select Instant Astrologer */}
          <SectionHeader title="Available Experts for Instant Call" subtitle="Verified · 100% Confidential" />

          {ASTROLOGERS.filter((a) => a.online).map((astro) => (
            <Pressable
              key={astro.id}
              onPress={() => setSelectedAstrologer(astro)}
              style={({ pressed }) => [
                styles.astroCard,
                selectedAstrologer.id === astro.id && styles.astroCardSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Image source={{ uri: astro.avatar }} style={styles.astroAvatar} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.astroName}>{astro.name}</Text>
                  <Chip label={`⭐ ${astro.rating.toFixed(1)}`} tone="gold" />
                </View>

                <Text style={styles.astroSpecs}>{astro.specialties.slice(0, 2).join(' · ')}</Text>
                <Text style={styles.astroPrice}>{formatCurrency(astro.pricePerMin)}/min</Text>
              </View>
            </Pressable>
          ))}

          {!inQueue && (
            <Button
              label={`⚡ Join Priority Queue (${selectedAstrologer.name})`}
              variant="gold"
              size="lg"
              onPress={joinQueue}
              style={{ marginTop: spacing.md }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.30)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTitle: { ...typography.h2, color: colors.text, fontSize: 18, fontWeight: '800' },
  heroSub: { ...typography.small, color: colors.textMuted, marginTop: 2, lineHeight: 18 },

  queueActiveCard: { gap: spacing.md },
  queueHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  queueStatusTitle: { ...typography.tiny, color: colors.saffron, fontWeight: '800', letterSpacing: 1 },
  queueTokenText: { ...typography.h2, color: colors.text, fontSize: 18, fontWeight: '800' },
  queueInstruction: { ...typography.small, color: colors.textMuted, lineHeight: 20 },

  astroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    shadowColor: 'rgba(160,175,205,0.25)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  astroCardSelected: { borderColor: colors.saffron, borderWidth: 2 },
  astroAvatar: { width: 56, height: 56, borderRadius: 28 },
  astroName: { ...typography.h3, color: colors.text, fontSize: 16, fontWeight: '800' },
  astroSpecs: { ...typography.tiny, color: colors.auroraA, fontWeight: '700' },
  astroPrice: { ...typography.h3, color: colors.saffron, fontSize: 15, fontWeight: '800', marginTop: 2 },
});
