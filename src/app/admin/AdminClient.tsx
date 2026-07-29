"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { DEFAULT_IMAGES } from "@/lib/default-images";

/* ============================================================
   Types
   ============================================================ */

interface SettingsData {
  name: string;
  phone: string;
  mobile: string;
  email: string;
  lineId: string;
  lineUrl: string;
  address: string;
  googleMapUrl: string;
  googleMapEmbed: string;
  scrivenerName: string;
  licenseNumber: string;
}

interface AboutData {
  introduction: string;
  philosophy: string;
  features: string[];
  qualifications: string[];
  experience: string[];
  specialties: string[];
}

interface ServiceItem {
  title: string;
  description: string;
}

interface FeeItem {
  service: string;
  fee: string;
  payer: string;
  note: string;
}

interface FeesData {
  items: FeeItem[];
  notes: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FlowItem {
  stepName: string;
  stepDescription: string;
}

/* ============================================================
   Constants
   ============================================================ */

const TABS = [
  { key: "settings", label: "基本資訊" },
  { key: "about", label: "關於我們" },
  { key: "services", label: "服務項目" },
  { key: "fees", label: "收費標準" },
  { key: "faqs", label: "常見問題" },
  { key: "flow", label: "服務流程" },
  { key: "images", label: "圖片管理" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const IMAGE_GROUPS = [
  {
    group: "網站通用",
    slots: [
      { key: "logo", label: "Logo", hint: "顯示於網站左上角" },
      { key: "scrivener_photo", label: "代書照片", hint: "顯示於關於我們頁面" },
    ],
  },
  {
    group: "首頁事務所照片",
    description: "首頁「事務所環境」區塊展示的照片。留空則使用預設照片。",
    slots: [
      { key: "office_interior", label: "內部環境", hint: "事務所內部環境照" },
      { key: "office_exterior", label: "外觀", hint: "事務所外觀照" },
      { key: "office_sign", label: "招牌", hint: "事務所招牌照" },
    ],
  },
  {
    group: "頁面背景圖",
    description: "各頁面頂部橫幅背景，建議尺寸 1920×600 以上。留空則使用預設圖片。",
    slots: [
      { key: "hero_bg", label: "首頁", hint: "首頁大圖橫幅背景", pageUrl: "/" },
      { key: "about_bg", label: "關於我們", hint: "關於我們頁面頂部背景", pageUrl: "/about" },
      { key: "services_bg", label: "服務項目", hint: "服務項目頁面頂部背景", pageUrl: "/services" },
      { key: "contact_bg", label: "聯絡我們", hint: "聯絡我們頁面頂部背景", pageUrl: "/contact" },
      { key: "faq_bg", label: "常見問題", hint: "常見問題頁面頂部背景", pageUrl: "/faq" },
      { key: "tools_bg", label: "小工具", hint: "小工具頁面頂部背景", pageUrl: "/tools" },
    ],
  },
] as const;

const IMAGE_SLOTS = IMAGE_GROUPS.flatMap((g) =>
  g.slots.map((s) => ({ key: s.key, label: s.label, hint: s.hint }))
);

const SETTINGS_FIELDS: { key: keyof SettingsData; label: string }[] = [
  { key: "name", label: "名稱" },
  { key: "phone", label: "電話" },
  { key: "mobile", label: "手機" },
  { key: "email", label: "電子郵件" },
  { key: "lineId", label: "LINE ID" },
  { key: "lineUrl", label: "LINE 連結" },
  { key: "address", label: "地址" },
  { key: "scrivenerName", label: "代書姓名" },
  { key: "licenseNumber", label: "證照號碼" },
];

/* ============================================================
   Helpers
   ============================================================ */

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

function authHeadersNoContentType(): HeadersInit {
  return {};
}

/** Move an element in an array by delta (-1 = up, +1 = down) */
function moveItem<T>(arr: T[], index: number, delta: number): T[] {
  const next = [...arr];
  const target = index + delta;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/* ============================================================
   Toast Component
   ============================================================ */

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}

/* ============================================================
   Loading Spinner
   ============================================================ */

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-amber-800" />
    </div>
  );
}

/* ============================================================
   Reusable List Editor (for string arrays)
   ============================================================ */

function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">
        {label}
      </label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
          />
          <button
            type="button"
            onClick={() => onChange(moveItem(items, i, -1))}
            disabled={i === 0}
            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
          >
            上移
          </button>
          <button
            type="button"
            onClick={() => onChange(moveItem(items, i, 1))}
            disabled={i === items.length - 1}
            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
          >
            下移
          </button>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
          >
            刪除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-1 rounded bg-amber-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-900"
      >
        新增
      </button>
    </div>
  );
}

