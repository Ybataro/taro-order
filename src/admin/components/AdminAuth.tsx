import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    restoreSession();
    setChecked(true);
  }, [restoreSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error || '登入失敗');
      setPassword('');
    }
  };

  // 等待 session 恢復檢查完畢
  if (!checked) return null;

  if (user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-[var(--shadow-lg)] p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-1 font-serif">後台管理系統</h1>
        <p className="text-sm text-text-secondary mb-6">請輸入帳號密碼</p>

        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(''); }}
          placeholder="用戶名"
          autoFocus
          className="w-full h-12 rounded-lg border border-border bg-bg px-4 text-base text-text-primary outline-none focus:border-primary transition-colors mb-3"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="密碼"
          className="w-full h-12 rounded-lg border border-border bg-bg px-4 text-base text-text-primary outline-none focus:border-primary transition-colors mb-3"
        />

        {error && <p className="text-error text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={!username || !password || loading}
          className="w-full h-12 rounded-lg bg-primary text-white font-semibold text-base transition-colors hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '登入中...' : '登入'}
        </button>
      </form>
    </div>
  );
}
