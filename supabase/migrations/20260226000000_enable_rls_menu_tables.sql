-- 啟用 RLS（IF NOT EXISTS 語意：ALTER TABLE ENABLE 可重複執行不會報錯）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- categories
DO $$ BEGIN
  CREATE POLICY "Enable all access for categories"
    ON categories FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- subcategories
DO $$ BEGIN
  CREATE POLICY "Enable all access for subcategories"
    ON subcategories FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- menu_items
DO $$ BEGIN
  CREATE POLICY "Enable all access for menu_items"
    ON menu_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- addons
DO $$ BEGIN
  CREATE POLICY "Enable all access for addons"
    ON addons FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- category_settings
DO $$ BEGIN
  CREATE POLICY "Enable all access for category_settings"
    ON category_settings FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- store_products
DO $$ BEGIN
  CREATE POLICY "Enable all access for store_products"
    ON store_products FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
