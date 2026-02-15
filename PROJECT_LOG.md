# 阿爸的芋圓點餐系統 - 開發日誌

## 📅 2026-02-14 開發記錄（第三天 - 晚上）

### 🔧 問題除錯：新訂單音效在桌位管理頁面無效

#### 問題描述
- 在訂單管理頁面：新訂單音效正常 ✅
- 在桌位管理頁面：新訂單音效無效 ❌
- Realtime 訂閱正常（INSERT 事件有接收）
- AdminLayout 的 useEffect 音效檢測沒有觸發

#### 除錯過程

**嘗試 1：將音效邏輯移至 AdminLayout**
- 目的：讓所有後台頁面都能收到音效
- 結果：❌ 仍然只有訂單管理頁面有音效

**嘗試 2：改用持久的 AudioContext**
- 問題：懷疑每次建立新 AudioContext 被瀏覽器阻擋
- 方案：使用 useRef 儲存 AudioContext，重複使用
- 結果：❌ 問題依舊

**嘗試 3：Realtime 回調改用直接狀態更新**
- 問題：舊方案用 fetchOrders() 可能導致狀態不更新
- 方案：INSERT 時直接更新 orders 陣列
- 結果：✅ INSERT 事件有收到，但後續邏輯沒執行

**嘗試 4：移除 async 回調**
- 問題：async 可能導致執行被中斷
- 方案：改用同步處理，加入 try-catch
- 結果：❌ 問題依舊

**嘗試 5：修正縮排錯誤**
- 問題：if 語句沒有正確縮排在 try 區塊內
- 方案：修正所有縮排
- 結果：❌ Console 仍然沒有顯示後續日誌

#### Console 觀察結果
```
✅ 🎉 訂單變更事件: INSERT
✅ 📊 完整 payload: {...}
❌ 📋 當前訂單數: XX  <- 這行沒出現
❌ ➕ 新訂單資料: {...}  <- 後續全部沒執行
```

#### 暫時結論
- Realtime 訂閱機制正常
- 回調函數有執行（前兩行 console.log 有顯示）
- 但 try 區塊內的程式碼沒有執行
- 可能是 JavaScript 執行環境或 Zustand 機制問題

#### Git Commits（除錯過程）
- 82a68e2 - 修正：Realtime 訂閱直接更新狀態
- b5104fc - 修正：改進音效播放機制
- ce96a1a - 改進：將新訂單音效移至 AdminLayout
- 9d7bcae - 清理：移除 OrdersPage 中重複的音效邏輯
- d248d22 - 新增：取消訂單音效提示
- 31f3264 - 除錯：加入詳細的 Realtime 事件日誌
- daa7409 - 除錯：加入 AdminLayout orders 變化監聽
- 6fb3bb8 - 修正：移除 Realtime 回調的 async
- 4619d54 - 修正：縮排錯誤

#### 決定
- 暫時擱置此問題
- 避免過多 git push 消耗 Netlify build minutes
- 下次開發時再深入研究

---

## 📅 2026-02-14 開發記錄（第三天 - 下午）

### 🎉 重大突破：完全修復 Realtime 訂閱問題

#### 問題診斷過程

**症狀：**
- Realtime 訂閱狀態顯示 `TIMED_OUT`（超時）
- WebSocket 連接失敗：`WebSocket is closed before the connection is established`
- 測試頁面可以成功訂閱，但應用程式訂閱失敗

**根本原因發現：**
1. **useEffect dependency 問題** - dependency array 包含函數引用，導致每次重新渲染時訂閱被重新建立
2. **React StrictMode 雙重渲染** - 開發模式下 StrictMode 會雙重執行 useEffect，造成訂閱衝突
3. **重複訂閱問題** - `src/lib/initSupabase.ts` 在 App 啟動時訂閱，各頁面又在 useEffect 中訂閱，造成多重訂閱

#### 修復方案

**1. 修正 useEffect dependency array**
- 將所有 Realtime 訂閱的 dependency array 改為空陣列 `[]`
- 確保訂閱只在組件掛載時建立一次
- 修改檔案：
  - `src/customer/pages/MenuPage.tsx`
  - `src/admin/pages/OrdersPage.tsx`
  - `src/admin/pages/TablesPage.tsx`
  - `src/admin/pages/MenuManagePage.tsx`

