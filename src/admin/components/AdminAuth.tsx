import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';
const SESSION_KEY = 'taro_admin_auth';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
    } else {
      setError('密碼錯誤，請重新輸入');
      setPin('');
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-[var(--shadow-lg)] p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-1 font-serif">後台管理系統</h1>
        <p className="text-sm text-text-secondary mb-6">請輸入管理密碼</p>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          placeholder="請輸入密碼"
          autoFocus
          className="w-full h-12 rounded-lg border border-border bg-bg text-center text-lg tracking-widest font-['Poppins'] outline-none focus:border-primary transition-colors mb-3"
        />

        {error && <p className="text-error text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={!pin}
          className="w-full h-12 rounded-lg bg-primary text-white font-semibold text-base transition-colors hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          登入
        </button>
      </form>
    </div>
  );
}
