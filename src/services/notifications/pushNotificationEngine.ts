import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface ScheduledPushNotification {
  id: string;
  title: string;
  body: string;
  triggerTime?: Date;
  category?: 'horoscope' | 'transit' | 'consultation' | 'panchang';
}

/**
 * Request Notification Permissions & Register Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('astroguru-alerts', {
        name: 'AstroGuru Vedic Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push Notifications] Permission not granted.');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '3b6a7923-3266-4e7c-b80d-889b61a55e34';
    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    token = pushTokenData.data;
    console.log('[Push Notification Token Registered]:', token);
  } catch (e) {
    console.warn('[Push Notification Engine Warning - Operating in Safe Fallback Mode]', e);
    token = `expo_push_token_mock_${Date.now()}`;
  }

  return token;
}

/**
 * Schedule Local Notification immediately or at specific date/time
 */
export async function scheduleLocalNotification(title: string, body: string, secondsFromNow: number = 2): Promise<string> {
  try {
    const Notifications = require('expo-notifications');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { timestamp: Date.now() },
      },
      trigger: {
        seconds: secondsFromNow,
      },
    });
    return id;
  } catch (e) {
    console.warn('[Schedule Notification Safe Fallback]', e);
    return `mock-notif-${Date.now()}`;
  }
}

/**
 * Schedule Daily Horoscope Morning Reminder at 7:00 AM
 */
export async function scheduleDailyHoroscopeNotification(rashiName: string = 'Your Rashi') {
  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `☀️ Daily Rashiphal for ${rashiName}`,
        body: 'Your cosmic forecast for today is ready! Check planetary transits and lucky hours now.',
        sound: true,
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });
  } catch (e) {
    console.warn('[Daily Horoscope Notification Safe Fallback]', e);
  }
}
