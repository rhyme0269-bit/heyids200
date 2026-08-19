# 合一地政士事務所官方網站

## 運作方式

網站分成兩部分：

| | 說明 |
|---|---|
| **本機**（您的電腦） | 用 Docker 執行網站，透過後台編輯內容。內容存在 `data/` 資料夾 |
| **正式網站** | 執行 `npm run publish`，把本機內容產生成靜態網頁並發布到 GitHub Pages |

也就是「在自己電腦上編輯 → 按一次發布 → 網站更新」，不需要另外租用主機。

### 分支說明

| 分支 | 用途 |
|------|------|
| `main` | **您使用的版本**。穩定、可直接部署 |
| `dev` | 開發中的版本，請勿使用 |
| `gh-pages` | 發布產生的網頁，由 `npm run publish` 自動更新，請勿手動修改 |

---

## 更新網站內容（日常操作）

```bash
docker compose up -d          # 1. 啟動網站
                              # 2. 到 http://localhost:8081/admin 編輯內容
npm run publish               # 3. 發布，約 1～2 分鐘後線上就會更新
```

第一次發布前，請先確認 `.env` 的 `NEXT_PUBLIC_SITE_URL` 已填入正式網址。

> 若只想產生檔案、先不要發布上線：`SKIP_PUSH=1 npm run publish`

---

## 部署

### 1. 安裝必要軟體

- **Docker Desktop**：https://www.docker.com/products/docker-desktop/
- **Git**：https://git-scm.com/download/win （Mac 內建，終端機輸入 `git --version` 即可）
- **Node.js**：https://nodejs.org/ （選 LTS 版，一路下一步即可。發布網站時需要）

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

後台已編輯的資料存在 `data/` 資料夾，更新程式碼**不會覆蓋**。

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

> 本專案目前採用的是「本機編輯 + 發布靜態網站」，**不需要租用主機**，詳見上方「運作方式」。
> 以下說明的是另一種選擇：把含後台的完整網站放上主機，讓後台可以從網路直接使用。

含後台的完整網站**不是純靜態網頁**。後台編輯的所有文字與上傳的圖片，都存在 `data/` 資料夾裡的資料庫檔案。

因此若要把完整網站放上主機，該主機必須滿足兩個條件：

- 能**長時間執行一個伺服器程式**（不是每次請求才啟動）
- 有**永久保存的硬碟空間**（資料不會在重新部署後被清空）

### ⚠️ 這些平台不適用

| 平台 | 為什麼不行 |
|------|-----------|
| **Vercel、Netlify** | 這是 Next.js 最常見的部署平台，但它們的硬碟是暫時的。**後台編輯的內容和上傳的圖片會在每次重新部署後消失**。除非改寫成使用外部資料庫，否則不能用 |
| **GitHub Pages** | 只能放靜態頁面。**本專案正是用它放正式網站**，但後台是在您電腦上執行，並非放在網路上 |

> Vercel 是 Next.js 官方平台，很容易被推薦，但這個網站的後台會因此失效，請特別留意。

### 建議方案

| 方案 | 適合情況 | 費用參考 | 說明 |
|------|---------|---------|------|
| **VPS 虛擬主機 + Docker**（推薦） | 想要費用低、日後好轉移 | 約每月 200–400 元 | 國內：中華電信 HiCloud、遠振<br>國外：DigitalOcean、Linode、Vultr、Hetzner、AWS Lightsail |
| **容器平台** | 不想管伺服器維護 | 約每月 200–800 元 | Render、Railway、Fly.io。**務必選有「持久化磁碟 / Volume」的方案**，否則資料會遺失 |
| 事務所自己的電腦 | 不建議 | — | 需要固定 IP、24 小時開機。停電、當機或網路中斷，網站就會離線 |

> AWS EC2、Google Compute Engine、Azure VM 這類大型雲端服務技術上也可以，但計費方式複雜、管理介面繁瑣，對這種規模的網站是過度配置，不建議。若想用 AWS，選 Lightsail 即可，它就是計價單純的 VPS。

**建議規格**：1～2 GB 記憶體、20 GB 硬碟即可，這個網站很輕量。

伺服器作業系統選 Ubuntu 即可，安裝 Docker 後，部署步驟與前面「部署」章節完全相同。

### 免費方案可以用嗎

各平台都有免費額度，但大多不適合這個網站：

| 平台 | 免費內容 | 問題 |
|------|---------|------|
| **Render 免費方案** | 免費主機 | **免費方案不含持久化磁碟**，資料會消失。與 Vercel 是同一種失敗方式 |
| **Oracle Cloud** | Always Free，額度最大 | 熱門區域常配不到機器；閒置帳號有被回收的案例，屆時網站與資料一併消失 |
| **Google Cloud** | 一台 e2-micro 永久免費 | 永久免費機型只在美國區，台灣連線延遲明顯 |
| **AWS、DigitalOcean** | 新戶抵用金（約 2–3 個月） | 期限到即開始計費 |

