# GitHub 設定指令 - Ybataro 專用

## 📋 你的資訊
- **GitHub 使用者名稱**: `Ybataro`
- **倉庫名稱**: `taro-order`
- **倉庫 URL**: `https://github.com/Ybataro/taro-order`

---

## 步驟 1️⃣：在 GitHub 建立倉庫

我已經幫你開啟建立倉庫的頁面，請按照以下設定：

### 📝 倉庫設定（請完全照做）

```
Repository name: taro-order

Description: 阿爸的芋圓點餐系統 - 線上點餐與訂單管理系統

Visibility: 
  ⭕ Public（選這個 - 公開倉庫）
  ⚪ Private

Initialize this repository with:
  ❌ 不要勾選 "Add a README file"
  ❌ 不要選擇 "Add .gitignore"
  ❌ 不要選擇 "Choose a license"
```

### ✅ 點擊「Create repository」按鈕

建立後，**不要**執行 GitHub 顯示的指令，請回到這裡繼續！

---

## 步驟 2️⃣：更新本地 Git 設定

建立倉庫後，請執行以下指令：

### 📌 方法 A：一鍵執行（推薦）

打開 PowerShell，複製貼上以下**完整**指令：

```powershell
cd C:\Users\YEN\YEN_project\taro-order_FINAL

Write-Host "=== 開始設定 Git 倉庫 ===" -ForegroundColor Green

# 1. 檢查目前狀態
Write-Host "`n[1/5] 檢查目前的遠端設定..." -ForegroundColor Cyan
git remote -v

# 2. 更新遠端倉庫 URL
Write-Host "`n[2/5] 更新遠端倉庫為 Ybataro/taro-order..." -ForegroundColor Cyan
git remote set-url origin https://github.com/Ybataro/taro-order.git

# 3. 確認更新成功
Write-Host "`n[3/5] 確認更新成功..." -ForegroundColor Cyan
git remote -v

# 4. 檢查本地變更
Write-Host "`n[4/5] 檢查本地狀態..." -ForegroundColor Cyan
git status

# 5. 準備推送
Write-Host "`n[5/5] 準備推送到 GitHub..." -ForegroundColor Yellow
Write-Host "即將執行: git push -u origin main" -ForegroundColor Yellow
Write-Host "可能會要求輸入 GitHub 帳號和 Token" -ForegroundColor Red
Write-Host "`n按任意鍵繼續推送..." -ForegroundColor Yellow
pause

git push -u origin main

Write-Host "`n✅ 完成！請檢查 GitHub: https://github.com/Ybataro/taro-order" -ForegroundColor Green
```

---

### 📌 方法 B：逐步執行

如果你想要一步步執行，請依序執行以下指令：

```powershell
# 1. 進入專案資料夾
cd C:\Users\YEN\YEN_project\taro-order_FINAL

# 2. 查看目前的遠端設定
git remote -v

# 3. 更新遠端倉庫 URL
git remote set-url origin https://github.com/Ybataro/taro-order.git

# 4. 確認更新成功
git remote -v
# 應該顯示：
# origin  https://github.com/Ybataro/taro-order.git (fetch)
# origin  https://github.com/Ybataro/taro-order.git (push)

# 5. 推送程式碼
git push -u origin main
```

---

## 步驟 3️⃣：處理認證

### 如果推送時要求輸入帳號密碼：

```
Username for 'https://github.com': Ybataro
Password for 'https://Ybataro@github.com': [輸入你的 Personal Access Token]
```

⚠️ **重要**：密碼欄位要輸入的是 **Personal Access Token**，不是你的 GitHub 密碼！

### 🔑 如何建立 Personal Access Token

如果還沒有 Token，請按照以下步驟：

1. **登入 GitHub**（使用 Ybataro 帳號）

2. **訪問 Token 設定頁面**
   - https://github.com/settings/tokens

3. **建立新 Token**
   - 點擊「Generate new token」→「Generate new token (classic)」

4. **設定 Token**
   ```
   Note: taro-order 專案使用
   Expiration: 90 days（或選擇 No expiration）
   
   Select scopes:
   ✅ repo（勾選這個就夠了，會自動勾選所有子項目）
   ```

5. **生成 Token**
   - 點擊最下方「Generate token」
   - **立刻複製 Token**（只會顯示一次！）
   - 格式類似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

6. **使用 Token**
   - 在 `git push` 要求輸入密碼時
   - 貼上這個 Token

7. **儲存 Token**（選用）
   - Windows 會自動記住，之後不用再輸入

---

## 步驟 4️⃣：確認推送成功

### ✅ 檢查清單

1. **訪問你的 GitHub 倉庫**
   - https://github.com/Ybataro/taro-order

2. **應該看到：**
   - ✅ README.md
   - ✅ package.json
   - ✅ src/ 資料夾
   - ✅ public/ 資料夾
   - ✅ 所有 SQL 檔案
   - ✅ 3 個提交記錄（commits）

3. **點擊「commits」查看歷史**
   - ✅ 專案整理：統一工作目錄到 taro-order_FINAL
   - ✅ 清理臨時檔案：移除舊的 SQL 測試腳本和文件
   - ✅ 文件更新：記錄今日完成項目和專案備份

---

## 🎉 完成後的下一步

### 1. 更新專案文件

更新 README.md 中的 GitHub 連結：

```bash
# 編輯 README.md，將舊的 GitHub 連結改為：
https://github.com/Ybataro/taro-order
```

### 2. 設定倉庫描述和標籤

在 GitHub 倉庫頁面：
- 點擊右上角的齒輪 ⚙️ (About)
- 設定：
  ```
  Description: 阿爸的芋圓點餐系統 - 線上點餐與訂單管理系統
  Website: [你的 Vercel 部署網址]
  Topics: react, typescript, supabase, ordering-system, taiwan
  ```

### 3. （選用）重新連接 Vercel

如果你要使用 Vercel 部署：
1. 登入 Vercel
2. Import 新的 GitHub 倉庫
3. 設定環境變數

---

## ⚠️ 常見問題

### Q: 推送時出現 "Authentication failed"

**解決方案**：
1. 確認輸入的是 Personal Access Token（不是密碼）
2. 確認 Token 有 `repo` 權限
3. 確認 Token 還沒過期

### Q: 推送時出現 "Permission denied"

**解決方案**：
1. 確認倉庫是用 Ybataro 帳號建立的
2. 確認 URL 是 `https://github.com/Ybataro/taro-order.git`
3. 確認登入的是 Ybataro 帳號

### Q: 推送成功但看不到檔案

**解決方案**：
1. 重新整理 GitHub 頁面
2. 確認推送到 main 分支：`git branch`
3. 確認有提交記錄：`git log`

---

## 📞 需要協助？

如果遇到問題，告訴我：
1. 在哪個步驟卡住了？
2. 出現什麼錯誤訊息？
3. 執行 `git remote -v` 的結果是什麼？

---

**開始設定吧！** 🚀
