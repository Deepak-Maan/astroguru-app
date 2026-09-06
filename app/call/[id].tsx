import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../../src/theme';

export default function LegacyCallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    router.replace(`/consultation/${id || 'astro-1'}?type=audio`);
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#050811', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );
}
