-- 新增 admin_users 表（多角色分權系統）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 全開放（遵循現有模式）
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to admin_users"
  ON admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- 預設老闆帳號：boss / taro2026
INSERT INTO admin_users (username, password_hash, role)
VALUES (
  'boss',
  encode(digest('taro2026', 'sha256'), 'hex'),
  'owner'
);
