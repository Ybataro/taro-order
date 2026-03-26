import { create } from 'zustand';
import type { Category, MenuItem, Addon } from '../types';
import { supabase } from '../lib/supabase';
import { getTaiwanToday } from '../lib/date';

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  addons: Addon[];
  isLoading: boolean;
  
  // 資料讀取
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  fetchAddons: () => Promise<void>;
  
  // 菜單品項操作
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // 庫存管理
  resetStaleStocks: () => Promise<void>;
  setManualStock: (id: string, qty: number) => Promise<void>;

  // 即時訂閱
  subscribeToMenu: () => () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  menuItems: [],
  addons: [],
  isLoading: false,

  // ============================================
  // 讀取分類資料
  // ============================================
  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      
      // 讀取主分類
      const { data: categoriesData, error: catError } = await supabase
        .from('taro_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // 讀取子分類
      const { data: subcategoriesData, error: subError } = await supabase
        .from('taro_subcategories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (subError) throw subError;

      // 組合資料
      const categories: Category[] = (categoriesData || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameEn: cat.name_en ?? null,
        nameJa: cat.name_ja ?? null,
        sortOrder: cat.sort_order,
        subcategories: (subcategoriesData || [])
          .filter((sub) => sub.category_id === cat.id)
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            nameEn: sub.name_en ?? null,
            nameJa: sub.name_ja ?? null,
            categoryId: sub.category_id,
            sortOrder: sub.sort_order,
          })),
      }));

      set({ categories, isLoading: false });
    } catch (error) {
      console.error('載入分類失敗:', error);
      set({ isLoading: false });
    }
  },

  // ============================================
  // 讀取菜單品項
  // ============================================
  fetchMenuItems: async () => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('taro_menu_items')
        .select('*')
        .order('category_id', { ascending: true });

      if (error) throw error;

      const menuItems: MenuItem[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.name_en ?? null,
        nameJa: item.name_ja ?? null,
        description: item.description || '',
        descriptionEn: item.description_en ?? null,
        descriptionJa: item.description_ja ?? null,
        price: item.price,
        image: item.image || '',
        categoryId: item.category_id,
        subcategoryId: item.subcategory_id || undefined,
        isAvailable: item.is_available,
        tags: item.tags || [],
        dailyLimit: item.daily_limit ?? null,
        currentStock: item.current_stock ?? null,
        stockResetDate: item.stock_reset_date ?? null,
        isCombo: item.is_combo ?? false,
        comboItems: item.combo_items ?? null,
      }));

      set({ menuItems, isLoading: false });
    } catch (error) {
      console.error('載入菜單失敗:', error);
      set({ isLoading: false });
    }
  },

  // ============================================
  // 讀取加購品項
  // ============================================
  fetchAddons: async () => {
    try {
      const { data, error } = await supabase
        .from('taro_addons')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const addons: Addon[] = (data || []).map((addon) => ({
        id: addon.id,
        name: addon.name,
        nameEn: addon.name_en ?? null,
        nameJa: addon.name_ja ?? null,
        price: addon.price,
      }));

      set({ addons });
    } catch (error) {
      console.error('載入加購品項失敗:', error);
    }
  },

  // ============================================
  // 新增菜單品項
  // ============================================
  addMenuItem: async (item) => {
    try {
      const { error } = await supabase
        .from('taro_menu_items')
        .insert([{
          id: `m${Date.now()}`,
          name: item.name,
          name_en: item.nameEn || null,
          name_ja: item.nameJa || null,
          description: item.description,
          description_en: item.descriptionEn || null,
          description_ja: item.descriptionJa || null,
          price: item.price,
          image: item.image || '',
          category_id: item.categoryId,
          subcategory_id: item.subcategoryId,
          is_available: item.isAvailable,
          tags: item.tags || [],
          daily_limit: item.dailyLimit ?? null,
          current_stock: item.dailyLimit ?? null,
          stock_reset_date: item.dailyLimit != null ? getTaiwanToday() : null,
          is_combo: item.isCombo ?? false,
          combo_items: item.comboItems ?? null,
        }])
        .select()
        .single();

      if (error) throw error;
    } catch (error) {
      console.error('新增菜單品項失敗:', error);
      throw error;
    }
  },

  // ============================================
  // 更新菜單品項
  // ============================================
  updateMenuItem: async (id, updates) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn || null;
      if (updates.nameJa !== undefined) dbUpdates.name_ja = updates.nameJa || null;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn || null;
      if (updates.descriptionJa !== undefined) dbUpdates.description_ja = updates.descriptionJa || null;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.subcategoryId !== undefined) dbUpdates.subcategory_id = updates.subcategoryId;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.dailyLimit !== undefined) {
        dbUpdates.daily_limit = updates.dailyLimit;
        dbUpdates.current_stock = updates.dailyLimit;
        dbUpdates.stock_reset_date = updates.dailyLimit != null ? getTaiwanToday() : null;
      }
      if (updates.isCombo !== undefined) dbUpdates.is_combo = updates.isCombo;
      if (updates.comboItems !== undefined) dbUpdates.combo_items = updates.comboItems;

      const { error } = await supabase
        .from('taro_menu_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('更新菜單品項失敗:', error);
      throw error;
    }
  },

  // ============================================
  // 切換上架/下架
  // ============================================
  toggleAvailability: async (id) => {
    try {
      const item = get().menuItems.find((i) => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('taro_menu_items')
        .update({ is_available: !item.isAvailable })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('切換上架狀態失敗:', error);
      throw error;
    }
  },

  // ============================================
  // 刪除菜單品項
  // ============================================
  deleteMenuItem: async (id) => {
    try {
      const { error } = await supabase
        .from('taro_menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('刪除菜單品項失敗:', error);
      throw error;
    }
  },

  // ============================================
  // 每日庫存重置（首位使用者觸發）
  // ============================================
  resetStaleStocks: async () => {
    try {
      const todayTW = getTaiwanToday();

      // 找出有設定限量、但 reset_date 不是今天的品項
      const { data, error } = await supabase
        .from('taro_menu_items')
        .select('id, daily_limit')
        .not('daily_limit', 'is', null)
        .neq('stock_reset_date', todayTW);

      if (error) throw error;
      if (!data || data.length === 0) return;

      // 批次更新：重置庫存 + 重新上架
      for (const item of data) {
        await supabase
          .from('taro_menu_items')
          .update({
            current_stock: item.daily_limit,
            stock_reset_date: todayTW,
            is_available: true,
          })
          .eq('id', item.id);
      }

      // 重新載入
      await get().fetchMenuItems();
    } catch (error) {
      console.error('庫存重置失敗:', error);
    }
  },

  // ============================================
  // Admin 手動覆蓋庫存
  // ============================================
  setManualStock: async (id, qty) => {
    try {
      const updates: Record<string, unknown> = { current_stock: qty };
      if (qty > 0) updates.is_available = true;

      const { error } = await supabase
        .from('taro_menu_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchMenuItems();
    } catch (error) {
      console.error('手動設定庫存失敗:', error);
      throw error;
    }
  },

  // ============================================
  // 即時訂閱菜單變更
  // ============================================
  subscribeToMenu: () => {
    // 訂閱菜單品項變更
    const menuSubscription = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taro_menu_items' },
        () => {
          get().fetchMenuItems();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taro_categories' },
        () => {
          get().fetchCategories();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taro_subcategories' },
        () => {
          get().fetchCategories();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'taro_addons' },
        () => {
          get().fetchAddons();
        }
      )
      .subscribe();

    // 返回取消訂閱函數
    return () => {
      supabase.removeChannel(menuSubscription);
    };
  },
}));

