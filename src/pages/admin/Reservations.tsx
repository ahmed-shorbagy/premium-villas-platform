import { useState } from 'react';
import { useReservations, Reservation } from '@/hooks/useReservations';
import { useVillaOwnerWhatsApp } from '@/hooks/useReservations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CalendarDays,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Send,
  Loader2,
  Users,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  cancelled: 'ملغي',
  completed: 'مكتمل',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const pricingTypeLabels: Record<string, string> = {
  per_night: 'لليلة',
  per_stay: 'للإقامة',
};

const Reservations = () => {
  const {
    reservations,
    loading,
    updateReservationStatus,
    markWhatsAppNotified,
    deleteReservation,
  } = useReservations();
  const { ownerWhatsApp } = useVillaOwnerWhatsApp();

  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredReservations = reservations.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    total: reservations.length,
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ar-EG', {
      maximumFractionDigits: 0,
    }).format(price) + ' شيكل';

  const handleViewDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setAdminNotes(reservation.admin_notes || '');
    setDetailOpen(true);
  };

  /** Opens wa.me to CONTACT THE CUSTOMER directly (admin → customer) */
  const handleContactCustomer = (reservation: Reservation) => {
    const cleanPhone = reservation.customer_phone.replace(/\D/g, '');
    // Add country code if needed (assuming Israeli numbers)
    const fullPhone = cleanPhone.startsWith('972') ? cleanPhone : `972${cleanPhone.replace(/^0+/, '')}`;
    const message = `مرحباً ${reservation.customer_name},\nنحن من Shima AK بخصوص حجزك للفيلا "${reservation.property?.title}".\nتواريخ الإقامة: ${reservation.check_in} إلى ${reservation.check_out}.\nنودّ تأكيد الحجز معك.`;
    window.open(
      `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /** Opens wa.me to NOTIFY THE VILLA OWNER — NO customer phone! */
  const handleNotifyOwner = async (reservation: Reservation) => {
    const ownerNumber = (ownerWhatsApp || '').replace(/\D/g, '');
    if (!ownerNumber) {
      alert('يرجى تعيين رقم صاحبة الفلل في الإعدادات أولاً');
      return;
    }

    // CRITICAL: Message does NOT include customer_phone
    const message = `🏡 حجز جديد — Shima AK

الفيلا: ${reservation.property?.title || '—'}
الموقع: ${reservation.property?.location || '—'}

📅 تسجيل الدخول: ${reservation.check_in}
📅 تسجيل الخروج: ${reservation.check_out}
👤 اسم الضيف: ${reservation.customer_name}
👥 عدد الضيوف: ${reservation.num_guests}
💰 الإجمالي: ${formatPrice(reservation.total_price)}

📝 ملاحظات: ${reservation.customer_notes || 'لا توجد'}

⏳ بانتظار تأكيدك — الرجاء الرد بموافق أو رفض`;

    window.open(
      `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );

    await markWhatsAppNotified(reservation.id);
  };

  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    await updateReservationStatus(id, status, adminNotes || undefined);
    setDetailOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
    await deleteReservation(id);
    setDetailOpen(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">إدارة الحجوزات</h1>
        <p className="text-muted-foreground">متابعة وإدارة جميع طلبات الحجز</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الحجوزات
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد الانتظار
            </CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مؤكدة
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <Input
          placeholder="بحث باسم العميل أو الفيلا..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="confirmed">مؤكد</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">العميل</TableHead>
                <TableHead className="whitespace-nowrap">الفيلا</TableHead>
                <TableHead className="whitespace-nowrap">تسجيل الدخول</TableHead>
                <TableHead className="whitespace-nowrap">تسجيل الخروج</TableHead>
                <TableHead className="whitespace-nowrap">الإجمالي</TableHead>
                <TableHead className="whitespace-nowrap">الحالة</TableHead>
                <TableHead className="whitespace-nowrap">واتساب</TableHead>
                <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد حجوزات
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <p className="font-medium">{r.customer_name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {r.customer_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-w-[160px] truncate">
                      {r.property?.title || '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(r.check_in)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(r.check_out)}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatPrice(r.total_price)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[r.status]} border`}>
                        {statusLabels[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.whatsapp_notified ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          تم
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          <Clock className="h-3 w-3 mr-1" />
                          لم يُرسل
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="عرض التفاصيل"
                          onClick={() => handleViewDetail(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="إبلاغ صاحبة الفلل"
                          onClick={() => handleNotifyOwner(r)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="تواصل مع العميل"
                          onClick={() => handleContactCustomer(r)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل الحجز</DialogTitle>
            <DialogDescription className="text-right">
              معلومات كاملة عن طلب الحجز
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              {/* Villa info */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="font-medium text-foreground mb-1">
                  {selectedReservation.property?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedReservation.property?.location}
                </p>
              </div>

              {/* Customer info */}
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">اسم العميل:</span>
                  <span className="font-medium">{selectedReservation.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">هاتف العميل:</span>
                  <span className="font-medium" dir="ltr">
                    {selectedReservation.customer_phone}
                  </span>
                </div>
                {selectedReservation.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">البريد:</span>
                    <span className="font-medium" dir="ltr">
                      {selectedReservation.customer_email}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">عدد الضيوف:</span>
                  <span className="font-medium">{selectedReservation.num_guests}</span>
                </div>
              </div>

              {/* Dates & pricing */}
              <div className="grid gap-3 rounded-lg border border-border p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">تسجيل الدخول:</span>
                  <span className="font-medium">{formatDate(selectedReservation.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">تسجيل الخروج:</span>
                  <span className="font-medium">{formatDate(selectedReservation.check_out)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">نوع التسعير:</span>
                  <span className="font-medium">
                    {pricingTypeLabels[selectedReservation.pricing_type]}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-sm font-semibold">الإجمالي:</span>
                  <span className="font-bold text-gold">
                    {formatPrice(selectedReservation.total_price)}
                  </span>
                </div>
              </div>

              {/* Customer notes */}
              {selectedReservation.customer_notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات العميل:</p>
                  <p className="text-sm bg-muted/50 rounded p-2">
                    {selectedReservation.customer_notes}
                  </p>
                </div>
              )}

              {/* Admin notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes">ملاحظات الإدارة:</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظات خاصة بالإدارة..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            {selectedReservation?.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  onClick={() =>
                    handleStatusChange(selectedReservation.id, 'confirmed')
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تأكيد الحجز
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() =>
                    handleStatusChange(selectedReservation.id, 'cancelled')
                  }
                >
                  <XCircle className="h-4 w-4" />
                  إلغاء الحجز
                </Button>
              </>
            )}
            {selectedReservation?.status === 'confirmed' && (
              <Button
                variant="default"
                className="gap-2"
                onClick={() =>
                  handleStatusChange(selectedReservation.id, 'completed')
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                اكتمل
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-destructive gap-2"
              onClick={() => selectedReservation && handleDelete(selectedReservation.id)}
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
