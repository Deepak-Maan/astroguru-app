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
import { loginWithEmailPassword, sendMobileOtp, verifyMobileOtp } from '../../src/services/authService';

type AuthMode = 'email' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  const [mode, setMode] = useState<AuthMode>('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpBanner, setOtpBanner] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Email Login
  const handleEmailLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await loginWithEmailPassword(email, password);
    setLoading(false);

    if (res.success && res.user) {
      setUserSession(res.user);
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await sendMobileOtp(phone);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpBanner(res.message);
    } else {
      setError(res.message);
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your phone.');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await verifyMobileOtp(phone, otp);
    setLoading(false);

    if (res.success && res.user) {
      setUserSession(res.user);
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'OTP verification failed.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Logo */}
            <View style={styles.hero}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={[colors.gold, colors.saffron]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.logoIcon}>✨</Text>
              </View>
              <Text style={styles.brandTitle}>AstroGuru</Text>
              <Text style={styles.brandSubtitle}>Sign in to access your birth chart & Jyotishis</Text>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => { setMode('email'); setError(null); }}
                style={[styles.tabBtn, mode === 'email' && styles.tabBtnActive]}
              >
                {mode === 'email' && (
                  <LinearGradient colors={[colors.saffron, colors.gold]} style={StyleSheet.absoluteFill} />
                )}
                <Text style={[styles.tabText, mode === 'email' && styles.tabTextActive]}>
                  📧 Email Sign In
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { setMode('otp'); setError(null); }}
                style={[styles.tabBtn, mode === 'otp' && styles.tabBtnActive]}
              >
                {mode === 'otp' && (
                  <LinearGradient colors={[colors.auroraA, colors.auroraB]} style={StyleSheet.absoluteFill} />
                )}
                <Text style={[styles.tabText, mode === 'otp' && styles.tabTextActive]}>
                  📱 Mobile OTP
                </Text>
              </Pressable>
            </View>

            {/* Form Card */}
            <Card style={styles.card}>
              {mode === 'email' ? (
                <>
                  <Text style={styles.cardHeader}>Welcome Back</Text>

                  {/* Email */}
                  <View style={styles.field}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(null); }}
                      placeholder="your.email@example.com"
                      placeholderTextColor={colors.textFaint}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>

                  {/* Password */}
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
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                      </Pressable>
                    </View>
                  </View>

                  {!!error && <Text style={styles.errorText}>⚠️ {error}</Text>}

                  <Button
                    label={loading ? 'Verifying Account…' : 'Sign In'}
                    variant="gold"
                    size="lg"
                    loading={loading}
                    onPress={handleEmailLogin}
                    style={{ marginTop: spacing.xs }}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.cardHeader}>Mobile OTP Sign In</Text>

                  {/* Phone */}
                  <View style={styles.field}>
                    <Text style={styles.label}>10-Digit Mobile Number</Text>
                    <View style={styles.phoneWrap}>
                      <View style={styles.codeBox}>
                        <Text style={styles.codeText}>+91</Text>
                      </View>
                      <TextInput
                        value={phone}
                        onChangeText={(t) => { setPhone(t); setError(null); }}
                        placeholder="9876543210"
                        placeholderTextColor={colors.textFaint}
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={[styles.input, { flex: 1 }]}
                      />
                    </View>
                  </View>

                  {otpSent && (
                    <View style={styles.field}>
                      <Text style={styles.label}>Enter 6-Digit OTP</Text>
                      <TextInput
                        value={otp}
                        onChangeText={(t) => { setOtp(t); setError(null); }}
                        placeholder="123456"
                        placeholderTextColor={colors.textFaint}
                        keyboardType="numeric"
                        maxLength={6}
                        style={styles.otpInput}
                      />
                    </View>
                  )}

                  {!!otpBanner && (
                    <View style={styles.otpBannerBox}>
                      <Text style={styles.otpBannerText}>📲 {otpBanner}</Text>
                    </View>
                  )}

                  {!!error && <Text style={styles.errorText}>⚠️ {error}</Text>}

                  {!otpSent ? (
                    <Button
                      label={loading ? 'Sending OTP…' : 'Send SMS OTP'}
                      variant="gold"
                      size="lg"
                      loading={loading}
                      onPress={handleSendOtp}
                    />
                  ) : (
                    <Button
                      label={loading ? 'Verifying OTP…' : 'Verify & Sign In'}
                      variant="gold"
                      size="lg"
                      loading={loading}
                      onPress={handleVerifyOtp}
                    />
                  )}
                </>
              )}
            </Card>

            {/* Footer switch to Signup */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.footerLink}>Create Account</Text>
              </Pressable>
            </View>

            {/* Expert / Astrologer Portal Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Are you an Astrologer?</Text>
              <Pressable onPress={() => router.push('/(auth)/expert-login')}>
                <Text style={[styles.footerLink, { color: colors.auroraA }]}>Join as Expert →</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  logoIcon: { fontSize: 32 },
  brandTitle: { ...typography.display, fontSize: 28, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(148,163,184,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  tabBtnActive: {},
  tabText: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },

  card: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  cardHeader: { ...typography.h2, color: colors.text, textAlign: 'center', fontWeight: '800' },

  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeText: { ...typography.small, color: colors.saffron, fontWeight: '800' },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.saffron,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.saffron,
    fontSize: 18,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '800',
  },

  otpBannerBox: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  otpBannerText: { ...typography.tiny, color: colors.success, fontWeight: '700', textAlign: 'center' },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  eyeIcon: { fontSize: 16 },

  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.saffron, fontWeight: '800' },
});
