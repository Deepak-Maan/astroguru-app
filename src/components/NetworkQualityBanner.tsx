import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNetworkQuality } from '../services/networkQualityMonitor';

export function NetworkQualityBanner() {
  const { quality, isLowBandwidthMode, checkConnectionQuality } = useNetworkQuality();

  if (quality === 'excellent' && !isLowBandwidthMode) {
    return null;
  }

  const isOffline = quality === 'offline';

  return (
    <View
      style={[
        styles.banner,
        isOffline ? styles.bannerOffline : styles.bannerWarning,
      ]}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{isOffline ? '📡' : '⚡'}</Text>
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>
          {isOffline ? 'Connection Lost' : 'Low Bandwidth Optimization'}
        </Text>
        <Text style={styles.subtitle}>
          {isOffline
            ? 'Reconnecting to cosmic servers...'
            : 'Switched to low-latency crystal audio mode.'}
        </Text>
      </View>
      <Pressable style={styles.retryBtn} onPress={() => checkConnectionQuality()}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    gap: 10,
  },
  bannerWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  bannerOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  subtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 1,
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FCD34D',
  },
});
