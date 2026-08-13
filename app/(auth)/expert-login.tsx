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
import { firebaseExpertLogin } from '../../src/services/firebaseAuthService';

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

    // 1️⃣ Firebase Expert Login (works worldwide, no server needed)
    try {
      const fbRes = await firebaseExpertLogin(email.trim().toLowerCase(), password);
      if (fbRes.success && fbRes.expert) {
        setUserSession({
          id: fbRes.expert.id,
          name: fbRes.expert.name,
          email: fbRes.expert.email,
          phone: fbRes.expert.phone || '',
          role: 'astrologer',
          createdAt: fbRes.expert.createdAt || new Date().toISOString().split('T')[0],
        });
        setLoading(false);
        router.replace('/(tabs)');
        return;
      }
      if (fbRes.error && !fbRes.error.toLowerCase().includes('network')) {
        setLoading(false);
        setError(fbRes.error);
        return;
      }
    } catch (e) {
      console.warn('[Expert Login Firebase fallback]', e);
    }

    // 2️⃣ Fallback: Local server expert login (same Wi-Fi)
    const res = await ApiClient.expertLogin(email.trim().toLowerCase(), password);
    if (res && res.success && res.expert) {
      setUserSession({
        id: res.expert.id,
        name: res.expert.name,
        email: res.expert.email,
        phone: res.expert.phone || '',
        role: 'astrologer',
        createdAt: new Date().toISOString().split('T')[0],
      });
      setLoading(false);
      router.replace('/(tabs)');
      return;
    }

    setLoading(false);
    setError(res?.error || 'Sign in failed. Please check your email and password.');
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
                    colors={[colors.teal, colors.gold]}
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
                    variant="primary"
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
                    <Text style={[styles.footerLink, { color: colors.teal }]}>User Sign In →</Text>
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
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  logoInnerCircle: { width: '100%', height: '100%', borderRadius: 36, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  badgePill: {
    backgroundColor: 'rgba(5, 150, 105, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: 2,
  },
  badgeText: { ...typography.tiny, color: colors.teal, fontWeight: '800', letterSpacing: 0.8 },
  brandTitle: { ...typography.display, fontSize: 30, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
  card: {
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(191, 219, 254, 0.6)',
    borderRightColor: 'rgba(191, 219, 254, 0.6)',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBody: { padding: spacing.xl, gap: spacing.md },
  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.8)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  passwordWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12, padding: 6 },
  errorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },
  footerContainer: { gap: spacing.xs, alignItems: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.teal, fontWeight: '800' },
});
