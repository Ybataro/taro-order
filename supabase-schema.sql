-- 阿爸的芋圓點餐系統 - Supabase 資料庫結構

-- 訂單資料表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 桌位資料表
CREATE TABLE IF NOT EXISTS tables (
  table_number INTEGER PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('available', 'occupied')),
  current_order_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始化 12 張桌子
INSERT INTO tables (table_number, status) 
VALUES 
  (1, 'available'), (2, 'available'), (3, 'available'), (4, 'available'),
  (5, 'available'), (6, 'available'), (7, 'available'), (8, 'available'),
  (9, 'available'), (10, 'available'), (11, 'available'), (12, 'available')
ON CONFLICT (table_number) DO NOTHING;

-- 建立索引提升查詢效能
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 啟用 Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取和寫入（因為是店內系統，暫時開放，未來可加入認證）
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all access to tables" ON tables FOR ALL USING (true);

-- 建立自動更新 updated_at 的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
