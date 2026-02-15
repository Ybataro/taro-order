-- 建立訂單歷史表（保存所有歸檔的訂單）
CREATE TABLE IF NOT EXISTS order_history (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT order_history_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'))
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_archived_at ON order_history(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_table_number ON order_history(table_number);
CREATE INDEX IF NOT EXISTS idx_order_history_status ON order_history(status);

-- 啟用 RLS (Row Level Security)
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- 建立政策：允許所有操作（開發階段，生產環境需要更嚴格的權限控制）
CREATE POLICY "Enable all access for order_history" ON order_history
  FOR ALL USING (true) WITH CHECK (true);

-- 建立歸檔訂單的函數
CREATE OR REPLACE FUNCTION archive_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 將當前所有訂單複製到歷史表
  INSERT INTO order_history (id, table_number, items, total_price, status, notes, payment_method, created_at, archived_at)
  SELECT id, table_number, items, total_price, status, notes, payment_method, created_at, NOW()
  FROM orders;
  
  -- 刪除原訂單表中的所有訂單
  DELETE FROM orders;
END;
$$;

COMMENT ON TABLE order_history IS '訂單歷史記錄表，用於保存所有歸檔的訂單';
COMMENT ON FUNCTION archive_orders() IS '將當前訂單歸檔到歷史表';
