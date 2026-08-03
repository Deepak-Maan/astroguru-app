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
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={[colors.auroraA, colors.saffron]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 32 }}>👑</Text>
              </View>
              <Text style={styles.brandTitle}>Expert Jyotishi Portal</Text>
              <Text style={styles.brandSubtitle}>Sign in to manage live consultations & earnings</Text>
            </View>

            <Card style={styles.card}>
              <Text style={styles.cardHeader}>Astrologer Sign In</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Expert Email Address</Text>
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
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(null); }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textFaint}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🙈'}</Text>
                  </Pressable>
                </View>
              </View>

              {!!error && <Text style={styles.errorText}>⚠️ {error}</Text>}

              <Button
                label={loading ? 'Authenticating Expert…' : '👑 Sign In as Expert'}
                variant="gold"
                size="lg"
                loading={loading}
                onPress={handleExpertLogin}
              />
            </Card>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New Expert?</Text>
              <Pressable onPress={() => router.push('/(auth)/expert-signup')}>
                <Text style={styles.footerLink}>Register as Astrologer</Text>
              </Pressable>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Seeking Consultation?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>User Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  logoCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: spacing.xs },
  brandTitle: { ...typography.display, fontSize: 28, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
  card: { gap: spacing.md, padding: spacing.xl },
  cardHeader: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, color: colors.text, fontSize: 14, fontWeight: '700' },
  passwordWrap: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12, padding: 4 },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.saffron, fontWeight: '800' },
});
