# Changelog

## [mod-003: 圖片裁切器與前台顯示修正] - 2026-07-27T00:00:00Z

### 變更類型

功能增強 + Bug 修復

### 目標功能

feature-006 (圖片管理)

### 修改描述

新增 react-easy-crop 裁切器，上傳圖片前可裁切調整。前台 Header 接上 DB logo、關於頁接上代書照片。修正圖片快取問題，改用 no-cache + ETag 確保上傳新圖後立即生效。nginx 上傳大小限制提高到 10MB。

### 修改檔案

- `src/app/admin/AdminClient.tsx`
    - 整合 react-easy-crop，背景圖 16:6 / Logo 與代書照片 3:4 比例裁切
    - 圖片預覽改用 React key 強制刷新
- `src/components/layout/Header.tsx`
    - Logo 區塊接上 /api/images/logo，失敗時 fallback 純文字
- `src/app/about/page.tsx`
    - 代書照片接上 /api/images/scrivener_photo
- `src/app/api/images/[key]/route.ts`
    - Cache-Control 改為 no-cache + ETag
- `nginx/nginx.conf`
    - 新增 client_max_body_size 10m
- `package.json`
    - 新增 react-easy-crop 依賴

### 影響評估

- 風險等級: Low
- 破壞性變更: No

---

## [mod-002: Hero 純色模式與預覽機制] - 2026-07-27T00:00:00Z

### 變更類型

功能增強

### 目標功能

feature-006 (圖片管理)

### 修改描述

新增 Hero 純色背景模式（含色票選取器），並實作 cookie-based 預覽暫存機制。管理者可在後台調整各頁面模式（預設漸層/背景圖/純色），透過 iframe 全站預覽後確認套用。

### 修改檔案

- `src/lib/db.ts`
    - 新增 HeroMode/HeroConfig 型別、hero config CRUD 函數、preview 暫存函數
- `src/app/api/admin/hero-config/route.ts`
    - 新增 Hero 設定 API（GET/PUT）
- `src/app/api/admin/hero-config/preview/route.ts`
    - 新增預覽暫存 API（PUT 暫存 / POST 套用）
- `src/components/common/PageHero.tsx`
    - 支援 default/image/color 三模式，改用 cookie 判斷預覽
- `src/components/sections/HeroSection.tsx`
    - 同上，支援 color 模式 + cookie 預覽
- `src/app/admin/AdminClient.tsx`
    - 模式選擇器、色票、預覽全部頁面按鈕、iframe modal、確認套用流程

### API 變更

- 新增 `GET/PUT /api/admin/hero-config` — Hero 設定 CRUD
- 新增 `PUT/POST /api/admin/hero-config/preview` — 預覽暫存/套用
- **向後相容**: Yes

### 影響評估

- 風險等級: Low
- 受影響功能: feature-004 (後台管理), feature-006 (圖片管理)
- 破壞性變更: No

### 測試建議

1. 後台切換模式（預設/背景圖/純色）確認卡片預覽即時更新
2. 純色模式選色後確認前台渲染正確
3. 點「預覽全部頁面」→ iframe 內切頁確認所有頁面都套用預覽設定
4. 「確認套用」後重新整理前台確認正式生效
5. 「關閉」後確認前台未受影響

---

## [mod-001: 頁面背景圖管理] - 2026-07-27T00:00:00Z

### 變更類型

功能增強

### 目標功能

feature-006 (圖片管理)

### 修改描述

擴充圖片管理系統，支援各頁面 Hero 區塊背景圖。新增 PageHero 共用元件，後台圖片管理改為分組顯示並加入位置預覽，前台根據 DB 是否有圖片自動切換背景圖/純色漸層模式。

### 修改檔案

- `src/components/common/PageHero.tsx`
    - 新增共用元件，接受 imageKey prop，自動判斷 DB 有無圖片切換顯示模式
- `src/components/sections/HeroSection.tsx`
    - 改用 DB 圖片 (hero_bg)，移除靜態 Image import
- `src/app/about/page.tsx`、`services/page.tsx`、`contact/page.tsx`、`faq/page.tsx`
    - Hero 區塊改用 PageHero 元件
- `src/app/tools/page.tsx`
    - PageHero 移至 server page 層級
- `src/app/tools/ToolsClient.tsx`
    - 移除 PageHero，只保留計算機區塊
- `src/app/api/admin/images/route.ts`
    - ALLOWED_KEYS 新增 5 個頁面背景 key
- `src/app/admin/AdminClient.tsx`
    - 圖片管理 UI 改為分組顯示，加入預覽提示
- `src/lib/db.ts`
    - 新增 hasImage() 函數

### API 變更

- `POST /api/admin/images` 新增可接受 key: about_bg, services_bg, contact_bg, faq_bg, tools_bg
- **向後相容**: Yes

### 影響評估

- 風險等級: Low
- 受影響功能: feature-004 (後台管理), feature-006 (圖片管理)
- 破壞性變更: No

### 測試建議

1. 後台圖片管理分頁確認分組顯示正確
2. 上傳各頁面背景圖後確認前台顯示效果
3. 刪除背景圖後確認前台回到純色漸層
4. 確認首頁 HeroSection 背景圖正常

---

## [2026-07-20] 移除靜態 preview.html，改用 GitHub Pages

### 變更摘要
刪除手動維護的 `docs/preview.html` 和 `scripts/generate-preview.js`，預覽改為 GitHub Pages 自動部署。

### 改動
- 刪除 `docs/preview.html`（1300+ 行靜態檔）
- 刪除 `scripts/generate-preview.js`
- 更新 README 預覽說明指向 GitHub Pages URL

