import type { Metadata } from "next";
import ContactForm from "@/components/common/ContactForm";
import { defaultSiteSettings } from "@/lib/default-data";

export const metadata: Metadata = {
  title: "聯絡我們",
  description:
    "聯繫合一地政士事務所，電話 02-2282-6600，地址：新北市蘆洲區長安街200號。初次諮詢免費。",
};

export default function ContactPage() {
  const settings = defaultSiteSettings;

  return (
    <>
      {/* 頁面標題 */}
      <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-stone-800 mb-4">聯絡我們</h1>
          <p className="text-stone-600 text-lg">
            歡迎來電、來訊或填寫表單，我們將盡快回覆
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 聯絡表單 */}
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                諮詢表單
              </h2>
              <ContactForm />
            </div>

            {/* 聯絡資訊 + 地圖 */}
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                聯絡資訊
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-800 mt-0.5 mr-4 flex-shrink-0"
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
                  <div>
                    <p className="font-medium text-stone-800">電話</p>
                    <a
                      href={`tel:${settings.phone}`}
                      className="text-stone-600 hover:text-amber-800"
                    >
                      {settings.phone}
                    </a>
                    <span className="text-stone-400 mx-2">/</span>
                    <a
                      href={`tel:${settings.mobile}`}
                      className="text-stone-600 hover:text-amber-800"
                    >
                      {settings.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-800 mt-0.5 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-stone-800">Email</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-stone-600 hover:text-amber-800"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-800 mt-0.5 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-stone-800">LINE</p>
                    <p className="text-stone-600">ID：{settings.lineId}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-amber-800 mt-0.5 mr-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-stone-800">地址</p>
                    <a
                      href={settings.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-600 hover:text-amber-800"
                    >
                      {settings.address}
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="rounded-xl overflow-hidden shadow-sm">
                <iframe
                  src={settings.googleMapEmbed}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="合一地政士事務所位置"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
