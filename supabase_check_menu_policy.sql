-- 檢查 menu_items 的政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'menu_items';

-- 如果沒有政策，建立一個
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;

CREATE POLICY "Allow all operations on menu_items"
ON menu_items
FOR ALL
USING (true)
WITH CHECK (true);
