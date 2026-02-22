-- ============================================
-- Step 1: 加翻譯欄位
-- ============================================

-- menu_items: name_en, name_ja, description_en, description_ja
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_ja TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_ja TEXT;

-- categories: name_en, name_ja
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ja TEXT;

-- subcategories: name_en, name_ja
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_ja TEXT;

-- addons: name_en, name_ja
ALTER TABLE addons ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE addons ADD COLUMN IF NOT EXISTS name_ja TEXT;

-- ============================================
-- Step 2: 預填翻譯 — Categories (4筆)
-- ============================================
UPDATE categories SET name_en = 'Shaved Ice',      name_ja = 'かき氷'           WHERE name = '蔗片冰區';
UPDATE categories SET name_en = 'Sweet Soups',      name_ja = '温かいスイーツ'   WHERE name = '甜湯區';
UPDATE categories SET name_en = 'Limited Items',    name_ja = '数量限定'         WHERE name = '產量限定';
UPDATE categories SET name_en = 'Almond Tea',       name_ja = '杏仁茶'           WHERE name = '就愛杏仁';

-- ============================================
-- Step 3: 預填翻譯 — Subcategories (10筆)
-- ============================================
UPDATE subcategories SET name_en = 'Taro Series',             name_ja = 'タロイモシリーズ'     WHERE name = '就愛芋頭系列';
UPDATE subcategories SET name_en = 'Classic Combos',          name_ja = '定番コンボ'           WHERE name = '經典組合系列';
UPDATE subcategories SET name_en = 'Sesame Series',           name_ja = 'ごまシリーズ'         WHERE name = '就愛芝麻系列';
UPDATE subcategories SET name_en = 'Pineapple Series',        name_ja = 'パイナップルシリーズ' WHERE name = '就愛鳳梨系列';
UPDATE subcategories SET name_en = 'Handmade Tofu Pudding',   name_ja = '手作り豆花'           WHERE name = '手沖豆花系列';
UPDATE subcategories SET name_en = 'Soymilk Tofu Pudding',    name_ja = '豆乳豆花'             WHERE name = '豆漿豆花系列';
UPDATE subcategories SET name_en = 'Barley Soup',             name_ja = 'ハトムギスープ'       WHERE name = '消暑薏仁湯系列';
UPDATE subcategories SET name_en = 'Snow Fungus Soup',        name_ja = '白キクラゲスープ'     WHERE name = '養身銀耳系列';
UPDATE subcategories SET name_en = 'Frozen / Ice Cream',      name_ja = '冷凍・アイスクリーム' WHERE name = '冷凍 / 冰淇淋';
UPDATE subcategories SET name_en = 'Rich Almond Tea',         name_ja = '濃厚杏仁茶'           WHERE name = '厚杏仁茶';

-- ============================================
-- Step 4: 預填翻譯 — Addons (8筆)
-- ============================================
UPDATE addons SET name_en = 'Taro Balls',        name_ja = 'タロボール'           WHERE name = '手作芋圓';
UPDATE addons SET name_en = 'Taro Mochi',        name_ja = 'タロもち'             WHERE name = '白芋湯圓';
UPDATE addons SET name_en = 'Taro Paste Ball',   name_ja = 'タロペーストボール'   WHERE name = '芋泥球';
UPDATE addons SET name_en = 'Peanuts',           name_ja = 'ピーナッツ'           WHERE name = '花生';
UPDATE addons SET name_en = 'Tapioca',           name_ja = 'タピオカ'             WHERE name = '粉圓';
UPDATE addons SET name_en = 'Red Bean',          name_ja = 'あずき'               WHERE name = '紅豆';
UPDATE addons SET name_en = 'Mung Bean',         name_ja = '緑豆'                 WHERE name = '綠豆';
UPDATE addons SET name_en = 'Barley',            name_ja = 'ハトムギ'             WHERE name = '小薏仁';

