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
  subscribeToOrders: () => void;
  resetDaily: () => Promise<void>;
}

let orderCounter = 0;

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  tables: [],
  loading: false,

  // 從 Supabase 載入所有訂單
  fetchOrders: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

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
        async (payload) => {
          console.log('Order change received:', payload);
          // 重新載入訂單
          await get().fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
        },
        async (payload) => {
          console.log('Table change received:', payload);
          // 重新載入桌位
          await get().fetchTables();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 交班歸零：清空所有訂單並重置桌位
  resetDaily: async () => {
    try {
      // 刪除所有訂單
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .neq('id', ''); // 刪除所有記錄

      if (deleteError) throw deleteError;

      // 重置所有桌位為可用
      const { error: updateError } = await supabase
        .from('tables')
        .update({ status: 'available', current_order_id: null })
        .neq('table_number', 0); // 更新所有記錄

      if (updateError) throw updateError;

      // 重新載入資料
      await get().fetchOrders();
      await get().fetchTables();

      console.log('✅ 交班歸零成功');
    } catch (error) {
      console.error('❌ 交班歸零失敗:', error);
      throw error;
    }
  },
}));
