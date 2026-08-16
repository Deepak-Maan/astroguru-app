import React, { useMemo, useState } from 'react';
import {
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
import { GradientBackground } from '../../src/components/GradientBackground';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { colors, radius, spacing, typography } from '../../src/theme';
import { City } from '../../src/types';
import { searchCities } from '../../src/data/cities';
import { useUserStore } from '../../src/store/userStore';

/** Numeric segmented input (works identically on web and native). */
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

export default function BirthDetails() {
  const router = useRouter();
  const setProfile = useUserStore((s) => s.setProfile);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [hh, setHh] = useState('');
  const [min, setMin] = useState('');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => searchCities(query, 8), [query]);

  function validate(): string | null {
    if (!name.trim()) return 'Please enter your name.';
    const d = Number(dd), m = Number(mm), y = Number(yyyy);
    const h = Number(hh), mi = Number(min);
    if (!dd || !mm || !yyyy) return 'Please enter your full date of birth.';
    if (m < 1 || m > 12) return 'Month must be between 1 and 12.';
    if (y < 1900 || y > 2100) return 'Please enter a year between 1900 and 2100.';
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return `Day must be between 1 and ${daysInMonth} for that month.`;
    if (hh === '' || min === '') return 'Please enter your time of birth (use 00:00 if unknown).';
    if (h < 0 || h > 23) return 'Hour must be between 0 and 23.';
    if (mi < 0 || mi > 59) return 'Minute must be between 0 and 59.';
    if (!city) return 'Please select your birth place.';
    return null;
  }

  function onSubmit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const pad = (n: string) => n.padStart(2, '0');
    setProfile({
      name: name.trim(),
      gender,
      date: `${yyyy}-${pad(mm)}-${pad(dd)}`,
      time: `${pad(hh)}:${pad(min)}`,
      place: city!,
    });
    router.replace('/(tabs)');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Your Birth Details</Text>
            <Text style={styles.subtitle}>
              Vedic astrology needs an exact date, time and place to calculate your Lagna
              (ascendant) and planetary positions.
            </Text>

            <Card style={styles.card}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Aarav Sharma"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                autoCapitalize="words"
              />

              <Text style={[styles.label, styles.mt]}>Gender</Text>
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

              <Text style={[styles.label, styles.mt]}>Date of birth</Text>
              <View style={styles.row}>
                <NumField value={dd} onChange={setDd} placeholder="DD" max={31} label="Day" />
                <NumField value={mm} onChange={setMm} placeholder="MM" max={12} label="Month" />
                <NumField value={yyyy} onChange={setYyyy} placeholder="YYYY" max={2100} width={84} label="Year" />
              </View>

              <Text style={[styles.label, styles.mt]}>Time of birth (24-hour)</Text>
              <View style={styles.row}>
                <NumField value={hh} onChange={setHh} placeholder="HH" max={23} label="Hour" />
                <NumField value={min} onChange={setMin} placeholder="MM" max={59} label="Minute" />
                <Text style={styles.hint}>
                  Check your birth certificate{'\n'}if you are unsure.
                </Text>
              </View>

              <Text style={[styles.label, styles.mt]}>Place of birth</Text>
              {city ? (
                <Pressable
                  onPress={() => {
                    setCity(null);
                    setShowList(true);
                  }}
                  style={styles.selectedCity}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCityName}>📍 {city.name}, {city.state}</Text>
                    <Text style={styles.selectedCityMeta}>
                      Lat: {city.lat.toFixed(2)}° · Lon: {city.lon.toFixed(2)}° · TZ: UTC+{city.tz}
                    </Text>
                  </View>
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              ) : (
                <>
                  {/* GPS Auto-Detect Button */}
                  <Pressable
                    onPress={() => {
                      if (typeof navigator !== 'undefined' && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const lat = pos.coords.latitude;
                            const lon = pos.coords.longitude;
                            // Find nearest city or use coordinates
                            const nearest = results[0] || {
                              name: 'Current Location',
                              state: 'India',
                              lat: lat || 28.6139,
                              lon: lon || 77.2090,
                              tz: 5.5,
                            };
                            setCity(nearest);
                            setShowList(false);
                          },
                          () => {
                            // Fallback to default capital city
                            setCity({
                              name: 'New Delhi',
                              state: 'Delhi',
                              lat: 28.6139,
                              lon: 77.2090,
                              tz: 5.5,
                            });
                            setShowList(false);
                          }
                        );
                      } else {
                        setCity({
                          name: 'New Delhi',
                          state: 'Delhi',
                          lat: 28.6139,
                          lon: 77.2090,
                          tz: 5.5,
                        });
                        setShowList(false);
                      }
                    }}
                    style={({ pressed }) => [styles.gpsBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.gpsIcon}>📍</Text>
                    <Text style={styles.gpsText}>Use Current Location (GPS Auto-Detect)</Text>
                  </Pressable>

                  {/* Popular City Quick Chips */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                    {[
                      { name: 'New Delhi', state: 'Delhi', lat: 28.61, lon: 77.20, tz: 5.5 },
                      { name: 'Mumbai', state: 'Maharashtra', lat: 19.07, lon: 72.87, tz: 5.5 },
                      { name: 'Bengaluru', state: 'Karnataka', lat: 12.97, lon: 77.59, tz: 5.5 },
                      { name: 'Jaipur', state: 'Rajasthan', lat: 26.91, lon: 75.78, tz: 5.5 },
                      { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.31, lon: 82.97, tz: 5.5 },
                    ].map((c) => (
                      <Pressable
                        key={c.name}
                        onPress={() => {
                          setCity(c);
                          setShowList(false);
                        }}
                        style={styles.popularCityChip}
                      >
                        <Text style={styles.popularCityText}>{c.name}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <TextInput
                    value={query}
                    onChangeText={(t) => {
                      setQuery(t);
                      setShowList(true);
                    }}
                    onFocus={() => setShowList(true)}
                    placeholder="Or search city, e.g. Ahmedabad, Pune..."
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                  />
                  {showList && (
                    <View style={styles.list}>
                      {results.length === 0 ? (
                        <Text style={styles.noResult}>
                          No match. Try a nearby larger city.
                        </Text>
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
                              pressed && { backgroundColor: 'rgba(255,255,255,0.08)' },
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
            </Card>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button label="Generate My Kundli" variant="gold" size="lg" onPress={onSubmit} />
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, lineHeight: 19, marginTop: -8 },
  card: { gap: spacing.xs },
  label: { ...typography.small, color: colors.textMuted, fontWeight: '700', marginBottom: 6 },
  microLabel: { ...typography.tiny, color: colors.textFaint },
  mt: { marginTop: spacing.lg },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'web' ? 12 : 11,
    color: colors.text,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', flexWrap: 'wrap' },
  hint: { ...typography.tiny, color: colors.textFaint, flex: 1, lineHeight: 14, paddingBottom: 4 },
  list: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardSolid,
    overflow: 'hidden',
  },
  listItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  listName: { ...typography.body, color: colors.text },
  listState: { ...typography.tiny, color: colors.textFaint, marginTop: 1 },
  noResult: { ...typography.small, color: colors.textFaint, padding: spacing.md },
  selectedCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(56,225,195,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(56,225,195,0.4)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  selectedCityName: { ...typography.body, color: colors.text, fontWeight: '700' },
  selectedCityMeta: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  changeText: { ...typography.small, color: colors.teal, fontWeight: '700' },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.35)',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  gpsIcon: {
    fontSize: 16,
  },
  gpsText: {
    ...typography.small,
    color: '#D97706',
    fontWeight: '700',
  },
  popularCityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  popularCityText: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  error: {
    ...typography.small,
    color: colors.danger,
    backgroundColor: 'rgba(255,90,110,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
