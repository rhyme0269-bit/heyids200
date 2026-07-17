# 合一地政士事務所官方網站

地政士事務所的官方網站，可透過後台管理介面自行編輯內容（文字、照片等），無需懂程式。

---

## 快速預覽

如果只是想先看網站長什麼樣子，直接用瀏覽器打開這個檔案即可：

```
docs/preview.html
```

雙擊就能開啟，不需要安裝任何東西。

---

## 部署到電腦（給非工程師看的完整步驟）

只需要在電腦上安裝 **Docker Desktop**，然後執行幾個指令就能把網站跑起來。

### 第一步：安裝 Docker Desktop

1. 前往 https://www.docker.com/products/docker-desktop/ 下載 Docker Desktop
2. Windows 使用者：安裝完成後可能需要重新開機
3. 確認安裝成功：打開「命令提示字元」或「終端機」，輸入以下指令，看到版本號就代表成功

```bash
docker --version
```

### 第二步：下載網站程式碼

把這整個資料夾複製到電腦上（例如放在桌面），或是用 Git 下載：

```bash
git clone <這個專案的 Git 網址>
cd oneness
```

### 第三步：設定環境變數

在專案資料夾中，找到 `.env.example` 這個檔案，複製一份並改名為 `.env`：

- **Windows**：在檔案總管中複製 `.env.example`，貼上後改名為 `.env`
- **Mac / Linux**：在終端機輸入：

```bash
cp .env.example .env
```

然後用記事本（或任何文字編輯器）打開 `.env`，修改以下內容：

```
# 把 your-domain.com 改成你租的網域，例如 oneness-land.com.tw
DOMAIN=your-domain.com

# Sanity CMS 專案 ID（由工程師提供）
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id

# 把 your-domain.com 改成你的網域
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

> 如果還沒有網域，先填 `localhost` 也可以在本機測試。

### 第四步：啟動網站

打開「命令提示字元」或「終端機」，進入專案資料夾，執行：

```bash
docker compose up -d --build
```

- 第一次啟動會需要幾分鐘下載和建置（之後會快很多）
- 看到所有 `Started` 的訊息就代表啟動成功

### 第五步：打開網站

在瀏覽器輸入：

```
http://localhost
```

就能看到網站了！如果有設定網域，就輸入你的網域。

### 常用操作

| 操作 | 指令 |
|------|------|
| 啟動網站 | `docker compose up -d` |
| 停止網站 | `docker compose down` |
| 重新建置（更新程式碼後） | `docker compose up -d --build` |
| 查看運行狀態 | `docker compose ps` |
| 查看錯誤紀錄 | `docker compose logs` |

---

## 編輯網站內容（CMS 後台）

網站啟動後，在瀏覽器輸入：

```
http://你的網域/studio
```

就能進入後台管理介面，可以編輯：

- 事務所名稱、電話、地址等基本資訊
- 首頁主視覺的標題和文字
- 關於我們的介紹、資歷、服務理念
- 服務項目的名稱和說明
- 服務流程的步驟
- 常見問題
- 照片和 Logo

修改後儲存，網站會自動更新。

> 第一次使用 CMS 後台需要先到 [sanity.io](https://www.sanity.io/) 建立帳號和專案，取得 Project ID 填入 `.env` 檔案中。如果不確定怎麼做，請聯繫工程師協助。

---

## 設定 HTTPS（SSL 憑證）

如果你的網域需要 HTTPS（建議都要設定），步驟如下：

### 1. 取得 SSL 憑證

向你的網域商或 Let's Encrypt 取得 SSL 憑證檔案，通常會有兩個檔案：
- `fullchain.pem`（憑證）
- `privkey.pem`（私鑰）

### 2. 放置憑證

在專案資料夾中建立 `nginx/ssl/` 資料夾，把上面兩個檔案放進去：

```
nginx/
├── nginx.conf
└── ssl/
    ├── fullchain.pem
    └── privkey.pem
```

### 3. 修改設定

用文字編輯器打開 `docker-compose.yml`，找到這行：

```yaml
      # - ./nginx/ssl:/etc/nginx/ssl:ro
```

把前面的 `#` 和空格刪掉，變成：

```yaml
      - ./nginx/ssl:/etc/nginx/ssl:ro
```

再打開 `nginx/nginx.conf`，找到以下幾行，把每行前面的 `#` 和空格刪掉：

```
    # listen 443 ssl;
    # ssl_certificate /etc/nginx/ssl/fullchain.pem;
    # ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # if ($scheme != "https") {
    #     return 301 https://$host$request_uri;
    # }
```

### 4. 重新啟動

```bash
docker compose up -d --build
```

---

## 設定網域指向

在你的網域商後台，新增一筆 DNS 記錄：

| 類型 | 名稱 | 值 |
|------|------|-----|
| A | @ | 你的電腦的公開 IP 位址 |

> 如果不確定電腦的公開 IP，可以在瀏覽器搜尋「my ip」查看。

設定完成後，通常需要等待 10 分鐘到 24 小時 DNS 才會生效。

---

## 自訂連接埠

如果電腦的 80 或 443 port 被其他程式佔用了，可以在 `.env` 檔案加入：

```
HTTP_PORT=8080
HTTPS_PORT=8443
```

然後重新啟動，就改成用 `http://localhost:8080` 來存取。

---

## 技術資訊（給工程師看的）

### 技術棧

- **Next.js 14** (App Router, TypeScript, SSG + standalone output)
- **Tailwind CSS 3**
- **Sanity CMS** (內容管理，嵌入式 Studio)
- **React Hook Form + Zod** (表單處理與驗證)
- **Docker** (multi-stage build) + **Nginx** (reverse proxy)

### 開發模式

```bash
npm install
cp .env.local.example .env.local
# 編輯 .env.local 填入 Sanity 設定
npm run dev
```

開啟 http://localhost:3000 預覽，http://localhost:3000/studio 進入 CMS 後台。

### 專案結構

```
src/
├── app/                  # 頁面路由
│   ├── about/            # 關於我們
│   ├── services/         # 服務項目
│   ├── faq/              # 常見問題
│   ├── contact/          # 聯絡我們
│   ├── api/contact/      # 表單 API（POST）
│   └── studio/           # Sanity Studio（CMS 後台）
├── components/
│   ├── common/           # ContactForm, FaqAccordion, StructuredData
│   ├── layout/           # Header, Footer
│   └── sections/         # HeroSection, ServicesPreview, AboutPreview, CtaSection
├── lib/                  # default-data（預設內容）, structured-data（SEO Schema）
├── sanity/               # Sanity client, env, image, queries, schemas
└── types/                # TypeScript 型別定義

nginx/                    # Nginx 反向代理設定
docs/                     # 靜態預覽 HTML
```

### 未來擴充

Next.js API Routes 已保留後端彈性，可直接擴充：
- Email 服務串接（Resend / SendGrid / Nodemailer）
- 資料庫串接
- 會員認證系統
- 線上預約系統
