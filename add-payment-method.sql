-- 新增付款方式欄位到 orders 資料表
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT 
CHECK (payment_method IN ('cash', 'online'));

-- 設定預設值為 cash
ALTER TABLE orders 
ALTER COLUMN payment_method SET DEFAULT 'cash';

-- 檢查結果
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_method';
