import type { TextHeadingData } from "@/lib/cms-types";

export default function TextHeadingRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TextHeadingData;
  const level = d.level ?? "h2";

  if (level === "h1") {
    return <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">{d.text}</h1>;
  }
  if (level === "h3") {
    return <h3 className="text-xl font-bold text-stone-800 mb-3">{d.text}</h3>;
  }
  return <h2 className="text-2xl font-bold text-stone-800 mb-4">{d.text}</h2>;
}
