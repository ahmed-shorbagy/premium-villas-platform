/**
 * Shima AK — premium villa rental brand configuration
 */
export const siteConfig = {
  brand: {
    name: "Shima AK",
    nameAr: "شيما AK",
    nameEn: "Shima AK",
    monogram: "SA",
    taglineAr: "إقامة فاخرة في أرقى الفلل",
    taglineEn: "Luxury villas, curated for you",
    defaultLocale: "ar" as const,
    direction: "rtl" as const,
  },
  seo: {
    defaultTitleAr: "Shima AK — فلل فاخرة",
    defaultDescriptionAr:
      "Shima AK — اكتشف فللاً فاخرة للإيجار. حجز سهل، مواصفات واضحة، وتواصل مباشر لتأكيد إقامتك.",
    homeDescriptionAr:
      "منصة Shima AK لحجز الفلل الفاخرة — تجربة إقامة استثنائية، تصفية ذكية، وأسعار شفافة.",
    keywordsAr: "Shima AK, فلل, إيجار فاخر, حجز فلل, إقامة فاخرة",
  },
  assets: {
    logoSrc: "/brand/shima-ak-logo.svg",
    logoIconSrc: "/brand/shima-ak-icon.svg",
    favicon: "/brand/shima-ak-icon.svg",
    ogImage: "/brand/shima-ak-og.svg",
    ambientBg: "/brand/shima-ambient-loop.svg",
  },
  animation: {
    ambientCycleSeconds: 3,
  },
  contact: {
    adminWhatsApp: "+972594106293",
    adminWhatsAppDisplay: "+972 59-410-6293",
    phone: "",
    email: "",
    locationAr: "",
  },
  social: {
    x: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  },
  fonts: {
    primary: "Cairo",
    secondary: "Almarai",
    display: "Cormorant Garamond",
    fallbacks: ["Tajawal", "system-ui", "sans-serif"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
