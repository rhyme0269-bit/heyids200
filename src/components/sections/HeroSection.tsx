import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-stone-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-stone-200 text-stone-700 text-sm font-medium mb-6">
            逾 26 年專業經驗
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            合一地政士事務所
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-stone-600 mb-4 leading-relaxed">
            專業、誠信、效率 —— 您最值得信賴的不動產登記夥伴
          </p>
          <p className="text-stone-500 mb-10 max-w-2xl mx-auto">
            由胡玉芬地政士主持，民國 87 年取得國家資格，執業逾 26 年。
            提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等全方位服務。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors shadow-sm"
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
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-amber-800 border-2 border-amber-800 rounded-lg hover:bg-amber-800 hover:text-white transition-colors"
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

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1.5 text-amber-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              初次諮詢免費
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1.5 text-amber-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              全台服務
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1.5 text-amber-800"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              多家房仲特約合作
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
