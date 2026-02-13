-- 完全關閉 RLS 並清除所有政策
-- 步驟 1: 刪除所有現有政策
DROP POLICY IF EXISTS "Allow all access to orders" ON orders;
DROP POLICY IF EXISTS "Enable all operations for orders" ON orders;
DROP POLICY IF EXISTS "Allow all access to tables" ON tables;
DROP POLICY IF EXISTS "Enable all operations for tables" ON tables;

-- 步驟 2: 關閉 RLS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;

-- 步驟 3: 驗證（這個查詢應該顯示兩個 false）
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'tables');
