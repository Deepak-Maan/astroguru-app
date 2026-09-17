import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../store/notificationStore';

// Configure notification behavior for active app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MORNING_MUHURAT_NOTIFICATION_ID = 'morning-shubh-muhurat-daily';

/**
 * Schedules a daily morning push notification at 7:00 AM local time
 * containing today's Abhijit Muhurat and Rahu Kaal.
 */
export async function scheduleDailyMorningMuhuratPush(enabled: boolean = true) {
  try {
    if (Platform.OS === 'web') {
      // In web browser, ensure permission is requested
      if (typeof window !== 'undefined' && 'Notification' in window && enabled) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          await Notification.requestPermission();
        }
      }
      return;
    }

    // Cancel existing morning schedule first to avoid duplicates
    await Notifications.cancelScheduledNotificationAsync(MORNING_MUHURAT_NOTIFICATION_ID).catch(() => {});

    if (!enabled) {
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted for Morning Muhurat push.');
      return;
    }

    // Schedule daily recurring trigger at 7:00 AM (Hour: 7, Minute: 0)
    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_MUHURAT_NOTIFICATION_ID,
      content: {
        title: '🌅 Subah Ka Shubh Muhurat & Rahu Kaal',
        body: '✨ Aaj Ka Abhijit Muhurat: 11:45 AM - 12:35 PM (Sarva Karya Siddhi) | ⚠️ Rahu Kaal: 04:30 PM - 06:00 PM. Tap to check Panchang.',
        sound: true,
        data: {
          screen: '/panchang',
          type: 'morning_muhurat',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 7,
        minute: 0,
      } as any,
    });
    console.log('Daily 7:00 AM Morning Muhurat notification scheduled successfully.');
  } catch (err) {
    console.warn('Could not schedule morning muhurat notification:', err);
  }
}

/**
 * Triggers an instant sample push notification for the user to test and verify
 * how the 7:00 AM lock screen notification looks and feels.
 */
export async function triggerInstantMorningMuhuratTestPush() {
  const title = '🌅 Subah Ka Shubh Muhurat & Rahu Kaal';
  const message = '✨ Aaj Ka Abhijit Muhurat: 11:45 AM - 12:35 PM (Sarva Karya Siddhi) | ⚠️ Rahu Kaal: 04:30 PM - 06:00 PM. Tap to check Panchang.';

  // 1. Add to in-app notification center store
  useNotificationStore.getState().addNotification({
    type: 'astrologer_live',
    title,
    message,
    actionUrl: '/(tabs)',
  });

  // 2. Native Expo Notification
  if (Platform.OS !== 'web') {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            sound: true,
            data: { screen: '/(tabs)', type: 'morning_muhurat' },
          },
          trigger: null, // trigger immediately
        });
      }
    } catch (e) {
      console.warn('Failed to present native notification:', e);
    }
  } else {
    // 3. Web Notification API
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/assets/icon.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((p) => {
          if (p === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/assets/icon.png',
            });
          }
        });
      }
    }
  }
}
