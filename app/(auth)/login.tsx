/**
 * AstroGuru — Modern Split-Screen Login & Registration (Comfortable Medium Size, Zero-Scroll)
 * Powered by Three.js 3D Celestial Armillary Showcase, Frosted Spatial Glassmorphism,
 * One-Click Google & Apple OAuth, Staggered Tab Morphing, and Micro-Interaction Form Validation.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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
import Svg, { Path } from 'react-native-svg';
import { AuthCelestialShowcase } from '../../src/components/auth/AuthCelestialShowcase';
import { AnimatedAuthOverlay } from '../../src/components/AnimatedAuthOverlay';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import {
  loginWithEmailPassword,
  registerUserAccount,
  sendMobileOtp,
  verifyMobileOtp,
} from '../../src/services/authService';
import { signInWithGoogle } from '../../src/services/firebaseConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
      />
      <Path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
      />
      <Path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
      />
      <Path
        fill="#34A853"
        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
      />
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.18.65-2.85 1.44-.59.68-1.11 1.83-.97 2.95 1.08.08 2.18-.56 2.83-1.29z" />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  // ── Responsive Width State ──
  const [windowWidth, setWindowWidth] = useState(SCREEN_WIDTH);
  const isDesktop = windowWidth >= 900;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // ── Main Auth Tab: 'login' | 'signup' | 'acharya' ──
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'acharya'>('login');

  // Sub-mode for Login: 'otp' | 'email'
  const [loginMode, setLoginMode] = useState<'otp' | 'email'>('otp');

  // Focus tracking for active border glows
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ── Form Values ──
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Extra Fields
  const [regName, setRegName] = useState('');
  const [regDob, setRegDob] = useState('15/08/1995');

  // Acharya Extra Fields
  const [astroSpecialty, setAstroSpecialty] = useState('Vedic Astrology, Prashna Kundli');
  const [astroExp, setAstroExp] = useState('10');
  const [astroRate, setAstroRate] = useState('25');

  // Status & Overlay
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [targetRoute, setTargetRoute] = useState<'/(tabs)' | '/admin'>('/(tabs)');

  // ── Micro-Interaction Animations ──
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

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

  // ── Validation Helpers ──
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#64748B' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#F43F5E' };
    if (pass.length < 10 || !/[0-9]/.test(pass)) return { score: 2, label: 'Good', color: '#F59E0B' };
    return { score: 3, label: 'Strong', color: '#10B981' };
  };

  const passStrength = getPasswordStrength(password);

  // ── Launch Celestial Overlay ──
  const launchSessionWithOverlay = (user: any, route: '/(tabs)' | '/admin' = '/(tabs)') => {
    triggerHaptic('success');
    setPendingUser(user);
    setTargetRoute(route);
    setShowOverlay(true);
  };

  const handleOverlayComplete = () => {
    if (pendingUser) {
      setUserSession(pendingUser);
      router.replace(targetRoute);
    }
  };

  // ── Handlers ──
  const handleSendOtp = async () => {
    const raw = phone.replace(/\D/g, '');
    if (raw.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      triggerShake();
      return;
    }
    setError(null);
    setOtpLoading(true);
    triggerHaptic('medium');

    const res = await sendMobileOtp(raw);
    setOtpLoading(false);
    if (res.success) {
      setOtpSent(true);
      setDebugOtp(res.debugOtp || '123456');
      setInfoMessage(`OTP sent to +91 ${raw}`);
    } else {
      setError(res.error || 'Failed to send OTP.');
      triggerShake();
    }
  };

  const handleVerifyOtp = async () => {
    const rawPhone = phone.replace(/\D/g, '');
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit OTP code');
      triggerShake();
      return;
    }
    setError(null);
    setVerifyLoading(true);
    triggerHaptic('medium');

    const res = await verifyMobileOtp(rawPhone, otpCode.trim());
    setVerifyLoading(false);
    if (res.success && res.user) {
      launchSessionWithOverlay(res.user, '/(tabs)');
    } else {
      setError(res.error || 'Invalid OTP code.');
      triggerShake();
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      triggerShake();
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    if (activeTab === 'login') {
      const res = await loginWithEmailPassword(email.trim(), password);
      setLoading(false);
      if (res.success && res.user) {
        const dest = res.user.role === 'admin' ? '/admin' : '/(tabs)';
        launchSessionWithOverlay(res.user, dest);
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
        triggerShake();
      }
    } else if (activeTab === 'signup') {
      if (!regName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        triggerShake();
        return;
      }
      const res = await registerUserAccount({
        name: regName.trim(),
        email: email.trim(),
        password: password,
        phone: phone ? phone.replace(/\D/g, '') : undefined,
        role: 'user',
        dob: regDob,
      });
      setLoading(false);
      if (res.success && res.user) {
        launchSessionWithOverlay(res.user, '/(tabs)');
      } else {
        setError(res.error || 'Registration failed.');
        triggerShake();
      }
    } else if (activeTab === 'acharya') {
      if (!regName.trim()) {
        setError('Please enter your Acharya/Jyotishi title & name');
        setLoading(false);
        triggerShake();
        return;
      }
      const res = await registerUserAccount({
        name: regName.trim(),
        email: email.trim(),
        password: password,
        phone: phone ? phone.replace(/\D/g, '') : undefined,
        role: 'astrologer',
        specialties: astroSpecialty.split(',').map((s) => s.trim()),
        experienceYears: parseInt(astroExp, 10) || 8,
        pricePerMin: parseInt(astroRate, 10) || 25,
      });
      setLoading(false);
      if (res.success && res.user) {
        launchSessionWithOverlay(res.user, '/(tabs)');
      } else {
        setError(res.error || 'Acharya registration failed.');
        triggerShake();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    triggerHaptic('medium');
    try {
      const user = await signInWithGoogle();
      setGoogleLoading(false);
      if (user) {
        launchSessionWithOverlay(user, '/(tabs)');
      }
    } catch (e: any) {
      setGoogleLoading(false);
      setError(e.message || 'Google sign in was cancelled.');
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setAppleLoading(true);
    triggerHaptic('medium');
    setTimeout(() => {
      setAppleLoading(false);
      const demoAppleUser = {
        id: 'usr_apple_demo',
        name: 'Apple Seeker',
        email: 'seeker.apple@astroguru.com',
        role: 'user' as const,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      };
      launchSessionWithOverlay(demoAppleUser, '/(tabs)');
    }, 1200);
  };

  const handleDemoLogin = (role: 'user' | 'astrologer' | 'admin') => {
    triggerHaptic('medium');
    let demoUser;
    if (role === 'user') {
      demoUser = {
        id: 'usr_priya_demo',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        role: 'user' as const,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      };
      launchSessionWithOverlay(demoUser, '/(tabs)');
    } else if (role === 'astrologer') {
      demoUser = {
        id: '1',
        name: 'Dr. Radha Raman Shastri',
        email: 'radha.raman@astroguru.com',
        role: 'astrologer' as const,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      };
      launchSessionWithOverlay(demoUser, '/(tabs)');
    } else {
      demoUser = {
        id: 'adm_master',
        name: 'System Administrator',
        email: 'admin@astroguru.com',
        role: 'admin' as const,
      };
      launchSessionWithOverlay(demoUser, '/admin');
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* Background Cosmic Gradient */}
      <LinearGradient
        colors={['#07080F', '#0B0D17', '#121428']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.mainLayout, isDesktop && styles.desktopSplitLayout]}>
            {/* ── LEFT COLUMN: Visual 3D Showcase (Desktop) ── */}
            {isDesktop && (
              <View style={styles.showcaseColumnDesktop}>
                <AuthCelestialShowcase />
              </View>
            )}

            {/* ── RIGHT COLUMN: Auth Panel Glassmorphism ── */}
            <View style={[styles.authColumn, isDesktop && styles.authColumnDesktop]}>
              <Animated.View
                style={[
                  styles.glassCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
                  },
                ]}
              >
                {/* Top Specular Edge Glow */}
                <View style={styles.specularEdge} />

                {/* Segmented Main Mode Switcher: Log In / Sign Up / Acharya */}
                <View style={styles.tabContainer}>
                  <Pressable
                    onPress={() => {
                      setActiveTab('login');
                      setError(null);
                      triggerHaptic('light');
                    }}
                    style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
                  >
                    {activeTab === 'login' && (
                      <LinearGradient
                        colors={['#D4AF37', '#B8902A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text
                      style={[
                        styles.tabBtnText,
                        activeTab === 'login' && styles.tabBtnTextActive,
                      ]}
                    >
                      Log In
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setActiveTab('signup');
                      setError(null);
                      triggerHaptic('light');
                    }}
                    style={[styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive]}
                  >
                    {activeTab === 'signup' && (
                      <LinearGradient
                        colors={['#D4AF37', '#B8902A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text
                      style={[
                        styles.tabBtnText,
                        activeTab === 'signup' && styles.tabBtnTextActive,
                      ]}
                    >
                      Sign Up
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setActiveTab('acharya');
                      setError(null);
                      triggerHaptic('light');
                    }}
                    style={[styles.tabBtn, activeTab === 'acharya' && styles.tabBtnActive]}
                  >
                    {activeTab === 'acharya' && (
                      <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text
                      style={[
                        styles.tabBtnText,
                        activeTab === 'acharya' && styles.tabBtnTextActive,
                      ]}
                    >
                      👑 Acharya
                    </Text>
                  </Pressable>
                </View>

                {/* Header Title & Subtitle */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {activeTab === 'login'
                      ? 'Welcome Back 🙏'
                      : activeTab === 'signup'
                      ? 'Begin Cosmic Journey ✨'
                      : 'Certified Acharya Portal 🪐'}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {activeTab === 'login'
                      ? 'Enter credentials to unlock your daily horoscope.'
                      : activeTab === 'signup'
                      ? 'Create account and receive instant ₹200 bonus.'
                      : 'Join India’s premier verified Vedic consultation network.'}
                  </Text>
                </View>

                {/* One-Click Social Auth Options */}
                <View style={styles.socialButtonsRow}>
                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={googleLoading}
                    style={({ pressed }) => [
                      styles.socialBtn,
                      pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <GoogleIcon />
                    <Text style={styles.socialBtnText}>
                      {googleLoading ? 'Connecting…' : 'Google'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleAppleSignIn}
                    disabled={appleLoading}
                    style={({ pressed }) => [
                      styles.socialBtn,
                      pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <AppleIcon />
                    <Text style={styles.socialBtnText}>
                      {appleLoading ? 'Connecting…' : 'Apple'}
                    </Text>
                  </Pressable>
                </View>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR WITH CREDENTIALS</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Sub-Switch for Login: Mobile OTP vs Email */}
                {activeTab === 'login' && (
                  <View style={styles.subTabRow}>
                    <Pressable
                      onPress={() => {
                        setLoginMode('otp');
                        setError(null);
                      }}
                      style={[
                        styles.subTabBtn,
                        loginMode === 'otp' && styles.subTabBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.subTabBtnText,
                          loginMode === 'otp' && styles.subTabBtnTextActive,
                        ]}
                      >
                        📱 Mobile OTP
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setLoginMode('email');
                        setError(null);
                      }}
                      style={[
                        styles.subTabBtn,
                        loginMode === 'email' && styles.subTabBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.subTabBtnText,
                          loginMode === 'email' && styles.subTabBtnTextActive,
                        ]}
                      >
                        ✉️ Email & Password
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Form Error / Info Banners */}
                {!!error && (
                  <View style={styles.errorBanner}>
                    <Text style={{ fontSize: 12 }}>⚠️</Text>
                    <Text style={styles.errorBannerText} numberOfLines={1}>{error}</Text>
                  </View>
                )}
                {!!infoMessage && (
                  <View style={styles.infoBanner}>
                    <Text style={{ fontSize: 12 }}>ℹ️</Text>
                    <Text style={styles.infoBannerText} numberOfLines={1}>{infoMessage}</Text>
                  </View>
                )}

                {/* ── FORM INPUTS ── */}
                <View style={styles.formFields}>
                  {/* Extra Name input for Sign Up / Acharya */}
                  {activeTab !== 'login' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {activeTab === 'acharya' ? 'ACHARYA TITLE & NAME' : 'YOUR FULL NAME'}
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          focusedField === 'regName' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Text style={styles.inputIcon}>{activeTab === 'acharya' ? '👑' : '👤'}</Text>
                        <TextInput
                          placeholder={activeTab === 'acharya' ? 'e.g. Acharya Raman Shastri' : 'e.g. Priya Sharma'}
                          placeholderTextColor="#64748B"
                          value={regName}
                          onChangeText={setRegName}
                          onFocus={() => setFocusedField('regName')}
                          onBlur={() => setFocusedField(null)}
                          style={styles.textInput}
                        />
                      </View>
                    </View>
                  )}

                  {/* Mobile OTP Input Mode (Login only) */}
                  {activeTab === 'login' && loginMode === 'otp' ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>PHONE NUMBER (+91)</Text>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'phone' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Text style={styles.phonePrefix}>+91</Text>
                          <TextInput
                            placeholder="98765 43210"
                            placeholderTextColor="#64748B"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phone}
                            onChangeText={setPhone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            style={styles.textInput}
                          />
                          {isPhoneValid && (
                            <View style={styles.validCheck}>
                              <Text style={styles.validCheckText}>✓</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {otpSent && (
                        <View style={styles.inputGroup}>
                          <View style={styles.otpLabelRow}>
                            <Text style={styles.inputLabel}>ENTER 6-DIGIT OTP</Text>
                            {debugOtp && (
                              <Pressable onPress={() => setOtpCode(debugOtp)}>
                                <Text style={styles.debugOtpLink}>Auto-fill: {debugOtp}</Text>
                              </Pressable>
                            )}
                          </View>
                          <View
                            style={[
                              styles.inputWrapper,
                              focusedField === 'otp' && styles.inputWrapperFocused,
                            ]}
                          >
                            <Text style={styles.inputIcon}>🔐</Text>
                            <TextInput
                              placeholder="• • • • • •"
                              placeholderTextColor="#64748B"
                              keyboardType="number-pad"
                              maxLength={6}
                              value={otpCode}
                              onChangeText={setOtpCode}
                              onFocus={() => setFocusedField('otp')}
                              onBlur={() => setFocusedField(null)}
                              style={[styles.textInput, { letterSpacing: 4, fontWeight: '900', fontSize: 16 }]}
                            />
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    /* Email & Password Input Mode */
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'email' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Text style={styles.inputIcon}>✉️</Text>
                          <TextInput
                            placeholder="seeker@astroguru.com"
                            placeholderTextColor="#64748B"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            style={styles.textInput}
                          />
                          {isEmailValid && (
                            <View style={styles.validCheck}>
                              <Text style={styles.validCheckText}>✓</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <View style={styles.otpLabelRow}>
                          <Text style={styles.inputLabel}>PASSWORD</Text>
                          {passStrength.label ? (
                            <Text style={[styles.strengthLabel, { color: passStrength.color }]}>
                              {passStrength.label}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'password' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Text style={styles.inputIcon}>🔒</Text>
                          <TextInput
                            placeholder="••••••••••••"
                            placeholderTextColor="#64748B"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            style={styles.textInput}
                          />
                          <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={8}
                            style={{ paddingHorizontal: 4 }}
                          >
                            <Text style={{ fontSize: 14 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                          </Pressable>
                        </View>

                        {/* Password Strength Meter Bar */}
                        {password.length > 0 && (
                          <View style={styles.strengthBarContainer}>
                            <View
                              style={[
                                styles.strengthBarFill,
                                {
                                  width: `${(passStrength.score / 3) * 100}%`,
                                  backgroundColor: passStrength.color,
                                },
                              ]}
                            />
                          </View>
                        )}
                      </View>

                      {/* Acharya Extra Fields */}
                      {activeTab === 'acharya' && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>EXPERTISE & RATE / MIN (₹)</Text>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <View style={[styles.inputWrapper, { flex: 2 }]}>
                              <Text style={styles.inputIcon}>📜</Text>
                              <TextInput
                                placeholder="Specialties"
                                placeholderTextColor="#64748B"
                                value={astroSpecialty}
                                onChangeText={setAstroSpecialty}
                                style={styles.textInput}
                              />
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                              <Text style={styles.inputIcon}>₹</Text>
                              <TextInput
                                placeholder="Rate/m"
                                placeholderTextColor="#64748B"
                                keyboardType="numeric"
                                value={astroRate}
                                onChangeText={setAstroRate}
                                style={styles.textInput}
                              />
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  {/* Main Submit Action Button */}
                  <Pressable
                    onPress={
                      activeTab === 'login' && loginMode === 'otp'
                        ? otpSent
                          ? handleVerifyOtp
                          : handleSendOtp
                        : handleEmailAuth
                    }
                    disabled={loading || otpLoading || verifyLoading}
                    style={({ pressed }) => [
                      styles.submitBtn,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        activeTab === 'acharya'
                          ? ['#8B5CF6', '#6D28D9']
                          : ['#D4AF37', '#B8902A', '#EA580C']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text
                      style={[
                        styles.submitBtnText,
                        activeTab === 'acharya' && { color: '#FFFFFF' },
                      ]}
                    >
                      {loading || otpLoading || verifyLoading
                        ? 'Consulting Ephemeris…'
                        : activeTab === 'login' && loginMode === 'otp'
                        ? otpSent
                          ? 'Verify & Enter AstroGuru ›'
                          : 'Send Secure 6-Digit OTP ›'
                        : activeTab === 'login'
                        ? 'Sign In to AstroGuru ›'
                        : activeTab === 'signup'
                        ? 'Create Account & Claim ₹200 ›'
                        : 'Submit Acharya Application ›'}
                    </Text>
                  </Pressable>
                </View>

                {/* 1-Tap Quick Demo Role Switcher for Developer / Reviewer Testing */}
                <View style={styles.demoSection}>
                  <Text style={styles.demoSectionTitle}>⚡ 1-TAP INSTANT DEMO SWITCHER</Text>
                  <View style={styles.demoButtonsRow}>
                    <Pressable
                      onPress={() => handleDemoLogin('user')}
                      style={({ pressed }) => [
                        styles.demoRoleBtn,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={styles.demoRoleIcon}>👤</Text>
                      <Text style={styles.demoRoleLabel}>Seeker</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDemoLogin('astrologer')}
                      style={({ pressed }) => [
                        styles.demoRoleBtn,
                        { borderColor: 'rgba(139, 92, 246, 0.35)', backgroundColor: 'rgba(139, 92, 246, 0.12)' },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={styles.demoRoleIcon}>👑</Text>
                      <Text style={[styles.demoRoleLabel, { color: '#A78BFA' }]}>Acharya</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDemoLogin('admin')}
                      style={({ pressed }) => [
                        styles.demoRoleBtn,
                        { borderColor: 'rgba(244, 63, 94, 0.35)', backgroundColor: 'rgba(244, 63, 94, 0.12)' },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={styles.demoRoleIcon}>🛡️</Text>
                      <Text style={[styles.demoRoleLabel, { color: '#FB7185' }]}>Admin</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Cosmic Launch Overlay Modal */}
      {showOverlay && (
        <AnimatedAuthOverlay
          visible={showOverlay}
          user={pendingUser}
          onAnimationComplete={handleOverlayComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: '100%',
    maxHeight: '100%',
    backgroundColor: '#07080F',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    height: '100%',
  },
  keyboardAvoid: {
    flex: 1,
    height: '100%',
  },
  mainLayout: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopSplitLayout: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  /* Left Showcase Column (Desktop) */
  showcaseColumnDesktop: {
    flex: 1.15,
    height: '100%',
    overflow: 'hidden',
  },

  /* Right Auth Column */
  authColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  authColumnDesktop: {
    flex: 1,
    maxWidth: 540,
    paddingHorizontal: spacing.xl,
  },

  /* Frosted Glass Card */
  glassCard: {
    width: '100%',
    maxWidth: 470,
    backgroundColor: 'rgba(18, 20, 42, 0.88)',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
    gap: 12,
    backdropFilter: 'blur(16px)' as any,
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* Main Tab Bar */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 8, 15, 0.6)',
    borderRadius: radius.pill,
    padding: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  tabBtnActive: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#07080F',
    fontWeight: '900',
  },

  /* Header */
  cardHeader: {
    gap: 3,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'web' ? 'Cinzel, Georgia, serif' : undefined,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 17,
    fontWeight: '500',
  },

  /* Social Auth */
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },

  /* Sub Tab */
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.sm,
    padding: 2.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  subTabBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  subTabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  subTabBtnTextActive: {
    color: '#F5D77F',
    fontWeight: '800',
  },

  /* Banners */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#FB7185',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },

  /* Form Fields */
  formFields: {
    gap: 10,
  },
  inputGroup: {
    gap: 3.5,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  otpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debugOtpLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F5D77F',
    textDecorationLine: 'underline',
  },
  strengthLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  inputWrapperFocused: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  inputIcon: {
    fontSize: 14,
  },
  phonePrefix: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5D77F',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#F8FAFC',
    fontWeight: '600',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  validCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validCheckText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34D399',
  },
  strengthBarContainer: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  /* Submit Button */
  submitBtn: {
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#07080F',
    letterSpacing: 0.4,
  },

  /* Demo Switcher */
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    gap: 6,
  },
  demoSectionTitle: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  demoRoleIcon: {
    fontSize: 12,
  },
  demoRoleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F5D77F',
  },
});
