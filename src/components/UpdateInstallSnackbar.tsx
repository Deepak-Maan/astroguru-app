import React from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme';
import { useUpdateStore } from '../store/updateStore';

export function UpdateInstallSnackbar() {
  const isReadyToInstall = useUpdateStore((s) => s.isReadyToInstall);
  const latestVersion = useUpdateStore((s) => s.latestVersion);
  const installUpdate = useUpdateStore((s) => s.installUpdate);
  const dismissInstallSnackbar = useUpdateStore((s) => s.dismissInstallSnackbar);

  if (!isReadyToInstall) return null;

  const handleInstall = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}
    installUpdate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.snackbar}>
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.leftCol}>
          <Text style={{ fontSize: 22 }}>📲</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Update Ready to Install!</Text>
            <Text style={styles.subtitle}>AstroGuru v{latestVersion} has been downloaded.</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleInstall}
            style={({ pressed }) => [styles.installBtn, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={['#FFC107', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.installBtnText}>Install Now</Text>
          </Pressable>

          <Pressable
            onPress={dismissInstallSnackbar}
            style={styles.closeBtn}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 84 : 74,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  snackbar: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    gap: 8,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  installBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  installBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
  },
});
