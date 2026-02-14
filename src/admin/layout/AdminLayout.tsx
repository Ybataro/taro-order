import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, UtensilsCrossed, Armchair, QrCode, BarChart3 } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';

const navItems = [
  { to: '/admin/orders', icon: ClipboardList, label: '訂單管理' },
  { to: '/admin/analytics', icon: BarChart3, label: '營業統計' },
  { to: '/admin/menu', icon: UtensilsCrossed, label: '菜單管理' },
  { to: '/admin/tables', icon: Armchair, label: '桌位管理' },
  { to: '/admin/qrcode', icon: QrCode, label: 'QR Code' },
];

export default function AdminLayout() {
  const pendingCount = useOrderStore((s) =>
    s.orders.filter((o) => o.status === 'pending').length
  );

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
