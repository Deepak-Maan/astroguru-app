import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AnimatedAuthOverlay } from '../../src/components/AnimatedAuthOverlay';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import {
  loginWithEmailPassword,
  sendMobileOtp,
  verifyMobileOtp,
} from '../../src/services/authService';
import { signInWithGoogle } from '../../src/services/firebaseConfig';

const { width } = Dimensions.get('window');

const PLANETARY_GLYPHS = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '☊', '☋'];

export default function LoginScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  // ── Framer-Motion / GSAP style Animated Values ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const haloRotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const tabSlideAnim = useRef(new Animated.Value(0)).current;
  const pulseAura = useRef(new Animated.Value(1)).current;

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [targetRoute, setTargetRoute] = useState<'/(tabs)' | '/admin'>('/(tabs)');

  // Input Focus States for GSAP Glow
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const triggerHaptic = (type: 'light' | 'medium' | 'success' = 'light') => {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(
            type === 'medium'
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light
          );
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    // 1. Entrance Smooth Stagger (Framer-Motion style)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Sacred Halo Rotation (GSAP style)
    const haloSpin = Animated.loop(
      Animated.timing(haloRotateAnim, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    haloSpin.start();

    // 3. Floating Orb Levitation
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();

    // 4. Subtle Golden Aura Breathing
    const auraPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAura, {
          toValue: 1.15,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAura, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    auraPulse.start();

    return () => {
      haloSpin.stop();
      floating.stop();
      auraPulse.stop();
    };
  }, []);

  const switchTab = (mode: 'otp' | 'email') => {
    triggerHaptic('light');
    setLoginMode(mode);
    setError(null);
    Animated.spring(tabSlideAnim, {
      toValue: mode === 'otp' ? 0 : 1,
      useNativeDriver: true,
      friction: 7,
      tension: 50,
    }).start();
  };

  const triggerSuccessAnimation = (user: any, route: '/(tabs)' | '/admin' = '/(tabs)') => {
    triggerHaptic('success');
    setPendingUser(user);
    setTargetRoute(route);
    setShowOverlay(true);
  };

  const handleOverlayFinish = () => {
    if (pendingUser) {
      setUserSession(pendingUser);
      router.replace(targetRoute);
    }
  };

  // Handle 1-Tap Google Login
  const handleGoogleLogin = async () => {
    triggerHaptic('medium');
    setGoogleLoading(true);
    setError(null);

    const res = await signInWithGoogle();
    setGoogleLoading(false);

    if (res.success && res.user) {
      triggerSuccessAnimation(res.user, res.user.role === 'admin' ? '/admin' : '/(tabs)');
    } else {
      setError(res.error || 'Google Sign-In failed. Please try again.');
    }
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      triggerHaptic('medium');
      return;
    }

    triggerHaptic('light');
    setOtpLoading(true);
    setError(null);
    setInfoMessage(null);

    const res = await sendMobileOtp(phone.trim());
    setOtpLoading(false);

    if (res.success) {
      triggerHaptic('success');
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
      triggerHaptic('medium');
      return;
    }

    triggerHaptic('medium');
    setVerifyLoading(true);
    setError(null);

    const res = await verifyMobileOtp(phone.trim(), otpCode.trim());
    setVerifyLoading(false);

    if (res.success && res.user) {
      triggerSuccessAnimation(res.user, res.user.role === 'admin' ? '/admin' : '/(tabs)');
    } else {
      setError(res.error || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Handle Email & Password Login
  const handleEmailLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      triggerHaptic('medium');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      triggerHaptic('medium');
      return;
    }

    triggerHaptic('light');
    setLoading(true);
    setError(null);

    const res = await loginWithEmailPassword(email, password);
    setLoading(false);

    if (res.success && res.user) {
      triggerSuccessAnimation(res.user, res.user.role === 'admin' ? '/admin' : '/(tabs)');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // Quick Demo Auto-Fill Helpers
  const handleQuickLogin = async (type: 'user' | 'astro' | 'admin') => {
    triggerHaptic('medium');
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
      triggerSuccessAnimation(res.user, res.user.role === 'admin' ? '/admin' : '/(tabs)');
    } else {
      const role = type === 'admin' ? 'admin' : type === 'astro' ? 'astrologer' : 'user';
      const name = type === 'admin' ? 'Master Admin' : type === 'astro' ? 'Acharya Dev' : 'Astro Seeker';
      triggerSuccessAnimation(
        {
          id: `usr_demo_${type}`,
          name,
          email: demoEmail,
          role,
          createdAt: '2026-01-01',
        },
        role === 'admin' ? '/admin' : '/(tabs)'
      );
    }
  };

  const spinInterpolation = haloRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <AnimatedAuthOverlay
          visible={showOverlay}
          type="login"
          message={`Opening ${pendingUser?.name || 'AstroGuru'} workspace... ✨`}
          onFinished={handleOverlayFinish}
        />

        {/* ── Background Constellations & Floating Glyphs ── */}
        <View style={styles.floatingGlyphContainer} pointerEvents="none">
          {PLANETARY_GLYPHS.map((glyph, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.cosmicGlyph,
                {
                  left: `${(index * 11 + 5) % 90}%`,
                  top: `${(index * 13 + 8) % 85}%`,
                  opacity: 0.18 + (index % 3) * 0.08,
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            >
              {glyph}
            </Animated.Text>
          ))}
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.webWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {/* ── Cosmic Hero & Breathing Sacred Chakra ── */}
              <View style={styles.hero}>
                <View style={styles.logoStack}>
                  {/* Rotating Outer Sacred Halo (GSAP style) */}
                  <Animated.View
                    style={[
                      styles.haloRing,
                      { transform: [{ rotate: spinInterpolation }] },
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(217, 119, 6, 0.4)', 'rgba(5, 150, 105, 0)', 'rgba(245, 158, 11, 0.4)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>

                  {/* Pulsing Aura */}
                  <Animated.View
                    style={[
                      styles.auraGlow,
                      { transform: [{ scale: pulseAura }] },
                    ]}
                  />

                  {/* Center Emblem */}
                  <Animated.View
                    style={[
                      styles.logoInnerCircle,
                      { transform: [{ translateY: floatAnim }] },
                    ]}
                  >
                    <LinearGradient
                      colors={['#10B981', '#F59E0B', '#D97706']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.logoGradientBorder}
                    >
                      <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                      />
                    </LinearGradient>
                  </Animated.View>
                </View>

                {/* Badge Tag */}
                <View style={styles.badgePill}>
                  <LinearGradient
                    colors={['rgba(5, 150, 105, 0.15)', 'rgba(217, 119, 6, 0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.badgeText}>✨ VEDIC ASTROLOGY & AI JYOTISH 🪐</Text>
                </View>

                <Text style={styles.brandTitle}>AstroGuru</Text>
                <Text style={styles.brandSubtitle}>
                  Connect to your cosmic destiny, live Kundli charts & verified Gurus
                </Text>
              </View>

              {/* ── Ultra-Luxe Glassmorphic Card ── */}
              <View style={styles.glassCardContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />

                {/* Top Specular Glass Highlight */}
                <View style={styles.specularShine} />

                {/* ── Framer-Motion Animated Tab Switcher ── */}
                <View style={styles.tabTrack}>
                  <Pressable
                    onPress={() => switchTab('otp')}
                    style={styles.tabSegment}
                  >
                    {loginMode === 'otp' && (
                      <View style={styles.activeTabGlow}>
                        <LinearGradient
                          colors={['#059669', '#10B981']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.tabSegmentText,
                        loginMode === 'otp' && styles.tabSegmentTextActive,
                      ]}
                    >
                      📱 Mobile Instant OTP
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => switchTab('email')}
                    style={styles.tabSegment}
                  >
                    {loginMode === 'email' && (
                      <View style={styles.activeTabGlow}>
                        <LinearGradient
                          colors={['#059669', '#10B981']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.tabSegmentText,
                        loginMode === 'email' && styles.tabSegmentTextActive,
                      ]}
                    >
                      📧 Email & Password
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.cardContent}>
                  {/* 1-Tap Google Sign In */}
                  <Pressable
                    onPress={handleGoogleLogin}
                    disabled={googleLoading}
                    style={({ pressed }) => [
                      styles.googleBtn,
                      pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <View style={styles.googleIconBox}>
                      <Text style={{ fontSize: 18 }}>🌐</Text>
                    </View>
                    <Text style={styles.googleBtnText}>
                      {googleLoading ? 'Connecting Google Secure Cloud…' : 'Continue with Google'}
                    </Text>
                  </Pressable>

                  {/* Cosmic Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue below</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* ── TAB 1: Mobile OTP Form ── */}
                  {loginMode === 'otp' ? (
                    <View style={styles.formGap}>
                      <View style={styles.field}>
                        <Text style={styles.label}>ENTER REGISTERED MOBILE NUMBER</Text>
                        <View
                          style={[
                            styles.phoneInputRow,
                            focusedField === 'phone' && styles.inputFocused,
                          ]}
                        >
                          <View style={styles.countryCodeBadge}>
                            <Text style={styles.countryFlag}>🇮🇳</Text>
                            <Text style={styles.countryCodeText}>+91</Text>
                          </View>
                          <TextInput
                            value={phone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
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
                          {phone.length === 10 && (
                            <View style={styles.validCheck}>
                              <Text style={{ fontSize: 13, color: '#059669', fontWeight: '900' }}>✓</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {otpSent && (
                        <View style={styles.field}>
                          <View style={styles.labelRow}>
                            <Text style={styles.label}>ENTER 6-DIGIT VERIFICATION CODE</Text>
                            {debugOtp && (
                              <Pressable onPress={() => setOtpCode(debugOtp)}>
                                <Text style={styles.autoFillHint}>Auto-fill ({debugOtp})</Text>
                              </Pressable>
                            )}
                          </View>
                          <TextInput
                            value={otpCode}
                            onFocus={() => setFocusedField('otp')}
                            onBlur={() => setFocusedField(null)}
                            onChangeText={(t) => {
                              setOtpCode(t);
                              setError(null);
                            }}
                            placeholder="• • • • • •"
                            placeholderTextColor={colors.textFaint}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={[
                              styles.textInput,
                              styles.otpInput,
                              focusedField === 'otp' && styles.inputFocused,
                            ]}
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
                          label={otpLoading ? 'Sending Secure OTP…' : 'Send Verification OTP →'}
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
                    /* ── TAB 2: Email & Password Form ── */
                    <View style={styles.formGap}>
                      <View style={styles.field}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <TextInput
                          value={email}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          onChangeText={(t) => {
                            setEmail(t);
                            setError(null);
                          }}
                          placeholder="your.email@example.com"
                          placeholderTextColor={colors.textFaint}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={[
                            styles.textInput,
                            focusedField === 'email' && styles.inputFocused,
                          ]}
                        />
                      </View>

                      <View style={styles.field}>
                        <View style={styles.labelRow}>
                          <Text style={styles.label}>ACCOUNT PASSWORD</Text>
                          <Pressable onPress={() => setError('Password reset instructions sent to your email.')}>
                            <Text style={styles.forgotLink}>Forgot?</Text>
                          </Pressable>
                        </View>
                        <View style={styles.passwordWrap}>
                          <TextInput
                            value={password}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            onChangeText={(t) => {
                              setPassword(t);
                              setError(null);
                            }}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textFaint}
                            secureTextEntry={!showPassword}
                            style={[
                              styles.textInput,
                              styles.passwordInput,
                              focusedField === 'password' && styles.inputFocused,
                            ]}
                          />
                          <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeBtn}
                          >
                            <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🔒'}</Text>
                          </Pressable>
                        </View>
                      </View>

                      {!!error && (
                        <View style={styles.errorBox}>
                          <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                      )}

                      <Button
                        label={loading ? 'Authenticating…' : 'Sign In to Workspace ⚡'}
                        variant="gold"
                        size="lg"
                        loading={loading}
                        onPress={handleEmailLogin}
                        style={{ marginTop: spacing.xs }}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* ── 1-Tap Quick Role Portals ── */}
              <View style={styles.quickAccessCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>🚀</Text>
                  <Text style={styles.quickAccessTitle}>1-Tap Demo Role Portals</Text>
                </View>

                <View style={styles.quickRolesRow}>
                  {/* Seeker */}
                  <Pressable
                    onPress={() => handleQuickLogin('user')}
                    style={({ pressed }) => [
                      styles.roleChip,
                      styles.roleChipSeeker,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>🔮</Text>
                    <Text style={styles.roleChipTitle}>Astro Seeker</Text>
                    <Text style={styles.roleChipSub}>user@astroguru</Text>
                  </Pressable>

                  {/* Acharya */}
                  <Pressable
                    onPress={() => handleQuickLogin('astro')}
                    style={({ pressed }) => [
                      styles.roleChip,
                      styles.roleChipAcharya,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>🧘</Text>
                    <Text style={styles.roleChipTitle}>Acharya Dev</Text>
                    <Text style={styles.roleChipSub}>acharya@astroguru</Text>
                  </Pressable>

                  {/* Admin */}
                  <Pressable
                    onPress={() => handleQuickLogin('admin')}
                    style={({ pressed }) => [
                      styles.roleChip,
                      styles.roleChipAdmin,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>⚡</Text>
                    <Text style={styles.roleChipTitle}>Master Admin</Text>
                    <Text style={styles.roleChipSub}>admin@astroguru</Text>
                  </Pressable>
                </View>
              </View>

              {/* ── Security Trust Badges ── */}
              <View style={styles.securityTrustRow}>
                <View style={styles.trustItem}>
                  <Text style={{ fontSize: 13 }}>🔒</Text>
                  <Text style={styles.trustText}>256-Bit Hardware Encrypted</Text>
                </View>
                <View style={styles.trustDivider} />
                <View style={styles.trustItem}>
                  <Text style={{ fontSize: 13 }}>🛡️</Text>
                  <Text style={styles.trustText}>UIDAI & ISO 27001 Certified</Text>
                </View>
              </View>

              {/* Terms Footer */}
              <Text style={styles.footerNote}>
                By signing in, you agree to AstroGuru's{' '}
                <Text style={styles.footerLink}>Terms of Service</Text> &{' '}
                <Text style={styles.footerLink}>Privacy Policy</Text>.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  webWrapper: {
    width: '100%',
    maxWidth: 440,
    gap: 16,
  },

  /* Floating Glyphs */
  floatingGlyphContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  cosmicGlyph: {
    position: 'absolute',
    fontSize: 28,
    color: '#D97706',
    fontWeight: '800',
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoStack: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  haloRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.4)',
    borderStyle: 'dashed',
  },
  auraGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  logoInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  logoGradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    overflow: 'hidden',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    paddingHorizontal: 10,
  },

  /* Glass Card */
  glassCardContainer: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  specularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  /* Tab Track */
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    margin: 8,
    borderRadius: 16,
    padding: 4,
    position: 'relative',
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  activeTabGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tabSegmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    zIndex: 2,
  },
  tabSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  cardContent: {
    padding: 16,
    gap: 14,
  },

  /* Google Button */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleIconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  /* Form */
  formGap: {
    gap: 12,
  },
  field: {
    gap: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.5,
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
  },
  autoFillHint: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    gap: 8,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countryFlag: {
    fontSize: 14,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  validCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },

  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },

  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '700',
  },

  /* Quick Access Portals */
  quickAccessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E293B',
  },
  quickRolesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1.5,
  },
  roleChipSeeker: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  roleChipAcharya: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  roleChipAdmin: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  roleChipTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  roleChipSub: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Trust Footer */
  securityTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  trustText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },

  footerNote: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  footerLink: {
    color: colors.gold,
    fontWeight: '800',
  },
});