/* ============================================================
   Main Admin Client Component
   ============================================================ */

export default function AdminClient() {
  /* ------ Auth state ------ */
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  /* ------ Dashboard state ------ */
  const [activeTab, setActiveTabState] = useState<TabKey>("settings");

  // Sync tab with URL hash
  const setActiveTab = useCallback((tab: TabKey) => {
    setActiveTabState(tab);
    window.location.hash = tab;
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabKey;
    if (TABS.some((t) => t.key === hash)) {
      setActiveTabState(hash);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  /* ------ Data states ------ */
  const [settings, setSettings] = useState<SettingsData>({
    name: "",
    phone: "",
    mobile: "",
    email: "",
    lineId: "",
    lineUrl: "",
    address: "",
    googleMapUrl: "",
    googleMapEmbed: "",
    scrivenerName: "",
    licenseNumber: "",
  });

  const [about, setAbout] = useState<AboutData>({
    introduction: "",
    philosophy: "",
    features: [],
    qualifications: [],
    experience: [],
    specialties: [],
  });

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [fees, setFees] = useState<FeesData>({ items: [], notes: [] });
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [flow, setFlow] = useState<FlowItem[]>([]);
  const [imageTimestamps, setImageTimestamps] = useState<
    Record<string, number>
  >({});
  const [heroConfigs, setHeroConfigs] = useState<
    Record<string, { mode: string; color: string }>
  >({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<{
    imageUrl: string;
    key: string;
    aspect: number;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaRef = useRef<Area | null>(null);

  /* ------ Dirty tracking ------ */
  const savedSnapshots = useRef<Record<string, string>>({});

  const getTabPayload = useCallback((tab: string): string => {
    switch (tab) {
      case "settings": return JSON.stringify(settings);
      case "about": return JSON.stringify(about);
      case "services": return JSON.stringify(services);
      case "fees": return JSON.stringify({ fees: fees.items, notes: fees.notes });
      case "faqs": return JSON.stringify(faqs);
      case "flow": return JSON.stringify(flow);
      case "heroConfigs": return JSON.stringify(heroConfigs);
      default: return "";
    }
  }, [settings, about, services, fees, faqs, flow, heroConfigs]);

  const dirtyTabs = TABS.filter((tab) => {
    if (tab.key === "images") {
      const snap = savedSnapshots.current["heroConfigs"];
      if (!snap) return false;
      return snap !== JSON.stringify(heroConfigs);
    }
    const snap = savedSnapshots.current[tab.key];
    if (!snap) return false;
    return snap !== getTabPayload(tab.key);
  });

  /* ------ Hide global header/footer on admin ------ */
  useEffect(() => {
    const header = document.querySelector("body > header");
    const footer = document.querySelector("body > footer");
    const fab = document.getElementById("floating-line");
    if (header) (header as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    if (fab) fab.style.display = "none";
    return () => {
      if (header) (header as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
      if (fab) fab.style.display = "";
    };
  }, []);

  /* ------ Check existing session on mount ------ */
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.authenticated) {
          setAuthenticated(true);
          setDisplayName(data.username);
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  /* ------ Show toast helper ------ */
  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    [],
  );

  /* ------ Login handler ------ */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuthenticated(true);
        setDisplayName(data.username);
      } else {
        setLoginError(data.error || "帳號或密碼錯誤");
      }
    } catch {
      setLoginError("連線錯誤，請稍後再試");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setDisplayName("");
  };

  /* ------ Data fetching ------ */
  const fetchTabData = useCallback(
    async (tab: TabKey) => {
      setLoading(true);
      try {
        let url = "";
        switch (tab) {
          case "settings":
            url = "/api/admin/settings";
            break;
          case "about":
            url = "/api/admin/about";
            break;
          case "services":
            url = "/api/admin/services";
            break;
          case "fees":
            url = "/api/admin/fees";
            break;
          case "faqs":
            url = "/api/admin/faqs";
            break;
          case "flow":
            url = "/api/admin/flow";
            break;
          case "images":
            fetch("/api/admin/hero-config", { headers: authHeaders() })
              .then((r) => r.ok ? r.json() : {})
              .then((data) => {
                setHeroConfigs(data);
                savedSnapshots.current["heroConfigs"] = JSON.stringify(data);
              })
              .catch(() => {});
            setLoading(false);
            return;
        }

        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) {
          if (res.status === 401) {
            sessionStorage.removeItem("adminPassword");
            setAuthenticated(false);
            return;
          }
          throw new Error("Failed to fetch");
        }

        const data = await res.json();

        switch (tab) {
          case "settings":
            setSettings(data);
            savedSnapshots.current["settings"] = JSON.stringify(data);
            break;
          case "about":
            setAbout(data);
            savedSnapshots.current["about"] = JSON.stringify(data);
            break;
          case "services":
            setServices(data);
            savedSnapshots.current["services"] = JSON.stringify(data);
            break;
          case "fees":
            setFees({ items: data.fees || [], notes: data.notes || [] });
            savedSnapshots.current["fees"] = JSON.stringify({ fees: data.fees || [], notes: data.notes || [] });
            break;
          case "faqs":
            setFaqs(data);
            savedSnapshots.current["faqs"] = JSON.stringify(data);
            break;
          case "flow":
            setFlow(data);
            savedSnapshots.current["flow"] = JSON.stringify(data);
            break;
        }
      } catch {
        showToast("載入資料失敗", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  /* Fetch on tab change */
  useEffect(() => {
    if (authenticated) {
      fetchTabData(activeTab);
    }
  }, [authenticated, activeTab, fetchTabData]);

  /* ------ Save handler ------ */
  const handleSave = async (
    endpoint: string,
    body: unknown,
    method = "PUT",
  ) => {
    try {
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("adminPassword");
          setAuthenticated(false);
          return;
        }
        throw new Error("Save failed");
      }

      if (endpoint === "/api/admin/hero-config") {
        savedSnapshots.current["heroConfigs"] = JSON.stringify(body);
      } else {
        const tabKey = endpoint.replace("/api/admin/", "");
        savedSnapshots.current[tabKey] = JSON.stringify(body);
      }
      showToast("儲存成功", "success");
    } catch {
      showToast("儲存失敗", "error");
    }
  };

  /* ------ Save current tab ------ */
  const saveTab = async (tabKey: string) => {
    const endpointMap: Record<string, { url: string; body: unknown }> = {
      settings: { url: "/api/admin/settings", body: settings },
      about: { url: "/api/admin/about", body: about },
      services: { url: "/api/admin/services", body: services },
      fees: { url: "/api/admin/fees", body: { fees: fees.items, notes: fees.notes } },
      faqs: { url: "/api/admin/faqs", body: faqs },
      flow: { url: "/api/admin/flow", body: flow },
      images: { url: "/api/admin/hero-config", body: heroConfigs },
    };
    const entry = endpointMap[tabKey];
    if (!entry) return;
    await handleSave(entry.url, entry.body);
  };

  const saveAllDirty = async () => {
    for (const tab of dirtyTabs) {
      await saveTab(tab.key);
    }
  };

  /* ------ Image handlers ------ */
  const handleImageUpload = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: authHeadersNoContentType(),
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("adminPassword");
          setAuthenticated(false);
          return;
        }
        throw new Error("Upload failed");
      }

      showToast("圖片上傳成功", "success");
      setImageTimestamps((prev) => ({ ...prev, [key]: Date.now() }));
    } catch {
      showToast("圖片上傳失敗", "error");
    }
  };

  const handleImageDelete = async (key: string) => {
    try {
      const res = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ key }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem("adminPassword");
          setAuthenticated(false);
          return;
        }
        throw new Error("Delete failed");
      }

      showToast("圖片刪除成功", "success");
      setImageTimestamps((prev) => ({ ...prev, [key]: Date.now() }));
    } catch {
      showToast("圖片刪除失敗", "error");
    }
  };

  const openCropper = (file: File, key: string) => {
    const url = URL.createObjectURL(file);
    const isBg = key.endsWith("_bg");
    setCropState({ imageUrl: url, key, aspect: isBg ? 16 / 6 : 3 / 4 });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    croppedAreaRef.current = null;
  };

  const handleCropComplete = useCallback((_: Area, croppedArea: Area) => {
    croppedAreaRef.current = croppedArea;
  }, []);

  const handleCropConfirm = async () => {
    if (!cropState || !croppedAreaRef.current) return;
    const { imageUrl, key } = cropState;
    const area = croppedAreaRef.current;

    // Draw cropped image on canvas
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement("canvas");
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
    );

    URL.revokeObjectURL(imageUrl);
    setCropState(null);

    const file = new File([blob], `${key}.jpg`, { type: "image/jpeg" });
    await handleImageUpload(key, file);
  };

  const handlePreview = async (pageUrl: string) => {
    try {
      const res = await fetch("/api/admin/hero-config/preview", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(heroConfigs),
      });
      if (!res.ok) throw new Error("Save preview failed");
      document.cookie = "hero_preview=1; path=/; max-age=600";
      setPreviewUrl(pageUrl);
    } catch {
      showToast("預覽暫存失敗", "error");
    }
  };

  const closePreview = () => {
    document.cookie = "hero_preview=; path=/; max-age=0";
    setPreviewUrl(null);
  };

  const handleApplyPreview = async () => {
    try {
      const res = await fetch("/api/admin/hero-config", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(heroConfigs),
      });
      if (!res.ok) throw new Error("Apply failed");
      document.cookie = "hero_preview=; path=/; max-age=0";
      showToast("設定已正式套用", "success");
      setPreviewUrl(null);
    } catch {
      showToast("套用失敗", "error");
    }
  };

  /* ============================================================
     RENDER: Login Screen
     ============================================================ */

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Spinner />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-stone-800">
            後台管理登入
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                帳號
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                placeholder="請輸入帳號"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                密碼
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                placeholder="請輸入密碼"
              />
            </div>

            {loginError && (
              <p className="text-sm font-medium text-red-600">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading || !username || !password}
              className="w-full rounded-lg bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
            >
              {loginLoading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER: Dashboard
     ============================================================ */

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={`mx-auto max-w-[1200px] px-4 py-8 ${dirtyTabs.length > 0 ? "pb-24" : ""}`}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              回首頁
            </Link>
            <h1 className="text-2xl font-bold text-stone-800">後台管理</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">
              {displayName}，您好
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              登出
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-6 overflow-x-auto rounded-xl bg-stone-200">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const isDirty = dirtyTabs.some((d) => d.key === tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "border-b-2 border-amber-800 text-amber-800 bg-white"
                      : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                  {isDirty && (
                    <span className="absolute top-2 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* ============================
                  Tab: 基本資訊
                  ============================ */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    基本資訊
                  </h2>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {SETTINGS_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label className="mb-1 block text-sm font-medium text-stone-700">
                          {field.label}
                        </label>
                        {field.key === "googleMapEmbed" ? (
                          <textarea
                            value={settings[field.key]}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        ) : (
                          <input
                            type="text"
                            value={settings[field.key]}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ============================
                  Tab: 關於我們
                  ============================ */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    關於我們
                  </h2>

                  {/* Introduction */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-stone-700">
                      事務所介紹
                    </label>
                    <textarea
                      value={about.introduction}
                      onChange={(e) =>
                        setAbout((prev) => ({
                          ...prev,
                          introduction: e.target.value,
                        }))
                      }
                      rows={5}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  {/* Philosophy */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-stone-700">
                      服務理念
                    </label>
                    <textarea
                      value={about.philosophy}
                      onChange={(e) =>
                        setAbout((prev) => ({
                          ...prev,
                          philosophy: e.target.value,
                        }))
                      }
                      rows={5}
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  {/* String list editors */}
                  <StringListEditor
                    label="服務特色"
                    items={about.features}
                    onChange={(features) =>
                      setAbout((prev) => ({ ...prev, features }))
                    }
                  />
                  <StringListEditor
                    label="專業資格"
                    items={about.qualifications}
                    onChange={(qualifications) =>
                      setAbout((prev) => ({ ...prev, qualifications }))
                    }
                  />
                  <StringListEditor
                    label="經歷"
                    items={about.experience}
                    onChange={(experience) =>
                      setAbout((prev) => ({ ...prev, experience }))
                    }
                  />
                  <StringListEditor
                    label="專長領域"
                    items={about.specialties}
                    onChange={(specialties) =>
                      setAbout((prev) => ({ ...prev, specialties }))
                    }
                  />

                </div>
              )}

              {/* ============================
                  Tab: 服務項目
                  ============================ */}
              {activeTab === "services" && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    服務項目
                  </h2>

                  {services.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-stone-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-stone-600">
                          項目 {i + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setServices(moveItem(services, i, -1))
                            }
                            disabled={i === 0}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            上移
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setServices(moveItem(services, i, 1))
                            }
                            disabled={i === services.length - 1}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            下移
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setServices(
                                services.filter((_, idx) => idx !== i),
                              )
                            }
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            刪除
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            標題
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...services];
                              next[i] = { ...next[i], title: e.target.value };
                              setServices(next);
                            }}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            描述
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const next = [...services];
                              next[i] = {
                                ...next[i],
                                description: e.target.value,
                              };
                              setServices(next);
                            }}
                            rows={2}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setServices([
                        ...services,
                        { title: "", description: "" },
                      ])
                    }
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                  >
                    新增
                  </button>

                </div>
              )}

              {/* ============================
                  Tab: 收費標準
                  ============================ */}
              {activeTab === "fees" && (
                <div className="space-y-6">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    收費標準
                  </h2>

                  {/* Fee table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50">
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            服務項目
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            收費
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            付費方
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            備註
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-stone-700">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.items.map((item, i) => (
                          <tr key={i} className="border-b border-stone-100">
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.service}
                                onChange={(e) => {
                                  const next = [...fees.items];
                                  next[i] = {
                                    ...next[i],
                                    service: e.target.value,
                                  };
                                  setFees((prev) => ({
                                    ...prev,
                                    items: next,
                                  }));
                                }}
                                className="w-full rounded border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.fee}
                                onChange={(e) => {
                                  const next = [...fees.items];
                                  next[i] = {
                                    ...next[i],
                                    fee: e.target.value,
                                  };
                                  setFees((prev) => ({
                                    ...prev,
                                    items: next,
                                  }));
                                }}
                                className="w-full rounded border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.payer}
                                onChange={(e) => {
                                  const next = [...fees.items];
                                  next[i] = {
                                    ...next[i],
                                    payer: e.target.value,
                                  };
                                  setFees((prev) => ({
                                    ...prev,
                                    items: next,
                                  }));
                                }}
                                className="w-full rounded border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={item.note}
                                onChange={(e) => {
                                  const next = [...fees.items];
                                  next[i] = {
                                    ...next[i],
                                    note: e.target.value,
                                  };
                                  setFees((prev) => ({
                                    ...prev,
                                    items: next,
                                  }));
                                }}
                                className="w-full rounded border border-stone-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setFees((prev) => ({
                                    ...prev,
                                    items: prev.items.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  }))
                                }
                                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
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
                    type="button"
                    onClick={() =>
                      setFees((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          { service: "", fee: "", payer: "", note: "" },
                        ],
                      }))
                    }
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                  >
                    新增項目
                  </button>

                  {/* Fee notes */}
                  <div className="border-t border-stone-200 pt-6">
                    <StringListEditor
                      label="收費備註"
                      items={fees.notes}
                      onChange={(notes) =>
                        setFees((prev) => ({ ...prev, notes }))
                      }
                    />
                  </div>

                </div>
              )}

              {/* ============================
                  Tab: 常見問題
                  ============================ */}
              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    常見問題
                  </h2>

                  {faqs.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-stone-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-stone-600">
                          問題 {i + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setFaqs(moveItem(faqs, i, -1))}
                            disabled={i === 0}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            上移
                          </button>
                          <button
                            type="button"
                            onClick={() => setFaqs(moveItem(faqs, i, 1))}
                            disabled={i === faqs.length - 1}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            下移
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFaqs(faqs.filter((_, idx) => idx !== i))
                            }
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            刪除
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            問題
                          </label>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => {
                              const next = [...faqs];
                              next[i] = {
                                ...next[i],
                                question: e.target.value,
                              };
                              setFaqs(next);
                            }}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            答案
                          </label>
                          <textarea
                            value={item.answer}
                            onChange={(e) => {
                              const next = [...faqs];
                              next[i] = {
                                ...next[i],
                                answer: e.target.value,
                              };
                              setFaqs(next);
                            }}
                            rows={3}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setFaqs([...faqs, { question: "", answer: "" }])
                    }
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                  >
                    新增
                  </button>

                </div>
              )}

              {/* ============================
                  Tab: 服務流程
                  ============================ */}
              {activeTab === "flow" && (
                <div className="space-y-4">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    服務流程
                  </h2>

                  {flow.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-stone-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-stone-600">
                          步驟 {i + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setFlow(moveItem(flow, i, -1))}
                            disabled={i === 0}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            上移
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlow(moveItem(flow, i, 1))}
                            disabled={i === flow.length - 1}
                            className="rounded bg-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-300 disabled:opacity-30"
                          >
                            下移
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFlow(flow.filter((_, idx) => idx !== i))
                            }
                            className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            刪除
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            步驟名稱
                          </label>
                          <input
                            type="text"
                            value={item.stepName}
                            onChange={(e) => {
                              const next = [...flow];
                              next[i] = {
                                ...next[i],
                                stepName: e.target.value,
                              };
                              setFlow(next);
                            }}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-600">
                            步驟描述
                          </label>
                          <textarea
                            value={item.stepDescription}
                            onChange={(e) => {
                              const next = [...flow];
                              next[i] = {
                                ...next[i],
                                stepDescription: e.target.value,
                              };
                              setFlow(next);
                            }}
                            rows={2}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setFlow([
                        ...flow,
                        { stepName: "", stepDescription: "" },
                      ])
                    }
                    className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                  >
                    新增
                  </button>

                </div>
              )}

              {/* ============================
                  Tab: 圖片管理
                  ============================ */}
              {activeTab === "images" && (
                <div className="space-y-8">
                  <h2 className="mb-4 text-lg font-bold text-stone-800">
                    圖片管理
                  </h2>

                  {IMAGE_GROUPS.map((group) => (
                    <div key={group.group}>
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-stone-700">{group.group}</h3>
                        {"description" in group && group.description && (
                          <p className="mt-1 text-sm text-stone-500">{group.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {group.slots.map((slot) => {
                          const isBg = slot.key.endsWith("_bg");
                          const cfg = heroConfigs[slot.key];
                          const mode = cfg?.mode || "default";
                          const color = cfg?.color || "#44403c";
                          return (
                            <div
                              key={slot.key}
                              className="rounded-lg border border-stone-200 p-4"
                            >
                              <h4 className="mb-1 text-sm font-semibold text-stone-700">
                                {slot.label}
                              </h4>
                              <p className="mb-3 text-xs text-stone-400">{slot.hint}</p>

                              {/* Mode selector for bg slots */}
                              {isBg && (
                                <div className="mb-3">
                                  <label className="mb-1.5 block text-xs font-medium text-stone-600">顯示模式</label>
                                  <div className="flex gap-1">
                                    {([
                                      ["default", "預設漸層"],
                                      ["image", "背景圖"],
                                      ["color", "純色"],
                                    ] as const).map(([val, label]) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => {
                                          const updated = { ...heroConfigs, [slot.key]: { mode: val, color } };
                                          setHeroConfigs(updated);
                                        }}
                                        className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                                          mode === val
                                            ? "bg-amber-800 text-white"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Color picker for color mode */}
                              {isBg && mode === "color" && (
                                <div className="mb-3 flex items-center gap-2">
                                  <label className="text-xs font-medium text-stone-600">背景色</label>
                                  <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => {
                                      const updated = { ...heroConfigs, [slot.key]: { mode: "color", color: e.target.value } };
                                      setHeroConfigs(updated);
                                    }}
                                    className="h-8 w-10 cursor-pointer rounded border border-stone-300"
                                  />
                                  <span className="text-xs text-stone-500">{color}</span>
                                </div>
                              )}

                              {/* Preview */}
                              <div className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg ${
                                isBg
                                  ? mode === "color"
                                    ? "relative h-32"
                                    : "relative h-32 bg-stone-800"
                                  : "h-40 bg-stone-100"
                              }`} style={isBg && mode === "color" ? { backgroundColor: color } : undefined}>
                                {/* Show image preview (all modes except color for bg) */}
                                {(!isBg || mode !== "color") && (() => {
                                  const ts = imageTimestamps[slot.key];
                                  const dbSrc = `/api/images/${slot.key}?t=${ts || 0}`;
                                  const defaultSrc = DEFAULT_IMAGES[slot.key] || null;
                                  return (
                                    <>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        key={`${slot.key}-${ts || 0}`}
                                        src={dbSrc}
                                        alt={slot.label}
                                        className={isBg ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-contain"}
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          if (defaultSrc && !img.dataset.fallback) {
                                            img.dataset.fallback = "1";
                                            img.src = defaultSrc;
                                          } else {
                                            img.style.display = "none";
                                          }
                                        }}
                                        onLoad={(e) => {
                                          (e.target as HTMLImageElement).style.display = "block";
                                        }}
                                      />
                                    </>
                                  );
                                })()}
                                {/* Overlay + label for bg */}
                                {isBg && (mode === "image" || mode === "color") && (
                                  <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{slot.label}</span>
                                  </div>
                                )}
                                {/* Default state placeholder */}
                                {isBg && mode === "default" && (
                                  <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-br from-stone-50 to-amber-50">
                                    <span className="text-sm font-bold text-stone-600">{slot.label}</span>
                                  </div>
                                )}
                                {/* Fallback placeholder — only show when no default image exists */}
                                {!DEFAULT_IMAGES[slot.key] && (
                                  <div className="flex flex-col items-center justify-center text-stone-400">
                                    <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs">尚無圖片</span>
                                  </div>
                                )}
                              </div>

                              {/* Upload + Delete (show for non-bg, or bg in non-color mode) */}
                              {(!isBg || mode !== "color") && (
                                <div className="flex gap-2">
                                  <label className="flex-1 cursor-pointer rounded-lg bg-amber-800 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-amber-900">
                                    上傳圖片
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          openCropper(file, slot.key);
                                        }
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleImageDelete(slot.key)}
                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                  >
                                    刪除
                                  </button>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Action buttons */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handlePreview("/")}
                      className="rounded-lg border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
                    >
                      預覽全部頁面
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Unified Save Bar */}
      {dirtyTabs.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-amber-200 bg-amber-50/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-sm font-medium text-amber-900">未儲存：</span>
              <div className="flex flex-wrap gap-1.5">
                {dirtyTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-amber-800 text-white"
                        : "bg-amber-200 text-amber-900 hover:bg-amber-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {dirtyTabs.some((t) => t.key === activeTab) && (
                <button
                  onClick={() => saveTab(activeTab)}
                  className="rounded-lg border border-amber-800 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
                >
                  儲存此頁
                </button>
              )}
              <button
                onClick={saveAllDirty}
                className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 transition"
              >
                全部儲存{dirtyTabs.length > 1 ? ` (${dirtyTabs.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3">
              <h3 className="text-sm font-bold text-stone-800">裁切圖片</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 transition"
                >
                  確認裁切
                </button>
                <button
                  type="button"
                  onClick={() => { URL.revokeObjectURL(cropState.imageUrl); setCropState(null); }}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
                >
                  取消
                </button>
              </div>
            </div>
            <div className="relative h-[60vh]">
              <Cropper
                image={cropState.imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={cropState.aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="flex items-center gap-3 border-t border-stone-200 px-6 py-3">
              <span className="text-xs text-stone-500">縮放</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3">
              <h3 className="text-sm font-bold text-stone-800">
                預覽模式 — {previewUrl.replace("?preview=1", "")}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyPreview}
                  className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 transition"
                >
                  確認套用
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
                >
                  關閉
                </button>
              </div>
            </div>
            {/* iframe */}
            <iframe
              src={previewUrl}
              className="flex-1 w-full"
              title="頁面預覽"
            />
          </div>
        </div>
      )}
    </div>
  );
}
