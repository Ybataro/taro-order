# 菜單管理遷移到 Supabase - 部署指南

## 📋 概述

此文件說明如何將菜單資料從 localStorage 遷移到 Supabase 雲端資料庫。

---

## ✅ 已完成的工作

### 1. 資料庫結構設計 ✓
- 設計了 5 個資料表：
  - `categories` - 主分類（4個）
  - `subcategories` - 子分類（13個）
  - `menu_items` - 菜單品項（44個）
  - `addons` - 加購品項（8個）
  - `category_settings` - 分類配置

### 2. 程式碼更新 ✓
- ✅ 更新 `menuStore.ts` 使用 Supabase API
- ✅ 加入即時訂閱功能 `subscribeToMenu()`
- ✅ 更新 `MenuManagePage.tsx` 支援雲端 CRUD
- ✅ 更新 `MenuPage.tsx` 從雲端載入菜單
- ✅ 建置成功，無錯誤

### 3. SQL 檔案準備 ✓
- ✅ `supabase_menu_schema.sql` - 建立資料表結構
- ✅ `supabase_menu_data.sql` - 插入初始資料

---

## 🚀 部署步驟（需手動執行）

### 步驟 1：建立資料表

1. 前往 Supabase SQL Editor：
   ```
   https://supabase.com/dashboard/project/kvabzewuvlshyzbdqddi/sql/new
   ```

2. 複製 `supabase_menu_schema.sql` 的完整內容

3. 貼上到 SQL Editor 並點擊 **"Run"** 執行

4. 確認執行成功（應該會顯示 "Success"）

### 步驟 2：插入菜單資料

1. 在同一個 SQL Editor 中，點擊 **"New Query"**

2. 複製 `supabase_menu_data.sql` 的完整內容

3. 貼上到 SQL Editor 並點擊 **"Run"** 執行

4. 確認執行成功

### 步驟 3：啟用 Realtime（即時訂閱）

1. 前往 Supabase Database > Replication：
   ```
   https://supabase.com/dashboard/project/kvabzewuvlshyzbdqddi/database/replication
   ```

2. 在 "Replication" 頁面中，啟用以下資料表的 Realtime：
   - ✓ `categories`
   - ✓ `subcategories`
   - ✓ `menu_items`
   - ✓ `addons`
   - ✓ `category_settings`

3. 每個資料表旁邊會有一個開關，點擊開啟即可

### 步驟 4：驗證資料

1. 前往 Table Editor 檢查資料：
   ```
   https://supabase.com/dashboard/project/kvabzewuvlshyzbdqddi/editor
   ```

2. 確認以下資料表有資料：
   - `categories` - 應該有 4 筆
   - `subcategories` - 應該有 13 筆
   - `menu_items` - 應該有 44 筆
   - `addons` - 應該有 8 筆
   - `category_settings` - 應該有 4 筆

### 步驟 5：部署到 Netlify

1. 執行建置（本地已完成）：
   ```bash
   npm run build
   ```

2. 上傳 `dist` 資料夾到 Netlify：
   - 前往 https://app.netlify.com/sites/roaring-bubblegum-701f02/deploys
   - 將 `dist` 資料夾拖曳上傳

3. 等待部署完成（約 20-30 秒）

### 步驟 6：測試功能

1. 開啟網站：https://roaring-bubblegum-701f02.netlify.app/

2. 測試以下功能：
   - **顧客端** - 確認菜單正常顯示
   - **後台菜單管理** - 測試新增、編輯、上下架功能
   - **即時同步** - 開啟兩個瀏覽器視窗，測試資料即時更新

---

## 📊 資料結構說明

### Categories（主分類）
```sql
id           | name       | sort_order
-------------|------------|------------
shaved-ice   | 蔗片冰區   | 1
sweet-soup   | 甜湯區     | 2
frozen       | 產量限定   | 3
almond-tea   | 就愛杏仁   | 4
```

### Menu Items（菜單品項）
- 總共 44 個品項
- 包含：蔗片冰 20 項、甜湯 18 項、冷凍品 4 項、杏仁茶 2 項
- 每項包含：名稱、描述、價格、圖片、分類、上架狀態

### Addons（加購品項）
- 總共 8 個加購選項
- 包含：芋圓、白芋湯圓、芋泥球、花生、粉圓、紅豆、綠豆、小薏仁

---

## 🔧 新功能說明

### 即時訂閱（Realtime Sync）
- 當任何裝置更新菜單時，所有開啟的頁面會自動更新
- 不需要手動重新整理頁面
- 支援新增、編輯、刪除、上下架等所有操作

### 雲端管理
- 所有菜單資料存放在 Supabase 雲端
- 多裝置可同時管理，資料不會衝突
- 資料自動備份，不會遺失

---

## ⚠️ 注意事項

### 重要提醒
1. **執行 SQL 前請先備份**（雖然是新資料表，但以防萬一）
2. **確認環境變數正確**（Netlify 上的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY）
3. **測試後再正式使用**（建議先在測試環境驗證）

### 舊資料處理
- 舊的 localStorage 菜單資料仍會保留在使用者瀏覽器中
- 新系統會優先使用 Supabase 資料
- 如需清除舊資料，可清除瀏覽器 localStorage

---

## 📝 檢查清單

在部署前，請確認：

- [ ] 已在 Supabase 執行 `supabase_menu_schema.sql`
- [ ] 已在 Supabase 執行 `supabase_menu_data.sql`
- [ ] 已啟用所有資料表的 Realtime
- [ ] 已驗證資料表中有正確的資料筆數
- [ ] 本地建置成功（`npm run build`）
- [ ] 已將 `dist` 上傳到 Netlify
- [ ] 已測試網站功能正常

---

## 🎉 完成後的優勢

✨ **即時同步** - 多裝置資料自動同步
🔒 **資料安全** - 雲端備份，不怕遺失
📱 **多裝置管理** - 手機、平板、電腦都能管理
🚀 **效能提升** - 不再受限於 localStorage 5MB 限制
📊 **未來擴充** - 可輕鬆新增統計、報表等功能

---

**最後更新：2026-02-14**
**執行人員：請在完成每個步驟後打勾確認**
