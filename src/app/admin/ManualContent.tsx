"use client";

import React, { useState } from "react";

type TabKey = "pages" | "settings" | "images" | "calculators" | "manual";

interface ManualContentProps {
  onNavigate?: (tab: TabKey) => void;
}

interface Section {
  id: string;
  title: string;
  subsections: { id: string; title: string; content: React.ReactNode }[];
}

function StepBox({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 my-3">
      <ol className="list-none pl-0 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="shrink-0 w-6 h-6 rounded-full bg-amber-800 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
            <span className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: step }} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function TipBox({ children, type = "tip" }: { children: React.ReactNode; type?: "tip" | "warning" | "info" }) {
  const styles = {
    tip: "bg-amber-50 border-amber-200",
    warning: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };
  const icons = { tip: "💡", warning: "⚠️", info: "ℹ️" };
  const labels = { tip: "小提示", warning: "注意", info: "說明" };
  return (
    <div className={`rounded-lg border p-3 text-sm my-3 ${styles[type]}`}>
      <strong>{icons[type]} {labels[type]}：</strong>{children}
    </div>
  );
}

function TabLink({ tab, label, onNavigate }: { tab: TabKey; label: string; onNavigate?: (tab: TabKey) => void }) {
  if (!onNavigate) return <strong>{label}</strong>;
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab)}
      className="text-amber-800 underline underline-offset-2 decoration-amber-300 hover:text-amber-900 hover:decoration-amber-500 font-medium transition-colors cursor-pointer"
    >
      {label}
    </button>
  );
}

