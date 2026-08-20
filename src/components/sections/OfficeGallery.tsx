import { hasImage } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";

const GALLERY_ITEMS = [
  { key: "office_interior", alt: "事務所內部環境" },
  { key: "office_exterior", alt: "事務所外觀" },
  { key: "office_sign", alt: "事務所招牌" },
];

export default function OfficeGallery() {
  const photos = GALLERY_ITEMS.map((item) => ({
    ...item,
    src: hasImage(item.key)
      ? `/api/images/${item.key}`
      : DEFAULT_IMAGES[item.key] || null,
  })).filter((p) => p.src);

  if (photos.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-amber-800 text-sm font-medium tracking-wide mb-3">
            <span className="w-8 h-px bg-amber-800" />
            事務所環境
            <span className="w-8 h-px bg-amber-800" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
            專業空間，安心託付
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.key}
              className="group relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async"
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
    </section>
  );
}
