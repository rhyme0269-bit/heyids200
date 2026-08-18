import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingLine from "@/components/common/FloatingLine";
import PreviewBanner from "@/components/common/PreviewBanner";
import StructuredData from "@/components/common/StructuredData";
import { generateLocalBusinessSchema } from "@/lib/structured-data";
import { getSettings } from "@/lib/db";
import { getNavItems, isCmsInitialized } from "@/lib/cms-db";
import { buildThemeCss, brandColorsFromSettings } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Emoji subset (23 KB, covers every icon used in the app). Loaded through
// next/font so the URL carries basePath — a hand-written @font-face pointing at
// /fonts/... 404s on the GitHub Pages preview, which is served under /heyids200.
const emoji = localFont({
  src: "./fonts/emoji-subset.woff2",
  variable: "--font-emoji",
  display: "swap",
  // Default is 'Arial', which next/font would splice into the family list ahead
  // of the system emoji fonts in .emoji-icon. Keep the chain emoji-only.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: {
    default: "合一地政士事務所 | 專業不動產登記服務",
    template: "%s | 合一地政士事務所",
  },
  description:
    "合一地政士事務所，逾 26 年專業經驗。提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等服務。服務範圍涵蓋新北市蘆洲、三重、台北市及全台各地，初次諮詢免費。",
  // Compound phrases people actually search, rather than single words (#25).
  keywords: [
    "新北地政士",
    "台北地政士",
    "新北代書",
    "台北代書",
    "蘆洲地政士",
    "三重地政士",
    "不動產登記",
    "買賣過戶",
    "繼承登記",
    "贈與登記",
    "抵押權設定",
    "房地合一稅",
    "節稅規劃",
  ],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "合一地政士事務所",
    title: "合一地政士事務所 | 專業不動產登記服務",
    description:
      "逾 26 年專業經驗，提供不動產買賣過戶、繼承登記、贈與登記、節稅規劃等服務。服務範圍涵蓋新北市蘆洲、三重、台北市及全台各地。",
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
  const settings = getSettings();
  const navItems = isCmsInitialized() ? getNavItems() : fallbackNav;

  return (
    <html lang="zh-TW" className={`${geistSans.variable} ${emoji.variable} h-full antialiased`}>
      <head>
        {/* Brand palette from site settings. Tailwind's colour utilities resolve
            to var(--color-*), so overriding those variables re-skins every page
            without touching class names. */}
        <style>{buildThemeCss(brandColorsFromSettings(settings))}</style>
      </head>
      <body className="min-h-full flex flex-col">
        <StructuredData data={generateLocalBusinessSchema(settings)} />
        <PreviewBanner />
        <Header navItems={navItems} siteName={settings.name} phone={settings.phone} logoSize={settings.logoSize} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingLine href={settings.lineUrl} />
      </body>
    </html>
  );
}
