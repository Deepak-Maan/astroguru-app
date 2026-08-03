import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isMandatory: boolean;
  releaseNotes: string[];
  downloadProgress: number; // 0 to 100
  isDownloading: boolean;
  isReadyToInstall: boolean;
}

interface UpdateState extends UpdateInfo {
  checkForUpdates: () => void;
  broadcastUpdate: (newVer: string, notes: string[], mandatory?: boolean) => void;
  startDownload: () => void;
  installUpdate: () => void;
  dismissUpdate: () => void;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      currentVersion: '1.0.0',
      latestVersion: '1.2.0',
      updateAvailable: true,
      isMandatory: false,
      releaseNotes: [
        '✨ Added 10+ New Astrological Tools (Gun Milan, Sade Sati, Japa Mala)',
        '🪄 New Vedic Spells & Manifestation Rituals Store',
        '🛒 E-Commerce Gemstone & Remedies Shipping Checkout',
        '⚡ Admin E-Commerce Order & Inventory Management Panel',
        '⚡ Faster App Launch, Smooth 60FPS UI & Offline Persistence',
      ],
      downloadProgress: 0,
      isDownloading: false,
      isReadyToInstall: false,

      checkForUpdates: () => {
        const { currentVersion, latestVersion } = get();
        if (latestVersion !== currentVersion) {
          set({ updateAvailable: true });
        }
      },

      broadcastUpdate: (newVer, notes, mandatory = false) => {
        set({
          latestVersion: newVer,
          releaseNotes: notes,
          isMandatory: mandatory,
          updateAvailable: true,
          downloadProgress: 0,
          isDownloading: false,
          isReadyToInstall: false,
        });
      },

      startDownload: () => {
        set({ isDownloading: true, downloadProgress: 0 });

        let progress = 0;
        const interval = setInterval(() => {
          progress += 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            set({ downloadProgress: 100, isDownloading: false, isReadyToInstall: true });
          } else {
            set({ downloadProgress: progress });
          }
        }, 300);
      },

      installUpdate: () => {
        const { latestVersion } = get();
        set({
          currentVersion: latestVersion,
          updateAvailable: false,
          isDownloading: false,
          isReadyToInstall: false,
          downloadProgress: 0,
        });
      },

      dismissUpdate: () => {
        set({ updateAvailable: false });
      },
    }),
    {
      name: 'astroguru_update_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
