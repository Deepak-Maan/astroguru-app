import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../src/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { AppUpdateModal } from '../src/components/AppUpdateModal';
import { SecurityLockModal } from '../src/components/SecurityLockModal';
import { NotificationToast } from '../src/components/NotificationToast';

import { useUpdateStore } from '../src/store/updateStore';

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.load);
  const autoCheckAndFetchOnStartup = useUpdateStore((s) => s.autoCheckAndFetchOnStartup);

  useEffect(() => {
    loadSettings();
    autoCheckAndFetchOnStartup();
  }, [loadSettings, autoCheckAndFetchOnStartup]);

  return (
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
        </Stack>
        <NotificationToast />
        <AppUpdateModal />
        <SecurityLockModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
