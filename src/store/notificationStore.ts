import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'chat_message' | 'astrologer_live' | 'order_update' | 'spell_update' | 'wallet';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  toastNotification: NotificationItem | null;

  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  triggerAutoAcharyaLiveAlert: (astroName: string, title: string, avatar: string, id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissToast: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'astrologer_live',
    title: '🔴 Acharya Dev Sharma is NOW LIVE!',
    message: 'Senior Vedic astrologer is online for instant audio/video consultation. Tap to join queue.',
    timestamp: '5 mins ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    actionUrl: '/astrologer/astro-1',
  },
  {
    id: 'notif-2',
    type: 'chat_message',
    title: '💬 New Message from Dr. Radhika',
    message: '“I have analyzed your Jupiter Dasha transit. Here are your lucky gemstones…”',
    timestamp: '15 mins ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    actionUrl: '/chat/astro-2',
  },
  {
    id: 'notif-3',
    type: 'spell_update',
    title: '🪄 Spell Ritual Status Updated',
    message: 'Your Kamadeva Vashikaran Love Spell #SPELL-48219 is now in progress with Vedic priests.',
    timestamp: '1 hour ago',
    read: true,
    actionUrl: '/spells',
  },
  {
    id: 'notif-4',
    type: 'wallet',
    title: '💰 Wallet Recharge Successful',
    message: '₹500 has been credited to your AstroGuru Wallet balance.',
    timestamp: '2 hours ago',
    read: true,
    actionUrl: '/wallet',
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
      toastNotification: null,

      addNotification: (itemData) => {
        const id = `notif-${Date.now()}`;
        const newNotif: NotificationItem = {
          ...itemData,
          id,
          timestamp: 'Just now',
          read: false,
        };

        set((state) => {
          const updatedList = [newNotif, ...state.notifications];
          return {
            notifications: updatedList,
            unreadCount: updatedList.filter((n) => !n.read).length,
            toastNotification: newNotif, // Trigger live screen toast popup!
          };
        });

        // Trigger real device/browser push notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(newNotif.title, {
              body: newNotif.message,
              icon: newNotif.avatar || '/assets/icon.png',
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                new Notification(newNotif.title, {
                  body: newNotif.message,
                  icon: newNotif.avatar || '/assets/icon.png',
                });
              }
            });
          }
        }

        // Auto-dismiss toast popup after 5 seconds
        setTimeout(() => {
          set({ toastNotification: null });
        }, 5000);
      },

      triggerAutoAcharyaLiveAlert: (astroName, title, avatar, id) => {
        get().addNotification({
          type: 'astrologer_live',
          title: `🔴 ${astroName} is NOW LIVE!`,
          message: `${title || 'Vedic Jyotishi'} has just logged in for instant consultation. Tap to connect now.`,
          avatar,
          actionUrl: `/astrologer/${id}`,
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedList = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          return {
            notifications: updatedList,
            unreadCount: updatedList.filter((n) => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => {
          const updatedList = state.notifications.map((n) => ({ ...n, read: true }));
          return {
            notifications: updatedList,
            unreadCount: 0,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0, toastNotification: null });
      },

      dismissToast: () => {
        set({ toastNotification: null });
      },
    }),
    {
      name: 'astroguru_notifications_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