**2. 移除 React StrictMode**
- 從 `src/main.tsx` 移除 `<StrictMode>` 包裝
- 避免開發模式下的雙重渲染和訂閱

**3. 刪除重複訂閱**
- 刪除 `src/lib/initSupabase.ts` 檔案
- 移除 `main.tsx` 中的 `initSupabase()` 呼叫
- 由各頁面的 useEffect 負責管理訂閱生命週期

**4. 改進 Realtime 訂閱日誌**
- 在 `orderStore.ts` 和 `menuStore.ts` 加入詳細日誌
- 訂閱狀態變化：SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT, CLOSED
- 訂單變更事件：INSERT, UPDATE, DELETE

**5. Supabase 資料庫設定修正**
- 執行 SQL 確保所有資料表的 Replica Identity 設為 FULL
- 確認所有資料表已加入 `supabase_realtime` publication
- 確認所有資料表的 RLS 設為 DISABLED

#### 改進新訂單音效邏輯

**舊邏輯問題：**
- 只比對訂單總數量，容易誤觸發
- 初次載入時可能誤判

**新邏輯：**
- 使用 `Set` 追蹤已知訂單的 ID
- 只有新增的 `pending` 訂單才觸發音效
- 初次載入後等待 1 秒才開始監聽
- 加入詳細日誌：`🎉 偵測到新訂單: X 筆`

#### 測試結果

**✅ 本地測試（成功）：**
- Realtime 訂閱狀態: `SUBSCRIBED`
- 新訂單即時出現
- 音效正常播放

**✅ 線上測試（成功）：**
- 部署到 Netlify 後測試通過
- Realtime 訂閱狀態: `SUBSCRIBED`
- 手機掃描 QR Code 新增訂單，後台即時顯示
- 聽到「叮叮」兩聲提示音

#### 修改的檔案清單

```
✅ src/main.tsx - 移除 StrictMode 和 initSupabase
✅ src/stores/orderStore.ts - 修正訂閱邏輯和日誌
✅ src/stores/menuStore.ts - 加入訂閱狀態日誌
✅ src/admin/pages/OrdersPage.tsx - 修正 useEffect + 改進音效
✅ src/admin/pages/TablesPage.tsx - 修正 useEffect
✅ src/admin/pages/MenuManagePage.tsx - 修正 useEffect
✅ src/customer/pages/MenuPage.tsx - 修正 useEffect (2處)
❌ src/lib/initSupabase.ts - 刪除檔案
```

#### Git 提交記錄

```bash
6599a01 - 修正：改用 categories.length 判斷載入狀態
189ac96 - 修正：載入時顯示「載入中...」而非「此分類目前沒有品項」
fa2ca57 - 修正：移除未使用的 StrictMode import
464994d - 修復 Realtime 訂閱問題並改進新訂單音效
```

#### 額外修正

**菜單載入閃爍問題：**
- 問題：手機掃描 QR Code 進入點餐頁面時，會先閃過「此分類目前沒有品項」
- 原因：資料載入中時 `activeCategoryId` 為空，但頁面已渲染
- 解決：改用 `categories.length === 0` 判斷載入狀態，顯示「載入中...」
- 修改檔案：`src/customer/pages/MenuPage.tsx`

---

## 📅 2026-02-16 開發日誌

### ✅ 訂單歷史資料庫系統完成

**需求：** 交班歸零後，歷史資料能夠永久保存並可查詢

**技術實作：**
1. 建立 `order_history` 表
2. 建立 `archive_orders()` 函數
3. 修正 SQL DELETE 語法錯誤
4. 整合到營業統計頁面

**遇到的問題與解決：**
1. ❌ DELETE 語法錯誤 → ✅ 加入 `WHERE true`
2. ❌ 「今天」範圍包含歷史資料 → ✅ 加入結束時間篩選
3. ✅ 測試成功：37 筆訂單成功歸檔

### ✅ 客戶端點餐功能修正

**問題：** 訂單送出失敗，錯誤訊息 `duplicate key value violates unique constraint "orders_pkey"`

**原因分析：**
- 使用每日流水號（1, 2, 3...）生成訂單 ID
- 歷史表 `order_history` 中已有相同 ID 的訂單
- `orders` 表的 `id` 是主鍵，不能重複

