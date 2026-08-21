import React, { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAntiHackingStore } from '../store/antiHackingStore';
import { colors } from '../theme';

export function SecurityBlurShield() {
  const appSwitcherBlur = useAntiHackingStore((s) => s.appSwitcherBlur);
  const [isAppObscured, setIsAppObscured] = useState(false);

  useEffect(() => {
    if (!appSwitcherBlur) {
      setIsAppObscured(false);
      return;
    }

    // Native AppState monitoring (triggers on iOS/Android app switcher)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        setIsAppObscured(true);
      } else if (nextAppState === 'active') {
        setIsAppObscured(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Web visibility listener
    const handleVisibilityChange = () => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (document.hidden) {
          setIsAppObscured(true);
        } else {
          setIsAppObscured(false);
        }
      }
    };

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [appSwitcherBlur]);

  if (!isAppObscured || !appSwitcherBlur) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="auto">
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#090D16']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.shieldRing}>
          <Text style={{ fontSize: 44 }}>🛡️</Text>
        </View>
        <Text style={styles.title}>AstroGuru Security Shield</Text>
        <Text style={styles.sub}>
          Sensitive Kundli charts, wallet balances, and private chat sessions are shielded from background capture.
        </Text>
        <View style={styles.encryptedTag}>
          <Text style={styles.encryptedTagText}>🔒 256-Bit Hardware Encrypted</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 320,
  },
  shieldRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  encryptedTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 6,
  },
  encryptedTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
});
