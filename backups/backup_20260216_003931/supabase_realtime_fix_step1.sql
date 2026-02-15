-- ================================================
-- 步驟 1：啟用 Realtime 功能
-- ================================================

-- 啟用 orders 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 啟用 tables 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