> 免費方案條款變動頻繁，實際內容請以各平台官網為準。

**比較務實的省錢方式**：用新戶抵用金（DigitalOcean 約 60 天、Google Cloud 約 90 天）先跑幾個月，觀察實際使用量後再決定長期方案，並在到期前完成處理。

### 另一種選擇：靜態網站（完全免費）

**這就是本專案目前採用的方式。** 其限制如下：

| | 狀態 |
|---|------|
| 頁面內容與版面 | ✅ 正常 |
| 小工具試算 | ✅ 正常（公式已內嵌於頁面，計算在瀏覽器端執行） |
| 聯絡表單 | ✅ 改用 Google 表單嵌入即可（`contact_form` 區塊填入 `googleFormUrl`） |
| **後台管理** | ❌ **完全無法使用**。任何文字或圖片異動都需要重新產生並部署網站 |
| 後台上傳的圖片 | ❌ 走 `/api/images/`，靜態站無此路徑；需改放進 `public/` |

這正是本專案目前採用的方式，詳見上方「更新網站內容」。`npm run publish` 會讀取本機 `data/oneness.db`（您在後台編輯的實際內容），把後台上傳的圖片一併從資料庫匯出成檔案並改寫網址，因此圖片在靜態站也能正常顯示。

> **資料備份由您自行負責。** 網站所有內容只存在本機的 `data/` 資料夾，電腦損壞即無法復原，請定期複製到雲端硬碟或隨身碟（發布指令每次執行後都會提醒）。該資料夾含後台密碼，**請勿放入公開的 repo 或網路空間**。

若日後改為需要線上後台（例如多人同時編輯、或希望手機上也能改），再改用上方的 VPS 方案即可，程式不需改寫。

---

## 使用自己的網域

設定方式依部署方式而不同，請看對應的段落。

### 方式 A：GitHub Pages（本專案目前採用）

假設您租的網域是 `example.com.tw`。

**步驟 1：修改 `.env`**

```env
NEXT_PUBLIC_SITE_URL=https://example.com.tw
```

**步驟 2：在網域商後台設定 DNS**

登入網域商（Gandi、GoDaddy、PChome 網路家庭、中華電信等）的管理介面，新增以下記錄：

| 類型 | 名稱 | 值 |
|------|------|-----|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `rhyme0269-bit.github.io` |

（這四組是 GitHub Pages 的固定位址，四筆都要新增。）

**步驟 3：發布網站**

```bash
npm run publish
```

腳本會自動產生 GitHub Pages 綁定網域所需的 `CNAME` 檔。

**步驟 4：在 GitHub 開啟 HTTPS**

到 GitHub 的儲存庫頁面 → **Settings** → **Pages**：

1. 確認 **Source** 設為 `Deploy from a branch`，分支選 `gh-pages`
2. **Custom domain** 填入 `example.com.tw`，按 Save
3. 等待憑證簽發（通常幾分鐘），勾選 **Enforce HTTPS**

完成後開啟 `https://example.com.tw`，網址列會出現鎖頭圖示。

> **憑證由 GitHub 自動簽發與更新，不需要手動處理，也不會過期。**

---

### 方式 B：自架主機（VPS）

僅在改用「含後台的完整網站放上主機」時才需要。假設網域是 `example.com.tw`，請依序完成以下四步。

#### 步驟 1：把網域指向伺服器

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

#### 步驟 2：修改設定檔

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

#### 步驟 3：重新建置（重要）

```bash
docker compose up -d --build
```

> ⚠️ **一定要加 `--build`**。`NEXT_PUBLIC_SITE_URL` 是在建置網站時就寫進程式裡的，只用 `docker compose restart` 或 `up -d` 不會生效，網站的網址設定（例如給 Google 看的 sitemap）會停留在舊網址。

此時用 `http://example.com.tw` 應該已經可以看到網站（還是 http，尚未加密）。

#### 步驟 4：啟用 HTTPS 加密

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

#### 網域設定完成後

建議一併處理：

- 到 [Google Search Console](https://search.google.com/search-console) 提交網站與 `https://example.com.tw/sitemap.xml`，加快被搜尋到的速度

---

## 資料備份

網站的所有內容與圖片都存在 **`data/` 資料夾**裡。這台電腦若損壞或遺失，未備份的內容將無法復原。

**備份**：直接把整個 `data` 資料夾複製到雲端硬碟或隨身碟即可。

```bash
# Windows
xcopy /E /I data "D:\備份\heyids200-data-20260101"

# Mac / Linux
cp -r data ~/備份/heyids200-data-20260101
```

**還原**：把備份的資料夾複製回專案目錄取代 `data`，再執行 `docker compose restart`。

> - 執行 `npm run publish` 時會自動提醒您備份。
> - 此資料夾含後台密碼，**請勿放入公開的 repo 或任何公開網路空間**。
> - 建議每次做較大幅度的內容調整後備份一次。
