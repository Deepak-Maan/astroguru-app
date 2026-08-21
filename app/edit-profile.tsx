import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
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
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../src/theme';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { City } from '../src/types';
import { searchCities } from '../src/data/cities';

const { width } = Dimensions.get('window');

const SPIRITUAL_AVATARS = [
  '🕉️', '🪷', '🧘', '☀️', '🌙', '🪐', '👑', '🦚', '💎', '🔱', '🐘', '🔥'
];

const SPIRITUAL_FOCUS_AREAS = [
  { id: 'career', label: '💼 Career & Wealth', desc: 'Job promotions, business growth & investments' },
  { id: 'love', label: '❤️ Love & Marriage', desc: 'Kundli matching, marriage timing & harmony' },
  { id: 'health', label: '🌿 Health & Vitality', desc: 'Ayurvedic balance, longevity & healing' },
  { id: 'moksha', label: '📿 Spiritual Sadhana', desc: 'Meditation, Japa Mala & karmic purification' },
  { id: 'vastu', label: '🏠 Family & Vastu', desc: 'Home peace, child education & family unity' },
];

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi'];

export default function EditProfileScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  // Split existing date YYYY-MM-DD
  const defaultDateParts = profile?.date ? profile.date.split('-') : ['1998', '08', '15'];
  const defaultTimeParts = profile?.time ? profile.time.split(':') : ['10', '30'];

  const [name, setName] = useState(authUser?.name || profile?.name || '');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(profile?.gender || 'male');
  const [selectedAvatar, setSelectedAvatar] = useState(SPIRITUAL_AVATARS[0]);

  // Date & Time segmented inputs
  const [yyyy, setYyyy] = useState(defaultDateParts[0] || '1998');
  const [mm, setMm] = useState(defaultDateParts[1] || '08');
  const [dd, setDd] = useState(defaultDateParts[2] || '15');
  const [hh, setHh] = useState(defaultTimeParts[0] || '10');
  const [min, setMin] = useState(defaultTimeParts[1] || '30');

  // City search
  const [cityQuery, setCityQuery] = useState('');
  const [city, setCity] = useState<City | null>(
    profile?.place || { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }
  );
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Preferences
  const [focusArea, setFocusArea] = useState('career');
  const [prefLang, setPrefLang] = useState('English');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchResults = useMemo(() => searchCities(cityQuery, 6), [cityQuery]);

  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    if (Platform.OS !== 'web') {
      try {
        if (style === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your full name.';
    const d = Number(dd), m = Number(mm), y = Number(yyyy);
    const h = Number(hh), mi = Number(min);
    if (!dd || !mm || !yyyy) return 'Please enter a complete date of birth.';
    if (m < 1 || m > 12) return 'Month must be between 1 and 12.';
    if (y < 1900 || y > 2100) return 'Year must be between 1900 and 2100.';
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return `Day must be between 1 and ${daysInMonth} for that month.`;
    if (hh === '' || min === '') return 'Please enter your time of birth (use 12:00 if unknown).';
    if (h < 0 || h > 23) return 'Hour must be between 0 and 23.';
    if (mi < 0 || mi > 59) return 'Minute must be between 0 and 59.';
    if (!city) return 'Please select your birth place.';
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      triggerHaptic('medium');
      return;
    }
    setErrorMsg(null);

    const pad = (n: string) => n.padStart(2, '0');
    const formattedDate = `${yyyy}-${pad(mm)}-${pad(dd)}`;
    const formattedTime = `${pad(hh)}:${pad(min)}`;

    // 1. Update Auth Store user
    updateUser({
      name: name.trim(),
      phone: phone.trim(),
    });

    // 2. Update Birth Profile & recalculate Kundli
    setProfile({
      name: name.trim(),
      gender,
      date: formattedDate,
      time: formattedTime,
      place: city!,
    });

    triggerHaptic('success');
    setSavedSuccess(true);

    if (Platform.OS === 'web') {
      setTimeout(() => {
        router.back();
      }, 800);
    } else {
      Alert.alert(
        'Profile Updated! ✅',
        'Your profile and Janam Kundli chart have been updated with your new details.',
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Edit Profile"
          subtitle="Update your personal & Vedic details"
          showBack
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success Banner */}
            {savedSuccess && (
              <View style={styles.successBanner}>
                <LinearGradient
                  colors={['#ECFDF5', '#D1FAE5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={{ fontSize: 24 }}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.successTitle}>Profile & Kundli Updated!</Text>
                  <Text style={styles.successSub}>All astrological parameters refreshed successfully.</Text>
                </View>
              </View>
            )}

            {/* Error Banner */}
            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* ── Section 1: Compact Spiritual Avatar Selector ── */}
            <View style={styles.avatarSectionCard}>
              <View style={styles.avatarHeroRow}>
                <View style={styles.mainAvatarWrapper}>
                  <View style={styles.mainAvatarInner}>
                    <LinearGradient
                      colors={['#FEF3C7', '#FDE68A']}
                      style={[StyleSheet.absoluteFill, { borderRadius: 30 }]}
                    />
                    <Text style={{ fontSize: 32 }}>{selectedAvatar}</Text>
                  </View>
                  <View style={styles.avatarEditBadge}>
                    <Text style={{ fontSize: 9 }}>✨</Text>
                  </View>
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.sectionTitle}>Spiritual Avatar</Text>
                  <Text style={styles.sectionDesc}>Tap any sacred symbol below to change</Text>
                </View>
              </View>

              {/* Horizontal / Compact Avatar Row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarScrollRow}
                style={{ flexGrow: 0 }}
              >
                {SPIRITUAL_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av;
                  return (
                    <Pressable
                      key={av}
                      onPress={() => {
                        triggerHaptic('light');
                        setSelectedAvatar(av);
                      }}
                      style={[styles.avatarMiniCell, isSelected && styles.avatarMiniCellActive]}
                    >
                      <Text style={{ fontSize: 20 }}>{av}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Section 2: Personal Information ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionIconBox}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Personal Details</Text>
                  <Text style={styles.sectionDesc}>Basic identity & contact preferences</Text>
                </View>
              </View>

              {/* Full Name Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Aarav Sharma"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                  autoCapitalize="words"
                />
              </View>

              {/* Phone Number Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PHONE NUMBER (FOR APPOINTMENT SMS)</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    style={[styles.textInput, { flex: 1 }]}
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Email (Read-Only) */}
              <View style={styles.fieldGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                  <Text style={styles.verifiedBadge}>🔒 VERIFIED</Text>
                </View>
                <View style={styles.readOnlyInput}>
                  <Text style={styles.readOnlyText}>{authUser?.email || 'seeker@astroguru.app'}</Text>
                </View>
              </View>

              {/* Gender Radio */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>GENDER</Text>
                <View style={styles.genderRow}>
                  {[
                    { id: 'male', label: 'Male ♂️' },
                    { id: 'female', label: 'Female ♀️' },
                    { id: 'other', label: 'Other ⚧️' },
                  ].map((g) => {
                    const isSelected = gender === g.id;
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => {
                          triggerHaptic('light');
                          setGender(g.id as any);
                        }}
                        style={[styles.genderChip, isSelected && styles.genderChipActive]}
                      >
                        <Text style={[styles.genderChipText, isSelected && styles.genderChipTextActive]}>
                          {g.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Section 3: Sacred Vedic Birth Details ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={{ fontSize: 16 }}>🪐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Vedic Birth Parameters</Text>
                  <Text style={styles.sectionDesc}>Used to calculate Lagna, Rashi & Dasha cycles</Text>
                </View>
              </View>

              {/* Date of Birth */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DATE OF BIRTH (DD / MM / YYYY)</Text>
                <View style={styles.segmentedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.microLabel}>DAY (DD)</Text>
                    <TextInput
                      value={dd}
                      onChangeText={(t) => setDd(t.replace(/[^0-9]/g, '').slice(0, 2))}
                      placeholder="15"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={2}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                  <Text style={styles.slashDivider}>/</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.microLabel}>MONTH (MM)</Text>
                    <TextInput
                      value={mm}
                      onChangeText={(t) => setMm(t.replace(/[^0-9]/g, '').slice(0, 2))}
                      placeholder="08"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={2}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                  <Text style={styles.slashDivider}>/</Text>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.microLabel}>YEAR (YYYY)</Text>
                    <TextInput
                      value={yyyy}
                      onChangeText={(t) => setYyyy(t.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="1998"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={4}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                </View>
              </View>

              {/* Time of Birth */}
              <View style={styles.fieldGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.fieldLabel}>TIME OF BIRTH (24-HOUR HH : MM)</Text>
                  <Pressable
                    onPress={() => {
                      triggerHaptic('light');
                      setHh('12');
                      setMin('00');
                    }}
                  >
                    <Text style={styles.approxBtnText}>⚡ Don't know? (Use 12:00 PM)</Text>
                  </Pressable>
                </View>

                <View style={styles.segmentedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.microLabel}>HOUR (00-23)</Text>
                    <TextInput
                      value={hh}
                      onChangeText={(t) => setHh(t.replace(/[^0-9]/g, '').slice(0, 2))}
                      placeholder="10"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={2}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                  <Text style={styles.slashDivider}>:</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.microLabel}>MINUTE (00-59)</Text>
                    <TextInput
                      value={min}
                      onChangeText={(t) => setMin(t.replace(/[^0-9]/g, '').slice(0, 2))}
                      placeholder="30"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={2}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                </View>
              </View>

              {/* Place of Birth */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PLACE OF BIRTH (CITY, STATE)</Text>

                {city && (
                  <View style={styles.selectedCityPill}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.selectedCityName}>{city.name}, {city.state}</Text>
                      <Text style={styles.selectedCityCoords}>
                        Lat: {city.lat.toFixed(2)}° · Lon: {city.lon.toFixed(2)}° · TZ: +{city.tz}h IST
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        triggerHaptic('light');
                        setShowCityDropdown(true);
                      }}
                      style={styles.changeCityBtn}
                    >
                      <Text style={styles.changeCityBtnText}>Change</Text>
                    </Pressable>
                  </View>
                )}

                {(!city || showCityDropdown) && (
                  <View style={{ gap: 8, marginTop: 4 }}>
                    <TextInput
                      value={cityQuery}
                      onChangeText={setCityQuery}
                      placeholder="Search city (e.g. Mumbai, Delhi, Varanasi...)"
                      placeholderTextColor="#94A3B8"
                      style={styles.textInput}
                    />

                    {searchResults.length > 0 && (
                      <View style={styles.cityDropdownCard}>
                        {searchResults.map((c) => (
                          <Pressable
                            key={`${c.name}-${c.state}`}
                            onPress={() => {
                              triggerHaptic('light');
                              setCity(c);
                              setShowCityDropdown(false);
                              setCityQuery('');
                            }}
                            style={styles.cityDropdownRow}
                          >
                            <Text style={styles.cityRowIcon}>📍</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.cityRowName}>{c.name}</Text>
                              <Text style={styles.cityRowState}>{c.state}</Text>
                            </View>
                            <Text style={styles.citySelectArrow}>›</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* ── Section 4: Spiritual Preferences & Focus Area ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={{ fontSize: 16 }}>✨</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Primary Spiritual Focus</Text>
                  <Text style={styles.sectionDesc}>Tailors your daily Jyotish insights & AI guidance</Text>
                </View>
              </View>

              <View style={{ gap: 8, marginTop: 6 }}>
                {SPIRITUAL_FOCUS_AREAS.map((item) => {
                  const isSelected = focusArea === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        triggerHaptic('light');
                        setFocusArea(item.id);
                      }}
                      style={[styles.focusCard, isSelected && styles.focusCardActive]}
                    >
                      <View style={styles.focusRadio}>
                        {isSelected && <View style={styles.focusRadioInner} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.focusTitle, isSelected && { color: '#7C3AED' }]}>
                          {item.label}
                        </Text>
                        <Text style={styles.focusDesc}>{item.desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Language Selection */}
              <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                <Text style={styles.fieldLabel}>PREFERRED LANGUAGE FOR CONSULTATIONS</Text>
                <View style={styles.langGrid}>
                  {LANGUAGES.map((lang) => {
                    const isSelected = prefLang === lang;
                    return (
                      <Pressable
                        key={lang}
                        onPress={() => {
                          triggerHaptic('light');
                          setPrefLang(lang);
                        }}
                        style={[styles.langPill, isSelected && styles.langPillActive]}
                      >
                        <Text style={[styles.langPillText, isSelected && styles.langPillTextActive]}>
                          {lang}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ── Save Action Button ── */}
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B', '#EA580C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.saveButtonText}>🌟 Save Profile & Update Kundli</Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: 14,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    overflow: 'hidden',
    gap: 10,
  },
  successTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#065F46',
  },
  successSub: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    marginTop: 2,
  },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  sectionDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Compact Avatar Section */
  avatarSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  avatarHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainAvatarWrapper: {
    width: 62,
    height: 62,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAvatarInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
    backgroundColor: '#FEF3C7',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#D97706',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarScrollRow: {
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  avatarMiniCell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarMiniCellActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
    borderWidth: 2,
    shadowColor: '#D97706',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Field Groups */
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Phone Input */
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },

  /* Read-Only Input */
  readOnlyInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  readOnlyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  verifiedBadge: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.5,
  },

  /* Gender Row */
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  genderChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  genderChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  genderChipTextActive: {
    color: '#B45309',
    fontWeight: '900',
  },

  /* Segmented Inputs */
  segmentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  microLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
    textAlign: 'center',
  },
  slashDivider: {
    fontSize: 18,
    fontWeight: '800',
    color: '#CBD5E1',
    marginTop: 12,
  },
  approxBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D97706',
  },

  /* Selected City Pill */
  selectedCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  selectedCityName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#78350F',
  },
  selectedCityCoords: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B45309',
    marginTop: 2,
  },
  changeCityBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  changeCityBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#D97706',
  },

  /* City Dropdown */
  cityDropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cityDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cityRowIcon: {
    fontSize: 14,
  },
  cityRowName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  cityRowState: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  citySelectArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
  },

  /* Focus Card */
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  focusCardActive: {
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
    borderWidth: 1.5,
  },
  focusRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#7C3AED',
  },
  focusTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  focusDesc: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },

  /* Language Grid */
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  langPillTextActive: {
    color: '#059669',
    fontWeight: '900',
  },

  /* Save Button */
  saveButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