function buildSections(onNavigate?: (tab: TabKey) => void): Section[] {
  return [
    {
      id: "overview",
      title: "系統總覽",
      subsections: [
        {
          id: "overview-intro",
          title: "後台介紹",
          content: (
            <>
              <p>後台管理系統讓你可以自己更新網站內容，不需要找工程師。主要功能分為五個頁籤：</p>
              <ul>
                <li><TabLink tab="pages" label="頁面管理" onNavigate={onNavigate} /> — 編輯每個頁面的內容、新增自訂頁面和導覽連結</li>
                <li><TabLink tab="settings" label="基本資訊" onNavigate={onNavigate} /> — 修改事務所名稱、電話、地址等聯絡資訊</li>
                <li><TabLink tab="images" label="圖片管理" onNavigate={onNavigate} /> — 上傳和更換網站上的所有圖片</li>
                <li><TabLink tab="calculators" label="小工具" onNavigate={onNavigate} /> — 管理前台的試算計算器</li>
                <li><strong>使用手冊</strong> — 就是你現在看的這裡</li>
              </ul>
              <TipBox>大部分修改都會即時反映在網站前台。但背景圖模式和排序的修改需要點擊「儲存」才會生效。</TipBox>
            </>
          ),
        },
        {
          id: "overview-login",
          title: "登入方式",
          content: (
            <>
              <p>在網址後方加上 <code>/admin</code> 即可進入後台登入頁面。使用管理員帳號密碼登入後，登入狀態維持 24 小時。</p>
              <TipBox type="warning">請勿將帳號密碼分享給無關人員，也不要在公用電腦上勾選「記住密碼」。</TipBox>
            </>
          ),
        },
      ],
    },
    {
      id: "pages",
      title: "頁面管理",
      subsections: [
        {
          id: "pages-list",
          title: "頁面列表",
          content: (
            <>
              <p>進入「<TabLink tab="pages" label="頁面管理" onNavigate={onNavigate} />」後會看到所有頁面的列表。每個頁面可以看到：</p>
              <ul>
                <li><strong>標題</strong> — 頁面名稱，例如「首頁」「服務項目」</li>
                <li><strong>路徑</strong> — 網址路徑，例如 <code>/about</code></li>
                <li><strong>狀態</strong> — <span className="text-green-600">已發布</span> 表示前台看得到，<span className="text-stone-400">草稿</span> 表示只有後台能看到</li>
                <li><strong>導覽列</strong> — 「顯示」代表這個頁面會出現在網站最上方的選單裡</li>
              </ul>
              <p>標有「系統」的頁面是內建頁面，無法刪除但可以編輯內容。</p>
            </>
          ),
        },
        {
          id: "pages-edit",
          title: "編輯頁面內容",
          content: (
            <>
              <p>點擊頁面旁的「編輯」按鈕，進入頁面編輯器。頁面的內容由多個「區塊」堆疊而成，你可以：</p>
              <ul>
                <li><strong>新增區塊</strong> — 點擊區塊之間的「+」按鈕，選擇要加入的區塊類型</li>
                <li><strong>編輯區塊</strong> — 直接在區塊中修改文字、圖片等內容</li>
                <li><strong>移動區塊</strong> — 用區塊右上角的 ▲▼ 箭頭調整上下順序</li>
                <li><strong>刪除區塊</strong> — 點擊區塊右上角的「✕」按鈕</li>
              </ul>
              <TipBox>每個「+」按鈕旁邊都有簡短的區塊說明，可以幫你判斷哪個類型適合你的需求。</TipBox>
            </>
          ),
        },
        {
          id: "pages-icons",
          title: "如何為服務加圖示",
          content: (
            <>
              <p>服務項目頁面使用「項目列表」區塊來顯示各項服務。你可以幫每個服務加上 emoji 圖示，讓頁面更好辨識：</p>
              <StepBox steps={[
                "到<strong>頁面管理</strong> → 找到「服務項目」頁面 → 點擊<strong>「編輯」</strong>",
                "找到「項目列表」區塊（就是列出各項服務的那個區塊）",
                "每個項目的標題左邊有一個 emoji 輸入欄，點擊它",
                "輸入一個 emoji 表情符號（例如 🏠），或從手機鍵盤選擇",
                "所有項目都填好後，點擊頁面頂部的<strong>「儲存頁面」</strong>按鈕",
              ]} />
              <TipBox type="warning">修改完圖示後一定要按<strong>「儲存頁面」</strong>才會生效！如果沒有按儲存就離開，修改會遺失。</TipBox>
              <TipBox type="info">建議的 emoji 對應：🏠 不動產買賣、🌳 繼承登記、🤲 贈與登記、🔐 抵押權、🧾 房地合一稅、⚖️ 共有物分割、🏛 信託登記、📈 節稅規劃、💬 諮詢</TipBox>
            </>
          ),
        },
        {
          id: "pages-create",
          title: "建立新頁面",
          content: (
            <>
              <p>想要新增一個全新的頁面：</p>
              <StepBox steps={[
                "在頁面管理列表的右上角，點擊<strong>「建立新頁面」</strong>",
                "填入<strong>頁面路徑</strong>（英文小寫，例如 <code>pricing</code>，訪客會透過 <code>/p/pricing</code> 進入這個頁面）",
                "填入<strong>頁面標題</strong>（中文名稱，例如「收費標準」）",
                "選擇是否要套用模板（模板會幫你預先放好一些區塊），或留空從空白頁面開始",
                "點擊「建立」後，會自動進入編輯器讓你開始編輯內容",
              ]} />
            </>
          ),
        },
        {
          id: "pages-nav",
          title: "導覽連結管理",
          content: (
            <>
              <p>網站最上方的選單（導覽列）會顯示哪些連結，可以透過兩種方式控制：</p>

              <h4>方式一：讓頁面出現在導覽列</h4>
              <p>在頁面列表中，每個頁面的「導覽列」欄位可以切換「顯示」或「隱藏」。設為「顯示」的頁面會出現在網站上方選單中。</p>

              <h4>方式二：新增自訂連結</h4>
              <p>如果想在導覽列加入外部連結（例如 LINE 官方帳號、Google 表單等），可以使用「自訂導覽連結」：</p>
              <StepBox steps={[
                "在頁面管理列表的<strong>最下方</strong>，找到「自訂導覽連結」區域，點擊<strong>「展開」</strong>",
                "點擊<strong>「新增連結」</strong>按鈕",
                "填入<strong>顯示文字</strong>（例如「LINE 諮詢」）和<strong>連結網址</strong>（例如 LINE 的網址）",
                "點擊「儲存」後，連結會出現在<strong>網站上方導覽列的最右邊</strong>",
              ]} />
              <TipBox type="info">自訂連結會顯示在導覽列中所有頁面連結的後方（最右邊）。如果想調整位置，可以透過排序功能來移動。連結可以設定為在新分頁開啟，適合用於外部網站連結。</TipBox>
            </>
          ),
        },
        {
          id: "pages-faq-links",
          title: "FAQ 答案加入連結",
          content: (
            <>
              <p>在常見問題（FAQ）區塊中，答案文字支援加入可點擊的連結。使用方式：</p>
              <StepBox steps={[
                "在 FAQ 答案的文字中，用 <code>[顯示文字](網址)</code> 的格式加入連結",
                "例如：<code>請參考本所[收費標準](/services)頁面</code>",
                "或外部連結：<code>歡迎加入我們的[官方 LINE 帳號](https://lin.ee/pgsUFs6)</code>",
                "儲存後，前台會把 <code>[收費標準]</code> 顯示為可點擊的橘色連結",
              ]} />
              <TipBox type="info">站內連結用 <code>/路徑</code>（例如 <code>/services</code>），外部連結用完整網址（例如 <code>https://line.me/...</code>）。外部連結會在新分頁中開啟。</TipBox>
            </>
          ),
        },
        {
          id: "pages-google-form",
          title: "使用 Google 表單",
          content: (
            <>
              <p>如果你已經有 Google 表單，可以直接嵌入到聯絡頁面中取代內建表單：</p>
              <StepBox steps={[
                "到<strong>頁面管理</strong> → 找到「聯絡我們」頁面 → 點擊<strong>「編輯」</strong>",
                "找到「聯絡雙欄」或「聯絡表單」區塊",
                "在區塊編輯器中找到 <strong>「Google 表單網址」</strong> 欄位",
                "貼上你的 Google 表單網址（例如 <code>https://docs.google.com/forms/d/e/.../viewform?embedded=true</code>）",
                "儲存後前台就會顯示 Google 表單取代內建的聯絡表單",
              ]} />
              <TipBox>如果把 Google 表單網址欄位清空，就會恢復使用內建表單。建議使用 Google 表單的「嵌入」版本網址（網址末尾加 <code>?embedded=true</code>）效果更好。</TipBox>
            </>
          ),
        },
        {
          id: "pages-links",
          title: "實用連結頁面",
          content: (
            <>
              <p>「實用連結」頁面使用「項目列表」區塊來展示外部連結卡片。每個項目可以設定連結網址：</p>
              <StepBox steps={[
                "到<strong>頁面管理</strong> → 找到「實用連結」頁面 → 點擊<strong>「編輯」</strong>",
                "找到「項目列表」區塊，每個項目下方有一個<strong>「連結網址」</strong>欄位",
                "填入完整網址（例如 <code>https://lvr.land.moi.gov.tw/</code>）",
                "有連結的項目在前台會變成可點擊的卡片，右上角顯示 ↗ 箭頭",
              ]} />
              <TipBox type="info">連結網址是選填的。沒填連結的項目會顯示為普通卡片（帶序號）。這個功能可以在任何使用「項目列表」的頁面使用，不限於實用連結頁面。</TipBox>
            </>
          ),
        },
        {
          id: "pages-blocks",
          title: "區塊類型總覽",
          content: (
            <>
              <p>以下是所有可以使用的區塊類型：</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="py-2 pr-4 text-left font-semibold">區塊類型</th>
                      <th className="py-2 text-left font-semibold">用途說明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="py-2 pr-4 font-medium">頁面橫幅</td><td className="py-2">頁面最頂部的大圖區域，放標題和副標題</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">標題文字</td><td className="py-2">獨立標題，可選大中小三種尺寸</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">內文段落</td><td className="py-2">一般的文字內容</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">圖片 / 圖片集</td><td className="py-2">放單張圖或多張圖的區域</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">列表</td><td className="py-2">條列式內容（圓點、編號、勾選、標籤）</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">項目列表</td><td className="py-2">帶標題和說明的項目卡片，可加 emoji 圖示</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">表格</td><td className="py-2">有欄位標題的表格，適合收費標準等</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">常見問題</td><td className="py-2">點擊問題展開答案的 FAQ 區塊（答案支援連結語法）</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">步驟流程</td><td className="py-2">有順序的流程圖，適合服務流程說明</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">聯絡表單</td><td className="py-2">讓訪客填寫的聯絡表單</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">地圖嵌入</td><td className="py-2">Google 地圖</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">聯絡資訊</td><td className="py-2">自動帶入「基本資訊」中的電話、地址等</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">行動呼籲</td><td className="py-2">醒目的按鈕區塊，引導訪客採取行動</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">數據條</td><td className="py-2">數字指標展示（如「10+ 年經驗」）</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">個人簡介</td><td className="py-2">照片 + 介紹 + 引言的人物卡片</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">雙欄清單</td><td className="py-2">左右兩組並排的內容</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">聯絡雙欄</td><td className="py-2">左邊表單 + 右邊聯絡資訊和地圖</td></tr>
                    <tr><td className="py-2 pr-4 font-medium">自訂 HTML</td><td className="py-2">進階用途，可以貼入自訂程式碼</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          ),
        },
      ],
    },
    {
      id: "images",
      title: "圖片管理",
      subsections: [
        {
          id: "images-upload",
          title: "上傳與更換圖片",
          content: (
            <>
              <p>每張圖片都有一個預留的欄位，上傳步驟：</p>
              <StepBox steps={[
                "在<strong>圖片管理</strong>頁籤中，找到你要更換的圖片欄位",
                "點擊<strong>「上傳圖片」</strong>按鈕，選擇圖片檔案",
                "在裁切視窗中拖曳和縮放，調整到滿意的範圍",
                "點擊<strong>「確認裁切」</strong>完成上傳",
              ]} />
              <p>支援的格式：PNG、JPG、WebP、GIF，最大 5MB。</p>
              <TipBox>建議使用高解析度的原始圖片。背景圖建議至少 1920px 寬，才不會在大螢幕上模糊。</TipBox>
            </>
          ),
        },
        {
          id: "images-groups",
          title: "圖片群組",
          content: (
            <>
              <p>圖片以群組分類管理，預設有三個群組：</p>
              <ul>
                <li><strong>網站通用</strong> — Logo、代書照片等全站共用圖片</li>
                <li><strong>首頁事務所照片</strong> — 首頁環境展示區的照片</li>
                <li><strong>頁面背景圖</strong> — 每個頁面最上方橫幅區域的背景圖</li>
              </ul>
              <p>帶有 🔒 標記的是系統圖片欄位，不能刪除但可以更換圖片。你也可以自己新增群組和圖片欄位。</p>
            </>
          ),
        },
        {
          id: "images-hero",
          title: "背景圖顯示模式",
          content: (
            <>
              <p>頁面頂部的背景有三種模式可以選擇：</p>
              <ul>
                <li><strong>預設漸層</strong> — 不需要圖片，使用預設的顏色漸層</li>
                <li><strong>背景圖</strong> — 顯示你上傳的照片</li>
                <li><strong>純色</strong> — 使用單一顏色，可以自訂色碼</li>
              </ul>
              <TipBox>修改模式後記得點擊「儲存」。可以先點「預覽全部頁面」確認效果再儲存。</TipBox>
            </>
          ),
        },
      ],
    },
    {
      id: "calculators",
      title: "小工具",
      subsections: [
        {
          id: "calc-overview",
          title: "計算器管理",
          content: (
            <>
              <p>「<TabLink tab="calculators" label="小工具" onNavigate={onNavigate} />」頁籤管理網站前台的試算計算器。系統預設了 6 個計算器：</p>
              <ul>
                <li>購屋總費用試算、土地增值稅試算、房地合一稅試算</li>
                <li>房貸試算表、契稅試算、貸款負擔能力試算</li>
              </ul>
              <p>你可以：</p>
              <ul>
                <li><strong>隱藏 / 顯示</strong> — 暫時不想讓訪客看到某個計算器，點「隱藏」即可</li>
                <li><strong>編輯</strong> — 修改計算器的名稱、圖示、輸入欄位和公式</li>
                <li><strong>新增</strong> — 建立全新的自訂計算器</li>
                <li><strong>刪除</strong> — 只有自訂的計算器可以刪除，系統預設的不能刪</li>
              </ul>
            </>
          ),
        },
        {
          id: "calc-edit",
          title: "編輯計算器",
          content: (
            <>
              <p>點擊計算器旁的「編輯」進入編輯器，可以修改：</p>
              <ul>
                <li><strong>圖示</strong> — 點擊左上角的 emoji 區域，會彈出選擇面板</li>
                <li><strong>名稱和說明</strong> — 計算器的標題和描述文字</li>
                <li><strong>輸入欄位</strong> — 訪客需要填入的資料（數字、下拉選單、勾選框）</li>
                <li><strong>計算公式</strong> — 用 JSON 格式定義運算邏輯</li>
                <li><strong>結果顯示</strong> — 計算結果要顯示哪些數值</li>
              </ul>
              <TipBox type="warning">修改公式需要了解 JSON 語法。如果不確定怎麼寫，建議參考現有計算器的公式格式，或請工程師協助。</TipBox>
            </>
          ),
        },
        {
          id: "calc-features",
          title: "計算器特殊功能",
          content: (
            <>
              <h4>連結型計算器</h4>
              <p>有些稅額試算過於複雜（例如土地增值稅），可以設定為「連結型」計算器。這類計算器不顯示輸入欄位和公式，改為顯示外部試算連結，引導訪客前往政府官方網站計算。</p>
              <TipBox type="info">連結型計算器的設定方式：將輸入欄位和公式都清空，並在「外部連結」欄位填入連結文字和網址。</TipBox>

              <h4>條件顯示欄位</h4>
              <p>結果欄位可以設定「顯示條件」，只在特定情況下才顯示。例如購屋總費用試算中的「貸款設定費」和「設定規費」，只有在勾選「是否需要貸款」時才會顯示。</p>

              <h4>自動推算欄位</h4>
              <p>某些欄位不需要訪客手動輸入，系統會根據公式自動推算。例如房地合一稅試算中的「推計費用」會自動以售價 × 3%（上限 30 萬）計算，訪客只需要看結果即可。</p>

              <h4>備註與連結</h4>
              <p>計算結果下方可以加入備註文字。備註中如果包含網址（<code>https://...</code>），會自動顯示為可點擊的「前往試算」連結，方便訪客前往政府網站做更精確的計算。</p>
            </>
          ),
        },
        {
          id: "calc-reorder",
          title: "調整計算器順序",
          content: (
            <>
              <p>前台的計算器顯示順序，可以在小工具列表中直接調整：</p>
              <StepBox steps={[
                "到<strong>小工具</strong>頁籤，會看到所有計算器的列表",
                "每個計算器左邊都有 <strong>▲▼</strong> 箭頭按鈕",
                "點擊 <strong>▲</strong> 將該計算器上移一格，點擊 <strong>▼</strong> 下移一格",
                "排序會<strong>即時儲存</strong>，前台會立刻反映新順序",
              ]} />
              <TipBox type="info">最上面的計算器無法再上移，最下面的無法再下移（按鈕會變灰色）。</TipBox>
            </>
          ),
        },
      ],
    },
    {
      id: "settings",
      title: "基本資訊",
      subsections: [
        {
          id: "settings-edit",
          title: "修改聯絡資訊",
          content: (
            <>
              <p>「<TabLink tab="settings" label="基本資訊" onNavigate={onNavigate} />」頁籤可以修改事務所的基本資料：</p>
              <ul>
                <li><strong>名稱</strong> — 顯示在網站標題、頁首和頁尾</li>
                <li><strong>電話 / 手機</strong> — 顯示在聯絡資訊區和頁尾</li>
                <li><strong>電子郵件</strong> — 訪客聯絡表單的收件地址</li>
                <li><strong>LINE ID / 連結</strong> — LINE 官方帳號資訊</li>
                <li><strong>地址</strong> — 事務所地址，會顯示在聯絡頁面</li>
                <li><strong>代書姓名 / 證照號碼</strong> — 顯示在關於我們頁面</li>
              </ul>
              <p>修改後點擊「儲存」。這些資訊會自動帶入所有使用「聯絡資訊」區塊的頁面，不用一個一個改。</p>
            </>
          ),
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "故障排查",
      subsections: [
        {
          id: "ts-overview",
          title: "遇到問題怎麼辦",
          content: (
            <>
              <p>網站出問題時，先判斷問題出在哪一層，才知道該找誰處理：</p>
              <ul>
                <li><strong>前端問題</strong> — 畫面顯示異常、按鈕沒反應、樣式跑掉 → 用<strong>瀏覽器開發者工具</strong>檢查</li>
                <li><strong>後端問題</strong> — 儲存失敗、資料沒更新、頁面 500 錯誤 → 用 <strong>Docker logs</strong> 檢查</li>
                <li><strong>環境問題</strong> — 網站完全打不開、連線逾時 → 檢查 Docker 容器是否正常運行</li>
              </ul>
              <TipBox type="info">把錯誤訊息截圖或複製下來再回報給工程師，能大幅加快問題排查速度。</TipBox>
            </>
          ),
        },
        {
          id: "ts-browser",
          title: "瀏覽器開發者工具",
          content: (
            <>
              <p>瀏覽器內建的開發者工具可以幫你看到前端的錯誤訊息和網路請求狀態。</p>

              <h4>開啟方式</h4>
              <StepBox steps={[
                "在網頁上按 <strong>F12</strong>（或 Mac 按 <code>Cmd + Option + I</code>）",
                "畫面右側或下方會出現開發者工具面板",
                "主要會用到兩個分頁：<strong>Console（主控台）</strong>和<strong>Network（網路）</strong>",
              ]} />

              <h4>Console（主控台）— 看前端錯誤</h4>
              <p>Console 會顯示網頁執行時的錯誤訊息。常見的有：</p>
              <ul>
                <li><span className="text-red-600 font-mono text-xs">紅色訊息</span> — 程式錯誤（Error），例如找不到某個元件、資料格式不對</li>
                <li><span className="text-amber-600 font-mono text-xs">黃色訊息</span> — 警告（Warning），不影響功能但可能有潛在問題</li>
                <li><span className="font-mono text-xs">白色/灰色訊息</span> — 一般的記錄資訊，通常可以忽略</li>
              </ul>
              <TipBox>如果畫面壞掉或按鈕沒反應，打開 Console 看有沒有紅色錯誤。把錯誤訊息複製起來給工程師，就能快速定位問題。</TipBox>

              <h4>Network（網路）— 看 API 請求</h4>
              <p>Network 分頁可以看到網頁對伺服器發出的所有請求。重點看：</p>
              <ul>
                <li><strong>狀態碼 200</strong> — 正常</li>
                <li><strong>狀態碼 401 / 403</strong> — 登入過期或權限不足，重新登入即可</li>
                <li><strong>狀態碼 404</strong> — 找不到資料，可能是頁面或圖片被刪除了</li>
                <li><strong>狀態碼 500</strong> — 伺服器內部錯誤，屬於程式問題，需通知工程師</li>
              </ul>
              <StepBox steps={[
                "打開 Network 分頁，然後<strong>重新操作一次</strong>出問題的動作",
                "觀察列表中有沒有<span class='text-red-600 font-semibold'>紅色</span>的請求",
                "點擊紅色的請求，切到 <strong>Response</strong> 分頁，可以看到伺服器回傳的錯誤細節",
              ]} />
            </>
          ),
        },
        {
          id: "ts-docker",
          title: "Docker 容器日誌",
          content: (
            <>
              <p>後端程式的錯誤會記錄在 Docker 容器的日誌裡。需要用指令查看：</p>

              <h4>查看即時日誌</h4>
              <p>在伺服器的專案目錄下執行：</p>
              <pre className="bg-stone-800 text-stone-100 rounded-lg p-4 text-sm overflow-x-auto my-3"><code>docker compose logs -f app</code></pre>
              <p>這會持續顯示最新的日誌。按 <code>Ctrl + C</code> 停止。</p>

              <h4>查看最近的日誌（不持續追蹤）</h4>
              <pre className="bg-stone-800 text-stone-100 rounded-lg p-4 text-sm overflow-x-auto my-3"><code>{`# 最近 100 行
docker compose logs --tail 100 app

# 最近 30 分鐘
docker compose logs --since 30m app

# nginx 日誌（看連線和轉發問題）
docker compose logs --tail 50 nginx`}</code></pre>

              <h4>日誌中的關鍵字</h4>
              <ul>
                <li><strong className="text-red-600">Error / ERR</strong> — 程式錯誤，需要處理</li>
                <li><strong className="text-amber-600">WARN</strong> — 警告，可能需要注意</li>
                <li><strong>GET / POST / PUT / DELETE</strong> — API 請求記錄，正常現象</li>
                <li><strong>SQLITE_ERROR</strong> — 資料庫錯誤，可能是 DB 檔案損壞或權限問題</li>
                <li><strong>ECONNREFUSED</strong> — 連線被拒，服務可能沒有正常啟動</li>
              </ul>
              <TipBox type="warning">如果日誌中大量出現 <code>SQLITE_BUSY</code> 或 <code>database is locked</code>，可能是多個程序同時寫入資料庫。重啟容器通常可以解決：<code>docker compose restart app</code></TipBox>
            </>
          ),
        },
        {
          id: "ts-container",
          title: "確認容器狀態",
          content: (
            <>
              <p>如果網站完全打不開，先確認 Docker 容器是否正常：</p>
              <pre className="bg-stone-800 text-stone-100 rounded-lg p-4 text-sm overflow-x-auto my-3"><code>docker compose ps</code></pre>
              <p>正常狀態下應該看到：</p>
              <ul>
                <li><strong>app</strong> — 狀態為 <code>Up</code>（程式主服務）</li>
                <li><strong>nginx</strong> — 狀態為 <code>Up</code>（反向代理，負責對外連線）</li>
              </ul>

              <h4>常見異常與處理</h4>
              <ul>
                <li><strong>容器狀態 Exit / Restarting</strong> — 程式崩潰，查日誌找原因：<code>docker compose logs --tail 50 app</code></li>
                <li><strong>容器不存在</strong> — 需要啟動：<code>docker compose up -d</code></li>
                <li><strong>nginx Up 但 app Exit</strong> — 只有反向代理活著，訪客會看到 502 錯誤。修復 app 即可</li>
              </ul>

              <h4>重啟服務</h4>
              <pre className="bg-stone-800 text-stone-100 rounded-lg p-4 text-sm overflow-x-auto my-3"><code>{`# 重啟所有服務
docker compose restart

# 只重啟程式（不影響 nginx）
docker compose restart app

# 完全重建（程式有更新時）
docker compose up -d --build`}</code></pre>
              <TipBox>重啟不會丟失資料，資料庫和圖片都存在 Docker volume 裡面。</TipBox>
            </>
          ),
        },
        {
          id: "ts-common",
          title: "常見問題速查",
          content: (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="py-2 pr-4 text-left font-semibold">症狀</th>
                      <th className="py-2 pr-4 text-left font-semibold">可能原因</th>
                      <th className="py-2 text-left font-semibold">排查方向</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2 pr-4">網站完全打不開</td>
                      <td className="py-2 pr-4">容器未啟動、伺服器關機</td>
                      <td className="py-2"><code>docker compose ps</code> 確認容器狀態</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">顯示 502 Bad Gateway</td>
                      <td className="py-2 pr-4">app 容器崩潰，nginx 還在運行</td>
                      <td className="py-2"><code>docker compose logs --tail 50 app</code></td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">後台儲存按鈕沒反應</td>
                      <td className="py-2 pr-4">前端 JS 錯誤、登入過期</td>
                      <td className="py-2">瀏覽器 F12 → Console 看紅色錯誤</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">儲存後內容沒更新</td>
                      <td className="py-2 pr-4">API 回傳 500、快取問題</td>
                      <td className="py-2">F12 → Network 看請求狀態碼；強制重整 <code>Ctrl+Shift+R</code></td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">圖片上傳失敗</td>
                      <td className="py-2 pr-4">檔案太大、格式不支援、磁碟空間不足</td>
                      <td className="py-2">確認檔案 &lt; 5MB 且為 PNG/JPG/WebP/GIF</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">新增的頁面前台看不到</td>
                      <td className="py-2 pr-4">狀態為草稿、未加入導覽列</td>
                      <td className="py-2">檢查頁面狀態是否為「已發布」、導覽列是否為「顯示」</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">登入後馬上被踢回登入頁</td>
                      <td className="py-2 pr-4">Cookie 被阻擋、登入 Token 過期</td>
                      <td className="py-2">清除瀏覽器 Cookie 後重新登入</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">計算器結果明顯不對</td>
                      <td className="py-2 pr-4">公式設定有誤</td>
                      <td className="py-2">後台編輯該計算器，檢查公式 JSON 格式是否正確</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <TipBox type="info">回報問題時，提供以下資訊能讓工程師最快定位問題：<br />1. 什麼時候發生的<br />2. 操作了什麼步驟<br />3. Console 紅色錯誤截圖（按 F12）<br />4. 或 <code>docker compose logs --tail 100 app</code> 的輸出</TipBox>
            </>
          ),
        },
      ],
    },
  ];
}

const QUICK_LINKS: { emoji: string; label: string; target: string; desc: string }[] = [
  { emoji: "📝", label: "編輯頁面內容", target: "pages-edit", desc: "修改文字、圖片、區塊" },
  { emoji: "🔗", label: "新增導覽連結", target: "pages-nav", desc: "在網站上方選單加連結" },
  { emoji: "🎨", label: "加服務圖示", target: "pages-icons", desc: "幫服務項目加 emoji" },
  { emoji: "📄", label: "建立新頁面", target: "pages-create", desc: "新增一個全新的頁面" },
  { emoji: "🖼️", label: "上傳圖片", target: "images-upload", desc: "更換網站上的照片" },
  { emoji: "🎯", label: "改背景圖", target: "images-hero", desc: "設定頁面頂部背景" },
  { emoji: "📞", label: "改聯絡資訊", target: "settings-edit", desc: "更新電話、地址等" },
  { emoji: "🧮", label: "管理計算器", target: "calc-overview", desc: "編輯前台試算工具" },
  { emoji: "❓", label: "FAQ 加連結", target: "pages-faq-links", desc: "在 FAQ 答案中加入連結" },
  { emoji: "↕️", label: "計算器排序", target: "calc-reorder", desc: "調整計算器顯示順序" },
  { emoji: "📋", label: "Google 表單", target: "pages-google-form", desc: "嵌入 Google 表單到聯絡頁" },
  { emoji: "🔗", label: "實用連結", target: "pages-links", desc: "管理外部連結卡片" },
  { emoji: "🛠", label: "故障排查", target: "ts-overview", desc: "網站出問題時怎麼處理" },
];

interface TimelineStep {
  icon: string;
  title: string;
  desc: string;
  target?: string;
  tab?: TabKey;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { icon: "📞", title: "更新基本資訊", desc: "確認事務所名稱、電話、地址、LINE 等聯絡資訊是否正確。", target: "settings-edit", tab: "settings" },
  { icon: "🖼️", title: "上傳圖片", desc: "更換 Logo、代書照片、事務所環境照和頁面背景圖。", target: "images-upload", tab: "images" },
  { icon: "📝", title: "編輯頁面內容", desc: "修改各頁面的文字、區塊內容，為服務項目加上 emoji 圖示。", target: "pages-edit", tab: "pages" },
  { icon: "🧮", title: "確認計算器", desc: "檢查試算工具的公式和顯示是否正確，調整顯示順序。", target: "calc-overview", tab: "calculators" },
  { icon: "🌐", title: "預覽確認", desc: "開啟前台瀏覽所有頁面，確認內容和圖片都正確顯示。" },
];

const NOTICES = [
  "修改頁面內容後，記得點擊「儲存頁面」按鈕才會生效。",
  "系統預設的頁面和計算器無法刪除，但可以自由編輯內容。",
  "圖片上傳限制 5MB，建議使用 JPG 或 WebP 格式。",
  "所有操作都可以隨時修改，不用擔心改錯。",
];

function WelcomeBanner() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-stone-700 to-amber-900 text-white px-6 py-5 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold mb-1">後台使用手冊</h1>
          <p className="text-sm text-white/80">合一地政士事務所 — 網站管理操作指南</p>
        </div>
        <span className="text-xs bg-white/20 rounded-full px-3 py-1">v2.0</span>
      </div>
    </div>
  );
}

