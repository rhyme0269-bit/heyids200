import type { KeyValueListData } from "@/lib/cms-types";

export default function KeyValueListRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as KeyValueListData;
  const items = d.items ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      {d.title && (
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-stone-300" />
            <span className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">Services</span>
            <div className="h-px w-8 bg-stone-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800">{d.title}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="group hover-lift relative p-6 rounded-xl border border-stone-200 bg-white overflow-hidden"
          >
            <span className="absolute top-4 right-4 text-xs font-mono text-stone-300 group-hover:text-amber-700 transition-colors">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-50 transition-colors">
              {item.icon ? (
                <span className="text-xl">{item.icon}</span>
              ) : (
                <svg className="w-5 h-5 text-stone-400 group-hover:text-amber-800 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-stone-800 mb-2">{item.label}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{item.value}</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </div>
        ))}
      </div>
    </div>
  );
}
