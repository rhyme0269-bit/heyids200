# 合一地政士事務所官方網站

網站內容由您在自己的電腦上編輯，按一次發布就更新到網路上，**不需要租用主機**。

| | |
|---|---|
| 🚀 **首次安裝** | [往下看](#首次安裝) |
| ✏️ **修改網站內容** | [日常使用](#日常使用) |
| 🌐 **設定網域** | [docs/網域設定.md](docs/網域設定.md) |
| 💾 **備份資料** | [docs/資料備份.md](docs/資料備份.md) |
| ❓ **遇到問題** | [docs/疑難排解.md](docs/疑難排解.md) |

---

## 運作方式

| 階段 | 說明 |
|---|---|
| **編輯** | 在您的電腦上執行網站，透過後台修改文字與圖片。內容存在 `data/` 資料夾 |
| **發布** | 執行一個指令，把內容產生成網頁並上傳。約 1～2 分鐘後網站更新 |

後台只在您的電腦上執行，不會公開在網路上，因此不需要主機費用。

---

## 首次安裝

只需做一次。

### 1. 安裝三個免費軟體

都是一路按「下一步」即可。

| 軟體 | 下載位置 |
|---|---|
| Docker Desktop | https://www.docker.com/products/docker-desktop/ |
| Git | https://git-scm.com/download/win （Mac 內建） |
| Node.js | https://nodejs.org/ （選 **LTS** 版） |

### 2. 下載程式碼

```bash
git clone https://github.com/rhyme0269-bit/heyids200.git
cd heyids200
```

> **之後所有指令，都在這個 `heyids200` 資料夾中執行**，不需要再切換位置。

### 3. 設定後台帳號密碼

```bash
cp .env.example .env
```

用記事本打開 `.env`，**務必修改這兩行**：

```env
ADMIN_USERNAME=你的帳號
ADMIN_PASSWORD=你的密碼
```

其他設定不改也能運作。

### 4. 啟動

```bash
docker compose up -d --build
```

完成後打開瀏覽器輸入 `http://localhost:8081`，就會看到網站。

> `localhost` 指「您自己這台電腦」，只有您看得到。想改連接埠可修改 `.env` 的 `HTTP_PORT`。

---

## 日常使用

### 修改內容

1. 啟動網站

   ```bash
   docker compose up -d
   ```

2. 打開 `http://localhost:8081/admin`，用您設定的帳號密碼登入

3. 編輯後按儲存，重新整理前台即可看到結果

後台可編輯的內容：

| 分頁 | 內容 |
|---|---|
| 頁面管理 | 頁面建立、區塊編輯、導覽列排序 |
| 基本資訊 | 名稱、電話、Email、LINE、Instagram、地址、營業時間、網站配色 |
| 圖片管理 | Logo、背景圖、事務所照片、LINE QR Code |
| 小工具 | 試算器的欄位與公式 |
| 使用手冊 | 後台操作說明 |

### 發布到網路上

確認內容沒問題後，執行：

```bash
npm run publish
```

約 1～2 分鐘後，線上網站就會更新。

> - 第一次發布前，請先確認 `.env` 的 `NEXT_PUBLIC_SITE_URL` 已填入正式網址
> - 只想先產生檔案、不要上線：`SKIP_PUSH=1 npm run publish`
> - 每次發布後，畫面會提醒您備份

---

## 常用指令

| 目的 | 指令 |
|---|---|
| 啟動網站 | `docker compose up -d` |
| 停止網站 | `docker compose down` |
| 修改設定後重新啟動 | `docker compose up -d --build` |
| 發布到網路上 | `npm run publish` |
| 取得最新版本 | `git pull origin main` |

---

## 取得最新版本

當我們更新程式後：

```bash
git pull origin main
docker compose up -d --build
```

**您在後台編輯的內容不會被覆蓋** —— 內容存在 `data/` 資料夾，與程式碼分開存放。

---

## 分支說明

| 分支 | 用途 |
|---|---|
| **`main`** | **您使用的版本**，穩定可用 |
| `dev` | 我們開發中的版本，請勿使用 |
| `gh-pages` | 發布產生的網頁，由發布指令自動更新，請勿手動修改 |

平常固定使用 `main` 即可。若需要協助測試開發中的功能，請見 [Git 使用指南](GIT-GUIDE.md)。

---

## 相關文件

| 文件 | 內容 |
|---|---|
| [網域設定](docs/網域設定.md) | 把自己的網域指向網站、啟用 HTTPS |
| [資料備份](docs/資料備份.md) | 備份與還原網站內容 |
| [疑難排解](docs/疑難排解.md) | 常見錯誤與處理方式 |
| [其他部署方案](docs/其他部署方案.md) | 改用主機的比較與注意事項（一般不需要） |
| [Git 使用指南](GIT-GUIDE.md) | Git 基本操作、切換分支測試 |
