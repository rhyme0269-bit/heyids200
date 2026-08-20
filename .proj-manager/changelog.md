# Changelog

## [refine: #25 第二階段精修 P0 + 收費表格手機版] - 2026-08-20T01:00:00Z

### 變更類型

UI/UX 精修（Issue #25 第二階段規格，P0 + 第十八節）

### 分支

本輪起改在 `dev` 分支開發（`main` 為客戶部署用）。已刪除確認合併完成的 `feature/cms-builder`。

### P0：文字可讀性與 Design System

| 項目 | 結果 |
|---|---|
| 中文正文 | 17px、行高 1.8、字重 500（CJK 需比拉丁字母更重才有同等視覺密度）；標題維持 1.35 行高不受影響 |
| `stone-500` 對比 | 3.55 → **4.20:1** |
| `stone-400` 對比 | 2.51 → **3.08:1** |
| 動畫 token | 新增 `--motion-fast/base/slow` = 180/220/300ms |
| `prefers-reduced-motion` | 補上 `scroll-behavior` 支援 |

可讀性改善**未動客戶指定的品牌色**，而是把承載小型標籤的中間色階調深。

### P0：卡片與 Footer

- 卡片 hover `-8px` → `-3px`，陰影改為 `0 6px 24px rgba(45,42,38,.06)`（帶品牌色調而非純黑，在暖色背景上更柔和）。客戶原話：「高級，不是漂浮」
- **Footer 高度 1058 → 717px（-32.2%）**，目標 25–35% ✅
- **地圖 260 → 170px（-34.6%）**，目標 30–40% ✅
- Footer 文字 `stone-400` → `stone-300`，深底對比 4.98 → **8.77:1**
- 高度主要來自第三欄，故 8 個快速連結改為雙欄，同時讓三欄更平衡

### 第十八節：收費表格手機版

390px 下 4 欄表格擠進 341px，雖無溢出但備註幾乎無法閱讀。改為桌機 table／手機 card，**兩種呈現由同一組 `columns`/`rows` 渲染**（`hidden md:block` 與 `md:hidden` 切換），不建立第二份資料。

卡片以第一欄為標題、第二欄為突出數值 —— 表格第二欄慣例上就是要查的數字，恰好符合規格指定的優先序（服務項目 → 收費 → 付費方 → 備註）。空值略過，不留空白標籤列。

桌機同時套用該節要求：表頭對比加強、列高增加、第一／二欄視覺強調。順帶發現原本針對收費欄的右對齊樣式從未生效（seed 的 columns 沒有 align 值）。

### 連帶修正

**上一輪的 regression**：關於我們頁照片下方執照字號重複出現兩次 —— `imageSubtitle` 本就含執照字號，第二階段又加了一行。改為僅在 subtitle 未包含時才顯示，兼容既有資料與日後編輯。

### 驗證方式

- **RWD 以量測取代目視**：視窗 resize 在測試環境不影響頁面 viewport，故改用固定寬度 iframe（media query 於 iframe 內依其寬度作用），掃 9 頁 × 6 種寬度（390/430/768/1024/1280/1440）= 54 組，**水平溢出全部為 0**
- 量測方法本身先經驗證：故意注入 2000px 元素，被正確偵測為 1625px 溢出
- 收費表格：390px 表格隱藏、42 張卡片渲染、零溢出；768/1280px 表格回復、卡片隱藏
- `tsc --noEmit` 零錯誤；全站 10 條路由 200

### 已提出待客戶確認（未動工）

1. **聯絡表單**：規格稱「目前使用 Google Form 嵌入」，實際查證為原生表單，該項無需修改。但**靜態站無後端可收件**，已提出三種收件方案（建議 Google Apps Script + Sheet）
2. **服務 icon 改 SVG**：改後客戶將無法自由輸入 emoji（後台目前可自選），需確認是否接受
3. **人物區突出「3～4 項最具代表性資格」**：屬專業判斷，請客戶指定
4. **#30 Instagram**：缺帳號與範圍；「嵌入貼文牆」與規格「不要大量增加第三方套件」衝突

### 尚未進行

P1 其餘項（小工具欄位統一與試算後 CTA、FAQ 動畫、實用連結 spacing、CTA 系統統一）與 P2（無障礙、效能、SEO 複查）。

---

## [feat: 改為「本機編輯 + 發布靜態站」架構] - 2026-08-19T11:00:00Z

### 變更類型

部署架構變更

### 背景

客戶已租借網域，且未來由客戶自行管理服務。評估後採用「本機用 Docker 執行後台編輯 → `npm run publish` 產生靜態站 → 發布到 GitHub Pages」，不需租用主機，且 GitHub Pages 的自訂網域憑證由 GitHub 自動續約。

### 分支架構

| 分支 | 用途 |
|---|---|
| `main` | 客戶使用的穩定版 |
| `dev` | 我們開發 |
| `gh-pages` | 發布產出，由 `npm run publish` 自動更新 |

### 三個必須一起處理的問題

單純分支分離**無法**達成目的，以下三項缺一不可：

**1. CI 會覆蓋客戶網站**
`deploy-preview.yml` 觸發於 push main 並以 **seed 預設資料**部署 Pages。main 改為客戶分支後，每次 merge 都會把客戶實際內容換成預設值。已移除該 workflow，改為 `build-check.yml`：型別檢查 + 建置 + 執行發布腳本驗證流程，但**完全不碰 Pages**。

**2. 後台與發布腳本讀的是不同資料庫** ⚠️ 最嚴重
Docker 使用具名 volume `app-data:/app/data`，而 `publish.mjs` 讀 `./data/oneness.db` —— 兩個不同的檔案。客戶在後台編輯後發布，送出去的會是另一份內容，**且不會報錯**。已改為 bind mount `./data:/app/data`，順帶讓備份變成「複製資料夾」，與腳本提醒一致。

既有部署需先把 volume 內容複製到 `./data`。Linux 上還需確保檔案可被容器使用者寫入 —— 實測時因檔案屬 uid 1002 且權限 644，容器出現 `SQLITE_READONLY`。

**3. 客戶需安裝 Node.js**
`npm run publish` 會呼叫 `npm run build`。README 原本只要求 Docker + Git，已補上 Node.js。

### 發布腳本

