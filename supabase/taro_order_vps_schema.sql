-- =============================================
-- Taro Order — VPS 完整 Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 2. subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 3. menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  description TEXT DEFAULT '',
  description_en TEXT,
  description_ja TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  daily_limit INTEGER DEFAULT NULL,
  current_stock INTEGER DEFAULT NULL,
  stock_reset_date TEXT DEFAULT NULL,
  is_combo BOOLEAN DEFAULT false,
  combo_items JSONB DEFAULT NULL
);

-- 4. addons
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_ja TEXT,
  price INTEGER NOT NULL DEFAULT 0
);

-- 5. orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  display_number INTEGER DEFAULT 0,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'online')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. order_history
CREATE TABLE IF NOT EXISTS order_history (
  id TEXT PRIMARY KEY,
  display_number INTEGER DEFAULT 0,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- 7. tables
CREATE TABLE IF NOT EXISTS tables (
  table_number INTEGER PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
  current_order_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL
);

-- 9. admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- RPC Functions
-- =============================================

CREATE OR REPLACE FUNCTION decrement_stock(p_item_id TEXT, p_qty INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  SELECT current_stock INTO v_stock
    FROM menu_items WHERE id = p_item_id FOR UPDATE;
  IF v_stock IS NULL THEN RETURN -1; END IF;
  IF v_stock < p_qty THEN RETURN v_stock; END IF;
  UPDATE menu_items SET current_stock = current_stock - p_qty WHERE id = p_item_id;
  IF v_stock - p_qty = 0 THEN
    UPDATE menu_items SET is_available = false WHERE id = p_item_id;
  END IF;
  RETURN v_stock - p_qty;
END;
$$;

CREATE OR REPLACE FUNCTION archive_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO order_history (id, table_number, items, total_price, status, notes, payment_method, created_at, archived_at, display_number)
  SELECT id, table_number, items, total_price, status, notes, payment_method, created_at, NOW(), display_number
  FROM orders
  ON CONFLICT (id) DO NOTHING;
  DELETE FROM orders WHERE true;
END;
$$;

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "anon_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_subcategories" ON subcategories FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_addons" ON addons FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_order_history" ON order_history FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_tables" ON tables FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "anon_all_admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================
-- Grants
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- =============================================
-- 初始資料
-- =============================================
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('last_shift_reset_time', '2026-01-01')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO admin_users (username, password_hash, role)
VALUES ('boss', encode(digest('taro2026', 'sha256'), 'hex'), 'owner')
ON CONFLICT (username) DO NOTHING;

INSERT INTO tables (table_number) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20)
ON CONFLICT (table_number) DO NOTHING;
