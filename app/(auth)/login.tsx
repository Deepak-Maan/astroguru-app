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
import {
  loginWithEmailPassword,
  sendMobileOtp,
  verifyMobileOtp,
} from '../../src/services/authService';
import { signInWithGoogle } from '../../src/services/firebaseConfig';

export default function LoginScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  // Tab State: 'otp' | 'email'
  const [loginMode, setLoginMode] = useState<'otp' | 'email'>('otp');

  // Mobile OTP States
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Email form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Handle 1-Tap Google Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    const res = await signInWithGoogle();
    setGoogleLoading(false);

    if (res.success && res.user) {
      setUserSession(res.user);
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Google Sign-In failed. Please try again.');
    }
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpLoading(true);
    setError(null);
    setInfoMessage(null);

    const res = await sendMobileOtp(phone.trim());
    setOtpLoading(false);

    if (res.success) {
      setOtpSent(true);
      setDebugOtp(res.otp);
      setInfoMessage(res.message || `Verification code sent to +91 ${phone}`);
    } else {
      setError(res.message || 'Failed to send OTP code. Try again.');
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifyLoading(true);
    setError(null);

    const res = await verifyMobileOtp(phone.trim(), otpCode.trim());
    setVerifyLoading(false);

    if (res.success && res.user) {
      setUserSession(res.user);
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Handle Email & Password Login
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

  // Quick Demo Auto-Fill Helpers
  const handleQuickLogin = async (type: 'user' | 'astro' | 'admin') => {
    setLoading(true);
    setError(null);
    let demoEmail = 'user@astroguru.app';
    let demoPass = 'user123';

    if (type === 'astro') {
      demoEmail = 'acharya@astroguru.app';
      demoPass = 'astro123';
    } else if (type === 'admin') {
      demoEmail = 'admin@astroguru.app';
      demoPass = 'admin123';
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await loginWithEmailPassword(demoEmail, demoPass);
    setLoading(false);

    if (res.success && res.user) {
      setUserSession(res.user);
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      const role = type === 'admin' ? 'admin' : type === 'astro' ? 'astrologer' : 'user';
      const name = type === 'admin' ? 'Master Admin' : type === 'astro' ? 'Acharya Dev' : 'Astro Seeker';
      setUserSession({
        id: `usr_demo_${type}`,
        name,
        email: demoEmail,
        role,
        createdAt: '2026-01-01',
      });
      router.replace(role === 'admin' ? '/admin' : '/(tabs)');
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
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.webWrapper}>
              {/* Header Hero */}
              <View style={styles.hero}>
                <View style={styles.logoOuterRing}>
                  <LinearGradient
                    colors={[colors.auroraA, colors.saffron]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.logoInnerCircle}>
                    <Text style={styles.logoIcon}>🔮</Text>
                  </View>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>✨ VEDIC ASTROLOGY & AI JYOTISH</Text>
                </View>
                <Text style={styles.brandTitle}>AstroGuru</Text>
                <Text style={styles.brandSubtitle}>
                  Sign in to access your birth chart, daily horoscopes & live Jyotishis
                </Text>
              </View>

              {/* Glassmorphic Form Card */}
              <Card elevated padded={false} style={styles.card}>
                {/* Tab Switcher: Mobile OTP vs Email & Password */}
                <View style={styles.tabContainer}>
                  <Pressable
                    onPress={() => {
                      setLoginMode('otp');
                      setError(null);
                    }}
                    style={[styles.tabButton, loginMode === 'otp' && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, loginMode === 'otp' && styles.tabTextActive]}>
                      📱 Mobile OTP
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setLoginMode('email');
                      setError(null);
                    }}
                    style={[styles.tabButton, loginMode === 'email' && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, loginMode === 'email' && styles.tabTextActive]}>
                      📧 Email & Pass
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.cardBody}>
                  {/* 1-Tap Google Sign In */}
                  <Pressable
                    onPress={handleGoogleLogin}
                    disabled={googleLoading}
                    style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
                  >
                    <View style={styles.googleIconBox}>
                      <Text style={{ fontSize: 18 }}>🌐</Text>
                    </View>
                    <Text style={styles.googleBtnText}>
                      {googleLoading ? 'Connecting Google…' : 'Continue with Google'}
                    </Text>
                  </Pressable>

                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue below</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* TAB 1: Mobile OTP Form */}
                  {loginMode === 'otp' ? (
                    <View style={styles.formGap}>
                      <View style={styles.field}>
                        <Text style={styles.label}>MOBILE NUMBER</Text>
                        <View style={styles.phoneInputRow}>
                          <View style={styles.countryCodeBadge}>
                            <Text style={styles.countryFlag}>🇮🇳</Text>
                            <Text style={styles.countryCodeText}>+91</Text>
                          </View>
                          <TextInput
                            value={phone}
                            onChangeText={(t) => {
                              setPhone(t.replace(/[^0-9]/g, ''));
                              setError(null);
                              setInfoMessage(null);
                            }}
                            placeholder="Enter 10-digit mobile number"
                            placeholderTextColor={colors.textFaint}
                            keyboardType="number-pad"
                            maxLength={10}
                            style={styles.phoneInput}
                          />
                        </View>
                      </View>

                      {otpSent && (
                        <View style={styles.field}>
                          <View style={styles.labelRow}>
                            <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
                            {debugOtp && (
                              <Pressable onPress={() => setOtpCode(debugOtp)}>
                                <Text style={styles.autoFillHint}>Auto-fill ({debugOtp})</Text>
                              </Pressable>
                            )}
                          </View>
                          <TextInput
                            value={otpCode}
                            onChangeText={(t) => {
                              setOtpCode(t);
                              setError(null);
                            }}
                            placeholder="123456"
                            placeholderTextColor={colors.textFaint}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={[styles.input, styles.otpInput]}
                          />
                        </View>
                      )}

                      {!!infoMessage && (
                        <View style={styles.infoBox}>
                          <Text style={styles.infoText}>💬 {infoMessage}</Text>
                        </View>
                      )}

                      {!!error && (
                        <View style={styles.errorBox}>
                          <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                      )}

                      {!otpSent ? (
                        <Button
                          label={otpLoading ? 'Sending Code…' : 'Send Verification OTP →'}
                          variant="gold"
                          size="lg"
                          loading={otpLoading}
                          onPress={handleSendOtp}
                          style={{ marginTop: spacing.xs }}
                        />
                      ) : (
                        <Button
                          label={verifyLoading ? 'Verifying OTP…' : 'Verify & Enter AstroGuru ⚡'}
                          variant="gold"
                          size="lg"
                          loading={verifyLoading}
                          onPress={handleVerifyOtp}
                          style={{ marginTop: spacing.xs }}
                        />
                      )}
                    </View>
                  ) : (
                    /* TAB 2: Email & Password Form */
                    <View style={styles.formGap}>
                      <View style={styles.field}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <TextInput
                          value={email}
                          onChangeText={(t) => {
                            setEmail(t);
                            setError(null);
                          }}
                          placeholder="your.email@example.com"
                          placeholderTextColor={colors.textFaint}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={styles.input}
                        />
                      </View>

                      <View style={styles.field}>
                        <View style={styles.labelRow}>
                          <Text style={styles.label}>PASSWORD</Text>
                          <Pressable onPress={() => setError('Password reset instructions sent to your email.')}>
                            <Text style={styles.forgotLink}>Forgot?</Text>
                          </Pressable>
                        </View>
                        <View style={styles.passwordWrap}>
                          <TextInput
                            value={password}
                            onChangeText={(t) => {
                              setPassword(t);
                              setError(null);
                            }}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textFaint}
                            secureTextEntry={!showPassword}
                            style={[styles.input, { flex: 1, paddingRight: 44 }]}
                          />
                          <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeBtn}
                          >
                            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                          </Pressable>
                        </View>
                      </View>

                      {!!error && (
                        <View style={styles.errorBox}>
                          <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                      )}

                      <Button
                        label={loading ? 'Verifying Account…' : 'Sign In with Email ✨'}
                        variant="gold"
                        size="lg"
                        loading={loading}
                        onPress={handleEmailLogin}
                        style={{ marginTop: spacing.xs }}
                      />
                    </View>
                  )}

                  {/* 1-Tap Quick Demo Users */}
                  <View style={styles.demoSection}>
                    <Text style={styles.demoTitle}>⚡ 1-TAP QUICK DEMO SIGN IN</Text>
                    <View style={styles.demoChipsRow}>
                      <Pressable
                        onPress={() => handleQuickLogin('user')}
                        style={({ pressed }) => [styles.demoChip, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.demoChipIcon}>👤</Text>
                        <Text style={styles.demoChipText}>Seeker</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleQuickLogin('astro')}
                        style={({ pressed }) => [styles.demoChip, styles.demoChipAstro, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.demoChipIcon}>🔮</Text>
                        <Text style={styles.demoChipText}>Jyotishi</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleQuickLogin('admin')}
                        style={({ pressed }) => [styles.demoChip, styles.demoChipAdmin, pressed && { opacity: 0.8 }]}
                      >
                        <Text style={styles.demoChipIcon}>🛡️</Text>
                        <Text style={styles.demoChipText}>Admin</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Footer Switch Links */}
              <View style={styles.footerContainer}>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>New to AstroGuru?</Text>
                  <Pressable onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.footerLink}>Create Free Seeker Account</Text>
                  </Pressable>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Are you a Certified Astrologer?</Text>
                  <Pressable onPress={() => router.push('/(auth)/expert-login')}>
                    <Text style={[styles.footerLink, { color: colors.auroraA }]}>
                      Join Expert Portal →
                    </Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  webWrapper: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
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
  logoInnerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    backgroundColor: '#070D18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 34 },
  badgePill: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: 2,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.goldSoft,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandTitle: {
    ...typography.display,
    fontSize: 32,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },

  card: {
    borderRadius: radius.lg,
    backgroundColor: '#0D1524',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#070D18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    padding: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabButtonActive: {
    backgroundColor: '#131F33',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.goldSoft,
    fontWeight: '800',
  },

  cardBody: {
    padding: spacing.xl,
    gap: spacing.md,
  },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#131F33',
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
  },
  googleIconBox: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  googleBtnText: { ...typography.body, color: colors.text, fontWeight: '700', fontSize: 15 },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 2,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { ...typography.tiny, color: colors.textFaint, fontWeight: '700' },

  formGap: { gap: spacing.md },
  field: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.6 },
  forgotLink: { ...typography.tiny, color: colors.goldSoft, fontWeight: '700' },
  autoFillHint: { ...typography.tiny, color: colors.auroraA, fontWeight: '800' },

  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#131F33',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  countryFlag: { fontSize: 16 },
  countryCodeText: { ...typography.body, color: colors.text, fontWeight: '800', fontSize: 14 },
  phoneInput: {
    flex: 1,
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },

  input: {
    backgroundColor: '#070D18',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: '900',
    color: colors.goldSoft,
    borderColor: colors.saffron,
  },

  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  eyeIcon: { fontSize: 16 },

  infoBox: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { ...typography.small, color: colors.auroraA, fontWeight: '700', textAlign: 'center' },

  errorBox: {
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },

  demoSection: {
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  demoTitle: {
    ...typography.tiny,
    color: colors.textFaint,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  demoChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#131F33',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  demoChipAstro: {
    borderColor: 'rgba(245,158,11,0.4)',
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  demoChipAdmin: {
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  demoChipIcon: { fontSize: 14 },
  demoChipText: { ...typography.tiny, color: colors.text, fontWeight: '700' },

  footerContainer: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.goldSoft, fontWeight: '800' },
});

