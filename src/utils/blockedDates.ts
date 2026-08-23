import { addDays, isBefore } from 'date-fns';
import { formatDateOnly, parseDateOnly } from '@/utils/dateOnly';

export interface DateRangeInclusive {
  available_from: string;
  available_to: string;
}

/** Inclusive [from, to] blocked/unavailable nights. */
export function expandRangesToDates(
  periods: DateRangeInclusive[]
): Set<string> {
  const dates = new Set<string>();
  for (const period of periods) {
    const start = parseDateOnly(period.available_from);
    const end = parseDateOnly(period.available_to);
    if (!start || !end) continue;
    let cursor = start;
    while (!isBefore(end, cursor)) {
      dates.add(formatDateOnly(cursor));
      cursor = addDays(cursor, 1);
    }
  }
  return dates;
}

/** Merge sorted YYYY-MM-DD dates into inclusive ranges. */
export function mergeDatesToRanges(dates: Iterable<string>): DateRangeInclusive[] {
  const sorted = [...new Set(dates)].filter(Boolean).sort();
  if (sorted.length === 0) return [];

  const ranges: DateRangeInclusive[] = [];
  let from = sorted[0];
  let to = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    const expected = parseDateOnly(to);
    if (expected && formatDateOnly(addDays(expected, 1)) === next) {
      to = next;
    } else {
      ranges.push({ available_from: from, available_to: to });
      from = next;
      to = next;
    }
  }
  ranges.push({ available_from: from, available_to: to });
  return ranges;
}

export function eachDateInSpan(start: Date, end: Date): Date[] {
  const from = start <= end ? start : end;
  const to = start <= end ? end : start;
  const out: Date[] = [];
  let cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const last = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (!isBefore(last, cursor)) {
    out.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return out;
}

export function serializeDateSet(dates: Set<string>): string {
  return [...dates].sort().join(',');
}