---

## [2026-07-20] 安全稽核與修復

### 變更摘要
完成全面安全稽核，修復所有 Critical 漏洞。

### Critical 修復
- 移除 Admin 密碼 fallback（不設環境變數則不建帳號）
- 登入加速率限制（5 次/分鐘 per IP）
- 聯絡表單加速率限制（5 次/分鐘 per IP）
- 圖片上傳加 5MB 大小限制 + MIME 白名單
- 圖片 key 限定白名單（logo, hero_bg, scrivener_photo）
- 密碼比對改用 timing-safe comparison

### Medium 修復
- 公開圖片 API 加 MIME 白名單 + nosniff header
- 移除殘留的 Sanity CDN remote pattern

### 新增檔案
- `src/lib/rate-limit.ts`：記憶體速率限制器

---

## [2026-07-20] GitHub Pages 自動部署預覽

### 變更摘要
建立 GitHub Actions workflow，每次 push 自動部署靜態預覽到 GitHub Pages。

### 功能
- 自動從 `src/app/` 掃描頁面（不寫死）
- 自動從 GitHub context 取得 basePath 和 URL
- 支援 `CUSTOM_DOMAIN` 變數切換自訂網域
- `next.config.ts` 支援 `NEXT_PUBLIC_BASE_PATH` 環境變數
- 404.html 重導向處理 client-side navigation

### 預覽模式工具
- `src/lib/preview.ts`：偵測預覽模式
- `PreviewBanner`：頂部提示條（僅預覽版顯示）
- `PreviewGuard`：包住 server-dependent 功能，預覽版顯示 toast 提示

### 預覽網址
https://rhyme0269-bit.github.io/heyids200

---

## [2026-07-20] 前端設計感升級

### 變更摘要
參考 cx468.com.tw 設計模式，大幅提升前端視覺品質。

### 改動
- **Hero**：加入光暈裝飾球、標題裝飾線、玻璃態數據條
- **About Preview**：加入 section label 裝飾、大引號引言、琥珀左邊框特色卡片、hover 上浮效果
- **Services Preview**：卡片加序號（01-09）、hover 底部漸層線 + 上浮效果
- **CTA**：頂部琥珀漸層線、光暈背景、信任指標文字列
- **頁面過渡**：Hero→About 曲線 SVG 分隔
- **CSS**：新增 hover-lift、text-gradient、section-label 工具類
- **Header**：移除透明效果（修復非首頁白字不可見問題），一律白底深字

### 影響檔案
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/AboutPreview.tsx`
- `src/components/sections/ServicesPreview.tsx`
- `src/components/sections/CtaSection.tsx`
- `src/components/layout/Header.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`

---

## [2026-07-17] 專案管理初始化

- 建立 `.proj-manager/` 專案管理目錄
- 記錄專案結構、功能清單、依賴關係、開發上下文

---

## [2026-07-17] Sanity CMS 遷移至 SQLite + Admin 後台

### 變更摘要
將原本規劃的 Sanity CMS 方案替換為 SQLite（better-sqlite3）本地資料庫方案，並新增完整的後台管理介面。

### 新增功能
- **SQLite 資料庫層**：`src/lib/db.ts`，含完整 Schema、自動 seed、CRUD 操作
- **Admin 後台**：`/admin` 路徑，7 個管理分頁（基本資訊、關於我們、服務項目、收費標準、常見問題、服務流程、圖片管理）
- **圖片 BLOB 儲存**：Logo、首頁背景、地政士照片以 BLOB 存入 SQLite
- **RESTful API**：8 個後台 API 端點（auth, settings, about, services, fees, faqs, flow, images）
- **驗證機制**：帳號密碼登入，透過環境變數設定

### 移除
- Sanity CMS 相關程式碼與設定（sanity/ 目錄）
- Sanity 相關環境變數（NEXT_PUBLIC_SANITY_*）

### 影響範圍
- 所有前台頁面改為從 SQLite 讀取資料
- Docker volume 用於持久化 SQLite 資料庫檔案
- 部署不再需要外部 CMS 服務

---

## [2026-07-17] 初始專案建置 - 客戶 10 項需求實作

### 變更摘要
根據客戶提出的 10 項需求，完成專案重構與功能實作。

### 客戶需求處理

| # | 需求 | 狀態 |
|---|------|------|
| 1 | 一頁式與分頁式的區段順序統一 | 已完成 |
| 2 | 服務項目「建物第一次登記」改為「房地合一稅」 | 已完成 |
| 3 | 收費方式列出 42 項收費標準 | 已完成 |
| 4 | 資歷順序調整（87年國考及格起） | 已完成 |
| 5 | 刪除「全國不動產特約地政士」 | 已完成 |
| 6 | 專長領域新增「房地合一稅節稅規劃」 | 已完成 |
| 7 | 買賣過戶時間改為 30~45 天 | 已完成 |
| 8 | 新增「小工具」分頁（6 個試算器） | 已完成 |
| 9 | 網頁風格改為大地色系 | 已完成 |
| 10 | Copyright 保留 | 已完成 |

### 實作內容
- 6 個前台頁面：首頁、關於我們、服務項目、小工具、常見問題、聯絡我們
- 42 項收費標準表格
- 6 個不動產試算工具（購屋總費用、土地增值稅、房地合一稅、房貸、契稅、貸款負擔能力）
- SEO 結構化資料、sitemap、robots.txt
- Docker + Nginx 部署方案
- 靜態預覽 HTML（docs/preview.html）
