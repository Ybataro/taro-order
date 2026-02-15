-- ================================================
-- 修正 Realtime 訂閱權限問題
-- ================================================
-- 原因：RLS (Row Level Security) 政策沒有允許匿名用戶訂閱即時更新
-- 解決：為 orders 和 tables 表啟用 Realtime 並設定正確的 RLS 政策
-- ================================================

-- 1. 啟用 Realtime 功能
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- 2. 檢查並確保 RLS 已啟用
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- 3. 為 orders 表設定 RLS 政策（允許所有操作）
-- 注意：這適合內部系統，如果有安全需求請調整

-- 刪除舊政策（如果存在）
DROP POLICY IF EXISTS "Allow all access to orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;

-- 創建新政策：允許所有操作
CREATE POLICY "Allow all operations on orders"
ON orders
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. 為 tables 表設定 RLS 政策
DROP POLICY IF EXISTS "Allow all access to tables" ON tables;
DROP POLICY IF EXISTS "Enable read access for all users" ON tables;
DROP POLICY IF EXISTS "Enable update for all users" ON tables;

CREATE POLICY "Allow all operations on tables"
ON tables
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. 驗證設定
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('orders', 'tables')
ORDER BY tablename, policyname;

-- 完成！現在 Realtime 訂閱應該可以正常工作了
