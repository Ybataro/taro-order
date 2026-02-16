# GitHub 設定指南

## 📌 倉庫資訊
- **倉庫名稱**: taro-order
- **擁有者**: antonyyen-bot
- **網址**: https://github.com/antonyyen-bot/taro-order
- **分支**: main

## 🔐 登入 GitHub

### 網頁登入
1. 訪問: https://github.com/login
2. 輸入使用者名稱: `antonyyen-bot`
3. 輸入密碼
4. 完成雙因素驗證（如果有啟用）

## 💻 Git 命令列設定

### 1. 設定使用者資訊
```bash
git config --global user.name "antonyyen-bot"
git config --global user.email "你的email@example.com"
```

### 2. 設定認證（使用 Personal Access Token）

如果你在推送時遇到密碼問題，需要使用 Personal Access Token：

#### 建立 Personal Access Token
1. 登入 GitHub
2. 訪問: https://github.com/settings/tokens
3. 點擊 "Generate new token" → "Generate new token (classic)"
4. 設定權限：
   - ✅ repo (完整控制私有倉庫)
   - ✅ workflow (更新 GitHub Actions)
5. 點擊 "Generate token"
6. **複製並保存** token（只會顯示一次！）

#### 使用 Token 推送
```bash
# 第一次推送時會要求輸入帳號密碼
# 使用者名稱: antonyyen-bot
# 密碼: 貼上你的 Personal Access Token

git push origin main
```

### 3. 設定認證快取（避免重複輸入）
```bash
# Windows 使用 Credential Manager
git config --global credential.helper manager

# 或使用快取（15分鐘）
git config --global credential.helper cache
```

## 📋 常用 Git 指令

### 檢查狀態
```bash
git status
```

### 提交變更
```bash
git add .
git commit -m "你的提交訊息"
git push origin main
```

### 拉取最新版本
```bash
git pull origin main
```

### 查看提交歷史
```bash
git log --oneline -10
```

### 查看遠端倉庫
```bash
git remote -v
```

## 🌐 GitHub 網頁功能

登入後你可以：
- 📂 **瀏覽程式碼**: 查看所有檔案和資料夾
- 📝 **查看提交記錄**: 所有的變更歷史
- 🔀 **管理分支**: 建立、合併分支
- 🐛 **Issues**: 追蹤問題和待辦事項
- 🚀 **Actions**: 查看 CI/CD 自動化流程
- ⚙️ **Settings**: 倉庫設定
  - Collaborators: 新增協作者
  - Secrets: 管理環境變數
  - Pages: GitHub Pages 設定（如果有）

## 🔗 整合 Vercel 部署

你的專案應該已經連接到 Vercel：
- Vercel 會自動從 GitHub 拉取程式碼
- 每次推送到 `main` 分支時自動部署
- 查看部署狀態: https://vercel.com/dashboard

## ⚠️ 重要提醒

1. **不要提交敏感資訊**
   - `.env` 檔案已在 `.gitignore` 中
   - 不要提交 API 金鑰、密碼等

2. **定期備份**
   - GitHub 是雲端備份
   - 本地也要保留重要檔案

3. **提交訊息要清楚**
   - 使用有意義的提交訊息
   - 例如: "修復訂單顯示問題" 而不是 "fix"

## 📞 需要幫助？

- GitHub 文件: https://docs.github.com
- Git 教學: https://git-scm.com/book/zh-tw/v2

---
**最後更新**: 2026-02-16