function TimelineGuide({ onSelect, onNavigate }: { onSelect: (id: string) => void; onNavigate?: (tab: TabKey) => void }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🚀</span>
        <h2 className="text-base font-bold text-stone-800">快速入門</h2>
        <span className="text-xs text-stone-400 ml-1">第一次使用？照著這個流程走</span>
      </div>
      <div className="relative pl-8">
        <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-600 via-amber-400 to-stone-200" />
        {TIMELINE_STEPS.map((step, i) => (
          <div key={i} className="relative mb-5 last:mb-0">
            <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-amber-800 text-white text-sm flex items-center justify-center font-bold shadow-sm z-10">
              {step.icon}
            </div>
            <div className="ml-2">
              <h4 className="text-sm font-semibold text-stone-800 mb-0.5">
                {step.target ? (
                  <button
                    type="button"
                    onClick={() => onSelect(step.target!)}
                    className="text-amber-800 hover:text-amber-900 underline underline-offset-2 decoration-amber-300 hover:decoration-amber-500 transition-colors cursor-pointer"
                  >
                    {step.title}
                  </button>
                ) : step.title}
                {step.tab && onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(step.tab!)}
                    className="ml-2 text-xs text-stone-400 hover:text-amber-700 transition-colors"
                    title={`前往「${step.title}」`}
                  >
                    →前往
                  </button>
                )}
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticeCard() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚠️</span>
        <h3 className="text-sm font-bold text-stone-700">注意事項</h3>
      </div>
      <div className="space-y-2.5">
        {NOTICES.map((note, i) => (
          <p key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

function QuickIndex({ onSelect, onNavigate }: { onSelect: (id: string) => void; onNavigate?: (tab: TabKey) => void }) {
  const sections = buildSections(onNavigate);
  return (
    <div>
      <WelcomeBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <TimelineGuide onSelect={onSelect} onNavigate={onNavigate} />
        </div>
        <div>
          <NoticeCard />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-bold text-stone-800 mb-1">所有操作說明</h2>
        <p className="text-sm text-stone-500 mb-4">點擊下方卡片，快速找到你需要的操作說明。</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.target}
              onClick={() => onSelect(link.target)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center hover:bg-amber-50 hover:border-amber-200 transition group"
            >
              <span className="text-2xl">{link.emoji}</span>
              <span className="text-sm font-semibold text-stone-700 group-hover:text-amber-900">{link.label}</span>
              <span className="text-xs text-stone-400 leading-tight">{link.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-3">依章節瀏覽：</p>
        <div className="flex flex-wrap gap-2">
          {sections.flatMap(s => s.subsections).map(sub => (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className="text-xs text-stone-500 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded border border-stone-150 transition"
            >
              {sub.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManualContent({ onNavigate }: ManualContentProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = buildSections(onNavigate);
  const currentSubsection = activeSection ? sections.flatMap(s => s.subsections).find(sub => sub.id === activeSection) : null;
  const currentSectionTitle = activeSection ? sections.find(s => s.subsections.some(sub => sub.id === activeSection))?.title : null;

  if (!activeSection) {
    return <QuickIndex onSelect={setActiveSection} onNavigate={onNavigate} />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile section selector */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setActiveSection(null)}
          className="text-sm text-stone-500 hover:text-stone-700 mb-3"
        >
          &larr; 回到索引
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-700"
        >
          <span>{currentSectionTitle} &rsaquo; {currentSubsection?.title}</span>
          <svg className={`w-4 h-4 transition ${mobileMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {mobileMenuOpen && (
          <div className="mt-2 rounded-lg border border-stone-200 bg-white p-2 shadow-lg">
            {sections.map((section) => (
              <div key={section.id} className="mb-2">
                <div className="px-3 py-1 text-xs font-bold text-stone-400 uppercase tracking-wider">{section.title}</div>
                {section.subsections.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => { setActiveSection(sub.id); setMobileMenuOpen(false); }}
                    className={`w-full text-left rounded-md px-3 py-2 text-sm ${activeSection === sub.id ? "bg-amber-100 text-amber-900 font-medium" : "text-stone-600 hover:bg-stone-50"}`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-56 shrink-0">
        <nav className="sticky top-4 space-y-4">
          <button
            onClick={() => setActiveSection(null)}
            className="w-full text-left rounded-md px-3 py-1.5 text-sm text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition mb-2"
          >
            &larr; 回到索引
          </button>
          {sections.map((section) => (
            <div key={section.id}>
              <div className="px-3 py-1 text-xs font-bold text-stone-400 uppercase tracking-wider">{section.title}</div>
              <div className="mt-1 space-y-0.5">
                {section.subsections.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSection(sub.id)}
                    className={`w-full text-left rounded-md px-3 py-1.5 text-sm transition ${activeSection === sub.id ? "bg-amber-100 text-amber-900 font-medium" : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"}`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="prose prose-stone prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_p]:mb-3 [&_p]:leading-relaxed [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_table]:border-collapse [&_th]:text-left [&_td]:py-2">
          <h2 className="text-lg font-bold text-stone-800 mb-4">{currentSubsection?.title}</h2>
          {currentSubsection?.content}
        </div>
      </div>
    </div>
  );
}
