-- 新增每日遞增的顯示編號欄位
ALTER TABLE orders ADD COLUMN IF NOT EXISTS display_number INTEGER DEFAULT 0;
ALTER TABLE order_history ADD COLUMN IF NOT EXISTS display_number INTEGER DEFAULT 0;