**解決方案：**
- 改用時間戳 + 隨機數生成唯一 ID
- 格式：`1771173210472640`（13-16 位數字）
- 保證絕對唯一性

**測試結果：**
- ✅ 本地測試通過
- ✅ 線上部署成功

### ✅ 移除貼紙列印功能

**原因：** 不需要此功能

**移除內容：**
- `LabelPrint.tsx` 組件（262 行）
- `print.css` 樣式
- OrderCard 中的列印邏輯
- main.tsx 中的 CSS 引入

### ✅ Supabase 權限修正

**問題：** 403 permission error

**解決方案：**
- 修正 RLS 政策，明確指定 `anon` 和 `authenticated` 角色
- 確認所有表都啟用 RLS
- 測試通過

---

## 📅 2026-02-15 開發記錄（第四天）

### 🎯 主要成果

#### ✅ 出餐貼紙列印功能完成

**功能特色：**
- 4×3cm 標籤紙格式
- 使用新視窗列印，避免頁面元素干擾
- 自動從菜單取得配料資訊
- 支援多品項訂單（每個品項一張貼紙）
- 整合到「開始準備」按鈕

**貼紙內容：**
```
阿爸的芋圓 18-1-1
內用 02/15 01:46
花生冰淇淋蔗... $150
花生冰淇淋、芋圓、白芋湯圓、紅豆、小薏仁、芋泥漿（限內用）0元

電話:02-29247461
```

**技術實作：**
- 建立 `LabelPrint.tsx` 組件
- 建立 `print.css` 列印樣式
- 使用 `window.open()` 開啟新視窗
- 內聯樣式避免 CSS 衝突
- 從 menuStore 取得菜單描述作為配料

**遇到的問題與解決：**
1. ❌ 列印預覽空白 → ✅ 改用新視窗列印
2. ❌ 菜單資料未載入 → ✅ 在 AdminLayout 載入菜單
3. ❌ 使用錯誤的屬性名稱 `s.items` → ✅ 改為 `s.menuItems`
4. ❌ 配料太長超出範圍 → ✅ 限制 40 字，縮小字體到 7pt
5. ❌ 有分隔線佔用空間 → ✅ 移除分隔線，優化排版

#### ✅ 新訂單音效問題自動解決

**原因：**
- Realtime 訂閱移至 AdminLayout 全局管理後
- 所有後台頁面都能收到訂單更新
- 音效檢測邏輯正常觸發

#### ✅ 交班歸零功能改進

**改進內容：**
- 建立 `order_history` 表
- 改為歸檔而非刪除訂單
- 營業統計支援查詢歷史資料

---

## 📅 2026-02-14 開發記錄（第二天）

### 完成的功能

1. **✅ 訂單編號改為每日流水號**
   - 訂單編號從 1 開始遞增
   - 交班歸零後重新從 1 開始
   - 新增 `generateDailyOrderNumber` 函數

2. **✅ 修正菜單預設分類問題**
   - 修正頁面載入時沒有預設分類的 bug
   - 自動選中第一個分類（蔗片冰區）

3. **✅ Realtime 訂閱問題排查**
   - 關閉所有資料表的 RLS（Row Level Security）
   - 設定 replica identity 為 FULL（必要）
   - 加入詳細的除錯日誌
   - 加入 Realtime 明確配置
   - 確認 `orders` 和 `tables` 已加入 publication

4. **✅ 改善新訂單音效提醒**
   - 優化音效播放邏輯
   - 只有真正的新訂單才播放
   - 加入瀏覽器相容性（webkitAudioContext）

5. **✅ 建立專案文件**
   - `PROJECT_LOG.md` - 完整開發記錄
   - `CONTINUE_TOMORROW.md` - 明天繼續指南

---

## 📅 2026-02-14 開發記錄（第一天）

### 🎯 今日完成的功能

#### 1. 菜單管理遷移到 Supabase（優先級 2）✅

**背景：**
- 原本菜單資料存在本地 `src/data/menu.ts` 和 localStorage
- 需要遷移到 Supabase 雲端資料庫，實現多裝置同步

**建立的資料表：**
1. `categories` - 主分類（4個：蔗片冰區、甜湯區、產量限定、就愛杏仁）
2. `subcategories` - 子分類（10個）
3. `menu_items` - 菜單品項（44個）
4. `addons` - 加購品項（8個：芋圓、粉圓、花生等）
5. `category_settings` - 分類配置（溫度選項、加購設定）

