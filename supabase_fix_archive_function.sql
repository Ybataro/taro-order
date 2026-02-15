-- 修正歸檔訂單的函數（允許刪除所有訂單）
CREATE OR REPLACE FUNCTION archive_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- 將當前所有訂單複製到歷史表
  INSERT INTO order_history (id, table_number, items, total_price, status, notes, payment_method, created_at, archived_at)
  SELECT id, table_number, items, total_price, status, notes, payment_method, created_at, NOW()
  FROM orders;
  
  -- 刪除原訂單表中的所有訂單（使用 WHERE true 來明確表示刪除所有記錄）
  DELETE FROM orders WHERE true;
END;
$$;
