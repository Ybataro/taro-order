-- ================================================
-- 步驟 3：建立新的 RLS 政策
-- ================================================

-- 為 orders 表建立政策（允許所有操作）
CREATE POLICY "Allow all operations on orders"
ON orders
FOR ALL
USING (true)
WITH CHECK (true);

-- 為 tables 表建立政策（允許所有操作）
CREATE POLICY "Allow all operations on tables"
ON tables
FOR ALL
USING (true)
WITH CHECK (true);
