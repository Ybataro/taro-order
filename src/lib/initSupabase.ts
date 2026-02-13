import { useOrderStore } from '../stores/orderStore';

/**
 * 初始化 Supabase 連線並設定即時監聽
 */
export function initSupabase() {
  const { fetchOrders, fetchTables, subscribeToOrders } = useOrderStore.getState();

  // 載入初始資料
  fetchOrders();
  fetchTables();

  // 訂閱即時更新
  const unsubscribe = subscribeToOrders();

  return unsubscribe;
}
