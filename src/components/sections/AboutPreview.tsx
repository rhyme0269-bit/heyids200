import Link from "next/link";
import { getAbout } from "@/lib/db";

export default function AboutPreview() {
  const about = getAbout();

  return (
    <section className="py-16 md:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-6">
              關於合一地政士事務所
            </h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              {about.introduction}
            </p>

            {/* Philosophy Quote */}
            <blockquote className="border-l-4 border-amber-800 pl-4 py-2 mb-8">
              <p className="text-stone-700 italic leading-relaxed">
                {about.philosophy}
              </p>
            </blockquote>

            <Link
              href="/about"
              className="inline-flex items-center text-amber-800 hover:text-amber-900 font-medium transition-colors"
            >
              了解更多
              <svg
                className="w-4 h-4 ml-1"
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
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {about.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start p-5 bg-white rounded-lg border border-stone-200 shadow-sm"
              >
                <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-stone-700 font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <span className="text-stone-700 text-sm leading-relaxed">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
