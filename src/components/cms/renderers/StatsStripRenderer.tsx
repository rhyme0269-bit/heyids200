import type { StatsStripData } from "@/lib/cms-types";

export default function StatsStripRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as StatsStripData;
  const items = d.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="border-t border-stone-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 sm:grid-cols-${items.length} gap-8 sm:gap-0`}>
          {items.map((item, index) => (
            <div
              key={index}
              className={`text-center group cursor-default ${
                index < items.length - 1 ? "sm:border-r sm:border-stone-200" : ""
              }`}
            >
              <div className="text-4xl md:text-5xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors">
                {item.value}
              </div>
              <div className="text-sm text-stone-500 mt-2 tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
