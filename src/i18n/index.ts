import { zhTW } from './locales/zh-TW';
import { en } from './locales/en';
import { ja } from './locales/ja';

export type Locale = 'zh-TW' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = { 'zh-TW': zhTW, en, ja };

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = translations[locale]?.[key] ?? translations['zh-TW'][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
