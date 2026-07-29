"use client";

import { useState } from "react";
import type { FaqAccordionData } from "@/lib/cms-types";

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
                  <p className="text-stone-600 leading-relaxed pt-4">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
