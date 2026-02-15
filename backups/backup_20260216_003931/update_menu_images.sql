-- 更新菜單品項的圖片路徑（使用 ID 匹配，更準確）

-- 蔗片冰區
UPDATE menu_items SET image = '/images/menu/3Q芋泥蔗片冰.jpg' WHERE id = 'm4';
UPDATE menu_items SET image = '/images/menu/3Q芝麻蔗片冰.jpg' WHERE id = 'm14';
UPDATE menu_items SET image = '/images/menu/3Q蔗片冰.jpg' WHERE id = 'm10';
UPDATE menu_items SET image = '/images/menu/招牌芋見泥蔗片冰.jpg' WHERE id = 'm2';
UPDATE menu_items SET image = '/images/menu/嫩仙草鮮奶蔗片冰.jpg' WHERE id = 'm18' OR name LIKE '%嫩仙草%蔗片冰';

-- 甜湯區
UPDATE menu_items SET image = '/images/menu/3Q豆花.jpg' WHERE id = 'm26';
UPDATE menu_items SET image = '/images/menu/芋圓綜合豆花.jpg' WHERE id = 'm23';
UPDATE menu_items SET image = '/images/menu/芋圓綜合豆漿豆花.jpg' WHERE name LIKE '%芋圓%豆漿豆花%' AND name NOT LIKE '%芋泥%';
UPDATE menu_items SET image = '/images/menu/芋泥芋圓豆漿豆花.jpg' WHERE id = 'm29';
UPDATE menu_items SET image = '/images/menu/養身銀耳湯.jpg' WHERE id = 'm35';

-- 產量限定
UPDATE menu_items SET image = '/images/menu/阿爸冷凍生芋圓.jpg' WHERE id = 'm39';

-- 就愛杏仁
UPDATE menu_items SET image = '/images/menu/厚杏仁茶.jpg' WHERE id = 'm43' OR id = 'm44';