**圖片設定：**
- 14 個品項有圖片路徑
- 圖片存放在 `public/images/menu/`
- 其他品項顯示預設的芒果 emoji

**程式碼更新：**
- `src/stores/menuStore.ts` - 完全改用 Supabase API
- `src/admin/pages/MenuManagePage.tsx` - 後台菜單管理
- `src/customer/pages/MenuPage.tsx` - 顧客端菜單頁面
- 啟用即時訂閱功能（Realtime）

**SQL 檔案：**
- ~~supabase_menu_schema.sql~~ - 已執行並刪除
- ~~supabase_menu_data.sql~~ - 已執行並刪除
- ~~update_menu_images.sql~~ - 已執行並刪除
- `MENU_MIGRATION_GUIDE.md` - 遷移指南（保留作為文件）

---

#### 2. 營業統計報表（優先級 1）✅

**新增頁面：**
- `src/admin/pages/AnalyticsPage.tsx` - 營業統計報表頁面

**功能：**
1. **日期範圍選擇器**
   - 今天
   - 最近 7 天
   - 最近 30 天
   - 自訂範圍

2. **統計卡片**
   - 總營收（NT$）
   - 完成訂單數
   - 平均客單價
   - 服務桌次

3. **熱門商品排行**
   - TOP 10 銷售品項
   - 顯示銷售數量和營收貢獻

4. **尖峰時段分析**
   - 前 3 名營業高峰時段
   - 顯示訂單數量

**路由更新：**
- 新增路由：`/admin/analytics`
- 更新後台導航選單，加入「營業統計」入口（📊 圖示）

---

#### 3. 訂單編號改為每日流水號 ✅

**原本：**
- 訂單編號格式：`260214084716123`（時間戳 + 隨機數）
- 很長，不好記

**改為：**
- 訂單編號：`1`, `2`, `3`, `4`...（每日流水號）
- 交班歸零後重新從 1 開始
- 簡單易記

**實作：**
- `src/stores/orderStore.ts` - 新增 `generateDailyOrderNumber()` 函數
- `src/customer/pages/CartPage.tsx` - 使用新的編號生成方式
- 加入送出中狀態，防止重複提交

---

#### 4. Bug 修正 ✅

**問題 1：菜單頁面預設分類**
- 症狀：手機掃描 QR Code 進入點餐頁面顯示「此分類目前沒有品項」
- 原因：頁面載入時 categories 還是空陣列，預設分類為空字串
- 修正：當分類從 Supabase 載入後，自動選中第一個分類（蔗片冰區）

**問題 2：圖片顯示**
- 症狀：後台有圖片，手機端沒有圖片
- 原因：Netlify 線上版本還是舊版本（使用本地 menu.ts）
- 修正：將程式碼推送到 GitHub，Netlify 自動部署

---

### 📊 系統架構

```
前端（Netlify）
    ↓
Supabase 雲端資料庫
    ├─ orders（訂單）✅ 永久保存
    ├─ tables（桌位）✅ 即時同步
    ├─ menu_items（菜單）✅ 即時同步
    ├─ categories（分類）✅
    ├─ subcategories（子分類）✅
    ├─ addons（加購品項）✅
    └─ category_settings（分類設定）✅
```

---

### 🌐 網址

**顧客端：**
- 首頁：https://roaring-bubblegum-701f02.netlify.app/
- 點餐頁面：https://roaring-bubblegum-701f02.netlify.app/order?table=5

**後台管理：**
- 訂單管理：https://roaring-bubblegum-701f02.netlify.app/admin/orders
- **營業統計**：https://roaring-bubblegum-701f02.netlify.app/admin/analytics ⭐ 新功能
- 菜單管理：https://roaring-bubblegum-701f02.netlify.app/admin/menu
- 桌位管理：https://roaring-bubblegum-701f02.netlify.app/admin/tables
- QR Code 生成：https://roaring-bubblegum-701f02.netlify.app/admin/qrcode

---

### 🗂️ 工作目錄結構

**主要工作目錄：**
- `C:\Users\YEN\YEN_project\taro-order` - 有 Git，用於推送到 GitHub
- `C:\Users\YEN\YEN_project\taro-order_FINAL` - 備份用，目前 Rovo Dev 在這裡工作

