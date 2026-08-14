interface TwoColumnListData {
  leftTitle: string;
  leftItems: string[];
  leftStyle: "check" | "bullet";
  rightTitle: string;
  rightItems: string[];
  rightStyle: "check" | "bullet" | "circle-check";
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CircleCheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function ListColumn({ title, items, style }: { title: string; items: string[]; style: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-stone-800 mb-6">{title}</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start">
            {style === "circle-check" ? (
              <CircleCheckIcon className="w-5 h-5 text-stone-400 mt-0.5 mr-3 flex-shrink-0" />
            ) : style === "check" ? (
              <CheckIcon className="w-5 h-5 text-amber-800 mt-0.5 mr-3 flex-shrink-0" />
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

export default function TwoColumnListRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TwoColumnListData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <ListColumn title={d.leftTitle} items={d.leftItems ?? []} style={d.leftStyle ?? "check"} />
      <ListColumn title={d.rightTitle} items={d.rightItems ?? []} style={d.rightStyle ?? "check"} />
    </div>
  );
}
