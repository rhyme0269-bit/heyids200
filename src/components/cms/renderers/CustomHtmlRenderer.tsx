import type { CustomHtmlData } from "@/lib/cms-types";

export default function CustomHtmlRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as CustomHtmlData;

  if (!d.html || d.html === "__TOOLS_PAGE__") return null;

  return (
    <div
      className="prose prose-stone max-w-none"
      dangerouslySetInnerHTML={{ __html: d.html }}
    />
  );
}
