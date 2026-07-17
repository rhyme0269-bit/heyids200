import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-amber-200 text-sm font-medium mb-6 border border-white/10">
            逾 26 年專業經驗
          </div>

          {/* Title */}
          <h1 className="animate-fade-in-up animate-delay-100 text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight font-serif">
            合一地政士事務所
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-stone-300 mb-4 leading-relaxed">
            專業、誠信、效率 —— 您最值得信賴的不動產登記夥伴
          </p>
          <p className="animate-fade-in-up animate-delay-200 text-stone-400 mb-10 max-w-2xl mx-auto">
            由胡玉芬地政士主持，民國 87 年取得國家資格，執業逾 26 年。
            提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等全方位服務。
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-stone-900 bg-white rounded-lg hover:bg-stone-100 transition-colors shadow-lg"
            >
              立即諮詢
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <a
              href="tel:02-2282-6600"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white border-2 border-white/40 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              02-2282-6600
            </a>
          </div>

          {/* Stats Strip */}
          <div className="animate-fade-in-up animate-delay-400 mt-16 grid grid-cols-3 gap-0 max-w-lg mx-auto">
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-amber-200">
                26+
              </div>
              <div className="text-xs md:text-sm text-stone-400 mt-1">
                專業執業年資
              </div>
            </div>
            <div className="text-center px-4 border-x border-white/15">
              <div className="text-3xl md:text-4xl font-bold text-amber-200">
                10+
              </div>
              <div className="text-xs md:text-sm text-stone-400 mt-1">
                房仲品牌合作
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-amber-200">
                全台
              </div>
              <div className="text-xs md:text-sm text-stone-400 mt-1">
                服務範圍涵蓋
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
