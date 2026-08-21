const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Default static images in public/defaults/ — used when no DB image exists */
export const DEFAULT_IMAGES: Record<string, string> = {
  hero_bg: `${basePath}/defaults/hero-bg.webp`,
  about_bg: `${basePath}/defaults/about-bg.webp`,
  services_bg: `${basePath}/defaults/services-bg.webp`,
  contact_bg: `${basePath}/defaults/contact-bg.webp`,
  faq_bg: `${basePath}/defaults/faq-bg.webp`,
  tools_bg: `${basePath}/defaults/tools-bg.webp`,
  scrivener_photo: `${basePath}/defaults/scrivener-photo.webp`,
  line_qr: `${basePath}/defaults/line-qr.png`,
  office_interior: `${basePath}/defaults/office-interior.webp`,
  office_exterior: `${basePath}/defaults/office-exterior.webp`,
  office_sign: `${basePath}/defaults/office-sign.webp`,
};
