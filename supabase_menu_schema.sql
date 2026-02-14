-- ============================================
-- 阿爸的芋圓 - 菜單資料表結構
-- ============================================
-- 建立日期：2026-02-14
-- 說明：將菜單資料從 localStorage 遷移到 Supabase
-- ============================================

-- 1. 主分類資料表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 子分類資料表
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 菜單品項資料表
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT DEFAULT '',
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 加購品項資料表
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 分類配置資料表（儲存哪些分類不支援加購、溫度選項等）
CREATE TABLE IF NOT EXISTS category_settings (
  category_id TEXT PRIMARY KEY REFERENCES categories(id) ON DELETE CASCADE,
  allow_addons BOOLEAN DEFAULT true,
  temperature_options JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 建立索引以提升查詢效能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory ON menu_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- ============================================
-- 啟用 Realtime (即時訂閱)
-- ============================================
-- 注意：需要在 Supabase Dashboard 手動啟用 Realtime
-- 或執行以下 SQL（需要適當權限）：
-- ALTER PUBLICATION supabase_realtime ADD TABLE categories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE subcategories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE addons;
-- ALTER PUBLICATION supabase_realtime ADD TABLE category_settings;

-- ============================================
-- 自動更新 updated_at 的觸發器函數
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為各資料表建立觸發器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_settings_updated_at BEFORE UPDATE ON category_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成！請在 Supabase Dashboard 執行此 SQL
-- ============================================
