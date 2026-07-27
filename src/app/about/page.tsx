import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getAbout, getSettings } from "@/lib/db";
import PageHero from "@/components/common/PageHero";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "合一地政士事務所由胡玉芬地政士主持，民國 87 年通過國家考試，逾 26 年執業經驗，多家知名房仲特約合作。",
};

export const dynamic = "force-dynamic";

export default function AboutPage() {
  noStore();
  const about = getAbout();
  const settings = getSettings();

  return (
    <>
      {/* 頁面標題 */}
      <PageHero
        title="關於我們"
        subtitle="認識合一地政士事務所"
        imageKey="about_bg"
      />

      {/* 事務所介紹 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-stone-800 mb-4">
                事務所介紹
              </h2>
              <p className="text-stone-600 leading-relaxed mb-6">
                {about.introduction}
              </p>

              <h3 className="text-xl font-bold text-stone-800 mb-3">
                服務理念
              </h3>
              <p className="text-stone-600 leading-relaxed italic border-l-4 border-amber-800 pl-4">
                {about.philosophy}
              </p>
            </div>
            <div>
              <div className="relative bg-stone-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/images/scrivener_photo"
                  alt={`${settings.scrivenerName} 地政士`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="text-center mt-4">
                <p className="font-bold text-stone-800 text-lg">
                  {settings.scrivenerName} 地政士
                </p>
                <p className="text-stone-500 text-sm">
                  {settings.licenseNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 事務所特色 */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">
            事務所特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {about.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-amber-800 font-bold text-sm">
                    {index + 1}
                  </span>
                </div>
                <span className="text-stone-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 資歷與經驗 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                現任資歷
              </h2>
              <ul className="space-y-3">
                {about.qualifications.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-800 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                過去工作經驗
              </h2>
              <ul className="space-y-3">
                {about.experience.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-stone-400 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-stone-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 專長領域 */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">
            專長領域
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {about.specialties.map((specialty, index) => (
              <span
                key={index}
                className="bg-stone-200 text-stone-700 px-5 py-2 rounded-full font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
