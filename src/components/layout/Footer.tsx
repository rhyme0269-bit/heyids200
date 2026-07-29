import Link from "next/link";
import { getSettings } from "@/lib/db";
import { getNavItems, isCmsInitialized } from "@/lib/cms-db";

const fallbackLinks = [
  { label: "首頁", href: "/", isExternal: false },
  { label: "關於我們", href: "/about", isExternal: false },
  { label: "服務項目", href: "/services", isExternal: false },
  { label: "小工具", href: "/tools", isExternal: false },
  { label: "常見問題", href: "/faq", isExternal: false },
  { label: "聯絡我們", href: "/contact", isExternal: false },
];

export default function Footer() {
  const settings = getSettings();
  const quickLinks = isCmsInitialized()
    ? getNavItems().map((n) => ({ label: n.title, href: n.href, isExternal: !!n.isExternal }))
    : fallbackLinks;

  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* 事務所資訊 */}
          <div>
            <h3 className="text-stone-200 text-base font-bold mb-4">
              合一地政士事務所
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-4">
              逾 26 年專業經驗，提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等全方位服務。
            </p>
            <p className="text-stone-500 text-xs">
              {settings.scrivenerName} 地政士
            </p>
            <p className="text-stone-600 text-xs mt-1">
              {settings.licenseNumber}
            </p>
          </div>

          {/* 聯絡資訊 */}
          <div>
            <h3 className="text-stone-200 text-base font-bold mb-4">
              聯絡資訊
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 text-stone-600 mt-0.5 mr-2.5 flex-shrink-0"
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
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-amber-200 transition-colors"
                  >
                    {settings.phone}
                  </a>
                  <span className="text-stone-700 mx-1">/</span>
                  <a
                    href={`tel:${settings.mobile}`}
                    className="hover:text-amber-200 transition-colors"
                  >
                    {settings.mobile}
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 text-stone-600 mt-0.5 mr-2.5 flex-shrink-0"
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
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-amber-200 transition-colors"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 text-stone-600 mt-0.5 mr-2.5 flex-shrink-0"
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
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-200 transition-colors"
                >
                  {settings.address}
                </a>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 text-stone-600 mt-0.5 mr-2.5 flex-shrink-0"
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
                <span>
                  LINE：
                  <a
                    href={settings.lineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-200 transition-colors"
                  >
                    {settings.lineId}
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* 快速連結 */}
          <div>
            <h3 className="text-stone-200 text-base font-bold mb-4">
              快速連結
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:text-amber-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-xs hover:text-amber-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800 text-center">
          <p className="text-stone-600 text-xs">
            &copy; 2026 合一地政士事務所. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
