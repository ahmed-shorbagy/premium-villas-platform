import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  isWithinInterval,
  startOfDay,
  isBefore,
  isEqual,
  addDays,
} from 'date-fns';

export interface BookedRange {
  property_id: string;
  check_in: string;
  check_out: string;
}

/** A stay night is booked if it falls in [check_in, check_out) */
export function isDateBookedByRanges(date: Date, ranges: BookedRange[]): boolean {
  const day = startOfDay(date);
  return ranges.some((r) => {
    const start = startOfDay(new Date(r.check_in));
    const endExclusive = startOfDay(new Date(r.check_out));
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
  const start = startOfDay(new Date(checkIn));
  const end = startOfDay(new Date(checkOut));
  if (!isBefore(start, end) && !isEqual(start, end)) return false;
  // For single-night or multi-night: every night from checkIn up to (not including) checkOut must be available
  let cursor = start;
  while (isBefore(cursor, end)) {
    if (!isNightAvailable(cursor)) return false;
    cursor = addDays(cursor, 1);
  }
  return isBefore(start, end);
}

export function useBookedRanges(propertyId?: string) {
  const [ranges, setRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRanges = useCallback(async () => {
    if (!propertyId) {
      setRanges([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('get_booked_ranges', {
      p_property_ids: [propertyId],
    });
    if (error) {
      console.error('Failed to fetch booked ranges:', error);
      setRanges([]);
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

  return { ranges, loading, isDateBooked, refetch: fetchRanges };
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
  return periods.some((p) =>
    isWithinInterval(startOfDay(date), {
      start: startOfDay(new Date(p.available_from)),
      end: startOfDay(new Date(p.available_to)),
    })
  );
}
