/**
 * High-end filter criteria (client brief) — used by filter UI and booking engine.
 */
export const groupTypes = [
  { id: "family", labelAr: "عائلة" },
  { id: "youth_male", labelAr: "شباب فقط" },
  { id: "youth_female", labelAr: "بنات فقط" },
] as const;

export type GroupTypeId = (typeof groupTypes)[number]["id"];

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
