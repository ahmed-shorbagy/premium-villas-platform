/**
 * Shima AK — premium villa rental brand configuration
 */
export const siteConfig = {
  brand: {
    name: "Nuzuul",
    nameAr: "نُزُل",
    nameEn: "Nuzuul",
    monogram: "NZ",
    taglineAr: "إيجار فلل فاخرة في أرقى الوجهات",
    taglineEn: "Luxury villa rentals only",
    defaultLocale: "ar" as const,
    direction: "rtl" as const,
  },
  seo: {
    defaultTitleAr: "نُزُل — إيجار فلل فاخرة",
    defaultDescriptionAr:
      "نُزُل — حجز فلل فاخرة للإيجار. تصفية ذكية، أسعار واضحة، وتواصل مباشر لتأكيد إقامتك.",
    homeDescriptionAr:
      "اكتشف فللاً فاخرة للإيجار — منصة نُزُل مخصصة حصرياً لإيجار الفلل.",
    keywordsAr: "نُزُل, Nuzuul, إيجار فلل, فلل فاخرة, حجز فيلا, إقامة فاخرة",
  },
  assets: {
    logoOnLight: "/brand/nuzuul-logo.png",
    logoOnDark: "/brand/nuzuul-logo.png",
    favicon: "/brand/nuzuul-logo.png",
    ogImage: "/brand/nuzuul-logo.png",
    ambientBg: "/brand/shima-ambient-loop.svg",
    /** Set after adding public/hero/hero-loop.mp4 (and optional .webm) — ~3s seamless loop */
    heroVideoMp4: "",
    heroVideoWebm: "",
  },
  animation: {
    ambientCycleSeconds: 3,
  },
  contact: {
    adminWhatsApp: "+972597470912",
    adminWhatsAppDisplay: "+972 59-747-0912",
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
