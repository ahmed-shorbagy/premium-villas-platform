import { useEffect, useMemo, useState } from 'react';
import { useAvailability } from '@/hooks/useReservations';
import { useBookedRanges } from '@/hooks/useBookedRanges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Loader2, Save } from 'lucide-react';
import BlockedDatesEditor from '@/components/BlockedDatesEditor';
import {
  expandRangesToDates,
  mergeDatesToRanges,
  serializeDateSet,
} from '@/utils/blockedDates';
import { formatDateOnly } from '@/utils/dateOnly';
import { startOfMonth, subMonths } from 'date-fns';

interface AvailabilityManagerProps {
  propertyId: string;
}

const AvailabilityManager = ({ propertyId }: AvailabilityManagerProps) => {
  const fetchFrom = formatDateOnly(startOfMonth(subMonths(new Date(), 1)));
  const { periods, loading, replaceAvailability } = useAvailability(propertyId);
  const { ranges: bookedRanges, loading: bookedLoading } = useBookedRanges(
    propertyId,
    { from: fetchFrom }
  );

  const savedDates = useMemo(() => expandRangesToDates(periods), [periods]);
  const [draftDates, setDraftDates] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftDates(new Set(savedDates));
  }, [savedDates]);

  const dirty =
    serializeDateSet(draftDates) !== serializeDateSet(savedDates);

  const handleSave = async () => {
    setSaving(true);
    const ok = await replaceAvailability(mergeDatesToRanges(draftDates));
    setSaving(false);
    if (ok) setDraftDates(new Set(expandRangesToDates(periods)));
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-orange-600" />
            الأيام المحجوزة / غير المتاحة
          </CardTitle>
          <Button
            type="button"
            size="sm"
            className="gap-1"
            onClick={() => void handleSave()}
            disabled={!dirty || saving || loading}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ التغييرات
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          كل التواريخ مفتوحة للحجز بشكل افتراضي. حدّد فقط الأيام المحجوزة أو غير
          المتاحة. الحجوزات القائمة تظهر بالأحمر ولا يمكن تعديلها من هنا.
        </p>
      </CardHeader>
      <CardContent>
        {loading || bookedLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <BlockedDatesEditor
            blockedDates={draftDates}
            onChange={setDraftDates}
            bookedRanges={bookedRanges}
            disabled={saving}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
