import Link from "next/link";
import { getPageBySlug, getBlocksForPage, isCmsInitialized } from "@/lib/cms-db";
import { getServices } from "@/lib/db";
import type { KeyValueListData } from "@/lib/cms-types";
import ServiceCard, { type ServiceCardItem } from "@/components/common/ServiceCard";

/**
 * Read the services straight off the CMS services page, so whatever is edited in
 * the page builder — including the icons — shows up here too. The legacy
 * `services` table is only a fallback: it has no icon column and the admin UI no
 * longer exposes it, so editing it is not possible any more.
 */
function getServiceItems(): ServiceCardItem[] {
  if (isCmsInitialized()) {
    const page = getPageBySlug("services");
    if (page) {
      const block = getBlocksForPage(page.id).find((b) => b.blockType === "key_value_list");
      const items = block ? ((block.data as unknown as KeyValueListData).items ?? []) : [];
      if (items.length > 0) return items;
    }
  }

  return getServices().map((s) => ({ label: s.title, value: s.description }));
}

export default function ServicesPreview() {
  const services = getServiceItems();

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
            <ServiceCard key={index} item={service} index={index} />
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
