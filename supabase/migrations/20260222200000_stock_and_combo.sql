-- =============================================
-- 庫存管理 & 套餐組合
-- =============================================

-- Feature 1: 庫存管理欄位
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stock_reset_date TEXT DEFAULT NULL;

-- Feature 2: 套餐組合欄位
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS combo_items JSONB DEFAULT NULL;

-- RPC: 扣庫存（FOR UPDATE 避免 race condition）
CREATE OR REPLACE FUNCTION decrement_stock(p_item_id TEXT, p_qty INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  -- 鎖定該筆記錄
  SELECT current_stock INTO v_stock
    FROM menu_items
    WHERE id = p_item_id
    FOR UPDATE;

  -- 無限量品項，直接回傳 -1
  IF v_stock IS NULL THEN
    RETURN -1;
  END IF;

  -- 庫存不足
  IF v_stock < p_qty THEN
    RETURN v_stock;
  END IF;

  -- 扣庫存
  UPDATE menu_items
    SET current_stock = current_stock - p_qty
    WHERE id = p_item_id;

  -- 歸零時自動設為不可用
  IF v_stock - p_qty = 0 THEN
    UPDATE menu_items
      SET is_available = false
      WHERE id = p_item_id;
  END IF;

  RETURN v_stock - p_qty;
END;
$$;
