import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../src/components/GradientBackground';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { Avatar } from '../src/components/Avatar';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { useWaitingRoomStore } from '../src/store/waitingRoomStore';
import { colors, radius, spacing, typography } from '../src/theme';

const WAITING_TIPS = [
  'Have your exact Birth Time and Birth Place ready for instant Kundli alignment.',
  'Note down your top 2 burning questions regarding career, marriage, or financial transit.',
  'Pranayama (calm deep breathing) helps clear your auric energy before consultation.',
  'All AstroGuru consultations are 100% private and protected with cosmic end-to-end encryption.',
  'You can tap the Floating Kundli Sheet anytime during the consultation to view planetary charts.',
];

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { currentQueue, leaveQueue, advanceQueue, markReady } = useWaitingRoomStore();
  const [tipIndex, setTipIndex] = useState(0);

  // Cycle tips every 6 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % WAITING_TIPS.length);
    }, 6000);
    return () => clearInterval(tipInterval);
  }, []);

  // Simulate queue movement when in queue
  useEffect(() => {
    if (!currentQueue || currentQueue.status === 'ready') return;

    const timer = setTimeout(() => {
      advanceQueue();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }, 12000); // Progresses queue every 12s in demo

    return () => clearTimeout(timer);
  }, [currentQueue?.position, currentQueue?.status]);

  const handleLeave = () => {
    Alert.alert(
      'Leave Waiting Queue?',
      'If you leave now, you will lose your reserved slot in line with ' +
        (currentQueue?.astrologerName || 'the astrologer') +
        '.',
      [
        { text: 'Stay in Queue', style: 'cancel' },
        {
          text: 'Leave Queue',
          style: 'destructive',
          onPress: () => {
            leaveQueue();
            router.back();
          },
        },
      ]
    );
  };

  const handleConnectNow = () => {
    if (!currentQueue) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    const astId = currentQueue.astrologerId;
    if (currentQueue.consultType === 'call') {
      router.replace({ pathname: '/call/[id]', params: { id: astId } });
    } else {
      router.replace({ pathname: '/chat/[id]', params: { id: astId } });
    }
  };

  if (!currentQueue) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe}>
          <ScreenHeader title="Waiting Room" showBack />
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Text style={{ fontSize: 42 }}>🪐</Text>
            </View>
            <Text style={styles.emptyTitle}>No Active Queue</Text>
            <Text style={styles.emptySubtitle}>
              You are currently not queued for any consultation. Choose an astrologer from the roster to start a reading or reserve your spot.
            </Text>
            <Button
              label="Find an Astrologer"
              variant="primary"
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/consult')}
            />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const isReady = currentQueue.status === 'ready';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          title="Live Waiting Room"
          subtitle="Real-Time Queue Tracker"
          showBack
          right={
            <Pressable onPress={handleLeave} style={styles.leaveHeaderButton}>
              <Text style={styles.leaveHeaderText}>Leave</Text>
            </Pressable>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Status & Queue Position Ring */}
          <View style={styles.dialContainer}>
            <LinearGradient
              colors={
                isReady
                  ? ['rgba(16, 185, 129, 0.25)', 'rgba(5, 150, 105, 0.08)']
                  : ['rgba(245, 158, 11, 0.22)', 'rgba(99, 102, 241, 0.15)']
              }
              style={[styles.dialGlow, isReady && styles.dialGlowReady]}
            >
              <View style={styles.dialInner}>
                {isReady ? (
                  <>
                    <Text style={styles.readyIcon}>🔔</Text>
                    <Text style={styles.readyTitle}>YOUR TURN!</Text>
                    <Text style={styles.readySub}>Astrologer is waiting for you</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.dialPositionPrefix}>Position</Text>
                    <Text style={styles.dialPositionNumber}>#{currentQueue.position}</Text>
                    <Text style={styles.dialWaitText}>
                      ~{currentQueue.estimatedWaitMinutes} min wait
                    </Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Astrologer Card */}
          <Card style={styles.astroCard}>
            <View style={styles.astroRow}>
              <Avatar
                uri={currentQueue.astrologerAvatar}
                name={currentQueue.astrologerName}
                size={64}
              />
              <View style={styles.astroInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.astroName} numberOfLines={1}>
                    {currentQueue.astrologerName}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⭐ 4.9</Text>
                  </View>
                </View>
                <Text style={styles.astroSpecialty}>
                  {currentQueue.astrologerSpecialty}
                </Text>
                <View style={styles.ratePill}>
                  <View
                    style={[
                      styles.pulsingDot,
                      { backgroundColor: isReady ? '#10B981' : '#F59E0B' },
                    ]}
                  />
                  <Text style={styles.rateText}>
                    {isReady
                      ? 'Ready to connect'
                      : `In reading • ₹${currentQueue.astrologerRate}/min`}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Connect Action Button */}
          {isReady ? (
            <View style={styles.actionSection}>
              <Button
                label={`Enter Consultation (${currentQueue.consultType.toUpperCase()}) ⚡`}
                variant="primary"
                size="lg"
                style={styles.connectButton}
                onPress={handleConnectNow}
              />
              <Text style={styles.readyDisclaimer}>
                Your session will initiate immediately upon tapping connect.
              </Text>
            </View>
          ) : (
            <View style={styles.waitingNotice}>
              <View style={styles.noticeIcon}>
                <Text style={{ fontSize: 18 }}>⏳</Text>
              </View>
              <View style={styles.noticeTextCol}>
                <Text style={styles.noticeTitle}>
                  {currentQueue.position === 1
                    ? 'Almost there! You are next in line.'
                    : `There are ${currentQueue.position - 1} users ahead of you.`}
                </Text>
                <Text style={styles.noticeSub}>
                  Your app will chime and notify you as soon as the session opens.
                </Text>
              </View>
            </View>
          )}

          {/* Vedic Insights Carousel */}
          <Card style={styles.wisdomCard}>
            <View style={styles.wisdomHeader}>
              <Text style={styles.wisdomHeaderIcon}>✨</Text>
              <Text style={styles.wisdomHeaderTitle}>Vedic Preparation Guide</Text>
            </View>
            <Text style={styles.wisdomBody}>{WAITING_TIPS[tipIndex]}</Text>
            <View style={styles.dotsRow}>
              {WAITING_TIPS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === tipIndex && styles.activeDot]}
                />
              ))}
            </View>
          </Card>

          {/* Quick Kundli Preview Access */}
          <Pressable
            style={styles.kundliShortcutCard}
            onPress={() => router.push('/(tabs)/kundli')}
          >
            <View style={styles.shortcutIconBox}>
              <Text style={{ fontSize: 22 }}>📜</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle}>Review Your Janam Kundli</Text>
              <Text style={styles.shortcutSub}>
                Check planetary positions & D1 chart while waiting
              </Text>
            </View>
            <Text style={styles.shortcutArrow}>→</Text>
          </Pressable>

          {/* Secondary Leave Button */}
          {!isReady && (
            <Pressable style={styles.cancelQueueButton} onPress={handleLeave}>
              <Text style={styles.cancelQueueText}>Leave Queue</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  leaveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  leaveHeaderText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  dialContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  dialGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  dialGlowReady: {
    borderColor: 'rgba(16, 185, 129, 0.6)',
    shadowColor: '#10B981',
  },
  dialInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#0F1322',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialPositionPrefix: {
    fontSize: 13,
    color: '#A5B4FC',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  dialPositionNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FCD34D',
    marginVertical: 2,
  },
  dialWaitText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  readyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  readySub: {
    fontSize: 11,
    color: '#A5B4FC',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 2,
  },
  astroCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.78)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  astroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  astroInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  astroName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#EEF2FF',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
  },
  astroSpecialty: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 8,
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  rateText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  readyDisclaimer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
  waitingNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    marginBottom: 16,
    gap: 12,
  },
  noticeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF2FF',
    marginBottom: 2,
  },
  noticeSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  wisdomCard: {
    backgroundColor: 'rgba(26, 33, 64, 0.7)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  wisdomHeaderIcon: {
    fontSize: 18,
  },
  wisdomHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  wisdomBody: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
    minHeight: 40,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    backgroundColor: '#FCD34D',
    width: 16,
  },
  kundliShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    gap: 12,
  },
  shortcutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EEF2FF',
  },
  shortcutSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  shortcutArrow: {
    fontSize: 18,
    color: '#A5B4FC',
    fontWeight: '700',
  },
  cancelQueueButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  cancelQueueText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EEF2FF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    minWidth: 200,
  },
});
