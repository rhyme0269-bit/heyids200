import type { ListData } from "@/lib/cms-types";

export default function ListRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ListData;
  const items = d.items ?? [];
  if (items.length === 0) return null;

  const style = d.style ?? "bullet";

  if (style === "tag") {
    return (
      <div>
        {d.title && (
          <h3 className="text-2xl font-bold text-stone-800 mb-6 text-center">{d.title}</h3>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item, i) => (
            <span key={i} className="bg-stone-200 text-stone-700 px-5 py-2 rounded-full font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (style === "numbered") {
    return (
      <div>
        {d.title && (
          <h3 className="text-2xl font-bold text-stone-800 mb-6">{d.title}</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start p-4 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-amber-800 font-bold text-sm">{i + 1}</span>
              </div>
              <span className="text-stone-700">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {d.title && (
        <h3 className="text-2xl font-bold text-stone-800 mb-6">{d.title}</h3>
      )}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start">
            {style === "check" ? (
              <svg className="w-5 h-5 text-amber-800 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-2.5 mr-3 flex-shrink-0" />
            )}
            <span className="text-stone-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
