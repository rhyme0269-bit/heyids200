import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingLine from "@/components/common/FloatingLine";
import PreviewBanner from "@/components/common/PreviewBanner";
import StructuredData from "@/components/common/StructuredData";
import { generateLocalBusinessSchema } from "@/lib/structured-data";
import { getSettings } from "@/lib/db";
import { getNavItems, isCmsInitialized } from "@/lib/cms-db";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "合一地政士事務所 | 專業不動產登記服務",
    template: "%s | 合一地政士事務所",
  },
  description:
    "合一地政士事務所，逾 26 年專業經驗。提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等服務。全台服務，初次諮詢免費。",
  keywords: [
    "地政士",
    "代書",
    "不動產登記",
    "買賣過戶",
    "繼承登記",
    "贈與登記",
    "抵押權設定",
    "節稅規劃",
    "蘆洲",
    "新北市",
  ],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "合一地政士事務所",
    title: "合一地政士事務所 | 專業不動產登記服務",
    description:
      "逾 26 年專業經驗，提供不動產買賣過戶、繼承登記、贈與登記、節稅規劃等服務。全台服務，初次諮詢免費。",
  },
};

const fallbackNav = [
  { title: "首頁", href: "/", slug: "home", navOrder: 0 },
  { title: "關於我們", href: "/about", slug: "about", navOrder: 1 },
  { title: "服務項目", href: "/services", slug: "services", navOrder: 2 },
  { title: "小工具", href: "/tools", slug: "tools", navOrder: 4 },
  { title: "常見問題", href: "/faq", slug: "faq", navOrder: 5 },
  { title: "聯絡我們", href: "/contact", slug: "contact", navOrder: 6 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = isCmsInitialized() ? getNavItems() : fallbackNav;

  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StructuredData data={generateLocalBusinessSchema(getSettings())} />
        <PreviewBanner />
        <Header navItems={navItems} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingLine />
      </body>
    </html>
  );
}