-- ============================================
-- Step 5: 預填翻譯 — Menu Items (44筆)
-- ============================================

-- 蔗片冰區 — 就愛芋頭系列
UPDATE menu_items SET
  name_en = 'Peanut Ice Cream Shaved Ice',
  name_ja = 'ピーナッツアイスかき氷',
  description_en = 'Peanut ice cream, taro balls, mochi, red bean, barley, taro paste (dine-in only)',
  description_ja = 'ピーナッツアイス、タロボール、白玉、あずき、ハトムギ、タロペースト（店内限定）'
WHERE name = '花生冰淇淋蔗片冰';

UPDATE menu_items SET
  name_en = 'Signature Taro Delight Shaved Ice',
  name_ja = '看板タロイモかき氷',
  description_en = 'Taro ball, taro paste, taro balls, mochi, tapioca, barley',
  description_ja = 'タロボール、タロペースト、白玉、タピオカ、ハトムギ'
WHERE name = '招牌芋見泥蔗片冰';

UPDATE menu_items SET
  name_en = 'Taro Paste Shaved Ice',
  name_ja = 'タロペーストかき氷',
  description_en = 'Taro paste, taro balls, mochi',
  description_ja = 'タロペースト、タロボール、白玉'
WHERE name = '芋泥相遇蔗片冰';

UPDATE menu_items SET
  name_en = '3Q Taro Paste Shaved Ice',
  name_ja = '3Qタロペーストかき氷',
  description_en = 'Taro paste, mochi, tapioca, taro paste ball',
  description_ja = 'タロペースト、白玉、タピオカ、タロペーストボール'
WHERE name = '3Q芋泥蔗片冰';

UPDATE menu_items SET
  name_en = 'Taro Mochi Peanut Shaved Ice',
  name_ja = 'タロ白玉ピーナッツかき氷',
  description_en = 'Taro paste, mochi, peanuts',
  description_ja = 'タロペースト、白玉、ピーナッツ'
WHERE name = '芋泥白玉花生蔗片冰';

-- 蔗片冰區 — 經典組合系列
UPDATE menu_items SET
  name_en = 'Snow Fungus & Grass Jelly Shaved Ice',
  name_ja = '白キクラゲ＆仙草ゼリーかき氷',
  description_en = 'Grass jelly, snow fungus with jujube, taro balls, mochi',
  description_ja = '仙草ゼリー、なつめ氷砂糖白キクラゲ、タロボール、白玉'
WHERE name = '銀耳嫩仙草蔗片冰';

UPDATE menu_items SET
  name_en = 'Grass Jelly Fresh Milk Shaved Ice',
  name_ja = '仙草ゼリーミルクかき氷',
  description_en = 'Grass jelly, taro balls, barley, fresh milk',
  description_ja = '仙草ゼリー、タロボール、ハトムギ、ミルク'
WHERE name = '嫩仙草鮮奶蔗片冰';

UPDATE menu_items SET
  name_en = 'Taro Ball & Grass Jelly Slushy',
  name_ja = 'タロボール仙草スラッシー',
  description_en = 'Grass jelly, taro balls, barley, caramel syrup',
  description_ja = '仙草ゼリー、タロボール、ハトムギ、キャラメルシロップ'
WHERE name = '芋圓嫩仙草蔗片冰沙';

UPDATE menu_items SET
  name_en = 'Taro Ball & Tofu Pudding Slushy',
  name_ja = 'タロボール豆花スラッシー',
  description_en = 'Tofu pudding, taro balls, mung bean, caramel syrup',
  description_ja = '豆花、タロボール、緑豆、キャラメルシロップ'
WHERE name = '芋圓豆花蔗片冰沙';

UPDATE menu_items SET
  name_en = '3Q Shaved Ice',
  name_ja = '3Qかき氷',
  description_en = 'Taro balls, mochi, tapioca',
  description_ja = 'タロボール、白玉、タピオカ'
WHERE name = '3Q蔗片冰';

