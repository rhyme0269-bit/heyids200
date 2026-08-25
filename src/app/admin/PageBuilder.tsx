"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { BlockType } from "@/lib/cms-types";
import IconPicker from "@/components/common/IconPicker";

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  heroMode: string;
  heroColor: string;
  isSystem: boolean;
  showInNav: boolean;
  navOrder: number;
  status: string;
}

interface CmsBlock {
  id: string;
  pageId: string;
  blockType: BlockType;
  sortOrder: number;
  data: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface CmsTemplate {
  id: string;
  name: string;
  description: string;
}

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  hero_banner: "頁面橫幅",
  text_heading: "標題文字",
  text_body: "內文段落",
  image: "圖片",
  image_gallery: "圖片集",
  list: "列表",
  key_value_list: "項目列表",
  table: "表格",
  faq_accordion: "常見問題",
  steps_flow: "步驟流程",
  contact_form: "聯絡表單",
  map_embed: "地圖嵌入",
  contact_info: "聯絡資訊",
  cta_section: "行動呼籲",
  stats_strip: "數據條",
  custom_html: "自訂 HTML",
  profile_card: "個人簡介",
  two_column_list: "雙欄清單",
  two_column_flow: "階段流程",
  contact_layout: "聯絡雙欄",
};

const BLOCK_TYPE_HINTS: Record<BlockType, string> = {
  hero_banner: "頁面最頂部的大圖橫幅，含標題、副標題和背景圖",
  text_heading: "獨立標題，可選 H1/H2/H3 層級，用於分隔章節",
  text_body: "內文段落，適合放置詳細說明或描述",
  image: "單張圖片，需指定圖片庫中的 Key",
  image_gallery: "多張圖片的網格展示，適合環境照或作品集",
  list: "項目列表，支援圓點、編號、勾選、標籤四種樣式",
  key_value_list: "帶標題的項目清單，適合服務介紹或特色說明",
  table: "自訂欄位的表格，適合收費標準或比較表",
  faq_accordion: "可展開的問答手風琴，適合常見問題頁面",
  steps_flow: "步驟流程圖，展示服務流程或操作步驟",
  contact_form: "訪客聯絡諮詢表單，提交後寄送通知信",
  map_embed: "嵌入 Google 地圖，可指定地址或嵌入網址",
  contact_info: "自動讀取基本資訊中的聯絡資料並展示",
  cta_section: "行動呼籲區塊，含標題和按鈕，引導用戶行動",
  stats_strip: "數據指標展示條，適合年資、案件數等數字",
  custom_html: "自訂 HTML，可插入任意程式碼（進階用途）",
  profile_card: "個人簡介卡片，含照片、介紹和引言",
  two_column_list: "左右兩組並排清單，適合資歷與經驗展示",
  two_column_flow: "分階段的流程說明，每階段可填兩方各自的作業內容，可展開收合",
  contact_layout: "聯絡頁專用雙欄：左側表單、右側資訊與地圖",
};

const ALL_BLOCK_TYPES = Object.keys(BLOCK_TYPE_LABELS) as BlockType[];

