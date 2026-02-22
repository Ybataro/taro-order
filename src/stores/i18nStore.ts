import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translate, type Locale } from '../i18n';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'zh-TW',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'taro-i18n', partialize: (s) => ({ locale: s.locale }) }
  )
);

export function useTranslation() {
  const locale = useI18nStore((s) => s.locale);
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale, key, params);
  return { t, locale };
}
