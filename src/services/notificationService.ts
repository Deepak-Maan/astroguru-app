/**
 * AstroGuru Notification Service
 * Delivers native push notifications to Android & iPhone notification bars,
 * as well as Web Browser notifications when chat messages or consultations arrive.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let isInitialized = false;

/**
 * Initialize and request permissions for Notifications on Android & iOS
 */
export async function initNotificationService() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('astroguru_chat', {
        name: 'AstroGuru Chat Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });

      await Notifications.setNotificationChannelAsync('astroguru_consultation', {
        name: 'Consultation Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#10B981',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    }

    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      console.log('[NotificationService] Permission status:', finalStatus);
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[NotificationService Init Warning]', err);
  }
}

/**
 * Show a chat notification in the Android/iOS notification bar
 */
export async function showChatNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      }
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#F59E0B',
        data: data || {},
      },
      trigger: null, // trigger immediately
    });
  } catch (err) {
    console.warn('[Notification Show Warning]', err);
  }
}