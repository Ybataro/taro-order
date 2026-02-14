import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, CartCustomization } from '../types';

let cartIdCounter = 0;

export function getItemUnitPrice(item: CartItem): number {
  let price = item.menuItem.price;
  for (const a of item.customization.addons) {
    price += a.addon.price * a.quantity;
  }
  return price;
}

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
  note: string;
  paymentMethod: 'cash' | 'online';
  setTableNumber: (n: number) => void;
  addItemWithCustomization: (menuItem: MenuItem, customization: CartCustomization) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  setNote: (note: string) => void;
  setPaymentMethod: (method: 'cash' | 'online') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      tableNumber: null,
      note: '',
      paymentMethod: 'cash',
      setTableNumber: (n) => set({ tableNumber: n }),
      addItemWithCustomization: (menuItem, customization) =>
        set((s) => {
          const cartItemId = `cart-${++cartIdCounter}`;
          return {
            items: [...s.items, { cartItemId, menuItem, quantity: 1, customization }],
          };
        }),
      removeItem: (cartItemId) =>
        set((s) => ({ items: s.items.filter((i) => i.cartItemId !== cartItemId) })),
      updateQuantity: (cartItemId, quantity) =>
        set((s) => {
          if (quantity <= 0) {
            return { items: s.items.filter((i) => i.cartItemId !== cartItemId) };
          }
          return {
            items: s.items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity } : i
            ),
          };
        }),
      setNote: (note) => set({ note }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      clearCart: () => set({ items: [], note: '', paymentMethod: 'cash' }),
    }),
    {
      name: 'taro-cart-store',
    }
  )
);
