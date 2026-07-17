import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getServices, getServiceFlow, getFees, getFeeNotes } from "@/lib/db";

export const metadata: Metadata = {
  title: "服務項目與收費標準",
  description:
    "合一地政士事務所提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、房地合一稅、信託登記、節稅規劃等專業服務。完整收費標準一覽。",
};

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  noStore();
  const services = getServices();
  const flow = getServiceFlow();
  const feeSchedule = getFees();
  const feeNotes = getFeeNotes();

  return (
    <>
      {/* 頁面標題 */}
      <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">服務項目</h1>
          <p className="text-stone-600 text-lg">
            全方位不動產登記服務，專業守護您的權益
          </p>
        </div>
      </section>

      {/* 服務列表 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="p-6 rounded-xl border border-stone-200 hover:shadow-lg hover:border-amber-700 transition-all"
              >
                <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-amber-800 text-xl">&#9733;</span>
                </div>
                <h2 className="text-lg font-semibold text-stone-800 mb-3">
                  {service.title}
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 收費標準 */}
      <section id="fees" className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-4 text-center">
            收費標準
          </h2>
          <p className="text-stone-600 text-center mb-2">
            面談諮詢、線上諮詢前 30 分鐘不收費
          </p>
          <p className="text-stone-500 text-center text-sm mb-8">
            （超過以每小時 1,000 元計收；諮詢費可全額折抵日後案件辦理費用）
          </p>

          {/* 表格 */}
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 text-stone-700">
                  <th className="px-4 py-3 text-left font-semibold w-12">
                    項次
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    服務類別
                  </th>
                  <th className="px-4 py-3 text-right font-semibold w-24">
                    收費（元）
                  </th>
                  <th className="px-4 py-3 text-left font-semibold w-24">
                    收費對象
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">備註</th>
                </tr>
              </thead>
              <tbody>
                {feeSchedule.map((item, index) => (
                  <tr
                    key={item.id}
                    className={
                      index % 2 === 0 ? "bg-white" : "bg-stone-50"
                    }
                  >
                    <td className="px-4 py-3 text-stone-500">{item.id}</td>
                    <td className="px-4 py-3 text-stone-800 font-medium">
                      {item.service}
                    </td>
                    <td className="px-4 py-3 text-right text-amber-800 font-semibold">
                      {item.fee}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{item.payer}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-stone-800 mb-2">注意事項</h3>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 text-sm">
              {feeNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 服務流程 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-12 text-center">
            服務流程
          </h2>
          <div className="space-y-8">
            {flow.map((step, index) => (
              <div key={step._id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  {index < flow.length - 1 && (
                    <div className="w-0.5 h-8 bg-stone-300 mx-auto mt-2" />
                  )}
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-stone-800">
                    {step.stepName}
                  </h3>
                  <p className="text-stone-600 mt-1">{step.stepDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
