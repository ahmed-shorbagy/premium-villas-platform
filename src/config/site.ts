/**
 * Central brand & platform configuration.
 * Set `brand.nameAr` / `brand.nameEn` and assets when the client provides the final brand.
 */
export const siteConfig = {
  brand: {
    /** Final brand name (Arabic) — leave empty until provided */
    nameAr: "",
    nameEn: "",
    taglineAr: "إقامة فاخرة وحجز فلل مباشر",
    defaultLocale: "ar" as const,
    direction: "rtl" as const,
  },
  seo: {
    defaultTitleAr: "حجز فلل فاخرة",
    defaultDescriptionAr:
      "اكتشف فللاً فاخرة للإيجار. تصفية متقدمة، أسعار واضحة، وحجز مباشر عبر واتساب.",
    homeDescriptionAr:
      "تصفح فللاً فاخرة للإيجار. حجز سهل، مواصفات واضحة، وتواصل سريع لتأكيد إقامتك.",
    keywordsAr: "فلل, إيجار, حجز, إقامة فاخرة",
  },
  assets: {
    /** Path to logo image when available, e.g. `/brand/logo.svg` */
    logoSrc: null as string | null,
    favicon: "/favicon.svg",
    ogImage: "/og-default.svg",
  },
  contact: {
    adminWhatsApp: "+972594106293",
    adminWhatsAppDisplay: "+972 59-410-6293",
    /** Public contact — fill when brand launches */
    phone: "",
    email: "",
    locationAr: "",
  },
  social: {
    /** Add URLs when social accounts are ready */
    x: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
  fonts: {
    primary: "Cairo",
    secondary: "Almarai",
    fallbacks: ["Tajawal", "system-ui", "sans-serif"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
