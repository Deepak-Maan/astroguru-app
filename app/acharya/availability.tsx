import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors, radius, spacing, typography } from '../../src/theme';

type TimeSlot = { start: string; end: string };
type DaySchedule = { enabled: boolean; start: string; end: string };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const IDLE_OPTIONS = [5, 10, 15, 30];
const CHAT_OPTIONS = [1, 2, 3];

function nextTime(current: string, times: string[]): string {
  const idx = times.indexOf(current);
  return idx < times.length - 1 ? times[idx + 1] : times[idx];
}
function prevTime(current: string, times: string[]): string {
  const idx = times.indexOf(current);
  return idx > 0 ? times[idx - 1] : times[idx];
}

export default function Availability() {
  const [accepting, setAccepting] = useState(true);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    Mon: { enabled: true, start: '09:00', end: '21:00' },
    Tue: { enabled: true, start: '09:00', end: '21:00' },
    Wed: { enabled: true, start: '10:00', end: '20:00' },
    Thu: { enabled: true, start: '09:00', end: '21:00' },
    Fri: { enabled: true, start: '09:00', end: '22:00' },
    Sat: { enabled: true, start: '08:00', end: '22:00' },
    Sun: { enabled: false, start: '10:00', end: '18:00' },
  });
  const [lunchBreak, setLunchBreak] = useState(true);
  const [lunchStart, setLunchStart] = useState('13:00');
  const [lunchEnd, setLunchEnd] = useState('14:00');
  const [maxChats, setMaxChats] = useState(2);
  const [idleAway, setIdleAway] = useState(10);

  function updateDay(day: string, field: keyof DaySchedule, value: any) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  function handleSave() {
    if (Platform.OS === 'web') alert('✅ Availability schedule saved!');
    else Alert.alert('Schedule Saved ✅', 'Your availability has been updated. Seekers will see your new schedule immediately.');
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader title="Availability Schedule" subtitle="Set your working hours" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Currently Accepting Toggle */}
          <View style={styles.masterToggle}>
            <View style={{ flex: 1 }}>
              <Text style={styles.masterLabel}>Currently Accepting Consultations</Text>
              <Text style={styles.masterSub}>{accepting ? '🟢 Active — seekers can book you' : '🔴 Offline — no new requests'}</Text>
            </View>
            <Switch
              value={accepting}
              onValueChange={setAccepting}
              trackColor={{ true: colors.teal, false: '#CBD5E1' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Weekly Schedule */}
          <Text style={styles.sectionTitle}>📅 Weekly Schedule</Text>
          {DAYS.map((day) => {
            const d = schedule[day];
            return (
              <View key={day} style={[styles.dayCard, !d.enabled && { opacity: 0.5 }]}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayLabelBox}>
                    <Text style={styles.dayLabel}>{day}</Text>
                  </View>
                  <Switch
                    value={d.enabled}
                    onValueChange={(v) => updateDay(day, 'enabled', v)}
                    trackColor={{ true: colors.teal, false: '#CBD5E1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {d.enabled && (
                  <View style={styles.timeRow}>
                    <View style={styles.timeControl}>
                      <Text style={styles.timeLabel}>From</Text>
                      <View style={styles.timeStepper}>
                        <Pressable onPress={() => updateDay(day, 'start', prevTime(d.start, TIMES))} style={styles.stepBtn}>
                          <Text style={styles.stepBtnText}>‹</Text>
                        </Pressable>
                        <Text style={styles.timeValue}>{d.start}</Text>
                        <Pressable onPress={() => updateDay(day, 'start', nextTime(d.start, TIMES))} style={styles.stepBtn}>
                          <Text style={styles.stepBtnText}>›</Text>
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.timeDash}>→</Text>
                    <View style={styles.timeControl}>
                      <Text style={styles.timeLabel}>To</Text>
                      <View style={styles.timeStepper}>
                        <Pressable onPress={() => updateDay(day, 'end', prevTime(d.end, TIMES))} style={styles.stepBtn}>
                          <Text style={styles.stepBtnText}>‹</Text>
                        </Pressable>
                        <Text style={styles.timeValue}>{d.end}</Text>
                        <Pressable onPress={() => updateDay(day, 'end', nextTime(d.end, TIMES))} style={styles.stepBtn}>
                          <Text style={styles.stepBtnText}>›</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Lunch Break */}
          <Text style={styles.sectionTitle}>🍱 Lunch Break</Text>
          <View style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.masterLabel}>Enable Lunch Break</Text>
              <Switch value={lunchBreak} onValueChange={setLunchBreak} trackColor={{ true: colors.teal, false: '#CBD5E1' }} thumbColor="#FFFFFF" />
            </View>
            {lunchBreak && (
              <View style={styles.timeRow}>
                <View style={styles.timeControl}>
                  <Text style={styles.timeLabel}>Start</Text>
                  <View style={styles.timeStepper}>
                    <Pressable onPress={() => setLunchStart(prevTime(lunchStart, TIMES))} style={styles.stepBtn}><Text style={styles.stepBtnText}>‹</Text></Pressable>
                    <Text style={styles.timeValue}>{lunchStart}</Text>
                    <Pressable onPress={() => setLunchStart(nextTime(lunchStart, TIMES))} style={styles.stepBtn}><Text style={styles.stepBtnText}>›</Text></Pressable>
                  </View>
                </View>
                <Text style={styles.timeDash}>→</Text>
                <View style={styles.timeControl}>
                  <Text style={styles.timeLabel}>End</Text>
                  <View style={styles.timeStepper}>
                    <Pressable onPress={() => setLunchEnd(prevTime(lunchEnd, TIMES))} style={styles.stepBtn}><Text style={styles.stepBtnText}>‹</Text></Pressable>
                    <Text style={styles.timeValue}>{lunchEnd}</Text>
                    <Pressable onPress={() => setLunchEnd(nextTime(lunchEnd, TIMES))} style={styles.stepBtn}><Text style={styles.stepBtnText}>›</Text></Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Max Concurrent Chats */}
          <Text style={styles.sectionTitle}>💬 Max Concurrent Chats</Text>
          <View style={styles.optionRow}>
            {CHAT_OPTIONS.map((n) => (
              <Pressable key={n} onPress={() => setMaxChats(n)} style={[styles.optionBtn, maxChats === n && styles.optionBtnActive]}>
                <Text style={[styles.optionBtnText, maxChats === n && styles.optionBtnTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          {/* Auto Away */}
          <Text style={styles.sectionTitle}>⏰ Auto-Away After (minutes idle)</Text>
          <View style={styles.optionRow}>
            {IDLE_OPTIONS.map((n) => (
              <Pressable key={n} onPress={() => setIdleAway(n)} style={[styles.optionBtn, idleAway === n && styles.optionBtnActive]}>
                <Text style={[styles.optionBtnText, idleAway === n && styles.optionBtnTextActive]}>{n} min</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.saveBtnText}>✅ Save Schedule</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  masterToggle: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    shadowColor: '#BFDBFE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2,
  },
  masterLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  masterSub: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  dayCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(191,219,254,0.4)',
  },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabelBox: {
    width: 48, height: 34, borderRadius: radius.sm, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  dayLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeControl: { flex: 1, gap: 4 },
  timeLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  timeStepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(191,219,254,0.5)',
    overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#EFF6FF' },
  stepBtnText: { fontSize: 18, fontWeight: '800', color: colors.teal, lineHeight: 22 },
  timeValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '800', color: colors.text },
  timeDash: { fontSize: 16, color: colors.textMuted, fontWeight: '700', marginTop: 18 },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: 'rgba(191,219,254,0.6)', backgroundColor: '#FFFFFF', alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  optionBtnText: { fontSize: 14, fontWeight: '800', color: colors.textMuted },
  optionBtnTextActive: { color: '#FFFFFF' },
  saveBtn: {
    backgroundColor: colors.teal, borderRadius: radius.lg, padding: 16, alignItems: 'center',
    shadowColor: colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
