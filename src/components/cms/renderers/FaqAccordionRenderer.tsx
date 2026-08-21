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
            <div key={index} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-stone-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-800 sm:px-6"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="pr-4 font-medium text-stone-800">{item.question}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-stone-500 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {/*
                Animating grid rows from 0fr to 1fr gives a smooth reveal without
                measuring heights in JS, and the answer stays in the DOM either way
                so the text is always present for search engines.
              */}
              <div
                id={`faq-answer-${index}`}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-stone-100 bg-stone-50 px-5 py-4 leading-relaxed text-stone-600 sm:px-6">
                    <RichAnswer text={item.answer} />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
