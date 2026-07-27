import { cookies } from "next/headers";
import { hasImage, getHeroConfigs, getHeroConfigsPreview } from "@/lib/db";

interface PageHeroProps {
  title: string;
  subtitle: string;
  /** DB image key, e.g. "about_bg" */
  imageKey: string;
}

export default async function PageHero({
  title,
  subtitle,
  imageKey,
}: PageHeroProps) {
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("hero_preview")?.value === "1";
  const configs = isPreview ? getHeroConfigsPreview() : getHeroConfigs();
  const cfg = configs[imageKey];
  const mode = cfg?.mode || "default";

  // Color mode
  if (mode === "color") {
    return (
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: cfg.color }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-stone-200 text-lg">{subtitle}</p>
        </div>
      </section>
    );
  }

  // Image mode
  if (mode === "image" && hasImage(imageKey)) {
    return (
      <section className="relative bg-stone-900 py-20 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/images/${imageKey}`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-stone-200 text-lg">{subtitle}</p>
        </div>
      </section>
    );
  }

  // Default gradient
  return (
    <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">{title}</h1>
        <p className="text-stone-600 text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
