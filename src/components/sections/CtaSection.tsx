import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative bg-stone-900 overflow-hidden">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-900 via-amber-700 to-stone-900" />

      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-900/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-stone-700/20 rounded-full blur-[80px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-serif">
            需要不動產登記服務？
          </h2>
          <div className="mx-auto mb-6 w-12 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <p className="text-stone-300 text-lg md:text-xl mb-12 leading-relaxed">
            歡迎來電或填寫表單，我們將盡快與您聯繫
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/contact"
              className="group inline-flex items-center px-8 py-3.5 text-base font-semibold text-stone-900 bg-white rounded-lg hover:bg-amber-50 transition-all shadow-lg shadow-amber-900/20"
            >
              填寫諮詢表單
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

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-400">
            <span>初次諮詢免費</span>
            <span className="hidden sm:inline text-stone-600">·</span>
            <span>全台服務</span>
            <span className="hidden sm:inline text-stone-600">·</span>
            <span>專人一對一服務</span>
          </div>
        </div>
      </div>
    </section>
  );
}
