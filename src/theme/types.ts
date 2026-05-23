/** Seasonal brand modes — "Hype" summer vs winter palettes */
export type HypeSeason = "summer" | "winter";

export interface HypeThemeMeta {
  id: HypeSeason;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
}
