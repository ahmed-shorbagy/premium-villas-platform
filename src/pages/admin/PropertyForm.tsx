import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowRight, Plus, Settings } from 'lucide-react';
import { buildLocalizedPath } from '@/routes';
import { featureLabels } from '@/data/properties';
import { platformScope } from '@/config/platform';
import { groupTypes } from '@/config/filters';
import AvailabilityManager from '@/components/admin/AvailabilityManager';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PropertyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(!!id);
    const [uploading, setUploading] = useState(false);
    const [customFeature, setCustomFeature] = useState('');

    // Initialize form data from localStorage if new property, or defaults
    const [formData, setFormData] = useState(() => {
        if (!id) {
            const saved = localStorage.getItem('property-form-draft');
            if (saved) return JSON.parse(saved);
        }
        return {
            title: '',
            type: platformScope.propertyType,
            price: '',
            price_weekend: '',
            rent_count: '0',
            max_guests: '12',
            location: '',
            bedrooms: '',
            bathrooms: '',
            description: '',
            listing_type: platformScope.listingType,
            featured: false,
            group_type: 'family',
            images: [] as string[],
            features: [] as string[],
            pricing_type: 'per_night' as 'per_night' | 'per_stay',
            installments_available: false,
            installment_period: '',
            installment_value: '',
            available_from: '',
            available_to: '',
            is_negotiable: false,
        };
    });

    // Save draft to localStorage whenever formData changes (only for new property)
    useEffect(() => {
        if (!id) {
            localStorage.setItem('property-form-draft', JSON.stringify(formData));
        }
    }, [formData, id]);

    useEffect(() => {
        if (id) {
            const fetchProperty = async () => {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    toast({
                        title: 'خطأ',
                        description: 'فشل تحميل بيانات الفيلا',
                        variant: 'destructive',
                    });
                    navigate(buildLocalizedPath.adminListings());
                } else if (data) {
                    setFormData({
                        title: data.title,
                        type: platformScope.propertyType,
                        price: data.price.toString(),
                        price_weekend: (data as any).price_weekend ? (data as any).price_weekend.toString() : '',
                        rent_count: (data as any).rent_count ? (data as any).rent_count.toString() : '0',
                        max_guests: (data as any).max_guests ? (data as any).max_guests.toString() : '12',
                        location: data.location,
                        bedrooms: data.bedrooms.toString(),
                        bathrooms: data.bathrooms.toString(),
                        description: data.description || '',
                        listing_type: platformScope.listingType,
                        featured: data.featured,
                        group_type: (data as { group_type?: string }).group_type || 'family',
                        images: data.images || [],
                        features: data.features || [],
                        pricing_type: (data as any).pricing_type || 'per_night',
                        installments_available: (data as any).installments_available || false,
                        installment_period: (data as any).installment_period || '',
                        installment_value: (data as any).installment_value ? (data as any).installment_value.toString() : '',
                        is_negotiable: (data as any).is_negotiable || false,
                    });
                }
                setLoading(false);
            };

            fetchProperty();
        }
    }, [id, navigate, toast]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(fileName, file);

            if (!uploadError) {
                const { data } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(fileName);
                uploadedUrls.push(data.publicUrl);
            }
        }

        setFormData((prev: any) => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls],
        }));
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true); // Re-use uploading state for general submission loading

        const propertyData = {
            title: formData.title,
            type: platformScope.propertyType,
            price: parseFloat(formData.price),
            price_weekend: formData.price_weekend ? parseFloat(formData.price_weekend) : null,
            rent_count: parseInt(formData.rent_count) || 0,
            max_guests: parseInt(formData.max_guests) || 12,
            location: formData.location,
            area: '',
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            area_size: 0,
            description: formData.description,
            listing_type: platformScope.listingType,
            featured: formData.featured,
            group_type: formData.group_type,
            images: formData.images,
            features: formData.features,
            pricing_type: formData.pricing_type,
            installments_available: false,
            installment_period: null,
            installment_value: null,
            is_negotiable: formData.is_negotiable,
        };

        let error;

        if (id) {
            const { error: updateError } = await supabase
                .from('properties')
                .update(propertyData)
                .eq('id', id);
            error = updateError;
        } else {
            const { data: insertData, error: insertError } = await supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();
            error = insertError;

            if (!insertError && insertData && formData.available_from && formData.available_to) {
                await supabase.from('villa_availability').insert({
                    property_id: insertData.id,
                    available_from: formData.available_from,
                    available_to: formData.available_to
                });
            }
        }

        setUploading(false);

        if (error) {
            toast({
                title: 'خطأ',
                description: id ? 'فشل تحديث بيانات الفيلا' : 'فشل إنشاء فيلا جديدة',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'تم بنجاح',
                description: id ? 'تم تحديث الفيلا بنجاح' : 'تم إضافة الفيلا بنجاح',
            });
            // Clear draft
            if (!id) localStorage.removeItem('property-form-draft');
            navigate(buildLocalizedPath.adminListings());
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(buildLocalizedPath.adminListings())}>
                    <ArrowRight className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">
                        {id ? 'تعديل الفيلا' : 'إضافة فيلا للإيجار'}
                    </h1>
                    <p className="text-muted-foreground">
                        {id ? 'تعديل بيانات الفيلا الحالية' : 'أدخل بيانات فيلا جديدة — إيجار'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="title">عنوان الفيلا</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="مثال: فيلا فاخرة مع مسبح خاص"
                    />
                    <p className="text-xs text-muted-foreground">نوع الإعلان: فيلا — إيجار</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="price">السعر لوسط الأسبوع (السبت - الأربعاء)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            min="0"
                            placeholder="شيكل / ليلة"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price_weekend">السعر لنهاية الأسبوع (الخميس - الجمعة)</Label>
                        <Input
                            id="price_weekend"
                            type="number"
                            value={formData.price_weekend}
                            onChange={(e) => setFormData({ ...formData, price_weekend: e.target.value })}
                            min="0"
                            placeholder="سعر وسط الأسبوع كافتراضي"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pricing_type">نوع التسعير</Label>
                        <Select
                            value={formData.pricing_type}
                            onValueChange={(value: 'per_night' | 'per_stay') => setFormData({ ...formData, pricing_type: value })}
                        >
                            <SelectTrigger id="pricing_type">
                                <SelectValue placeholder="اختر نوع التسعير" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="per_night">لليلة الواحدة</SelectItem>
                                <SelectItem value="per_stay">للإقامة الكاملة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="group_type">نوع الإيجار</Label>
                    <Select
                        value={formData.group_type}
                        onValueChange={(value) => setFormData({ ...formData, group_type: value })}
                    >
                        <SelectTrigger id="group_type">
                            <SelectValue placeholder="اختر نوع الإيجار" />
                        </SelectTrigger>
                        <SelectContent>
                            {groupTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.labelAr}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">الموقع</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="مثال: الرياض، حي العليا"
                    />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="bedrooms">عدد غرف النوم</Label>
                        <Input
                            id="bedrooms"
                            type="number"
                            value={formData.bedrooms}
                            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bathrooms">عدد الحمامات</Label>
                        <Input
                            id="bathrooms"
                            type="number"
                            value={formData.bathrooms}
                            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rent_count">عدد مرات الحجز السابقة</Label>
                        <Input
                            id="rent_count"
                            type="number"
                            value={formData.rent_count}
                            onChange={(e) => setFormData({ ...formData, rent_count: e.target.value })}
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="max_guests">الحد الأقصى لعدد الأفراد</Label>
                        <Input
                            id="max_guests"
                            type="number"
                            value={formData.max_guests}
                            onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                            min="1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">وصف الفيلا</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={6}
                        placeholder="اكتب وصفاً مفصلاً للفيلا..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="images">صور الفيلا</Label>
                    <div className="flex flex-col gap-4">
                        <Input
                            id="images"
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="cursor-pointer"
                        />
                        {formData.images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {formData.images.map((url, idx) => {
                                    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
                                    return (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                            {isVideo ? (
                                                <video
                                                    src={url}
                                                    className="h-full w-full object-cover"
                                                    controls
                                                    playsInline
                                                />
                                            ) : (
                                                <img
                                                    src={url}
                                                    alt={`Property ${idx + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() =>
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        images: prev.images.filter((_: any, i: number) => i !== idx),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                                لا توجد صور مختارة
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>المميزات والمرافق</Label>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="sm" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    إدارة المميزات
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>إدارة المميزات والمرافق</DialogTitle>
                                </DialogHeader>
                                
                                {/* Custom Feature Input */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Input
                                        placeholder="إضافة ميزة مخصصة (مثال: ملعب بادل)"
                                        value={customFeature}
                                        onChange={(e) => setCustomFeature(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        features: [...prev.features, customFeature.trim()]
                                                    }));
                                                    setCustomFeature('');
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
                                                setFormData((prev: any) => ({
                                                    ...prev,
                                                    features: [...prev.features, customFeature.trim()]
                                                }));
                                                setCustomFeature('');
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4 ml-2" />
                                        إضافة
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                                    {/* Standard Features */}
                                    {Object.entries(featureLabels).map(([key, label]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`feature-${key}`}
                                                checked={formData.features.includes(key)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        features: checked
                                                            ? [...prev.features, key]
                                                            : prev.features.filter((f: string) => f !== key),
                                                    }));
                                                }}
                                                className="h-4 w-4 accent-primary rounded border-primary focus:ring-primary"
                                            />
                                            <Label htmlFor={`feature-${key}`} className="cursor-pointer text-sm font-normal">
                                                {label}
                                            </Label>
                                        </div>
                                    ))}
                                    
                                    {/* Custom added features */}
                                    {formData.features.filter((f: string) => !featureLabels[f]).map((customKey: string) => (
                                        <div key={customKey} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`feature-${customKey}`}
                                                checked={true}
                                                onChange={() => {
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        features: prev.features.filter((f: string) => f !== customKey),
                                                    }));
                                                }}
                                                className="h-4 w-4 accent-primary rounded border-primary focus:ring-primary"
                                            />
                                            <Label htmlFor={`feature-${customKey}`} className="cursor-pointer text-sm font-normal text-primary">
                                                {customKey}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-border min-h-[60px]">
                        {formData.features.length > 0 ? (
                            formData.features.map((f: string) => (
                                <span key={f} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {featureLabels[f] || f}
                                </span>
                            ))
                        ) : (
                            <span className="text-sm text-muted-foreground">لم يتم تحديد مميزات</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-4 w-4 accent-primary"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">تمييز هذه الفيلا (تظهر في الصفحة الرئيسية)</Label>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                    <input
                        type="checkbox"
                        id="is_negotiable"
                        checked={formData.is_negotiable}
                        onChange={(e) => setFormData({ ...formData, is_negotiable: e.target.checked })}
                        className="h-4 w-4 accent-primary"
                    />
                    <Label htmlFor="is_negotiable" className="cursor-pointer">السعر قابل للتفاوض</Label>
                </div>

                {!id && (
                    <div className="pt-6 border-t border-border space-y-4">
                        <h3 className="font-semibold text-lg">تواريخ التوفر المبدئية (مطلوب)</h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="available_from">متاح من تاريخ</Label>
                                <Input
                                    id="available_from"
                                    type="date"
                                    value={formData.available_from}
                                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="available_to">متاح إلى تاريخ</Label>
                                <Input
                                    id="available_to"
                                    type="date"
                                    value={formData.available_to}
                                    onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                                    required
                                    min={formData.available_from}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(buildLocalizedPath.adminListings())}
                    >
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? 'جاري الحفظ...' : (id ? 'تحديث الفيلا' : 'حفظ الفيلا')}
                    </Button>
                </div>
            </form>

            {/* Availability Manager — only for existing properties */}
            {id && (
                <div className="mt-8">
                    <AvailabilityManager propertyId={id} />
                </div>
            )}
        </div>
    );
};

export default PropertyForm;
