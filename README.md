# 合一地政士事務所官方網站

地政士事務所的官方網站，可透過後台管理介面自行編輯內容（文字、照片等），無需懂程式。

---

## 快速預覽

想先看網站長什麼樣子？直接用瀏覽器打開：

```
docs/preview.html
```

雙擊就能開啟，不需要安裝任何東西。

---

## 本次需求變更紀錄

以下是客戶提出的 10 項需求及處理結果：

| # | 需求 | 狀態 | 說明 |
|---|------|------|------|
| 1 | 一頁式與分頁式的區段順序統一 | 已完成 | 統一為：首頁 → 關於我們 → 服務項目 → 收費標準 → 小工具 → 常見問題 → 聯絡我們 |
| 2 | 服務項目「建物第一次登記」改為「房地合一稅」 | 已完成 | 標題：房地合一稅，說明：房地合一稅申辦、節稅、規劃 |
| 3 | 收費方式比照官網，列出 42 項收費標準 | 已完成 | 完整 42 項收費表格已加入「服務項目」頁面，含注意事項 |
| 4 | 資歷順序調整 | 已完成 | 依指定順序：87年國考及格 → 永慶 → 有巢氏 → 永義 → 台慶 → 台灣房屋 → 全國 → 第一建經 → 合泰建經 → 僑馥建經 → 安新建經 |
| 5 | 過去工作經驗刪除「全國不動產特約地政士」 | 已完成 | 已從過去工作經驗列表中移除 |
| 6 | 專長領域新增「房地合一稅節稅規劃」 | 已完成 | 已加入專長領域標籤列表（共 6 項） |
| 7 | 常見問題：買賣過戶時間改為 30~45 天 | 已完成 | 答案更新為：約需 30～45 天，視案件複雜程度、銀行貸款、地政機關作業時間而定。外縣市案件會看地區另有車馬費。 |
| 8 | 新增「小工具」分頁 | 已完成 | 包含 6 個試算工具：購屋總費用、土地增值稅、房地合一稅、房貸、契稅、貸款負擔能力 |
| 9 | 網頁風格改為專業可信的大地色系 | 已完成 | 色調改為 stone（暖灰棕）+ amber-800（深琥珀），整體呈現溫暖專業的大地色調 |
| 10 | Copyright | 已保留 | 頁尾顯示：© 2026 合一地政士事務所. All rights reserved. |

---

## 尚未完成的功能

以下功能框架已建立，但尚需額外設定或開發：

| 功能 | 現況 | 需要做的事 |
|------|------|------------|
| **Sanity CMS 後台** | 框架已建，Schema 尚未定義 | 需建立 Sanity 帳號、取得 Project ID、定義內容 Schema，才能透過後台編輯 |
| **聯絡表單寄信** | 表單可送出，但只記錄到 console | 需串接 Email 服務（如 Resend、SendGrid），讓表單送出後自動寄信通知 |
| **地政士照片** | 顯示佔位圖 | 需上傳實際照片到 CMS 或放入 public/ 資料夾 |
| **Google Maps 嵌入** | 使用概略座標 | 需更新為事務所的精確 Google Maps 嵌入碼 |
| **SSL / HTTPS** | 未啟用 | 正式上線需設定 SSL 憑證（見下方說明） |
| **網域設定** | 尚未設定 | 需購買網域並設定 DNS 指向 |
| **SEO 網址** | 目前為 example.com | 需在 .env 中將 NEXT_PUBLIC_SITE_URL 改為正式網域 |
| **小工具試算** | 公式已實作 | 稅率與公式為估算參考，建議由地政士確認數值是否需調整 |

---

## 部署到電腦（給非工程師看的完整步驟）

只需要在電腦上安裝 **Docker Desktop**，然後執行幾個指令就能把網站跑起來。

### 第一步：安裝 Docker Desktop

1. 前往 https://www.docker.com/products/docker-desktop/ 下載 Docker Desktop
2. Windows 使用者：安裝完成後可能需要重新開機
3. 確認安裝成功：打開「命令提示字元」或「終端機」，輸入：

```bash
docker --version
```

看到版本號就代表成功。

### 第二步：下載網站程式碼

```bash
git clone https://github.com/Pin-Ying/heyids200.git
cd heyids200
```

### 第三步：設定環境變數

在專案資料夾中找到 `.env` 檔案（如果沒有，請複製以下內容新建一個），用記事本打開編輯：

```env
# Docker 連接埠設定（改這裡就能換 port）
HTTP_PORT=8081
HTTPS_PORT=8443
DOMAIN=localhost

# 網站網址（正式上線時改成你的網域）
NEXT_PUBLIC_SITE_URL=http://localhost:8081

# Sanity CMS 設定（由工程師提供）
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

> 如果還沒有網域，先用 `localhost` 在本機測試即可。

### 第四步：啟動網站

```bash
docker compose up -d --build
```

- 第一次啟動會需要幾分鐘下載和建置（之後會快很多）
- 看到 `Started` 的訊息就代表啟動成功

### 第五步：打開網站

在瀏覽器輸入：

```
http://localhost:8081
```

就能看到網站了！

### 常用操作

| 操作 | 指令 |
|------|------|
| 啟動網站 | `docker compose up -d` |
| 停止網站 | `docker compose down` |
| 重新建置（改了程式碼後） | `docker compose up -d --build` |
| 查看運行狀態 | `docker compose ps` |
| 查看錯誤紀錄 | `docker compose logs` |
| 改 port | 編輯 `.env` 中的 `HTTP_PORT`，然後重新啟動 |

---

## 網站內容修改指南

### 方法一：透過 CMS 後台（推薦，適合非工程師）

> 注意：CMS 後台功能尚需完成 Sanity 設定後才能使用。設定完成後：

1. 在瀏覽器輸入 `http://你的網址/studio`
2. 登入 Sanity 帳號
3. 可編輯的內容包括：

