-- =============================================
-- 系統設定資料表
-- 用途：儲存系統設定，例如最後交班時間
-- =============================================

-- 建立系統設定表
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入預設的交班時間設定（今天 00:00）
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('last_shift_reset_time', NOW()::DATE::TEXT)
ON CONFLICT (setting_key) 
DO NOTHING;

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_system_settings_key 
ON system_settings(setting_key);

-- 啟用 RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取設定
CREATE POLICY "允許所有人讀取系統設定" ON system_settings
  FOR SELECT
  USING (true);

-- 允許所有人更新設定（實際應用中可能需要限制權限）
CREATE POLICY "允許所有人更新系統設定" ON system_settings
  FOR UPDATE
  USING (true);

-- 允許插入新設定
CREATE POLICY "允許插入系統設定" ON system_settings
  FOR INSERT
  WITH CHECK (true);

-- 建立更新時間的觸發器
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- 查詢設定
SELECT * FROM system_settings WHERE setting_key = 'last_shift_reset_time';
