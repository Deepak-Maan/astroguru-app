import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useLiveChatStore } from '../store/liveChatStore';
import { ASTROLOGERS } from '../data/astrologers';
import {
  subscribeToAcharyaRoomsInFirebase,
  subscribeToSeekerRoomsInFirebase,
} from '../services/firebaseRealtimeService';
import { showChatNotification } from '../services/notificationService';

/**
 * GlobalChatNotificationManager — Headless component that listens to incoming
 * consultation room updates in real time and routes notifications to the
 * correct party (Seeker -> Astrologer, or Astrologer -> Seeker), NEVER alerting the sender.
 */
export function GlobalChatNotificationManager() {
  const authUser = useAuthStore((s) => s.user);
  const isAstrologer = authUser?.role === 'astrologer';

  const seenTimestampsRef = useRef<Record<string, number>>({});
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    seenTimestampsRef.current = {};
    isInitialLoadRef.current = true;
    const unsubs: (() => void)[] = [];

    if (isAstrologer) {
      // ── ASTROLOGER MODE: Watch all consultation rooms assigned to this astrologer ──
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
          const unsub = subscribeToAcharyaRoomsInFirebase(astroKey, (rooms) => {
            if (!rooms || !Array.isArray(rooms)) return;

            rooms.forEach((room: any) => {
              if (!room || !room.roomId) return;
              const rId = room.roomId;
              const updatedAt = Number(room.updatedAt) || 0;
              const prevTime = seenTimestampsRef.current[rId];

              if (prevTime === undefined) {
                // First snapshot for this room: record timestamp, do not spam alert
                seenTimestampsRef.current[rId] = updatedAt;
                return;
              }

              // New message arrived from Seeker!
              if (updatedAt > prevTime && room.senderRole === 'seeker' && room.lastMessage) {
                seenTimestampsRef.current[rId] = updatedAt;

                const seekerName = room.seekerName || 'Seeker';
                const notifTitle = `🔔 New message from ${seekerName}`;
                showChatNotification({
                  title: notifTitle,
                  body: room.lastMessage,
                  data: { roomId: rId, actionUrl: `/acharya-chat/${rId}` },
                });
                useNotificationStore.getState().addNotification({
                  type: 'chat_message',
                  title: notifTitle,
                  message: room.lastMessage,
                  actionUrl: `/acharya-chat/${rId}`,
                });
              } else {
                seenTimestampsRef.current[rId] = Math.max(prevTime, updatedAt);
              }
            });
          });
          unsubs.push(unsub);
        });
    } else {
      // ── SEEKER MODE: Watch consultation rooms for this Seeker ──
      const seekerId = authUser?.id ? String(authUser.id) : 'usr_seeker_demo';
      const cleanSeekerId = seekerId.replace(/[.#$\[\]\/]/g, '_');

      const unsub = subscribeToSeekerRoomsInFirebase(cleanSeekerId, (rooms) => {
        if (!rooms || !Array.isArray(rooms)) return;

        rooms.forEach((room: any) => {
          if (!room || !room.roomId) return;
          const rId = room.roomId;
          const updatedAt = Number(room.updatedAt) || 0;
          const prevTime = seenTimestampsRef.current[rId];

          if (prevTime === undefined) {
            seenTimestampsRef.current[rId] = updatedAt;
            return;
          }

          // New reply arrived from Astrologer!
          if (updatedAt > prevTime && room.senderRole === 'acharya' && room.lastMessage) {
            seenTimestampsRef.current[rId] = updatedAt;

            const astroName = room.astrologerName || 'Acharya';
            const notifTitle = `🪔 ${astroName} replied`;
            const astroId = room.astrologerId || rId.split('__')[1] || 'a1';
            showChatNotification({
              title: notifTitle,
              body: room.lastMessage,
              data: { roomId: rId, actionUrl: `/chat/${astroId}` },
            });
            useNotificationStore.getState().addNotification({
              type: 'chat_message',
              title: notifTitle,
              message: room.lastMessage,
              actionUrl: `/chat/${astroId}`,
            });
          } else {
            seenTimestampsRef.current[rId] = Math.max(prevTime, updatedAt);
          }
        });
      });
      unsubs.push(unsub);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isAstrologer, authUser?.id, authUser?.email, authUser?.name]);

  return null;
}
