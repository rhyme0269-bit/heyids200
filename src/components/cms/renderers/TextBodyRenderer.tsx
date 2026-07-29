import type { TextBodyData } from "@/lib/cms-types";

export default function TextBodyRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as TextBodyData;

  if (!d.html) return null;

  const isPlain = !d.html.includes("<");

  if (isPlain) {
    return <p className="text-stone-600 leading-relaxed text-lg">{d.html}</p>;
  }

  return (
    <div
      className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-a:text-amber-800"
      dangerouslySetInnerHTML={{ __html: d.html }}
    />
  );
}
