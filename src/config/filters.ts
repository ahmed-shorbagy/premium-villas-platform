/**
 * High-end filter criteria (client brief) — used by filter UI and booking engine.
 */
export const groupTypes = [
  { id: "family", labelAr: "إيجار للعائلات" },
  { id: "youth_male", labelAr: "شباب فقط" },
  { id: "women_only", labelAr: "نساء فقط" },
  { id: "all", labelAr: "الكل (عائلات - شباب - بنات)" },
] as const;

export type GroupTypeId = (typeof groupTypes)[number]["id"];

export const groupTypeLabels: Record<GroupTypeId, string> = Object.fromEntries(
  groupTypes.map((g) => [g.id, g.labelAr]),
) as Record<GroupTypeId, string>;

/** Short labels for a booking (WhatsApp / reservation form), not villa listing filters. */
export const bookingGroupTypeOptions: {
  id: Exclude<GroupTypeId, "all">;
  labelAr: string;
}[] = [
  { id: "family", labelAr: "عائلة" },
  { id: "youth_male", labelAr: "شباب" },
  { id: "women_only", labelAr: "نساء" },
];

export function bookingGroupTypeLabel(id: string | null | undefined): string {
  if (!id) return "—";
  const option = bookingGroupTypeOptions.find((item) => item.id === id);
  if (option) return option.labelAr;
  return groupTypeLabels[id as GroupTypeId] || id;
}

export const roomCounts = [2, 3, 4, 5, 6, 7] as const;
export type RoomCount = (typeof roomCounts)[number];

export interface VillaFilterState {
  checkIn?: Date;
  checkOut?: Date;
  nights?: number;
  guests?: number;
  groupType?: GroupTypeId;
  rooms?: RoomCount;
  amenities?: string[];
}
