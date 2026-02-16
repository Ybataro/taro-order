import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { useOrderStore } from '../../stores/orderStore';
import type { Order } from '../../types';

export default function AnalyticsPage() {
  const fetchAllOrders = useOrderStore((s) => s.fetchAllOrders);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 載入訂單資料（包含歷史）
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        let start: string | undefined;
        let end: string | undefined;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (dateRange) {
          case 'today':
            start = today.toISOString();
            const endOfToday = new Date(today);
            endOfToday.setDate(endOfToday.getDate() + 1);
            endOfToday.setMilliseconds(-1);
            end = endOfToday.toISOString();
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            start = weekAgo.toISOString();
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            start = monthAgo.toISOString();
            break;
          case 'custom':
            start = startDate;
            end = endDate;
            break;
        }

        const allOrders = await fetchAllOrders(start, end);
        setOrders(allOrders);
      } catch (error) {
        console.error('載入訂單資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [dateRange, startDate, endDate, fetchAllOrders]);

  // 篩選訂單（根據日期範圍）
  const getFilteredOrders = (): Order[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);

      switch (dateRange) {
        case 'today':
          return orderDate >= today;
        
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        
        case 'custom':
          if (!startDate || !endDate) return true;
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  
  // 計算統計數據 - 只計算完成的訂單
  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_price, 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // 計算熱門商品
  const getTopItems = (limit: number = 10) => {
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};

    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (!itemCounts[key]) {
          itemCounts[key] = { name: item.name, count: 0, revenue: 0 };
        }
        itemCounts[key].count += item.quantity;
        itemCounts[key].revenue += item.price * item.quantity;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  const topItems = getTopItems(10);

  // 計算時段統計
  const getHourlyStats = () => {
    const hourlyData: Record<number, { orders: number; revenue: number }> = {};

    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { orders: 0, revenue: 0 };
    }

    completedOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += order.total_price;
    });

    return Object.entries(hourlyData)
      .filter(([_, data]) => data.orders > 0)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        orders: data.orders,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.orders - a.orders);
  };

  const hourlyStats = getHourlyStats();
  const peakHours = hourlyStats.slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">營業統計報表</h1>
        <p className="text-text-secondary">分析營收、訂單和熱門商品</p>
      </div>

      {/* 日期範圍選擇器 */}
      <div className="bg-card rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-primary" />
          <h2 className="text-lg font-semibold">日期範圍</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'today'
                ? 'bg-primary text-white'
                : 'bg-secondary text-text-secondary hover:bg-gray-200'
            }`}
          >
            今天
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'week'
                ? 'bg-primary text-white'
                : 'bg-secondary text-text-secondary hover:bg-gray-200'
            }`}
          >
            最近 7 天
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'month'
                ? 'bg-primary text-white'
                : 'bg-secondary text-text-secondary hover:bg-gray-200'
            }`}
          >
            最近 30 天
          </button>
          <button
            onClick={() => setDateRange('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === 'custom'
                ? 'bg-primary text-white'
                : 'bg-secondary text-text-secondary hover:bg-gray-200'
            }`}
          >
            自訂範圍
          </button>
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-text-secondary mb-1">開始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-text-secondary mb-1">結束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 總營收 */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-1">總營收</p>
          <p className="text-3xl font-bold text-text-primary">NT$ {totalRevenue.toLocaleString()}</p>
        </div>

        {/* 訂單數 */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-1">完成訂單</p>
          <p className="text-3xl font-bold text-text-primary">{totalOrders}</p>
        </div>

        {/* 平均客單價 */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-1">平均客單價</p>
          <p className="text-3xl font-bold text-text-primary">NT$ {averageOrderValue}</p>
        </div>

        {/* 總桌次 */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
          <p className="text-text-secondary text-sm mb-1">服務桌次</p>
          <p className="text-3xl font-bold text-text-primary">
            {new Set(completedOrders.map(o => o.table_number)).size}
          </p>
        </div>
      </div>

      {/* 熱門商品排行榜 */}
      <div className="bg-card rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">熱門商品 TOP 10</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">排名</th>
                <th className="text-left py-3 px-4 text-text-secondary font-medium">商品名稱</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">銷售數量</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">營收</th>
              </tr>
            </thead>
            <tbody>
              {topItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-hint">
                    目前沒有銷售資料
                  </td>
                </tr>
              ) : (
                topItems.map((item, index) => (
                  <tr key={item.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-right">{item.count}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">
                      NT$ {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 尖峰時段 */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">尖峰時段分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {peakHours.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-text-hint">
              目前沒有時段資料
            </div>
          ) : (
            peakHours.map((stat, index) => (
              <div
                key={stat.hour}
                className={`p-4 rounded-lg border-2 ${
                  index === 0
                    ? 'border-yellow-400 bg-yellow-50'
                    : index === 1
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-orange-300 bg-orange-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {stat.hour}:00 - {stat.hour + 1}:00
                  </span>
                  {index === 0 && <span className="text-2xl">🏆</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                </div>
                <p className="text-text-secondary">訂單數: {stat.orders}</p>
                <p className="text-text-secondary">營收: NT$ {stat.revenue.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
