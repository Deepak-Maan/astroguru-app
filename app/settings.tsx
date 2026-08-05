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
import { colors, radius, spacing, typography } from '../src/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { useChatStore } from '../src/store/chatStore';
import { useSecurityStore } from '../src/store/securityStore';
import { useAuthStore } from '../src/store/authStore';
import { useUpdateStore } from '../src/store/updateStore';

export default function Settings() {
  const router = useRouter();
  const apiKey = useSettingsStore((s) => s.apiKey);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const clearApiKey = useSettingsStore((s) => s.clearApiKey);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const clearAiChat = useChatStore((s) => s.clearAiChat);

  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Updates Store
  const currentVersion = useUpdateStore((s) => s.currentVersion);
  const latestVersion = useUpdateStore((s) => s.latestVersion);
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
        alert(`✅ AstroGuru is Up to Date (v${res.currentVersion})\nNo new updates available right now.`);
      } else {
        Alert.alert(
          'App Up to Date',
          `✅ You are running the latest version of AstroGuru (v${res.currentVersion}).`
        );
      }
    }
  };

  const handleSignOut = () => {
    const doLogout = () => {
      logout();
      router.replace('/(auth)/login');
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

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
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
                  <Text style={[styles.prefLabel, { color: colors.saffron }]}>
                    {checkingUpdate ? '⏳ Checking Server for Updates…' : '🔄 Check for App Updates'}
                  </Text>
                  <Text style={styles.prefSub}>
                    Installed: v{currentVersion} · Server Latest: v{latestVersion}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.saffron }]}>›</Text>
              </Pressable>
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

          {/* API key */}
          <View>
            <SectionHeader
              title="AI Astrologer Key"
              subtitle="Powers the AI Jyotishi chat"
            />
            <Card style={{ gap: spacing.md }}>
              {apiKey ? (
                <>
                  <View style={styles.keyActive}>
                    <Text style={styles.keyActiveIcon}>✅</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.keyActiveTitle}>Key saved on this device</Text>
                      <Text style={styles.keyMasked}>
                        {reveal ? apiKey : masked}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.keyBtnRow}>
                    <Button
                      label={reveal ? 'Hide' : 'Reveal'}
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={() => setReveal((r) => !r)}
                    />
                    <Button
                      label="Remove key"
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={remove}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.help}>
                    The AI Jyotishi reads your computed Kundli and answers questions about it.
                    Paste an Anthropic API key to enable it — everything else in the app works
                    without a key.
                  </Text>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="sk-ant-api03-…"
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!reveal}
                    multiline={reveal}
                  />
                  <Pressable onPress={() => setReveal((r) => !r)}>
                    <Text style={styles.toggleReveal}>
                      {reveal ? 'Hide key' : 'Show key while typing'}
                    </Text>
                  </Pressable>
                  {!!error && <Text style={styles.error}>{error}</Text>}
                  <Button label="Save key" variant="gold" onPress={save} />
                  <Pressable
                    onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}
                  >
                    <Text style={styles.link}>Get a key from console.anthropic.com →</Text>
                  </Pressable>
                </>
              )}

              {saved && <Text style={styles.savedNote}>✅ Key saved.</Text>}
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
                  <Text style={[styles.prefLabel, { color: colors.danger }]}>🚪 Sign Out of Account</Text>
                  <Text style={styles.prefSub}>Logs you out and returns to the Login screen</Text>
                </View>
                <Text style={[styles.chevron, { color: colors.danger }]}>›</Text>
              </Pressable>
            </Card>
          </View>

          {/* About */}
          <View>
            <SectionHeader title="About & App Updates" />
            <Card style={{ gap: spacing.md }}>
              <Text style={styles.aboutTitle}>AstroGuru · v{currentVersion}</Text>
              <Text style={styles.help}>
                Kundli, Lagna, Rashi and Nakshatra are computed on-device using the Lahiri
                ayanamsa — no internet required. Sun and Moon positions are highly accurate.
              </Text>
              <Button
                label="⚡ Check for App Updates"
                variant="gold"
                size="sm"
                onPress={() => triggerUpdateModal()}
              />
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
  help: { ...typography.small, color: colors.textMuted, lineHeight: 19 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 14,
    minHeight: 44,
  },
  toggleReveal: { ...typography.tiny, color: colors.saffron, fontWeight: '700' },
  error: { ...typography.small, color: colors.danger },
  link: { ...typography.small, color: colors.saffron, fontWeight: '700', textAlign: 'center' },
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
    borderTopColor: '#E3E8F3',
  },
  prefLabel: { ...typography.body, color: colors.text, fontWeight: '700' },
  prefSub: { ...typography.tiny, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  chevron: { fontSize: 22, color: colors.textMuted, fontWeight: '600' },

  aboutTitle: { ...typography.h3, color: colors.text, fontWeight: '800' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27,20,56,0.60)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    gap: spacing.md,
    shadowColor: 'rgba(160,175,205,0.40)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: { ...typography.h2, color: colors.saffron, textAlign: 'center', fontWeight: '800' },
  modalSub: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: -4 },
  field: { gap: 4 },
  fieldLabel: { ...typography.tiny, color: colors.textMuted, fontWeight: '700' },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E3E8F3',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
});
