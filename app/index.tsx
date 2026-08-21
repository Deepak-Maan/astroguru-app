import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/theme';

/**
 * Entry route: checks authentication status and directs directly to login or main tabs.
 */
export default function Index() {
  const userHydrated = useUserStore((s) => s.hydrated);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const authUser = useAuthStore((s) => s.user);

  if (!userHydrated || !authHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (authUser?.role === 'admin') {
    return <Redirect href="/admin" />;
  }

  return <Redirect href="/(tabs)" />;
}
