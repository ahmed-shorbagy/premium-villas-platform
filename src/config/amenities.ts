/**
 * Villa amenity tags for schema, filters, and display (client brief).
 */
export const AMENITY_IDS = [
  "jacuzzi",
  "billiards",
  "tennis",
  "sauna",
  "kids_pool",
  "kids_games",
] as const;

export type AmenityId = (typeof AMENITY_IDS)[number];

export interface AmenityDefinition {
  id: AmenityId;
  labelAr: string;
  labelEn: string;
}

export const amenitiesCatalog: Record<AmenityId, AmenityDefinition> = {
  jacuzzi: { id: "jacuzzi", labelAr: "جاكوزي", labelEn: "Jacuzzi" },
  billiards: { id: "billiards", labelAr: "بلياردو", labelEn: "Billiards" },
  tennis: { id: "tennis", labelAr: "تنس", labelEn: "Tennis" },
  sauna: { id: "sauna", labelAr: "ساونا", labelEn: "Sauna" },
  kids_pool: { id: "kids_pool", labelAr: "بركة أطفال", labelEn: "Kids Pool" },
  kids_games: { id: "kids_games", labelAr: "ألعاب أطفال", labelEn: "Kids Games" },
};

export const amenitiesList = AMENITY_IDS.map((id) => amenitiesCatalog[id]);
