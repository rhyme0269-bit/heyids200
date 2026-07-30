"use client";

import { useState } from "react";
import type { Calculator, CalcInput, CalcResult } from "@/lib/calc-types";
import { evaluate, evaluateAll } from "@/lib/calc-engine";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("zh-TW");
}

function InputFieldUI({
  input,
  value,
  onChange,
}: {
  input: CalcInput;
  value: string;
  onChange: (v: string) => void;
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
        <label className="text-sm font-medium text-stone-700">{input.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
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
      <label className="text-sm font-medium text-stone-700">{input.label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={input.placeholder}
        step={input.step}
        min={input.min}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
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
        <span className="text-xl">{calc.icon}</span>
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

  if (links && links.length > 0 && inputs.length === 0) {
    return <LinkCard calc={calc} />;
  }

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const input of inputs) {
      init[input.id] = input.defaultValue ?? (input.type === "checkbox" ? "0" : "");
    }
    return init;
  });

  const [computed, setComputed] = useState<Record<string, number> | null>(null);

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
    if (r.id === "rate_display") {
      const rateId = r.id.replace("_display", "");
      const rateVal = vars[rateId] ?? 0;
      return `${(rateVal * 100).toFixed(0)}%`;
    }
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
        <span className="text-xl">{calc.icon}</span>
        {calc.title}
      </h2>
      <div className="flex flex-col gap-3">
        {inputs.map((input) => (
          <InputFieldUI
            key={input.id}
            input={input}
            value={values[input.id] ?? ""}
            onChange={(v) => setValues((prev) => ({ ...prev, [input.id]: v }))}
          />
        ))}
        <button
          type="button"
          onClick={handleCalc}
          className="mt-2 w-full cursor-pointer rounded-lg bg-amber-800 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-900 active:scale-[0.98]"
        >
          開始試算
        </button>
        {computed && (
          <div className="mt-2 rounded-lg bg-stone-50 p-4">
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
