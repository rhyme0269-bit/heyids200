import { hasImage } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";
import type { ImageData } from "@/lib/cms-types";

export default function ImageRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ImageData;
  const src = d.imageKey
    ? hasImage(d.imageKey)
      ? `/api/images/${d.imageKey}`
      : DEFAULT_IMAGES[d.imageKey] ?? null
    : null;

  if (!src) return null;

  return (
    <figure>
      <div className="relative bg-stone-200 rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src={src} alt={d.alt || ""} className="w-full h-auto object-cover" />
      </div>
      {d.caption && (
        <figcaption className="text-center mt-3 text-stone-500 text-sm">{d.caption}</figcaption>
      )}
    </figure>
  );
}
