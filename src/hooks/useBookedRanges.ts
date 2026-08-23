import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isWithinInterval, isBefore, isEqual, addDays } from 'date-fns';
import { parseDateOnly } from '@/utils/dateOnly';

export interface BookedRange {
  property_id: string;
  check_in: string;
  check_out: string;
}

export function normalizeBookedRange(raw: Record<string, unknown>): BookedRange | null {
  const property_id = String(raw.property_id || '');
  const check_in = String(raw.check_in || '');
  const check_out = String(raw.check_out || '');
  if (!property_id || !/^\d{4}-\d{2}-\d{2}/.test(check_in) || !/^\d{4}-\d{2}-\d{2}/.test(check_out)) {
    return null;
  }
  return { property_id, check_in, check_out };
}

export async function fetchBookedRanges(
  propertyIds: string[],
  window?: { from?: string; to?: string }
): Promise<BookedRange[]> {
  if (propertyIds.length === 0) return [];

  const withWindow = {
    p_property_ids: propertyIds,
    ...(window?.from ? { p_from: window.from } : {}),
    ...(window?.to ? { p_to: window.to } : {}),
  };

  let { data, error } = await supabase.rpc(
    'get_booked_ranges',
    withWindow as { p_property_ids: string[] }
  );

  if (error && (window?.from || window?.to)) {
    const fallback = await supabase.rpc('get_booked_ranges', {
      p_property_ids: propertyIds,
    });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Failed to fetch booked ranges:', error);
    return [];
  }

  return ((data as Record<string, unknown>[]) || [])
    .map((row) => normalizeBookedRange(row))
    .filter((row): row is BookedRange => row !== null);
}

/** A stay night is booked if it falls in [check_in, check_out) */
export function isDateBookedByRanges(date: Date, ranges: BookedRange[]): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return ranges.some((r) => {
    const start = parseDateOnly(r.check_in);
    const endExclusive = parseDateOnly(r.check_out);
    if (!start || !endExclusive) return false;
    if (isEqual(day, start)) return true;
    if (isBefore(day, start)) return false;
    return isBefore(day, endExclusive);
  });
}

export function isRangeFullyAvailable(
  checkIn: string,
  checkOut: string,
  isNightAvailable: (date: Date) => boolean
): boolean {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (!start || !end) return false;
  if (!isBefore(start, end)) return false;
  let cursor = start;
  while (isBefore(cursor, end)) {
    if (!isNightAvailable(cursor)) return false;
    cursor = addDays(cursor, 1);
  }
  return true;
}

/** True when the day falls in an inclusive blocked range (villa_availability). */
export function isDateInAvailabilityPeriods(
  date: Date,
  periods: { available_from: string; available_to: string }[]
): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return periods.some((p) => {
    const start = parseDateOnly(p.available_from);
    const end = parseDateOnly(p.available_to);
    if (!start || !end) return false;
    return isWithinInterval(day, { start, end });
  });
}

export const isDateBlocked = isDateInAvailabilityPeriods;
/** @deprecated Use isDateBlocked — villa_availability is a blocklist, not a whitelist. */
export const isDateInAvailabilityPeriods = isDateInAvailabilityPeriods;

/** True when every night in [checkIn, checkOut) is free of admin blocks and reservations. */
export function isStayAvailable(
  checkIn: string,
  checkOut: string | null | undefined,
  blockedPeriods: { available_from: string; available_to: string }[],
  bookedRanges: BookedRange[]
): boolean {
  const start = parseDateOnly(checkIn);
  if (!start) return false;
  const end = parseDateOnly(checkOut || '') || addDays(start, 1);
  if (!isBefore(start, end)) return false;
  let cursor = start;
  while (isBefore(cursor, end)) {
    if (isDateBlocked(cursor, blockedPeriods)) return false;
    if (isDateBookedByRanges(cursor, bookedRanges)) return false;
    cursor = addDays(cursor, 1);
  }
  return true;
}

export function useBookedRanges(
  propertyId?: string,
  window?: { from?: string; to?: string }
) {
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState(false);

  const fetchRanges = useCallback(async () => {
    if (!propertyId) {
      setRanges([]);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const rows = await fetchBookedRanges(
        [propertyId],
        window?.from || window?.to
          ? { from: window?.from, to: window?.to }
          : undefined
      );
      setRanges(rows);
    } catch (err) {
      console.error('Failed to fetch booked ranges:', err);
      setRanges([]);
      setError(true);
    }
    setLoading(false);
  }, [propertyId, window?.from, window?.to]);

  useEffect(() => {
    fetchRanges();
  }, [fetchRanges]);

  const isDateBooked = useCallback(
    (date: Date) => isDateBookedByRanges(date, ranges),
    [ranges]
  );

  return { ranges, loading, error, isDateBooked, refetch: fetchRanges };
}

export function useBookedRangesForProperties(propertyIds: string[]) {
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propertyIds.length === 0) {
      setRanges([]);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const rows = await fetchBookedRanges(propertyIds);
      if (cancelled) return;
      setRanges(rows);
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [propertyIds.join(',')]);

  return { ranges, loading };
}
