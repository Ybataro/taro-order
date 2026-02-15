-- 檢查當前的 RLS 政策
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('orders', 'tables', 'order_history', 'menu_items')
ORDER BY tablename, policyname;

-- 檢查 Realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 檢查表的 RLS 狀態
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('orders', 'tables', 'order_history', 'menu_items');
