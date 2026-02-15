import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Order } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { useOrderStore } from '../../stores/orderStore';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
}

const borderColors = {
  pending: 'border-l-warning',
  confirmed: 'border-l-warning',
  preparing: 'border-l-info',
  ready: 'border-l-info',
  completed: 'border-l-success',
  cancelled: 'border-l-error',
};

export default function OrderCard({ order, compact = false }: OrderCardProps) {
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const [expanded, setExpanded] = useState(false);

  const createdDate = new Date(order.created_at);
  const createdTime = createdDate.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const createdDateStr = createdDate.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
  });

  const handleAction = () => {
    if (order.status === 'pending') {
      updateOrderStatus(order.id, 'confirmed');
    } else if (order.status === 'confirmed') {
      updateOrderStatus(order.id, 'preparing');
    } else if (order.status === 'preparing') {
      updateOrderStatus(order.id, 'ready');
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'completed');
    }
  };

  const handleCancel = () => {
    updateOrderStatus(order.id, 'cancelled');
  };

  const actionLabel = {
    pending: '確認訂單',
    confirmed: '開始準備',
    preparing: '準備完成',
    ready: '已取餐',
    completed: '',
    cancelled: '',
  }[order.status];

  // 精簡模式：一行顯示摘要，可展開明細
  if (compact) {
    return (
      <div className={`bg-card rounded-[12px] shadow-[var(--shadow-card)] border-l-4 ${borderColors[order.status]} overflow-hidden`}>
        {/* 摘要列 */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-primary whitespace-nowrap">第 {order.table_number} 桌</span>
            <span className="text-sm text-text-hint font-['Poppins'] truncate">{order.id}</span>
            <span className="text-sm text-text-hint whitespace-nowrap">{createdDateStr} {createdTime}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
            <span className="font-bold text-primary font-['Poppins']">NT$ {order.total_price}</span>
            <StatusBadge status={order.status} />
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleCancel(); }}
                className="px-3 py-1 text-sm border border-error/30 text-error rounded-[8px] hover:bg-error/10 transition-colors cursor-pointer"
              >
                取消
              </button>
            )}
            {expanded ? <ChevronUp size={18} className="text-text-hint" /> : <ChevronDown size={18} className="text-text-hint" />}
          </div>
        </div>

        {/* 展開明細 */}
        {expanded && (
          <>
            <div className="px-4 py-2 border-t border-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-text-secondary font-['Poppins']">x{item.quantity}</span>
                  </div>
                  {item.customizationText && (
                    <p className="text-xs text-primary mt-0.5">{item.customizationText}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-hint">
                  {order.payment_method === 'cash' ? '💵 現場結帳' : '📱 線上付款'}
                </span>
              </div>
              {order.notes && (
                <p className="text-sm text-text-hint mt-2 bg-secondary rounded-[8px] p-2">
                  📝 {order.notes}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // 完整模式：進行中的訂單（pending / accepted / cooking）
  return (
    <div className={`bg-card rounded-[12px] shadow-[var(--shadow-card)] border-l-4 ${borderColors[order.status]} overflow-hidden`}>
      {/* 標題列 */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-primary">第 {order.table_number} 桌</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center justify-between text-sm text-text-hint">
          <span className="font-['Poppins']">{order.id}</span>
          <span>{createdDateStr} {createdTime}</span>
        </div>
      </div>

      {/* 品項列表 */}
      <div className="px-4 py-2 border-t border-border">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-primary">{item.name}</span>
              <span className="text-text-secondary font-['Poppins']">x{item.quantity}</span>
            </div>
            {item.customizationText && (
              <p className="text-xs text-primary mt-0.5">{item.customizationText}</p>
            )}
          </div>
        ))}
      </div>

      {/* 底部 */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-primary font-['Poppins']">
            NT$ {order.total_price}
          </span>
          <span className="text-sm text-text-hint">
            {order.payment_method === 'cash' ? '💵 現場結帳' : '📱 線上付款'}
          </span>
        </div>

        {order.notes && (
          <p className="text-sm text-text-hint mb-3 bg-secondary rounded-[8px] p-2">
            📝 {order.notes}
          </p>
        )}

        <div className="flex gap-2">
          {actionLabel && (
            <Button fullWidth onClick={handleAction}>
              {actionLabel}
            </Button>
          )}
          {order.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-error/30 text-error rounded-[12px] text-sm font-semibold hover:bg-error/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              取消訂單
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
