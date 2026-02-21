import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Order, Table, OrderStatus } from '../types';

interface OrderState {
  orders: Order[];
  tables: Table[];
  loading: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByTable: (tableNumber: number) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  occupyTable: (tableNumber: number) => Promise<void>;
  clearTable: (tableNumber: number) => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchOrderHistory: (startDate?: string, endDate?: string) => Promise<Order[]>;
  fetchAllOrders: (startDate?: string, endDate?: string) => Promise<Order[]>;
  subscribeToOrders: () => (() => void);
  resetDaily: () => Promise<void>;
  generateDailyOrderNumber: () => Promise<{ id: string; displayNumber: number }>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  tables: [],
  loading: false,

  // 從 Supabase 載入所有訂單
  fetchOrders: async (startDate?: string, endDate?: string) => {
    try {
      set({ loading: true });
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // 如果有日期範圍，加入過濾條件
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ orders: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ loading: false });
    }
  },

  // 從 Supabase 載入所有桌位
  fetchTables: async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) throw error;

      set({ tables: data || [] });
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  },

  // 新增訂單
  addOrder: async (order: Order) => {
    try {
      const { error } = await supabase.from('orders').insert([
        {
          id: order.id,
          display_number: order.display_number || 0,
          table_number: order.table_number,
          items: order.items,
          total_price: order.total_price,
          status: order.status,
          notes: order.notes || null,
          payment_method: order.payment_method || 'cash',
          created_at: order.created_at || new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // 更新桌位狀態
      await get().occupyTable(order.table_number);

      // 重新載入訂單列表
      await get().fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  // 更新訂單狀態
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // 如果訂單取消，清空桌位
      // 注意：訂單完成時不自動清桌，需要手動清桌
      if (status === 'cancelled') {
        const order = get().orders.find((o) => o.id === orderId);
        if (order) {
          await get().clearTable(order.table_number);
        }
      }

      // 重新載入訂單列表
      await get().fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // 佔用桌位
  occupyTable: async (tableNumber: number) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('table_number', tableNumber);

      if (error) throw error;

      await get().fetchTables();
    } catch (error) {
      console.error('Error occupying table:', error);
    }
  },

  // 清空桌位
  clearTable: async (tableNumber: number) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: 'available', current_order_id: null })
        .eq('table_number', tableNumber);

      if (error) throw error;

      await get().fetchTables();
    } catch (error) {
      console.error('Error clearing table:', error);
    }
  },

  // 根據桌號取得訂單
  getOrdersByTable: (tableNumber: number) => {
    return get().orders.filter((order) => order.table_number === tableNumber);
  },

  // 根據 ID 取得訂單
  getOrderById: (orderId: string) => {
    return get().orders.find((order) => order.id === orderId);
  },

  // 訂閱即時更新
  subscribeToOrders: () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          try {
            const currentOrders = get().orders;

            if (payload.eventType === 'INSERT') {
              const newOrder = payload.new as Order;
              set({ orders: [newOrder, ...currentOrders] });
            } else if (payload.eventType === 'UPDATE') {
              const updatedOrder = payload.new as Order;
              set({ orders: currentOrders.map(order =>
                order.id === updatedOrder.id ? updatedOrder : order
              ) });
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old.id;
              set({ orders: currentOrders.filter(order => order.id !== deletedId) });
            }
          } catch (error) {
            console.error('處理訂單變更事件時發生錯誤:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
        },
        () => {
          get().fetchTables();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime 訂閱失敗:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 從歷史表載入訂單（用於報表分析）
  fetchOrderHistory: async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('order_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte('created_at', end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching order history:', error);
      return [];
    }
  },

  // 載入所有訂單（包含當前和歷史）— 不修改全域 orders state
  fetchAllOrders: async (startDate?: string, endDate?: string) => {
    try {
      // 獨立查詢當前訂單（不影響全域 state）
      let currentQuery = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        currentQuery = currentQuery.gte('created_at', startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        currentQuery = currentQuery.lte('created_at', end.toISOString());
      }

      const [currentResult, historyOrders] = await Promise.all([
        currentQuery,
        get().fetchOrderHistory(startDate, endDate)
      ]);

      const currentOrders = currentResult.data || [];
      if (currentResult.error) {
        console.error('Error fetching current orders for analytics:', currentResult.error);
      }

      // 合併並按時間排序
      const allOrders = [...currentOrders, ...historyOrders];
      allOrders.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return allOrders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  },

  // 生成訂單：UUID 作為主鍵 + 每日遞增 display_number
  generateDailyOrderNumber: async () => {
    try {
      const id = crypto.randomUUID();

      // 取得台灣時區今日日期範圍
      const todayTW = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
      const todayStart = `${todayTW}T00:00:00+08:00`;
      const todayEnd = `${todayTW}T23:59:59+08:00`;

      // 查詢今日最大 display_number
      const { data, error } = await supabase
        .from('orders')
        .select('display_number')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .order('display_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('查詢 display_number 失敗:', error);
        return { id, displayNumber: 1 };
      }

      const maxNum = data && data.length > 0 ? (data[0].display_number || 0) : 0;
      return { id, displayNumber: maxNum + 1 };
    } catch (error) {
      console.error('Error generating order number:', error);
      return { id: crypto.randomUUID(), displayNumber: 1 };
    }
  },

  // 交班歸零：將訂單歸檔到歷史表並重置桌位
  resetDaily: async () => {
    try {
      // 呼叫 Supabase 函數來歸檔訂單
      const { error: archiveError } = await supabase.rpc('archive_orders');

      if (archiveError) {
        console.error('❌ 歸檔訂單失敗:', archiveError);
        throw archiveError;
      }

      // 重置所有桌位為可用
      const { error: updateError } = await supabase
        .from('tables')
        .update({ status: 'available', current_order_id: null })
        .neq('table_number', 0); // 更新所有記錄

      if (updateError) {
        console.error('❌ 重置桌位失敗:', updateError);
        throw updateError;
      }

      // 更新交班時間為今天的日期（YYYY-MM-DD，台灣時區）
      const todayTW = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
      const { error: settingError } = await supabase
        .from('system_settings')
        .update({ setting_value: todayTW })
        .eq('setting_key', 'last_shift_reset_time');

      if (settingError) {
        console.error('❌ 更新交班時間失敗:', settingError);
      }

      // 重新載入今天 00:00（台灣時區）之後的訂單
      const todayStartTW = `${todayTW}T00:00:00+08:00`;
      await get().fetchOrders(todayStartTW);
      await get().fetchTables();

    } catch (error) {
      console.error('❌ 交班歸零失敗:', error);
      throw error;
    }
  },
}));

