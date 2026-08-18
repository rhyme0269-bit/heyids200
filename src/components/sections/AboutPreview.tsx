import Link from "next/link";
import { getAbout, getSettings } from "@/lib/db";
import CountUp from "@/components/common/CountUp";

export default function AboutPreview() {
  const about = getAbout();
  const settings = getSettings();
  // Client-supplied figure; falls back to the seeded default if cleared.
  const caseCount = parseInt(settings.caseCount, 10) || 1500;

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
              關於{settings.name}
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

            {/* Feature cards — gold check icon per item (#25). The text stays exactly
                as the office has it in the admin; no wording is invented here. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {about.features.map((feature, index) => (
                <div
                  key={index}
                  className="hover-lift flex items-start gap-3 rounded-[20px] border border-stone-200/70 bg-white p-6"
                >
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-3.5 w-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </span>
                  <span className="text-sm leading-relaxed text-stone-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip — larger figures, count-up on scroll, light grey ground (#25) */}
      <div className="border-t border-stone-200 bg-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0">
            <div className="text-center sm:border-r sm:border-stone-200">
              <div className="text-5xl md:text-6xl font-bold text-stone-800 tracking-tight">
                26<span className="text-amber-700">+</span>
              </div>
              <div className="mt-3 text-sm text-stone-600 tracking-wide">年專業經驗</div>
            </div>
            <div className="text-center sm:border-r sm:border-stone-200">
              <div className="text-5xl md:text-6xl font-bold text-stone-800 tracking-tight">
                <CountUp value={caseCount} />
                <span className="text-amber-700">+</span>
              </div>
              <div className="mt-3 text-sm text-stone-600 tracking-wide">累積案件</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-stone-800 tracking-tight">全台</div>
              <div className="mt-3 text-sm text-stone-600 tracking-wide">服務範圍</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
