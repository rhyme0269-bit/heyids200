"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Calculator, CalcDefinition, CalcInput, CalcFormula, CalcResult, Expr } from "@/lib/calc-types";

const ICON_OPTIONS = [
  { group: "不動產", items: ["🏠", "🏡", "🏢", "🏗️", "🏘️", "🏰", "🏛️", "🏚️", "🏙️", "🪪"] },
  { group: "財務", items: ["💰", "💵", "💴", "💳", "🏦", "📈", "📉", "💹", "🧾", "🪙"] },
  { group: "法律", items: ["⚖️", "📜", "📋", "📝", "🔐", "🔑", "🗝️", "📑", "🏷️", "✅"] },
  { group: "工具", items: ["🔢", "🧮", "📊", "📐", "🔧", "⚙️", "🛠️", "💡", "🔍", "📌"] },
  { group: "自然", items: ["🌳", "🌿", "🌍", "🏔️", "🌊", "☀️", "🌙", "⭐", "🔥", "💧"] },
  { group: "人物", items: ["🤲", "🤝", "👨‍💼", "👩‍💼", "💬", "📞", "📧", "🎯", "❤️", "🎉"] },
];

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
        {value || "🔢"}
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
        </div>
      )}
    </div>
  );
}

const EMPTY_DEF: CalcDefinition = {
  inputs: [],
  formulas: [],
  results: [],
  total: { id: "", label: "", suffix: "元" },
};

function exprToString(expr: Expr): string {
  if (expr === null) return "null";
  if (typeof expr === "number") return String(expr);
  if (typeof expr === "string") return expr;
  if (Array.isArray(expr)) return JSON.stringify(expr);
  return String(expr);
}

function parseExpr(s: string): Expr {
  const trimmed = s.trim();
  if (trimmed === "null") return null;
  if (trimmed.startsWith("$")) return trimmed;
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== "") return num;
  try { return JSON.parse(trimmed); } catch { return trimmed; }
}

