# 阿爸的芋圓點餐系統 - 部署資訊

## 🌐 正式網址
- **主網站**：https://roaring-bubblegum-701f02.netlify.app/
- **後台管理**：https://roaring-bubblegum-701f02.netlify.app/admin/orders
- **QR Code 生成**：https://roaring-bubblegum-701f02.netlify.app/admin/qrcode

## 🔑 重要帳號資訊

### GitHub
- 帳號：antonyyen-bot
- 倉庫：https://github.com/antonyyen-bot/taro-order

### Netlify
- 專案：roaring-bubblegum-701f02
- 控制台：https://app.netlify.com/sites/roaring-bubblegum-701f02

### Supabase
- Project ID：kvabzewuvlshyzbdqddi
- URL：https://kvabzewuvlshyzbdqddi.supabase.co
- 控制台：https://supabase.com/dashboard/project/kvabzewuvlshyzbdqddi

## 🔐 環境變數

### Netlify 環境變數
需要設定以下兩個環境變數：

1. `VITE_SUPABASE_URL`
   ```
   https://kvabzewuvlshyzbdqddi.supabase.co
   ```

2. `VITE_SUPABASE_ANON_KEY`
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2YWJ6ZXd1dmxzaHl6YmRxZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzYyMzMsImV4cCI6MjA4NjU1MjIzM30.Lsmk2Qc5lLJ0dpinIpDeJ-O4kTLlJB7yO2u1pq1UUzE
   ```

**⚠️ 重要：API Key 不可有空格！**

## 🗄️ 資料庫設定

### Supabase 重要設定
- RLS (Row Level Security)：已關閉（開發階段）
- 桌號範圍：5-22 桌（共 18 桌）

### 資料表
- `orders`：訂單資料
- `tables`：桌位資料

## 🚀 部署流程

### 自動部署
1. 推送程式碼到 GitHub：
   ```bash
   git add .
   git commit -m "更新訊息"
   git push
   ```

2. Netlify 會自動偵測並部署（約 20-30 秒）

### 手動部署
1. 前往 Netlify 控制台
2. Deploys → Trigger deploy → Deploy site

## 📝 本地開發

### 安裝依賴
```bash
cd taro-order
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

## 🖼️ 圖片管理

### 目前方式
圖片存放在 `public/images/menu/` 資料夾

### 新增圖片步驟
1. 將圖片複製到 `public/images/menu/`
2. Git 提交並推送
3. Netlify 自動部署
4. 在菜單管理中設定路徑：`/images/menu/檔名.jpg`

## 📞 技術支援

### 常見問題
1. **404 錯誤**：確認 `public/_redirects` 檔案存在
2. **401 錯誤**：檢查環境變數，確認 API Key 無空格
3. **訂單不同步**：檢查 Supabase RLS 設定

### 重要檔案
- `vercel.json`：Vercel 配置（目前未使用）
- `public/_redirects`：Netlify SPA 路由配置
- `.env`：本地環境變數（不會提交到 Git）

## 📅 維護記錄

- **2026-02-13**：初次部署完成
  - 部署平台：Netlify
  - 資料庫：Supabase
  - 版本管理：GitHub

## 🔄 更新網址

如果需要更新 QR Code 網址：
1. 修改 `src/admin/pages/QRCodePage.tsx`
2. 找到 `useState('網址')` 並更新
3. 推送到 GitHub
4. 重新列印 QR Code

---

**最後更新：2026-02-13**
