-- 為 menu_items 新增 tags 欄位（標籤：招牌/熱銷/新品/季節限定）
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
