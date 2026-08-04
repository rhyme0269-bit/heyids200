"use client";

import { useState, useCallback } from "react";
import type { Expr } from "@/lib/calc-types";

const OPS: { label: string; op: string; arity: number }[] = [
  { label: "+", op: "+", arity: 2 },
  { label: "−", op: "-", arity: 2 },
  { label: "×", op: "*", arity: 2 },
  { label: "÷", op: "/", arity: 2 },
  { label: "max", op: "max", arity: 2 },
  { label: "min", op: "min", arity: 2 },
  { label: "pow", op: "pow", arity: 2 },
  { label: "round", op: "round", arity: 1 },
  { label: "abs", op: "abs", arity: 1 },
  { label: "if", op: "if", arity: 3 },
];

const CMP_OPS: { label: string; op: string }[] = [
  { label: ">", op: ">" },
  { label: "<", op: "<" },
  { label: "≥", op: ">=" },
  { label: "≤", op: "<=" },
  { label: "＝", op: "==" },
  { label: "≠", op: "!=" },
];

type ExprNode =
  | { type: "num"; value: number }
  | { type: "var"; name: string }
  | { type: "op"; op: string; args: ExprNode[] }
  | { type: "empty" };

function exprToNode(expr: Expr): ExprNode {
  if (expr === null || expr === undefined) return { type: "empty" };
  if (typeof expr === "number") return { type: "num", value: expr };
  if (typeof expr === "string") {
    if (expr.startsWith("$")) return { type: "var", name: expr.slice(1) };
    const n = Number(expr);
    if (!isNaN(n)) return { type: "num", value: n };
    return { type: "var", name: expr };
  }
  if (Array.isArray(expr) && expr.length > 0) {
    const [op, ...args] = expr;
    if (typeof op === "string") {
      return { type: "op", op, args: args.map(a => exprToNode(a as Expr)) };
    }
  }
  return { type: "empty" };
}

function nodeToExpr(node: ExprNode): Expr {
  switch (node.type) {
    case "num": return node.value;
    case "var": return `$${node.name}`;
    case "op": return [node.op, ...node.args.map(nodeToExpr)] as Expr;
    case "empty": return null;
  }
}

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

