import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TRANSLATIONS, TranslationKey, LanguageCode } from '../i18n/translations';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (language: LanguageCode) => set({ language }),

      t: (key: TranslationKey) => {
        const lang = get().language || 'en';
        const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
        return dict[key] || TRANSLATIONS['en'][key] || key;
      },
    }),
    {
      name: 'astroguru-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ language: s.language }),
    },
  ),
);
