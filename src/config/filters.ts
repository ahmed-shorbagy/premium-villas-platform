/**
 * High-end filter criteria (client brief) — used by filter UI and booking engine.
 */
export const groupTypes = [
  { id: "family", labelAr: "إيجار للعائلات" },
  { id: "youth_male", labelAr: "شباب فقط" },
  { id: "women_only", labelAr: "نساء فقط" },
] as const;

export type GroupTypeId = (typeof groupTypes)[number]["id"];

export const groupTypeLabels: Record<GroupTypeId, string> = Object.fromEntries(
  groupTypes.map((g) => [g.id, g.labelAr]),
) as Record<GroupTypeId, string>;

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
