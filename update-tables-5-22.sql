-- 刪除舊的桌號 (1-4)
DELETE FROM tables WHERE table_number IN (1, 2, 3, 4);

-- 新增桌號 13-22
INSERT INTO tables (table_number, status) 
VALUES 
  (13, 'available'), (14, 'available'), (15, 'available'), (16, 'available'),
  (17, 'available'), (18, 'available'), (19, 'available'), (20, 'available'),
  (21, 'available'), (22, 'available')
ON CONFLICT (table_number) DO NOTHING;

-- 確認結果（應該有 18 張桌子：5-22）
SELECT table_number, status 
FROM tables 
ORDER BY table_number;
