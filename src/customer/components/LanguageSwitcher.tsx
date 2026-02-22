import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18nStore } from '../../stores/i18nStore';
import type { Locale } from '../../i18n';

const options: { locale: Locale; label: string; short: string }[] = [
  { locale: 'zh-TW', label: '中文', short: '中' },
  { locale: 'en', label: 'English', short: 'EN' },
  { locale: 'ja', label: '日本語', short: 'JP' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const ref = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = options.find((o) => o.locale === locale) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary-light text-sm font-semibold cursor-pointer hover:bg-primary/30 transition-colors"
        aria-label="Switch language"
      >
        <Globe size={16} />
        <span>{current.short}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-card rounded-[12px] shadow-[var(--shadow-lg)] py-1 min-w-[120px] z-50 border border-border">
          {options.map((opt) => (
            <button
              key={opt.locale}
              onClick={() => { setLocale(opt.locale); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                opt.locale === locale
                  ? 'text-primary bg-primary/10'
                  : 'text-text-primary hover:bg-secondary'
              }`}
            >
              {opt.locale === locale && <span className="mr-1.5">●</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
