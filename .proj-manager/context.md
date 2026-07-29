# 合一地政士事務所官方網站 - 專案上下文

## 專案概述

合一地政士事務所（Oneness Scrivener Office）的官方網站，提供事務所介紹、服務項目、收費標準、不動產試算工具、常見問題與聯絡資訊。網站具備完整的後台管理介面，非工程師可自行編輯所有內容（文字、照片）。

## 技術棧

| 層級 | 技術 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.10 |
| 語言 | TypeScript | ^5 |
| UI | React | 19.2.4 |
| 樣式 | Tailwind CSS | ^4 |
| 資料庫 | SQLite (better-sqlite3) | ^12.11.1 |
| 表單 | React Hook Form + Zod | ^7.81.0 / ^4.4.3 |
| 部署 | Docker (multi-stage) + Nginx | - |

## 設計風格

- 色調：大地色系 - stone（暖灰棕）+ amber-800（深琥珀）
- 風格：專業、可信賴、溫暖
- 響應式設計，支援桌面與行動裝置

## 目錄結構說明

```
src/
├── app/                  # Next.js App Router 頁面
│   ├── page.tsx          # 首頁（靜態）
│   ├── layout.tsx        # 全站 Layout（動態導覽列）
│   ├── [slug]/           # CMS 動態頁面路由（取代舊靜態頁面）
│   ├── tools/            # 小工具（6 個試算器，靜態）
│   ├── admin/            # 後台管理介面（頁面管理、基本資訊、圖片管理）
│   └── api/              # API 路由
│       ├── contact/      # 聯絡表單 POST
│       ├── images/[key]/ # 圖片取得（BLOB from SQLite）
│       └── admin/        # 後台 CRUD API
│           ├── cms/      # CMS API（pages, blocks, templates, nav-links, reorder, migrate）
│           └── ...       # 其他 admin API（auth, settings, hero-config, images）
├── components/
│   ├── cms/              # CMS 區塊渲染器（BlockRenderer + 16 種 renderers）
│   ├── common/           # 共用元件
│   ├── layout/           # Header（動態 nav）, Footer（動態 nav）
│   └── sections/         # 首頁區塊元件
└── lib/
    ├── db.ts             # SQLite 連線、Schema、CRUD、auto-seed
    ├── cms-db.ts         # CMS 資料層（頁面、區塊、範本、導覽）
    ├── cms-types.ts      # CMS 型別定義
    ├── default-data.ts   # 所有預設內容資料
    ├── auth.ts           # 後台驗證邏輯
    └── structured-data.ts # SEO JSON-LD
```

## 開發指引

### 資料流

1. **首次啟動**：`db.ts` 自動建立 SQLite 資料庫，從 `default-data.ts` seed 預設資料
2. **前台讀取**：各頁面 Server Component 從 SQLite 讀取資料渲染
3. **後台編輯**：AdminClient.tsx 透過 `/api/admin/*` RESTful API 進行 CRUD
4. **圖片**：以 BLOB 存入 SQLite，透過 `/api/images/[key]` 動態提供

### 新增頁面（CMS 方式）

1. 後台「頁面管理」→「建立新頁面」，選擇範本
2. 使用區塊編輯器組合頁面內容（16 種區塊類型）
3. 設定 slug、標題、是否顯示於導覽列
4. 導覽列順序可在頁面管理中用上下箭頭調整
5. 自訂導覽連結（內部/外部 URL）在「自訂導覽連結」區塊管理

### CMS 架構

- 三層模型：PageTemplate → Page → Block
- 前台 `[slug]` 動態路由渲染所有 CMS 頁面（home 和 tools 除外）
- 導覽列由 `getNavItems()` 整合頁面 nav + 自訂連結，按 navOrder 排序
- FAQ 頁面自動產生 FAQPage JSON-LD 結構化資料

### 環境變數

- `HTTP_PORT` / `HTTPS_PORT`：Docker 對外 port
- `DOMAIN`：網域名稱
- `NEXT_PUBLIC_SITE_URL`：網站完整 URL
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`：後台登入帳密

### 部署流程

```bash
docker compose up -d --build
```

網站運行於 `http://localhost:8081`（可透過 .env 調整）。

### 預覽部署

GitHub Pages 自動部署，每次 push 到 main 自動更新：
- 預覽網址：https://rhyme0269-bit.github.io/heyids200
- Workflow：`.github/workflows/deploy-preview.yml`
- 頁面自動從 `src/app/` 掃描（排除 api/ 和 admin/）
- 支援 `CUSTOM_DOMAIN` 變數切換自訂網域

### 安全機制

- 登入速率限制（5 次/分鐘 per IP）
- 聯絡表單速率限制（5 次/分鐘 per IP）
- 圖片上傳：5MB 限制 + MIME 白名單 + key 白名單
- 密碼 scrypt 雜湊 + timing-safe 比對
- httpOnly session cookie

## 尚未完成的功能

- Email 服務串接（聯絡表單寄信通知）
- SSL / HTTPS 正式啟用
- 網域設定與 DNS（GitHub Pages 自訂網域）
- 試算工具稅率確認
- Admin API 加 Zod input validation
- CSP / HSTS security headers
- CSRF 防護
