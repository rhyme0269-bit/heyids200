import type { MetadataRoute } from "next";
import { listPages, isCmsInitialized } from "@/lib/cms-db";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  if (!isCmsInitialized()) {
    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
  }

  const pages = listPages().filter((p) => p.status === "published");

  return pages.map((page) => ({
    url:
      page.slug === "home"
        ? baseUrl
        : `${baseUrl}${page.isSystem ? `/${page.slug}` : `/p/${page.slug}`}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly" as const,
    priority: page.slug === "home" ? 1 : page.isSystem ? 0.8 : 0.6,
  }));
}
