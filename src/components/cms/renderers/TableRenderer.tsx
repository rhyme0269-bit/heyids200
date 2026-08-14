import type { TableData } from "@/lib/cms-types";

export default function TableRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TableData;
  const columns = d.columns ?? [];
  const rows = d.rows ?? [];
  if (columns.length === 0 || rows.length === 0) return null;

  return (
    <div>
      {d.title && (
        <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">{d.title}</h2>
      )}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-100 text-stone-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      col.align === "right"
                        ? "text-right text-amber-800 font-semibold"
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
      {d.footerNotes && d.footerNotes.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-stone-800 mb-2">注意事項</h3>
          <ol className="list-decimal list-inside space-y-1 text-stone-600 text-sm">
            {d.footerNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
