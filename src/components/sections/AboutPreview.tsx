import Link from "next/link";
import { getAbout } from "@/lib/db";

export default function AboutPreview() {
  const about = getAbout();

  return (
    <section className="bg-stone-50">
      <div className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Label */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-stone-300" />
              <span className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">About Us</span>
              <div className="h-px w-8 bg-stone-300" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800">
              關於合一地政士事務所
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Text Content */}
            <div>
              <p className="text-stone-600 leading-relaxed text-lg mb-8">
                {about.introduction}
              </p>

              {/* Philosophy Quote — with decorative quote mark */}
              <div className="relative bg-white rounded-xl p-6 border border-stone-200 mb-8">
                <svg className="absolute -top-3 left-6 w-8 h-8 text-amber-800/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                </svg>
                <p className="text-stone-700 italic leading-relaxed pl-2">
                  {about.philosophy}
                </p>
              </div>

              <Link
                href="/about"
                className="group inline-flex items-center text-amber-800 hover:text-amber-900 font-semibold transition-colors"
              >
                了解更多
                <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Feature Cards — with left accent border */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {about.features.map((feature, index) => (
                <div
                  key={index}
                  className="hover-lift p-5 bg-white rounded-lg border border-stone-200 border-l-[3px] border-l-amber-800"
                >
                  <span className="text-stone-700 text-sm leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="border-t border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
            <div className="text-center sm:border-r sm:border-stone-200 group cursor-default">
              <div className="text-4xl md:text-5xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors">26<span className="text-amber-700">+</span></div>
              <div className="text-sm text-stone-500 mt-2 tracking-wide">專業執業年資</div>
            </div>
            <div className="text-center sm:border-r sm:border-stone-200 group cursor-default">
              <div className="text-4xl md:text-5xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors">10<span className="text-amber-700">+</span></div>
              <div className="text-sm text-stone-500 mt-2 tracking-wide">房仲品牌合作</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-4xl md:text-5xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors">全台</div>
              <div className="text-sm text-stone-500 mt-2 tracking-wide">服務範圍涵蓋</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
