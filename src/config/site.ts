/**
 * Shima AK — premium villa rental brand configuration
 */
export const siteConfig = {
  brand: {
    name: "Shima AK",
    nameAr: "شيما AK",
    nameEn: "Shima AK",
    monogram: "SA",
    taglineAr: "إيجار فلل فاخرة في أرقى الوجهات",
    taglineEn: "Luxury villa rentals only",
    defaultLocale: "ar" as const,
    direction: "rtl" as const,
  },
  seo: {
    defaultTitleAr: "Shima AK — إيجار فلل فاخرة",
    defaultDescriptionAr:
      "Shima AK — حجز فلل فاخرة للإيجار فقط. تصفية ذكية، أسعار واضحة، وتواصل مباشر لتأكيد إقامتك.",
    homeDescriptionAr:
      "اكتشف فللاً فاخرة للإيجار — منصة Shima AK مخصصة حصرياً لإيجار الفلل.",
    keywordsAr: "Shima AK, إيجار فلل, فلل فاخرة, حجز فيلا, إقامة فاخرة",
  },
  assets: {
    logoOnLight: "/brand/shima-ak-logo-light.png",
    logoOnDark: "/brand/shima-ak-logo-dark.png",
    /** @deprecated Use logoOnLight / ShimaLogo */
    logoSrc: "/brand/shima-ak-logo-light.png",
    logoIconSrc: "/brand/shima-ak-icon.svg",
    favicon: "/brand/shima-ak-icon.svg",
    ogImage: "/brand/shima-ak-og.png",
    ambientBg: "/brand/shima-ambient-loop.svg",
    /** Set after adding public/hero/hero-loop.mp4 (and optional .webm) — ~3s seamless loop */
    heroVideoMp4: "",
    heroVideoWebm: "",
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
