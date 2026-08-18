import type { KeyValueListData } from "@/lib/cms-types";
import ServiceCard from "@/components/common/ServiceCard";

export default function KeyValueListRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as KeyValueListData;
  const items = d.items ?? [];
  if (items.length === 0) return null;
  const hasLinks = items.some((item) => item.url);

  return (
    <div>
      {d.title && (
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-stone-300" />
            <span className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">{hasLinks ? "Links" : "Services"}</span>
            <div className="h-px w-8 bg-stone-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800">{d.title}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <ServiceCard key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
