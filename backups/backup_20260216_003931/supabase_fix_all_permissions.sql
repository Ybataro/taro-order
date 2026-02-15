-- ================================================
-- 完整修正所有權限問題
-- ================================================

-- 1. 刪除所有舊政策
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on tables" ON tables;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;

-- 2. 為 anon 和 authenticated 角色建立政策

-- orders 表
CREATE POLICY "Enable all for anon on orders"
ON orders
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- tables 表
CREATE POLICY "Enable all for anon on tables"
ON tables
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- menu_items 表
CREATE POLICY "Enable all for anon on menu_items"
ON menu_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. 確保 Realtime 已啟用（如果已存在會顯示錯誤，可忽略）
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE tables;
-- ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- 4. 驗證設定
SELECT 
  tablename,
  policyname,
  roles
FROM pg_policies
WHERE tablename IN ('orders', 'tables', 'menu_items')
ORDER BY tablename;