`publish.mjs` 新增自動推送：在 `_site` 建立全新 git 儲存庫後強制推送到 `gh-pages`（產出可重新產生，不需保留歷史）。`SKIP_PUSH=1` 只產生不發布，CI 即使用此模式。推送失敗會給出可讀的原因，而非 git 錯誤訊息。

### README 全面校正

架構變更後多處自相矛盾，已一併修正：Docker volume 說明、備份指令（改為複製資料夾）、已移除的預覽站、GitHub Pages 的描述。網域章節拆為「方式 A：GitHub Pages（目前採用）」與「方式 B：自架主機」，前者含 GitHub Pages 的四組 A 記錄、CNAME、Enforce HTTPS 與「憑證自動續約」說明。

### 驗證

- 在 Docker 後台將「累積案件」改為 1688 → 發布產出即為 **1,688**，證實後台與發布腳本讀同一份資料庫
- 推送流程以測試分支實測通過（已刪除）
- 圖片匯出：資料庫圖片 → `img/<key>.<ext>`，HTML 與前台 JS 皆無 `/api/images` 殘留
- 計算器在靜態站實測可運作（800萬/2%/30年 → 每月 29,570 元，與攤還公式相符）
- 全站 10 條路由 200；CI 於 main 與 dev 皆通過

### ⚠️ 待處理（需 repo 擁有者操作）

GitHub Pages 的來源目前仍是 `workflow`（指向 main），而該 workflow 已移除。**必須由 repo 擁有者到 Settings → Pages 將 Source 改為 `Deploy from a branch` → `gh-pages`**，發布才會生效。我們的 token 只有 push 權限，無法代為修改（API 回傳 404）。

---

## [feat: SEO 強化（#25 第三階段）] - 2026-08-18T11:00:00Z

### 變更類型

SEO（Issue #25 第三階段）+ 連帶修正既有問題

### 關鍵字與描述

原關鍵字為「地政士」「代書」「蘆洲」等單一詞，改為使用者實際輸入的複合詞：新北地政士、台北地政士、新北代書、台北代書、蘆洲地政士、三重地政士，以及各項業務詞。

網站描述改以自然語句陳述服務範圍（「服務範圍涵蓋新北市蘆洲、三重、台北市及全台各地」），刻意避免關鍵字堆疊 —— 客戶已於 #25 確認服務範圍為全台灣，故此描述與實際相符。

### 結構化資料

- `@type` 改為 `["LegalService", "LocalBusiness"]`。LegalService 本就是 LocalBusiness 的子類型，但規格明確要求兩者，故改為顯式標示
- 新增 `areaServed`：臺灣 + 新北市、臺北市、蘆洲區、三重區
- FAQPage 與 Open Graph 原本已有，未變更

### 連帶修正的既有問題

1. **`url` 寫死為 `https://www.oneness200.com`** —— 不論實際部署於何處都回報此網址，向搜尋引擎宣告了錯誤的網站位置。改為依 `NEXT_PUBLIC_SITE_URL` 帶入（已於預覽站驗證輸出 `https://rhyme0269-bit.github.io/heyids200`）
2. **`image` 為空字串、`sameAs` 為空陣列** —— 對 Schema 而言是無效值。改為無內容時不輸出；`sameAs` 帶入 LINE 官方帳號
3. **`robots.txt` 排除 `/studio/`**（Sanity 時代殘留，早已不存在）**卻未排除 `/admin`** —— 後台登入頁可被收錄。已對調

### 驗證

- `tsc --noEmit` 零錯誤
- Docker：10 條路由 200；schema 含兩種類型、5 筆 areaServed、LINE sameAs；`image` 欄位確認不輸出；FAQPage 仍為 7 題；`robots.txt` 已排除 `/admin`；sitemap 列出 9 頁（含新流程頁）
- 線上預覽站：schema 的 `url` 正確反映部署網址，關鍵字與 areaServed 皆確認

### 已知事項（已回報客戶，待其決定）

預覽網站（github.io）目前公開可被收錄。正式站上線後兩站內容相同，可能在關鍵字上互相競爭、分散排名。建議上線時關閉預覽站或加上不允許收錄設定。未自行變更。

另：預覽站的靜態擷取不包含 `robots.txt` 與 `sitemap.xml`（workflow 僅擷取 sitemap 列出的頁面與靜態資產），正式的 Docker 部署則正常提供兩者。

---

## [feat: 配色可後台自訂 + #25 第二階段內容區塊] - 2026-08-18T10:00:00Z

### 變更類型

新功能（配色自訂）+ UI/UX 改版（Issue #25 第二階段）

### 配色改為後台可自訂

**關鍵前提**：Tailwind 4 產出的 utility 是 `color:var(--color-stone-800)` 而非寫死色值，變數位於 `:root`。因此在執行期覆寫變數即可全站換色 —— 不需改任何 class、不需重新建置、19 種 CMS 區塊一併生效。

- 新增 `src/lib/theme.ts`：5 個 anchor（主色／次要色／背景／主要文字／次要文字）推導出 stone 11 階 + amber 10 階共 21 個色值
- `layout.tsx` 注入 inline `<style>`，選擇器用 `:root:root` 提高優先權，不受與 Tailwind `:root` 的先後順序影響
- 後台「基本資訊 → 網站配色」：每個 anchor 有色票選擇器 + 色碼欄位，格式錯誤以紅框標示，另有「還原預設配色」
- 色碼無效時**逐欄回落預設值**，不可能讓網站變空白（已實測寫入非色碼字串）
- `getSettings()` 本就 spread 預設值，既有資料庫無需遷移
- `globals.css` 保留靜態 `@theme` 作為 inline style 生效前的 fallback，其值即為 `buildScales()` 對預設 anchors 的輸出

**一個試了又退回的決定**：中間色階插值曾改為線性光空間（理論上更正確），但實測更差 —— 淺階被洗成灰調（`amber-50` 從奶油色變近中性灰）、深階幾乎不變暗。故退回 gamma 空間，並在程式碼註明已知代價：主色與次要色色相差距大時 `amber-600/700` 中點偏濁，但那兩階僅用於裝飾漸層與少數 hover（約 23 處），不承載文字。

### #25 第二階段（依客戶提供的資料，未自行編造）

