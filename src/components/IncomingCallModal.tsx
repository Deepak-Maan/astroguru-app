import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [pulseAnim] = useState(new Animated.Value(1));

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

  // Pulse animation when incoming call is active
  useEffect(() => {
    if (incomingCall) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
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
    updateCallStatusInFirebase(incomingCall.callId, String(authUser.id), 'connected');
    const callInfo = { ...incomingCall };
    setIncomingCall(null);
    router.push(
      `/consultation/${callInfo.astrologerId}?type=${callInfo.type}&callId=${callInfo.callId}&role=expert`
    );
  }

  function handleDecline() {
    if (!incomingCall || !authUser?.id) return;
    updateCallStatusInFirebase(incomingCall.callId, String(authUser.id), 'declined');
    setIncomingCall(null);
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <LinearGradient
          colors={['rgba(15,23,42,0.92)', 'rgba(30,41,59,0.96)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.card}>
          <Text style={styles.callBadge}>
            {isVideo ? '📹 INCOMING HD VIDEO CALL' : '📞 INCOMING AUDIO CALL'}
          </Text>

          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar name={incomingCall.seekerName || 'Seeker'} size={96} />
          </Animated.View>

          <Text style={styles.callerName}>{incomingCall.seekerName || 'Seeker'}</Text>
          <Text style={styles.callerSub}>
            Requesting a live Vedic {isVideo ? 'Video' : 'Audio'} Consultation
          </Text>

          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>Rate: ₹{incomingCall.ratePerMin || 25}/min</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Decline */}
            <Pressable onPress={handleDecline} style={styles.declineBtn}>
              <Text style={{ fontSize: 26 }}>📵</Text>
              <Text style={styles.actionBtnLabel}>Decline</Text>
            </Pressable>

            {/* Accept */}
            <Pressable onPress={handleAccept} style={styles.acceptBtn}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={{ fontSize: 26 }}>{isVideo ? '📹' : '📞'}</Text>
              <Text style={[styles.actionBtnLabel, { color: '#FFFFFF' }]}>Answer</Text>
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
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.5)',
  },
  callBadge: {
    ...typography.tiny,
    color: colors.teal,
    fontWeight: '900',
    backgroundColor: 'rgba(5,150,105,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.3)',
  },
  avatarWrapper: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  callerName: {
    ...typography.h2,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '900',
    textAlign: 'center',
  },
  callerSub: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 3,
    fontWeight: '600',
  },
  rateBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  rateText: {
    ...typography.tiny,
    color: colors.saffron,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  declineBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  acceptBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnLabel: {
    ...typography.tiny,
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textMuted,
  },
});