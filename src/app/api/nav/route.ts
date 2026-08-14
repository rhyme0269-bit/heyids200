import { NextResponse } from "next/server";
import { getNavItems, isCmsInitialized } from "@/lib/cms-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isCmsInitialized()) {
    return NextResponse.json([
      { slug: "home", title: "首頁", href: "/", navOrder: 0 },
      { slug: "about", title: "關於我們", href: "/about", navOrder: 1 },
      { slug: "services", title: "服務項目", href: "/services", navOrder: 2 },
      { slug: "tools", title: "小工具", href: "/tools", navOrder: 4 },
      { slug: "faq", title: "常見問題", href: "/faq", navOrder: 5 },
      { slug: "contact", title: "聯絡我們", href: "/contact", navOrder: 6 },
    ]);
  }
  return NextResponse.json(getNavItems());
}
