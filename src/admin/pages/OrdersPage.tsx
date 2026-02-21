import { useState, useEffect, useRef } from 'react';
import { Bell, CalendarDays, RotateCcw } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import { useSystemStore } from '../../stores/systemStore';
import type { OrderStatus } from '../../types';
import OrderCard from '../components/OrderCard';

const filters: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '新訂單' },
  { key: 'preparing', label: '準備中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

// 精簡模式的篩選條件（全部、已完成、已取消）
const compactFilters = new Set<string>(['all', 'completed', 'cancelled']);

function toDateString(iso: string): string {
  return iso.slice(0, 10);
}

function todayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const resetDaily = useOrderStore((s) => s.resetDaily);
  const getTodayStartTime = useSystemStore((s) => s.getTodayStartTime);
  const checkAutoShiftReset = useSystemStore((s) => s.checkAutoShiftReset);
  
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastShiftTime, setLastShiftTime] = useState<string>('');
  const [displayDate, setDisplayDate] = useState<string>('');

  // 執行自動交班檢查（初始 + 定時）
  const autoResetRunning = useRef(false);

  const runAutoResetCheck = async () => {
    if (autoResetRunning.current) return;
    autoResetRunning.current = true;
    try {
      const needAutoReset = await checkAutoShiftReset();
      if (needAutoReset) {
        await resetDaily();
        // 刷新 systemStore 快取，避免 30 秒後重複觸發
        await useSystemStore.getState().fetchLastShiftResetTime();
        const todayStart = await getTodayStartTime();
        setLastShiftTime(todayStart);
        setDisplayDate(todayString());
        await fetchOrders(todayStart);
        alert('✅ 系統已自動執行交班歸零（偵測到跨日）');
      }
    } catch (error) {
      console.error('自動交班失敗:', error);
    } finally {
      autoResetRunning.current = false;
    }
  };

  // 初始載入 + 每 30 秒檢查跨日
  useEffect(() => {
    const init = async () => {
      await runAutoResetCheck();

      // 載入訂單
      const todayStart = await getTodayStartTime();
      setLastShiftTime(todayStart);
      setDisplayDate(todayString());
      await fetchOrders(todayStart);
    };

    init();

    // 每 30 秒檢查是否跨日需要自動交班
    const intervalId = setInterval(runAutoResetCheck, 30_000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 今天的訂單就是所有當前訂單（已經按交班時間過濾）
  const dateOrders = orders;

  const pendingCount = dateOrders.filter((o) => o.status === 'pending').length;
  const filteredOrders = activeFilter === 'all'
    ? dateOrders
    : dateOrders.filter((o) => o.status === activeFilter);

  const getFilterCount = (key: string) => {
    if (key === 'all') return dateOrders.length;
    return dateOrders.filter((o) => o.status === key).length;
  };

  const useCompact = compactFilters.has(activeFilter);

  // 當日營收
  const dayRevenue = dateOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_price, 0);

  const handleReset = async () => {
    try {
      await resetDaily();
      setShowResetConfirm(false);
      
      // 重新載入今天的訂單
      const todayStart = await getTodayStartTime();
      setLastShiftTime(todayStart);
      setDisplayDate(todayString());
      await fetchOrders(todayStart);
      
      alert('✅ 交班歸零成功！所有訂單已清空，桌位已重置。');
    } catch (error) {
      console.error('交班歸零失敗:', error);
      alert('❌ 交班歸零失敗，請稍後再試或聯繫技術支援。');
    }
  };

  return (
    <div className="p-6">
      {/* 頁面標題列 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">訂單管理</h1>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-status-pending-bg text-warning px-4 py-2 rounded-full animate-pulse">
              <Bell size={18} />
              <span className="font-semibold">{pendingCount} 筆新訂單</span>
            </div>
          )}
        </div>
      </div>

      {/* 日期選擇 & 交班歸零 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-[12px] px-4 py-2">
          <CalendarDays size={18} className="text-primary" />
          <span className="text-text-primary font-semibold text-sm">
            今天 {displayDate}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-text-secondary">
            今日營收：
            <span className="font-bold text-primary font-['Poppins'] ml-1">NT$ {dayRevenue}</span>
          </span>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            交班歸零
          </button>
        </div>
      </div>

      {/* 篩選標籤 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => {
          const count = getFilterCount(f.key);
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-card text-text-secondary border border-border hover:border-primary'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 訂單卡片 */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-text-hint">
          <span className="text-5xl block mb-4">📋</span>
          <p className="text-lg">目前沒有訂單</p>
        </div>
      ) : useCompact ? (
        <div className="flex flex-col gap-2">
          {filteredOrders.map((order, idx) => (
            <OrderCard key={`${order.id}-${idx}`} order={order} compact />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredOrders.map((order, idx) => (
            <OrderCard key={`${order.id}-${idx}`} order={order} />
          ))}
        </div>
      )}

      {/* 交班歸零確認對話框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-text-primary text-center mb-2">確認交班歸零？</h2>
            <p className="text-text-secondary text-center mb-2">
              將清除所有訂單並重置全部桌位
            </p>
            <p className="text-sm text-error text-center mb-6">
              此操作無法復原，請確認已完成交班結算
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-[12px] bg-secondary text-text-primary font-semibold hover:bg-border transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-[12px] bg-error text-white font-semibold hover:bg-error/90 transition-colors cursor-pointer"
              >
                確認歸零
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

