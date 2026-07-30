"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { DEFAULT_IMAGES } from "@/lib/default-images";
import PageBuilder from "./PageBuilder";
import ManualContent from "./ManualContent";

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
  logoSize: string;
}


/* ============================================================
   Constants
   ============================================================ */

const TABS = [
  { key: "pages", label: "頁面管理" },
  { key: "settings", label: "基本資訊" },
  { key: "images", label: "圖片管理" },
  { key: "manual", label: "使用手冊" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface ImageGroup {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

interface ImageSlot {
  key: string;
  groupId: string;
  label: string;
  hint: string;
  sortOrder: number;
  isSystem: boolean;
  aspectRatio: string;
  slotType: string;
}

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
  const [activeTab, setActiveTabState] = useState<TabKey>("pages");

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
    logoSize: "medium",
  });

  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  const [imageTimestamps, setImageTimestamps] = useState<
    Record<string, number>
  >({});
  const [heroConfigs, setHeroConfigs] = useState<
    Record<string, { mode: string; color: string }>
  >({});
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [showAddSlot, setShowAddSlot] = useState<string | null>(null);
  const [newSlotKey, setNewSlotKey] = useState("");
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [newSlotHint, setNewSlotHint] = useState("");
  const [newSlotAspect, setNewSlotAspect] = useState("3:4");
  const [newSlotType, setNewSlotType] = useState("general");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<{
    imageUrl: string;
    key: string;
    aspect: number;
    mimeType: string;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaRef = useRef<Area | null>(null);

  /* ------ Dirty tracking ------ */
  const savedSnapshots = useRef<Record<string, string>>({});

  const getTabPayload = useCallback((tab: string): string => {
    switch (tab) {
      case "settings": return JSON.stringify(settings);
      case "heroConfigs": return JSON.stringify(heroConfigs);
      default: return "";
    }
  }, [settings, heroConfigs]);

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
          case "pages":
          case "manual":
            setLoading(false);
            return;
          case "settings":
            url = "/api/admin/settings";
            break;
          case "images": {
            const [imgRes, heroRes] = await Promise.all([
              fetch("/api/admin/images", { headers: authHeaders() }),
              fetch("/api/admin/hero-config", { headers: authHeaders() }),
            ]);
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              setImageGroups(imgData.groups || []);
              setImageSlots(imgData.slots || []);
              if (imgData.images?.length) {
                const ts: Record<string, number> = {};
                for (const img of imgData.images) ts[img.key] = new Date(img.updated_at).getTime() || Date.now();
                setImageTimestamps((prev) => ({ ...ts, ...prev }));
              }
            }
            if (heroRes.ok) {
              const heroData = await heroRes.json();
              setHeroConfigs(heroData);
              savedSnapshots.current["heroConfigs"] = JSON.stringify(heroData);
            }
            setLoading(false);
            return;
          }
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
      setImageTimestamps((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch {
      showToast("圖片刪除失敗", "error");
    }
  };

  const openCropper = (file: File, key: string) => {
    const url = URL.createObjectURL(file);
    const slot = imageSlots.find(s => s.key === key);
    const ratioStr = slot?.aspectRatio || "3:4";
    let aspect: number | undefined;
    if (ratioStr !== "free") {
      const parts = ratioStr.split(":").map(Number);
      aspect = parts.length === 2 && parts[1] ? parts[0] / parts[1] : 3 / 4;
    }
    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
    setCropState({ imageUrl: url, key, aspect: aspect ?? 0, mimeType });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    croppedAreaRef.current = null;
  };

  const handleCropComplete = useCallback((_: Area, croppedArea: Area) => {
    croppedAreaRef.current = croppedArea;
  }, []);

  const handleCropConfirm = async () => {
    if (!cropState || !croppedAreaRef.current) return;
    const { imageUrl, key, mimeType } = cropState;
    const area = croppedAreaRef.current;

    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement("canvas");
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

    const isPng = mimeType === "image/png";
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), isPng ? "image/png" : "image/jpeg", isPng ? undefined : 0.9)
    );

    URL.revokeObjectURL(imageUrl);
    setCropState(null);

    const ext = isPng ? "png" : "jpg";
    const file = new File([blob], `${key}.${ext}`, { type: mimeType });
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

  const refreshImageLibrary = async () => {
    const res = await fetch("/api/admin/images", { headers: authHeaders() });
    if (res.ok) {
      const data = await res.json();
      setImageGroups(data.groups || []);
      setImageSlots(data.slots || []);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    const res = await fetch("/api/admin/image-groups", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name: newGroupName.trim(), description: newGroupDesc.trim() }),
    });
    if (res.ok) {
      showToast("群組新增成功", "success");
      setNewGroupName("");
      setNewGroupDesc("");
      setShowAddGroup(false);
      await refreshImageLibrary();
    } else {
      const data = await res.json();
      showToast(data.error || "新增失敗", "error");
    }
  };

  const handleUpdateGroup = async (id: string) => {
    const res = await fetch("/api/admin/image-groups", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ id, name: editGroupName.trim(), description: editGroupDesc.trim() }),
    });
    if (res.ok) {
      showToast("群組更新成功", "success");
      setEditingGroup(null);
      await refreshImageLibrary();
    } else {
      const data = await res.json();
      showToast(data.error || "更新失敗", "error");
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`確定要刪除群組「${name}」嗎？其中所有自訂圖片欄位和圖片都會被一併刪除。`)) return;
    const res = await fetch("/api/admin/image-groups", {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      showToast("群組刪除成功", "success");
      await refreshImageLibrary();
    } else {
      const data = await res.json();
      showToast(data.error || "刪除失敗", "error");
    }
  };

  const handleAddSlot = async (groupId: string) => {
    if (!newSlotKey.trim() || !newSlotLabel.trim()) return;
    const res = await fetch("/api/admin/image-slots", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        key: newSlotKey.trim().toLowerCase(),
        groupId,
        label: newSlotLabel.trim(),
        hint: newSlotHint.trim(),
        aspectRatio: newSlotAspect,
        slotType: newSlotType,
      }),
    });
    if (res.ok) {
      showToast("圖片欄位新增成功", "success");
      setNewSlotKey("");
      setNewSlotLabel("");
      setNewSlotHint("");
      setNewSlotAspect("3:4");
      setNewSlotType("general");
      setShowAddSlot(null);
      await refreshImageLibrary();
    } else {
      const data = await res.json();
      showToast(data.error || "新增失敗", "error");
    }
  };

  const handleDeleteSlot = async (key: string, label: string) => {
    if (!confirm(`確定要刪除圖片欄位「${label}」嗎？對應的圖片也會被刪除。`)) return;
    const res = await fetch("/api/admin/image-slots", {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      showToast("圖片欄位刪除成功", "success");
      await refreshImageLibrary();
    } else {
      const data = await res.json();
      showToast(data.error || "刪除失敗", "error");
    }
  };

  const handleUpdateSlotAspect = async (key: string, aspectRatio: string) => {
    const res = await fetch("/api/admin/image-slots", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ key, aspectRatio }),
    });
    if (res.ok) {
      setImageSlots((prev) => prev.map((s) => s.key === key ? { ...s, aspectRatio } : s));
    } else {
      showToast("比例更新失敗", "error");
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
                  Tab: 頁面管理
                  ============================ */}
              {activeTab === "pages" && (
                <PageBuilder showToast={showToast} />
              )}

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

                  <div className="mt-6 pt-6 border-t border-stone-200">
                    <label className="mb-2 block text-sm font-medium text-stone-700">Logo 顯示大小</label>
                    <div className="flex gap-2">
                      {([["small", "小"], ["medium", "中"], ["large", "大"], ["xlarge", "特大"]] as const).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSettings((prev) => ({ ...prev, logoSize: val }))}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${settings.logoSize === val ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-stone-400">調整網站左上角 Logo 圖片的顯示大小</p>
                  </div>

                </div>
              )}

              {/* ============================
                  Tab: 圖片管理
                  ============================ */}
              {activeTab === "images" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-stone-800">圖片庫</h2>
                    <button
                      type="button"
                      onClick={() => setShowAddGroup(true)}
                      className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 transition"
                    >
                      + 新增群組
                    </button>
                  </div>

                  {/* Add Group Form */}
                  {showAddGroup && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-stone-700">新增圖片群組</h4>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="群組名稱"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                      <input
                        type="text"
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        placeholder="群組說明（選填）"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={handleAddGroup} className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900">確認</button>
                        <button type="button" onClick={() => { setShowAddGroup(false); setNewGroupName(""); setNewGroupDesc(""); }} className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">取消</button>
                      </div>
                    </div>
                  )}

                  {imageGroups.map((group) => {
                    const groupSlots = imageSlots.filter(s => s.groupId === group.id);
                    const hasSystemSlots = groupSlots.some(s => s.isSystem);
                    return (
                      <div key={group.id}>
                        <div className="mb-4">
                          {editingGroup === group.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editGroupName}
                                onChange={(e) => setEditGroupName(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                              <input
                                type="text"
                                value={editGroupDesc}
                                onChange={(e) => setEditGroupDesc(e.target.value)}
                                placeholder="群組說明（選填）"
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => handleUpdateGroup(group.id)} className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900">儲存</button>
                                <button type="button" onClick={() => setEditingGroup(null)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50">取消</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-stone-700">{group.name}</h3>
                              <button
                                type="button"
                                onClick={() => { setEditingGroup(group.id); setEditGroupName(group.name); setEditGroupDesc(group.description); }}
                                className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-amber-800 hover:bg-stone-100"
                                title="編輯群組"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                              </button>
                              {!hasSystemSlots && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGroup(group.id, group.name)}
                                  className="rounded px-2 py-0.5 text-xs text-stone-400 hover:text-red-600 hover:bg-red-50"
                                  title="刪除群組"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                </button>
                              )}
                            </div>
                          )}
                          {group.description && editingGroup !== group.id && (
                            <p className="mt-1 text-sm text-stone-500">{group.description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {groupSlots.map((slot) => {
                            const isBg = slot.slotType === "background";
                            const cfg = heroConfigs[slot.key];
                            const mode = cfg?.mode || "default";
                            const color = cfg?.color || "#44403c";
                            return (
                              <div key={slot.key} className="rounded-lg border border-stone-200 p-4">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-semibold text-stone-700">{slot.label}</h4>
                                  {!slot.isSystem && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(slot.key, slot.label)}
                                      className="rounded p-1 text-stone-400 hover:text-red-600 hover:bg-red-50"
                                      title="刪除欄位"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  )}
                                </div>
                                <p className="mb-1 text-xs text-stone-400">{slot.hint}</p>
                                <div className="mb-3 flex items-center gap-1">
                                  <select
                                    value={slot.aspectRatio}
                                    onChange={(e) => handleUpdateSlotAspect(slot.key, e.target.value)}
                                    className="rounded border border-stone-200 px-1.5 py-0.5 text-xs text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-800"
                                    title="裁切比例"
                                  >
                                    <option value="1:1">1:1</option>
                                    <option value="3:4">3:4</option>
                                    <option value="4:3">4:3</option>
                                    <option value="16:9">16:9</option>
                                    <option value="16:6">16:6</option>
                                    <option value="2:1">2:1</option>
                                    <option value="free">自由</option>
                                  </select>
                                  <span className="text-[10px] text-stone-300">裁切比例</span>
                                </div>

                                {isBg && (
                                  <div className="mb-3">
                                    <label className="mb-1.5 block text-xs font-medium text-stone-600">顯示模式</label>
                                    <div className="flex gap-1">
                                      {([["default", "預設漸層"], ["image", "背景圖"], ["color", "純色"]] as const).map(([val, lbl]) => (
                                        <button
                                          key={val}
                                          type="button"
                                          onClick={() => { setHeroConfigs({ ...heroConfigs, [slot.key]: { mode: val, color } }); }}
                                          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${mode === val ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                                        >
                                          {lbl}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {isBg && mode === "color" && (
                                  <div className="mb-3 flex items-center gap-2">
                                    <label className="text-xs font-medium text-stone-600">背景色</label>
                                    <input type="color" value={color} onChange={(e) => { setHeroConfigs({ ...heroConfigs, [slot.key]: { mode: "color", color: e.target.value } }); }} className="h-8 w-10 cursor-pointer rounded border border-stone-300" />
                                    <span className="text-xs text-stone-500">{color}</span>
                                  </div>
                                )}

                                <div className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg ${isBg ? mode === "color" ? "relative h-32" : "relative h-32 bg-stone-800" : "h-40 bg-stone-100"}`} style={isBg && mode === "color" ? { backgroundColor: color } : undefined}>
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
                                            if (defaultSrc && !img.dataset.fallback) { img.dataset.fallback = "1"; img.src = defaultSrc; } else { img.style.display = "none"; }
                                          }}
                                          onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                                        />
                                      </>
                                    );
                                  })()}
                                  {isBg && (mode === "image" || mode === "color") && (
                                    <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center"><span className="text-white text-sm font-bold">{slot.label}</span></div>
                                  )}
                                  {isBg && mode === "default" && (
                                    <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-br from-stone-50 to-amber-50"><span className="text-sm font-bold text-stone-600">{slot.label}</span></div>
                                  )}
                                  {!DEFAULT_IMAGES[slot.key] && !isBg && !imageTimestamps[slot.key] && (
                                    <div className="flex flex-col items-center justify-center text-stone-400">
                                      <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                      <span className="text-xs">尚無圖片</span>
                                    </div>
                                  )}
                                </div>

                                {(!isBg || mode !== "color") && (
                                  <div className="flex gap-2">
                                    <label className="flex-1 cursor-pointer rounded-lg bg-amber-800 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-amber-900">
                                      上傳圖片
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) openCropper(file, slot.key); e.target.value = ""; }} />
                                    </label>
                                    <button type="button" onClick={() => handleImageDelete(slot.key)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">刪除</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add Slot button */}
                          <div
                            className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-200 p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition"
                            onClick={() => { setShowAddSlot(group.id); setNewSlotKey(""); setNewSlotLabel(""); setNewSlotHint(""); setNewSlotAspect("3:4"); setNewSlotType("general"); }}
                          >
                            <span className="text-sm text-stone-400">+ 新增圖片欄位</span>
                          </div>
                        </div>

                        {/* Add Slot Form */}
                        {showAddSlot === group.id && (
                          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-stone-700">新增圖片欄位到「{group.name}」</h4>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">Key（英文小寫、數字、底線）</label>
                                <input type="text" value={newSlotKey} onChange={(e) => setNewSlotKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="例如: custom_photo" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">顯示名稱</label>
                                <input type="text" value={newSlotLabel} onChange={(e) => setNewSlotLabel(e.target.value)} placeholder="例如: 自訂照片" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">提示文字（選填）</label>
                                <input type="text" value={newSlotHint} onChange={(e) => setNewSlotHint(e.target.value)} placeholder="說明這張圖的用途" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">裁切比例</label>
                                <select value={newSlotAspect} onChange={(e) => setNewSlotAspect(e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800">
                                  <option value="3:4">3:4（直式）</option>
                                  <option value="4:3">4:3（橫式）</option>
                                  <option value="1:1">1:1（正方形）</option>
                                  <option value="16:9">16:9（寬螢幕）</option>
                                  <option value="16:6">16:6（橫幅背景）</option>
                                  <option value="2:1">2:1（寬橫式）</option>
                                  <option value="free">自由裁切</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-stone-600">類型</label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => setNewSlotType("general")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${newSlotType === "general" ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-600"}`}>一般圖片</button>
                                <button type="button" onClick={() => setNewSlotType("background")} className={`rounded-md px-3 py-1.5 text-xs font-medium ${newSlotType === "background" ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-600"}`}>背景圖（含模式選擇）</button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleAddSlot(group.id)} className="rounded-lg bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900">新增</button>
                              <button type="button" onClick={() => setShowAddSlot(null)} className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">取消</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

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

              {/* ============================
                  Tab: 使用手冊
                  ============================ */}
              {activeTab === "manual" && (
                <ManualContent />
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
                aspect={cropState.aspect || undefined}
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
