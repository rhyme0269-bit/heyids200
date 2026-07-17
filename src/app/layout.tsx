import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/common/StructuredData";
import { generateLocalBusinessSchema } from "@/lib/structured-data";
import { defaultSiteSettings } from "@/lib/default-data";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StructuredData data={generateLocalBusinessSchema(defaultSiteSettings)} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
