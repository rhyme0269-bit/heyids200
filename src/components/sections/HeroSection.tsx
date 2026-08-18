import Link from "next/link";
import { cookies } from "next/headers";
import { hasImage, getHeroConfigs, getHeroConfigsPreview, getSettings } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";

export default async function HeroSection() {
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("hero_preview")?.value === "1";
  const configs = isPreview ? getHeroConfigsPreview() : getHeroConfigs();
  const settings = getSettings();
  const caseCount = parseInt(settings.caseCount, 10) || 1500;
  const cfg = configs["hero_bg"];
  const mode = cfg?.mode || "default";
  const bgColor = mode === "color" ? cfg.color : undefined;
  const imageSrc = hasImage("hero_bg") ? "/api/images/hero_bg" : DEFAULT_IMAGES["hero_bg"] || null;
  const showImage = (mode === "image" || mode === "default") && !!imageSrc;

  return (
    <section
      className="relative bg-stone-900 md:min-h-[85vh] flex items-center overflow-hidden"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {/* Background image */}
      {showImage && imageSrc && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/65" />
        </>
      )}
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-800/20 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/30 text-amber-200 text-sm font-medium mb-8 border border-amber-700/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            逾 26 年專業經驗
          </div>

          {/* Title */}
          <h1 className="animate-fade-in-up animate-delay-100 text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight font-serif tracking-tight">
            合眾所託，一心守護
          </h1>
          <p className="animate-fade-in-up animate-delay-100 text-sm md:text-base tracking-[0.2em] text-amber-200/80 uppercase mb-4">
            Your trust, our commitment.
          </p>

          {/* Decorative line */}
          <div className="animate-fade-in-up animate-delay-100 mx-auto mb-8 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Subtitle */}
          <p className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-stone-300 mb-3 leading-relaxed font-light">
            {settings.name}
          </p>
          <p className="animate-fade-in-up animate-delay-200 text-stone-400 mb-12 max-w-xl mx-auto leading-relaxed">
            26 年以上專業經驗，提供買賣、繼承、贈與、信託與不動產登記服務。
          </p>

          {/* CTA Buttons — 52px tall, 12px radius per the brand spec (#25) */}
          <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/contact"
              className="group inline-flex h-[52px] items-center rounded-xl bg-white px-8 text-base font-semibold text-stone-900 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-xl"
            >
              立即諮詢
              <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            {settings.lineUrl && (
              <a
                href={settings.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-[52px] items-center rounded-xl border border-white/25 px-8 text-base font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINE 線上諮詢
              </a>
            )}
          </div>

          {/* Stats Strip — with mini icons */}
          <div className="animate-fade-in-up animate-delay-400 grid grid-cols-3 max-w-md mx-auto border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm py-6">
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white">26<span className="text-amber-400">+</span></div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">年專業經驗</div>
            </div>
            <div className="text-center px-4 border-x border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white">{caseCount.toLocaleString("en-US")}<span className="text-amber-400">+</span></div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">累積案件</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white">全台</div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">服務範圍</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
