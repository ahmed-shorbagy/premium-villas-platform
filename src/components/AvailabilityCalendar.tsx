import { useState } from 'react';
import { useAvailability } from '@/hooks/useReservations';
import { useBookedRanges } from '@/hooks/useBookedRanges';
import { CalendarDays, ChevronRight, ChevronLeft, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
  getDay,
  addDays,
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { parseDateOnly, formatDateOnly } from '@/utils/dateOnly';
import { isDateInAvailabilityPeriods } from '@/hooks/useBookedRanges';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (checkIn: string, checkOut: string) => void;
  /** Fired when user taps a future date that is not bookable (outside whitelist or reserved) */
  onUnavailableDateSelect?: (date: string) => void;
}

const WEEKDAYS_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const AvailabilityCalendar = ({
  propertyId,
  onDateSelect,
  onUnavailableDateSelect,
}: AvailabilityCalendarProps) => {
  const { periods, loading: availabilityLoading } = useAvailability(propertyId);
  const { isDateBooked, loading: bookedLoading } = useBookedRanges(propertyId);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  const loading = availabilityLoading || bookedLoading;
  const today = startOfDay(new Date());

  const isDateInWhitelist = (date: Date): boolean =>
    isDateInAvailabilityPeriods(date, periods);

  /** Bookable = in whitelist AND not overlapping pending/confirmed reservation */
  const isDateBookable = (date: Date): boolean => {
    return isDateInWhitelist(date) && !isDateBooked(date);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek }, () => null);

  const handleDayClick = (day: Date) => {
    if (isBefore(day, today)) return;

    const bookable = isDateBookable(day);

    if (!bookable) {
      setSelectedCheckIn(null);
      setSelectedCheckOut(null);
      onUnavailableDateSelect?.(formatDateOnly(day));
      return;
    }

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(day);
      setSelectedCheckOut(null);
    } else {
      if (isBefore(day, selectedCheckIn)) {
        setSelectedCheckIn(day);
        setSelectedCheckOut(null);
      } else {
        let cursor = startOfDay(selectedCheckIn);
        const end = startOfDay(day);
        let ok = true;
        while (isBefore(cursor, end)) {
          if (!isDateBookable(cursor)) {
            ok = false;
            break;
          }
          cursor = addDays(cursor, 1);
        }
        if (!ok) {
          onUnavailableDateSelect?.(formatDateOnly(day));
          return;
        }
        setSelectedCheckOut(day);
        onDateSelect?.(formatDateOnly(selectedCheckIn), formatDateOnly(day));
      }
    }
  };

  const isInRange = (day: Date): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    return isWithinInterval(day, {
      start: selectedCheckIn,
      end: selectedCheckOut,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground mb-4">
        <CalendarDays className="h-5 w-5 text-gold" />
        التواريخ المتاحة
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : periods.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <XCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>لا توجد تواريخ متاحة حالياً</p>
          <p className="text-xs mt-1">تواصل معنا لمزيد من المعلومات</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm">
              {format(currentMonth, 'MMMM yyyy', { locale: ar })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS_AR.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-medium text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {daysInMonth.map((day) => {
              const isPast = isBefore(day, today);
              const bookable = isDateBookable(day);
              const reserved = isDateInWhitelist(day) && isDateBooked(day);
              const isCheckIn = selectedCheckIn && isSameDay(day, selectedCheckIn);
              const isCheckOut = selectedCheckOut && isSameDay(day, selectedCheckOut);
              const inRange = isInRange(day);

              let className =
                'relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-all ';

              if (isPast) {
                className += 'text-muted-foreground/30 cursor-not-allowed';
              } else if (isCheckIn || isCheckOut) {
                className += 'bg-gold text-white font-bold cursor-pointer ring-2 ring-gold/30';
              } else if (inRange) {
                className += 'bg-gold/20 text-gold font-medium cursor-pointer';
              } else if (bookable) {
                className +=
                  'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40 font-medium';
              } else if (reserved) {
                className +=
                  'bg-red-50 dark:bg-red-900/20 text-red-600/80 dark:text-red-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 text-xs';
              } else {
                className +=
                  'text-muted-foreground/50 cursor-pointer hover:bg-muted/60 line-through';
              }

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={className}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                  title={
                    reserved
                      ? 'محجوزة — اضغط لعرض خيارات مشابهة'
                      : !bookable && !isPast
                        ? 'غير متاح — اضغط لعرض خيارات مشابهة'
                        : undefined
                  }
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/20 border border-green-300" />
              متاح
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-gold" />
              محدد
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
              محجوزة
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-muted border border-border" />
              غير متاح
            </span>
          </div>

          {!selectedCheckIn && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              اختر تاريخ الدخول من التواريخ المتاحة (الخضراء). التواريخ المحجوزة تعرض خيارات
              مشابهة.
            </p>
          )}
          {selectedCheckIn && !selectedCheckOut && (
            <p className="text-xs text-gold text-center mt-3 font-medium">
              الآن اختر تاريخ الخروج
            </p>
          )}

          {periods.filter((p) => {
            const to = parseDateOnly(p.available_to);
            return to && !isBefore(to, today);
          }).length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand" />
                فترات التوفر القادمة:
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pe-1 custom-scrollbar">
                {periods
                  .filter((p) => {
                    const to = parseDateOnly(p.available_to);
                    return to && !isBefore(to, today);
                  })
                  .sort((a, b) => {
                    const aFrom = parseDateOnly(a.available_from)?.getTime() || 0;
                    const bFrom = parseDateOnly(b.available_from)?.getTime() || 0;
                    return aFrom - bFrom;
                  })
                  .map((period, i) => {
                    const from = parseDateOnly(period.available_from);
                    const to = parseDateOnly(period.available_to);
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs bg-secondary/30 p-2.5 rounded-lg border border-border/50"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground font-medium">
                            من:{' '}
                            <span className="text-foreground">
                              {from
                                ? format(from, 'd MMM yyyy', { locale: ar })
                                : period.available_from}
                            </span>
                          </span>
                          <span className="text-muted-foreground font-medium">
                            إلى:{' '}
                            <span className="text-foreground">
                              {to
                                ? format(to, 'd MMM yyyy', { locale: ar })
                                : period.available_to}
                            </span>
                          </span>
                        </div>
                        {period.price_override && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-muted-foreground">سعر خاص</span>
                            <span className="text-gold font-bold">
                              {period.price_override} ₪/ليلة
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
