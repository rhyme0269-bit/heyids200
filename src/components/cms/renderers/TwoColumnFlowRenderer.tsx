import type { TwoColumnFlowData } from "@/lib/cms-types";

function Lines({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return <p className="text-stone-400 text-sm">—</p>;
  }

  if (lines.length === 1) {
    return <p className="text-stone-600 text-sm leading-relaxed">{lines[0]}</p>;
  }

  return (
    <ol className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start text-sm leading-relaxed text-stone-600">
          <span className="mr-2 flex-shrink-0 font-mono text-xs text-stone-400 mt-0.5">
            {i + 1}.
          </span>
          <span>{line}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Uses native <details>/<summary> for the collapse behaviour: no client
 * component, no hydration, keyboard accessible, and it still works with JS
 * disabled. Whether stages start open is data, not code.
 */
export default function TwoColumnFlowRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TwoColumnFlowData;
  const stages = d.stages ?? [];
  if (stages.length === 0) return null;

  return (
    <div>
      {d.title && (
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-stone-300" />
            <span className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">Process</span>
            <div className="h-px w-8 bg-stone-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800">{d.title}</h2>
        </div>
      )}

      <div className="space-y-3">
        {stages.map((stage, i) => (
          <details
            key={i}
            open={d.defaultOpen !== false}
            className="group rounded-xl border border-stone-200 bg-white overflow-hidden"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-800 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="flex-1 text-lg font-semibold text-stone-800">{stage.name}</span>
              <svg
                className="h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>

            <div className="grid grid-cols-1 gap-6 border-t border-stone-100 px-5 py-5 md:grid-cols-2 md:gap-8">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  {d.leftLabel}
                </p>
                <Lines text={stage.left} />
              </div>
              <div className="md:border-l md:border-stone-100 md:pl-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  {d.rightLabel}
                </p>
                <Lines text={stage.right} />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
