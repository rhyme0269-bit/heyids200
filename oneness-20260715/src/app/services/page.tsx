import type { Metadata } from "next";
import { defaultServices, defaultServiceFlow } from "@/lib/default-data";

export const metadata: Metadata = {
  title: "服務項目",
  description: "合一地政士事務所提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、信託登記、節稅規劃等專業服務。",
};

export default function ServicesPage() {
  const services = defaultServices;
  const flow = defaultServiceFlow;

  return (
    <>
      {/* 頁面標題 */}
      <section className="bg-gradient-to-br from-amber-50 to-amber-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">服務項目</h1>
          <p className="text-gray-600 text-lg">全方位不動產登記服務，專業守護您的權益</p>
        </div>
      </section>

      {/* 服務列表 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="p-6 rounded-xl border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-amber-600 text-xl">&#9733;</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">{service.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 收費方式 */}
      <section className="py-12 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">收費方式</h2>
          <p className="text-gray-600 mb-2">依案件內容報價，歡迎來電或 LINE 諮詢</p>
          <p className="text-amber-700 font-medium">初次諮詢免費</p>
        </div>
      </section>

      {/* 服務流程 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">服務流程</h2>
          <div className="space-y-8">
            {flow.map((step, index) => (
              <div key={step._id} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  {index < flow.length - 1 && (
                    <div className="w-0.5 h-8 bg-amber-200 mx-auto mt-2" />
                  )}
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-800">{step.stepName}</h3>
                  <p className="text-gray-600 mt-1">{step.stepDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
