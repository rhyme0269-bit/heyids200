import Link from "next/link";
import { cookies } from "next/headers";
import { hasImage, getHeroConfigs, getHeroConfigsPreview } from "@/lib/db";

export default async function HeroSection() {
  const cookieStore = await cookies();
  const isPreview = cookieStore.get("hero_preview")?.value === "1";
  const configs = isPreview ? getHeroConfigsPreview() : getHeroConfigs();
  const cfg = configs["hero_bg"];
  const mode = cfg?.mode || "default";
  const bgColor = mode === "color" ? cfg.color : undefined;
  const showImage = mode === "image" && hasImage("hero_bg");

  return (
    <section
      className="relative bg-stone-900 md:min-h-[85vh] flex items-center overflow-hidden"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {/* Background image from DB */}
      {showImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/api/images/hero_bg"
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
          <h1 className="animate-fade-in-up animate-delay-100 text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight font-serif tracking-tight">
            合一地政士事務所
          </h1>

          {/* Decorative line */}
          <div className="animate-fade-in-up animate-delay-100 mx-auto mb-8 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Subtitle */}
          <p className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-stone-300 mb-3 leading-relaxed font-light">
            專業、誠信、效率
          </p>
          <p className="animate-fade-in-up animate-delay-200 text-stone-400 mb-12 max-w-xl mx-auto leading-relaxed">
            由胡玉芬地政士主持，民國 87 年取得國家資格，執業逾 26 年。提供不動產買賣過戶、繼承登記、贈與登記、節稅規劃等全方位服務。
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/contact"
              className="group inline-flex items-center px-8 py-3.5 text-base font-semibold text-stone-900 bg-white rounded-lg hover:bg-amber-50 transition-all shadow-lg shadow-black/20"
            >
              立即諮詢
              <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="tel:02-2282-6600"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white/90 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all"
            >
              <svg className="w-5 h-5 mr-2 text-amber-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              02-2282-6600
            </a>
          </div>

          {/* Stats Strip — with mini icons */}
          <div className="animate-fade-in-up animate-delay-400 grid grid-cols-3 max-w-md mx-auto border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm py-6">
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white">26<span className="text-amber-400">+</span></div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">專業執業年資</div>
            </div>
            <div className="text-center px-4 border-x border-white/10">
              <div className="text-3xl md:text-4xl font-bold text-white">10<span className="text-amber-400">+</span></div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">房仲品牌合作</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-white">全台</div>
              <div className="text-xs text-stone-400 mt-1 tracking-wide">服務範圍涵蓋</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
