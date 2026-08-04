"use client";

import { useState, useEffect, useCallback } from "react";
import type { Calculator, CalcDefinition, CalcInput, CalcFormula, CalcResult, Expr } from "@/lib/calc-types";
import IconPicker from "@/components/common/IconPicker";
import FormulaBuilder from "@/components/common/FormulaBuilder";

const EMPTY_DEF: CalcDefinition = {
  inputs: [],
  formulas: [],
  results: [],
  total: { id: "", label: "", suffix: "元" },
};


function InputEditor({
  input,
  onChange,
  onRemove,
  duplicateId,
  checkboxInputs,
}: {
  input: CalcInput;
  onChange: (updated: CalcInput) => void;
  onRemove: () => void;
  duplicateId?: boolean;
  checkboxInputs?: Array<{ id: string; label: string }>;
}) {
  const showIfId = typeof input.showIf === "string" && input.showIf.startsWith("$")
    ? input.showIf.slice(1)
    : "";

  return (
    <div className={`rounded-lg border bg-stone-50 p-4 space-y-3 ${duplicateId ? "border-red-300" : "border-stone-200"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-stone-400">{input.id}</span>
          {input.showIf && (
            <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">
              條件顯示
            </span>
          )}
        </div>
        <button onClick={onRemove} className="text-sm text-red-500 hover:text-red-700">移除</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-stone-500 mb-1 block">ID</label>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-base ${duplicateId ? "border-red-400 bg-red-50" : "border-stone-300"}`}
            value={input.id}
            onChange={(e) => onChange({ ...input, id: e.target.value.replace(/[^a-z0-9_]/g, "") })}
          />
          {duplicateId && <p className="text-xs text-red-500 mt-1">ID 重複，請修改</p>}
        </div>
        <div>
          <label className="text-sm text-stone-500 mb-1 block">類型</label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
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
        <label className="text-sm text-stone-500 mb-1 block">標籤</label>
        <input
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
          value={input.label}
          onChange={(e) => onChange({ ...input, label: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-stone-500 mb-1 block">預設值</label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={input.defaultValue ?? ""}
            onChange={(e) => onChange({ ...input, defaultValue: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="text-sm text-stone-500 mb-1 block">提示文字</label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={input.placeholder ?? ""}
            onChange={(e) => onChange({ ...input, placeholder: e.target.value || undefined })}
          />
        </div>
      </div>
      {checkboxInputs && checkboxInputs.length > 0 && input.type !== "checkbox" && (
        <div>
          <label className="text-sm text-stone-500 mb-1 block">顯示條件</label>
          <select
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={showIfId}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                onChange({ ...input, showIf: `$${v}` });
              } else {
                const { showIf: _, ...rest } = input;
                onChange(rest as CalcInput);
              }
            }}
          >
            <option value="">永遠顯示</option>
            {checkboxInputs.map(cb => (
              <option key={cb.id} value={cb.id}>當「{cb.label}」勾選時顯示</option>
            ))}
          </select>
        </div>
      )}
      {input.type === "select" && (
        <div>
          <label className="text-sm text-stone-500 mb-1 block">選項（每行 value|label）</label>
          <textarea
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base font-mono"
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
  itemLabels,
  index,
  duplicateId,
}: {
  formula: CalcFormula;
  onChange: (updated: CalcFormula) => void;
  onRemove: () => void;
  itemIds: string[];
  itemLabels: Record<string, string>;
  index: number;
  duplicateId?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-stone-50 p-4 space-y-3 ${duplicateId ? "border-red-300" : "border-stone-200"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-400">公式 #{index + 1}</span>
        <button onClick={onRemove} className="text-sm text-red-500 hover:text-red-700">移除</button>
      </div>
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <div>
          <label className="text-sm text-stone-500 mb-1 block">ID</label>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-base font-mono ${duplicateId ? "border-red-400 bg-red-50" : "border-stone-300"}`}
            value={formula.id}
            onChange={(e) => onChange({ ...formula, id: e.target.value.replace(/[^a-z0-9_]/g, "") })}
          />
          {duplicateId && <p className="text-xs text-red-500 mt-1">ID 重複，請修改</p>}
        </div>
        <div>
          <label className="text-sm text-stone-500 mb-1 block">名稱（選填）</label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={formula.label || ""}
            onChange={(e) => onChange({ ...formula, label: e.target.value || undefined })}
            placeholder="例：契稅"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-stone-500 mb-1 block">公式</label>
        <FormulaBuilder
          expr={formula.expr}
          onChange={(expr) => onChange({ ...formula, expr })}
          itemIds={itemIds}
          itemLabels={itemLabels}
        />
      </div>
    </div>
  );
}

function ResultEditor({
  result,
  onChange,
  onRemove,
  formulaIds,
  formulaLabels,
  checkboxInputs,
}: {
  result: CalcResult;
  onChange: (updated: CalcResult) => void;
  onRemove: () => void;
  formulaIds: string[];
  formulaLabels: Record<string, string>;
  checkboxInputs?: Array<{ id: string; label: string }>;
}) {
  const showIfId = typeof result.showIf === "string" && result.showIf.startsWith("$")
    ? result.showIf.slice(1)
    : "";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <select
          className="w-36 rounded-lg border border-stone-300 px-3 py-2 text-base bg-white"
          value={result.id}
          onChange={(e) => onChange({ ...result, id: e.target.value })}
        >
          <option value="">選擇公式</option>
          {formulaIds.map(id => (
            <option key={id} value={id}>{formulaLabels[id] || id}</option>
          ))}
          {result.id && !formulaIds.includes(result.id) && (
            <option value={result.id}>{result.id}</option>
          )}
        </select>
        <input
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-base"
          value={result.label}
          onChange={(e) => onChange({ ...result, label: e.target.value })}
          placeholder="顯示名稱"
        />
        <input
          className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-base"
          value={result.suffix ?? ""}
          onChange={(e) => onChange({ ...result, suffix: e.target.value || undefined })}
          placeholder="單位"
      />
      <button onClick={onRemove} className="text-sm text-red-500 hover:text-red-700 shrink-0">✕</button>
    </div>
      {checkboxInputs && checkboxInputs.length > 0 && (
        <div className="flex items-center gap-2 pl-1">
          <label className="text-xs text-stone-400 shrink-0">顯示條件：</label>
          <select
            className="rounded border border-stone-200 px-2 py-1 text-xs bg-white"
            value={showIfId}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                onChange({ ...result, showIf: `$${v}` });
              } else {
                const { showIf: _, ...rest } = result;
                onChange(rest as CalcResult);
              }
            }}
          >
            <option value="">永遠顯示</option>
            {checkboxInputs.map(cb => (
              <option key={cb.id} value={cb.id}>當「{cb.label}」勾選時</option>
            ))}
          </select>
        </div>
      )}
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
  const allLabels: Record<string, string> = {};
  for (const inp of def.inputs) if (inp.label) allLabels[inp.id] = inp.label;
  for (const f of def.formulas) allLabels[f.id] = f.label || f.id;

  const idCounts: Record<string, number> = {};
  for (const id of allIds) idCounts[id] = (idCounts[id] || 0) + 1;
  const duplicateIds = new Set(Object.keys(idCounts).filter(id => idCounts[id] > 1));

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
      formulas: [...d.formulas, { id, expr: null }],
    }));
  };

  const addResult = () => {
    setDef((d) => ({
      ...d,
      results: [...d.results, { id: "", label: "", suffix: "元" }],
    }));
  };

  const inputIds = def.inputs.map(i => i.id);
  const checkboxInputs = def.inputs.filter(i => i.type === "checkbox").map(i => ({ id: i.id, label: i.label }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="text-sm text-stone-500 hover:text-stone-700">&larr; 返回列表</button>
      </div>

      <div className="grid grid-cols-[4rem_1fr] gap-4">
        <div>
          <label className="text-sm text-stone-500 mb-1 block">圖示</label>
          <IconPicker value={icon} onChange={setIcon} placeholder="🔢" />
        </div>
        <div>
          <label className="text-sm text-stone-500 mb-1 block">名稱</label>
          <input
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-stone-500 mb-1 block">說明</label>
        <input
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {/* Inputs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-stone-700">輸入欄位</h4>
          <button onClick={addInput} className="text-sm text-amber-800 hover:text-amber-900 font-medium">+ 新增</button>
        </div>
        <div className="space-y-3">
          {def.inputs.map((input, i) => (
            <InputEditor
              key={i}
              input={input}
              duplicateId={duplicateIds.has(input.id)}
              checkboxInputs={checkboxInputs.filter(cb => cb.id !== input.id)}
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
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-stone-700">計算公式</h4>
          <button onClick={addFormula} className="text-sm text-amber-800 hover:text-amber-900 font-medium">+ 新增</button>
        </div>
        <p className="text-sm text-stone-400 mb-3">公式按順序計算，每個公式只能引用輸入欄位和排在它前面的公式。</p>
        <div className="space-y-3">
          {def.formulas.map((formula, i) => {
            const availableIds = [...inputIds, ...def.formulas.slice(0, i).map(f => f.id)];
            const availableLabels: Record<string, string> = {};
            for (const id of availableIds) if (allLabels[id]) availableLabels[id] = allLabels[id];
            return (
              <FormulaEditor
                key={i}
                formula={formula}
                index={i}
                duplicateId={duplicateIds.has(formula.id)}
                itemIds={availableIds}
                itemLabels={availableLabels}
                onChange={(updated) => {
                  const formulas = [...def.formulas];
                  formulas[i] = updated;
                  setDef((d) => ({ ...d, formulas }));
                }}
                onRemove={() => {
                  setDef((d) => ({ ...d, formulas: d.formulas.filter((_, j) => j !== i) }));
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-stone-700">結果顯示</h4>
          <button onClick={addResult} className="text-sm text-amber-800 hover:text-amber-900 font-medium">+ 手動新增</button>
        </div>
        {def.formulas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm text-stone-400 self-center">快速新增：</span>
            {def.formulas.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setDef(d => ({
                    ...d,
                    results: [...d.results, { id: f.id, label: f.label || allLabels[f.id] || f.id, suffix: "元" }],
                  }));
                }}
                className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                + {allLabels[f.id] || f.id}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-3">
          {def.results.map((result, i) => (
            <ResultEditor
              key={i}
              result={result}
              formulaIds={def.formulas.map(f => f.id)}
              formulaLabels={allLabels}
              checkboxInputs={checkboxInputs}
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
        <h4 className="text-base font-semibold text-stone-700 mb-3">總計列</h4>
        <div className="flex items-center gap-3">
          <select
            className="w-36 rounded-lg border border-stone-300 px-3 py-2 text-base bg-white"
            value={def.total.id}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, id: e.target.value } }))}
          >
            <option value="">選擇公式</option>
            {def.formulas.map(f => (
              <option key={f.id} value={f.id}>{allLabels[f.id] || f.id}</option>
            ))}
            {def.total.id && !def.formulas.some(f => f.id === def.total.id) && (
              <option value={def.total.id}>{def.total.id}</option>
            )}
          </select>
          <input
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={def.total.label}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, label: e.target.value } }))}
            placeholder="顯示名稱"
          />
          <input
            className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-base"
            value={def.total.suffix ?? ""}
            onChange={(e) => setDef((d) => ({ ...d, total: { ...d.total, suffix: e.target.value || undefined } }))}
            placeholder="單位"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave({ title, icon, description: desc, definition: def })}
          className="rounded-lg bg-amber-800 px-6 py-2.5 text-base font-semibold text-white hover:bg-amber-900"
        >
          儲存
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-stone-300 px-6 py-2.5 text-base text-stone-600 hover:bg-stone-50"
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

  const handleResetCalc = async (id: string) => {
    if (!confirm("確定要還原此計算器為預設值？你的修改將被覆蓋。")) return;
    const res = await fetch(`/api/admin/calculators/${id}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
                {calc.isSystem && (
                  <button
                    onClick={() => handleResetCalc(calc.id)}
                    className="text-xs text-stone-500 hover:text-amber-800 px-2 py-1 rounded border border-stone-200"
                  >
                    還原預設
                  </button>
                )}
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
