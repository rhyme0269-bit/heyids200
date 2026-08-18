const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Default static images in public/defaults/ — used when no DB image exists */
export const DEFAULT_IMAGES: Record<string, string> = {
  hero_bg: `${basePath}/defaults/hero-bg.jpg`,
  about_bg: `${basePath}/defaults/about-bg.jpg`,
  services_bg: `${basePath}/defaults/services-bg.jpg`,
  contact_bg: `${basePath}/defaults/contact-bg.jpg`,
  faq_bg: `${basePath}/defaults/faq-bg.jpg`,
  tools_bg: `${basePath}/defaults/tools-bg.jpg`,
  scrivener_photo: `${basePath}/defaults/scrivener-photo.jpg`,
  line_qr: `${basePath}/defaults/line-qr.png`,
  office_interior: `${basePath}/defaults/office-interior.webp`,
  office_exterior: `${basePath}/defaults/office-exterior.webp`,
  office_sign: `${basePath}/defaults/office-sign.webp`,
};
