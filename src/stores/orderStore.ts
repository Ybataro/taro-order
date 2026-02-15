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
  generateDailyOrderNumber: () => Promise<string>;
}

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
    console.log('🔔 正在建立 Realtime 訂閱...');
    console.log('📋 訂閱目標: orders 和 tables 表');
    
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
          console.log('═══════════════════════════════════');
          console.log('🎉 訂單變更事件:', payload.eventType);
          console.log('📊 完整 payload:', payload);
          console.log('═══════════════════════════════════');
          console.log('🔍 DEBUG: 進入 payload 處理回調');
          
          try {
            console.log('🔍 DEBUG: 進入 try 區塊');
            const currentOrders = get().orders;
            console.log('🔍 DEBUG: get().orders 成功，長度:', currentOrders.length);
            console.log('📋 當前訂單數:', currentOrders.length);
            
            if (payload.eventType === 'INSERT') {
              // 新增訂單：直接加入狀態（使用新陣列確保 React 偵測到變化）
              const newOrder = payload.new as Order;
              console.log('➕ 新訂單資料:', newOrder);
              const newOrders = [newOrder, ...currentOrders];
              console.log('📦 建立新陣列，長度:', newOrders.length);
              set({ orders: newOrders });
              console.log('✅ 新訂單已加入狀態，目前訂單數:', get().orders.length);
              
              // 強制觸發狀態更新通知
              const state = get();
              console.log('🔄 強制通知訂閱者，訂單數:', state.orders.length);
            } else if (payload.eventType === 'UPDATE') {
              // 更新訂單：替換對應的訂單
              const updatedOrder = payload.new as Order;
              const updatedOrders = currentOrders.map(order =>
                order.id === updatedOrder.id ? updatedOrder : order
              );
              set({ orders: updatedOrders });
              console.log('🔄 訂單已更新:', updatedOrder.id, '狀態:', updatedOrder.status);
            } else if (payload.eventType === 'DELETE') {
              // 刪除訂單：移除對應的訂單
              const deletedId = payload.old.id;
              const filteredOrders = currentOrders.filter(order => order.id !== deletedId);
              set({ orders: filteredOrders });
              console.log('🗑️ 訂單已刪除:', deletedId);
            }
          } catch (error) {
            console.error('❌ 處理訂單變更事件時發生錯誤:', error);
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
        (payload) => {
          console.log('🪑 桌位變更事件:', payload.eventType, payload);
          // 重新載入桌位
          get().fetchTables();
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime 訂閱狀態:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime 訂閱成功！');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime 訂閱失敗！錯誤:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime 訂閱超時');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Realtime 連接已關閉');
        }
      });

    return () => {
      console.log('🔌 取消 Realtime 訂閱');
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

  // 載入所有訂單（包含當前和歷史）
  fetchAllOrders: async (startDate?: string, endDate?: string) => {
    try {
      // 同時查詢當前訂單和歷史訂單
      const [currentOrders, historyOrders] = await Promise.all([
        get().fetchOrders().then(() => get().orders),
        get().fetchOrderHistory(startDate, endDate)
      ]);

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

  // 生成唯一訂單編號（使用時間戳 + 隨機數確保唯一性）
  generateDailyOrderNumber: async () => {
    try {
      // 使用時間戳 + 隨機數生成唯一 ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const orderId = `${timestamp}${random}`;
      
      return orderId;
    } catch (error) {
      console.error('Error generating order number:', error);
      // 如果出錯，使用時間戳作為備用
      return Date.now().toString();
    }
  },

  // 交班歸零：將訂單歸檔到歷史表並重置桌位
  resetDaily: async () => {
    try {
      console.log('🗃️ 開始歸檔訂單...');
      
      // 呼叫 Supabase 函數來歸檔訂單
      const { error: archiveError } = await supabase.rpc('archive_orders');

      if (archiveError) {
        console.error('❌ 歸檔訂單失敗:', archiveError);
        throw archiveError;
      }

      console.log('✅ 訂單已歸檔到歷史表');

      // 重置所有桌位為可用
      const { error: updateError } = await supabase
        .from('tables')
        .update({ status: 'available', current_order_id: null })
        .neq('table_number', 0); // 更新所有記錄

      if (updateError) {
        console.error('❌ 重置桌位失敗:', updateError);
        throw updateError;
      }

      console.log('✅ 桌位已重置');

      // 重新載入資料
      await get().fetchOrders();
      await get().fetchTables();

      console.log('✅ 交班歸零成功，歷史資料已保存');
    } catch (error) {
      console.error('❌ 交班歸零失敗:', error);
      throw error;
    }
  },
}));

