/**
 * Booking rules, pricing tiers, and checkout policies from client brief.
 */
export const bookingPolicies = {
  checkIn: {
    time: "17:00",
    labelAr: "الاستلام",
    displayAr: "5:00 مساءً (عصراً)",
  },
  checkOut: {
    time: "15:00",
    labelAr: "المغادرة",
    displayAr: "3:00 ظهراً (اليوم التالي)",
    nextDay: true,
  },
  confirmation: {
    titleAr: "شكراً لك",
    messageAr: "سيتم التواصل معك قريباً لتأكيد الحجز",
  },
} as const;

/** Saturday–Wednesday = weekday tier; Thursday–Friday = weekend premium (Israel/weekend pattern per brief) */
export const WEEKDAY_DAYS = [6, 0, 1, 2, 3] as const; // Sat, Sun, Mon, Tue, Wed
export const WEEKEND_DAYS = [4, 5] as const; // Thu, Fri

export type PriceTier = "weekday_low" | "weekday_high" | "weekend";

export interface PricingTierConfig {
  id: PriceTier;
  labelAr: string;
  minPrice: number;
  maxPrice?: number;
}

export const pricingTiers: Record<PriceTier, PricingTierConfig> = {
  weekday_low: {
    id: "weekday_low",
    labelAr: "أيام الأسبوع (أقل من 1000)",
    minPrice: 0,
    maxPrice: 999,
  },
  weekday_high: {
    id: "weekday_high",
    labelAr: "أيام الأسبوع (1000+)",
    minPrice: 1000,
  },
  weekend: {
    id: "weekend",
    labelAr: "عطلة نهاية الأسبوع (خميس–جمعة)",
    minPrice: 1200,
  },
};

export function isWeekendDay(dayOfWeek: number): boolean {
  return (WEEKEND_DAYS as readonly number[]).includes(dayOfWeek);
}

export function getPriceTierForDate(date: Date, basePrice: number): PriceTier {
  if (isWeekendDay(date.getDay())) return "weekend";
  return basePrice >= 1000 ? "weekday_high" : "weekday_low";
}
