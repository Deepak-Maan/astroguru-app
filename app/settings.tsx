import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../src/components/GradientBackground';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SectionHeader } from '../src/components/SectionHeader';
import { AnimatedAuthOverlay } from '../src/components/AnimatedAuthOverlay';
import { colors, radius, spacing, typography } from '../src/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { useChatStore } from '../src/store/chatStore';
import { useSecurityStore } from '../src/store/securityStore';
import { useAuthStore } from '../src/store/authStore';
import { useUpdateStore } from '../src/store/updateStore';
import {
  scheduleDailyMorningMuhuratPush,
  triggerInstantMorningMuhuratTestPush,
} from '../src/services/pushNotificationService';

export default function Settings() {
  const router = useRouter();
  const apiKey = useSettingsStore((s) => s.apiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const morningMuhuratPushEnabled = useSettingsStore((s) => s.morningMuhuratPushEnabled);
  const toggleMorningMuhuratPush = useSettingsStore((s) => s.toggleMorningMuhuratPush);
  const clearAiChat = useChatStore((s) => s.clearAiChat);

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Updates Store
  const currentVersion = useUpdateStore((s) => s.currentVersion);
  const latestVersion = useUpdateStore((s) => s.latestVersion);
  const updateAvailable = useUpdateStore((s) => s.updateAvailable);
  const checkForUpdates = useUpdateStore((s) => s.checkForUpdates);
  const triggerUpdateModal = useUpdateStore((s) => s.triggerUpdateModal);

  // Security Store
  const {
    isPinEnabled,
    isBiometricEnabled,
    maskWalletBalance,
    encryptLocalData,
    enablePin,
    disablePin,
    lockApp,
    toggleBiometric,
    toggleMaskWallet,
    toggleEncryptData,
  } = useSecurityStore();

  const [draft, setDraft] = useState('');
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // Set PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('1234');

  const masked = apiKey
    ? `${apiKey.slice(0, 10)}${'•'.repeat(14)}${apiKey.slice(-4)}`
    : null;

  async function save() {
    const key = draft.trim();
    if (!key) {
      setError('Please paste a key first.');
      return;
    }
    if (!key.startsWith('sk-ant-')) {
      setError('That does not look like an Anthropic key — it should start with "sk-ant-".');
      return;
    }
    setError(null);
    await setApiKey(key);
    setDraft('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function remove() {
    await clearApiKey();
    setDraft('');
    setError(null);
  }

  const handleSavePin = () => {
    if (newPinInput.length !== 4) {
      alert('PIN must be 4 digits long!');
      return;
    }
    enablePin(newPinInput);
    setShowPinModal(false);
  };

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    const res = await checkForUpdates();
    setCheckingUpdate(false);

    if (res.isNewAvailable) {
      triggerUpdateModal();
    } else {
      if (Platform.OS === 'web') {
        alert(`✨ AstroGuru is up to date!\nYou are currently running the latest version (v${res.currentVersion}).`);
      } else {
        Alert.alert(
          'App Up to Date',
          `✨ AstroGuru is up to date!\nYou are running the latest version (v${res.currentVersion}).`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  const handleSignOut = () => {
    const doLogout = () => {
      setShowLogoutOverlay(true);
    };

    if (Platform.OS === 'web') {
      if (typeof confirm === 'function' && confirm('Are you sure you want to sign out?')) {
        doLogout();
      } else {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Sign Out of AstroGuru?',
      'You will need to sign in again to access your wallet and consultations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doLogout },
      ]
    );
  };

  const handleLogoutFinished = () => {
    router.replace('/(auth)/login');
    setTimeout(() => {
      logout();
    }, 50);
  };

  const handleDeleteAccount = () => {
    const doDelete = () => {
      clearAiChat();
      logout();
      if (Platform.OS === 'web') {
        alert('Your AstroGuru account and all associated data have been permanently deleted.');
        router.replace('/(auth)/login');
      } else {
        Alert.alert(
          'Account & Data Purged',
          'Your account, birth charts, kundli records, and consultation history have been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    };

    if (Platform.OS === 'web') {
      if (
        typeof confirm === 'function' &&
        confirm(
          '⚠️ PERMANENT ACCOUNT DELETION\n\nAre you sure you want to permanently delete your AstroGuru account?\nAll your birth charts, saved kundlis, consultation history, and wallet coins will be permanently purged.\nThis action cannot be undone.'
        )
      ) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      '⚠️ Delete Account & Wipe Data?',
      'This will permanently delete your AstroGuru account, birth charts, saved kundlis, consultation messages, and wallet balance.\n\nThis action is irreversible. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: doDelete,
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <AnimatedAuthOverlay
          visible={showLogoutOverlay}
          type="logout"
          message="Session securely ended."
          onFinished={handleLogoutFinished}
        />
        <ScreenHeader title="Settings" showBack />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* App Version & Manual Update Checker */}
          <View>
            <SectionHeader
              title="🚀 App Updates & Version"
              subtitle={`Current Installed Version: v${currentVersion}`}
            />
            <Card padded={false}>
              <Pressable
                onPress={handleManualCheckUpdate}
                disabled={checkingUpdate}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={[
                        styles.prefLabel,
                        { color: updateAvailable ? colors.saffron : '#10B981', fontWeight: '700' },
                      ]}
                    >
                      {checkingUpdate
                        ? '⏳ Checking Server for Updates…'
                        : updateAvailable
                        ? `🚀 Update Available: v${latestVersion}`
                        : '✨ App is up to date'}
                    </Text>
                    <View
                      style={{
                        backgroundColor: updateAvailable
                          ? 'rgba(245, 158, 11, 0.18)'
                          : 'rgba(16, 185, 129, 0.15)',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: radius.sm,
                        borderWidth: 1,
                        borderColor: updateAvailable
                          ? 'rgba(245, 158, 11, 0.35)'
                          : 'rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: updateAvailable ? colors.saffron : '#10B981',
                        }}
                      >
                        {updateAvailable ? 'UPDATE' : `v${currentVersion}`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.prefSub}>
                    {updateAvailable
                      ? `Installed: v${currentVersion} · Server Latest: v${latestVersion}`
                      : 'You are running the latest version. Tap to check again.'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.chevron,
                    { color: updateAvailable ? colors.saffron : colors.textMuted },
                  ]}
                >
                  {checkingUpdate ? '⏳' : '🔄'}
                </Text>
              </Pressable>

              {/* ONLY ONE Update Button: Strictly shown ONLY when updateAvailable is true */}
              {updateAvailable && (
                <Pressable
                  onPress={() => triggerUpdateModal()}
                  style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.75 }]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.prefLabel, { color: '#10B981', fontWeight: '800' }]}>
                        📥 Update to v{latestVersion}
                      </Text>
                      <View
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.18)',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: radius.sm,
                          borderWidth: 1,
                          borderColor: 'rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: '900', color: '#34D399' }}>NEW</Text>
                      </View>
                    </View>
                    <Text style={styles.prefSub}>
                      Tap to download & install the latest version
                    </Text>
                  </View>
                  <Text style={[styles.chevron, { color: '#10B981' }]}>›</Text>
                </Pressable>
              )}
            </Card>
          </View>

          {/* Security & Privacy Vault */}
          <View>
            <SectionHeader
              title="🛡️ Security & Privacy Vault"
              subtitle="App Passcode, Biometrics & Encryption"
            />
            <Card padded={false}>
              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>🔒 4-Digit Passcode Lock</Text>
                  <Text style={styles.prefSub}>
                    {isPinEnabled ? `Active (PIN: ****)` : 'Require PIN on app launch'}
                  </Text>
                </View>
                <Switch
                  value={isPinEnabled}
                  onValueChange={(val) => {
                    if (val) {
                      setShowPinModal(true);
                    } else {
                      disablePin();
                    }
                  }}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>👆 Biometric / Face ID</Text>
                  <Text style={styles.prefSub}>Unlock app using fingerprint or Face ID</Text>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>🙈 Mask Wallet Balance</Text>
                  <Text style={styles.prefSub}>Hide wallet balance as ₹*** on header</Text>
                </View>
                <Switch
                  value={maskWalletBalance}
                  onValueChange={toggleMaskWallet}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>🔐 Local AES-256 Vault</Text>
                  <Text style={styles.prefSub}>Encrypt Kundli charts & chat logs locally</Text>
                </View>
                <Switch
                  value={encryptLocalData}
                  onValueChange={toggleEncryptData}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              {isPinEnabled && (
                <Pressable
                  onPress={lockApp}
                  style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prefLabel, { color: colors.saffron }]}>🔒 Lock App Now (Test Security)</Text>
                    <Text style={styles.prefSub}>Triggers the passcode lock screen immediately</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              )}
            </Card>
          </View>

          {/* Preferences */}
          <View>
            <SectionHeader title="Preferences" />
            <Card padded={false}>
              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>Haptics & sounds</Text>
                  <Text style={styles.prefSub}>Feedback on taps and new messages</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={toggleSound}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              {/* Feature 9: Subah Ka Shubh Muhurat Daily 7:00 AM Push */}
              <View style={styles.prefRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>🌅 Subah Ka Shubh Muhurat (7:00 AM)</Text>
                  <Text style={styles.prefSub}>Daily lock screen push with Abhijit Muhurat & Rahu Kaal</Text>
                </View>
                <Switch
                  value={morningMuhuratPushEnabled}
                  onValueChange={(val) => {
                    toggleMorningMuhuratPush();
                    scheduleDailyMorningMuhuratPush(val);
                  }}
                  trackColor={{ false: '#E3E8F3', true: colors.saffron }}
                  thumbColor={colors.white}
                />
              </View>

              <Pressable
                onPress={() => {
                  triggerInstantMorningMuhuratTestPush();
                  Alert.alert('🌅 Shubh Muhurat Alert Sent', 'Check your notifications to preview the 7:00 AM morning lock-screen push.');
                }}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.prefLabel, { color: colors.teal }]}>🔔 Test 7:00 AM Muhurat Alert Now</Text>
                  <Text style={styles.prefSub}>Triggers an instant preview push notification</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              <Pressable
                onPress={clearAiChat}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>Clear AI chat history</Text>
                  <Text style={styles.prefSub}>Deletes the AI Jyotishi conversation</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Card>
          </View>

          {/* Account Session & Sign Out */}
          <View>
            <SectionHeader title="Account Session" subtitle={`Logged in as ${authUser?.email ?? 'Seeker'}`} />
            <Card padded={false}>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.prefLabel, { color: colors.gold }]}>🚪 Sign Out of Account</Text>
                  <Text style={styles.prefSub}>Logs you out and returns to the Login screen</Text>
                </View>
                <Text style={[styles.chevron, { color: colors.gold }]}>›</Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteAccount}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.prefLabel, { color: '#EF4444' }]}>🗑️ Delete Account & Wipe Data</Text>
                  <Text style={styles.prefSub}>Permanently erases all birth charts, kundli records & wallet coins</Text>
                </View>
                <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
              </Pressable>
            </Card>
          </View>

          {/* Legal & Policy Compliance */}
          <View>
            <SectionHeader title="Legal & Compliance" subtitle="Google Play Data Safety & Privacy" />
            <Card padded={false}>
              <Pressable
                onPress={() => router.push('/privacy')}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>🛡️ Privacy Policy</Text>
                  <Text style={styles.prefSub}>Strict zero-data-selling privacy pledge & data usage terms</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('https://astroguru.app/delete-account.html').catch(() => {})}
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.65 }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>📜 Account & Data Deletion Guide</Text>
                  <Text style={styles.prefSub}>Public web procedure for manual and offline deletion requests</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Card>
          </View>

          {/* About */}
          <View>
            <SectionHeader title="About AstroGuru" />
            <Card style={{ gap: spacing.md }}>
              <Text style={styles.aboutTitle}>AstroGuru · v{currentVersion}</Text>
              <Text style={styles.help}>
                Kundli, Lagna, Rashi and Nakshatra are computed on-device using the Lahiri
                ayanamsa — no internet required. Sun and Moon positions are highly accurate.
              </Text>
              <View style={{ marginTop: spacing.xs, padding: spacing.md, backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                <Text style={{ ...typography.tiny, color: colors.gold, fontWeight: '800', marginBottom: 3 }}>
                  ⚖️ Astrological Guidance Disclaimer:
                </Text>
                <Text style={{ ...typography.tiny, color: '#CBD5E1', lineHeight: 16 }}>
                  AstroGuru provides astrological calculations, Janam Kundli charts, and Vedic insights for spiritual, educational, and cultural purposes. Astrological readings should not replace certified financial, legal, or medical advice.
                </Text>
              </View>
            </Card>
          </View>
        </ScrollView>

        {/* ── SET PIN MODAL ── */}
        <Modal visible={showPinModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set 4-Digit Security Passcode</Text>
              <Text style={styles.modalSub}>This PIN will be required whenever you open AstroGuru.</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Enter 4-Digit PIN:</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={newPinInput}
                  onChangeText={setNewPinInput}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={() => setShowPinModal(false)}
                />
                <Button
                  label="Enable Passcode"
                  variant="gold"
                  size="sm"
                  fullWidth={false}
                  style={{ flex: 1 }}
                  onPress={handleSavePin}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  help: { ...typography.small, color: '#A5B4FC', lineHeight: 19 },
  input: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: '#EEF2FF',
    fontSize: 14,
    minHeight: 44,
  },
  toggleReveal: { ...typography.tiny, color: colors.gold, fontWeight: '700' },
  error: { ...typography.small, color: colors.danger },
  link: { ...typography.small, color: colors.gold, fontWeight: '700', textAlign: 'center' },
  savedNote: { ...typography.small, color: colors.success, fontWeight: '700' },

  keyActive: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  keyActiveIcon: { fontSize: 20 },
  keyActiveTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  keyMasked: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  keyBtnRow: { flexDirection: 'row', gap: spacing.sm },

  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(163, 177, 198, 0.3)',
  },
  prefLabel: { ...typography.body, color: colors.text, fontWeight: '700' },
  prefSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  chevron: { fontSize: 22, color: colors.textMuted, fontWeight: '600' },

  aboutTitle: { ...typography.h3, color: colors.text, fontWeight: '800' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 15, 0.88)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 4,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
    gap: spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: '#EEF2FF', textAlign: 'center', fontWeight: '800' },
  modalSub: { ...typography.small, color: '#A5B4FC', textAlign: 'center', marginTop: -4 },
  field: { gap: 4 },
  fieldLabel: { ...typography.tiny, color: '#A5B4FC', fontWeight: '700' },
  fieldInput: {
    backgroundColor: 'rgba(26, 33, 64, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: '#EEF2FF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
});
