import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useListingRequests } from '@/hooks/useListingRequests';
import { ListingRequest } from '@/types/listingRequest';
import { formatPrice } from '@/data/properties';
import {
    Eye,
    Check,
    X,
    Trash2,
    Loader2,
    Phone,
    Mail,
    MapPin,
    User,
    Home,
    Calendar,
    Clock
} from 'lucide-react';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'قيد المراجعة', variant: 'secondary' },
    approved: { label: 'مقبول', variant: 'default' },
    declined: { label: 'مرفوض', variant: 'destructive' },
};

const typeLabels: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    commercial: 'تجاري',
    land: 'أرض',
    office: 'مكتب',
};

const ListingRequests = () => {
    const { requests, loading, approveAndCreateProperty, updateRequestStatus, deleteRequest } = useListingRequests();
    const [selectedRequest, setSelectedRequest] = useState<ListingRequest | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [declineNotes, setDeclineNotes] = useState('');
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const handleApprove = async (request: ListingRequest) => {
        setIsProcessing(true);
        await approveAndCreateProperty(request);
        setIsProcessing(false);
        setIsViewOpen(false);
    };

    const handleDecline = async () => {
        if (!selectedRequest) return;
        setIsProcessing(true);
        await updateRequestStatus(selectedRequest.id, 'declined', declineNotes);
        setIsProcessing(false);
        setShowDeclineDialog(false);
        setIsViewOpen(false);
        setDeclineNotes('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            await deleteRequest(id);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8 flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">طلبات الإعلانات</h1>
                    <p className="text-muted-foreground">إدارة طلبات إعلانات العقارات من المستخدمين</p>
                </div>
                {pendingCount > 0 && (
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        {pendingCount} طلب جديد
                    </Badge>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{requests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">قيد المراجعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">تم القبول</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {requests.filter(r => r.status === 'approved').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">العقار</TableHead>
                                <TableHead className="whitespace-nowrap">مقدم الطلب</TableHead>
                                <TableHead className="whitespace-nowrap">السعر</TableHead>
                                <TableHead className="whitespace-nowrap">التاريخ</TableHead>
                                <TableHead className="whitespace-nowrap">الحالة</TableHead>
                                <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد طلبات حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="min-w-[200px]">
                                            <div>
                                                <div className="font-medium line-clamp-1">{request.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {typeLabels[request.type] || request.type} • {request.location}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-[150px]">
                                            <div>
                                                <div className="font-medium">{request.contact_name}</div>
                                                <div className="text-sm text-muted-foreground" dir="ltr">
                                                    {request.contact_phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-gold whitespace-nowrap">
                                            {formatPrice(request.price)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {formatDate(request.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusLabels[request.status]?.variant || 'secondary'}>
                                                {statusLabels[request.status]?.label || request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setSelectedRequest(request); setIsViewOpen(true); }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(request.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
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

            {/* View Request Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب</DialogTitle>
                        <DialogDescription>معاينة طلب الإعلان والتواصل مع صاحبه</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant={statusLabels[selectedRequest.status]?.variant || 'secondary'}
                                    className="text-sm px-3 py-1"
                                >
                                    {statusLabels[selectedRequest.status]?.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(selectedRequest.created_at)}
                                </span>
                            </div>

                            {/* Property Images */}
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {selectedRequest.images.slice(0, 6).map((img, i) => {
                                        const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(img);
                                        return isVideo ? (
                                            <video
                                                key={i}
                                                src={img}
                                                className="aspect-video object-cover rounded-lg"
                                                controls
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                key={i}
                                                src={img}
                                                alt={`Image ${i + 1}`}
                                                className="aspect-video object-cover rounded-lg"
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Property Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="w-5 h-5 text-gold" />
                                        تفاصيل العقار
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedRequest.title}</h3>
                                        <p className="text-muted-foreground">{selectedRequest.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground">النوع</span>
                                            <p className="font-medium">{typeLabels[selectedRequest.type] || selectedRequest.type}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">نوع الإعلان</span>
                                            <p className="font-medium">{selectedRequest.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">السعر</span>
                                            <p className="font-bold text-gold">{formatPrice(selectedRequest.price)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">الموقع</span>
                                            <p className="font-medium">{selectedRequest.location}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">غرف النوم</span>
                                            <p className="font-medium">{selectedRequest.bedrooms}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">الحمامات</span>
                                            <p className="font-medium">{selectedRequest.bathrooms}</p>
                                        </div>
                                    </div>

                                    {selectedRequest.features && selectedRequest.features.length > 0 && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">المميزات</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedRequest.features.map((f, i) => (
                                                    <Badge key={i} variant="outline">{f}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Contact Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gold" />
                                        بيانات التواصل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <span className="text-sm text-muted-foreground">الاسم</span>
                                                <p className="font-medium">{selectedRequest.contact_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <span className="text-sm text-muted-foreground">الهاتف</span>
                                                <p className="font-medium" dir="ltr">{selectedRequest.contact_phone}</p>
                                            </div>
                                        </div>
                                        {selectedRequest.contact_email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <span className="text-sm text-muted-foreground">البريد</span>
                                                    <p className="font-medium" dir="ltr">{selectedRequest.contact_email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedRequest.contact_location && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <span className="text-sm text-muted-foreground">الموقع</span>
                                                    <p className="font-medium">{selectedRequest.contact_location}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Admin Notes */}
                            {selectedRequest.admin_notes && (
                                <Card className="border-amber-200 bg-amber-50">
                                    <CardContent className="py-4">
                                        <p className="text-amber-800">
                                            <strong>ملاحظات:</strong> {selectedRequest.admin_notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            {selectedRequest.status === 'pending' && (
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="default"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(selectedRequest)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                        ) : (
                                            <Check className="w-4 h-4 ml-2" />
                                        )}
                                        قبول ونشر العقار
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => setShowDeclineDialog(true)}
                                        disabled={isProcessing}
                                    >
                                        <X className="w-4 h-4 ml-2" />
                                        رفض الطلب
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Decline Dialog */}
            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>رفض الطلب</DialogTitle>
                        <DialogDescription>أدخل سبب الرفض (اختياري)</DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="سبب الرفض..."
                        value={declineNotes}
                        onChange={(e) => setDeclineNotes(e.target.value)}
                        rows={3}
                    />
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDecline}
                            disabled={isProcessing}
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                            تأكيد الرفض
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ListingRequests;
