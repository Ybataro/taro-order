// 菜單分類
export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  sortOrder: number;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  sortOrder: number;
}

// 菜單品項
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  subcategoryId: string;
  isAvailable: boolean;
}

// 加購品項
export interface Addon {
  id: string;
  name: string;
  price: number;
}

// 購物車中的客製化選項
export type TemperatureOption = '冰' | '涼' | '熱' | '冷';

export interface CartCustomization {
  addons: { addon: Addon; quantity: number }[];
  temperature: TemperatureOption | null;
}

// 購物車品項
export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: CartCustomization;
}

// 訂單狀態
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

// 訂單
export interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  status: OrderStatus;
  payment_method?: 'cash' | 'online';
  total_price: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizationText: string;
}

// 桌位
export interface Table {
  table_number: number;
  status: 'available' | 'occupied';
  current_order_id?: string | null;
  updated_at?: string;
}
