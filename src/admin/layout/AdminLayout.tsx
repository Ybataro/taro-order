import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, Armchair, QrCode, BarChart3 } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useMenuStore } from '../../stores/menuStore';
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
  const fetchMenuItems = useMenuStore((s) => s.fetchMenuItems);
  
  // 除錯：監聽 orders 變化
  useEffect(() => {
    console.log('🔍 AdminLayout: orders 狀態已更新，數量:', orders.length);
  }, [orders]);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const knownOrderIdsRef = useRef(new Set<string>());
  const audioContextRef = useRef<AudioContext | null>(null);

  // 初始化 AudioContext（需要用戶互動）
  const initAudioContext = async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('🎵 AudioContext 已初始化，狀態:', audioContextRef.current.state);
        
        // 立即嘗試恢復（需要在用戶手勢中）
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('🎵 AudioContext 已恢復');
        }
      } catch (error) {
        console.error('AudioContext 初始化失敗:', error);
      }
    } else if (audioContextRef.current.state === 'suspended') {
      // 如果已存在但被暫停，嘗試恢復
      try {
        await audioContextRef.current.resume();
        console.log('🎵 AudioContext 已恢復');
      } catch (error) {
        console.error('AudioContext 恢復失敗:', error);
      }
    }
  };

  // 播放提示音（新訂單 / 取消訂單）
  const playNotificationSound = async (type: 'new' | 'cancel' = 'new') => {
    try {
      // 確保 AudioContext 已初始化
      let audioContext = audioContextRef.current;
      
      // 如果沒有 AudioContext，嘗試創建一個（在用戶互動後）
      if (!audioContext) {
        console.warn('⚠️ AudioContext 未初始化，嘗試自動初始化...');
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioContext;
          console.log('🎵 AudioContext 已自動創建');
        } catch (error) {
          console.error('❌ AudioContext 創建失敗:', error);
          return;
        }
      }

      // 強制恢復 AudioContext（生產環境必須）
      if (audioContext.state !== 'running') {
        try {
          await audioContext.resume();
          console.log('🎵 AudioContext 已恢復為 running 狀態');
          
          // 等待一小段時間確保恢復完成
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (audioContext.state !== 'running') {
            console.error('⚠️ AudioContext 無法恢復，當前狀態:', audioContext.state);
            return;
          }
        } catch (error) {
          console.error('⚠️ AudioContext 恢復失敗:', error);
          return;
        }
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
        console.log('🔔 新訂單提示音已播放 (AudioContext state:', audioContext.state + ')');
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
        
        console.log('❌ 取消訂單提示音已播放 (AudioContext state:', audioContext.state + ')');
      }
    } catch (error) {
      console.error('播放提示音失敗:', error);
    }
  };

  // 全局 Realtime 訂閱 + 用戶互動監聽
  useEffect(() => {
    console.log('🌐 AdminLayout: 建立全局 Realtime 訂閱');
    
    // 載入菜單資料
    fetchMenuItems();
    
    // 啟用 Supabase 即時訂閱
    const unsubscribe = useOrderStore.getState().subscribeToOrders();
    
    // 監聽用戶互動，初始化並恢復 AudioContext
    const handleUserInteraction = async () => {
      console.log('👆 偵測到用戶互動，初始化/恢復 AudioContext');
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
        console.log('🔄 定期檢查：AudioContext 被暫停，嘗試恢復...');
        try {
          await ctx.resume();
          console.log('✅ AudioContext 已恢復');
        } catch (error) {
          console.error('❌ AudioContext 恢復失敗:', error);
        }
      }
    }, 30000); // 每 30 秒檢查一次
    
    return () => {
      console.log('🌐 AdminLayout: 清理全局 Realtime 訂閱');
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
    
    if (newOrderIds.length > 0) {
      console.log('🆕 發現新訂單:', newOrderIds);
      playNotificationSound('new');
    }
    
    if (newCancelledIds.length > 0) {
      console.log('❌ 訂單已取消:', newCancelledIds);
      playNotificationSound('cancel');
    }
    
    // 更新已知訂單列表（包含所有狀態的訂單）
    if (previousOrderIds.size === 0) {
      // 初始化：記錄當前所有訂單，避免首次載入時誤判
      console.log('📋 初始化訂單追蹤，當前訂單數:', orders.length);
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
      </aside>

      {/* 主要內容區 */}
      <main className="flex-1 bg-bg overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
