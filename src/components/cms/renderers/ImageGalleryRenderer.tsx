import { hasImage } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";
import type { ImageGalleryData } from "@/lib/cms-types";

export default function ImageGalleryRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ImageGalleryData;

  const photos = (d.images ?? [])
    .map((img) => ({
      ...img,
      src: img.imageKey
        ? hasImage(img.imageKey)
          ? `/api/images/${img.imageKey}`
          : DEFAULT_IMAGES[img.imageKey] ?? null
        : null,
    }))
    .filter((p) => p.src);

  if (photos.length === 0) return null;

  return (
    <div>
      {d.title && (
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-amber-800 text-sm font-medium tracking-wide mb-3">
            <span className="w-8 h-px bg-amber-800" />
            {d.title}
            <span className="w-8 h-px bg-amber-800" />
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.imageKey} className="group relative overflow-hidden rounded-xl aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src!}
              alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-4 text-white text-sm font-medium">
              {photo.alt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
