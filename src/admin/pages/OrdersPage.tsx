import { useState, useEffect, useRef } from 'react';
import { Bell, CalendarDays, RotateCcw } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import type { OrderStatus } from '../../types';
import OrderCard from '../components/OrderCard';

const filters: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '新訂單' },
  { key: 'confirmed', label: '已確認' },
  { key: 'preparing', label: '準備中' },
  { key: 'ready', label: '可取餐' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

// 精簡模式的篩選條件（全部、已完成、已取消）
const compactFilters = new Set<string>(['all', 'completed', 'cancelled']);

function toDateString(iso: string): string {
  return iso.slice(0, 10);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const prevCountRef = useRef(orders.length);

  const isToday = selectedDate === todayString();

  // 初始載入訂單並啟用即時訂閱
  useEffect(() => {
    fetchOrders();
    
    // 啟用 Supabase 即時訂閱
    const unsubscribe = useOrderStore.getState().subscribeToOrders();
    
    return unsubscribe;
  }, [fetchOrders]);

  // 新訂單音效提醒
  useEffect(() => {
    if (orders.length > prevCountRef.current) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1000;
          gain2.gain.value = 0.3;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
        }, 250);
      } catch { /* 靜音處理 */ }
    }
    prevCountRef.current = orders.length;
  }, [orders.length]);

  // 依日期篩選
  const dateOrders = orders.filter((o) => toDateString(o.created_at) === selectedDate);

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
      const resetDaily = useOrderStore.getState().resetDaily;
      await resetDaily();
      setShowResetConfirm(false);
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
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-text-primary font-semibold text-sm outline-none cursor-pointer"
          />
        </div>

        {!isToday && (
          <button
            onClick={() => setSelectedDate(todayString())}
            className="px-4 py-2 rounded-[12px] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
          >
            回到今日
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-text-secondary">
            {isToday ? '今日' : selectedDate} 營收：
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
          <p className="text-lg">
            {isToday ? '目前沒有訂單' : `${selectedDate} 沒有訂單`}
          </p>
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
