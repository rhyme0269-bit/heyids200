import type { SiteSettings, Faq } from "./default-data";

export function generateLocalBusinessSchema(settings: SiteSettings) {
  // LegalService is already a subtype of LocalBusiness; both are declared so the
  // LocalBusiness classification is explicit rather than inferred (#25).
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://www.oneness200.com";

  return {
    "@context": "https://schema.org",
    "@type": ["LegalService", "LocalBusiness"],
    name: settings.name,
    description:
      "合一地政士事務所，逾 26 年專業經驗。提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等服務。服務範圍涵蓋新北市蘆洲、三重、台北市及全台各地。",
    url,
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "長安街200號",
      addressLocality: "蘆洲區",
      addressRegion: "新北市",
      postalCode: "247",
      addressCountry: "TW",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.085,
      longitude: 121.473,
    },
    // The office confirmed it takes cases nationwide, with these as the local base.
    areaServed: [
      { "@type": "Country", name: "臺灣" },
      { "@type": "City", name: "新北市" },
      { "@type": "City", name: "臺北市" },
      { "@type": "AdministrativeArea", name: "蘆洲區" },
      { "@type": "AdministrativeArea", name: "三重區" },
    ],
    openingHours: "Mo-Fr 09:00-18:00",
    priceRange: "$$",
    // Omit rather than emit an empty string, which is invalid for these fields.
    ...(settings.lineUrl ? { sameAs: [settings.lineUrl] } : {}),
  };
}

export function generateFaqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
