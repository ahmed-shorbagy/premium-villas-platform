import { useEffect, useRef, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateOnly } from '@/utils/dateOnly';
import { eachDateInSpan } from '@/utils/blockedDates';
import { isDateBookedByRanges, type BookedRange } from '@/hooks/useBookedRanges';

const WEEKDAYS_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

interface BlockedDatesEditorProps {
  blockedDates: Set<string>;
  onChange: (next: Set<string>) => void;
  bookedRanges?: BookedRange[];
  disabled?: boolean;
}

const BlockedDatesEditor = ({
  blockedDates,
  onChange,
  bookedRanges = [],
  disabled = false,
}: BlockedDatesEditorProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dragRef = useRef<{
    start: Date;
    adding: boolean;
    baseline: Set<string>;
  } | null>(null);
  const today = startOfDay(new Date());

  useEffect(() => {
    const endDrag = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  const applySpan = (start: Date, end: Date, adding: boolean, baseline: Set<string>) => {
    const next = new Set(baseline);
    for (const day of eachDateInSpan(start, end)) {
      if (isBefore(day, today)) continue;
      if (isDateBookedByRanges(day, bookedRanges)) continue;
      const key = formatDateOnly(day);
      if (adding) next.add(key);
      else next.delete(key);
    }
    onChange(next);
  };

  const beginDrag = (day: Date) => {
    if (disabled || isBefore(day, today) || isDateBookedByRanges(day, bookedRanges)) return;
    const key = formatDateOnly(day);
    const adding = !blockedDates.has(key);
    dragRef.current = { start: day, adding, baseline: new Set(blockedDates) };
    applySpan(day, day, adding, dragRef.current.baseline);
  };

  const continueDrag = (day: Date) => {
    const drag = dragRef.current;
    if (!drag || disabled) return;
    applySpan(drag.start, day, drag.adding, drag.baseline);
  };

  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const paddingDays = Array.from({ length: getDay(monthStart) }, () => null);

    return (
      <div className="min-w-0">
        <p className="mb-2 text-center text-sm font-medium">
          {format(month, 'MMMM yyyy', { locale: ar })}
        </p>
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS_AR.map((d) => (
            <div
              key={`${formatDateOnly(monthStart)}-${d}`}
              className="py-1 text-center text-[11px] font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 select-none">
          {paddingDays.map((_, i) => (
            <div key={`pad-${formatDateOnly(monthStart)}-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const isPast = isBefore(day, today);
            const reserved = isDateBookedByRanges(day, bookedRanges);
            const blocked = blockedDates.has(formatDateOnly(day));
            const isToday = isSameDay(day, today);

            let className =
              'relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors ';

            if (isPast) {
              className += 'cursor-not-allowed text-muted-foreground/30';
            } else if (reserved) {
              className +=
                'cursor-not-allowed bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            } else if (blocked) {
              className +=
                'cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300';
            } else {
              className +=
                'cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            }

            if (isToday && !isPast) {
              className += ' ring-1 ring-gold/60';
            }

            return (
              <button
                key={formatDateOnly(day)}
                type="button"
                className={className}
                disabled={disabled || isPast || reserved}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  beginDrag(day);
                }}
                onPointerEnter={() => continueDrag(day)}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">اختر الأيام المحجوزة</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {renderMonth(currentMonth)}
        <div className="hidden sm:block">{renderMonth(addMonths(currentMonth, 1))}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-green-300 bg-green-100" />
          متاح
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-orange-300 bg-orange-100" />
          محجوز / غير متاح
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-red-300 bg-red-100" />
          حجز قائم
        </span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        اضغط على يوم أو اسحب لتحديد فترة. الأيام الخضراء تبقى مفتوحة للحجز حتى تحجبها.
      </p>
    </div>
  );
};

export default BlockedDatesEditor;
