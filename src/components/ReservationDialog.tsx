import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  CalendarDays,
  User,
  MapPin,
  Users,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, addDays, isBefore, startOfDay } from 'date-fns';
import { bookingPolicies } from '@/config/booking';
import { groupTypeLabels, type GroupTypeId } from '@/config/filters';
import { useBookingRules, useAvailability } from '@/hooks/useReservations';
import {
  isDateBookedByRanges,
  isDateInAvailabilityPeriods,
  useBookedRanges,
} from '@/hooks/useBookedRanges';
import { addDays, isBefore, startOfDay } from 'date-fns';

const BOOKING_TYPE_OPTIONS: { id: Exclude<GroupTypeId, 'all'>; labelAr: string }[] = [
  { id: 'family', labelAr: 'عائلة' },
  { id: 'youth_male', labelAr: 'شباب فقط' },
  { id: 'women_only', labelAr: 'نساء فقط' },
];

interface ReservationDialogProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyPriceWeekend?: number | null;
  propertyLocation: string;
  pricingType: 'per_night' | 'per_stay';
  groupType?: GroupTypeId | null;
  children: React.ReactNode;
  /** Pre-selected dates from the availability calendar */
  checkIn?: string;
  checkOut?: string;
}

const ReservationDialog = ({
  propertyId,
  propertyTitle,
  propertyPrice,
  propertyPriceWeekend,
  propertyLocation,
  pricingType,
  groupType,
  children,
  checkIn: preCheckIn,
  checkOut: preCheckOut,
}: ReservationDialogProps) => {
  const { bookingRules } = useBookingRules();
  const { periods } = useAvailability(propertyId);
  const { ranges: bookedRanges } = useBookedRanges(propertyId);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'rules'>('form');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fixedGroupType =
    groupType && groupType !== 'all' ? (groupType as Exclude<GroupTypeId, 'all'>) : null;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_location: '',
    customer_notes: '',
    check_in: preCheckIn || '',
    check_out: preCheckOut || '',
    num_guests: '1',
    booking_group_type: fixedGroupType || '',
  });

  useEffect(() => {
    if (open) {
      setFormData((f) => ({
        ...f,
        check_in: preCheckIn || f.check_in,
        check_out: preCheckOut || f.check_out,
        booking_group_type: fixedGroupType || f.booking_group_type,
      }));
    }
  }, [open, preCheckIn, preCheckOut, fixedGroupType]);

  useEffect(() => {
    if (!open) return;
    setFormData((f) => ({
      ...f,
      check_in: preCheckIn || f.check_in,
      check_out: preCheckOut || f.check_out,
    }));
  }, [preCheckIn, preCheckOut, open]);

  const numNights = useMemo(() => {
    if (!formData.check_in || !formData.check_out) return 0;
    const d = differenceInDays(new Date(formData.check_out), new Date(formData.check_in));
    return d > 0 ? d : 0;
  }, [formData.check_in, formData.check_out]);

  const priceDetails = useMemo(() => {
    if (!formData.check_in || !formData.check_out || numNights <= 0) {
      return { total: 0, weekdayNights: 0, weekendNights: 0 };
    }

    if (pricingType === 'per_stay') {
      return { total: propertyPrice, weekdayNights: 0, weekendNights: 0 };
    }

    let total = 0;
    let weekdayNights = 0;
    let weekendNights = 0;

    const start = new Date(formData.check_in);
    for (let i = 0; i < numNights; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const day = currentDate.getDay();
      const isWeekend = day === 4 || day === 5;

      if (isWeekend && propertyPriceWeekend !== undefined && propertyPriceWeekend !== null) {
        total += propertyPriceWeekend;
        weekendNights++;
      } else {
        total += propertyPrice;
        weekdayNights++;
      }
    }

    return { total, weekdayNights, weekendNights };
  }, [formData.check_in, formData.check_out, numNights, propertyPrice, propertyPriceWeekend, pricingType]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(p) + ' شيكل';

  const displayGroupLabel = (id: string) => {
    const opt = BOOKING_TYPE_OPTIONS.find((o) => o.id === id);
    if (opt) return opt.labelAr;
    return groupTypeLabels[id as GroupTypeId] || id;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customer_name.trim()) errs.customer_name = 'الاسم مطلوب';
    if (!formData.customer_phone.trim()) {
      errs.customer_phone = 'الرقم مطلوب';
    } else {
      const cleaned = formData.customer_phone.replace(/\D/g, '');
      if (cleaned.length < 9) errs.customer_phone = 'يرجى إدخال رقم هاتف صحيح';
    }

    if (!formData.check_in) errs.check_in = 'التاريخ مطلوب';
    if (!formData.check_out) errs.check_out = 'تاريخ المغادرة مطلوب';
    if (formData.check_in && formData.check_out && numNights <= 0) {
      errs.check_out = 'تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول';
    }

    if (formData.check_in && formData.check_out && numNights > 0) {
      let cursor = startOfDay(new Date(formData.check_in));
      const end = startOfDay(new Date(formData.check_out));
      while (isBefore(cursor, end)) {
        const inWindow = isDateInAvailabilityPeriods(cursor, periods);
        const booked = isDateBookedByRanges(cursor, bookedRanges);
        if (!inWindow || booked) {
          errs.check_in = 'التواريخ المختارة غير متاحة أو محجوزة';
          break;
        }
        cursor = addDays(cursor, 1);
      }
    }

    if (!formData.booking_group_type) {
      errs.booking_group_type = 'نوع الحجز مطلوب';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToRules = () => {
    if (!validate()) return;
    setStep('rules');
    setAcceptedRules(false);
  };

  const handleSubmit = async () => {
    if (!acceptedRules) {
      setErrors({ rules: 'يجب الموافقة على قوانين الإقامة قبل التأكيد' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const { error } = await supabase.from('reservations').insert({
      property_id: propertyId,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_location: formData.customer_location.trim() || null,
      customer_notes: formData.customer_notes.trim() || null,
      booking_group_type: formData.booking_group_type || null,
      check_in: formData.check_in || null,
      check_out: formData.check_out || null,
      num_guests: parseInt(formData.num_guests) || 1,
      pricing_type: pricingType,
      price_per_night: pricingType === 'per_night' ? propertyPrice : null,
      total_price: priceDetails.total || null,
    } as any);

    setIsSubmitting(false);

    if (error) {
      console.error('Reservation error:', error);
      setErrors({ submit: 'حدث خطأ أثناء إرسال الحجز. يرجى المحاولة مرة أخرى.' });
      return;
    }

    try {
      await supabase.from('analytics').insert({
        event_type: 'reservation_submitted',
        property_id: propertyId,
        metadata: {
          property_title: propertyTitle,
        },
      });
    } catch {
      // non-critical
    }

    try {
      await supabase.functions.invoke('send-telegram', {
        body: {
          propertyTitle,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_location: formData.customer_location,
          check_in: formData.check_in,
          check_out: formData.check_out,
          customer_notes: formData.customer_notes,
        },
      });
    } catch (err) {
      console.error('Failed to send Telegram notification:', err);
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setStep('form');
      setAcceptedRules(false);
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_location: '',
        customer_notes: '',
        check_in: preCheckIn || '',
        check_out: preCheckOut || '',
        num_guests: '1',
        booking_group_type: fixedGroupType || '',
      });
      setErrors({});
    }, 300);
  };

  const checkInOutNote = `الاستلام ${bookingPolicies.checkIn.displayAr} يوم الدخول — المغادرة ${bookingPolicies.checkOut.displayAr} يوم الخروج`;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              {bookingPolicies.confirmation.titleAr}
            </h3>
            <p className="text-muted-foreground text-sm mb-1">
              {bookingPolicies.confirmation.messageAr}
            </p>
            <p className="text-xs text-muted-foreground mb-6">شكراً لاختيارك نُزُل</p>
            <Button variant="gold" onClick={handleClose}>
              إغلاق
            </Button>
          </div>
        ) : step === 'rules' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-right">
                <FileText className="h-5 w-5 text-gold" />
                قوانين الإقامة
              </DialogTitle>
              <DialogDescription className="text-right">
                يرجى قراءة القوانين والموافقة عليها قبل تأكيد الحجز
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {bookingRules.trim() ||
                  'لم تُضف قوانين خاصة بعد. يرجى الالتزام بمواعيد الاستلام والمغادرة أدناه.'}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
                <Clock className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <p className="text-muted-foreground">{checkInOutNote}</p>
              </div>

              {priceDetails.total > 0 && (
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">السعر الإجمالي</p>
                  <p className="font-display text-2xl font-bold text-gold">
                    {formatPrice(priceDetails.total)}
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acceptedRules}
                  onCheckedChange={(v) => setAcceptedRules(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">أوافق على قوانين الإقامة</span>
              </label>
              {errors.rules && <p className="text-xs text-destructive">{errors.rules}</p>}
              {errors.submit && (
                <p className="text-sm text-destructive text-center">{errors.submit}</p>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                variant="gold"
                onClick={handleSubmit}
                disabled={isSubmitting || !acceptedRules}
                className="w-full gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                تأكيد الحجز
                {priceDetails.total > 0 ? ` — ${formatPrice(priceDetails.total)}` : ''}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                رجوع
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-right">
                <CalendarDays className="h-5 w-5 text-gold" />
                حجز الفيلا
              </DialogTitle>
              <DialogDescription className="text-right">
                أدخل بياناتك وسنتواصل معك بأقرب وقت لتأكيد الحجز
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Villa info + prominent price */}
              <div className="rounded-lg bg-secondary/50 p-4 text-sm border border-border">
                <p className="font-medium text-foreground">{propertyTitle}</p>
                <p className="text-muted-foreground text-xs">{propertyLocation}</p>
                <div className="mt-3 rounded-lg bg-card border border-gold/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">السعر</p>
                  {priceDetails.total > 0 ? (
                    <>
                      <p className="font-display text-2xl font-bold text-gold">
                        {formatPrice(priceDetails.total)}
                      </p>
                      {pricingType === 'per_night' && numNights > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {numNights} {numNights === 1 ? 'ليلة' : 'ليالٍ'}
                          {priceDetails.weekendNights > 0
                            ? ` (${priceDetails.weekdayNights} وسط أسبوع + ${priceDetails.weekendNights} نهاية أسبوع)`
                            : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="font-display text-xl font-bold text-gold">
                      {formatPrice(propertyPrice)}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        {pricingType === 'per_night' ? '/ ليلة' : '/ إقامة'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* الاسم */}
              <div className="space-y-1.5">
                <Label htmlFor="res-name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  الاسم *
                </Label>
                <Input
                  id="res-name"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
                {errors.customer_name && (
                  <p className="text-xs text-destructive">{errors.customer_name}</p>
                )}
              </div>

              {/* الرقم */}
              <div className="space-y-1.5">
                <Label htmlFor="res-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  الرقم *
                </Label>
                <Input
                  id="res-phone"
                  type="tel"
                  placeholder="05x xxx xxxx"
                  value={formData.customer_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer_phone: e.target.value.replace(/[^\d\s\-+]/g, ''),
                    })
                  }
                  dir="ltr"
                  className="text-left"
                />
                {errors.customer_phone && (
                  <p className="text-xs text-destructive">{errors.customer_phone}</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  🔒 رقمك محفوظ بسرية تامة ولن يُشارَك مع أي طرف آخر
                </p>
              </div>

              {/* العنوان */}
              <div className="space-y-1.5">
                <Label htmlFor="res-location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  العنوان
                </Label>
                <Input
                  id="res-location"
                  placeholder="المدينة / العنوان"
                  value={formData.customer_location}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_location: e.target.value })
                  }
                />
              </div>

              {/* العدد */}
              <div className="space-y-1.5">
                <Label htmlFor="res-guests" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  العدد
                </Label>
                <Input
                  id="res-guests"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.num_guests}
                  onChange={(e) => setFormData({ ...formData, num_guests: e.target.value })}
                />
              </div>

              {/* نوع الحجز */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">نوع الحجز *</Label>
                {fixedGroupType ? (
                  <div className="rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                    {displayGroupLabel(fixedGroupType)}
                  </div>
                ) : (
                  <Select
                    value={formData.booking_group_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, booking_group_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحجز" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOKING_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.labelAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.booking_group_type && (
                  <p className="text-xs text-destructive">{errors.booking_group_type}</p>
                )}
              </div>

              {/* التاريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="res-checkin">التاريخ — الوصول *</Label>
                  <Input
                    id="res-checkin"
                    type="date"
                    value={formData.check_in}
                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                    dir="ltr"
                    className="text-left"
                  />
                  {errors.check_in && (
                    <p className="text-xs text-destructive">{errors.check_in}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res-checkout">المغادرة *</Label>
                  <Input
                    id="res-checkout"
                    type="date"
                    value={formData.check_out}
                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                    dir="ltr"
                    className="text-left"
                    min={formData.check_in || undefined}
                  />
                  {errors.check_out && (
                    <p className="text-xs text-destructive">{errors.check_out}</p>
                  )}
                </div>
              </div>

              {/* وقت الدخول / الخروج */}
              <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-sm">
                <Clock className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-0.5">وقت الدخول / الخروج</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{checkInOutNote}</p>
                </div>
              </div>

              {/* الملاحظات */}
              <div className="space-y-1.5">
                <Label htmlFor="res-notes" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  الملاحظات
                </Label>
                <Textarea
                  id="res-notes"
                  placeholder="أي طلبات خاصة أو ملاحظات..."
                  value={formData.customer_notes}
                  onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                  rows={3}
                />
              </div>

              {errors.submit && (
                <p className="text-sm text-destructive text-center">{errors.submit}</p>
              )}
            </div>

            <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
              <Button
                variant="gold"
                onClick={handleContinueToRules}
                className="flex-1 gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                متابعة
                {priceDetails.total > 0 ? ` — ${formatPrice(priceDetails.total)}` : ''}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
