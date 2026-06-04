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
import {
  Phone,
  CalendarDays,
  User,
  MapPin,
  Mail,
  Users,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { siteConfig } from '@/config/site';
import { differenceInDays } from 'date-fns';
import { useVillaOwnerWhatsApp } from '@/hooks/useReservations';

interface ReservationDialogProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyPriceWeekend?: number | null;
  propertyLocation: string;
  pricingType: 'per_night' | 'per_stay';
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
  children,
  checkIn: preCheckIn,
  checkOut: preCheckOut,
}: ReservationDialogProps) => {
  const { ownerWhatsApp } = useVillaOwnerWhatsApp();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_location: '',
    customer_email: '',
    customer_notes: '',
    check_in: preCheckIn || '',
    check_out: preCheckOut || '',
    num_guests: '1',
  });

  // Sync pre-selected dates
  useEffect(() => {
    if (preCheckIn) setFormData((f) => ({ ...f, check_in: preCheckIn }));
    if (preCheckOut) setFormData((f) => ({ ...f, check_out: preCheckOut }));
  }, [preCheckIn, preCheckOut]);

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
      
      // Weekends: Thursday (4) and Friday (5)
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

  const totalPrice = propertyPrice;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(p) + ' شيكل';

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customer_name.trim()) errs.customer_name = 'الاسم مطلوب';
    if (!formData.customer_phone.trim()) {
      errs.customer_phone = 'رقم الهاتف مطلوب';
    } else {
      const cleaned = formData.customer_phone.replace(/\D/g, '');
      if (cleaned.length < 9) errs.customer_phone = 'يرجى إدخال رقم هاتف صحيح';
    }
    
    if (!formData.check_in) errs.check_in = 'تاريخ الوصول مطلوب';
    if (!formData.check_out) errs.check_out = 'تاريخ المغادرة مطلوب';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const { error } = await supabase.from('reservations').insert({
      property_id: propertyId,
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_email: formData.customer_email.trim() || null,
      customer_notes: formData.customer_notes.trim() || null,
      check_in: null,
      check_out: null,
      num_guests: parseInt(formData.num_guests) || 1,
      pricing_type: pricingType,
      price_per_night: pricingType === 'per_night' ? propertyPrice : null,
      total_price: null,
    });

    setIsSubmitting(false);

    if (error) {
      console.error('Reservation error:', error);
      setErrors({ submit: 'حدث خطأ أثناء إرسال الحجز. يرجى المحاولة مرة أخرى.' });
      return;
    }

    // Track in analytics
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

    // Build WhatsApp message
    let datesText = 'لم يتم التحديد';
    if (formData.check_in && formData.check_out) {
      datesText = `من ${formData.check_in} إلى ${formData.check_out}`;
    } else if (formData.check_in) {
      datesText = `من ${formData.check_in}`;
    }

    const message = `حجز جديد لفيلا: ${propertyTitle}
الاسم: ${formData.customer_name}
المدينة/المكان: ${formData.customer_location || 'غير محدد'}
تاريخ الحجز: ${datesText}
رقم العميل: \u202A${formData.customer_phone}\u202C
الملاحظات: ${formData.customer_notes || 'لا يوجد'}`;

    const encodedMessage = encodeURIComponent(message);
    const targetNumber = (ownerWhatsApp || siteConfig.contact.adminWhatsApp).replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_location: '',
        customer_email: '',
        customer_notes: '',
        check_in: '',
        check_out: '',
        num_guests: '1',
      });
      setErrors({});
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              تم إرسال طلب الحجز!
            </h3>
            <p className="text-muted-foreground text-sm mb-1">
              سيتم التواصل معك قريباً لتأكيد الحجز
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              شكراً لاختيارك Shima AK
            </p>
            <Button variant="gold" onClick={handleClose}>
              إغلاق
            </Button>
          </div>
        ) : (
          /* Form State */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-right">
                <CalendarDays className="h-5 w-5 text-gold" />
                حجز الفيلا
              </DialogTitle>
              <DialogDescription className="text-right">
                أدخل بياناتك وسنتواصل معك بأقرب وقت لتأكيد الحجز وتحديد التواريخ
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Villa info snippet */}
              <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                <p className="font-medium text-foreground">{propertyTitle}</p>
                <p className="text-muted-foreground text-xs">{propertyLocation}</p>
                <p className="text-gold font-semibold mt-1">
                  {formatPrice(propertyPrice)}{' '}
                  <span className="text-muted-foreground font-normal">
                    {pricingType === 'per_night' ? '/ ليلة' : '/ إقامة'}
                  </span>
                </p>
              </div>

              {/* Customer name */}
              <div className="space-y-1.5">
                <Label htmlFor="res-name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  الاسم الكامل *
                </Label>
                <Input
                  id="res-name"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                />
                {errors.customer_name && (
                  <p className="text-xs text-destructive">{errors.customer_name}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="res-checkin" className="flex items-center gap-1.5">
                    تاريخ الوصول *
                  </Label>
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
                  <Label htmlFor="res-checkout" className="flex items-center gap-1.5">
                    تاريخ المغادرة *
                  </Label>
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

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="res-location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  المدينة / مكان الإقامة
                </Label>
                <Input
                  id="res-location"
                  placeholder="مثال: الرياض، دبي، إلخ"
                  value={formData.customer_location}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_location: e.target.value })
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="res-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  رقم الهاتف *
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

              {/* Email (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="res-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  البريد الإلكتروني (اختياري)
                </Label>
                <Input
                  id="res-email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.customer_email}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_email: e.target.value })
                  }
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {/* Guests */}
              <div className="space-y-1.5">
                <Label htmlFor="res-guests" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  عدد الضيوف
                </Label>
                <Input
                  id="res-guests"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.num_guests}
                  onChange={(e) =>
                    setFormData({ ...formData, num_guests: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="res-notes" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  ملاحظات إضافية (اختياري)
                </Label>
                <Textarea
                  id="res-notes"
                  placeholder="أي طلبات خاصة أو ملاحظات..."
                  value={formData.customer_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_notes: e.target.value })
                  }
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CalendarDays className="h-4 w-4" />
                )}
                إرسال طلب الحجز
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
