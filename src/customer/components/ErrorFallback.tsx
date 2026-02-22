import { useTranslation } from '../../stores/i18nStore';

interface ErrorFallbackProps {
  onReset: () => void;
}

export default function ErrorFallback({ onReset }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
      <p className="text-5xl mb-4">😵</p>
      <h1 className="text-lg font-bold text-text-primary mb-2">{t('error.title')}</h1>
      <p className="text-sm text-text-secondary mb-6">{t('error.description')}</p>
      <button
        onClick={onReset}
        className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold"
      >
        {t('error.backHome')}
      </button>
    </div>
  );
}
