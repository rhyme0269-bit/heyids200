import type { SiteSettings, Faq } from "./default-data";

export function generateLocalBusinessSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: settings.name,
    description: "合一地政士事務所，逾 26 年專業經驗。提供不動產買賣過戶、繼承登記、贈與登記、抵押權設定、節稅規劃等服務。",
    url: "https://www.oneness200.com",
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
    openingHours: "Mo-Fr 09:00-18:00",
    priceRange: "$$",
    image: "",
    sameAs: [],
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
