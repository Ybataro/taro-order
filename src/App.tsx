import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { useTranslation } from './stores/i18nStore';
import MenuPage from './customer/pages/MenuPage';
import CartPage from './customer/pages/CartPage';
import OrderStatusPage from './customer/pages/OrderStatusPage';
import ThankYouPage from './customer/pages/ThankYouPage';
import AdminLayout from './admin/layout/AdminLayout';
import AdminAuth from './admin/components/AdminAuth';
import RoleGuard from './admin/components/RoleGuard';
import OrdersPage from './admin/pages/OrdersPage';
import MenuManagePage from './admin/pages/MenuManagePage';
import TablesPage from './admin/pages/TablesPage';
import QRCodePage from './admin/pages/QRCodePage';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import AccountsPage from './admin/pages/AccountsPage';
import { useAuthStore } from './stores/authStore';
import { getDefaultPage } from './admin/constants/permissions';

function AdminIndex() {
  const user = useAuthStore((s) => s.user);
  const target = user ? getDefaultPage(user.role) : '/admin/orders';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* 顧客端路由 */}
        <Route path="/order" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/thank-you/:orderId" element={<ThankYouPage />} />
        <Route path="/status/:orderId" element={<OrderStatusPage />} />

        {/* 店家後台路由 */}
        <Route path="/admin" element={<AdminAuth><AdminLayout /></AdminAuth>}>
          <Route index element={<AdminIndex />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<RoleGuard path="analytics"><AnalyticsPage /></RoleGuard>} />
          <Route path="menu" element={<RoleGuard path="menu"><MenuManagePage /></RoleGuard>} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="qrcode" element={<RoleGuard path="qrcode"><QRCodePage /></RoleGuard>} />
          <Route path="accounts" element={<RoleGuard path="accounts"><AccountsPage /></RoleGuard>} />
        </Route>

        {/* 首頁導向 */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-pulse">
          🍡
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4 font-serif">{t('brand.name')}</h1>
        <p className="text-xl text-text-secondary mb-12">{t('home.welcome')}</p>

        <div className="bg-card rounded-xl shadow-lg p-8 mb-8">
          <p className="text-lg text-text-primary mb-4">{t('home.scanPrompt')}</p>
          <p className="text-base text-text-secondary">{t('home.startJourney')}</p>
        </div>

        <p className="text-sm text-text-hint">
          {t('home.qrInfo')}<br />
          {t('home.qrScanOrder')}
        </p>
      </div>
    </div>
  );
}