UPDATE menu_items SET
  name_en = 'Taro Ball Shaved Ice',
  name_ja = 'タロボールかき氷',
  description_en = 'Taro balls, tapioca, mung bean, peanuts',
  description_ja = 'タロボール、タピオカ、緑豆、ピーナッツ'
WHERE name = '芋圓蔗片冰';

UPDATE menu_items SET
  name_en = 'Mochi Ball Shaved Ice',
  name_ja = '白玉かき氷',
  description_en = 'Mochi, peanuts, red bean, barley',
  description_ja = '白玉、ピーナッツ、あずき、ハトムギ'
WHERE name = '白玉蔗片冰';

-- 蔗片冰區 — 就愛芝麻系列
UPDATE menu_items SET
  name_en = 'Sesame Ice Cream Shaved Ice',
  name_ja = 'ごまアイスかき氷',
  description_en = 'Sesame ice cream, taro balls, mochi, red bean, barley, sesame paste (dine-in only)',
  description_ja = 'ごまアイス、タロボール、白玉、あずき、ハトムギ、ごまペースト（店内限定）'
WHERE name = '芝麻冰淇淋蔗片冰';

UPDATE menu_items SET
  name_en = '3Q Sesame Shaved Ice',
  name_ja = '3Qごまかき氷',
  description_en = 'Taro balls, mochi, tapioca, sesame paste',
  description_ja = 'タロボール、白玉、タピオカ、ごまペースト'
WHERE name = '3Q芝麻蔗片冰';

UPDATE menu_items SET
  name_en = 'Sesame Paste Shaved Ice',
  name_ja = 'ごまペーストかき氷',
  description_en = 'Mochi, peanuts, sesame paste',
  description_ja = '白玉、ピーナッツ、ごまペースト'
WHERE name = '芝麻就醬吃蔗片冰';

-- 蔗片冰區 — 就愛鳳梨系列
UPDATE menu_items SET
  name_en = 'Pineapple Tapioca Shaved Ice',
  name_ja = 'パイナップルタピオカかき氷',
  description_en = 'Pineapple sauce, tapioca',
  description_ja = 'パイナップルソース、タピオカ'
WHERE name = '鳳梨粉圓蔗片冰';

UPDATE menu_items SET
  name_en = 'Pineapple Taro Ball Barley Shaved Ice',
  name_ja = 'パイナップルタロハトムギかき氷',
  description_en = 'Pineapple sauce, taro balls, barley',
  description_ja = 'パイナップルソース、タロボール、ハトムギ'
WHERE name = '鳳梨芋圓薏仁蔗片冰';

UPDATE menu_items SET
  name_en = 'Pineapple Grass Jelly Shaved Ice',
  name_ja = 'パイナップル仙草ゼリーかき氷',
  description_en = 'Pineapple sauce, grass jelly',
  description_ja = 'パイナップルソース、仙草ゼリー'
WHERE name = '鳳梨嫩仙草蔗片冰';

UPDATE menu_items SET
  name_en = '3Q Pineapple Shaved Ice',
  name_ja = '3Qパイナップルかき氷',
  description_en = 'Pineapple sauce, taro balls, mochi, tapioca',
  description_ja = 'パイナップルソース、タロボール、白玉、タピオカ'
WHERE name = '3Q鳳梨蔗片冰';

UPDATE menu_items SET
  name_en = 'Pineapple Snow Fungus Shaved Ice',
  name_ja = 'パイナップル白キクラゲかき氷',
  description_en = 'Pineapple, snow fungus with jujube, mochi',
  description_ja = 'パイナップル、なつめ氷砂糖白キクラゲ、白玉'
WHERE name = '鳳梨銀耳蔗片冰';

-- 甜湯區 — 手沖豆花系列
UPDATE menu_items SET
  name_en = 'Peanut Tofu Pudding',
  name_ja = 'ピーナッツ豆花',
  description_en = 'Tofu pudding, peanuts',
  description_ja = '豆花、ピーナッツ'
