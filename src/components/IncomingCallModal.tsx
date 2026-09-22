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
import { useNotificationStore } from '../store/notificationStore';
import { ASTROLOGERS } from '../data/astrologers';
import {
  subscribeToIncomingCallsInFirebase,
  subscribeToIncomingCallsForSeekerInFirebase,
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
    const unsubs: (() => void)[] = [];

    if (isAstrologer) {
      // ── ASTROLOGER MODE: Watch for incoming calls from Seekers (callerRole !== 'expert') ──
      const keysToWatch = new Set<string>();

      if (authUser?.id) {
        keysToWatch.add(String(authUser.id));
        keysToWatch.add(String(authUser.id).replace(/[.#$\[\]\/]/g, '_'));
      }
      if (authUser?.email) {
        const emailPrefix = authUser.email.split('@')[0];
        keysToWatch.add(emailPrefix);
        keysToWatch.add(emailPrefix.replace(/[.#$\[\]\/]/g, '_'));
      }
      if (authUser?.name) {
        const nameKey = authUser.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        keysToWatch.add(nameKey);

        const matched = ASTROLOGERS.filter(
          (a) =>
            a.name.toLowerCase().includes(authUser.name.toLowerCase()) ||
            authUser.name.toLowerCase().includes(a.name.toLowerCase())
        );
        matched.forEach((a) => keysToWatch.add(a.id));
      }

      keysToWatch.add('astro_1786457216977');
      keysToWatch.add('prince_more');
      keysToWatch.add('vivek_kumar');
      keysToWatch.add('1');

      Array.from(keysToWatch)
        .filter(Boolean)
        .forEach((astroKey) => {
          const unsub = subscribeToIncomingCallsInFirebase(astroKey, (calls) => {
            // Only ring if status is 'ringing' AND caller was the Seeker (callerRole !== 'expert')
            const activeRinging = calls.find(
              (c) => c && c.status === 'ringing' && c.callerRole !== 'expert'
            );
            if (activeRinging) {
              setIncomingCall(activeRinging);
              showIncomingCallNotification({
                seekerName: activeRinging.seekerName || 'Seeker',
                type: activeRinging.type === 'video' ? 'video' : 'audio',
                callId: activeRinging.callId,
              });
              useNotificationStore.getState().addNotification({
                type: 'astrologer_live',
                title: `📞 Incoming ${activeRinging.type === 'video' ? 'Video' : 'Audio'} Call`,
                message: `${activeRinging.seekerName || 'Seeker'} is calling for Vedic Consultation...`,
              });
            }
          });
          unsubs.push(unsub);
        });
    } else {
      // ── SEEKER MODE: Watch for incoming calls from Astrologers (callerRole === 'expert') ──
      const seekerId = authUser?.id ? String(authUser.id) : 'usr_seeker_demo';
      const unsub = subscribeToIncomingCallsForSeekerInFirebase(seekerId, (calls) => {
        const activeRinging = calls.find(
          (c) => c && c.status === 'ringing' && c.callerRole === 'expert'
        );
        if (activeRinging) {
          setIncomingCall(activeRinging);
          showIncomingCallNotification({
            seekerName: activeRinging.astrologerName || 'Astrologer',
            type: activeRinging.type === 'video' ? 'video' : 'audio',
            callId: activeRinging.callId,
          });
          useNotificationStore.getState().addNotification({
            type: 'astrologer_live',
            title: `📞 Incoming Astrologer Call`,
            message: `${activeRinging.astrologerName || 'Acharya'} is calling you for live consultation...`,
          });
        }
      });
      unsubs.push(unsub);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isAstrologer, authUser?.id, authUser?.email, authUser?.name]);

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
  const displayName = isAstrologer
    ? incomingCall.seekerName || 'Seeker'
    : incomingCall.astrologerName || 'Acharya';
  const displayBadge = isAstrologer
    ? isVideo
      ? '📹 INCOMING HD VIDEO CALL'
      : '📞 INCOMING AUDIO CALL'
    : isVideo
    ? '📹 ACHARYA VIDEO CALL'
    : '📞 ACHARYA AUDIO CALL';
  const displaySubtitle = isAstrologer
    ? `Requesting a live Vedic ${isVideo ? 'Video' : 'Audio'} Consultation`
    : `Your Astrologer is calling you for live Jyotish consultation`;

  function handleAccept() {
    if (!incomingCall) return;
    const callInfo = { ...incomingCall };
    updateCallStatusInFirebase(
      callInfo.callId,
      callInfo.astrologerId,
      'connected',
      callInfo.seekerId
    );
    setIncomingCall(null);

    if (isAstrologer) {
      router.push(
        `/consultation/${callInfo.astrologerId}?type=${callInfo.type}&callId=${callInfo.callId}&role=expert`
      );
    } else {
      router.push(
        `/consultation/${callInfo.astrologerId}?type=${callInfo.type}&callId=${callInfo.callId}`
      );
    }
  }

  function handleDecline() {
    if (!incomingCall) return;
    updateCallStatusInFirebase(
      incomingCall.callId,
      incomingCall.astrologerId,
      'declined',
      incomingCall.seekerId
    );
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
          <Text style={styles.callBadge}>{displayBadge}</Text>

          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <Avatar name={displayName} size={96} />
          </Animated.View>

          <Text style={styles.callerName}>{displayName}</Text>
          <Text style={styles.callerSub}>{displaySubtitle}</Text>

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
    backgroundColor: '#11162B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.2,
    borderTopColor: 'rgba(129, 140, 248, 0.45)',
    borderLeftColor: 'rgba(129, 140, 248, 0.25)',
    borderBottomWidth: 4,
    borderRightWidth: 1.2,
    borderBottomColor: 'rgba(10, 12, 28, 0.98)',
    borderRightColor: 'rgba(129, 140, 248, 0.15)',
  },
  callBadge: {
    ...typography.tiny,
    color: '#38BDF8',
    fontWeight: '900',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
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
    backgroundColor: '#131830',
  },
  callerName: {
    ...typography.h2,
    fontSize: 20,
    color: '#EEF2FF',
    fontWeight: '900',
    textAlign: 'center',
  },
  callerSub: {
    ...typography.small,
    color: '#A5B4FC',
    textAlign: 'center',
    marginTop: 3,
    fontWeight: '600',
  },
  rateBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  rateText: {
    ...typography.tiny,
    color: colors.goldSoft,
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