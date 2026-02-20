-- 修正歸檔訂單的函數（允許刪除所有訂單，處理重複 ID）
CREATE OR REPLACE FUNCTION archive_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 將當前所有訂單複製到歷史表（如果 ID 已存在則跳過，避免重複歸檔失敗）
  INSERT INTO order_history (id, table_number, items, total_price, status, notes, payment_method, created_at, archived_at)
  SELECT id, table_number, items, total_price, status, notes, payment_method, created_at, NOW()
  FROM orders
  ON CONFLICT (id) DO NOTHING;

  -- 刪除原訂單表中的所有訂單
  DELETE FROM orders WHERE true;
END;
$$;
