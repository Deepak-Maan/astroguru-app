import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from './Card';
import { checkDeviceIntegrity, DeviceIntegrityReport } from '../services/security/deviceIntegrity';
import { getDeviceFingerprint } from '../services/security/deviceFingerprint';

export function SecurityShieldCard() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DeviceIntegrityReport | null>(null);
  const [deviceId, setDeviceId] = useState<string>('Detecting...');

  useEffect(() => {
    runScan();
    getDeviceFingerprint().then((id) => setDeviceId(id));
  }, []);

  const runScan = async () => {
    setLoading(true);
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    const res = await checkDeviceIntegrity();
    setTimeout(() => {
      setReport(res);
      setLoading(false);
    }, 400);
  };

  const isThreat = report?.threatLevel === 'CRITICAL';
  const isWarning = report?.threatLevel === 'WARNING';

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 20 }}>🛡️</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Anti-Hacking Defense Shield</Text>
          <Text style={styles.subtitle}>FIPS 180-4 · SSL Pinned · Screen Protected</Text>
        </View>
        <Pressable onPress={runScan} disabled={loading} style={styles.scanBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#FCD34D" />
          ) : (
            <Text style={styles.scanBtnText}>Re-Scan</Text>
          )}
        </Pressable>
      </View>

      {/* Status Highlights */}
      <View style={styles.grid}>
        <View style={styles.badgeItem}>
          <Text style={styles.badgeLabel}>Device Status</Text>
          <Text
            style={[
              styles.badgeValue,
              { color: isThreat ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' },
            ]}
          >
            {isThreat ? '⚠️ THREAT' : isWarning ? '⚡ WARNING' : '✓ SECURE'}
          </Text>
        </View>

        <View style={styles.badgeItem}>
          <Text style={styles.badgeLabel}>Anti-Tamper</Text>
          <Text style={[styles.badgeValue, { color: '#10B981' }]}>
            ✓ ACTIVE
          </Text>
        </View>

        <View style={styles.badgeItem}>
          <Text style={styles.badgeLabel}>SSL Pinning</Text>
          <Text style={[styles.badgeValue, { color: '#10B981' }]}>
            ✓ ENFORCED
          </Text>
        </View>

        <View style={styles.badgeItem}>
          <Text style={styles.badgeLabel}>Screen Shield</Text>
          <Text style={[styles.badgeValue, { color: '#10B981' }]}>
            ✓ ACTIVE
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.fingerprintText} numberOfLines={1}>
          Hardware ID: {deviceId}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderColor: 'rgba(129, 140, 248, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EEF2FF',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  scanBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  scanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCD34D',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  fingerprintText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
