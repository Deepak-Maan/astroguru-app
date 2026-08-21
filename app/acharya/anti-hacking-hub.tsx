import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAntiHackingStore } from '../../src/store/antiHackingStore';
import { apiSignatureService } from '../../src/services/apiSignatureService';
import { colors, radius, spacing } from '../../src/theme';

export default function AntiHackingHubScreen() {
  const {
    blockScreenshots,
    appSwitcherBlur,
    strictRootBlock,
    autoHmacSigning,
    antiReplayProtection,
    lastAudit,
    isScanning,
    deviceFingerprint,
    signatureLogs,
    runAudit,
    toggleBlockScreenshots,
    toggleAppSwitcherBlur,
    toggleStrictRootBlock,
    toggleAutoHmacSigning,
    refreshSignatureLogs,
  } = useAntiHackingStore();

  const [activeTab, setActiveTab] = useState<'radar' | 'signatures' | 'guide'>('radar');

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

  const handleRunScan = async () => {
    triggerHaptic('medium');
    await runAudit();
    triggerHaptic('success');
  };

  const handleTestApiSignature = () => {
    triggerHaptic('light');
    apiSignatureService.signRequest('/api/wallet/spend', 'POST', {
      amount: 150,
      astrologerId: 'astro-1',
      purpose: 'Live Kundli Reading',
    });
    refreshSignatureLogs();
  };

  const getThreatBadgeColor = () => {
    switch (lastAudit.overallThreatLevel) {
      case 'SECURE':
        return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669', title: 'FORTIFIED & SECURE' };
      case 'LOW_RISK':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', title: 'NORMAL EXECUTION' };
      case 'HIGH_RISK':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', title: 'WARNING DETECTED' };
      case 'CRITICAL_THREAT':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', title: 'CRITICAL THREAT' };
    }
  };

  const threatBadge = getThreatBadgeColor();

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenHeader
          title="Anti-Hacking & Cyber Defense"
          subtitle="RASP runtime protection & anti-reverse engineering"
          showBack
          showWallet
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Hero RASP Cyber Radar ── */}
          <View style={styles.radarCard}>
            <LinearGradient
              colors={['#090D16', '#111827', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.radarHeader}>
              <View style={styles.shieldOrb}>
                <Text style={{ fontSize: 32 }}>🛡️</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.radarTitle}>RASP Sentinel Engine</Text>
                  <View style={[styles.threatPill, { backgroundColor: threatBadge.bg, borderColor: threatBadge.border }]}>
                    <Text style={[styles.threatPillText, { color: threatBadge.text }]}>
                      {threatBadge.title}
                    </Text>
                  </View>
                </View>
                <Text style={styles.radarSub}>
                  Live memory shielding, anti-hooking & tamper-proof cryptographic defense.
                </Text>
              </View>
            </View>

            {/* Score & Fingerprint Bar */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>CYBER DEFENSE SCORE</Text>
                <Text style={styles.scoreValue}>{lastAudit.securityScore}/100</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>DEVICE FINGERPRINT</Text>
                <Text style={styles.fingerprintValue}>{deviceFingerprint}</Text>
              </View>
            </View>

            {/* Run Deep Scan Button */}
            <Pressable
              onPress={handleRunScan}
              disabled={isScanning}
              style={({ pressed }) => [
                styles.scanButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
              ]}
            >
              <LinearGradient
                colors={['#059669', '#10B981', '#047857']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isScanning ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.scanButtonText}>Scanning Memory & System Hooks...</Text>
                </View>
              ) : (
                <Text style={styles.scanButtonText}>⚡ Run Deep Vulnerability & Memory Scan</Text>
              )}
            </Pressable>
          </View>

          {/* ── Tab Switcher ── */}
          <View style={styles.tabBar}>
            {[
              { id: 'radar', label: '🛡️ Active Shields', icon: '🛡️' },
              { id: 'signatures', label: '🔐 API Signatures', icon: '🔐' },
              { id: 'guide', label: '📖 Defense Guide', icon: '📖' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    triggerHaptic('light');
                    setActiveTab(tab.id as any);
                  }}
                  style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── TAB 1: ACTIVE DEFENSE SHIELDS & CHECKLIST ── */}
          {activeTab === 'radar' && (
            <>
              {/* Defense Switches */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={{ fontSize: 16 }}>🎛️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Real-Time Shield Switches</Text>
                    <Text style={styles.sectionSub}>Configure automated defense responses</Text>
                  </View>
                </View>

                {/* Switch 1: Anti-Screenshot & Screen Capture Blocker */}
                <View style={styles.switchRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.switchTitle}>Screen Capture & Spyware Blocker</Text>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>FLAG_SECURE</Text>
                      </View>
                    </View>
                    <Text style={styles.switchSub}>
                      Prevents malware and background spy apps from capturing screenshots of private Kundli & wallet data.
                    </Text>
                  </View>
                  <Switch
                    value={blockScreenshots}
                    onValueChange={() => {
                      triggerHaptic('light');
                      toggleBlockScreenshots();
                    }}
                    trackColor={{ true: '#059669', false: '#CBD5E1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Switch 2: App Switcher Privacy Blur */}
                <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.switchTitle}>App Switcher Privacy Shield</Text>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>INSTANT BLUR</Text>
                      </View>
                    </View>
                    <Text style={styles.switchSub}>
                      Automatically obscures the app snapshot with a frosted defense shield when switching between apps.
                    </Text>
                  </View>
                  <Switch
                    value={appSwitcherBlur}
                    onValueChange={() => {
                      triggerHaptic('light');
                      toggleAppSwitcherBlur();
                    }}
                    trackColor={{ true: '#059669', false: '#CBD5E1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Switch 3: Strict Root & Jailbreak Block */}
                <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.switchTitle}>Root / Jailbreak Anti-Exploit Shield</Text>
                      <View style={[styles.tagPill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <Text style={[styles.tagPillText, { color: '#B45309' }]}>HIGH DEFENSE</Text>
                      </View>
                    </View>
                    <Text style={styles.switchSub}>
                      Restricts large wallet withdrawals and confidential astrology chart downloads if compromised root binaries are detected.
                    </Text>
                  </View>
                  <Switch
                    value={strictRootBlock}
                    onValueChange={() => {
                      triggerHaptic('light');
                      toggleStrictRootBlock();
                    }}
                    trackColor={{ true: '#059669', false: '#CBD5E1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Switch 4: HMAC-SHA256 Outbound Request Signing */}
                <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.switchTitle}>Cryptographic Request Signing (Anti-MITM)</Text>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>HMAC-SHA256</Text>
                      </View>
                    </View>
                    <Text style={styles.switchSub}>
                      Attaches 30-second anti-replay nonces and device signatures to prevent hackers from tampering with recharge amounts via Burp Suite or Charles Proxy.
                    </Text>
                  </View>
                  <Switch
                    value={autoHmacSigning}
                    onValueChange={() => {
                      triggerHaptic('light');
                      toggleAutoHmacSigning();
                    }}
                    trackColor={{ true: '#059669', false: '#CBD5E1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* Diagnostic Checklist */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={{ fontSize: 16 }}>📋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Runtime Integrity Diagnostic Matrix</Text>
                    <Text style={styles.sectionSub}>Audited at {lastAudit.timestamp}</Text>
                  </View>
                </View>

                <View style={{ gap: 10 }}>
                  {lastAudit.checks.map((chk) => (
                    <View key={chk.id} style={styles.checkCard}>
                      <View style={styles.checkTopRow}>
                        <Text style={{ fontSize: 18 }}>
                          {chk.status === 'PASSED' ? '✅' : chk.status === 'WARNING' ? '⚠️' : '🚨'}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.checkName}>{chk.name}</Text>
                          <Text style={styles.checkCategory}>{chk.category.replace('_', ' ')}</Text>
                        </View>
                        <View
                          style={[
                            styles.checkStatusPill,
                            {
                              backgroundColor:
                                chk.status === 'PASSED'
                                  ? '#ECFDF5'
                                  : chk.status === 'WARNING'
                                  ? '#FFFBEB'
                                  : '#FEF2F2',
                              borderColor:
                                chk.status === 'PASSED'
                                  ? '#A7F3D0'
                                  : chk.status === 'WARNING'
                                  ? '#FDE68A'
                                  : '#FECACA',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.checkStatusText,
                              {
                                color:
                                  chk.status === 'PASSED'
                                    ? '#059669'
                                    : chk.status === 'WARNING'
                                    ? '#D97706'
                                    : '#DC2626',
                              },
                            ]}
                          >
                            {chk.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.checkDesc}>{chk.description}</Text>
                      {chk.remediation && (
                        <View style={styles.remediationBox}>
                          <Text style={styles.remediationText}>💡 {chk.remediation}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ── TAB 2: LIVE API SIGNATURES & REPLAY AUDIT ── */}
          {activeTab === 'signatures' && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={{ fontSize: 16 }}>🔐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Cryptographic Request Signature Feed</Text>
                  <Text style={styles.sectionSub}>
                    Timestamped HMAC-SHA256 signatures with 30s anti-replay nonces
                  </Text>
                </View>
                <Pressable onPress={handleTestApiSignature} style={styles.testSignBtn}>
                  <Text style={styles.testSignBtnText}>＋ Simulate Signed API</Text>
                </Pressable>
              </View>

              <View style={{ gap: 8 }}>
                {signatureLogs.map((log) => (
                  <View key={log.id} style={styles.signatureRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={styles.methodBadge}>
                          <Text style={styles.methodBadgeText}>{log.method}</Text>
                        </View>
                        <Text style={styles.sigEndpointText}>{log.endpoint}</Text>
                      </View>
                      <Text style={styles.sigTimeText}>{log.timestamp}</Text>
                    </View>

                    <View style={styles.sigDetailRow}>
                      <Text style={styles.sigNonceText}>Nonce: {log.nonce}</Text>
                      <Text style={styles.sigHashText}>SHA256: {log.signaturePreview}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── TAB 3: ANTI-HACKING DEFENSE GUIDE ── */}
          {activeTab === 'guide' && (
            <View style={styles.sectionCard}>
              <Text style={styles.guideHeader}>🛡️ AstroGuru Multi-Tier Security Architecture</Text>
              
              <View style={styles.guideItem}>
                <Text style={styles.guideItemTitle}>1. How We Stop Wallet & Recharge Hacks</Text>
                <Text style={styles.guideItemDesc}>
                  All wallet deductions and credits use **Server-Side Authority**. Even if an attacker attempts to modify their local device balance, the backend rejects consultations that fail server-side ledger validation.
                </Text>
              </View>

              <View style={styles.guideItem}>
                <Text style={styles.guideItemTitle}>2. How We Prevent Man-In-The-Middle (MITM) Sniffing</Text>
                <Text style={styles.guideItemDesc}>
                  Through SSL/TLS 1.3 Public Key Pinning combined with cryptographic HMAC-SHA256 request signing, proxy tools like Charles Proxy or Burp Suite are blocked from inspecting or replaying live data.
                </Text>
              </View>

              <View style={styles.guideItem}>
                <Text style={styles.guideItemTitle}>3. How We Protect Sensitive Kundli & Chat Transcripts</Text>
                <Text style={styles.guideItemDesc}>
                  Birth parameters and astrology charts are encrypted in hardware-backed secure storage. When switching apps, our App Switcher Privacy Shield immediately blurs the screen to prevent OS background snapshot leaks.
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: 14,
  },

  /* Radar Hero Card */
  radarCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    overflow: 'hidden',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(5, 150, 105, 0.18)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  radarSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  threatPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  threatPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#34D399',
  },
  fingerprintValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  scanButton: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  scanButtonText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#065F46',
    fontWeight: '900',
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Switch Rows */
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  switchTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#1E293B',
  },
  switchSub: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Diagnostic Check Card */
  checkCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  checkTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  checkStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  checkStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  checkDesc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 15,
  },
  remediationBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  remediationText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },

  /* Signature Feed */
  testSignBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testSignBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  signatureRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  methodBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  methodBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sigEndpointText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sigTimeText: {
    fontSize: 10,
    color: '#64748B',
  },
  sigDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigNonceText: {
    fontSize: 9.5,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  sigHashText: {
    fontSize: 9.5,
    color: '#D97706',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Guide */
  guideHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  guideItem: {
    gap: 3,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  guideItemTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  guideItemDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
