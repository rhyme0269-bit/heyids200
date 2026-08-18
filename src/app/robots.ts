import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /studio/ was the Sanity editor and no longer exists. /admin is the
      // current back office and should not be indexed.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
