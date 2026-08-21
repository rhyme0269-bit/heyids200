import type { TableData } from "@/lib/cms-types";

type Column = TableData["columns"][number];
type Row = TableData["rows"][number];

function align(col: Column) {
  return col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
}

/**
 * Cards for narrow screens (#25 十八: 手機不要直接縮小桌機表格).
 *
 * Both presentations render from the same columns/rows, so there is no second
 * copy of the data to keep in sync. The first column heads the card and the
 * second is shown as the prominent value — a table's second column is
 * conventionally the figure being looked up, which matches the fee schedule's
 * stated priority (服務項目 → 收費 → 付費方 → 備註).
 */
function RowCard({ columns, row }: { columns: Column[]; row: Row }) {
  const [head, lead, ...rest] = columns;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="mb-3 font-semibold leading-snug text-stone-800">{row[head.key] ?? ""}</p>

      {lead && row[lead.key] && (
        <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-stone-100 pb-3">
          <span className="text-xs text-stone-500">{lead.label}</span>
          <span className="text-base font-semibold text-amber-800">{row[lead.key]}</span>
        </div>
      )}

      <dl className="space-y-1.5">
        {rest.map((col) =>
          row[col.key] ? (
            <div key={col.key} className="flex gap-2 text-xs">
              <dt className="w-16 flex-shrink-0 text-stone-500">{col.label}</dt>
              <dd className="flex-1 leading-relaxed text-stone-600">{row[col.key]}</dd>
            </div>
          ) : null
        )}
      </dl>
    </div>
  );
}

export default function TableRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TableData;
  const columns = d.columns ?? [];
  const rows = d.rows ?? [];
  if (columns.length === 0 || rows.length === 0) return null;

  return (
    <div>
      {d.title && (
        <h2 className="mb-8 text-center text-3xl font-bold text-stone-800">{d.title}</h2>
      )}

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-stone-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100 text-stone-800">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3.5 font-semibold ${align(col)}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 ${align(col)} ${
                      colIndex === 0
                        ? "font-medium text-stone-800"
                        : colIndex === 1
                          ? "font-semibold text-amber-800"
                          : "text-stone-600"
                    }`}
                  >
                    {row[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards, same data */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, rowIndex) => (
          <RowCard key={rowIndex} columns={columns} row={row} />
        ))}
      </div>

      {d.footerNotes && d.footerNotes.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-stone-800">注意事項</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-stone-600">
            {d.footerNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
