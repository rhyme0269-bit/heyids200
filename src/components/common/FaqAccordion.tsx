"use client";

import { useState } from "react";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq._id;

        return (
          <div
            key={faq._id}
            className="border border-stone-200 rounded-lg overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-stone-50 transition-colors"
              onClick={() => toggle(faq._id)}
              aria-expanded={isOpen}
            >
              <span className="text-stone-800 font-medium pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-stone-500 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-6 pb-4 bg-stone-50 border-t border-stone-100">
                <p className="text-stone-600 leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