| 規格 | 實作 |
|---|---|
| 首頁標語 | 合眾所託，一心守護 / Your trust, our commitment. |
| 兩個 CTA | 立即諮詢 + LINE 線上諮詢，52px 高、12px 圓角、hover 上浮 |
| 數據區塊 | 26+ 年專業經驗 / **1,500+ 累積案件** / 全台；數字放大、淺灰底、捲入視窗時累加 |
| 服務流程 | 新增五步驟區塊於服務項目前，桌機橫向 / 手機垂直 |
| 頁尾 | 營業時間、客戶提供的 LINE QR、Google 地圖 |
| 事務所特色 | 改為 Icon Feature（金色勾選） |
| 關於我們 | 照片 20px 圓角 + 柔和陰影；姓名下方顯示執照字號 |

**連帶修正**：hero 數據條原為「10+ 房仲品牌合作」，與新數據區塊矛盾，已一併對齊。

**移除**：hero 的電話 CTA（導覽列已有），已在 issue 留言說明並保留調整空間。

**未自行改寫的部分**：事務所特色文字保持原樣 —— 客戶指示「專長領域、個人簡介文字先照原本不變」，故未擅自拆成短標題＋說明。

### 新增設定與資產

- `businessHours`、`caseCount` 設為 settings（案件數是對外聲明，客戶需能自行修改）
- `line_qr` 納入圖片管理，並新增 `migrateImageSlots()` 讓既有資料庫也取得此欄位（insert-if-missing，可安全重複執行）
- `CountUp` client 元件：IntersectionObserver 觸發一次，首次繪製即含最終數字（無 JS 也不會缺數字），`prefers-reduced-motion` 時直接顯示結果

### 驗證

- `tsc --noEmit` 零錯誤
- Docker：10 條路由全部 200；第二階段每一項皆在 HTML 中確認
- 既有資料庫（無 `businessHours`／`caseCount` 資料列）仍正確顯示，證實預設值回落機制
- 配色端到端：主色改 `#1f3a34`、次要色改 `#c9a227` → 全站含流程頁即時換色；還原正常；非色碼安全回落
- 線上預覽站：標語、CTA、五步驟 5/5、1,500 累積案件、營業時間、QR（HTTP 200）、執照字號皆確認

### 尚未進行

- 客戶信任區塊：缺合作品牌 logo，於 #27 追蹤
- 第三階段：SEO 關鍵字布局（客戶已確認服務範圍為全台灣）

---

## [feat: 品牌配色系統、導覽列升級、卡片樣式（#25 第一階段）] - 2026-08-18T09:00:00Z

### 變更類型

UI/UX 改版（Issue #25 第一階段：視覺基礎）

### 關鍵決策：以覆寫色階取代改寫 class

全站以 Tailwind 的 `stone` / `amber` 兩個色階撰寫，用量約 700 處（`stone-200` 單獨 131 次、`amber-800` 151 次）。因此改為**在 `@theme` 覆寫這兩個色階**，而非逐一改寫 class：

- 元件程式碼一行都不用動
- 日後調整品牌色只需改 `globals.css` 的一個區塊
- 不會出現半新半舊的混雜狀態

```
stone = 暖中性色   50 #F5F1EB 背景 · 200 邊框 · 600 #7A6A5A 副文字 · 800 #2D2A26 文字
amber = 品牌強調色  500 #B08D57 次要金 · 800 #4A3428 主色
```

中間階為插值以保持色階均勻。另定義 `--color-gold` 別名，讓金色可被刻意使用（導覽列底線等），不必依賴它在色階中的位置。

寫死的 `#44403c`（hero 預設底色）與 `.text-gradient` 的舊琥珀色一併對齊新色票；資料庫中已儲存的 hero 色值透過 `seed_hash` 機制送達既有部署。

### 導覽列（規格第三節）

- 高度 64px → 80px
- Logo 尺寸放大約 15%（h-8/10/14/20 → h-9/11/16/23）
- 捲動超過 8px 後轉為半透明毛玻璃（`backdrop-blur-[12px]` + `bg-white/70`）
- 選單金色底線由中央向兩側展開 —— 以 pseudo-element 寫在 class 字串中，不需為每個連結增加標記

### 卡片（規格第五節）

- 圓角 20px、內距 32px
- 靜置陰影 `0 10px 30px rgba(0,0,0,.08)`，hover 上浮 8px / 0.3s
- 上浮效果寫在既有的 `.hover-lift`（ServiceCard 與 AboutPreview 共用），兩者保持一致
- 補上 `prefers-reduced-motion` 支援（原本沒有）

### 連帶修正

`ManualContent.tsx` 的 `border-stone-150` —— Tailwind 無此色階，邊框其實一直沒生效，改為 `stone-200`。

### 對比度驗算（新配色）

| 組合 | 比值 | WCAG AA |
|---|---|---|
| 副文字 #7A6A5A on #F5F1EB | 4.62:1 | ✅ |
| 副文字 #7A6A5A on 白卡 | 5.20:1 | ✅ |
| 主色 #4A3428 on 白 | 11.6:1 | ✅ |
| 白字 on #4A3428 按鈕 | 11.6:1 | ✅ |

`stone-400` 僅用於裝飾性圖示與編號，比值與改版前相當，未退步。

### 驗證

- `tsc --noEmit` 零錯誤
- Docker：10 條路由全部 200
- 產出的 CSS 含品牌色，舊色 `#92400e` / `#292524` / `#78350f` **各 0 次**
- 毛玻璃、金色底線、卡片上浮、後台登入頁皆確認正常
- 線上預覽站同步驗證：品牌色到位、舊色 0 次

### 尚未進行

- 第二階段（內容區塊）：素材已齊，可隨時開始
- 客戶信任區塊：缺合作品牌 logo，已另開 #27 追蹤

---

## [feat: 階段流程區塊 + 買賣移轉登記流程頁] - 2026-08-18T08:00:00Z

### 變更類型

新功能（Issue #23，依 #26 客戶答覆實作）

### 客戶答覆（#26）與對應處理

| 客戶指示 | 實作 |
|---|---|
| 改寫成事務所自己的說法，主要流程順序有就好 | 全文改寫，廠商統一稱「建經公司」，無特定廠商名稱 |
| 由我們逐項製作 | 頁面已建好，但仍提供後台編輯器供校正用詞 |
| 貸款部分跨兩個階段 | 核發稅單註明「自本階段起同步辦理，詳見下一階段」，完整說明置於完稅 |
| 只從服務項目卡片進入，不放導覽列 | `showInNav: false` |
| 可展開收合 | 原生 `<details>`，預設展開 |

