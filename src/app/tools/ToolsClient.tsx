"use client";

import { useState } from "react";
import type { Calculator, CalcInput, CalcResult } from "@/lib/calc-types";
import Link from "next/link";
import { evaluate, evaluateAll } from "@/lib/calc-engine";

// One field style for every input and select (#25 十九), 48px tall with a
// consistent focus ring so the calculators stop looking hand-assembled.
const FIELD_CLASS =
  "h-12 rounded-lg border border-stone-300 bg-white px-3 text-stone-800 " +
  "focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("zh-TW");
}

function InputFieldUI({
  input,
  value,
  onChange,
  fieldId,
}: {
  input: CalcInput;
  value: string;
  onChange: (v: string) => void;
  /** Scoped to the calculator, since input ids repeat across calculators. */
  fieldId: string;
}) {
  if (input.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={value === "1"}
          onChange={(e) => onChange(e.target.checked ? "1" : "0")}
          className="h-4 w-4 rounded border-stone-300 text-amber-800 accent-amber-800"
        />
        {input.label}
      </label>
    );
  }

  if (input.type === "select" && input.options) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="text-sm font-medium text-stone-700">
          {input.label}
        </label>
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FIELD_CLASS}
        >
          {input.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-stone-700">
        {input.label}
      </label>
      <input
        id={fieldId}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={input.placeholder}
        step={input.step}
        min={input.min}
        className={`${FIELD_CLASS} placeholder:text-stone-400`}
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200 py-1.5 last:border-0">
      <span className="text-sm text-stone-600">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}

function NoteText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <p className="mt-2 text-xs text-stone-500">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline break-all">
            前往試算
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

function LinkCard({ calc }: { calc: Calculator }) {
  const { links } = calc.definition;
  if (!links) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-stone-800">
        <span className="text-xl emoji-icon">{calc.icon}</span>
        {calc.title}
      </h2>
      <p className="mb-4 text-sm text-stone-500">{calc.description}</p>
      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
          >
            {link.label}
            <span className="text-stone-400">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DynamicCalculator({ calc }: { calc: Calculator }) {
  const { definition } = calc;
  const { inputs, formulas, results, total, notes, links } = definition;

  // Hooks must run before any early return, or React sees a different hook count
  // when a calculator changes between link-only and having inputs.
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const input of inputs) {
      init[input.id] = input.defaultValue ?? (input.type === "checkbox" ? "0" : "");
    }
    return init;
  });

  const [computed, setComputed] = useState<Record<string, number> | null>(null);

  const isLinkCard = !!links && links.length > 0 && inputs.length === 0;
  if (isLinkCard) return <LinkCard calc={calc} />;

  const handleCalc = () => {
    const numericValues: Record<string, number> = {};
    for (const input of inputs) {
      const raw = values[input.id] ?? "";
      if (input.type === "checkbox") {
        numericValues[input.id] = raw === "1" ? 1 : 0;
      } else if (input.type === "select") {
        const num = parseFloat(raw);
        numericValues[input.id] = isNaN(num) ? 0 : num;
      } else {
        numericValues[input.id] = parseFloat(raw) || 0;
      }
    }

    const result = evaluateAll(formulas, numericValues);
    setComputed(result);
  };

  const renderResultValue = (r: CalcResult, vars: Record<string, number>): string => {
    const val = vars[r.id] ?? 0;
    const prefix = r.prefix ?? "";
    return `${prefix}${fmt(val)}${r.suffix ? ` ${r.suffix}` : ""}`;
  };

  const shouldShow = (r: CalcResult, vars: Record<string, number>): boolean => {
    if (!r.showIf) return true;
    return !!evaluate(r.showIf, vars);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-800">
        <span className="text-xl emoji-icon">{calc.icon}</span>
        {calc.title}
      </h2>
      <div className="flex flex-col gap-3">
        {inputs.map((input) => {
          if (input.showIf) {
            const liveVars: Record<string, number> = {};
            for (const inp of inputs) {
              const raw = values[inp.id] ?? "";
              liveVars[inp.id] = inp.type === "checkbox" ? (raw === "1" ? 1 : 0) : (parseFloat(raw) || 0);
            }
            if (!evaluate(input.showIf, liveVars)) return null;
          }
          return (
            <InputFieldUI
              key={input.id}
              input={input}
              fieldId={`calc-${calc.id}-${input.id}`}
              value={values[input.id] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [input.id]: v }))}
            />
          );
        })}
        <button
          type="button"
          onClick={handleCalc}
          className="mt-2 h-[52px] w-full cursor-pointer rounded-xl bg-amber-800 px-4 font-semibold text-white transition-colors duration-200 hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 active:scale-[0.99]"
        >
          開始試算
        </button>
        {computed && (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            {results.map((r) =>
              shouldShow(r, computed) ? (
                <ResultRow key={r.id} label={r.label} value={renderResultValue(r, computed)} />
              ) : null
            )}
            <div className="mt-2 flex items-center justify-between border-t border-stone-300 pt-2">
              <span className="font-semibold text-stone-700">{total.label}</span>
              <span className="text-lg font-bold text-amber-800">
                {fmt(computed[total.id] ?? 0)}{total.suffix ? ` ${total.suffix}` : ""}
              </span>
            </div>
            {notes?.map((note, i) =>
              evaluate(note.condition, computed) ? (
                <NoteText key={i} text={note.text} />
              ) : null
            )}
            {/* Sits under the figures rather than over them — the office asked for
                no popup and nothing covering the result (#25 十九). */}
            <div className="mt-3 border-t border-amber-200 pt-3">
              <Link
                href="/contact"
                className="group inline-flex items-center text-sm font-medium text-amber-800 transition-colors duration-200 hover:text-amber-900"
              >
                對試算結果有疑問？立即諮詢地政士
                <svg
                  className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToolsClient({ calculators }: { calculators: Calculator[] }) {
  return (
    <section className="bg-gradient-to-b from-stone-50 to-amber-50 py-16">
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {calculators.map((calc) => (
            <DynamicCalculator key={calc.id} calc={calc} />
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-stone-500">
          以上試算結果僅供參考，實際稅費與貸款條件以各主管機關／金融機構核定為準。
        </p>
      </div>
    </section>
  );
}