function moveItem<T>(arr: T[], index: number, delta: number): T[] {
  const next = [...arr];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

interface PageBuilderProps {
  showToast: (msg: string, type: "success" | "error") => void;
}

export default function PageBuilder({ showToast }: PageBuilderProps) {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [templates, setTemplates] = useState<CmsTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageTemplate, setNewPageTemplate] = useState("blank");
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [navLinks, setNavLinks] = useState<{ id: string; label: string; href: string; navOrder: number; isExternal: boolean }[]>([]);
  const [showNavLinks, setShowNavLinks] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [newLinkExternal, setNewLinkExternal] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/pages");
      if (res.ok) setPages(await res.json());
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/templates");
      if (res.ok) setTemplates(await res.json());
    } catch { /* empty */ }
  }, []);

  const fetchNavLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/nav-links");
      if (res.ok) setNavLinks(await res.json());
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchTemplates();
    fetchNavLinks();
  }, [fetchPages, fetchTemplates, fetchNavLinks]);

  const openEditor = async (page: CmsPage) => {
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEditingPage(data.page || data);
      setBlocks(data.blocks || []);
    } catch {
      showToast("載入頁面失敗", "error");
    }
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${editingPage.id}/save`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: {
            title: editingPage.title,
            subtitle: editingPage.subtitle,
            slug: editingPage.slug,
            metaDescription: editingPage.metaDescription,
            heroMode: editingPage.heroMode,
            heroColor: editingPage.heroColor,
            showInNav: editingPage.showInNav,
            navOrder: editingPage.navOrder,
            status: editingPage.status,
          },
          blocks: blocks.map((b, i) => ({
            id: b.id,
            blockType: b.blockType,
            sortOrder: i,
            data: b.data,
            config: b.config,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      showToast("頁面儲存成功", "success");
      fetchPages();
    } catch {
      showToast("儲存失敗", "error");
    }
    setSaving(false);
  };

  const handleCreatePage = async () => {
    if (!newPageSlug || !newPageTitle) return;
    try {
      const res = await fetch("/api/admin/cms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: newPageTemplate,
          slug: newPageSlug,
          title: newPageTitle,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "建立失敗", "error");
        return;
      }
      showToast("頁面建立成功", "success");
      setShowCreateModal(false);
      setNewPageSlug("");
      setNewPageTitle("");
      fetchPages();
    } catch {
      showToast("建立失敗", "error");
    }
  };

  const handleReorderPage = async (index: number, delta: number) => {
    const reordered = moveItem(pages, index, delta);
    setPages(reordered);
    setReordering(true);
    try {
      const res = await fetch("/api/admin/cms/pages/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: reordered.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
      showToast("排序已更新", "success");
    } catch {
      showToast("排序更新失敗", "error");
      fetchPages();
    }
    setReordering(false);
  };

  const handleToggleNav = async (page: CmsPage) => {
    const newVal = !page.showInNav;
    setPages(pages.map((p) => (p.id === page.id ? { ...p, showInNav: newVal } : p)));
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInNav: newVal }),
      });
      if (!res.ok) throw new Error();
    } catch {
      showToast("更新失敗", "error");
      fetchPages();
    }
  };

  const handleCreateNavLink = async () => {
    if (!newLinkLabel || !newLinkHref) return;
    try {
      const res = await fetch("/api/admin/cms/nav-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLinkLabel, href: newLinkHref, isExternal: newLinkExternal }),
      });
      if (!res.ok) throw new Error();
      showToast("連結已新增", "success");
      setNewLinkLabel("");
      setNewLinkHref("");
      setNewLinkExternal(false);
      fetchNavLinks();
    } catch {
      showToast("新增連結失敗", "error");
    }
  };

  const handleDeleteNavLink = async (id: string) => {
    if (!confirm("確定刪除此連結？")) return;
    try {
      const res = await fetch("/api/admin/cms/nav-links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      showToast("連結已刪除", "success");
      fetchNavLinks();
    } catch {
      showToast("刪除失敗", "error");
    }
  };

  const handleDeletePage = async (page: CmsPage) => {
    if (page.isSystem) {
      showToast("系統頁面無法刪除", "error");
      return;
    }
    if (!confirm(`確定刪除「${page.title}」頁面？`)) return;
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("頁面已刪除", "success");
      fetchPages();
    } catch {
      showToast("刪除失敗", "error");
    }
  };

  const handleResetPage = async (pageId: string) => {
    if (!confirm("確定要還原此頁面為預設值？你的修改將被覆蓋。")) return;
    try {
      const res = await fetch(`/api/admin/cms/pages/${pageId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "還原失敗", "error");
        return;
      }
      showToast("已還原為預設值", "success");
      fetchPages();
      setEditingPage(null);
    } catch {
      showToast("還原失敗", "error");
    }
  };

  const addBlock = (blockType: BlockType) => {
    const newBlock: CmsBlock = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pageId: editingPage!.id,
      blockType,
      sortOrder: blocks.length,
      data: getDefaultData(blockType),
      config: {},
    };
    setBlocks([...blocks, newBlock]);
    setShowAddBlock(false);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlockData = (index: number, data: Record<string, unknown>) => {
    const next = [...blocks];
    next[index] = { ...next[index], data };
    setBlocks(next);
  };

  const updatePageField = (field: string, value: unknown) => {
    if (!editingPage) return;
    setEditingPage({ ...editingPage, [field]: value });
  };

  // ===== Page Editor View =====
  if (editingPage) {
    return (
      <div className="space-y-6">
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingPage(null)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              &larr; 返回列表
            </button>
            <h2 className="text-lg font-bold text-stone-800">
              編輯頁面：{editingPage.title}
            </h2>
            {editingPage.isSystem && (
              <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-500">系統頁面</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingPage.isSystem && (
              <button
                onClick={() => handleResetPage(editingPage.id)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-500 hover:text-amber-800 hover:border-amber-200"
              >
                還原預設
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-amber-800 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
            >
              {saving ? "儲存中..." : "儲存頁面"}
            </button>
          </div>
        </div>

        {/* Page metadata */}
        <div className="rounded-lg border border-stone-200 p-4">
          <h3 className="mb-4 text-sm font-bold text-stone-700">頁面設定</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">頁面標題</label>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => updatePageField("title", e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">副標題</label>
              <input
                type="text"
                value={editingPage.subtitle}
                onChange={(e) => updatePageField("subtitle", e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                網址路徑 (slug)
                {editingPage.isSystem && <span className="ml-1 text-stone-400">（系統頁面不可修改）</span>}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-stone-400">{editingPage.isSystem ? "/" : "/p/"}</span>
                <input
                  type="text"
                  value={editingPage.slug}
                  onChange={(e) => updatePageField("slug", e.target.value)}
                  disabled={editingPage.isSystem}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800 disabled:bg-stone-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">SEO 描述</label>
              <input
                type="text"
                value={editingPage.metaDescription}
                onChange={(e) => updatePageField("metaDescription", e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">導覽列排序</label>
              <input
                type="number"
                value={editingPage.navOrder}
                onChange={(e) => updatePageField("navOrder", parseInt(e.target.value) || 0)}
                className="w-24 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={editingPage.showInNav}
                  onChange={(e) => updatePageField("showInNav", e.target.checked)}
                  className="rounded border-stone-300"
                />
                顯示在導覽列
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={editingPage.status === "published"}
                  onChange={(e) => updatePageField("status", e.target.checked ? "published" : "draft")}
                  className="rounded border-stone-300"
                />
                已發佈
              </label>
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-700">
              頁面區塊 ({blocks.length})
            </h3>
            <button
              onClick={() => setShowAddBlock(!showAddBlock)}
              className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
            >
              新增區塊
            </button>
          </div>

          {/* Add block selector */}
          {showAddBlock && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="mb-3 text-sm font-medium text-stone-700">選擇區塊類型：</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {ALL_BLOCK_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-left hover:border-amber-400 hover:bg-amber-50 transition"
                  >
                    <span className="text-sm font-medium text-stone-700">{BLOCK_TYPE_LABELS[type]}</span>
                    <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{BLOCK_TYPE_HINTS[type]}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddBlock(false)}
                className="mt-3 text-xs text-stone-500 hover:text-stone-700"
              >
                取消
              </button>
            </div>
          )}

          {/* Block list */}
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <div key={block.id} className="rounded-lg border border-stone-200 bg-white">
                {/* Block header */}
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-stone-700">
                      {BLOCK_TYPE_LABELS[block.blockType]}
                    </span>
                    <span className="relative group/tip">
                      <svg className="w-4 h-4 text-stone-400 cursor-help" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <span className="absolute left-6 top-0 z-50 hidden group-hover/tip:block w-56 p-2 rounded-lg bg-stone-800 text-white text-xs shadow-lg leading-relaxed">
                        {BLOCK_TYPE_HINTS[block.blockType]}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setBlocks(moveItem(blocks, index, -1))}
                      disabled={index === 0}
                      className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                    >
                      上移
                    </button>
                    <button
                      onClick={() => setBlocks(moveItem(blocks, index, 1))}
                      disabled={index === blocks.length - 1}
                      className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                    >
                      下移
                    </button>
                    <button
                      onClick={() => removeBlock(index)}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    >
                      刪除
                    </button>
                  </div>
                </div>

                {/* Block editor */}
                <div className="p-4">
                  <BlockEditor
                    blockType={block.blockType}
                    data={block.data}
                    onChange={(data) => updateBlockData(index, data)}
                  />
                </div>
              </div>
            ))}
          </div>

          {blocks.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-stone-200 py-12 text-center text-stone-400">
              尚無區塊，點擊「新增區塊」開始編輯
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Page List View =====
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-800">頁面管理</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          建立新頁面
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-800" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-700">
                <th className="px-3 py-3 text-center font-semibold w-20">排序</th>
                <th className="px-4 py-3 text-left font-semibold">標題</th>
                <th className="px-4 py-3 text-left font-semibold">路徑</th>
                <th className="px-4 py-3 text-center font-semibold">狀態</th>
                <th className="px-4 py-3 text-center font-semibold">導覽列</th>
                <th className="px-4 py-3 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, idx) => (
                <tr key={page.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleReorderPage(idx, -1)}
                        disabled={idx === 0 || reordering}
                        className="rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                        title="上移"
                      >
                        &#9650;
                      </button>
                      <button
                        onClick={() => handleReorderPage(idx, 1)}
                        disabled={idx === pages.length - 1 || reordering}
                        className="rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                        title="下移"
                      >
                        &#9660;
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-800">{page.title}</span>
                      {page.isSystem && (
                        <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-500">系統</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{page.isSystem ? (page.slug === "home" ? "/" : `/${page.slug}`) : `/p/${page.slug}`}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      page.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}>
                      {page.status === "published" ? "已發佈" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleNav(page)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        page.showInNav
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      {page.showInNav ? "顯示" : "隱藏"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditor(page)}
                        className="rounded bg-amber-800 px-3 py-1 text-xs font-medium text-white hover:bg-amber-900"
                      >
                        編輯
                      </button>
                      {!page.isSystem && (
                        <button
                          onClick={() => handleDeletePage(page)}
                          className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          刪除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Nav Links */}
      <div className="rounded-lg border border-stone-200">
        <button
          onClick={() => setShowNavLinks(!showNavLinks)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-stone-50"
        >
          <h3 className="text-sm font-bold text-stone-700">自訂導覽連結</h3>
          <span className="text-xs text-stone-400">{showNavLinks ? "收合" : "展開"} ({navLinks.length})</span>
        </button>

        {showNavLinks && (
          <div className="border-t border-stone-200 p-4 space-y-3">
            <p className="text-xs text-stone-500">
              新增不屬於 CMS 頁面的連結到導覽列，例如外部網站或特定錨點。
            </p>

            {navLinks.length > 0 && (
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2">
                    <span className="flex-1 text-sm text-stone-700">{link.label}</span>
                    <span className="text-xs text-stone-400 truncate max-w-[200px]">{link.href}</span>
                    {link.isExternal && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">外部</span>
                    )}
                    <span className="text-xs text-stone-400">排序: {link.navOrder}</span>
                    <button
                      onClick={() => handleDeleteNavLink(link.id)}
                      className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white hover:bg-red-700"
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-end gap-2 rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex-1 min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-stone-600">顯示名稱</label>
                <input
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="例如：收費標準"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="mb-1 block text-xs font-medium text-stone-600">連結網址</label>
                <input
                  type="text"
                  value={newLinkHref}
                  onChange={(e) => setNewLinkHref(e.target.value)}
                  placeholder="例如：/services#fees 或 https://..."
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
              <label className="flex items-center gap-1.5 pb-2 text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={newLinkExternal}
                  onChange={(e) => setNewLinkExternal(e.target.checked)}
                  className="rounded border-stone-300"
                />
                外部連結
              </label>
              <button
                onClick={handleCreateNavLink}
                disabled={!newLinkLabel || !newLinkHref}
                className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
              >
                新增
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-stone-800">建立新頁面</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">頁面標題</label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="例如：最新消息"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">網址路徑 (slug)</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-stone-400">/p/</span>
                  <input
                    type="text"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))}
                    placeholder="例如：news"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                {["home","about","services","tools","faq","contact","links","admin","api","p"].includes(newPageSlug) && (
                  <p className="mt-1 text-xs text-red-500">此網址路徑為系統保留，請使用其他名稱</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">使用模板</label>
                <select
                  value={newPageTemplate}
                  onChange={(e) => setNewPageTemplate(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { setShowCreateModal(false); setNewPageSlug(""); setNewPageTitle(""); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
              >
                取消
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageSlug || !newPageTitle || ["home","about","services","tools","faq","contact","links","admin","api","p"].includes(newPageSlug)}
                className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Block Editor Dispatcher =====

function BlockEditor({
  blockType,
  data,
  onChange,
}: {
  blockType: BlockType;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: unknown) => onChange({ ...data, [key]: value });

  switch (blockType) {
    case "hero_banner":
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <Field label="副標題" value={data.subtitle as string} onChange={(v) => set("subtitle", v)} />
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">背景模式</label>
            <select
              value={(data.bgMode as string) || "default"}
              onChange={(e) => set("bgMode", e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <option value="default">預設</option>
              <option value="image">背景圖</option>
              <option value="color">純色</option>
            </select>
          </div>
          {data.bgMode === "color" && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-stone-600">背景色</label>
                <input
                  type="color"
                  value={(data.bgColor as string) || "#4a3428"}
                  onChange={(e) => set("bgColor", e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-stone-300"
                />
              </div>
              <span className="pb-2 text-xs text-stone-400">{(data.bgColor as string) || "#4a3428"}</span>
            </div>
          )}
          <Field label="背景圖片 Key" value={data.bgImageKey as string} onChange={(v) => set("bgImageKey", v)} />
        </div>
      );

    case "text_heading":
      return (
        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="標題文字" value={data.text as string} onChange={(v) => set("text", v)} />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-xs font-medium text-stone-600">層級</label>
            <select
              value={(data.level as string) || "h2"}
              onChange={(e) => set("level", e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <option value="h1">H1 大標題</option>
              <option value="h2">H2 中標題</option>
              <option value="h3">H3 小標題</option>
            </select>
          </div>
        </div>
      );

    case "text_body":
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">內文</label>
          <textarea
            value={(data.html as string) || ""}
            onChange={(e) => set("html", e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
          />
        </div>
      );

    case "image":
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="圖片 Key" value={data.imageKey as string} onChange={(v) => set("imageKey", v)} />
          <Field label="替代文字" value={data.alt as string} onChange={(v) => set("alt", v)} />
          <Field label="說明文字" value={data.caption as string} onChange={(v) => set("caption", v)} />
        </div>
      );

    case "image_gallery":
      return (
        <div className="space-y-3">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <ArrayEditor
            label="圖片"
            items={(data.images as Array<{ imageKey: string; alt: string }>) || []}
            renderItem={(item, i, update) => (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.imageKey}
                  onChange={(e) => update({ ...item, imageKey: e.target.value })}
                  placeholder="圖片 Key"
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => update({ ...item, alt: e.target.value })}
                  placeholder="替代文字"
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            )}
            newItem={() => ({ imageKey: "", alt: "" })}
            onChange={(images) => set("images", images)}
          />
        </div>
      );

    case "list":
      return (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
            </div>
            <div className="w-40">
              <label className="mb-1 block text-xs font-medium text-stone-600">樣式</label>
              <select
                value={(data.style as string) || "bullet"}
                onChange={(e) => set("style", e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
              >
                <option value="bullet">圓點</option>
                <option value="numbered">編號</option>
                <option value="check">勾選</option>
                <option value="tag">標籤</option>
              </select>
            </div>
          </div>
          <StringArrayEditor
            label="列表項目"
            items={(data.items as string[]) || []}
            onChange={(items) => set("items", items)}
          />
        </div>
      );

    case "key_value_list":
      return (
        <div className="space-y-3">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <ArrayEditor
            label="項目"
            items={(data.items as Array<{ label: string; value: string; icon?: string; url?: string }>) || []}
            renderItem={(item, i, update) => (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="w-12">
                    <IconPicker value={item.icon || ""} onChange={(v) => update({ ...item, icon: v })} />
                  </div>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => update({ ...item, label: e.target.value })}
                    placeholder="標題"
                    className="w-1/4 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => update({ ...item, value: e.target.value })}
                    placeholder="內容"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <input
                  type="text"
                  value={item.url || ""}
                  onChange={(e) => update({ ...item, url: e.target.value || undefined })}
                  placeholder="連結網址（選填，如 https://...）"
                  className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            )}
            newItem={() => ({ label: "", value: "", icon: "" })}
            onChange={(items) => set("items", items)}
          />
        </div>
      );

    case "table": {
      const columns = (data.columns as Array<{ key: string; label: string }>) || [];
      const rows = (data.rows as Array<Record<string, string>>) || [];
      const footerNotes = (data.footerNotes as string[]) || [];
      return (
        <div className="space-y-4">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <ArrayEditor
            label="欄位定義"
            items={columns}
            renderItem={(col, i, update) => (
              <div className="flex gap-2">
                <input type="text" value={col.key} onChange={(e) => update({ ...col, key: e.target.value })} placeholder="key" className="w-1/3 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                <input type="text" value={col.label} onChange={(e) => update({ ...col, label: e.target.value })} placeholder="顯示名稱" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
              </div>
            )}
            newItem={() => ({ key: "", label: "" })}
            onChange={(cols) => set("columns", cols)}
          />
          {columns.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-stone-600">表格資料 (共 {rows.length} 列)</label>
              <div className="overflow-x-auto rounded border border-stone-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-50">
                      {columns.map((c) => <th key={c.key} className="px-2 py-1 text-left font-medium">{c.label}</th>)}
                      <th className="px-2 py-1 w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className="border-t border-stone-100">
                        {columns.map((c) => (
                          <td key={c.key} className="px-1 py-1">
                            <input
                              type="text"
                              value={row[c.key] || ""}
                              onChange={(e) => {
                                const next = [...rows];
                                next[ri] = { ...next[ri], [c.key]: e.target.value };
                                set("rows", next);
                              }}
                              className="w-full rounded border border-stone-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                            />
                          </td>
                        ))}
                        <td className="px-1 py-1">
                          <button
                            onClick={() => set("rows", rows.filter((_, i) => i !== ri))}
                            className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white hover:bg-red-700"
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => {
                  const emptyRow: Record<string, string> = {};
                  columns.forEach((c) => { emptyRow[c.key] = ""; });
                  set("rows", [...rows, emptyRow]);
                }}
                className="mt-2 rounded bg-amber-800 px-3 py-1 text-xs font-medium text-white hover:bg-amber-900"
              >
                新增列
              </button>
            </div>
          )}
          <StringArrayEditor
            label="注意事項"
            items={footerNotes}
            onChange={(notes) => set("footerNotes", notes)}
          />
        </div>
      );
    }

    case "faq_accordion":
      return (
        <div className="space-y-3">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <ArrayEditor
            label="問答"
            items={(data.items as Array<{ question: string; answer: string }>) || []}
            renderItem={(item, i, update) => (
              <div className="space-y-2">
                <input type="text" value={item.question} onChange={(e) => update({ ...item, question: e.target.value })} placeholder="問題" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                <textarea value={item.answer} onChange={(e) => update({ ...item, answer: e.target.value })} placeholder="答案" rows={2} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
              </div>
            )}
            newItem={() => ({ question: "", answer: "" })}
            onChange={(items) => set("items", items)}
          />
        </div>
      );

    case "steps_flow":
      return (
        <div className="space-y-3">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <ArrayEditor
            label="步驟"
            items={(data.steps as Array<{ name: string; description: string }>) || []}
            renderItem={(item, i, update) => (
              <div className="flex gap-2">
                <input type="text" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="步驟名稱" className="w-1/3 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                <input type="text" value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="描述" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
              </div>
            )}
            newItem={() => ({ name: "", description: "" })}
            onChange={(steps) => set("steps", steps)}
          />
        </div>
      );

    case "contact_form":
      return (
        <div className="space-y-3">
          <Field label="區塊標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <Field label="Google 表單網址（選填，填入後改用 Google 表單）" value={(data.googleFormUrl as string) || ""} onChange={(v) => set("googleFormUrl", v)} />
        </div>
      );

    case "map_embed":
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <Field label="地址" value={data.address as string} onChange={(v) => set("address", v)} />
          <div className="md:col-span-2">
            <Field label="嵌入網址（留空則使用地址）" value={data.embedUrl as string} onChange={(v) => set("embedUrl", v)} />
          </div>
        </div>
      );

    case "contact_info":
      return <Field label="區塊標題" value={data.title as string} onChange={(v) => set("title", v)} />;

    case "cta_section":
      return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="標題" value={data.title as string} onChange={(v) => set("title", v)} />
          <Field label="副標題" value={data.subtitle as string} onChange={(v) => set("subtitle", v)} />
          <Field label="主按鈕文字" value={data.primaryLabel as string} onChange={(v) => set("primaryLabel", v)} />
          <Field label="主按鈕連結" value={data.primaryHref as string} onChange={(v) => set("primaryHref", v)} />
          <Field label="副按鈕文字" value={data.secondaryLabel as string} onChange={(v) => set("secondaryLabel", v)} />
          <Field label="副按鈕連結" value={data.secondaryHref as string} onChange={(v) => set("secondaryHref", v)} />
        </div>
      );

    case "stats_strip":
      return (
        <ArrayEditor
          label="數據項目"
          items={(data.items as Array<{ value: string; label: string }>) || []}
          renderItem={(item, i, update) => (
            <div className="flex gap-2">
              <input type="text" value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} placeholder="數值（如 26+）" className="w-1/3 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
              <input type="text" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} placeholder="標籤" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
            </div>
          )}
          newItem={() => ({ value: "", label: "" })}
          onChange={(items) => set("items", items)}
        />
      );

    case "custom_html":
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-600">HTML 內容</label>
          <textarea
            value={(data.html as string) || ""}
            onChange={(e) => set("html", e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
          />
        </div>
      );

    case "profile_card":
      return (
        <div className="space-y-3">
          <Field label="介紹文字" value={(data.introduction as string) || ""} onChange={(v) => set("introduction", v)} />
          <Field label="服務理念（引言）" value={(data.quote as string) || ""} onChange={(v) => set("quote", v)} />
          <Field label="圖片 Key（如 scrivener_photo）" value={(data.imageKey as string) || ""} onChange={(v) => set("imageKey", v)} />
          <Field label="姓名" value={(data.imageName as string) || ""} onChange={(v) => set("imageName", v)} />
          <Field label="副標題（如證號）" value={(data.imageSubtitle as string) || ""} onChange={(v) => set("imageSubtitle", v)} />
        </div>
      );

    case "two_column_list":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="左欄標題" value={(data.leftTitle as string) || ""} onChange={(v) => set("leftTitle", v)} />
            <Field label="右欄標題" value={(data.rightTitle as string) || ""} onChange={(v) => set("rightTitle", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">左欄圖示</label>
              <select value={(data.leftStyle as string) || "check"} onChange={(e) => set("leftStyle", e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm">
                <option value="check">打勾</option>
                <option value="bullet">圓點</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">右欄圖示</label>
              <select value={(data.rightStyle as string) || "check"} onChange={(e) => set("rightStyle", e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm">
                <option value="check">打勾</option>
                <option value="circle-check">圓形打勾</option>
                <option value="bullet">圓點</option>
              </select>
            </div>
          </div>
          <StringArrayEditor label="左欄項目" items={(data.leftItems as string[]) || []} onChange={(v) => set("leftItems", v)} />
          <StringArrayEditor label="右欄項目" items={(data.rightItems as string[]) || []} onChange={(v) => set("rightItems", v)} />
        </div>
      );

    case "two_column_flow":
      return (
        <div className="space-y-4">
          <Field label="標題" value={(data.title as string) || ""} onChange={(v) => set("title", v)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="左欄標題" value={(data.leftLabel as string) || ""} onChange={(v) => set("leftLabel", v)} />
            <Field label="右欄標題" value={(data.rightLabel as string) || ""} onChange={(v) => set("rightLabel", v)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={data.defaultOpen !== false}
              onChange={(e) => set("defaultOpen", e.target.checked)}
              className="rounded border-stone-300"
            />
            預設展開所有階段（取消勾選則預設收合）
          </label>
          <ArrayEditor
            label="階段"
            items={(data.stages as Array<{ name: string; left: string; right: string }>) || []}
            renderItem={(item, i, update) => (
              <div className="space-y-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => update({ ...item, name: e.target.value })}
                  placeholder="階段名稱（例如：簽約）"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <textarea
                    value={item.left}
                    onChange={(e) => update({ ...item, left: e.target.value })}
                    placeholder={`${(data.leftLabel as string) || "左欄"}\n一行一項`}
                    rows={4}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                  <textarea
                    value={item.right}
                    onChange={(e) => update({ ...item, right: e.target.value })}
                    placeholder={`${(data.rightLabel as string) || "右欄"}\n一行一項`}
                    rows={4}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>
            )}
            newItem={() => ({ name: "", left: "", right: "" })}
            onChange={(stages) => set("stages", stages)}
          />
          <p className="text-xs text-stone-500">兩欄內容一行一項，會自動編號。留空則顯示「—」。</p>
        </div>
      );

    case "contact_layout":
      return (
        <div className="space-y-3">
          <Field label="表單標題" value={(data.formTitle as string) || ""} onChange={(v) => set("formTitle", v)} />
          <Field label="Google 表單網址（選填，填入後改用 Google 表單）" value={(data.googleFormUrl as string) || ""} onChange={(v) => set("googleFormUrl", v)} />
          <Field label="聯絡資訊標題" value={(data.infoTitle as string) || ""} onChange={(v) => set("infoTitle", v)} />
          {/* 地圖跟著「基本資訊 → 地址」走，所以這裡不再有地址欄位（#38） */}
          <Field label="地圖嵌入 URL（選填，留空則自動依地址顯示）" value={(data.mapEmbedUrl as string) || ""} onChange={(v) => set("mapEmbedUrl", v)} />
        </div>
      );

    default:
      return <p className="text-sm text-stone-400">不支援的區塊類型：{blockType}</p>;
  }
}

// ===== Reusable form helpers =====

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-stone-600">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
      />
    </div>
  );
}

function StringArrayEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-stone-600">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
          />
          <button onClick={() => onChange(moveItem(items, i, -1))} disabled={i === 0} className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30">上移</button>
          <button onClick={() => onChange(moveItem(items, i, 1))} disabled={i === items.length - 1} className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30">下移</button>
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">刪除</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="rounded bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900">新增</button>
    </div>
  );
}

function ArrayEditor<T>({
  label,
  items,
  renderItem,
  newItem,
  onChange,
}: {
  label: string;
  items: T[];
  renderItem: (item: T, index: number, update: (item: T) => void) => React.ReactNode;
  newItem: () => T;
  onChange: (items: T[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-stone-600">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            {renderItem(item, i, (updated) => {
              const next = [...items];
              next[i] = updated;
              onChange(next);
            })}
          </div>
          <div className="flex gap-1 pt-1">
            <button onClick={() => onChange(moveItem(items, i, -1))} disabled={i === 0} className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30">上移</button>
            <button onClick={() => onChange(moveItem(items, i, 1))} disabled={i === items.length - 1} className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30">下移</button>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">刪除</button>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, newItem()])} className="rounded bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900">新增</button>
    </div>
  );
}

// ===== Default data for new blocks =====

function getDefaultData(blockType: BlockType): Record<string, unknown> {
  switch (blockType) {
    case "hero_banner": return { title: "", subtitle: "", bgMode: "default", bgColor: "#4a3428", bgImageKey: null };
    case "text_heading": return { text: "", level: "h2" };
    case "text_body": return { html: "" };
    case "image": return { imageKey: "", alt: "", caption: "" };
    case "image_gallery": return { title: "", images: [] };
    case "list": return { title: "", style: "bullet", items: [] };
    case "key_value_list": return { title: "", items: [] };
    case "table": return { title: "", columns: [], rows: [], footerNotes: [] };
    case "faq_accordion": return { title: "", items: [] };
    case "steps_flow": return { title: "", steps: [] };
    case "contact_form": return { title: "諮詢表單" };
    case "map_embed": return { title: "", address: "", embedUrl: "" };
    case "contact_info": return { title: "聯絡資訊" };
    case "cta_section": return { title: "", subtitle: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "" };
    case "stats_strip": return { items: [] };
    case "custom_html": return { html: "" };
    case "profile_card": return { introduction: "", quote: "", imageKey: "", imageName: "", imageSubtitle: "" };
    case "two_column_list": return { leftTitle: "", leftItems: [], leftStyle: "check", rightTitle: "", rightItems: [], rightStyle: "check" };
    case "two_column_flow": return { title: "", leftLabel: "地政士作業", rightLabel: "買、賣雙方作業", defaultOpen: true, stages: [] };
    case "contact_layout": return { formTitle: "諮詢表單", infoTitle: "聯絡資訊", mapEmbedUrl: "" };
    default: return {};
  }
}
