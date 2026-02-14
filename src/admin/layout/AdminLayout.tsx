import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, Armchair, QrCode, BarChart3 } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useEffect, useRef } from 'react';

const navItems = [
  { to: '/admin/orders', icon: ClipboardList, label: '訂單管理' },
  { to: '/admin/analytics', icon: BarChart3, label: '營業統計' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: '菜單管理' },
  { to: '/admin/tables', icon: Armchair, label: '桌位管理' },
  { to: '/admin/qrcode', icon: QrCode, label: 'QR Code' },
];

export default function AdminLayout() {
  const orders = useOrderStore((s) => s.orders);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const knownOrderIdsRef = useRef(new Set<string>());
  const audioContextRef = useRef<AudioContext | null>(null);

  // 全局 Realtime 訂閱 - 只在 AdminLayout 建立一次
  useEffect(() => {
    console.log('🌐 AdminLayout: 建立全局 Realtime 訂閱');
    
    // 啟用 Supabase 即時訂閱
    const unsubscribe = useOrderStore.getState().subscribeToOrders();
    
    return () => {
      console.log('🌐 AdminLayout: 清理全局 Realtime 訂閱');
      unsubscribe();
    };
  }, []); // 只在元件掛載時執行一次

  // 全局新訂單音效提示
  useEffect(() => {
    const currentPendingOrders = orders.filter(o => o.status === 'pending');
    const currentOrderIds = new Set(currentPendingOrders.map(o => o.id));
    
    // 找出新增的訂單 ID
    const newOrderIds = currentPendingOrders
      .filter(o => !knownOrderIdsRef.current.has(o.id))
      .map(o => o.id);
    
    if (newOrderIds.length > 0) {
      console.log('🆕 發現新訂單:', newOrderIds);
      playNotificationSound();
      
      // 更新已知訂單列表
      knownOrderIdsRef.current = currentOrderIds;
    } else if (knownOrderIdsRef.current.size === 0) {
      // 初始化：記錄當前所有訂單，避免首次載入時誤判
      knownOrderIdsRef.current = currentOrderIds;
    }
  }, [orders]);

  // 初始化 AudioContext（需要用戶互動）
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🎵 AudioContext 已初始化');
      } catch (error) {
        console.error('AudioContext 初始化失敗:', error);
      }
    }
  };

  // 播放新訂單提示音
  const playNotificationSound = () => {
    try {
      // 確保 AudioContext 已初始化
      if (!audioContextRef.current) {
        initAudioContext();
      }
      
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        console.warn('⚠️ AudioContext 未初始化');
        return;
      }

      // 恢復 AudioContext（如果被暫停）
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // 播放兩次鈴聲
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
      
      console.log('🔔 新訂單提示音已播放 (AudioContext state:', audioContext.state + ')');
    } catch (error) {
      console.error('播放提示音失敗:', error);
    }
  };

  return (
    <div className="flex min-h-screen" onClick={initAudioContext}>
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
      </aside>

      {/* 主要內容區 */}
      <main className="flex-1 bg-bg overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
