# GitHub Personal Access Token 建立指南

## 🔑 什麼是 Personal Access Token？

Personal Access Token (PAT) 是 GitHub 用來驗證身份的金鑰，用於：
- Git 命令列操作（push, pull 等）
- API 存取
- 取代傳統密碼（GitHub 已不接受密碼登入）

---

## 📋 建立步驟

### 步驟 1：開啟 Token 設定頁面

1. **登入 GitHub**（使用 Ybataro 帳號）

2. **訪問 Token 設定**
   - 直接訪問：https://github.com/settings/tokens
   - 或：右上角頭像 → Settings → 左側選單最下方 → Developer settings → Personal access tokens → Tokens (classic)

---

### 步驟 2：建立新 Token

1. **點擊「Generate new token」按鈕**
   - 選擇「**Generate new token (classic)**」
   - （不要選擇 fine-grained token）

2. **可能需要輸入密碼確認**
   - 輸入你的 GitHub 密碼
   - 完成雙因素驗證（如果有設定）

---

### 步驟 3：設定 Token

填寫以下資訊：

#### Note（備註）
```
taro-order 專案使用
```
或任何你想要的名稱（方便你記得這個 Token 是用來做什麼的）

#### Expiration（有效期限）
建議選擇：
- **90 days**（90天）← 推薦
- 或 **No expiration**（永不過期）← 方便但較不安全

#### Select scopes（選擇權限）

**只需要勾選一個：**

```
✅ repo
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events
```

勾選最上面的 `repo` 後，下面的子項目會自動勾選。

**其他項目都不用勾選！**

---

### 步驟 4：生成 Token

1. **捲到頁面最下方**
2. **點擊綠色按鈕「Generate token」**

---

### 步驟 5：複製並保存 Token ⚠️ 重要！

生成後會看到類似這樣的畫面：

```
Personal access tokens (classic)

Make sure to copy your personal access token now. 
You won't be able to see it again!

ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ 非常重要：**
1. **立刻複製這個 Token**（點擊旁邊的複製圖示）
2. **Token 只會顯示一次**，關閉頁面後就看不到了
3. **暫時貼到記事本保存**（之後會用到）

Token 格式：
- 開頭：`ghp_`
- 長度：40 個字元
- 範例：`ghp_1234567890abcdefghijklmnopqrstuvwxyz1234`

---

## 🔐 使用 Token

### 在 Git Push 時使用

當執行 `git push` 時，如果要求輸入帳號密碼：

```
Username for 'https://github.com': Ybataro
Password for 'https://Ybataro@github.com': [貼上你的 Token]
```

**重要**：
- Username：輸入 `Ybataro`
- Password：**不是你的 GitHub 密碼**，而是剛才複製的 Token！

### Windows 會記住 Token

第一次輸入後，Windows Credential Manager 會自動儲存，之後就不需要再輸入了。

---

## 💾 Token 安全保存

### 建議保存方式：

1. **密碼管理器**（最安全）
   - 1Password
   - LastPass
   - Bitwarden

2. **加密的筆記**
   - OneNote（設定密碼保護）
   - 加密的文字檔

3. **實體紙本**（寫下來）
   - 放在安全的地方

**⚠️ 不要：**
- ❌ 不要提交到 Git（會公開）
- ❌ 不要傳送給別人
- ❌ 不要儲存在未加密的文件中

---

## 🔄 如果 Token 遺失了

不用擔心！可以：

1. **重新生成一個新的 Token**
   - 回到 https://github.com/settings/tokens
   - 建立新的 Token
   - 舊的 Token 可以刪除

2. **更新 Windows Credential Manager**
   - 控制台 → Credential Manager
   - 找到 `git:https://github.com`
   - 刪除或更新為新的 Token

---

## ✅ 完成檢查

建立 Token 後，確認：
- ✅ Token 已複製
- ✅ Token 已保存在安全的地方
- ✅ Token 格式正確（`ghp_` 開頭，40 字元）
- ✅ 準備好在 git push 時使用

---

## 📞 接下來

建立完 Token 後：
1. 告訴我「Token 已建立」
2. 我會執行 `git push` 指令
3. 輸入帳號和 Token
4. 程式碼就會推送到 GitHub 了！

---

**祝你順利建立 Token！** 🔑
