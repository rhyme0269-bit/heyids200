import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            需要不動產登記服務？
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            初次諮詢免費，歡迎來電或填寫表單，我們將盡快與您聯繫
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-amber-800 bg-white rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
            >
              填寫諮詢表單
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
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-amber-800 transition-colors"
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
        </div>
      </div>
    </section>
  );
}
