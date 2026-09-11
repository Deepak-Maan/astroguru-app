import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Astrologer } from '../../types';
import { useNotificationStore } from '../../store/notificationStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  astrologer: Astrologer | null;
}

export function NotifyWhenOnlineModal({ visible, onClose, astrologer }: Props) {
  const [subscribed, setSubscribed] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  if (!astrologer) return null;

  const handleSubscribe = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (_) {}

    setSubscribed(true);

    // Register notification reminder
    addNotification({
      title: `🔔 Alert Set for ${astrologer.name}`,
      message: `We will notify you immediately via push notification and SMS as soon as ${astrologer.name} is available online.`,
      type: 'astrologer_live',
    });

    setTimeout(() => {
      setSubscribed(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <LinearGradient
            colors={['#1E1B4B', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topBar} />

          {!subscribed ? (
            <View style={styles.content}>
              <View style={styles.bellBubble}>
                <Text style={{ fontSize: 28 }}>🔔</Text>
              </View>

              <Image source={{ uri: astrologer.avatar }} style={styles.avatar} />
              <Text style={styles.name}>{astrologer.name}</Text>
              <Text style={styles.statusSub}>Currently Offline / in another consultation</Text>

              <Text style={styles.description}>
                Don't want to miss your consultation with {astrologer.name}? Tap below to receive an instant high-priority alert when they become available online.
              </Text>

              <Pressable
                onPress={handleSubscribe}
                style={({ pressed }) => [styles.notifyBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.notifyBtnText}>🔔 Notify Me When Online</Text>
              </Pressable>

              <Pressable onPress={onClose} style={{ marginTop: 12 }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.successContent}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>✅</Text>
              <Text style={styles.successTitle}>Alert Set Successfully!</Text>
              <Text style={styles.successSub}>
                We will send you a priority push notification the exact moment {astrologer.name} logs in.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  topBar: {
    height: 3,
    backgroundColor: '#F59E0B',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  bellBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statusSub: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 16,
  },
  notifyBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
  },
  notifyBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  successContent: {
    padding: 32,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#34D399',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
