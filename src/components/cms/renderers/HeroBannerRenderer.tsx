import { hasImage } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";
import type { HeroBannerData } from "@/lib/cms-types";

export default function HeroBannerRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as HeroBannerData;
  const bgMode = d.bgMode ?? "default";
  const bgColor = d.bgColor ?? "#44403c";
  const imageKey = d.bgImageKey;
  const imageSrc = imageKey
    ? hasImage(imageKey)
      ? `/api/images/${imageKey}`
      : DEFAULT_IMAGES[imageKey] ?? null
    : null;

  if (bgMode === "color") {
    return (
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{d.title}</h1>
          <p className="text-stone-200 text-lg">{d.subtitle}</p>
        </div>
      </section>
    );
  }

  const showImage = (bgMode === "image" || bgMode === "default") && !!imageSrc;

  if (showImage) {
    return (
      <section className="relative bg-stone-900 py-20 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{d.title}</h1>
          <p className="text-stone-200 text-lg">{d.subtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">{d.title}</h1>
        <p className="text-stone-600 text-lg">{d.subtitle}</p>
      </div>
    </section>
  );
}
