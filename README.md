# 合一地政士事務所官方網站

## 快速預覽

**https://rhyme0269-bit.github.io/heyids200**

每次更新程式碼會自動同步。預覽版為靜態頁面，後台及表單功能需正式部署才能使用。

---

## 部署

### 1. 安裝 Docker Desktop

https://www.docker.com/products/docker-desktop/

### 2. 下載程式碼

```bash
git clone https://github.com/rhyme0269-bit/heyids200.git
cd heyids200
```

### 3. 設定環境變數

```bash
cp .env.example .env
```

用記事本打開 `.env`，**務必修改後台帳號密碼**：

```env
ADMIN_USERNAME=你的帳號
ADMIN_PASSWORD=你的密碼
```

其他設定（port、網域）依需求調整，不改也能跑。

### 4. 啟動

```bash
docker compose up -d --build
```

啟動完成後，打開瀏覽器輸入 `http://localhost:8081` 就能看到網站。

---

## 什麼是 localhost？

`localhost` 就是指「你自己這台電腦」。當你在自己的電腦上啟動網站服務後，用 `http://localhost:8081` 就能在瀏覽器看到。

- **只有你自己能看到** — 其他人無法透過這個網址訪問
- **`:8081` 是 port（連接埠）** — 可以在 `.env` 的 `HTTP_PORT` 修改
- **正式上線時** — 需要把服務部署到伺服器，綁定網域名稱（如 `https://你的網域.com`），其他人才能訪問

---

## 後台管理

瀏覽器到 `http://localhost:8081/admin`，登入後可編輯：

| 分頁 | 內容 |
|------|------|
| 基本資訊 | 名稱、電話、Email、LINE、地址 |
| 關於我們 | 介紹、理念、資歷、經驗、專長 |
| 服務項目 | 服務名稱和說明 |
| 收費標準 | 42 項收費 + 注意事項 |
| 常見問題 | 問題和答案 |
| 服務流程 | 步驟名稱和說明 |
| 圖片管理 | Logo、各頁背景圖（含裁切）、事務所照片、代書照片、背景模式切換（漸層/圖片/純色）、全站預覽 |

儲存後重新整理前台即可看到更新。

---

## 常用操作

| 操作 | 指令 |
|------|------|
| 啟動 | `docker compose up -d` |
| 停止 | `docker compose down` |
| 改 port | 編輯 `.env` 的 `HTTP_PORT`，重新啟動 |

---

## 版本更新

已經部署過的服務，用以下步驟更新到最新版：

```bash
# 1. 進入專案目錄
cd heyids200

# 2. 拉取最新程式碼
git pull origin main

# 3. 重新建置並啟動（資料不受影響）
docker compose up -d --build
```

後台已編輯的資料（文字、圖片等）存在 Docker volume 裡，更新程式碼**不會覆蓋**。

如果更新後遇到問題，可以回到上一個版本：

```bash
# 查看版本紀錄
git log --oneline -10

# 回到指定版本
git checkout <commit-hash>
docker compose up -d --build
```

---

## Git 入門指南

Git 是程式碼的版本管理工具，可以把它想成「程式碼的時光機」。以下介紹最常用的操作。

### 安裝 Git

- **Windows**：下載安裝 https://git-scm.com/download/win ，安裝時全部按下一步即可
- **Mac**：打開終端機輸入 `git --version`，系統會自動提示安裝

安裝完成後，打開「命令提示字元」（Windows）或「終端機」（Mac），輸入以下指令確認：

```bash
git --version
```

看到版本號（如 `git version 2.x.x`）就代表安裝成功。

### 基本概念

| 名詞 | 說明 |
|------|------|
| **Repository（倉庫）** | 存放程式碼的地方，簡稱 repo |
| **Clone（複製）** | 把遠端的程式碼下載到你的電腦 |
| **Pull（拉取）** | 把遠端的最新更新同步到你的電腦 |
| **Commit（提交）** | 把修改記錄下來，像是存檔 |
| **Push（推送）** | 把你的修改上傳到遠端 |

### 常用指令

```bash
# 第一次下載程式碼
git clone https://github.com/rhyme0269-bit/heyids200.git

# 進入專案資料夾
cd heyids200

# 查看目前狀態（有沒有檔案被修改）
git status

# 拉取最新版本
git pull origin main

# 查看歷史紀錄
git log --oneline -10
```

### 搭配 Docker 的完整流程

第一次部署：

```bash
git clone https://github.com/rhyme0269-bit/heyids200.git
cd heyids200
cp .env.example .env        # 建立環境設定檔（記得改帳號密碼）
docker compose up -d --build # 啟動網站
```

之後更新版本：

```bash
cd heyids200
git pull origin main         # 拉取最新程式碼
docker compose up -d --build # 重新建置並啟動
```

### 常見問題

**Q: `git pull` 時出現錯誤怎麼辦？**

如果出現衝突訊息，通常是因為本地有修改過的檔案。執行以下指令放棄本地修改，重新同步：

```bash
git stash
git pull origin main
```

**Q: 怎麼確認目前是哪個版本？**

```bash
git log --oneline -5
```

最上面那一行就是目前的版本，前面的英數字串是版本編號。

**Q: 想回到之前的版本？**

```bash
git log --oneline -10          # 先查看版本紀錄
git checkout <版本編號>         # 切換到指定版本
docker compose up -d --build   # 重新啟動
```

要回到最新版本：

```bash
git checkout main
docker compose up -d --build
```

---

## HTTPS 與網域

正式上線時：
1. SSL 憑證放到 `nginx/ssl/`，取消 `docker-compose.yml` 和 `nginx/nginx.conf` 中的 SSL 註解
2. DNS A 記錄指向伺服器 IP
3. 更新 `.env` 的 `DOMAIN` 和 `NEXT_PUBLIC_SITE_URL`
