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

打開 `http://localhost:8081` 就能看到網站。

---

## 後台管理

瀏覽器到 `http://你的網址/admin`，登入後可編輯：

| 分頁 | 內容 |
|------|------|
| 基本資訊 | 名稱、電話、Email、LINE、地址 |
| 關於我們 | 介紹、理念、資歷、經驗、專長 |
| 服務項目 | 服務名稱和說明 |
| 收費標準 | 42 項收費 + 注意事項 |
| 常見問題 | 問題和答案 |
| 服務流程 | 步驟名稱和說明 |
| 圖片管理 | Logo、首頁背景、代書照片 |

儲存後重新整理前台即可看到更新。

---

## 常用操作

| 操作 | 指令 |
|------|------|
| 啟動 | `docker compose up -d` |
| 停止 | `docker compose down` |
| 更新 | `git pull origin main && docker compose up -d --build` |
| 改 port | 編輯 `.env` 的 `HTTP_PORT` |

更新不會影響後台已修改的資料。

---

## HTTPS 與網域

正式上線時：
1. SSL 憑證放到 `nginx/ssl/`，取消 `docker-compose.yml` 和 `nginx/nginx.conf` 中的 SSL 註解
2. DNS A 記錄指向伺服器 IP
3. 更新 `.env` 的 `DOMAIN` 和 `NEXT_PUBLIC_SITE_URL`
