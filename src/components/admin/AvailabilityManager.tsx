import { useState } from 'react';
import { useAvailability, AvailabilityPeriod } from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Plus, Trash2, Loader2, DollarSign } from 'lucide-react';

interface AvailabilityManagerProps {
  propertyId: string;
}

const AvailabilityManager = ({ propertyId }: AvailabilityManagerProps) => {
  const { periods, loading, addAvailability, deleteAvailability } = useAvailability(propertyId);
  const [showForm, setShowForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    available_from: '',
    available_to: '',
    price_override: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newPeriod.available_from || !newPeriod.available_to) return;
    setSubmitting(true);

    const success = await addAvailability({
      available_from: newPeriod.available_from,
      available_to: newPeriod.available_to,
      price_override: newPeriod.price_override ? parseFloat(newPeriod.price_override) : null,
      notes: newPeriod.notes || undefined,
    });

    if (success) {
      setNewPeriod({ available_from: '', available_to: '', price_override: '', notes: '' });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف فترة التوفر هذه؟')) return;
    await deleteAvailability(id);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-green-600" />
            تواريخ التوفر
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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        {showForm && (
          <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="avail-from">من تاريخ</Label>
                <Input
                  id="avail-from"
                  type="date"
                  dir="ltr"
                  className="text-right"
                  value={newPeriod.available_from}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, available_from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="avail-to">إلى تاريخ</Label>
                <Input
                  id="avail-to"
                  type="date"
                  dir="ltr"
                  className="text-right"
                  value={newPeriod.available_to}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, available_to: e.target.value })
                  }
                  min={newPeriod.available_from}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-override">
                سعر مخصص لهذه الفترة (اختياري)
              </Label>
              <div className="relative">
                <DollarSign className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price-override"
                  type="number"
                  placeholder="اتركه فارغاً لاستخدام السعر الأصلي"
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
              <Label htmlFor="avail-notes">ملاحظات (اختياري)</Label>
              <Input
                id="avail-notes"
                placeholder="مثال: موسم العيد، أسعار الصيف"
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
                onClick={handleSubmit}
                disabled={submitting || !newPeriod.available_from || !newPeriod.available_to}
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

        {/* Existing periods */}
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>لم تُضَف تواريخ توفر بعد</p>
            <p className="text-xs">اضغط "إضافة فترة" لتحديد التواريخ المتاحة للحجز</p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-green-600">●</span>
                    <span>{formatDate(p.available_from)}</span>
                    <span className="text-muted-foreground">←</span>
                    <span>{formatDate(p.available_to)}</span>
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                    {p.price_override && (
                      <span className="text-gold font-medium">
                        {new Intl.NumberFormat('ar-EG').format(p.price_override)} شيكل
                      </span>
                    )}
                    {p.notes && <span>{p.notes}</span>}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => handleDelete(p.id)}
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

export default AvailabilityManager;
