"use client";

import { useState } from "react";
import type { FaqAccordionData } from "@/lib/cms-types";

function RichAnswer({ text }: { text: string }) {
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<{ type: "text"; value: string } | { type: "link"; label: string; url: string }> = [];
  let lastIndex = 0;
  let match;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    parts.push({ type: "link", label: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });
  if (parts.length === 0) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.type === "link" ? (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline hover:text-amber-900">
            {p.label}
          </a>
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </>
  );
}

export default function FaqAccordionRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as FaqAccordionData;
  const items = d.items ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div>
      {d.title && (
        <h2 className="text-2xl font-bold text-stone-800 mb-6">{d.title}</h2>
      )}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="border border-stone-200 rounded-lg overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-stone-50 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="text-stone-800 font-medium pr-4">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-stone-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-6 pb-4 bg-stone-50 border-t border-stone-100">
                  <p className="text-stone-600 leading-relaxed pt-4">
                    <RichAnswer text={item.answer} />
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
