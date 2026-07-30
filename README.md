# 合一地政士事務所官方網站

## 快速預覽

**https://rhyme0269-bit.github.io/heyids200**

每次更新程式碼會自動同步。預覽版為靜態頁面，後台及表單功能需正式部署才能使用。

---

## 部署

### 1. 安裝必要軟體

- **Docker Desktop**：https://www.docker.com/products/docker-desktop/
- **Git**：https://git-scm.com/download/win （Mac 內建，終端機輸入 `git --version` 即可）

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

> `localhost` 就是「你自己這台電腦」，只有你能看到。`:8081` 是連接埠，可在 `.env` 的 `HTTP_PORT` 修改。正式上線需部署到伺服器並綁定網域。

---

## 後台管理

瀏覽器到 `http://localhost:8081/admin`，登入後可編輯：

| 分頁 | 內容 |
|------|------|
| 頁面管理 | CMS 頁面建立、區塊編輯、導覽列排序 |
| 基本資訊 | 名稱、電話、Email、LINE、地址 |
| 圖片管理 | Logo、背景圖、事務所照片（含裁切、群組管理） |
| 使用手冊 | 後台操作說明 |

儲存後重新整理前台即可看到更新。

---

## 常用操作

| 操作 | 指令 |
|------|------|
| 啟動 | `docker compose up -d` |
| 停止 | `docker compose down` |
| 重新建置 | `docker compose up -d --build` |
| 改 port | 編輯 `.env` 的 `HTTP_PORT`，重新啟動 |

---

## 版本更新

```bash
cd heyids200
git pull origin main
docker compose up -d --build
```

後台已編輯的資料存在 Docker volume 裡，更新程式碼**不會覆蓋**。

---

## 測試其他分支

開發者會在不同的「分支」上開發新功能。你可以切換分支來預覽和測試開發中的功能。

詳細步驟請見 **[Git 使用指南](GIT-GUIDE.md)**，包含：

- Git 安裝與基本概念
- 如何切換分支測試新功能
- 如何更新版本和回到舊版本
- 常見問題排解

---

## HTTPS 與網域

正式上線時：
1. SSL 憑證放到 `nginx/ssl/`，取消 `docker-compose.yml` 和 `nginx/nginx.conf` 中的 SSL 註解
2. DNS A 記錄指向伺服器 IP
3. 更新 `.env` 的 `DOMAIN` 和 `NEXT_PUBLIC_SITE_URL`
