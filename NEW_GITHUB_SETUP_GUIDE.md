# 新 GitHub 帳號設定指南

## 📋 準備資訊

請先確認以下資訊：
- ✅ 新 GitHub 使用者名稱：`__________`（請填寫）
- ✅ 新倉庫名稱：`taro-order`（建議使用相同名稱）

---

## 🚀 完整設定流程

### 步驟 1️⃣：在 GitHub 建立新倉庫

1. **登入新的 GitHub 帳號**
   - https://github.com/login

2. **建立新倉庫**
   - 訪問：https://github.com/new
   - 或點擊右上角 `+` → `New repository`

3. **設定倉庫**
   ```
   Repository name: taro-order
   Description: 阿爸的芋圓點餐系統
   Visibility: ⭕ Public（公開）
   
   ❌ 不要勾選 "Add a README file"
   ❌ 不要選擇 ".gitignore"  
   ❌ 不要選擇 "license"
   ```

4. **點擊「Create repository」**

5. **記下倉庫 URL**
   - 格式：`https://github.com/你的使用者名稱/taro-order.git`

---

### 步驟 2️⃣：更新本地 Git 設定

在建立倉庫後，GitHub 會顯示指令。我們只需要其中幾個：

#### 方法 A：使用命令列（推薦）

```powershell
# 1. 進入專案資料夾
cd C:\Users\YEN\YEN_project\taro-order_FINAL

# 2. 查看目前的遠端設定
git remote -v

# 3. 更新遠端倉庫 URL（替換成你的新 URL）
git remote set-url origin https://github.com/你的新使用者名稱/taro-order.git

# 4. 確認更新成功
git remote -v

# 5. 推送程式碼到新倉庫
git push -u origin main
```

#### 如果推送時要求輸入帳號密碼：

```
Username: 你的新GitHub使用者名稱
Password: 你的 Personal Access Token（不是密碼！）
```

**如何建立 Personal Access Token：**
1. GitHub 右上角頭像 → Settings
2. 左側選單最下方 → Developer settings
3. Personal access tokens → Tokens (classic)
4. Generate new token (classic)
5. 勾選 `repo`（完整控制倉庫）
6. 生成並複製 token（只會顯示一次！）

---

### 步驟 3️⃣：確認推送成功

1. **在瀏覽器訪問新倉庫**
   - `https://github.com/你的使用者名稱/taro-order`

2. **應該看到：**
   - ✅ 所有原始碼檔案
   - ✅ 提交歷史記錄
   - ✅ README.md、package.json 等檔案

---

### 步驟 4️⃣：更新 Vercel 部署（選用）

如果你要繼續使用 Vercel 部署：

1. **登入 Vercel**
   - https://vercel.com

2. **Import 新倉庫**
   - Dashboard → Add New → Project
   - Import Git Repository
   - 選擇新的 GitHub 倉庫

3. **設定環境變數**
   ```
   VITE_SUPABASE_URL=你的 Supabase URL
   VITE_SUPABASE_ANON_KEY=你的 Supabase 金鑰
   ```

4. **部署**
   - 點擊 Deploy

---

## 🔧 常見問題

### Q1: 推送時出現 "Authentication failed"

**原因**：GitHub 不接受密碼，需要使用 Personal Access Token

**解決方案**：
1. 建立 Personal Access Token（步驟見上方）
2. 推送時，密碼欄位輸入 Token（不是你的 GitHub 密碼）

---

### Q2: 推送時出現 "Permission denied"

**原因**：沒有權限推送到倉庫

**解決方案**：
1. 確認倉庫是你自己的帳號建立的
2. 確認 URL 正確
3. 確認已登入正確的帳號

---

### Q3: 推送成功，但 GitHub 上看不到檔案

**原因**：可能推送到錯誤的分支

**解決方案**：
```bash
# 檢查當前分支
git branch

# 如果不是 main，切換到 main
git checkout main

# 重新推送
git push -u origin main
```

---

### Q4: 想要保留舊倉庫的連結

**解決方案**：可以同時設定兩個遠端

```bash
# 重新命名原本的 origin 為 old
git remote rename origin old

# 新增新的 origin
git remote add origin https://github.com/新使用者名稱/taro-order.git

# 推送到新倉庫
git push -u origin main

# 如果需要，也可以推送到舊倉庫
git push old main
```

---

## ✅ 完成檢查清單

- [ ] 新 GitHub 帳號已建立
- [ ] 新倉庫已建立（public, 沒有 README）
- [ ] 本地 Git 遠端 URL 已更新
- [ ] 程式碼已成功推送
- [ ] 在 GitHub 網頁上可以看到所有檔案
- [ ] 提交歷史記錄完整
- [ ] （選用）Vercel 已重新連接

---

## 📞 需要幫助？

如果遇到任何問題，告訴我：
1. 你在哪一個步驟卡住了？
2. 出現什麼錯誤訊息？
3. 你的新 GitHub 使用者名稱是什麼？

我會提供具體的解決方案！

---

**祝你設定順利！** 🎉
