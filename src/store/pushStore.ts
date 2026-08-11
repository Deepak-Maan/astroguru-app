import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForPushNotificationsAsync, scheduleLocalNotification } from '../services/notifications/pushNotificationEngine';

interface PushState {
  pushToken: string | null;
  notificationsEnabled: boolean;
  dailyHoroscopeReminder: boolean;
  transitAlertsEnabled: boolean;
  consultationAlertsEnabled: boolean;
  
  initializePush: () => Promise<void>;
  toggleNotifications: (enabled: boolean) => void;
  toggleHoroscopeReminder: (enabled: boolean) => void;
  sendTestPush: () => Promise<void>;
}

export const usePushStore = create<PushState>()(
  persist(
    (set, get) => ({
      pushToken: null,
      notificationsEnabled: true,
      dailyHoroscopeReminder: true,
      transitAlertsEnabled: true,
      consultationAlertsEnabled: true,

      initializePush: async () => {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          set({ pushToken: token, notificationsEnabled: true });
        }
      },

      toggleNotifications: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      toggleHoroscopeReminder: (enabled) => {
        set({ dailyHoroscopeReminder: enabled });
      },

      sendTestPush: async () => {
        await scheduleLocalNotification(
          '🪔 AstroGuru Cyber-Vedic Alert',
          'Jupiter (Guru) transiting favorably! Your spiritual and financial indicators are strong today. 🙏',
          2
        );
      },
    }),
    {
      name: 'astroguru_push_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
