import type { HypeSeason } from "./types";

/**
 * HSL channel values (without hsl()) for CSS custom properties.
 * Applied via [data-hype] selectors in index.css and synced by HypeController.
 */
export type HypeTokenMap = Record<string, string>;

export const HYPE_THEME_META = {
  summer: {
    id: "summer" as const,
    labelAr: "صيف",
    labelEn: "Summer",
    descriptionAr: "رمال دافئة، ذهب، وضوح عالي",
  },
  winter: {
    id: "winter" as const,
    labelAr: "شتاء",
    labelEn: "Winter",
    descriptionAr: "أزرق عميق، زمردي، زجاج مطفي",
  },
} satisfies Record<HypeSeason, { id: HypeSeason; labelAr: string; labelEn: string; descriptionAr: string }>;

export const DEFAULT_HYPE_SEASON: HypeSeason = "summer";

export const HYPE_STORAGE_KEY = "premium-villas-hype-season";
