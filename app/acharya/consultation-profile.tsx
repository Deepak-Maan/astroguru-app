import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useJyotishiStore } from '../../src/store/jyotishiStore';
import {
  syncAstrologerProfileToDatabase,
  fetchAstrologerProfileFromDatabase,
} from '../../src/services/astrologerProfileService';

const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi'];
const SPECIALIZATIONS = [
  'Vedic Kundli',
  'Nadi Jyotish',
  'Lal Kitab',
  'Prashna Kundli',
  'KP System',
  'Muhurta',
  'Gemology & Remedies',
  'Vastu Shastra',
  'Numerology',
  'Palmistry',
  'Tarot Reading',
];

const AVATAR_PERSONAS = ['🪔', '☀️', '🔱', '🦚', '🕉️', '🧘', '🪐', '🔮'];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

export default function ConsultationProfile() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const jyotishiStoreRate = useJyotishiStore((s) => s.ratePerMin);
  const jyotishiStoreDuty = useJyotishiStore((s) => s.isOnDuty);

  const [name, setName] = useState(authUser?.name ?? 'Acharya Dev Sharma');
  const [email, setEmail] = useState(authUser?.email ?? 'acharya@astroguru.app');
  const [phone, setPhone] = useState(authUser?.phone ?? '9876543211');
  const [avatarEmoji, setAvatarEmoji] = useState('🪔');
  const [bio, setBio] = useState(
    'I am a Certified Vedic Astrologer with 12+ years of experience. Specializing in birth chart analysis, Dasha predictions, and Vedic remedies. I have guided 4,200+ seekers across India and abroad towards their cosmic destiny.'
  );
  const [experience, setExperience] = useState('12');
  const [rate, setRate] = useState(String(jyotishiStoreRate || 45));
  const [isOnline, setIsOnline] = useState(jyotishiStoreDuty);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Hindi', 'English']);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['Vedic Kundli', 'Nadi Jyotish', 'Lal Kitab', 'KP System']);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing astrologer data from database
  useEffect(() => {
    let isMounted = true;
    const astroId = authUser?.id || 'astro-1';

    fetchAstrologerProfileFromDatabase(astroId)
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.avatar && AVATAR_PERSONAS.includes(data.avatar)) {
          setAvatarEmoji(data.avatar);
        }
        if (data.about) setBio(data.about);
        if (data.experienceYears) setExperience(String(data.experienceYears));
        if (data.pricePerMin) setRate(String(data.pricePerMin));
        if (data.online !== undefined) setIsOnline(data.online);
        if (Array.isArray(data.languages) && data.languages.length > 0) {
          setSelectedLangs(data.languages);
        }
        if (Array.isArray(data.specialties) && data.specialties.length > 0) {
          setSelectedSpecs(data.specialties);
        }
      })
      .catch((err) => {
        console.warn('[ConsultationProfile] DB Load Warning:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  function toggleLang(lang: string) {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  function toggleSpec(spec: string) {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      setErrorMsg('Please enter your Acharya display name.');
      return;
    }
    const numRate = Number(rate);
    if (!rate || isNaN(numRate) || numRate <= 0) {
      setErrorMsg('Please enter a valid consultation rate (₹/min).');
      return;
    }
    const numExp = Number(experience);
    if (isNaN(numExp) || numExp < 0) {
      setErrorMsg('Please enter valid experience in years.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(null);

    const astroId = authUser?.id || 'astro-1';
    const res = await syncAstrologerProfileToDatabase({
      astrologerId: astroId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatarEmoji,
      about: bio.trim(),
      experienceYears: numExp,
      pricePerMin: numRate,
      specialties: selectedSpecs,
      languages: selectedLangs,
      online: isOnline,
      onDuty: isOnline,
    });

    setIsSaving(false);

    if (res.success) {
      setSaveSuccess('✨ Acharya profile & live rates updated in database!');
      if (Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_) {}
      }
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } else {
      setErrorMsg(res.error || 'Failed to update database. Please try again.');
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Edit Acharya Profile" subtitle="Manage your public astrologer persona & rates" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center', gap: 10 }}>
              <ActivityIndicator size="small" color={colors.gold} />
              <Text style={{ fontSize: 13, color: '#A5B4FC' }}>Loading profile from database…</Text>
            </View>
          ) : null}

          {/* Success Banner */}
          {!!saveSuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{saveSuccess}</Text>
            </View>
          )}

          {/* Error Banner */}
          {!!errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          {/* Live Preview Card */}
          <View style={styles.previewCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ position: 'relative' }}>
                <Avatar name={name || 'Acharya'} size={64} />
                <View style={styles.avatarPillBadge}>
                  <Text style={{ fontSize: 16 }}>{avatarEmoji}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewName}>{name || 'Acharya Name'}</Text>
                <Text style={styles.previewSub}>
                  {experience} Yrs Exp · ₹{rate}/min · {isOnline ? '🟢 Online' : '🔴 Offline'}
                </Text>
                <Text style={styles.previewContact} numberOfLines={1}>
                  {email || 'acharya@astroguru.app'} {phone ? `· +91 ${phone}` : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Spiritual Persona Avatar Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Spiritual Persona Emblem</Text>
            <View style={styles.avatarRow}>
              {AVATAR_PERSONAS.map((emoji) => {
                const isSelected = avatarEmoji === emoji;
                return (
                  <Pressable
                    key={emoji}
                    onPress={() => setAvatarEmoji(emoji)}
                    style={[styles.avatarChoice, isSelected && styles.avatarChoiceSelected]}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Visibility / On-Duty Toggle */}
          <View style={styles.visibilityCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.visLabel}>Consultation Availability</Text>
              <Text style={styles.visSub}>
                {isOnline ? '🟢 Available for instant calls & chats' : '🔴 Offline (no incoming requests)'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ true: colors.teal, false: '#475569' }}
              thumbColor={isOnline ? '#FCD34D' : '#94A3B8'}
            />
          </View>

          {/* Display Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Full Name / Title *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="e.g. Acharya Dev Sharma"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          {/* Phone & Email Row */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="10-digit number"
                placeholderTextColor={colors.textFaint}
                keyboardType="phone-pad"
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="acharya@email.com"
                placeholderTextColor={colors.textFaint}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Rate & Experience row */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Consultation Rate (₹/min) *</Text>
              <TextInput
                value={rate}
                onChangeText={setRate}
                style={[styles.input, { borderColor: '#FCD34D', color: '#FCD34D', fontWeight: '800' }]}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={colors.textFaint}
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>Experience (Years) *</Text>
              <TextInput
                value={experience}
                onChangeText={setExperience}
                style={styles.input}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={colors.textFaint}
              />
            </View>
          </View>

          {/* Bio / About */}
          <View style={styles.section}>
            <Text style={styles.label}>About / Bio / Lineage</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={[styles.input, styles.textArea]}
              placeholder="Describe your Jyotish expertise, Guru Parampara, and consultation approach…"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length} characters</Text>
          </View>

          {/* Languages Spoken */}
          <View style={styles.section}>
            <Text style={styles.label}>Languages Spoken ({selectedLangs.length} selected)</Text>
            <View style={styles.chipWrap}>
              {LANGUAGES.map((l) => (
                <Chip key={l} label={l} selected={selectedLangs.includes(l)} onPress={() => toggleLang(l)} />
              ))}
            </View>
          </View>

          {/* Specializations */}
          <View style={styles.section}>
            <Text style={styles.label}>Vedic Specializations ({selectedSpecs.length} selected)</Text>
            <View style={styles.chipWrap}>
              {SPECIALIZATIONS.map((s) => (
                <Chip key={s} label={s} selected={selectedSpecs.includes(s)} onPress={() => toggleSpec(s)} />
              ))}
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, isSaving && { opacity: 0.6 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#0A0C16" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>💾 Save Profile to Database</Text>
            )}
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 50 },
  previewCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
  },
  previewName: { fontSize: 17, fontWeight: '800', color: '#EEF2FF' },
  previewSub: { fontSize: 13, color: '#FCD34D', fontWeight: '700', marginTop: 2 },
  previewContact: { fontSize: 11, color: '#A5B4FC', fontWeight: '500', marginTop: 4 },
  avatarPillBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'rgba(10, 12, 22, 0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarChoice: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 33, 64, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChoiceSelected: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderColor: '#FCD34D',
    transform: [{ scale: 1.1 }],
  },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  visLabel: { fontSize: 14, fontWeight: '800', color: '#EEF2FF' },
  visSub: { fontSize: 12, color: '#A5B4FC', fontWeight: '600', marginTop: 2 },
  section: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#A5B4FC', marginBottom: 2 },
  input: {
    backgroundColor: 'rgba(10, 12, 22, 0.6)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
    padding: 12,
    fontSize: 14,
    color: '#EEF2FF',
    fontWeight: '500',
  },
  textArea: { minHeight: 90, paddingTop: 12 },
  charCount: { fontSize: 11, color: '#A5B4FC', alignSelf: 'flex-end' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  chipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12.5, fontWeight: '700', color: '#A5B4FC' },
  chipTextSelected: { color: '#FFFFFF' },
  saveBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: radius.lg,
    padding: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: { color: '#0A0C16', fontWeight: '900', fontSize: 15 },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  successText: { color: '#34D399', fontSize: 13, fontWeight: '800' },
  errorBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderRadius: radius.md,
    padding: 12,
  },
  errorText: { color: '#FB7185', fontSize: 12.5, fontWeight: '700' },
});
