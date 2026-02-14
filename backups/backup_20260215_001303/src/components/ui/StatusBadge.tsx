import type { OrderStatus } from '../../types';

const config: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: '待確認', bg: 'bg-status-pending-bg', text: 'text-warning' },
  confirmed: { label: '已確認', bg: 'bg-status-pending-bg', text: 'text-warning' },
  preparing: { label: '準備中', bg: 'bg-status-cooking-bg', text: 'text-info' },
  ready: { label: '可取餐', bg: 'bg-status-done-bg', text: 'text-success' },
  completed: { label: '已完成', bg: 'bg-status-done-bg', text: 'text-success' },
  cancelled: { label: '已取消', bg: 'bg-[#FDECEA]', text: 'text-error' },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
