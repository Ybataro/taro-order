-- ================================================
-- 步驟 2：刪除舊的 RLS 政策
-- ================================================

-- 刪除 orders 表的舊政策
DROP POLICY IF EXISTS "Allow all access to orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable update for all users" ON orders;
DROP POLICY IF EXISTS "Enable delete for all users" ON orders;

-- 刪除 tables 表的舊政策
DROP POLICY IF EXISTS "Allow all access to tables" ON tables;
DROP POLICY IF EXISTS "Enable read access for all users" ON tables;
DROP POLICY IF EXISTS "Enable update for all users" ON tables;
