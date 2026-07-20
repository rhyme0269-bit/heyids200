import Link from "next/link";
import { getServices } from "@/lib/db";

export default function ServicesPreview() {
  const services = getServices();

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-stone-300" />
            <span className="text-xs font-semibold tracking-[0.15em] text-stone-400 uppercase">Services</span>
            <div className="h-px w-8 bg-stone-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">服務項目</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            全方位不動產登記服務，專業守護您的權益
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service._id}
              className="group hover-lift relative p-6 rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
              {/* Number label */}
              <span className="absolute top-4 right-4 text-xs font-mono text-stone-300 group-hover:text-amber-700 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-50 transition-colors">
                <svg className="w-5 h-5 text-stone-400 group-hover:text-amber-800 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-stone-800 mb-2">{service.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{service.description}</p>

              {/* Bottom accent line — visible on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="group inline-flex items-center px-6 py-3 text-amber-800 hover:text-white bg-amber-50 hover:bg-amber-800 rounded-lg font-semibold transition-all"
          >
            查看完整服務與收費
            <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
