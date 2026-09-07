import { addDays, differenceInDays } from 'date-fns';
import { formatDateOnly, parseDateOnly } from '@/utils/dateOnly';

export interface PricePeriodRange {
  period_start: string;
  period_end: string;
  price_override: number | null;
}

export interface StayPriceInput {
  checkIn: string;
  checkOut: string;
  pricingType: 'per_night' | 'per_stay';
  weekdayPrice: number;
  weekendPrice?: number | null;
  periods?: PricePeriodRange[];
}

export interface StayPriceDetails {
  total: number;
  weekdayNights: number;
  weekendNights: number;
  customNights: number;
}

function isWeekendDay(date: Date): boolean {
  const day = date.getDay();
  return day === 4 || day === 5;
}

/** Later-starting periods win when ranges overlap. */
function overrideForDate(dateStr: string, periods: PricePeriodRange[]): number | null {
  let found: number | null = null;
  const sorted = [...periods].sort((a, b) =>
    a.period_start.localeCompare(b.period_start)
  );
  for (const period of sorted) {
    if (period.price_override == null) continue;
    if (dateStr >= period.period_start && dateStr <= period.period_end) {
      found = Number(period.price_override);
    }
  }
  return found != null && Number.isFinite(found) ? found : null;
}

export function calculateStayPrice(input: StayPriceInput): StayPriceDetails {
  const empty: StayPriceDetails = {
    total: 0,
    weekdayNights: 0,
    weekendNights: 0,
    customNights: 0,
  };

  const start = parseDateOnly(input.checkIn);
  const end = parseDateOnly(input.checkOut);
  if (!start || !end) return empty;

  const numNights = differenceInDays(end, start);
  if (numNights <= 0) return empty;

  const periods = input.periods || [];

  if (input.pricingType === 'per_stay') {
    const checkInStr = formatDateOnly(start);
    const override = overrideForDate(checkInStr, periods);
    return {
      total: override != null ? override : input.weekdayPrice,
      weekdayNights: 0,
      weekendNights: 0,
      customNights: override != null ? 1 : 0,
    };
  }

  let total = 0;
  let weekdayNights = 0;
  let weekendNights = 0;
  let customNights = 0;

  for (let i = 0; i < numNights; i++) {
    const currentDate = addDays(start, i);
    const dateStr = formatDateOnly(currentDate);
    const override = overrideForDate(dateStr, periods);

    if (override != null) {
      total += override;
      customNights++;
      continue;
    }

    if (
      isWeekendDay(currentDate) &&
      input.weekendPrice !== undefined &&
      input.weekendPrice !== null
    ) {
      total += input.weekendPrice;
      weekendNights++;
    } else {
      total += input.weekdayPrice;
      weekdayNights++;
    }
  }

  return { total, weekdayNights, weekendNights, customNights };
}
