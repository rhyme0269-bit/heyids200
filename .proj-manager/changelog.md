# Changelog

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