WHERE name = '花生豆花';

UPDATE menu_items SET
  name_en = 'Tapioca Tofu Pudding',
  name_ja = 'タピオカ豆花',
  description_en = 'Tofu pudding, tapioca',
  description_ja = '豆花、タピオカ'
WHERE name = '粉圓豆花';

UPDATE menu_items SET
  name_en = 'Taro Ball Mixed Tofu Pudding',
  name_ja = 'タロボールミックス豆花',
  description_en = 'Tofu pudding, taro balls, tapioca, barley',
  description_ja = '豆花、タロボール、タピオカ、ハトムギ'
WHERE name = '芋圓綜合豆花';

UPDATE menu_items SET
  name_en = 'Mochi Mixed Tofu Pudding',
  name_ja = '白玉ミックス豆花',
  description_en = 'Tofu pudding, mochi, tapioca, barley',
  description_ja = '豆花、白玉、タピオカ、ハトムギ'
WHERE name = '白玉綜合豆花';

UPDATE menu_items SET
  name_en = 'Grass Jelly Taro Ball Tofu Pudding',
  name_ja = '仙草ゼリータロボール豆花',
  description_en = 'Tofu pudding, grass jelly, taro balls',
  description_ja = '豆花、仙草ゼリー、タロボール'
WHERE name = '嫩仙草芋圓豆花';

UPDATE menu_items SET
  name_en = '3Q Tofu Pudding',
  name_ja = '3Q豆花',
  description_en = 'Tofu pudding, taro balls, mochi, tapioca',
  description_ja = '豆花、タロボール、白玉、タピオカ'
WHERE name = '3Q豆花';

UPDATE menu_items SET
  name_en = 'Almond Tea Tofu Pudding',
  name_ja = '杏仁茶豆花',
  description_en = 'Almond tea, taro balls, mochi, tapioca',
  description_ja = '杏仁茶、タロボール、白玉、タピオカ'
WHERE name = '私藏杏仁茶豆花';

-- 甜湯區 — 豆漿豆花系列
UPDATE menu_items SET
  name_en = 'Taro Ball Soymilk Tofu Pudding',
  name_ja = 'タロボール豆乳豆花',
  description_en = 'Taro balls, barley, rich soymilk',
  description_ja = 'タロボール、ハトムギ、濃厚豆乳'
WHERE name = '芋圓豆漿豆花';

UPDATE menu_items SET
  name_en = 'Taro Paste & Ball Soymilk Tofu Pudding',
  name_ja = 'タロペースト＆ボール豆乳豆花',
  description_en = 'Taro paste, taro balls, barley, rich soymilk',
  description_ja = 'タロペースト、タロボール、ハトムギ、濃厚豆乳'
WHERE name = '芋泥芋圓豆漿豆花';

-- 甜湯區 — 消暑薏仁湯系列
UPDATE menu_items SET
  name_en = 'Peanut Red Bean Barley Soup',
  name_ja = 'ピーナッツあずきハトムギスープ',
  description_en = 'Peanuts, red bean, barley soup',
  description_ja = 'ピーナッツ、あずき、ハトムギスープ'
WHERE name = '花生紅豆薏仁湯';

UPDATE menu_items SET
  name_en = 'Peanut Tofu Pudding Barley Soup',
  name_ja = 'ピーナッツ豆花ハトムギスープ',
  description_en = 'Peanuts, tofu pudding, barley soup',
  description_ja = 'ピーナッツ、豆花、ハトムギスープ'
WHERE name = '花生豆花薏仁湯';

UPDATE menu_items SET
  name_en = 'Taro Ball Tofu Pudding Barley Soup',
  name_ja = 'タロボール豆花ハトムギスープ',
  description_en = 'Taro balls, tofu pudding, barley soup',
  description_ja = 'タロボール、豆花、ハトムギスープ'
