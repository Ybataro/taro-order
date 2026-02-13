import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, MenuItem } from '../types';
import { categories as defaultCategories, menuItems as defaultItems } from '../data/menu';

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  toggleAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      menuItems: defaultItems,
      addMenuItem: (item) => set((s) => ({ menuItems: [...s.menuItems, item] })),
      updateMenuItem: (id, updates) =>
        set((s) => ({
          menuItems: s.menuItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      toggleAvailability: (id) =>
        set((s) => ({
          menuItems: s.menuItems.map((i) =>
            i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
          ),
        })),
      deleteMenuItem: (id) =>
        set((s) => ({ menuItems: s.menuItems.filter((i) => i.id !== id) })),
    }),
    {
      name: 'taro-menu-store',
    }
  )
);
