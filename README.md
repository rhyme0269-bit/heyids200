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

## 部署到哪裡

### 先了解這個網站的特性

這個網站**不是純靜態網頁**。後台編輯的所有文字、以及上傳的圖片，都存在伺服器上的一個資料庫檔案裡（Docker volume `heyids200_app-data`）。

因此挑選部署平台時，必須滿足兩個條件：

- 能**長時間執行一個伺服器程式**（不是每次請求才啟動）
- 有**永久保存的硬碟空間**（資料不會在重新部署後被清空）

### ⚠️ 這些平台不適用

| 平台 | 為什麼不行 |
|------|-----------|
| **Vercel、Netlify** | 這是 Next.js 最常見的部署平台，但它們的硬碟是暫時的。**後台編輯的內容和上傳的圖片會在每次重新部署後消失**。除非改寫成使用外部資料庫，否則不能用 |
| **GitHub Pages** | 只能放靜態頁面（就是目前的預覽網址），沒有後台、聯絡表單也無法運作 |

> Vercel 是 Next.js 官方平台，很容易被推薦，但這個網站的後台會因此失效，請特別留意。

### 建議方案

| 方案 | 適合情況 | 費用參考 | 說明 |
|------|---------|---------|------|
| **VPS 虛擬主機 + Docker**（推薦） | 想要費用低、完全掌控 | 約每月 200–400 元 | 國外：DigitalOcean、Linode、Vultr、Hetzner<br>國內：中華電信 HiCloud、遠振、Gcloud |
| **容器平台** | 不想管伺服器維護 | 約每月 200–800 元 | Render、Railway、Fly.io。**務必選有「持久化磁碟 / Volume」的方案**，否則資料會遺失 |
| **大型雲端主機** | 公司已有帳號 | 依用量 | AWS Lightsail／EC2、Google Compute Engine、Azure VM |
| 事務所自己的電腦 | 不建議 | — | 需要固定 IP、24 小時開機。停電、當機或網路中斷，網站就會離線 |

**建議規格**：1～2 GB 記憶體、20 GB 硬碟即可，這個網站很輕量。

伺服器作業系統選 Ubuntu 即可，安裝 Docker 後，部署步驟與前面「部署」章節完全相同。

---

## 使用自己的網域

假設您租的網域是 `example.com.tw`，請依序完成以下四步。

### 步驟 1：把網域指向伺服器

登入網域商（例如 Gandi、GoDaddy、PChome 網路家庭、中華電信）的管理後台，新增兩筆 **A 記錄**：

| 類型 | 名稱 | 值 |
|------|------|-----|
| A | `@` | 你的伺服器 IP |
| A | `www` | 你的伺服器 IP |

設定後需等待生效，通常幾分鐘、最長可能數小時。可用以下指令確認：

```bash
nslookup example.com.tw
```

顯示的 IP 與伺服器相同就代表生效了。

### 步驟 2：修改設定檔

編輯 `.env`：

```env
# 正式上線用標準連接埠
HTTP_PORT=80
HTTPS_PORT=443

# 改成你的網域
DOMAIN=example.com.tw

# 注意開頭是 https
NEXT_PUBLIC_SITE_URL=https://example.com.tw
```

### 步驟 3：重新建置（重要）

```bash
docker compose up -d --build
```

> ⚠️ **一定要加 `--build`**。`NEXT_PUBLIC_SITE_URL` 是在建置網站時就寫進程式裡的，只用 `docker compose restart` 或 `up -d` 不會生效，網站的網址設定（例如給 Google 看的 sitemap）會停留在舊網址。

此時用 `http://example.com.tw` 應該已經可以看到網站（還是 http，尚未加密）。

### 步驟 4：啟用 HTTPS 加密

先申請免費憑證（Let's Encrypt）。在伺服器上執行：

```bash
# 安裝 certbot
sudo apt install certbot

# 先暫停網站，讓出 80 埠
docker compose down

# 申請憑證（把網域換成你的）
sudo certbot certonly --standalone -d example.com.tw -d www.example.com.tw
```

憑證會產生在 `/etc/letsencrypt/live/example.com.tw/`。把兩個檔案複製到專案裡：

```bash
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/example.com.tw/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/example.com.tw/privkey.pem nginx/ssl/
```

接著取消兩個檔案裡的註解：

**`docker-compose.yml`** — 找到 nginx 的 volumes，把這行前面的 `#` 拿掉：

```yaml
      - ./nginx/ssl:/etc/nginx/ssl:ro
```

**`nginx/nginx.conf`** — 把這幾行前面的 `#` 拿掉：

```nginx
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
```

重新啟動：

```bash
docker compose up -d --build
```

完成後開啟 `https://example.com.tw`，網址列應該出現鎖頭圖示。

> **憑證每 90 天到期**。到期前執行 `sudo certbot renew`，重新複製上面兩個 `.pem` 檔，再 `docker compose restart nginx` 即可。建議設定行事曆提醒，或請工程師設定自動更新。

### 網域設定完成後

建議一併處理：

- **預覽網址**（`rhyme0269-bit.github.io/heyids200`）與正式網站內容相同，兩者會在 Google 上互相競爭排名。正式上線後建議關閉預覽，或請工程師設定為不允許搜尋引擎收錄
- 到 [Google Search Console](https://search.google.com/search-console) 提交網站與 `https://example.com.tw/sitemap.xml`，加快被搜尋到的速度

---

## 資料備份

後台編輯的所有內容與圖片都存在 Docker volume 裡。**更換伺服器或重灌前務必先備份**。

**備份**（會在目前目錄產生一個壓縮檔）：

```bash
docker run --rm \
  -v heyids200_app-data:/data \
  -v "$PWD":/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .
```

**還原**：

```bash
docker run --rm \
  -v heyids200_app-data:/data \
  -v "$PWD":/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/backup-20260101.tar.gz -C /data"
```

還原後執行 `docker compose restart` 即可。

> `docker compose down` 不會刪除資料，但 `docker compose down -v` 的 `-v` **會把資料全部刪除**，請勿使用。
