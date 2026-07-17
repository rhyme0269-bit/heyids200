import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import FaqAccordion from "@/components/common/FaqAccordion";
import StructuredData from "@/components/common/StructuredData";
import { generateFaqSchema } from "@/lib/structured-data";
import { getFaqs } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "常見問題",
  description:
    "不動產登記常見問題：買賣過戶時間、繼承登記文件、服務費用等，合一地政士事務所為您解答。",
};

export default function FaqPage() {
  noStore();
  const faqs = getFaqs();
  return (
    <>
      <StructuredData data={generateFaqSchema(faqs)} />

      {/* 頁面標題 */}
      <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">常見問題</h1>
          <p className="text-stone-600 text-lg">
            關於不動產登記，您可能想知道的事
          </p>
        </div>
      </section>

      {/* FAQ 列表 */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* 還有問題？ */}
      <section className="py-12 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            還有其他問題？
          </h2>
          <p className="text-stone-600 mb-6">
            歡迎直接聯繫我們，初次諮詢免費
          </p>
          <a
            href="/contact"
            className="inline-block bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-900 transition-colors"
          >
            聯絡我們
          </a>
        </div>
      </section>
    </>
  );
}
