"use client";

import React, { useState } from "react";

interface Section {
  id: string;
  title: string;
  subsections: { id: string; title: string; content: React.ReactNode }[];
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
            <p>本後台管理系統提供網站內容的完整管理功能，包括：</p>
            <ul>
              <li><strong>頁面管理</strong> — 建立、編輯、排序網站所有頁面的內容</li>
              <li><strong>基本資訊</strong> — 管理事務所聯絡資訊、地址等基本設定</li>
              <li><strong>圖片庫</strong> — 上傳、管理網站使用的所有圖片</li>
            </ul>
            <p>所有變更會即時反映在網站前台。部分設定（如背景圖模式）需要點擊「儲存」後才會生效。</p>
          </>
        ),
      },
      {
        id: "overview-login",
        title: "登入方式",
        content: (
          <>
            <p>使用管理員帳號密碼登入後台。登入後 session 有效期為 24 小時，過期後需要重新登入。</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              <strong>安全提醒：</strong>請勿將帳號密碼分享給無關人員，也不要在公用電腦上勾選「記住密碼」。
            </div>
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
            <p>頁面管理頁籤會列出所有已建立的頁面。每個頁面都有以下資訊：</p>
            <ul>
              <li><strong>標題</strong> — 頁面的顯示名稱</li>
              <li><strong>路徑（slug）</strong> — 頁面的網址路徑，例如 <code>/about</code></li>
              <li><strong>狀態</strong> — 已發布 或 草稿</li>
              <li><strong>是否顯示於導覽列</strong> — 控制頁面是否出現在網站上方的選單中</li>
            </ul>
            <p>系統頁面（如首頁、關於我們等）無法刪除，但可以編輯其內容。</p>
          </>
        ),
      },
      {
        id: "pages-create",
        title: "建立新頁面",
        content: (
          <>
            <p>點擊「建立新頁面」按鈕，填入以下資訊：</p>
            <ol>
              <li><strong>頁面路徑</strong> — 英文小寫，不含空格。例如填入 <code>pricing</code> 後，頁面網址為 <code>/pricing</code></li>
              <li><strong>頁面標題</strong> — 中文名稱，會顯示在頁面頂部和導覽列中</li>
              <li><strong>選擇模板</strong>（選填） — 可以從預設模板快速建立頁面結構</li>
            </ol>
            <p>建立後可以在頁面編輯器中新增和調整區塊內容。</p>
          </>
        ),
      },
      {
        id: "pages-blocks",
        title: "區塊類型說明",
        content: (
          <>
            <p>每個頁面由多個「區塊」組成。以下是可用的區塊類型：</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-2 pr-4 text-left font-semibold">區塊類型</th>
                    <th className="py-2 text-left font-semibold">說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr><td className="py-2 pr-4 font-medium">頁面橫幅</td><td className="py-2">最頂部的大圖區域，含標題和副標題</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">標題文字</td><td className="py-2">獨立標題，可選 H1/H2/H3 層級</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">內文段落</td><td className="py-2">多行文字內容</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">圖片 / 圖片集</td><td className="py-2">單張或多張圖片展示</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">列表</td><td className="py-2">支援圓點、編號、勾選、標籤四種樣式</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">項目列表</td><td className="py-2">帶標題的項目說明</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">表格</td><td className="py-2">自訂欄位的表格資料</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">常見問題</td><td className="py-2">可展開的問答手風琴</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">步驟流程</td><td className="py-2">有序的流程步驟圖</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">聯絡表單</td><td className="py-2">內建的訪客聯絡表單</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">地圖嵌入</td><td className="py-2">嵌入 Google 地圖</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">聯絡資訊</td><td className="py-2">自動讀取基本資訊中的聯絡資料</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">行動呼籲</td><td className="py-2">含按鈕的醒目區塊</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">數據條</td><td className="py-2">數字指標展示</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">個人簡介</td><td className="py-2">照片 + 介紹 + 引言卡片</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">雙欄清單</td><td className="py-2">左右兩組並排清單</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">聯絡雙欄</td><td className="py-2">左側表單 + 右側資訊與地圖</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">自訂 HTML</td><td className="py-2">進階用途，可插入 HTML 程式碼</td></tr>
                </tbody>
              </table>
            </div>
          </>
        ),
      },
      {
        id: "pages-nav",
        title: "導覽列管理",
        content: (
          <>
            <p>頁面在導覽列中的顯示受兩個設定控制：</p>
            <ul>
              <li><strong>顯示於導覽列</strong> — 勾選後頁面會出現在網站頂部選單</li>
              <li><strong>導覽排序</strong> — 數字越小越靠前，相同數字按標題排序</li>
            </ul>
            <p>你也可以透過「自訂連結」功能，在導覽列中加入外部連結（例如 LINE 官方帳號連結）。</p>
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
        title: "上傳與裁切",
        content: (
          <>
            <p>點擊任一圖片欄位的「上傳圖片」按鈕後：</p>
            <ol>
              <li>選擇圖片檔案（支援 PNG、JPG、WebP、GIF，最大 5MB）</li>
              <li>在裁切視窗中調整圖片範圍和縮放</li>
              <li>點擊「確認裁切」完成上傳</li>
            </ol>
            <p>每個圖片欄位都有預設的裁切比例（如背景圖為 16:6 寬幅，人像為 3:4 直式），裁切時會自動套用。</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              <strong>提示：</strong>建議使用高解析度的原始圖片，裁切後品質會更好。背景圖建議至少 1920px 寬。
            </div>
          </>
        ),
      },
      {
        id: "images-groups",
        title: "圖片群組",
        content: (
          <>
            <p>圖片庫以「群組」為單位組織圖片。預設群組包括：</p>
            <ul>
              <li><strong>網站通用</strong> — Logo、代書照片等全站共用圖片</li>
              <li><strong>首頁事務所照片</strong> — 首頁環境區塊的照片</li>
              <li><strong>頁面背景圖</strong> — 各頁面頂部橫幅的背景圖片</li>
            </ul>
            <p>你可以自由新增、編輯或刪除群組。帶有鎖定圖示的系統圖片欄位無法刪除，但可以更換圖片。</p>
            <h4 className="mt-4 font-semibold">新增自訂圖片欄位</h4>
            <p>在任一群組中點擊「+ 新增圖片欄位」，需要填入：</p>
            <ul>
              <li><strong>Key</strong> — 英文小寫識別碼，用於在 CMS 區塊中引用。例如 <code>team_photo</code></li>
              <li><strong>顯示名稱</strong> — 在後台顯示的中文名稱</li>
              <li><strong>裁切比例</strong> — 上傳時的裁切框比例</li>
              <li><strong>類型</strong> — 選擇「背景圖」時會額外顯示顯示模式選擇器</li>
            </ul>
          </>
        ),
      },
      {
        id: "images-hero",
        title: "背景圖模式",
        content: (
          <>
            <p>背景圖類型的圖片欄位支援三種顯示模式：</p>
            <ul>
              <li><strong>預設漸層</strong> — 使用系統預設的漸層效果，不需要上傳圖片</li>
              <li><strong>背景圖</strong> — 顯示你上傳的圖片作為背景</li>
              <li><strong>純色</strong> — 使用單一顏色作為背景，可自訂色碼</li>
            </ul>
            <p>修改模式後記得點擊底部的「儲存」按鈕。你也可以點擊「預覽全部頁面」先確認效果。</p>
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
            <p>基本資訊頁籤可以修改以下欄位：</p>
            <ul>
              <li><strong>名稱</strong> — 事務所名稱，顯示在網站標題和頁尾</li>
              <li><strong>電話/手機</strong> — 顯示在聯絡資訊區域</li>
              <li><strong>電子郵件</strong> — 聯絡表單的收件信箱</li>
              <li><strong>LINE ID / 連結</strong> — LINE 官方帳號資訊</li>
              <li><strong>地址</strong> — 事務所實體地址</li>
              <li><strong>代書姓名 / 證照號碼</strong> — 顯示在關於我們頁面</li>
            </ul>
            <p>修改後記得點擊底部儲存按鈕。這些資訊會自動帶入所有使用「聯絡資訊」區塊的頁面。</p>
          </>
        ),
      },
    ],
  },
];

export default function ManualContent() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].subsections[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentSubsection = SECTIONS.flatMap(s => s.subsections).find(sub => sub.id === activeSection);
  const currentSectionTitle = SECTIONS.find(s => s.subsections.some(sub => sub.id === activeSection))?.title;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile section selector */}
      <div className="md:hidden">
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
