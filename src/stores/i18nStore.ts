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
  // 菜單內容翻譯：找不到 key 時 fallback 回原始中文名稱（靜態翻譯 fallback）
  const tMenu = (prefix: string, name: string) => {
    const key = `${prefix}.${name}`;
    const result = translate(locale, key);
    return result === key ? name : result;
  };
  // DB 翻譯 helper：優先用 DB 欄位，再 fallback 回靜態翻譯或中文
  const localized = (zhName: string, enName?: string | null, jaName?: string | null) => {
    if (locale === 'en' && enName) return enName;
    if (locale === 'ja' && jaName) return jaName;
    return zhName;
  };
  return { t, tMenu, localized, locale };
}
