"use client";

import { useState, useEffect, useRef } from "react";
import ServiceIcon, { SERVICE_ICON_KEYS, SERVICE_ICON_LABELS } from "@/components/common/ServiceIcon";

/**
 * 圖示選擇器。
 *
 * 「事務所圖示」是 #32 那組線條圖示，為預設選擇；下方的 emoji 保留，因為舊資料
 * 存的是 emoji，且客戶仍可能想用。兩者都存進同一個欄位，由 ServiceIcon 判斷該
 * 畫 SVG 還是原樣輸出。
 */
export const ICON_OPTIONS = [
  { group: "不動產", items: ["🏠", "🏡", "🏢", "🏗️", "🏘️", "🏰", "🏛️", "🏚️", "🏙️", "🪪"] },
  { group: "財務", items: ["💰", "💵", "💴", "💳", "🏦", "📈", "📉", "💹", "🧾", "🪙"] },
  { group: "法律", items: ["⚖️", "📜", "📋", "📝", "🔐", "🔑", "🗝️", "📑", "🏷️", "✅"] },
  { group: "工具", items: ["🔢", "🧮", "📊", "📐", "🔧", "⚙️", "🛠️", "💡", "🔍", "📌"] },
  { group: "自然", items: ["🌳", "🌿", "🌍", "🏔️", "🌊", "☀️", "🌙", "⭐", "🔥", "💧"] },
  { group: "人物", items: ["🤲", "🤝", "👨‍💼", "👩‍💼", "💬", "📞", "📧", "🎯", "❤️", "🎉"] },
];

export default function IconPicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center rounded border border-stone-300 px-2 py-2 text-center text-lg hover:bg-stone-50 cursor-pointer"
      >
        {value ? <ServiceIcon icon={value} className="h-6 w-6" /> : <span>{placeholder || "😀"}</span>}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 max-h-96 overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg p-3 space-y-3">
          <div>
            <div className="text-[10px] text-stone-400 font-medium mb-1">事務所圖示（建議）</div>
            <div className="grid grid-cols-4 gap-1">
              {SERVICE_ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  title={SERVICE_ICON_LABELS[key]}
                  onClick={() => pick(key)}
                  className={`flex flex-col items-center gap-1 rounded px-1 py-1.5 hover:bg-amber-50 ${value === key ? "bg-amber-100 ring-1 ring-amber-400" : ""}`}
                >
                  <ServiceIcon icon={key} className="h-6 w-6 text-stone-700" />
                  <span className="text-[9px] leading-none text-stone-500">{SERVICE_ICON_LABELS[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-200 pt-2 space-y-2">
            <div className="text-[10px] text-stone-400 font-medium">表情符號</div>
            {ICON_OPTIONS.map((group) => (
              <div key={group.group}>
                <div className="text-[10px] text-stone-400 mb-1">{group.group}</div>
                <div className="flex flex-wrap gap-1">
                  {group.items.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => pick(emoji)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-lg hover:bg-amber-50 ${value === emoji ? "bg-amber-100 ring-1 ring-amber-400" : ""}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => pick("")}
              className="w-full text-xs text-stone-400 hover:text-red-500 py-1"
            >
              清除圖示
            </button>
          )}
        </div>
      )}
    </div>
  );
}
