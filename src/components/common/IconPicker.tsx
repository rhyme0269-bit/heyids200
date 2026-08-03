"use client";

import { useState, useEffect, useRef } from "react";

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded border border-stone-300 px-2 py-2 text-center text-lg hover:bg-stone-50 cursor-pointer"
      >
        {value || placeholder || "😀"}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-lg border border-stone-200 bg-white shadow-lg p-3 space-y-2">
          {ICON_OPTIONS.map((group) => (
            <div key={group.group}>
              <div className="text-[10px] text-stone-400 font-medium mb-1">{group.group}</div>
              <div className="flex flex-wrap gap-1">
                {group.items.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={`w-8 h-8 flex items-center justify-center rounded text-lg hover:bg-amber-50 ${value === emoji ? "bg-amber-100 ring-1 ring-amber-400" : ""}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
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
