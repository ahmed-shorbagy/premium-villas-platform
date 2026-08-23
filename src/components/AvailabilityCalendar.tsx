import { useState } from 'react';
import { useAvailability } from '@/hooks/useReservations';
import { isDateBlocked, useBookedRanges } from '@/hooks/useBookedRanges';
import { CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react';
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
import { formatDateOnly } from '@/utils/dateOnly';

interface AvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (checkIn: string, checkOut: string) => void;
  /** Fired when user taps a future date that is not bookable (blocked or reserved) */
  onUnavailableDateSelect?: (date: string) => void;
}

const WEEKDAYS_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const AvailabilityCalendar = ({
  propertyId,
  onDateSelect,
  onUnavailableDateSelect,
}: AvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  const fetchFrom = formatDateOnly(startOfMonth(new Date()));
  const { periods, loading: availabilityLoading } = useAvailability(propertyId, {
    from: fetchFrom,
  });
  const { isDateBooked, loading: bookedLoading } = useBookedRanges(propertyId, {
    from: fetchFrom,
  });

  const loading = availabilityLoading || bookedLoading;
  const today = startOfDay(new Date());

  const isDateBookable = (date: Date): boolean =>
    !isDateBlocked(date, periods) && !isDateBooked(date);

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
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <CalendarDays className="h-5 w-5 text-gold" />
        التواريخ المتاحة
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
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

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS_AR.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-medium text-muted-foreground"
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
              const reserved = !isPast && !bookable;
              const isCheckIn = selectedCheckIn && isSameDay(day, selectedCheckIn);
              const isCheckOut = selectedCheckOut && isSameDay(day, selectedCheckOut);
              const inRange = isInRange(day);

              let className =
                'relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-all ';

              if (isPast) {
                className += 'cursor-not-allowed text-muted-foreground/30';
              } else if (isCheckIn || isCheckOut) {
                className +=
                  'cursor-pointer bg-gold font-bold text-white ring-2 ring-gold/30';
              } else if (inRange) {
                className += 'cursor-pointer bg-gold/20 font-medium text-gold';
              } else if (bookable) {
                className +=
                  'cursor-pointer bg-green-50 font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40';
              } else {
                className +=
                  'cursor-pointer bg-red-50 text-xs text-red-600/80 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40';
              }

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={className}
                  onClick={() => handleDayClick(day)}
                  disabled={isPast}
                  title={
                    reserved ? 'محجوز — اضغط لعرض خيارات مشابهة' : undefined
                  }
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm border border-green-300 bg-green-100 dark:bg-green-900/20" />
              متاح
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-gold" />
              محدد
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm border border-red-300 bg-red-100" />
              محجوز
            </span>
          </div>

          {!selectedCheckIn && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              كل الأيام القادمة متاحة إلا إذا ظهرت بالأحمر (محجوزة). اختر تاريخ الدخول ثم
              تاريخ الخروج.
            </p>
          )}
          {selectedCheckIn && !selectedCheckOut && (
            <p className="mt-3 text-center text-xs font-medium text-gold">
              الآن اختر تاريخ الخروج
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