### 架構決策（以「未來易變更、好維護」為選擇標準）

1. **不在 schema 引入「跨階段」概念**。`rowSpan` 之類的欄位會同時汙染資料模型、renderer 與折疊邏輯，而全站只用到一次。改以文字前後呼應處理。
2. **左右欄內容用多行字串，非陣列**。換行即一項，編輯器只需兩個 textarea，不必做逐行增刪 UI，階段可容納任意項數。
3. **左右欄標題存在資料裡**。未來繼承登記流程可改為「地政士作業／繼承人作業」，無需改程式。
4. **折疊用原生 `<details>/<summary>`**，不寫 client component：零 JS、零 hydration、鍵盤可操作、JS 失效仍可用。預設展開與否為資料欄位。（本專案已有兩處 `rules-of-hooks` 違規，不再增加第三處。）
5. **`ServiceCard` 將 `/` 開頭的 url 視為內部連結**，走 `next/link`。未來新增流程＝建頁面＋填 url，零程式改動；`next/link` 也會自動處理預覽站的 basePath。

曾評估沿用既有的 `two_column_list`，但它是兩組並列的靜態項目清單，沒有「階段」概念，無法逐階段配對左右內容，故新增 `two_column_flow`。

### 改動

- `cms-types.ts`：`BlockType` 新增 `two_column_flow`，新增 `TwoColumnFlowData`
- `TwoColumnFlowRenderer.tsx`：新增
- `BlockRenderer.tsx`：註冊 renderer
- `PageBuilder.tsx`：標籤、提示、預設資料、編輯器（階段增刪 + 兩欄 textarea + 預設展開開關）
- `cms-db.ts`：`SALE_FLOW` 內容、`flow-sale` 系統頁面 seed、`SERVICE_FLOW_LINKS` 對應表、`RESERVED_SLUGS` 加入 `flow-sale`、既有資料庫的 url 補寫遷移
- `ServiceCard.tsx`：內部連結支援

### 既有資料庫處理

客戶若編輯過服務項目區塊，`seed_hash` 機制會保留其版本，新的 url 永遠送不到。因此改為逐項補寫，且**僅在該項目原本沒有 url 時才填入**，既有連結不會被取代 —— 因此每次啟動執行都安全。

### 驗證

- `tsc --noEmit` 零錯誤
- Docker：`/flow-sale` 200，8 個階段全數渲染，無廠商品牌殘留（grep「第一建經」= 0）
- 折疊功能正常（點擊標題可收合，chevron 旋轉）
- 首頁與服務項目頁卡片皆為內部連結：無 `target="_blank"`，角標顯示 `01` 而非 `↗`；`/links` 的外部連結仍保持 `↗` 與新分頁
- 空欄位（過戶、結案）顯示「—」共 2 處
- 兩欄 class 為 `grid-cols-1 md:grid-cols-2`，手機自動堆疊
- 全站 10 條路由 200
- 線上預覽站 `/flow-sale` 200，卡片連結正確帶上 basePath

---

## [feat: 導覽列加入收費標準 + LINE 連結更新] - 2026-08-18T07:00:00Z

### 變更類型

需求實作（Issue #20、#24）+ 連帶 Bug 修正

### Issue #20：導覽列加入「收費標準」

客戶要求放在服務項目與小工具之間。`fees` 頁面由隱藏改為 `navOrder: 3` 並顯示於導覽列，tools/faq/links/contact 各後移一位。

**連帶發現並修掉的問題**：seed 只會更新頁面的內容區塊，**從不重新套用頁面層級的導覽設定**。因此任何既有資料庫都永遠停留在第一次建立時的順序 —— 這就是為什麼 `279e3ac` 那次修的 faq/links navOrder 衝突（兩者皆為 5，實際順序取決於資料列插入順序）在實際部署上從未生效。

加入一次性遷移，以 `settings` 表的 `cms_nav_order_v2` 標記記錄執行狀態，避免覆蓋客戶日後的手動調整。

### Issue #24：LINE 連結改為 https://lin.ee/pgsUFs6

站上共 4 處 LINE 連結，其中 2 處原本就是壞的：

- **`FloatingLine.tsx`**：網址寫死，完全不讀 `settings.lineUrl` —— 與首頁 emoji 同類的「兩套來源」問題。改為由 layout 傳入（layout 本就已載入 settings）
- **`ContactInfoRenderer.tsx`**：聯絡我們頁的 LINE 只是純文字 ID，不是連結，根本點不了。改為連到 `lineUrl`，同時完成 proj-manager 的 **TODO-003**
- `default-data.ts`：`lineUrl` 預設值與 FAQ 答案中的 markdown 連結
- `ManualContent.tsx`：手冊範例文字（避免誤導）

**既有資料庫處理**：`settings` 僅在空表時 seed，故新增 `migrateSettings()`，僅在值仍為舊預設網址時替換，客戶自訂的網址不會被覆蓋（替換後條件自然不再成立，具冪等性）。FAQ 答案無需遷移 —— `seed_hash` 機制本來就會對客戶未編輯過的區塊套用新內容。

### 驗證

- `tsc --noEmit` 零錯誤
- Docker：既有資料庫遷移後導覽列為 首頁/關於我們/服務項目/收費標準/小工具/常見問題/實用連結/聯絡我們，無重複 navOrder
- 冪等性：導覽順序手動改為 99、LINE 網址手動改為自訂值，重啟後**皆保留未被覆蓋**
- 全新部署：順序與網址皆正確
- 全站 9 條路由 200；首頁/FAQ/聯絡我們共 17 處新網址、0 處舊網址
- 線上預覽站同步驗證通過

### Issue 回覆

- #20、#24：已附截圖回覆
- #25（gpt 改版需求）：已留言列出待確認事項 —— 規格章節缺「一」「二」「十」疑似截斷、需客戶提供的素材清單（案件數、形象照、執照字號、合作品牌 logo 等）、與 #23 流程區塊的重疊、並建議分三階段進行
- #26：新建，列出 #23 製作前的 5 項待確認事項

