import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isWithinInterval, isBefore, isEqual, addDays } from 'date-fns';
import { parseDateOnly } from '@/utils/dateOnly';

export interface BookedRange {
  property_id: string;
  check_in: string;
  check_out: string;
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

export function useBookedRanges(propertyId?: string) {
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
    const { data, error: rpcError } = await supabase.rpc('get_booked_ranges', {
      p_property_ids: [propertyId],
    });
    if (rpcError) {
      console.error('Failed to fetch booked ranges:', rpcError);
      setRanges([]);
      setError(true);
    } else {
      setRanges((data as BookedRange[]) || []);
    }
    setLoading(false);
  }, [propertyId]);

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
      const { data, error } = await supabase.rpc('get_booked_ranges', {
        p_property_ids: propertyIds,
      });
      if (cancelled) return;
      if (error) {
        console.error('Failed to fetch booked ranges:', error);
        setRanges([]);
      } else {
        setRanges((data as BookedRange[]) || []);
      }
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [propertyIds.join(',')]);

  return { ranges, loading };
}

/** Check if a calendar day falls inside an availability whitelist period */
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
