import { create } from 'zustand';
import type { Category, MenuItem, Addon } from '../types';
import { supabase } from '../lib/supabase';

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
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // 讀取子分類
      const { data: subcategoriesData, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (subError) throw subError;

      // 組合資料
      const categories: Category[] = (categoriesData || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sort_order,
        subcategories: (subcategoriesData || [])
          .filter((sub) => sub.category_id === cat.id)
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
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
        .from('menu_items')
        .select('*')
        .order('category_id', { ascending: true });

      if (error) throw error;

      const menuItems: MenuItem[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image || '',
        categoryId: item.category_id,
        subcategoryId: item.subcategory_id || undefined,
        isAvailable: item.is_available,
        tags: item.tags || [],
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
        .from('addons')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const addons: Addon[] = (data || []).map((addon) => ({
        id: addon.id,
        name: addon.name,
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
        .from('menu_items')
        .insert([{
          id: `m${Date.now()}`,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image || '',
          category_id: item.categoryId,
          subcategory_id: item.subcategoryId,
          is_available: item.isAvailable,
          tags: item.tags || [],
        }])
        .select()
        .single();

      if (error) throw error;

      // 即時更新會自動觸發，這裡只是備用
      await get().fetchMenuItems();
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
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.subcategoryId !== undefined) dbUpdates.subcategory_id = updates.subcategoryId;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // 即時更新會自動觸發，這裡只是備用
      await get().fetchMenuItems();
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
        .from('menu_items')
        .update({ is_available: !item.isAvailable })
        .eq('id', id);

      if (error) throw error;

      // 即時更新會自動觸發，這裡只是備用
      await get().fetchMenuItems();
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
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 即時更新會自動觸發，這裡只是備用
      await get().fetchMenuItems();
    } catch (error) {
      console.error('刪除菜單品項失敗:', error);
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
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          get().fetchMenuItems();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          get().fetchCategories();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subcategories' },
        () => {
          get().fetchCategories();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'addons' },
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