---

## [fix: 首頁服務項目改讀 CMS，圖示終於顯示] - 2026-08-18T00:00:00Z

### 變更類型

Bug 修正（Issue #17 真正的根因）

### 變更摘要

Issue #17 客戶回報的是**首頁**的服務項目圖示沒顯示（2026-08-01 留言原話：「已經在後台手動設定過 icon 並儲存，但前台的首頁頁面並沒有顯示」），先前歷次修復與驗證截圖都對著 `/services` 頁面，因此問題從未真正解決。

首頁的 `ServicesPreview.tsx` 讀的是 legacy `services` 表，且每張卡片畫的是**寫死的同一個 SVG**，根本沒有 icon 欄位。後台「頁面管理」編輯的 icon 存在 CMS 的 `key_value_list` 區塊 — 兩套完全不同的資料來源，改再多次也不會反映到首頁。

CMS 遷移當時把 `/services` 頁面轉成區塊，卻漏掉首頁這個區塊，使它變成孤兒：資料來自 legacy 表，而後台已經沒有「服務項目」tab 可以編輯那張表。

### 改動

- **新增 `src/components/common/ServiceCard.tsx`**：把卡片標記抽成共用元件。首頁與 CMS renderer 原本是兩份逐字相同的複製，抽出後不會再各自漂移
- **`KeyValueListRenderer.tsx`**：改用共用 `ServiceCard`
- **`ServicesPreview.tsx`**：改讀 services 頁面的 `key_value_list` 區塊，legacy `getServices()` 僅保留為舊資料庫的 fallback

### 驗證

- 首頁與 `/services` 顯示相同的 9 個 emoji
- 透過後台 API 把第一項 icon 改為 🚀 → **首頁與 `/services` 同步變更**，改回 🏠 亦同步（修復前首頁不可能變動）
- `/links` 卡片不受影響（同樣走 `key_value_list`），外部連結 `↗` 標記正常
- `tsc --noEmit` 零錯誤；Docker 部署 9 條路由全部 200

### 備註

Legacy `services` 表目前已無任何後台編輯介面，僅剩此處 fallback 在用。日後可考慮連同 `getServices()` 一併移除。

---

## [chore: CMS builder 合併回 main + 預覽站修復] - 2026-08-14T08:00:00Z

### 變更類型

分支合併 + CI 修正 + Bug 修正

### 變更摘要

`feature/cms-builder` 自 2026-07-29 起累積 43 個 commit 未合併，GitHub Pages 預覽站因此停留在舊版，是先前多個 issue 出現「已修改但看不到」的主因之一。合併前先建立回滾 tag，合併後連帶修復兩個只在預覽站環境浮現的問題。

### 改動

- **tag `v0.1.0`**：指向 `34545be`（合併前最後的 main），作為回滾點。回滾方式 `git reset --hard v0.1.0`
- **PR #21**：`feature/cms-builder` → `main`，`--no-ff` 合併保留完整歷史（merge commit `e367448`，105 檔案 +9035/-2377）
- **`.gitignore`**（`c11a986`）：加入 `.claude/settings.local.json`（含 GH_TOKEN）與 `tsconfig.tsbuildinfo`
- **`.github/workflows/deploy-preview.yml`**（`5178473`）：改由執行中 server 的 sitemap 列舉頁面，取代掃描 `src/app/` 的作法
- **`layout.tsx` / `globals.css`**（`0c18ab9`）：emoji 字型改用 `next/font/local` 宣告，字型檔移至 `src/app/fonts/`

### 修復的問題

1. **預覽站部署失敗**：CMS 改版後路由變成動態片段（`[slug]`、`p/[slug]`），workflow 掃描 `page.tsx` 得到字面上的 `[slug]` 餵給 curl，被判定為 URL 格式錯誤（exit 3），在 `bash -e` 下整個 job 中斷。改用 sitemap 列舉，可涵蓋所有已發布頁面（含不在導覽列的 `/fees`），並加上 `-g` 停用 curl globbing、非 200 即失敗以避免發布錯誤頁。

2. **emoji 字型在預覽站 404**：`@font-face` 寫死絕對路徑 `/fonts/emoji-subset.woff2`，未帶 basePath。預覽站位於 `/heyids200/` 之下，瀏覽器實際請求 `/fonts/...` 得到 404 — 即 Issue #17 的修復（`e6261da`）在預覽站上從未真正生效，只有 basePath 為空的 Docker 環境正常。改用 `next/font/local` 後輸出相對路徑 `url(../media/...)`，任何 basePath 都能解析；同時關閉 `adjustFontFallback` 以免 Next 將 Arial 插進 `.emoji-icon` 的字型鏈、擋在系統 emoji 字型之前。

### 驗證

- `tsc --noEmit` 零錯誤；`next build` 31 條路由全數產出
- 有 / 無 basePath 兩種建置輸出相同的 `@font-face`
- Docker 部署（`docker compose up -d --build`）：9 條路由 + 4 個 API 端點全部 200，字型檔 200 / 22796 bytes，服務項目 emoji 正確出現在 HTML
- CI 抓取 8 個頁面全部 200

### 已知技術債（未處理）

- `ToolsClient.tsx:128-130` early return 排在兩個 `useState` 之前，違反 Rules of Hooks。目前觸發機率低（父層 `key={calc.id}`、清單僅 fetch 一次），但後台若把「純連結」計算器改成含輸入欄位並觸發重新取資料會白畫面。**未動的原因**：Issue #12 客戶要求小工具先不要再變更
- `PageBuilder.tsx:326` render 期間呼叫 `Date.now()` / `Math.random()`
- `PageBuilder.tsx:137`、`CalcEditor.tsx:529` effect 中同步 setState
- `AdminClient.tsx` 3 個 lint error 為 main 既有問題

---

## [fix: Emoji 圖示跨平台渲染修復] - 2026-08-08T11:00:00Z

### 變更類型

Bug 修正（Issue #17）

### 變更摘要

CJK 字型（Noto Sans TC）會攔截 emoji codepoints，導致 Linux 等缺少 emoji 字型的系統上服務項目圖示顯示為空方框。建立 23KB 的 Noto Color Emoji 字型子集，透過 @font-face 載入為 web font，搭配系統 emoji 字型作為 fallback。所有 emoji icon 元素加上 emoji-icon CSS class。

