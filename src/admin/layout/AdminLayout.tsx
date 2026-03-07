import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, Armchair, QrCode, BarChart3, Users, LogOut } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useMenuStore } from '../../stores/menuStore';
import { useAuthStore } from '../../stores/authStore';
import { hasPermission, ROLE_LABELS } from '../constants/permissions';
import { useEffect, useRef } from 'react';

const allNavItems = [
  { to: '/admin/orders', path: 'orders', icon: ClipboardList, label: '訂單管理' },
  { to: '/admin/analytics', path: 'analytics', icon: BarChart3, label: '營業統計' },
  { to: '/admin/menu', path: 'menu', icon: UtensilsCrossed, label: '菜單管理' },
  { to: '/admin/tables', path: 'tables', icon: Armchair, label: '桌位管理' },
  { to: '/admin/qrcode', path: 'qrcode', icon: QrCode, label: 'QR Code' },
  { to: '/admin/accounts', path: 'accounts', icon: Users, label: '帳號管理' },
];

export default function AdminLayout() {
  const orders = useOrderStore((s) => s.orders);
  const fetchMenuItems = useMenuStore((s) => s.fetchMenuItems);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const knownOrderIdsRef = useRef(new Set<string>());
  const audioContextRef = useRef<AudioContext | null>(null);

  // 根據角色過濾導航項目
  const navItems = user
    ? allNavItems.filter((item) => hasPermission(user.role, item.path))
    : [];

  // 初始化 AudioContext（需要用戶互動）
  const initAudioContext = async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        // 立即嘗試恢復（需要在用戶手勢中）
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.error('AudioContext 初始化失敗:', error);
      }
    } else if (audioContextRef.current.state === 'suspended') {
      // 如果已存在但被暫停，嘗試恢復
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.error('AudioContext 恢復失敗:', error);
      }
    }
  };

  // 播放提示音（新訂單 / 取消訂單）
  const playNotificationSound = async (type: 'new' | 'cancel' = 'new') => {
    try {
      const audioContext = audioContextRef.current;

      // AudioContext 尚未由用戶互動初始化，跳過播放
      if (!audioContext || audioContext.state !== 'running') {
        return;
      }

      if (type === 'new') {
        // 新訂單：兩次上升音（叮叮）
        [0, 0.3].forEach((delay) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = delay === 0 ? 800 : 1000;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.2);

          oscillator.start(audioContext.currentTime + delay);
          oscillator.stop(audioContext.currentTime + delay + 0.2);
        });
      } else {
        // 取消訂單：一次下降音（咚）
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 400;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

      }
    } catch (error) {
      console.error('播放提示音失敗:', error);
    }
  };

  // 全局 Realtime 訂閱 + 用戶互動監聽
  useEffect(() => {
    // 載入菜單資料
    fetchMenuItems();

    // 啟用 Supabase 即時訂閱
    const unsubscribe = useOrderStore.getState().subscribeToOrders();

    // 監聽用戶互動，初始化並恢復 AudioContext
    const handleUserInteraction = async () => {
      await initAudioContext();
    };

    // 監聽多種互動事件
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // 每隔一段時間檢查並恢復 AudioContext（防止被瀏覽器暫停）
    const keepAliveInterval = setInterval(async () => {
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (error) {
          console.error('AudioContext 恢復失敗:', error);
        }
      }
    }, 30000); // 每 30 秒檢查一次

    return () => {
      unsubscribe();
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      clearInterval(keepAliveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在元件掛載時執行一次

  // 全局新訂單音效提示 + 取消訂單音效
  useEffect(() => {
    const currentPendingOrders = orders.filter(o => o.status === 'pending');
    const currentCancelledOrders = orders.filter(o => o.status === 'cancelled');
    const currentAllOrderIds = new Set(orders.map(o => o.id));
    const previousOrderIds = knownOrderIdsRef.current;

    // 找出新增的待處理訂單
    const newOrderIds = currentPendingOrders
      .filter(o => !previousOrderIds.has(o.id))
      .map(o => o.id);

    // 找出新取消的訂單（之前存在，現在狀態是 cancelled，且之前不是 cancelled）
    const newCancelledIds = currentCancelledOrders
      .filter(o => previousOrderIds.has(o.id))
      .map(o => o.id);

    // 只在已完成初始化後才播放音效（避免首次載入時誤判全部為新訂單）
    if (previousOrderIds.size > 0) {
      if (newOrderIds.length > 0) {
        playNotificationSound('new');
      }

      if (newCancelledIds.length > 0) {
        playNotificationSound('cancel');
      }
    }
    knownOrderIdsRef.current = currentAllOrderIds;
  }, [orders]);

  return (
    <div className="flex min-h-screen">
      {/* 側邊導航 */}
      <aside className="w-60 bg-dark-brown flex flex-col flex-shrink-0">
        {/* Logo 區 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍠</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight font-serif">阿爸的芋圓</h1>
              <p className="text-primary-light text-xs">後台管理系統</p>
            </div>
          </div>
        </div>

        {/* 導航項目 */}
        <nav className="flex-1 pt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 h-12 text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-primary-light hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              {item.label === '訂單管理' && pendingCount > 0 && (
                <span className="ml-auto bg-error text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 用戶資訊 + 登出 */}
        {user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.username}</p>
                <p className="text-primary-light text-xs">{ROLE_LABELS[user.role]}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-primary-light hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                title="登出"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* 主要內容區 */}
      <main className="flex-1 bg-bg overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
