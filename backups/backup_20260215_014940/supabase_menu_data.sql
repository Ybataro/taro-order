-- ============================================
-- 阿爸的芋圓 - 菜單初始資料
-- ============================================
-- 建立日期：2026-02-14
-- 說明：插入所有菜單、分類、加購品項資料
-- 執行順序：先執行 supabase_menu_schema.sql，再執行此檔案
-- ============================================

-- ============================================
-- 1. 插入主分類 (4個)
-- ============================================
INSERT INTO categories (id, name, sort_order) VALUES
  ('shaved-ice', '蔗片冰區', 1),
  ('sweet-soup', '甜湯區', 2),
  ('frozen', '產量限定', 3),
  ('almond-tea', '就愛杏仁', 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 2. 插入子分類 (13個)
-- ============================================
INSERT INTO subcategories (id, name, category_id, sort_order) VALUES
  -- 蔗片冰區
  ('taro', '就愛芋頭系列', 'shaved-ice', 1),
  ('classic', '經典組合系列', 'shaved-ice', 2),
  ('sesame', '就愛芝麻系列', 'shaved-ice', 3),
  ('pineapple', '就愛鳳梨系列', 'shaved-ice', 4),
  -- 甜湯區
  ('handmade-tofu', '手沖豆花系列', 'sweet-soup', 1),
  ('soymilk-tofu', '豆漿豆花系列', 'sweet-soup', 2),
  ('barley', '消暑薏仁湯系列', 'sweet-soup', 3),
  ('snow-fungus', '養身銀耳系列', 'sweet-soup', 4),
  -- 產量限定
  ('frozen-items', '冷凍 / 冰淇淋', 'frozen', 1),
  -- 就愛杏仁
  ('almond-items', '厚杏仁茶', 'almond-tea', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 3. 插入菜單品項 (44個)
-- ============================================
INSERT INTO menu_items (id, name, description, price, image, category_id, subcategory_id, is_available) VALUES
  -- 蔗片冰區 — 就愛芋頭系列 (5個)
  ('m1', '花生冰淇淋蔗片冰', '花生冰淇淋、芋圓、白芋湯圓、紅豆、小薏仁、芋泥漿（限內用）', 150, '', 'shaved-ice', 'taro', true),
  ('m2', '招牌芋見泥蔗片冰', '芋球、芋泥漿、芋圓、白芋湯圓、粉圓、小薏仁', 145, '/images/menu/招牌芋見泥蔗片冰.jpg', 'shaved-ice', 'taro', true),
  ('m3', '芋泥相遇蔗片冰', '芋泥漿、芋圓、白芋湯圓', 125, '', 'shaved-ice', 'taro', true),
  ('m4', '3Q芋泥蔗片冰', '芋泥漿、白芋湯圓、粉圓、芋泥球', 120, '/images/menu/3Q芋泥蔗片冰.jpg', 'shaved-ice', 'taro', true),
  ('m5', '芋泥白玉花生蔗片冰', '芋泥漿、白芋湯圓、花生', 100, '', 'shaved-ice', 'taro', true),
  
  -- 蔗片冰區 — 經典組合系列 (7個)
  ('m6', '銀耳嫩仙草蔗片冰', '嫩仙草、紅棗冰糖銀耳、芋圓、白芋湯圓', 120, '', 'shaved-ice', 'classic', true),
  ('m7', '嫩仙草鮮奶蔗片冰', '嫩仙草、芋圓、小薏仁、鮮奶', 90, '/images/menu/嫩仙草鮮奶蔗片冰.jpg', 'shaved-ice', 'classic', true),
  ('m8', '芋圓嫩仙草蔗片冰沙', '嫩仙草、芋圓、小薏仁、炒糖糖水', 90, '', 'shaved-ice', 'classic', true),
  ('m9', '芋圓豆花蔗片冰沙', '豆花、芋圓、綠豆、炒糖糖水', 90, '', 'shaved-ice', 'classic', true),
  ('m10', '3Q蔗片冰', '芋圓、白芋湯圓、粉圓', 90, '/images/menu/3Q蔗片冰.jpg', 'shaved-ice', 'classic', true),
  ('m11', '芋圓蔗片冰', '芋圓、粉圓、綠豆、花生', 90, '', 'shaved-ice', 'classic', true),
  ('m12', '白玉蔗片冰', '白芋湯圓、花生、紅豆、小薏仁', 90, '', 'shaved-ice', 'classic', true),
  
  -- 蔗片冰區 — 就愛芝麻系列 (3個)
  ('m13', '芝麻冰淇淋蔗片冰', '芝麻冰淇淋、芋圓、白芋湯圓、紅豆、小薏仁、芝麻醬（限內用）', 160, '', 'shaved-ice', 'sesame', true),
  ('m14', '3Q芝麻蔗片冰', '芋圓、白芋湯圓、粉圓、芝麻醬', 130, '/images/menu/3Q芝麻蔗片冰.jpg', 'shaved-ice', 'sesame', true),
  ('m15', '芝麻就醬吃蔗片冰', '白芋湯圓、花生、芝麻醬', 110, '/images/menu/芝麻花生蔗片冰.jpg', 'shaved-ice', 'sesame', true),
  
  -- 蔗片冰區 — 就愛鳳梨系列 (5個)
  ('m16', '鳳梨粉圓蔗片冰', '鳳梨醬、粉圓', 95, '', 'shaved-ice', 'pineapple', true),
  ('m17', '鳳梨芋圓薏仁蔗片冰', '鳳梨醬、芋圓、小薏仁', 110, '', 'shaved-ice', 'pineapple', true),
  ('m18', '鳳梨嫩仙草蔗片冰', '鳳梨醬、嫩仙草', 115, '', 'shaved-ice', 'pineapple', true),
  ('m19', '3Q鳳梨蔗片冰', '鳳梨醬、芋圓、白芋湯圓、粉圓', 125, '', 'shaved-ice', 'pineapple', true),
  ('m20', '鳳梨銀耳蔗片冰', '鳳梨、紅棗冰糖銀耳、白芋湯圓', 135, '', 'shaved-ice', 'pineapple', true),
  
  -- 甜湯區 — 手沖豆花系列 (7個)
  ('m21', '花生豆花', '豆花、花生', 55, '', 'sweet-soup', 'handmade-tofu', true),
  ('m22', '粉圓豆花', '豆花、粉圓', 55, '', 'sweet-soup', 'handmade-tofu', true),
  ('m23', '芋圓綜合豆花', '豆花、芋圓、粉圓、小薏仁', 70, '/images/menu/芋圓綜合豆花.jpg', 'sweet-soup', 'handmade-tofu', true),
  ('m24', '白玉綜合豆花', '豆花、白芋湯圓、粉圓、小薏仁', 70, '', 'sweet-soup', 'handmade-tofu', true),
  ('m25', '嫩仙草芋圓豆花', '豆花、嫩仙草、芋圓', 70, '', 'sweet-soup', 'handmade-tofu', true),
  ('m26', '3Q豆花', '豆花、芋圓、白芋湯圓、粉圓', 80, '/images/menu/3Q豆花.jpg', 'sweet-soup', 'handmade-tofu', true),
  ('m27', '私藏杏仁茶豆花', '杏仁茶、芋圓、白芋湯圓、粉圓', 105, '', 'sweet-soup', 'handmade-tofu', true),
  
  -- 甜湯區 — 豆漿豆花系列 (2個)
  ('m28', '芋圓豆漿豆花', '芋圓、小薏仁、8度濃純豆漿', 75, '', 'sweet-soup', 'soymilk-tofu', true),
  ('m29', '芋泥芋圓豆漿豆花', '芋泥漿、芋圓、小薏仁、8度濃純豆漿', 90, '/images/menu/芋泥芋圓豆漿豆花.jpg', 'sweet-soup', 'soymilk-tofu', true),
  
  -- 甜湯區 — 消暑薏仁湯系列 (5個)
  ('m30', '花生紅豆薏仁湯', '花生、紅豆、薏仁湯', 65, '', 'sweet-soup', 'barley', true),
  ('m31', '花生豆花薏仁湯', '花生、豆花、薏仁湯', 70, '', 'sweet-soup', 'barley', true),
  ('m32', '芋圓豆花薏仁湯', '芋圓、豆花、薏仁湯', 75, '', 'sweet-soup', 'barley', true),
  ('m33', '芋圓綜合薏仁湯', '芋圓、紅豆、綠豆、薏仁湯', 75, '', 'sweet-soup', 'barley', true),
  ('m34', '綜合薏仁湯', '芋圓、白芋湯圓、紅豆、薏仁湯', 80, '', 'sweet-soup', 'barley', true),
  
  -- 甜湯區 — 養身銀耳系列 (4個)
  ('m35', '養身銀耳湯', '紅棗冰糖銀耳', 60, '/images/menu/養身銀耳湯.jpg', 'sweet-soup', 'snow-fungus', true),
  ('m36', '嫩仙草銀耳湯', '嫩仙草、紅棗冰糖銀耳', 75, '', 'sweet-soup', 'snow-fungus', true),
  ('m37', '芋圓銀耳湯', '芋圓、紅棗冰糖銀耳', 75, '', 'sweet-soup', 'snow-fungus', true),
  ('m38', '綜合銀耳湯', '芋圓、白芋湯圓、小薏仁、紅棗冰糖銀耳', 90, '', 'sweet-soup', 'snow-fungus', true),
  
  -- 產量限定 (4個)
  ('m39', '阿爸冷凍生芋圓', '1包300g', 135, '/images/menu/阿爸冷凍生芋圓.jpg', 'frozen', 'frozen-items', true),
  ('m40', '阿爸冷凍生白玉', '1包350g', 135, '', 'frozen', 'frozen-items', true),
  ('m41', '花生牛奶冰淇淋', '1杯380ml', 235, '', 'frozen', 'frozen-items', true),
  ('m42', '芝麻牛奶冰淇淋', '1杯380ml', 235, '', 'frozen', 'frozen-items', true),
  
  -- 就愛杏仁 (2個)
  ('m43', '厚杏仁茶 300ml', '冷', 65, '/images/menu/厚杏仁茶.jpg', 'almond-tea', 'almond-items', true),
  ('m44', '厚杏仁茶 1000ml', '冷', 180, '', 'almond-tea', 'almond-items', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  category_id = EXCLUDED.category_id,
  subcategory_id = EXCLUDED.subcategory_id,
  is_available = EXCLUDED.is_available;

-- ============================================
-- 4. 插入加購品項 (8個)
-- ============================================
INSERT INTO addons (id, name, price, is_available) VALUES
  ('a1', '手作芋圓', 20, true),
  ('a3', '白芋湯圓', 20, true),
  ('a6', '芋泥球', 30, true),
  ('a7', '花生', 15, true),
  ('a8', '粉圓', 15, true),
  ('a9', '紅豆', 15, true),
  ('a10', '綠豆', 15, true),
  ('a11', '小薏仁', 15, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available;

-- ============================================
-- 5. 插入分類配置（溫度選項、加購限制）
-- ============================================
INSERT INTO category_settings (category_id, allow_addons, temperature_options) VALUES
  ('shaved-ice', true, NULL),
  ('sweet-soup', true, '["冰", "涼", "熱"]'::jsonb),
  ('frozen', false, NULL),
  ('almond-tea', false, NULL)
ON CONFLICT (category_id) DO UPDATE SET
  allow_addons = EXCLUDED.allow_addons,
  temperature_options = EXCLUDED.temperature_options;

-- ============================================
-- 完成！所有菜單資料已插入
-- ============================================
-- 統計：
-- - 4 個主分類
-- - 13 個子分類
-- - 44 個菜單品項
-- - 8 個加購品項
-- ============================================