### 改動

- globals.css: 新增 @font-face "Emoji" 字型宣告 + .emoji-icon class
- KeyValueListRenderer.tsx: icon span 加上 emoji-icon class
- ToolsClient.tsx: calculator icon span 加上 emoji-icon class
- CalcEditor.tsx: 後台 calculator icon span 加上 emoji-icon class
- public/fonts/emoji-subset.woff2: 23KB emoji 字型子集

### Issue 更新

- Issue #10（購屋總費用試算）：所有功能已在先前 commit 實作完成，已附截圖回覆
- Issue #17（後台管理 icon）：emoji 圖示渲染修復，已附截圖回覆
- Issue #19（實用連結）：已在先前 commit 完成，已附截圖回覆
- Issue #20（服務項目）：已在先前 commit 完成，已附截圖回覆

---

## [feat: 視覺公式建構器增強與前端硬編碼移除] - 2026-08-04T00:00:00Z

### 變更類型

功能增強 + Bug 修正

### 變更摘要

視覺公式建構器新增線性建構流程（ContinueButton `…` 按鈕）、清除公式功能、空公式提示。修正 nodeToExpr 對空節點回傳 0 的問題。移除前端 rate_display 硬編碼邏輯，改由後端公式計算。新增 rate_display 公式至 deed_tax 和 combined_income_tax seed。metadata description 改為泛用文字。

### 改動

- FormulaBuilder.tsx: 新增 ContinueButton、handleWrap、handleClear、空公式提示；修正 nodeToExpr empty 回傳 null
- ToolsClient.tsx: 移除 rate_display 特殊處理邏輯
- page.tsx (tools): metadata description 改為泛用文字
- calc-seed.ts: 新增 rate_display 公式至 deed_tax 和 combined_income_tax
- calc-types.ts: CalcFormula 新增 optional label 欄位
- CalcEditor.tsx: 支援公式 label 顯示

---

## [feat: 後台使用手冊 TPEX 風格改版] - 2026-07-31T06:00:00Z

### 變更類型

功能改進

### 變更摘要

參考 TPEX 前端使用說明界面，重新設計後台使用手冊：新增歡迎橫幅、5 步驟快速入門時間軸、注意事項側欄卡片、可點擊跳轉其他頁籤的 TabLink 元件。所有原有操作說明內容保留。

### 改動

- ManualContent.tsx: 完整改版，新增 WelcomeBanner、TimelineGuide、NoticeCard、TabLink 元件
- AdminClient.tsx: 傳入 onNavigate={setActiveTab} 讓手冊內連結可跳轉頁籤

---

## [fix: 服務項目預設 emoji icon] - 2026-07-31T05:30:00Z

### 變更類型

Bug 修復

### 變更摘要

修復服務項目 key_value_list 區塊 seed 資料缺少 icon 欄位的問題。新部署時服務項目卡片會帶有預設 emoji 圖示（🏠🌳🤲🔐🧾⚖️🏛📈💬）。

### 改動

- cms-db.ts: 兩處 seedHomePage/seedServicesPage 的 defaultServices.map 加入 icon 欄位

### 關閉 Issues

- #17 後台管理（項目增加圖示後並未顯示）

---

## [fix: 計算器遞增式 seed + 定義自動更新] - 2026-07-31T04:00:00Z

### 變更類型

Bug 修復

### 變更摘要

修復計算器 seed 邏輯從「全有全無」（表有資料就跳過）改為 slug-based 遞增式 seed。新增的系統計算器會自動 INSERT，已存在但 definition 不同的會自動 UPDATE。解決既有 DB 無法取得新版計算器定義的問題（#10 購屋總費用、#11 土地增值稅、#12 房地合一稅）。

### 改動

- calc-db.ts: `seedCalculators()` 改為查詢既有 slug+definition，比對後決定 INSERT 或 UPDATE

### 關閉 Issues

- #10 購屋總費用試算
- #11 土地增值稅試算修改
- #12 房地合一稅試算

---

## [feat: 系統頁面與使用者頁面分離] - 2026-07-31T03:00:00Z

### 變更類型

架構改進

### 變更摘要

解決兩個問題：(1) seed 邏輯從「全有全無」改為遞增式，新增 `seed_key` 欄位追蹤每個系統預設頁面，既有 DB 升級時可自動新增缺少的系統頁面；(2) 使用者建立的頁面 URL 改用 `/p/{slug}` 前綴，與系統頁面（頂層 `/{slug}`）隔離，防止 slug 衝突。同時新增保留 slug 驗證（admin、api、p 等），sitemap 改為從 DB 動態生成。

### 改動

- cms-types.ts: Page interface 新增 `seedKey: string | null`
- cms-db.ts: pages 表新增 `seed_key` 欄位 + 遷移邏輯、`seedCmsPages()` 改為遞增式（每個頁面獨立 seed 函式）、`getNavItems()` 依 is_system 產生不同 URL、`createPage()` 新增 RESERVED_SLUGS 驗證
- [slug]/page.tsx: 加 `!page.isSystem` guard，僅服務系統頁面
- p/[slug]/page.tsx: 新增使用者頁面路由，僅服務非系統頁面
- PageBuilder.tsx: 建立 modal 顯示 `/p/` 前綴、頁面列表區分系統/使用者路徑、保留 slug 驗證提示
- API routes: 新增保留 slug 400 錯誤處理
- sitemap.ts: 改為動態查詢 DB 生成，正確區分系統/使用者頁面 URL

### 影響評估
- 風險等級: Medium
- 受影響功能: feature-020
- 破壞性變更: 使用者頁面 URL 從 `/{slug}` 變為 `/p/{slug}`（上線前可接受）

---

## [feat: 計算器排序 (#13) + Google 表單 (#14) + 實用連結 (#16)] - 2026-07-31T01:00:00Z

### 變更類型

新增功能

### 變更摘要

依 GitHub Issues 完成三項功能：#13 計算器排序 UI（▲▼ 箭頭即時重排）、#14 Google 表單嵌入（聯絡表單/聯絡雙欄支援 googleFormUrl）、#16 實用連結頁面（/links seed + 項目列表 url 欄位支援連結卡片）。更新使用手冊新增三項功能的操作說明。修正 KeyValueListRenderer eyebrow 文字依內容動態切換。

