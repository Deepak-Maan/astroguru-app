import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../src/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { AppUpdateModal } from '../src/components/AppUpdateModal';
import { SecurityLockModal } from '../src/components/SecurityLockModal';
import { NotificationToast } from '../src/components/NotificationToast';
import { IncomingCallModal } from '../src/components/IncomingCallModal';
import { GlobalChatNotificationManager } from '../src/components/GlobalChatNotificationManager';

import { useUpdateStore } from '../src/store/updateStore';
import { seedAllUsersAndAstrologersToFirebase } from '../src/services/firebaseRealtimeService';
import { initNotificationService } from '../src/services/notificationService';
import { scheduleDailyMorningMuhuratPush } from '../src/services/pushNotificationService';
import { ASTROLOGERS } from '../src/data/astrologers';

// Suppress external browser extension and DevTools injected script noise (e.g. Chrome Web Vitals, Live Metrics VM scripts)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const isExternalScriptNoise = (msg: any, source?: any) => {
    const str = String(msg || '');
    const src = String(source || '');
    return (
      str.includes("reading 'startTime'") ||
      str.includes('reportAllChanges') ||
      str.includes('PerformanceObserver') ||
      src.includes('VM') ||
      src.includes('chrome-extension://')
    );
  };

  const prevOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isExternalScriptNoise(message, source)) {
      return true; // Prevents default browser error display in console
    }
    if (prevOnError) {
      return prevOnError.apply(this, [message, source, lineno, colno, error]);
    }
    return false;
  };

  window.addEventListener(
    'error',
    (event) => {
      if (isExternalScriptNoise(event?.message, event?.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isExternalScriptNoise(event?.reason?.message || event?.reason)) {
        event.preventDefault();
      }
    },
    true
  );
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorText: string;
}

class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorText: error?.message || 'App component render error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[RootErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🪐</Text>
          <Text style={styles.errorTitle}>AstroGuru Recovery Mode</Text>
          <Text style={styles.errorDesc}>A component encountered an issue. Tap below to reload seamlessly.</Text>
          <Pressable
            onPress={() => this.setState({ hasError: false, errorText: '' })}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Reload App</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.load);
  const autoCheckAndFetchOnStartup = useUpdateStore((s) => s.autoCheckAndFetchOnStartup);

  useEffect(() => {
    try {
      loadSettings();
    } catch (_) {}

    // Safe non-blocking deferred startup (prevents native splash freeze or crash)
    const startupTimer = setTimeout(() => {
      try {
        autoCheckAndFetchOnStartup();
      } catch (e) {
        console.log('[AutoCheck Error Handled]', e);
      }
      try {
        initNotificationService();
      } catch (e) {
        console.log('[InitNotif Error Handled]', e);
      }
      try {
        const morningPushEnabled = useSettingsStore.getState().morningMuhuratPushEnabled;
        scheduleDailyMorningMuhuratPush(morningPushEnabled);
      } catch (e) {
        console.log('[Morning Muhurat Init Note]', e);
      }
      try {
        seedAllUsersAndAstrologersToFirebase(ASTROLOGERS);
      } catch (e) {
        console.log('[Firebase Seed Note]', e);
      }
    }, 400);

    return () => clearTimeout(startupTimer);
  }, []);

  return (
    <RootErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="lal-kitab" />
            <Stack.Screen name="satsang" />
            <Stack.Screen name="gemstone-finder" />
            <Stack.Screen name="mantra-player" />
            <Stack.Screen name="astro-map" />
            <Stack.Screen name="astro-finance" />
            <Stack.Screen name="live-darshan" />
            <Stack.Screen name="soulmate-ai" />
            <Stack.Screen name="gita-audio" />
            <Stack.Screen name="transit-alerts" />
            <Stack.Screen name="face-reading" />
            <Stack.Screen name="admin/index" options={{ presentation: 'card' }} />
            <Stack.Screen name="wallet" options={{ presentation: 'card' }} />
            <Stack.Screen name="panchang" />
            <Stack.Screen name="tarot" />
            <Stack.Screen name="palmistry" />
            <Stack.Screen name="remedies" />
            <Stack.Screen name="spells" />
            <Stack.Screen name="matching" />
            <Stack.Screen name="sade-sati" />
            <Stack.Screen name="japa" />
            <Stack.Screen name="instant-consult" />
            <Stack.Screen name="kundli-pdf" />
            <Stack.Screen name="numerology" />
            <Stack.Screen name="choghadiya" />
            <Stack.Screen name="puja" />
            <Stack.Screen name="dreams" />
            <Stack.Screen name="audio-briefing" />
            <Stack.Screen name="vip" options={{ presentation: 'card' }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="ai-chat" />
            <Stack.Screen name="astrologer/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="acharya-chat/[roomId]" />
            <Stack.Screen name="acharya/consultation-profile" />
            <Stack.Screen name="acharya/certifications" />
            <Stack.Screen name="acharya/reviews" />
            <Stack.Screen name="acharya/broadcast" />
            <Stack.Screen name="acharya/availability" />
            <Stack.Screen name="acharya/training" />
            <Stack.Screen name="acharya/bank-settings" />
            <Stack.Screen name="acharya/earnings-report" />
            <Stack.Screen name="acharya/security" />
            <Stack.Screen name="acharya/support" />
            <Stack.Screen name="consultation/[id]" options={{ presentation: 'fullScreenModal' }} />
          </Stack>
          <NotificationToast />
          <IncomingCallModal />
          <GlobalChatNotificationManager />
          <AppUpdateModal />
          <SecurityLockModal />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </RootErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#060A12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF3366',
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 3,
    borderBottomColor: '#4338CA',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
});