**工作流程：**
1. 在 `taro-order_FINAL` 開發
2. 複製檔案到 `taro-order`
3. Git commit 並推送到 GitHub
4. Netlify 自動部署

---

### 📦 Git 提交記錄

```bash
8786e2e - 改用每日流水號訂單編號
4a16b5a - 修正菜單頁面預設分類問題
3a1c1a7 - 新增營業統計報表功能
b8df31e - 菜單遷移到 Supabase 並啟用即時訂閱功能
75e7a6f - Add deployment documentation
```

---

### 🎯 待開發功能（優先順序）

**優先級 3：訂單列印功能**
- 出單列印格式（熱感應紙）
- 廚房單 / 外場單分離
- 批次列印功能

**優先級 4：其他優化**
- 統計圖表（長條圖、折線圖、圓餅圖）
- 訂單搜尋功能
- 訂單修改/加單功能
- 營業日報表匯出
- 會員/常客管理

---

### 📝 重要提醒

1. **資料永久保存**
   - 所有訂單都永久保存在 Supabase
   - 除非手動刪除或交班歸零

2. **交班歸零**
   - 會刪除所有訂單
   - 重置所有桌位為可用
   - 訂單編號重新從 1 開始

3. **環境變數**
   - Netlify 需要設定 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
   - 已設定在 Netlify 專案中

4. **Realtime 設定**
   - Supabase 中已啟用 7 個資料表的 Realtime
   - orders, tables, menu_items, categories, subcategories, addons, category_settings

---

### 🔧 技術細節

**主要技術棧：**
- React + TypeScript + Vite
- TailwindCSS
- Zustand (狀態管理)
- Supabase (後端資料庫 + Realtime)
- React Router (路由)

**Supabase 功能使用：**
- Database (PostgreSQL)
- Realtime (即時訂閱)
- Storage (圖片儲存 - 目前未使用，圖片在 public/images/)

---

### 📞 帳號資訊

詳見 `DEPLOYMENT_INFO.md` 和 `帳號.txt`

**GitHub：**
- 帳號：antonyyen-bot
- 倉庫：https://github.com/antonyyen-bot/taro-order

**Netlify：**
- 專案：roaring-bubblegum-701f02
- 控制台：https://app.netlify.com/sites/roaring-bubblegum-701f02

**Supabase：**
- Project ID：kvabzewuvlshyzbdqddi
- URL：https://kvabzewuvlshyzbdqddi.supabase.co
- 控制台：https://supabase.com/dashboard/project/kvabzewuvlshyzbdqddi

---

## 🎉 累計成果總結

### 第三天（2026-02-14）
✅ **完全修復 Realtime 訂閱問題**（SUBSCRIBED 成功！）  
✅ 修正 useEffect dependency 導致的 WebSocket 超時問題  
✅ 移除 React StrictMode 避免雙重訂閱  
✅ 刪除重複訂閱檔案（initSupabase.ts）  
✅ 改進新訂單音效邏輯（追蹤訂單 ID）  
✅ Supabase 資料庫設定優化（Replica Identity + Publication）  
✅ 本地 + 線上測試全部通過  

### 第二天（2026-02-14）
✅ 訂單編號改為每日流水號  
✅ 修正菜單預設分類問題  
✅ 改善新訂單音效提醒  
✅ 建立專案文件（PROJECT_LOG.md + CONTINUE_TOMORROW.md）  

### 第一天（2026-02-14）
✅ 菜單管理遷移到 Supabase（5 個資料表 + 44 個品項 + 14 個圖片）  
✅ 營業統計報表（日期篩選 + 4 個統計卡片 + TOP 10 + 尖峰時段）  
✅ 訂單編號改為每日流水號  
✅ Bug 修正（菜單預設分類 + 圖片顯示）  
✅ 所有功能已部署到 Netlify  

---

## 🚀 下次繼續開發

**優先級 3：訂單列印功能**
- 出單列印格式（熱感應紙）
- 廚房單 / 外場單分離
- 批次列印功能

**優先級 4：其他優化**
- 統計圖表視覺化（長條圖、折線圖、圓餅圖）
- 訂單搜尋功能
- 訂單修改/加單功能
- 營業日報表匯出
- 會員/常客管理

---

**最後更新：2026-02-14（第三天）**
