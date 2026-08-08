import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { Chip } from '../../src/components/Chip';
import { AnimatedAuthOverlay } from '../../src/components/AnimatedAuthOverlay';
import { colors, radius, spacing, typography } from '../../src/theme';
import { City } from '../../src/types';
import { searchCities } from '../../src/data/cities';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { registerUserAccount } from '../../src/services/authService';

/** Numeric segmented input for DOB and Time */
function NumField({
  value,
  onChange,
  placeholder,
  max,
  width = 64,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  width?: number;
  label?: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      {!!label && <Text style={styles.microLabel}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, String(max).length))}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType="number-pad"
        style={[styles.input, { width, textAlign: 'center' }]}
        maxLength={String(max).length}
      />
    </View>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);
  const setProfile = useUserStore((s) => s.setProfile);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingUser, setPendingUser] = useState<any | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleOverlayFinish = () => {
    if (pendingUser) {
      setUserSession(pendingUser);
      router.replace('/(tabs)');
    }
  };

  // Auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Birth Details fields
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [hh, setHh] = useState('12');
  const [min, setMin] = useState('00');

  // City Search fields
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [showList, setShowList] = useState(false);

  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => searchCities(query, 8), [query]);

  const handleSignup = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate DOB if entered
    const d = Number(dd), m = Number(mm), y = Number(yyyy);
    if (!dd || !mm || !yyyy) {
      setError('Please enter your date of birth');
      return;
    }
    if (m < 1 || m > 12 || y < 1900 || y > 2100) {
      setError('Please enter a valid Date of Birth (DD/MM/YYYY)');
      return;
    }
    if (!city) {
      setError('Please select your Birth Place / City');
      return;
    }
    if (!agree) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await registerUserAccount({
      name,
      email,
      phone,
      password,
    });

    setLoading(false);

    if (res.success && res.user) {
      // Save Birth Details Profile for Kundli calculation
      const pad = (n: string) => n.padStart(2, '0');
      setProfile({
        name: name.trim(),
        gender,
        date: `${yyyy}-${pad(mm)}-${pad(dd)}`,
        time: `${pad(hh || '12')}:${pad(min || '00')}`,
        place: city,
      });

      setPendingUser(res.user);
      setShowOverlay(true);
    } else {
      setError(res.error || 'Account registration failed.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <AnimatedAuthOverlay
          visible={showOverlay}
          type="signup"
          message={`Welcome ${name || 'Seeker'}! Generating birth chart & Lagna... ✨`}
          onFinished={handleOverlayFinish}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: spacing.lg }}>
              {/* Header */}
              <View style={styles.hero}>
                <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient
                    colors={[colors.saffron, colors.auroraA]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.logoIcon}>🌟</Text>
                </Animated.View>
                <Text style={styles.brandTitle}>Create Account</Text>
                <Text style={styles.brandSubtitle}>Enter your details & birth chart info to get started</Text>
              </View>

            {/* Form Card */}
            <Card style={styles.card}>
              <Text style={styles.sectionHeader}>👤 Account Information</Text>

              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => { setName(t); setError(null); }}
                  placeholder="e.g. Ramesh Sharma"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                />
              </View>

              {/* Email Address */}
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  placeholder="ramesh@example.com"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.field}>
                <Text style={styles.label}>Mobile Number (Optional)</Text>
                <TextInput
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setError(null); }}
                  placeholder="9876543210"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password (min 6 characters)</Text>
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

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>🔮 Birth Details (For Kundli Chart)</Text>

              {/* Gender */}
              <View style={styles.field}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.row}>
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <Chip
                      key={g}
                      label={g[0].toUpperCase() + g.slice(1)}
                      selected={gender === g}
                      onPress={() => setGender(g)}
                    />
                  ))}
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.field}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.row}>
                  <NumField value={dd} onChange={setDd} placeholder="DD" max={31} label="Day" />
                  <NumField value={mm} onChange={setMm} placeholder="MM" max={12} label="Month" />
                  <NumField value={yyyy} onChange={setYyyy} placeholder="YYYY" max={2100} width={84} label="Year" />
                </View>
              </View>

              {/* Time of Birth */}
              <View style={styles.field}>
                <Text style={styles.label}>Time of Birth (24-hour)</Text>
                <View style={styles.row}>
                  <NumField value={hh} onChange={setHh} placeholder="HH" max={23} label="Hour" />
                  <NumField value={min} onChange={setMin} placeholder="MM" max={59} label="Minute" />
                </View>
              </View>

              {/* Place of Birth */}
              <View style={styles.field}>
                <Text style={styles.label}>Place of Birth / City</Text>
                {city ? (
                  <Pressable
                    onPress={() => {
                      setCity(null);
                      setQuery('');
                      setShowList(true);
                    }}
                    style={styles.selectedCity}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectedCityName}>{city.name}</Text>
                      <Text style={styles.selectedCityMeta}>
                        {city.state} · {city.lat.toFixed(2)}°N {city.lon.toFixed(2)}°E
                      </Text>
                    </View>
                    <Text style={styles.changeText}>Change</Text>
                  </Pressable>
                ) : (
                  <>
                    <TextInput
                      value={query}
                      onChangeText={(t) => {
                        setQuery(t);
                        setShowList(true);
                      }}
                      onFocus={() => setShowList(true)}
                      placeholder="Search city, e.g. Jaipur"
                      placeholderTextColor={colors.textFaint}
                      style={styles.input}
                    />
                    {showList && (
                      <View style={styles.list}>
                        {results.length === 0 ? (
                          <Text style={styles.noResult}>No match found. Try a nearby major city.</Text>
                        ) : (
                          results.map((c) => (
                            <Pressable
                              key={`${c.name}-${c.state}`}
                              onPress={() => {
                                setCity(c);
                                setShowList(false);
                                setQuery('');
                              }}
                              style={({ pressed }) => [
                                styles.listItem,
                                pressed && { backgroundColor: 'rgba(217,119,6,0.1)' },
                              ]}
                            >
                              <Text style={styles.listName}>{c.name}</Text>
                              <Text style={styles.listState}>{c.state}</Text>
                            </Pressable>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Checkbox agreement */}
              <Pressable
                onPress={() => setAgree(!agree)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                  {agree && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the <Text style={{ color: colors.saffron, fontWeight: '700' }}>Terms of Service</Text> & <Text style={{ color: colors.saffron, fontWeight: '700' }}>Privacy Policy</Text>
                </Text>
              </Pressable>

              {!!error && <Text style={styles.errorText}>⚠️ {error}</Text>}

              <Button
                label={loading ? 'Creating Your Account…' : '✨ Create Account & Generate Kundli'}
                variant="gold"
                size="lg"
                loading={loading}
                onPress={handleSignup}
                style={{ marginTop: spacing.xs }}
              />
            </Card>

              {/* Switch to Login */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            </Animated.View>
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
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  logoIcon: { fontSize: 32 },
  brandTitle: { ...typography.display, fontSize: 30, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },

  card: {
    gap: spacing.md,
    padding: spacing.xl,
  },

  sectionHeader: { ...typography.h3, color: colors.saffron, fontSize: 16, fontWeight: '800', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: spacing.xs },

  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  microLabel: { ...typography.tiny, color: colors.textFaint, fontWeight: '600' },

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

  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', flexWrap: 'wrap' },

  list: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
  },
  listItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  listName: { ...typography.body, color: colors.text, fontWeight: '700' },
  listState: { ...typography.tiny, color: colors.textMuted, marginTop: 1 },
  noResult: { ...typography.small, color: colors.textFaint, padding: spacing.md },
  selectedCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(13,148,136,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13,148,136,0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  selectedCityName: { ...typography.body, color: colors.text, fontWeight: '800' },
  selectedCityMeta: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  changeText: { ...typography.small, color: colors.saffron, fontWeight: '800' },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  checkboxText: { ...typography.tiny, color: colors.textMuted, flex: 1 },

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