function InputEditor({
  input,
  onChange,
  onRemove,
}: {
  input: CalcInput;
  onChange: (updated: CalcInput) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-stone-400">{input.id}</span>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700">移除</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-stone-500">ID</label>
          <input
            className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={input.id}
            onChange={(e) => onChange({ ...input, id: e.target.value.replace(/[^a-z0-9_]/g, "") })}
          />
        </div>
        <div>
          <label className="text-xs text-stone-500">類型</label>
          <select
            className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={input.type}
            onChange={(e) => onChange({ ...input, type: e.target.value as CalcInput["type"] })}
          >
            <option value="number">數字</option>
            <option value="select">下拉選單</option>
            <option value="checkbox">勾選框</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-500">標籤</label>
        <input
          className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
          value={input.label}
          onChange={(e) => onChange({ ...input, label: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-stone-500">預設值</label>
          <input
            className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={input.defaultValue ?? ""}
            onChange={(e) => onChange({ ...input, defaultValue: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="text-xs text-stone-500">提示文字</label>
          <input
            className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
            value={input.placeholder ?? ""}
            onChange={(e) => onChange({ ...input, placeholder: e.target.value || undefined })}
          />
        </div>
      </div>
      {input.type === "select" && (
        <div>
          <label className="text-xs text-stone-500">選項（每行 value|label）</label>
          <textarea
            className="w-full rounded border border-stone-300 px-2 py-1 text-sm font-mono"
            rows={4}
            value={(input.options ?? []).map((o) => `${o.value}|${o.label}`).join("\n")}
            onChange={(e) => {
              const options = e.target.value
                .split("\n")
                .filter((l) => l.includes("|"))
                .map((l) => {
                  const [value, ...rest] = l.split("|");
                  return { value: value.trim(), label: rest.join("|").trim() };
                });
              onChange({ ...input, options });
            }}
          />
        </div>
      )}
    </div>
  );
}

function FormulaEditor({
  formula,
  onChange,
  onRemove,
  itemIds,
}: {
  formula: CalcFormula;
  onChange: (updated: CalcFormula) => void;
  onRemove: () => void;
  itemIds: string[];
}) {
  const [exprText, setExprText] = useState(exprToString(formula.expr));
  const [error, setError] = useState("");

  const handleBlur = () => {
    try {
      const parsed = parseExpr(exprText);
      onChange({ ...formula, expr: parsed });
      setError("");
    } catch {
      setError("JSON 格式錯誤");
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-stone-400">{formula.id}</span>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700">移除</button>
      </div>
      <div>
        <label className="text-xs text-stone-500">ID</label>
        <input
          className="w-full rounded border border-stone-300 px-2 py-1 text-sm font-mono"
          value={formula.id}
          onChange={(e) => onChange({ ...formula, id: e.target.value.replace(/[^a-z0-9_]/g, "") })}
        />
      </div>
      <div>
        <label className="text-xs text-stone-500">
          公式（可用：{itemIds.map((id) => `$${id}`).join(", ")}）
        </label>
        <textarea
          className={`w-full rounded border px-2 py-1 text-sm font-mono ${error ? "border-red-400" : "border-stone-300"}`}
          rows={2}
          value={exprText}
          onChange={(e) => setExprText(e.target.value)}
          onBlur={handleBlur}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function ResultEditor({
  result,
  onChange,
  onRemove,
}: {
  result: CalcResult;
  onChange: (updated: CalcResult) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        className="w-24 rounded border border-stone-300 px-2 py-1 text-sm font-mono"
        value={result.id}
        onChange={(e) => onChange({ ...result, id: e.target.value.replace(/[^a-z0-9_]/g, "") })}
        placeholder="ID"
      />
      <input
        className="flex-1 rounded border border-stone-300 px-2 py-1 text-sm"
        value={result.label}
        onChange={(e) => onChange({ ...result, label: e.target.value })}
        placeholder="顯示名稱"
      />
      <input
        className="w-16 rounded border border-stone-300 px-2 py-1 text-sm"
        value={result.suffix ?? ""}
        onChange={(e) => onChange({ ...result, suffix: e.target.value || undefined })}
        placeholder="單位"
      />
      <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 shrink-0">✕</button>
    </div>
  );
}

function CalcDetailEditor({
  calc,
  onSave,
  onCancel,
}: {
  calc: Calculator;
  onSave: (updated: Partial<Calculator> & { definition: CalcDefinition }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(calc.title);
  const [icon, setIcon] = useState(calc.icon);
  const [desc, setDesc] = useState(calc.description);
  const [def, setDef] = useState<CalcDefinition>(calc.definition);

  const allIds = [...def.inputs.map((i) => i.id), ...def.formulas.map((f) => f.id)];

  const addInput = () => {
    const id = `input_${def.inputs.length + 1}`;
    setDef((d) => ({
      ...d,
      inputs: [...d.inputs, { id, label: "新輸入欄位", type: "number" }],
    }));
  };

  const addFormula = () => {
    const id = `calc_${def.formulas.length + 1}`;
    setDef((d) => ({
      ...d,
      formulas: [...d.formulas, { id, expr: 0 }],
    }));
  };

  const addResult = () => {
    setDef((d) => ({
      ...d,
      results: [...d.results, { id: "", label: "", suffix: "元" }],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="text-sm text-stone-500 hover:text-stone-700">&larr; 返回列表</button>
      </div>

      <div className="grid grid-cols-[4rem_1fr] gap-3">
        <div>
          <label className="text-xs text-stone-500">圖示</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        <div>
          <label className="text-xs text-stone-500">名稱</label>
          <input
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-stone-500">說明</label>
        <input
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-stone-700">輸入欄位</h4>
          <button onClick={addInput} className="text-xs text-amber-800 hover:text-amber-900 font-medium">+ 新增</button>
        </div>
        <div className="space-y-2">
          {def.inputs.map((input, i) => (
            <InputEditor
              key={i}
              input={input}
              onChange={(updated) => {
                const inputs = [...def.inputs];
                inputs[i] = updated;
                setDef((d) => ({ ...d, inputs }));
              }}
              onRemove={() => {
                setDef((d) => ({ ...d, inputs: d.inputs.filter((_, j) => j !== i) }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Formulas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-stone-700">計算公式</h4>
          <button onClick={addFormula} className="text-xs text-amber-800 hover:text-amber-900 font-medium">+ 新增</button>
        </div>
        <div className="space-y-2">
          {def.formulas.map((formula, i) => (
            <FormulaEditor
              key={i}
              formula={formula}
              itemIds={allIds}
              onChange={(updated) => {
                const formulas = [...def.formulas];
                formulas[i] = updated;
                setDef((d) => ({ ...d, formulas }));
              }}
              onRemove={() => {
                setDef((d) => ({ ...d, formulas: d.formulas.filter((_, j) => j !== i) }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-stone-700">結果顯示</h4>
          <button onClick={addResult} className="text-xs text-amber-800 hover:text-amber-900 font-medium">+ 新增</button>
        </div>
        <div className="space-y-2">
          {def.results.map((result, i) => (
            <ResultEditor
              key={i}
              result={result}
              onChange={(updated) => {
                const results = [...def.results];
                results[i] = updated;
                setDef((d) => ({ ...d, results }));
              }}
              onRemove={() => {
                setDef((d) => ({ ...d, results: d.results.filter((_, j) => j !== i) }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Total */}
      <div>
        <h4 className="text-sm font-semibold text-stone-700 mb-2">總計列</h4>
        <div className="flex items-center gap-2">
          <input
            className="w-24 rounded border border-stone-300 px-2 py-1 text-sm font-mono"
            value={def.total.id}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, id: e.target.value } }))}
            placeholder="公式 ID"
          />
          <input
            className="flex-1 rounded border border-stone-300 px-2 py-1 text-sm"
            value={def.total.label}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, label: e.target.value } }))}
            placeholder="顯示名稱"
          />
          <input
            className="w-16 rounded border border-stone-300 px-2 py-1 text-sm"
            value={def.total.suffix ?? ""}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, suffix: e.target.value || undefined } }))}
            placeholder="單位"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({ title, icon, description: desc, definition: def })}
          className="rounded-lg bg-amber-800 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          儲存
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-stone-300 px-6 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function CalcEditor() {
  const [calcs, setCalcs] = useState<Calculator[]>([]);
  const [editing, setEditing] = useState<Calculator | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCalcs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/calculators", {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) setCalcs(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalcs();
  }, [fetchCalcs]);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/calculators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "新計算器",
        icon: "🔢",
        description: "",
        definition: EMPTY_DEF,
      }),
    });
    if (res.ok) {
      const calc = await res.json();
      await fetchCalcs();
      setEditing(calc);
    }
  };

  const handleSave = async (data: Partial<Calculator> & { definition: CalcDefinition }) => {
    if (!editing) return;
    const res = await fetch(`/api/admin/calculators/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchCalcs();
      setEditing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此計算器？")) return;
    await fetch(`/api/admin/calculators/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    await fetchCalcs();
  };

  const handleToggleVisibility = async (calc: Calculator) => {
    await fetch(`/api/admin/calculators/${calc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !calc.isVisible }),
    });
    await fetchCalcs();
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= calcs.length) return;
    const ids = calcs.map((c) => c.id);
    [ids[index], ids[swapIdx]] = [ids[swapIdx], ids[index]];
    await fetch("/api/admin/calculators", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    await fetchCalcs();
  };

  if (editing) {
    return <CalcDetailEditor calc={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-stone-800">計算器管理</h3>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          新增計算器
        </button>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">載入中...</p>
      ) : (
        <div className="space-y-2">
          {calcs.map((calc, idx) => (
            <div
              key={calc.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="text-stone-400 hover:text-stone-700 disabled:opacity-20 disabled:cursor-default text-xs leading-none"
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === calcs.length - 1}
                    className="text-stone-400 hover:text-stone-700 disabled:opacity-20 disabled:cursor-default text-xs leading-none"
                    title="下移"
                  >
                    ▼
                  </button>
                </div>
                <span className="text-xl">{calc.icon}</span>
                <div>
                  <div className="font-medium text-stone-800">
                    {calc.title}
                    {calc.isSystem && <span className="ml-2 text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">系統</span>}
                    {!calc.isVisible && <span className="ml-2 text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">隱藏</span>}
                  </div>
                  <div className="text-xs text-stone-400">
                    {calc.definition.inputs.length} 個輸入 · {calc.definition.formulas.length} 個公式
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(calc)}
                  className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded border border-stone-200"
                >
                  {calc.isVisible ? "隱藏" : "顯示"}
                </button>
                <button
                  onClick={() => setEditing(calc)}
                  className="text-xs text-amber-800 hover:text-amber-900 px-2 py-1 rounded border border-amber-200"
                >
                  編輯
                </button>
                {!calc.isSystem && (
                  <button
                    onClick={() => handleDelete(calc.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200"
                  >
                    刪除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
