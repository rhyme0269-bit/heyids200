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
│   ├── page.tsx          # 首頁
│   ├── layout.tsx        # 全站 Layout
│   ├── about/            # 關於我們
│   ├── services/         # 服務項目 + 收費標準
│   ├── tools/            # 小工具（6 個試算器）
│   ├── faq/              # 常見問題
│   ├── contact/          # 聯絡我們
│   ├── admin/            # 後台管理介面
│   └── api/              # API 路由
│       ├── contact/      # 聯絡表單 POST
│       ├── images/[key]/ # 圖片取得（BLOB from SQLite）
│       └── admin/        # 後台 CRUD API（7 個端點）
├── components/
│   ├── common/           # 共用元件
│   ├── layout/           # Header, Footer
│   └── sections/         # 首頁區塊元件
└── lib/
    ├── db.ts             # SQLite 連線、Schema、CRUD、auto-seed
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

### 新增頁面

1. 在 `src/app/` 下建立目錄與 `page.tsx`
2. 在 `Header.tsx` 新增導覽連結
3. 在 `sitemap.ts` 新增路由
4. 視需要在 `db.ts` 新增資料表與 CRUD 函式

### 新增後台管理分頁

1. 在 `src/app/api/admin/` 下建立 API route
2. 在 `AdminClient.tsx` 新增對應 tab 與 UI
3. 在 `db.ts` 新增資料表 Schema 與操作函式
4. 在 `default-data.ts` 新增預設資料

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

## 尚未完成的功能

- Email 服務串接（聯絡表單寄信通知）
- Google Maps 精確座標
- SSL / HTTPS 正式啟用
- 網域設定與 DNS
- 試算工具稅率確認
