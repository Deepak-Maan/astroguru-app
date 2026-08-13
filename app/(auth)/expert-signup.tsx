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
import { Chip } from '../../src/components/Chip';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { ApiClient } from '../../src/services/apiClient';
import { firebaseExpertSignup } from '../../src/services/firebaseAuthService';

const ALL_SPECIALTIES = [
  'Vedic Astrology',
  'Kundli Prashna',
  'Nadi Shastra',
  'Tarot Cards',
  'Numerology',
  'Palmistry',
  'Vastu Shastra',
  'Lal Kitab',
];

const ALL_LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Gujarati', 'Marathi', 'Punjabi', 'Tamil', 'Telugu'];

export default function ExpertSignupScreen() {
  const router = useRouter();
  const setUserSession = useAuthStore((s) => s.setUserSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [experienceYears, setExperienceYears] = useState('10');
  const [pricePerMin, setPricePerMin] = useState('25');
  const [about, setAbout] = useState('');

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Vedic Astrology', 'Kundli Prashna']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'English']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      if (selectedSpecialties.length > 1) {
        setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
      }
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleExpertSignup = async () => {
    if (!name.trim()) return setError('Please enter your full name');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (!phone.trim()) return setError('Please enter your 10-digit mobile number');

    setLoading(true);
    setError(null);

    // 1️⃣ Firebase Expert Signup (works globally)
    try {
      const fbRes = await firebaseExpertSignup({
        name,
        email,
        phone,
        password,
        specialties: selectedSpecialties,
        languages: selectedLanguages,
        experienceYears,
        pricePerMin,
        about,
      });

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
      if (fbRes.error) {
        setLoading(false);
        setError(fbRes.error);
        return;
      }
    } catch (e) {
      console.warn('[Expert Signup Firebase fallback to local server]', e);
    }

    // 2️⃣ Fallback: local server signup
    const res = await ApiClient.expertSignup({
      name, email, phone, password,
      specialties: selectedSpecialties,
      languages: selectedLanguages,
      experienceYears, pricePerMin, about,
    });
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
      setError(res?.error || 'Registration failed. Please try again.');
    }
  };

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
      setError(res?.error || 'Expert registration failed.');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={[colors.saffron, colors.auroraA]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 32 }}>📜</Text>
              </View>
              <Text style={styles.brandTitle}>Register as Astrologer</Text>
              <Text style={styles.brandSubtitle}>Join AstroGuru verified expert panel & offer consultations</Text>
            </View>

            <Card style={styles.card}>
              <Text style={styles.sectionHeader}>👤 Basic Information</Text>

              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(t) => { setName(t); setError(null); }}
                  placeholder="Acharya Dev Sharma"
                  placeholderTextColor={colors.textFaint}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(null); }}
                  placeholder="acharya@jyotish.com"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mobile Number</Text>
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

              <View style={styles.field}>
                <Text style={styles.label}>Password (min 6 chars)</Text>
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(null); }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textFaint}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionHeader}>🔮 Professional Qualifications</Text>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Experience (Years)</Text>
                  <TextInput
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Price / Min (₹)</Text>
                  <TextInput
                    value={pricePerMin}
                    onChangeText={setPricePerMin}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Specialties (Select all that apply)</Text>
                <View style={styles.chipGrid}>
                  {ALL_SPECIALTIES.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      selected={selectedSpecialties.includes(spec)}
                      onPress={() => toggleSpecialty(spec)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Languages Spoken</Text>
                <View style={styles.chipGrid}>
                  {ALL_LANGUAGES.map((lang) => (
                    <Chip
                      key={lang}
                      label={lang}
                      selected={selectedLanguages.includes(lang)}
                      onPress={() => toggleLanguage(lang)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>About / Qualification Summary</Text>
                <TextInput
                  value={about}
                  onChangeText={setAbout}
                  placeholder="Senior Vedic scholar with 15+ years experience in Kundli Prashna & Dasha remedies."
                  placeholderTextColor={colors.textFaint}
                  multiline
                  style={[styles.input, { height: 70 }]}
                />
              </View>

              {!!error && <Text style={styles.errorText}>⚠️ {error}</Text>}

              <Button
                label={loading ? 'Registering Expert…' : '👑 Register as Verified Expert'}
                variant="gold"
                size="lg"
                loading={loading}
                onPress={handleExpertSignup}
              />
            </Card>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already Registered?</Text>
              <Pressable onPress={() => router.push('/(auth)/expert-login')}>
                <Text style={styles.footerLink}>Expert Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, flexGrow: 1, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  logoCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: spacing.xs },
  brandTitle: { ...typography.display, fontSize: 26, color: colors.text, fontWeight: '800' },
  brandSubtitle: { ...typography.small, color: colors.textMuted, textAlign: 'center', fontWeight: '600' },
  card: { gap: spacing.md, padding: spacing.xl },
  sectionHeader: { ...typography.h3, color: colors.saffron, fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: spacing.xs },
  field: { gap: spacing.xs },
  label: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, color: colors.text, fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  errorText: { ...typography.small, color: colors.danger, textAlign: 'center', fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerText: { ...typography.small, color: colors.textMuted, fontWeight: '600' },
  footerLink: { ...typography.small, color: colors.saffron, fontWeight: '800' },
});
