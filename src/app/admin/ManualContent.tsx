"use client";

import React, { useState } from "react";

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
  const labels = { tip: "小提示", warning: "注意", info: "說明" };
  return (
    <div className={`rounded-lg border p-3 text-sm my-3 ${styles[type]}`}>
      <strong>{labels[type]}：</strong>{children}
    </div>
  );
}

const SECTIONS: Section[] = [
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
              <li><strong>頁面管理</strong> — 編輯每個頁面的內容、新增自訂頁面和導覽連結</li>
              <li><strong>基本資訊</strong> — 修改事務所名稱、電話、地址等聯絡資訊</li>
              <li><strong>圖片管理</strong> — 上傳和更換網站上的所有圖片</li>
              <li><strong>小工具</strong> — 管理前台的試算計算器</li>
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
            <p>進入「頁面管理」後會看到所有頁面的列表。每個頁面可以看到：</p>
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
              "所有項目都填好後，點擊頁面底部的<strong>「儲存」</strong>",
            ]} />
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
              "填入<strong>頁面路徑</strong>（英文小寫，例如 <code>pricing</code>，訪客會透過 <code>/pricing</code> 進入這個頁面）",
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
              "或外部連結：<code>歡迎加入我們的[官方 LINE 帳號](https://line.me/R/ti/p/@240mvtlq)</code>",
              "儲存後，前台會把 <code>[收費標準]</code> 顯示為可點擊的橘色連結",
            ]} />
            <TipBox type="info">站內連結用 <code>/路徑</code>（例如 <code>/services</code>），外部連結用完整網址（例如 <code>https://line.me/...</code>）。外部連結會在新分頁中開啟。</TipBox>
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
              "在圖片管理頁籤中，找到你要更換的圖片欄位",
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
            <p>「小工具」頁籤管理網站前台的試算計算器。系統預設了 6 個計算器：</p>
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
            <p>「基本資訊」頁籤可以修改事務所的基本資料：</p>
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
];

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
];

function QuickIndex({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-stone-800 mb-1">使用手冊</h2>
      <p className="text-sm text-stone-500 mb-5">點擊下方卡片，快速找到你需要的操作說明。</p>
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
      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 mb-3">所有章節：</p>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.flatMap(s => s.subsections).map(sub => (
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

export default function ManualContent() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentSubsection = activeSection ? SECTIONS.flatMap(s => s.subsections).find(sub => sub.id === activeSection) : null;
  const currentSectionTitle = activeSection ? SECTIONS.find(s => s.subsections.some(sub => sub.id === activeSection))?.title : null;

  if (!activeSection) {
    return <QuickIndex onSelect={setActiveSection} />;
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
            {SECTIONS.map((section) => (
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
          {SECTIONS.map((section) => (
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
