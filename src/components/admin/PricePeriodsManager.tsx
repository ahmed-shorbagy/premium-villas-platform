import { useState } from 'react';
import { usePricePeriods } from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Plus, Trash2, Loader2, DollarSign } from 'lucide-react';
import { parseDateOnly } from '@/utils/dateOnly';

interface PricePeriodsManagerProps {
  propertyId: string;
}

const formatPeriodDate = (value: string) => {
  const parsed = parseDateOnly(value);
  return parsed
    ? parsed.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : value;
};

const PricePeriodsManager = ({ propertyId }: PricePeriodsManagerProps) => {
  const { periods, loading, addPricePeriod, deletePricePeriod } =
    usePricePeriods(propertyId);
  const [showForm, setShowForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    period_start: '',
    period_end: '',
    price_override: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newPeriod.period_start || !newPeriod.period_end || !newPeriod.price_override) {
      return;
    }
    setSubmitting(true);

    const success = await addPricePeriod({
      period_start: newPeriod.period_start,
      period_end: newPeriod.period_end,
      price_override: parseFloat(newPeriod.price_override),
      notes: newPeriod.notes || undefined,
    });

    if (success) {
      setNewPeriod({
        period_start: '',
        period_end: '',
        price_override: '',
        notes: '',
      });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف سعر هذه الفترة؟')) return;
    await deletePricePeriod(id);
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-amber-600" />
            أسعار مخصصة لأيام ومناسبات
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة فترة
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          غيّر سعر الليلة لفترة محددة (عيد، مناسبة، أيام معيّنة). الأيام خارج هذه
          الفترات تبقى على سعر وسط الأسبوع / نهاية الأسبوع.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="price-from">من تاريخ</Label>
                <Input
                  id="price-from"
                  type="date"
                  value={newPeriod.period_start}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, period_start: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="price-to">إلى تاريخ</Label>
                <Input
                  id="price-to"
                  type="date"
                  value={newPeriod.period_end}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, period_end: e.target.value })
                  }
                  min={newPeriod.period_start}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-override">سعر مخصص لهذه الفترة *</Label>
              <div className="relative">
                <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price-override"
                  type="number"
                  placeholder="شيكل / ليلة (أو للإقامة إن كان التسعير للإقامة)"
                  value={newPeriod.price_override}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, price_override: e.target.value })
                  }
                  className="ps-10"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-notes">ملاحظات (اختياري)</Label>
              <Input
                id="price-notes"
                placeholder="مثال: موسم العيد، مناسبة، أسعار الصيف"
                value={newPeriod.notes}
                onChange={(e) =>
                  setNewPeriod({ ...newPeriod, notes: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSubmit()}
                disabled={
                  submitting ||
                  !newPeriod.period_start ||
                  !newPeriod.period_end ||
                  !newPeriod.price_override
                }
                className="gap-1"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                إضافة
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>لا توجد أسعار مخصصة بعد</p>
            <p className="text-xs">اضغط «إضافة فترة» لتحديد سعر لأيام أو مناسبات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-amber-600">●</span>
                    <span>{formatPeriodDate(period.period_start)}</span>
                    <span className="text-muted-foreground">←</span>
                    <span>{formatPeriodDate(period.period_end)}</span>
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="text-gold font-medium">
                      {new Intl.NumberFormat('ar-EG').format(period.price_override)} شيكل
                    </span>
                    {period.notes && <span>{period.notes}</span>}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void handleDelete(period.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricePeriodsManager;
