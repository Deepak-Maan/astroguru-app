/**
 * AstroGuru Notification Service
 * Delivers native push notifications to Android & iPhone notification bars,
 * as well as Web Browser notifications when chat messages or consultations arrive.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled safely
try {
  if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.log('[NotificationHandler Init Note]', e);
}

let isInitialized = false;

/**
 * Initialize and request permissions for Notifications on Android & iOS
 */
export async function initNotificationService() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    if (Platform.OS === 'android') {
      try {
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
      } catch (channelErr) {
        console.log('[Notification Channel Setup Note]', channelErr);
      }
    }

    if (Platform.OS !== 'web') {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      } catch (permErr) {
        console.log('[Notification Permission Request Note]', permErr);
      }
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
      trigger: null,
    });
  } catch (err) {
    console.warn('[ShowChatNotification Error]', err);
  }
}

/**
 * Show incoming consultation call alert in Android/iOS notification bar
 */
export async function showIncomingCallNotification(
  param: { seekerName: string; type?: 'audio' | 'video'; callId?: string } | string,
  callTypeFallback: 'audio' | 'video' = 'audio'
) {
  const seekerName = typeof param === 'string' ? param : (param?.seekerName || 'Seeker');
  const callType = typeof param === 'object' && param?.type ? param.type : callTypeFallback;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Incoming ${callType === 'video' ? 'Video' : 'Audio'} Call`, {
          body: `${callerNameOrSeeker(seekerName)} is calling for Vedic Consultation...`,
          icon: '/favicon.ico',
        });
      }
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📞 Incoming ${callType === 'video' ? 'Video' : 'Audio'} Call`,
        body: `${seekerName} is calling for astrological consultation...`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#10B981',
        data: typeof param === 'object' ? param : {},
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[ShowIncomingCallNotification Error]', err);
  }
}

function callerNameOrSeeker(name: string) {
  return name || 'Seeker';
}