### 改動

- CalcEditor.tsx: 新增 `handleMove` + ▲▼ 按鈕
- cms-types.ts: KeyValueListData items 新增 `url`、ContactFormData 新增 `googleFormUrl`
- ContactFormRenderer.tsx / ContactLayoutRenderer.tsx: 支援 Google Form iframe
- PageBuilder.tsx: 新增 Google Form URL 和項目連結 URL 編輯欄位
- KeyValueListRenderer.tsx: 提取 ItemCard 元件，支援連結卡片，eyebrow 動態切換
- cms-db.ts: 新增「實用連結」seed 頁面（6 個政府連結）
- ManualContent.tsx: 新增計算器排序、Google 表單、實用連結操作說明

### 影響評估
- 風險等級: Low
- 受影響功能: feature-015, feature-017, feature-018, feature-019
- 破壞性變更: No

---

## [feat: 計算器改良 (#10-13) + FAQ 連結 (#15) + 使用手冊更新] - 2026-07-30T23:30:00Z

### 變更類型

功能修改 + 新增功能

### 變更摘要

依 GitHub Issues #10-13 改良計算器：購屋總費用新增貸款相關欄位（設定費、設定規費）、土地增值稅改為連結型計算器、房地合一稅自動推算推計費用、計算器重新排序。依 #15 為 FAQ 答案加入 Markdown 連結語法支援。更新使用手冊新增計算器特殊功能和 FAQ 連結操作說明。

### 改動

- calc-types.ts: 新增 `CalcLink` interface 和 `links` 欄位
- calc-seed.ts: 重寫購屋總費用（貸款欄位）、土地增值稅（連結型）、房地合一稅（自動推算）、重新排序
- ToolsClient.tsx: 新增 `NoteText`、`LinkCard` 元件，支援連結型計算器和備註連結
- FaqAccordionRenderer.tsx: 新增 `RichAnswer` 元件，解析 `[text](url)` 語法
- default-data.ts: FAQ Q3/Q6 答案加入連結語法
- ManualContent.tsx: 新增「計算器特殊功能」和「FAQ 答案加入連結」章節

### 影響評估
- 風險等級: Low
- 受影響功能: feature-015, feature-016
- 破壞性變更: No

---

## [feat: CMS 自動 seed + 孤兒程式碼清理] - 2026-07-30T22:00:00Z

### 變更類型

新增功能 + 程式碼清理

### 變更摘要

新增 CMS 頁面自動 seed 機制：首次部署時自動建立 6 個預設頁面（首頁、關於我們、服務項目、常見問題、聯絡我們、小工具）及 5 個頁面模板，使用 default-data.ts 的預設內容。同時清理被 CMS 取代的舊程式碼：刪除 6 個孤兒 API 路由（about、services、faqs、fees、flow、cms/migrate）、刪除 migrate-to-cms.ts、移除 db.ts 中 10 個不再使用的函式。

### 改動

- cms-db.ts: 新增 `seedCmsPages()` 函式（含模板 seed + 6 頁面含區塊 seed）
- db.ts: 在 `getDb()` 中呼叫 `seedCmsPages()`
- db.ts: 移除 `updateAbout`, `replaceServices`, `replaceServiceFlow`, `replaceFaqs`, `replaceFees`, `replaceFeeNotes`, `getServiceFlow`, `getFaqs`, `getFees`, `getFeeNotes`
- 刪除 `src/lib/migrate-to-cms.ts`
- 刪除 `src/app/api/admin/about/route.ts`
- 刪除 `src/app/api/admin/services/route.ts`
- 刪除 `src/app/api/admin/faqs/route.ts`
- 刪除 `src/app/api/admin/fees/route.ts`
- 刪除 `src/app/api/admin/flow/route.ts`
- 刪除 `src/app/api/admin/cms/migrate/route.ts`

### 影響評估
- 風險等級: Medium
- 受影響功能: feature-004, feature-011
- 破壞性變更: Yes（移除 6 個 API endpoint，但均為孤兒未被前端呼叫）

---

## [feat: DB 驅動計算器系統] - 2026-07-30T18:00:00Z

### 變更類型

新功能

### 變更摘要

將 6 個硬編碼試算器轉為 SQLite + JSON blob 驅動的動態系統。新增 S-expression 公式引擎（支援 +, -, *, /, pow, round, abs, min, max, if, 比較運算, tiered 累進稅率, and, or, not）。前端 ToolsClient 從 505 行硬編碼重寫為 ~170 行泛用渲染器。後台新增「小工具」tab，提供計算器 CRUD 管理介面（輸入欄位、公式、結果顯示、總計列編輯器）。

### 改動

- 新增 calc-types.ts / calc-engine.ts / calc-seed.ts / calc-db.ts（計算器核心）
- 新增 CalcEditor.tsx（後台計算器管理介面）
- 新增 /api/calculators 和 /api/admin/calculators API
- 重寫 ToolsClient.tsx（硬編碼 → 動態渲染）
- 修改 db.ts 整合 calculators 表初始化
- AdminClient.tsx 新增「小工具」tab

---

## [fix: 前端動態設定、PNG 透明、Admin 圖片 UX] - 2026-07-30T12:00:00Z

### 變更類型

修復 + 增強

### 變更摘要

修正圖片管理與前端顯示的多項問題。前端 Header/Footer/HeroSection/AboutPreview 從硬編碼改為動態讀取 DB settings。PNG 裁切保留透明背景。Admin 佔位符邏輯修正（上傳後不再重複顯示、刪除後正確恢復）。Logo SSR hydration 競態修正。新增 Logo 大小設定與自由裁切。移除 admin UI 中的 key: xxx 技術資訊。

### 改動

- Header/Footer/HeroSection/AboutPreview 改為動態讀取 settings（名稱、電話）
- layout.tsx 傳入 siteName/phone/logoSize 到 Header
- AdminClient: PNG 偵測與保留、imageTimestamps 初始化與刪除清除、佔位符條件修正、移除 key 顯示、logoSize UI、裁切比例選擇器、自由裁切
- Header: useCallback ref 修正 SSR hydration、LOGO_SIZES 對應
- default-data.ts: SiteSettings 新增 logoSize
- images/[key]/route.ts: Cache-Control 加 must-revalidate

