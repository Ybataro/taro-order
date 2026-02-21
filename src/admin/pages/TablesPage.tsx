import { useOrderStore } from '../../stores/orderStore';
import { useState, useEffect } from 'react';
import type { Order } from '../../types';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { X } from 'lucide-react';

export default function TablesPage() {
  const tables = useOrderStore((s) => s.tables);
  const orders = useOrderStore((s) => s.orders);
  const clearTable = useOrderStore((s) => s.clearTable);
  const fetchTables = useOrderStore((s) => s.fetchTables);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // 初始載入桌位和訂單資料（Realtime 訂閱已在 AdminLayout 建立）
  useEffect(() => {
    fetchTables();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在元件掛載時執行一次

  const emptyCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;

  // 進行中的訂單（用於桌位卡片顯示筆數）
  const getActiveOrders = (tableNumber: number): Order[] =>
    orders.filter((o) => o.table_number === tableNumber && (o.status === 'pending' || o.status === 'preparing'));

  // 該桌最新一筆訂單（排除已取消）
  const getLatestTableOrder = (tableNumber: number): Order | undefined => {
    return orders.find((o) => o.table_number === tableNumber && o.status !== 'cancelled');
  };

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">桌位管理</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            空桌 ({emptyCount})
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            用餐中 ({occupiedCount})
          </span>
        </div>
      </div>

      {/* 桌位網格 */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          const activeOrders = getActiveOrders(table.table_number);
          const occupiedTime = table.updated_at
            ? new Date(table.updated_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <button
              key={table.table_number}
              onClick={() => setSelectedTable(table.table_number)}
              className={`p-4 rounded-[12px] text-center cursor-pointer transition-all hover:shadow-[var(--shadow-md)] ${
                table.status === 'available'
                  ? 'bg-table-empty border-2 border-success/30'
                  : 'bg-table-occupied border-2 border-warning/30'
              }`}
            >
              <span className="text-2xl font-bold text-text-primary block">{table.table_number}</span>
              <span className={`text-sm font-semibold ${
                table.status === 'available' ? 'text-success' : 'text-warning'
              }`}>
                {table.status === 'available' ? '空桌' : '用餐中'}
              </span>
              {occupiedTime && (
                <span className="block text-xs text-text-hint mt-1">{occupiedTime}</span>
              )}
              {activeOrders.length > 0 && (
                <span className="block text-xs text-info mt-1">{activeOrders.length} 筆訂單</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 桌位詳情彈窗 */}
      {selectedTable !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-card rounded-[12px] shadow-[var(--shadow-lg)] p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">第 {selectedTable} 桌</h2>
              <button onClick={() => setSelectedTable(null)} className="p-1 text-text-hint hover:text-text-primary cursor-pointer">
                <X size={24} />
              </button>
            </div>

            {(() => {
              const latestOrder = getLatestTableOrder(selectedTable);
              if (!latestOrder) {
                return <p className="text-center text-text-hint py-8">此桌目前沒有訂單</p>;
              }
              return (
                <div className="border border-border rounded-[8px] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold font-['Poppins'] text-text-primary">#{String(latestOrder.display_number || 0).padStart(2, '0')}</span>
                    <StatusBadge status={latestOrder.status} />
                  </div>
                  {latestOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-0.5">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-['Poppins']">NT$ {item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="text-right font-semibold text-primary mt-1 font-['Poppins']">
                    NT$ {latestOrder.total_price}
                  </div>
                </div>
              );
            })()}

            {tables.find((t) => t.table_number === selectedTable)?.status === 'occupied' && (
              <Button
                variant="danger"
                fullWidth
                className="mt-4"
                onClick={() => {
                  clearTable(selectedTable);
                  setSelectedTable(null);
                }}
              >
                清桌
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