function EmptySlotNode({
  onChange,
  itemIds,
  itemLabels = {},
}: {
  onChange: (n: ExprNode) => void;
  itemIds: string[];
  itemLabels?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  const pick = (n: ExprNode) => {
    onChange(n);
    setOpen(false);
  };

  return (
    <span className="relative inline-flex">
      <span
        className="inline-flex items-center px-3 py-1 rounded border-2 border-dashed border-stone-300 text-xs text-stone-400 cursor-pointer hover:border-amber-400 hover:text-amber-600 min-w-[3rem] justify-center"
        onClick={() => setOpen(!open)}
      >
        ?
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 p-2 rounded-lg bg-white border border-stone-200 shadow-lg min-w-[14rem] space-y-1.5">
            {itemIds.length > 0 && (
              <div>
                <span className="text-[10px] text-stone-400 block mb-0.5">欄位</span>
                <div className="flex flex-wrap gap-1">
                  {itemIds.map(id => (
                    <button key={id} type="button" onClick={() => pick({ type: "var", name: id })}
                      className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-100 cursor-pointer">
                      {itemLabels[id] || id}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">值</span>
              <button type="button" onClick={() => pick({ type: "num", value: 0 })}
                className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 hover:bg-blue-100 cursor-pointer">
                數值
              </button>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">運算</span>
              <div className="flex flex-wrap gap-1">
                {OPS.map(op => (
                  <button key={op.op} type="button"
                    onClick={() => pick({ type: "op", op: op.op, args: Array(op.arity).fill(null).map(() => ({ type: "empty" as const })) })}
                    className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer">
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">比較</span>
              <div className="flex flex-wrap gap-1">
                {CMP_OPS.map(op => (
                  <button key={op.op} type="button"
                    onClick={() => pick({ type: "op", op: op.op, args: [{ type: "empty" }, { type: "empty" }] })}
                    className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer">
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </span>
  );
}

function NodeEditor({
  node,
  onChange,
  itemIds,
  itemLabels = {},
  depth = 0,
}: {
  node: ExprNode;
  onChange: (n: ExprNode) => void;
  itemIds: string[];
  itemLabels?: Record<string, string>;
  depth?: number;
}) {
  if (node.type === "empty") {
    return <EmptySlotNode onChange={onChange} itemIds={itemIds} itemLabels={itemLabels} />;
  }

  if (node.type === "num") {
    return (
      <span className="inline-flex items-center gap-0.5">
        <input
          type="number"
          value={node.value}
          onChange={e => onChange({ type: "num", value: parseFloat(e.target.value) || 0 })}
          className="w-20 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-sm text-center font-mono text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button onClick={() => onChange({ type: "empty" })} className="text-stone-400 hover:text-red-400 text-xs" title="刪除">✕</button>
      </span>
    );
  }

  if (node.type === "var") {
    return (
      <span className="inline-flex items-center gap-0.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-sm font-mono text-emerald-700">
          <select
            value={node.name}
            onChange={e => onChange({ type: "var", name: e.target.value })}
            className="bg-transparent border-none text-sm text-emerald-700 focus:outline-none cursor-pointer"
          >
            {itemIds.map(id => <option key={id} value={id}>{itemLabels[id] || id}</option>)}
            {!itemIds.includes(node.name) && <option value={node.name}>{itemLabels[node.name] || node.name}</option>}
          </select>
        </span>
        <button onClick={() => onChange({ type: "empty" })} className="text-stone-400 hover:text-red-400 text-xs" title="刪除">✕</button>
      </span>
    );
  }

  // op node
  const opInfo = OPS.find(o => o.op === node.op) || CMP_OPS.find(o => o.op === node.op);
  const opLabel = opInfo?.label || node.op;
  const isInfix = ["+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!="].includes(node.op);
  const bgClass = depth % 2 === 0 ? "bg-amber-50/60 border-amber-200" : "bg-violet-50/60 border-violet-200";

  const updateArg = (idx: number, val: ExprNode) => {
    const newArgs = [...node.args];
    newArgs[idx] = val;
    onChange({ ...node, args: newArgs });
  };

  const addArg = () => {
    onChange({ ...node, args: [...node.args, { type: "empty" }] });
  };

  const removeLastArg = () => {
    if (node.args.length > 1) {
      onChange({ ...node, args: node.args.slice(0, -1) });
    }
  };

  if (node.op === "if") {
    return (
      <span className={`inline-flex items-center gap-1 flex-wrap rounded border px-2 py-1 group/op ${bgClass}`}>
        <span className="text-xs font-bold text-orange-600">如果</span>
        <NodeEditor node={node.args[0] || { type: "empty" }} onChange={n => updateArg(0, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        <span className="text-xs font-bold text-orange-600">則</span>
        <NodeEditor node={node.args[1] || { type: "empty" }} onChange={n => updateArg(1, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        <span className="text-xs font-bold text-orange-600">否則</span>
        <NodeEditor node={node.args[2] || { type: "empty" }} onChange={n => updateArg(2, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        <button onClick={() => onChange({ type: "empty" })} className="text-stone-300 hover:text-red-400 text-xs ml-1" title="刪除">✕</button>
      </span>
    );
  }

  if (isInfix && node.args.length === 2) {
    return (
      <span className={`inline-flex items-center gap-1 flex-wrap rounded border px-2 py-1 group/op ${bgClass}`}>
        <NodeEditor node={node.args[0]} onChange={n => updateArg(0, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        <span className="text-xs font-bold text-stone-500">{opLabel}</span>
        <NodeEditor node={node.args[1]} onChange={n => updateArg(1, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        <button onClick={() => onChange({ type: "empty" })} className="text-stone-300 hover:text-red-400 text-xs ml-1" title="刪除">✕</button>
      </span>
    );
  }

  // Variadic infix (e.g. ["+", a, b, c])
  if (isInfix && node.args.length > 2) {
    return (
      <span className={`inline-flex items-center gap-1 flex-wrap rounded border px-2 py-1 group/op ${bgClass}`}>
        {node.args.map((arg, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            {i > 0 && <span className="text-xs font-bold text-stone-500">{opLabel}</span>}
            <NodeEditor node={arg} onChange={n => updateArg(i, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
          </span>
        ))}
        <button onClick={addArg} className="text-stone-300 hover:text-amber-500 text-xs" title="增加運算元">＋</button>
        {node.args.length > 2 && (
          <button onClick={removeLastArg} className="text-stone-300 hover:text-red-400 text-xs" title="移除最後一項">－</button>
        )}
        <button onClick={() => onChange({ type: "empty" })} className="text-stone-300 hover:text-red-400 text-xs ml-1" title="刪除">✕</button>
      </span>
    );
  }

  // Prefix function
  return (
    <span className={`inline-flex items-center gap-1 flex-wrap rounded border px-2 py-1 group/op ${bgClass}`}>
      <span className="text-xs font-bold text-purple-600">{opLabel}(</span>
      {node.args.map((arg, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-stone-400">,</span>}
          <NodeEditor node={arg} onChange={n => updateArg(i, n)} itemIds={itemIds} itemLabels={itemLabels} depth={depth + 1} />
        </span>
      ))}
      <span className="text-xs font-bold text-purple-600">)</span>
      <button onClick={() => onChange({ type: "empty" })} className="text-stone-300 hover:text-red-400 text-xs ml-1" title="刪除">✕</button>
    </span>
  );
}


function ContinueButton({
  currentNode,
  onWrap,
}: {
  currentNode: ExprNode;
  onWrap: (op: string, arity: number) => void;
}) {
  const [open, setOpen] = useState(false);

  if (currentNode.type === "empty") return null;

  return (
    <span className="relative inline-flex ml-1">
      <span
        className="inline-flex items-center px-2 py-0.5 rounded border-2 border-dashed border-amber-300 text-xs text-amber-500 cursor-pointer hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50"
        onClick={() => setOpen(!open)}
        title="繼續加運算"
      >
        …
      </span>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 p-2 rounded-lg bg-white border border-stone-200 shadow-lg min-w-[10rem] space-y-1.5">
            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">接著做…</span>
              <div className="flex flex-wrap gap-1">
                {OPS.filter(op => op.arity >= 2).map(op => (
                  <button key={op.op} type="button"
                    onClick={() => { onWrap(op.op, op.arity); setOpen(false); }}
                    className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer">
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-1">
                {CMP_OPS.map(op => (
                  <button key={op.op} type="button"
                    onClick={() => { onWrap(op.op, 2); setOpen(false); }}
                    className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer">
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </span>
  );
}

export default function FormulaBuilder({
  expr,
  onChange,
  itemIds,
  itemLabels = {},
}: {
  expr: Expr;
  onChange: (e: Expr) => void;
  itemIds: string[];
  itemLabels?: Record<string, string>;
}) {
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState(exprToString(expr));
  const [jsonError, setJsonError] = useState("");

  const node = exprToNode(expr);

  const handleNodeChange = useCallback((n: ExprNode) => {
    const newExpr = nodeToExpr(n);
    onChange(newExpr);
    setJsonText(exprToString(newExpr));
  }, [onChange]);

  const handleWrap = useCallback((op: string, arity: number) => {
    const restArgs = Array(arity - 1).fill(null).map(() => ({ type: "empty" as const }));
    const wrapped: ExprNode = { type: "op", op, args: [node, ...restArgs] };
    const newExpr = nodeToExpr(wrapped);
    onChange(newExpr);
    setJsonText(exprToString(newExpr));
  }, [node, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setJsonText("null");
  }, [onChange]);

  const handleJsonBlur = () => {
    try {
      const parsed = parseExpr(jsonText);
      onChange(parsed);
      setJsonError("");
    } catch {
      setJsonError("JSON 格式錯誤");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => { setMode("visual"); setJsonText(exprToString(expr)); }}
            className={`px-2 py-0.5 rounded text-xs ${mode === "visual" ? "bg-amber-100 text-amber-800 font-medium" : "text-stone-400 hover:text-stone-600"}`}
          >
            視覺化
          </button>
          <button
            type="button"
            onClick={() => { setMode("json"); setJsonText(exprToString(expr)); }}
            className={`px-2 py-0.5 rounded text-xs ${mode === "json" ? "bg-amber-100 text-amber-800 font-medium" : "text-stone-400 hover:text-stone-600"}`}
          >
            JSON
          </button>
        </div>
        {mode === "visual" && node.type !== "empty" && (
          <button type="button" onClick={handleClear} className="text-[10px] text-stone-400 hover:text-red-500">
            清除公式
          </button>
        )}
      </div>

      {mode === "visual" ? (
        <div>
          <div className="rounded-lg border border-stone-200 bg-white p-3 min-h-[3rem] flex items-center flex-wrap gap-1">
            <NodeEditor node={node} onChange={handleNodeChange} itemIds={itemIds} itemLabels={itemLabels} />
            <ContinueButton currentNode={node} onWrap={handleWrap} />
          </div>
          {node.type === "empty" && (
            <p className="text-[10px] text-stone-400 mt-1">點擊 ? 選擇欄位或運算子開始建立公式</p>
          )}
        </div>
      ) : (
        <div>
          <textarea
            className={`w-full rounded border px-2 py-1 text-sm font-mono ${jsonError ? "border-red-400" : "border-stone-300"}`}
            rows={3}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            onBlur={handleJsonBlur}
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <p className="text-[10px] text-stone-400 mt-1">
            可用變數：{itemIds.map(id => `$${id}`).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