### 影響評估

- 風險等級: Low
- 受影響功能: feature-012
- 破壞性變更: No

---

## [feat: 圖片庫 + 使用手冊 + 編輯器提示] - 2026-07-30T00:00:00Z

### 變更類型

新增功能

### 變更摘要

三大後台功能：(1) 圖片庫 — 將固定 11 個 key/3 個硬編碼群組改為資料庫驅動的動態群組與欄位系統，使用者可自由新增/編輯/刪除群組和圖片欄位，系統圖片受保護；(2) 使用手冊 — 後台新增「使用手冊」tab，含 4 大章節 10 個子頁面的操作說明；(3) 區塊編輯器提示 — 區塊選擇器按鈕顯示描述文字，區塊標頭旁加 info icon tooltip。

### 改動

- `src/lib/db.ts` — 新增 image_groups / image_slots 表、seedImageLibrary()、ImageGroup/ImageSlot 型別、15+ CRUD 函式
- `src/app/api/admin/images/route.ts` — GET 回傳結構化資料（groups+slots+images），移除 ALLOWED_KEYS 改為 isValidImageKey()
- `src/app/api/admin/hero-config/route.ts` — 移除硬編碼 ALLOWED_KEYS，改為 getBackgroundSlotKeys() 動態查詢
- `src/app/api/admin/image-groups/route.ts` — 新增群組 CRUD API
- `src/app/api/admin/image-slots/route.ts` — 新增欄位 CRUD API
- `src/app/admin/AdminClient.tsx` — 移除 IMAGE_GROUPS/IMAGE_SLOTS 常數，改為動態 API 驅動；新增群組/欄位 CRUD UI；新增「使用手冊」tab
- `src/app/admin/ManualContent.tsx` — 新增使用手冊元件（側邊欄導航 + 內容）
- `src/app/admin/PageBuilder.tsx` — 新增 BLOCK_TYPE_HINTS（19 種區塊描述）、區塊選擇器顯示提示文字、區塊標頭 info icon tooltip

### 影響評估

- 風險等級: Low
- 受影響功能: feature-012, feature-013, feature-014
- 破壞性變更: No

---

## [feat(cms): Phase 4 整合 — 動態導覽列、舊頁面清理] - 2026-07-29T00:00:00Z

### 變更類型

功能修改

### 變更摘要

CMS 整合最後階段：Header/Footer 改為從 CMS 動態讀取導覽項目（頁面+自訂連結），支援頁面排序與顯示/隱藏切換。新增自訂導覽連結功能（支援內部/外部 URL）。刪除舊的靜態頁面路由（about、services、faq、contact），改由 CMS `[slug]` 動態路由處理。AdminClient 移除舊分頁（about/services/fees/faqs/flow），僅保留頁面管理、基本資訊、圖片管理。FAQ 頁面自動產生 FAQPage JSON-LD 結構化資料。

### 改動

- `src/lib/cms-types.ts` — 新增 NavItem.isExternal、NavLink interface
- `src/lib/cms-db.ts` — 新增 nav_links 表、reorderPages()、NavLink CRUD、getNavItems()
- `src/app/[slug]/page.tsx` — SKIP_SLUGS、FAQ JSON-LD、CMS 動態渲染
- `src/app/admin/PageBuilder.tsx` — 頁面排序 UI、導覽切換、自訂連結管理
- `src/app/admin/AdminClient.tsx` — 移除 5 個舊分頁及所有相關程式碼（-723 行）
- `src/components/layout/Header.tsx` — 改為 navItems prop 動態渲染
- `src/components/layout/Footer.tsx` — 從 CMS 讀取動態導覽
- `src/app/layout.tsx` — 傳入 CMS navItems
- `src/app/api/admin/cms/pages/reorder/route.ts` — 新增頁面排序 API
- `src/app/api/admin/cms/nav-links/route.ts` — 新增自訂連結 CRUD API
- 刪除 `src/app/about/page.tsx`、`services/page.tsx`、`faq/page.tsx`、`contact/page.tsx`

### 影響評估

- 風險等級: Medium
- 受影響功能: feature-011 (CMS), feature-004 (後台管理)
- 破壞性變更: Yes（舊靜態路由已刪除，由 CMS 接管）

---

## [fix: 後台圖片預覽修正] - 2026-07-27T00:00:00Z

### 變更類型

Bug 修復

### 修改描述

修正後台圖片管理預覽問題：背景圖 default 模式下不顯示預覽圖、非背景圖欄位有預設圖時仍顯示「尚無圖片」。改為所有非 color 模式都顯示預覽，fallback placeholder 只在無預設圖時才出現。

### 修改檔案

- `src/app/admin/AdminClient.tsx`
    - 圖片預覽條件從 `mode === "image"` 改為 `mode !== "color"`
    - 上傳按鈕同步調整
    - fallback placeholder 改為只在 `!DEFAULT_IMAGES[key]` 時顯示

---

## [mod-004: 預設圖片系統與事務所照片展示] - 2026-07-27T00:00:00Z

### 變更類型

功能增強

### 目標功能

feature-006 (圖片管理)

### 修改描述

建立預設圖片系統：heyids-photo 搬至 public/defaults/（英文命名）、所有頁面背景補上 Unsplash placeholder。新增首頁「事務所環境」照片展示區。所有圖片欄位支援 DB → 預設圖 → 漸層三層 fallback。後台新增事務所照片管理群組。

### 修改檔案

- `public/defaults/` — 12 張預設圖（英文命名）
- `heyids-photo/` — 已刪除（移至 public/defaults/）
- `src/lib/default-images.ts` — 預設圖片映射
- `src/components/sections/OfficeGallery.tsx` — 首頁照片展示區
- `src/app/page.tsx` — 加入 OfficeGallery
- `src/components/common/PageHero.tsx` — fallback 邏輯
- `src/components/sections/HeroSection.tsx` — fallback 邏輯
- `src/app/about/page.tsx` — 代書照片 fallback
- `src/components/layout/Header.tsx` — Logo hidden by default
- `src/app/admin/AdminClient.tsx` — 事務所照片群組 + 預設圖預覽
- `src/app/api/admin/images/route.ts` — 新增 3 個 key

### 影響評估

- 風險等級: Low
- 破壞性變更: No

---

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