| 內容 | 在後台的位置 | 說明 |
|------|-------------|------|
| 事務所名稱、電話、地址 | Site Settings | 全站共用的基本資訊 |
| 首頁標題和文字 | Hero | 首頁最上方的大標題和副標題 |
| 關於我們 | About | 事務所介紹、服務理念、資歷、專長 |
| 服務項目 | Services | 各項服務的名稱和說明文字 |
| 服務流程 | Service Flow | 五個步驟的名稱和說明 |
| 常見問題 | FAQ | 問題和答案，可新增、刪除、排序 |
| 照片 / Logo | 各區塊的圖片欄位 | 直接上傳即可，建議寬度 800px 以上 |

修改後儲存，網站會自動更新。

### 方法二：直接改程式碼（適合工程師或想快速修改）

所有預設內容集中在一個檔案：

```
src/lib/default-data.ts
```

打開這個檔案就能修改：

| 要改什麼 | 找哪個變數 |
|----------|-----------|
| 事務所基本資訊 | `defaultSiteSettings` |
| 關於我們（介紹、理念、資歷、專長） | `defaultAbout` |
| 服務項目（9 項） | `defaultServices` |
| 服務流程（5 步驟） | `defaultServiceFlow` |
| 常見問題（7 題） | `defaultFaqs` |
| 收費標準（42 項） | `defaultFeeSchedule` |
| 收費注意事項 | `defaultFeeNotes` |

改完後執行 `docker compose up -d --build` 重新建置即可看到更新。

### 方法三：更新靜態預覽檔

如果改了程式碼內容，想同步更新 `docs/preview.html` 預覽檔：

```bash
node scripts/generate-preview.js
```

這會自動產生最新的靜態預覽 HTML，可直接用瀏覽器打開查看。

---

## 設定 HTTPS（SSL 憑證）

正式上線建議啟用 HTTPS：

### 1. 取得 SSL 憑證

向網域商或 Let's Encrypt 取得：
- `fullchain.pem`（憑證）
- `privkey.pem`（私鑰）

### 2. 放置憑證

```
nginx/
├── nginx.conf
└── ssl/
    ├── fullchain.pem
    └── privkey.pem
```

### 3. 修改設定

打開 `docker-compose.yml`，把這行前面的 `#` 刪掉：

```yaml
      - ./nginx/ssl:/etc/nginx/ssl:ro
```

打開 `nginx/nginx.conf`，把 SSL 相關行前面的 `#` 刪掉：

```
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

### 4. 重新啟動

```bash
docker compose up -d --build
```

---

## 設定網域

在網域商後台新增 DNS 記錄：

| 類型 | 名稱 | 值 |
|------|------|-----|
| A | @ | 你的伺服器公開 IP |

設定完成後通常需等 10 分鐘到 24 小時 DNS 生效。

記得同步更新 `.env` 中的 `DOMAIN` 和 `NEXT_PUBLIC_SITE_URL`。

---

## 網站頁面一覽

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | 首頁 | Hero + 關於簡介 + 服務快覽 + CTA |
| `/about` | 關於我們 | 事務所介紹、資歷（11 項）、工作經驗（8 項）、專長領域（6 項） |
| `/services` | 服務項目 | 9 項服務 + 42 項收費標準表 + 服務流程 |
| `/tools` | 小工具 | 6 個不動產試算工具 |
| `/faq` | 常見問題 | 7 題 FAQ（手風琴展開收合） |
| `/contact` | 聯絡我們 | 諮詢表單 + 聯絡資訊 + Google Maps |

---

## 技術資訊（給工程師看的）

### 技術棧

- **Next.js 16** (App Router, TypeScript, SSG + standalone output)
- **Tailwind CSS 4** (大地色系：stone + amber)
- **Sanity CMS** (內容管理，嵌入式 Studio)
- **React Hook Form + Zod** (表單處理與驗證)
- **Docker** (multi-stage build) + **Nginx** (reverse proxy)

### 開發模式

```bash
npm install
npm run dev
```

開啟 http://localhost:3000 預覽。

### 專案結構

```
src/
├── app/                  # 頁面路由
│   ├── about/            # 關於我們
│   ├── services/         # 服務項目 + 收費標準
│   ├── tools/            # 小工具（6 個試算器）
│   ├── faq/              # 常見問題
│   ├── contact/          # 聯絡我們
│   └── api/contact/      # 表單 API（POST）
├── components/
│   ├── common/           # ContactForm, FaqAccordion, StructuredData
│   ├── layout/           # Header, Footer
│   └── sections/         # HeroSection, ServicesPreview, AboutPreview, CtaSection
├── lib/
│   ├── default-data.ts   # 所有預設內容資料（修改內容從這裡改）
│   └── structured-data.ts # SEO 結構化資料
└── sanity/               # Sanity CMS 設定（env, schemas）

docs/                     # 靜態預覽 HTML
scripts/                  # 自動化腳本（generate-preview.js）
nginx/                    # Nginx 反向代理設定
```

### 未來擴充

- Email 服務串接（Resend / SendGrid）
- Sanity CMS Schema 定義 + Studio 完整啟用
- 部落格 / 知識專欄
- 線上預約系統
- 會員系統
