import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Avatar } from './Avatar';
import { colors, radius, spacing, typography } from '../theme';
import { useAuthStore } from '../store/authStore';
import {
  subscribeToIncomingCallsInFirebase,
  updateCallStatusInFirebase,
} from '../services/firebaseRealtimeService';
import { showIncomingCallNotification } from '../services/notificationService';

export function IncomingCallModal() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAstrologer = authUser?.role === 'astrologer';

  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isAstrologer) return;

    const possibleIds = [
      String(authUser?.id || ''),
      String(authUser?.email?.split('@')[0] || ''),
      'astro_1786457216977',
      'prince_more',
      '1',
    ].filter(Boolean);

    const unsubs: (() => void)[] = [];

    possibleIds.forEach((astroKey) => {
      const unsub = subscribeToIncomingCallsInFirebase(astroKey, (calls) => {
        const activeRinging = calls.find((c) => c && c.status === 'ringing');
        if (activeRinging) {
          setIncomingCall(activeRinging);
          try {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (_) {}
          showIncomingCallNotification({
            seekerName: activeRinging.seekerName || 'Seeker',
            type: activeRinging.type === 'video' ? 'video' : 'audio',
            callId: activeRinging.callId,
          });
        }
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isAstrologer, authUser?.id, authUser?.email]);

  // Pulse & Ring animation when incoming call is active
  useEffect(() => {
    if (incomingCall) {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringAnim, {
              toValue: 1.5,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ringAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === 'video';

  function handleAccept() {
    if (!incomingCall || !authUser?.id) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (_) {}
    updateCallStatusInFirebase(incomingCall.callId, String(authUser.id), 'connected');
    const callInfo = { ...incomingCall };
    setIncomingCall(null);
    router.push(
      `/consultation/${callInfo.astrologerId}?type=${callInfo.type}&callId=${callInfo.callId}&role=expert`
    );
  }

  function handleDecline() {
    if (!incomingCall || !authUser?.id) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (_) {}
    updateCallStatusInFirebase(incomingCall.callId, String(authUser.id), 'declined');
    setIncomingCall(null);
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <LinearGradient
          colors={['rgba(5,8,17,0.95)', 'rgba(23,18,43,0.98)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.card}>
          <LinearGradient
            colors={['#1E1B4B', '#0F172A']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topSpecular} />

          <View style={styles.badgeRow}>
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>
                {isVideo ? '📹 INCOMING HD VIDEO CALL' : '📞 INCOMING AUDIO CALL'}
              </Text>
            </View>
          </View>

          {/* Animated Avatar Aura */}
          <View style={styles.avatarStage}>
            <Animated.View
              style={[
                styles.auraPulseRing,
                { transform: [{ scale: ringAnim }], opacity: 0.35 },
              ]}
            />
            <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <Avatar name={incomingCall.seekerName || 'Seeker'} size={100} />
            </Animated.View>
          </View>

          <Text style={styles.callerName}>{incomingCall.seekerName || 'Seeker'}</Text>
          <Text style={styles.callerSub}>
            Live Vedic {isVideo ? 'Video' : 'Audio'} Consultation Request
          </Text>

          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>Earn ₹{Math.round((incomingCall.ratePerMin || 25) * 0.8)}/min (Net Payout)</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Decline */}
            <Pressable
              onPress={handleDecline}
              style={({ pressed }) => [
                styles.declineBtn,
                pressed && { transform: [{ scale: 0.94 }], opacity: 0.85 },
              ]}
            >
              <Text style={{ fontSize: 24 }}>📵</Text>
              <Text style={styles.actionBtnLabel}>Decline</Text>
            </Pressable>

            {/* Accept */}
            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => [
                styles.acceptBtn,
                pressed && { transform: [{ scale: 0.94 }], opacity: 0.85 },
              ]}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 24 }}>{isVideo ? '📹' : '📞'}</Text>
              <Text style={[styles.actionBtnLabel, { color: '#FFFFFF' }]}>Accept Call</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    overflow: 'hidden',
    position: 'relative',
    gap: 6,
  },
  topSpecular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  badgeRow: {
    marginBottom: 8,
  },
  callBadge: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  callBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  avatarStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  auraPulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarWrapper: {
    borderRadius: 54,
    borderWidth: 3,
    borderColor: '#D4AF37',
    padding: 3,
    backgroundColor: '#0F172A',
  },
  callerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  callerSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: 'rgba(217,119,6,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  rateText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FDE68A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
    width: '100%',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});