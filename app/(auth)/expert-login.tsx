import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { ApiClient } from '../../src/services/apiClient';

export default function ExpertLoginScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExpertLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid expert email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await ApiClient.expertLogin(email, password);
    setLoading(false);

    if (res && res.success && res.expert) {
      setUserSession({
        id: res.expert.id,
        name: res.expert.name,
        email: res.expert.email,
        phone: res.expert.phone || '',
        role: 'astrologer',
        createdAt: new Date().toISOString().split('T')[0],
      });
      router.replace('/(tabs)');
    } else {
      setError(res?.error || 'Expert sign in failed. Please check credentials.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.webWrapper}>
              <View style={styles.hero}>
                <View style={styles.logoOuterRing}>
                  <LinearGradient
                    colors={[colors.auroraA, colors.saffron]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.logoInnerCircle}>
                    <Text style={{ fontSize: 32 }}>👑</Text>
                  </View>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>👑 EXPERT JYOTISHI PORTAL</Text>
                </View>
                <Text style={styles.brandTitle}>Astrologer Sign In</Text>
                <Text style={styles.brandSubtitle}>Manage your live consultations, client chats & earnings</Text>
              </View>

              <Card elevated padded={false} style={styles.card}>
                <View style={styles.cardBody}>
                  <View style={styles.field}>
                    <Text style={styles.label}>EXPERT EMAIL ADDRESS</Text>
                    <TextInput
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(null); }}
                      placeholder="acharya@astroguru.app"
                      placeholderTextColor={colors.textFaint}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={styles.passwordWrap}>
                      <TextInput
                        value={password}
                        onChangeText={(t) => { setPassword(t); setError(null); }}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textFaint}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { flex: 1, paddingRight: 44 }]}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🙈'}</Text>
                      </Pressable>
                    </View>
                  </View>

                  {!!error && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                  )}

                  <Button
                    label={loading ? 'Authenticating Expert…' : '👑 Sign In as Expert'}
                    variant="gold"
                    size="lg"
                    loading={loading}
                    onPress={handleExpertLogin}
                    style={{ marginTop: spacing.xs }}
                  />
                </View>
              </Card>

              <View style={styles.footerContainer}>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>New Expert?</Text>
                  <Pressable onPress={() => router.push('/(auth)/expert-signup')}>
                    <Text style={styles.footerLink}>Register as Astrologer</Text>
                  </Pressable>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Seeking Consultation?</Text>
                  <Pressable onPress={() => router.push('/(auth)/login')}>
                    <Text style={[styles.footerLink, { color: colors.auroraA }]}>User Sign In →</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.xl, flexGrow: 1, justifyContent: 'center' },
  webWrapper: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  logoOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInnerCircle: { width: '100%', height: '100%', borderRadius: 36, backgroundColor: '#070D18', alignItems: 'center', justifyContent: 'center' },
  badgePill: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: 2,
  },
  badgeText: { ...typography.tiny, color: colors.goldSoft, fontWeight: '800', letterSpacing: 0.8 },
  brandTitle: { ...typography.display, fontSize: 30, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
  card: {
    borderRadius: radius.lg,
    backgroundColor: '#0D1524',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBody: { padding: spacing.xl, gap: spacing.md },
  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.6 },
  input: {
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  passwordWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12, padding: 6 },
  errorBox: {
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },
  footerContainer: { gap: spacing.xs, alignItems: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.goldSoft, fontWeight: '800' },
});

