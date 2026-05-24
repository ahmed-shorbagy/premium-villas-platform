/**
 * Shima AK — villas for rent only (no sale, no apartments/commercial).
 */
export const platformScope = {
  propertyType: "villa" as const,
  listingType: "rent" as const,
  propertyTypeLabelAr: "فيلا",
  listingTypeLabelAr: "إيجار",
  listingsTitleAr: "الفلل",
  listingsEmptyAr: "لا توجد فلل متاحة للإيجار حالياً",
} as const;
