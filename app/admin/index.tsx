import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Button } from '../../src/components/Button';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function AdminWebRedirectScreen() {
  const router = useRouter();

  const handleOpenWebAdmin = () => {
    Linking.openURL('https://admin.astroguru.app').catch(() => {
      // Fallback to localhost if external link unavailable
      Linking.openURL('http://localhost:3000');
    });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.15)']}
              style={styles.iconCircle}
            >
              <Text style={styles.icon}>🖥️</Text>
            </LinearGradient>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>MIGRATED TO DESKTOP WEB</Text>
            </View>

            <Text style={styles.title}>AstroGuru Admin Portal</Text>

            <Text style={styles.description}>
              Administrative controls, cybersecurity watchtowers, astrologer verification,
              and business intelligence have moved to the dedicated Desktop Web Dashboard.
            </Text>

            <View style={styles.urlBox}>
              <Text style={styles.urlLabel}>ADMIN WEB PORTAL URL</Text>
              <Text style={styles.urlText}>https://admin.astroguru.app</Text>
              <Text style={styles.urlSub}>Local Development: http://localhost:3000</Text>
            </View>

            <View style={styles.actions}>
              <Button
                label="Launch Web Admin in Browser 🚀"
                variant="primary"
                size="lg"
                onPress={handleOpenWebAdmin}
                style={styles.primaryBtn}
              />

              <Pressable
                onPress={() => router.replace('/(tabs)')}
                style={styles.backBtn}
              >
                <Text style={styles.backBtnText}>← Return to AstroGuru App</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(26, 33, 64, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.5)',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 38,
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.5)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.tiny,
    color: '#EEF2FF',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.h1,
    color: '#EEF2FF',
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: '#A5B4FC',
    textAlign: 'center',
    lineHeight: 22,
  },
  urlBox: {
    width: '100%',
    backgroundColor: 'rgba(10, 12, 22, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    marginVertical: spacing.xs,
  },
  urlLabel: {
    ...typography.tiny,
    color: '#818CF8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  urlText: {
    ...typography.h3,
    color: '#FCD34D',
    fontWeight: '800',
  },
  urlSub: {
    ...typography.tiny,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    width: '100%',
  },
  backBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  backBtnText: {
    ...typography.small,
    color: '#A5B4FC',
    fontWeight: '600',
  },
});