WHERE name = '芋圓豆花薏仁湯';

UPDATE menu_items SET
  name_en = 'Taro Ball Mixed Barley Soup',
  name_ja = 'タロボールミックスハトムギスープ',
  description_en = 'Taro balls, red bean, mung bean, barley soup',
  description_ja = 'タロボール、あずき、緑豆、ハトムギスープ'
WHERE name = '芋圓綜合薏仁湯';

UPDATE menu_items SET
  name_en = 'Mixed Barley Soup',
  name_ja = 'ミックスハトムギスープ',
  description_en = 'Taro balls, mochi, red bean, barley soup',
  description_ja = 'タロボール、白玉、あずき、ハトムギスープ'
WHERE name = '綜合薏仁湯';

-- 甜湯區 — 養身銀耳系列
UPDATE menu_items SET
  name_en = 'Nourishing Snow Fungus Soup',
  name_ja = '薬膳白キクラゲスープ',
  description_en = 'Snow fungus with jujube & rock sugar',
  description_ja = 'なつめ氷砂糖白キクラゲ'
WHERE name = '養身銀耳湯';

UPDATE menu_items SET
  name_en = 'Grass Jelly Snow Fungus Soup',
  name_ja = '仙草ゼリー白キクラゲスープ',
  description_en = 'Grass jelly, snow fungus with jujube',
  description_ja = '仙草ゼリー、なつめ氷砂糖白キクラゲ'
WHERE name = '嫩仙草銀耳湯';

UPDATE menu_items SET
  name_en = 'Taro Ball Snow Fungus Soup',
  name_ja = 'タロボール白キクラゲスープ',
  description_en = 'Taro balls, snow fungus with jujube',
  description_ja = 'タロボール、なつめ氷砂糖白キクラゲ'
WHERE name = '芋圓銀耳湯';

UPDATE menu_items SET
  name_en = 'Mixed Snow Fungus Soup',
  name_ja = 'ミックス白キクラゲスープ',
  description_en = 'Taro balls, mochi, barley, snow fungus with jujube',
  description_ja = 'タロボール、白玉、ハトムギ、なつめ氷砂糖白キクラゲ'
WHERE name = '綜合銀耳湯';

-- 產量限定 — 冷凍 / 冰淇淋
UPDATE menu_items SET
  name_en = 'Frozen Raw Taro Balls',
  name_ja = '冷凍生タロボール',
  description_en = '1 pack 300g',
  description_ja = '1パック300g'
WHERE name = '阿爸冷凍生芋圓';

UPDATE menu_items SET
  name_en = 'Frozen Raw Mochi Balls',
  name_ja = '冷凍生白玉',
  description_en = '1 pack 350g',
  description_ja = '1パック350g'
WHERE name = '阿爸冷凍生白玉';

UPDATE menu_items SET
  name_en = 'Peanut Milk Ice Cream',
  name_ja = 'ピーナッツミルクアイスクリーム',
  description_en = '1 cup 380ml',
  description_ja = '1カップ380ml'
WHERE name = '花生牛奶冰淇淋';

UPDATE menu_items SET
  name_en = 'Sesame Milk Ice Cream',
  name_ja = 'ごまミルクアイスクリーム',
  description_en = '1 cup 380ml',
  description_ja = '1カップ380ml'
WHERE name = '芝麻牛奶冰淇淋';

-- 就愛杏仁 — 厚杏仁茶
UPDATE menu_items SET
  name_en = 'Rich Almond Tea 300ml',
  name_ja = '濃厚杏仁茶 300ml',
  description_en = 'Chilled',
  description_ja = '冷たい'
WHERE name = '厚杏仁茶 300ml';

UPDATE menu_items SET
  name_en = 'Rich Almond Tea 1000ml',
  name_ja = '濃厚杏仁茶 1000ml',
  description_en = 'Chilled',
  description_ja = '冷たい'
WHERE name = '厚杏仁茶 1000ml';
