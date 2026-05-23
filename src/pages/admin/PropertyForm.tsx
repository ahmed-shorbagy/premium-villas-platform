import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowRight } from 'lucide-react';
import { buildLocalizedPath } from '@/routes';
import { featureLabels } from '@/data/properties';

const propertyTypes = ['apartment', 'villa', 'commercial', 'duplex', 'office', 'land'];

const PropertyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(!!id);
    const [uploading, setUploading] = useState(false);

    // Initialize form data from localStorage if new property, or defaults
    const [formData, setFormData] = useState(() => {
        if (!id) {
            const saved = localStorage.getItem('property-form-draft');
            if (saved) return JSON.parse(saved);
        }
        return {
            title: '',
            type: 'apartment',
            price: '',
            location: '',
            area: '',
            bedrooms: '',
            bathrooms: '',
            area_size: '',
            description: '',
            listing_type: 'sale',
            featured: false,
            images: [] as string[],
            features: [] as string[],
            installments_available: false,
            installment_period: '',
            installment_value: '',
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
                        description: 'فشل تحميل بيانات العقار',
                        variant: 'destructive',
                    });
                    navigate(buildLocalizedPath.adminListings());
                } else if (data) {
                    setFormData({
                        title: data.title,
                        type: data.type,
                        price: data.price.toString(),
                        location: data.location,
                        area: data.area,
                        bedrooms: data.bedrooms.toString(),
                        bathrooms: data.bathrooms.toString(),
                        area_size: data.area_size.toString(),
                        description: data.description || '',
                        listing_type: (data as any).listing_type || 'sale',
                        featured: data.featured,
                        images: data.images || [],
                        features: data.features || [],
                        installments_available: (data as any).installments_available || false,
                        installment_period: (data as any).installment_period || '',
                        installment_value: (data as any).installment_value ? (data as any).installment_value.toString() : '',
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
            type: formData.type,
            price: parseFloat(formData.price),
            location: formData.location,
            area: formData.area,
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            area_size: parseFloat(formData.area_size),
            description: formData.description,
            listing_type: formData.listing_type,
            featured: formData.featured,
            images: formData.images,
            features: formData.features,
            installments_available: formData.installments_available,
            installment_period: formData.installments_available ? formData.installment_period : null,
            installment_value: formData.installments_available && formData.installment_value ? parseFloat(formData.installment_value) : null,
        };

        let error;

        if (id) {
            const { error: updateError } = await supabase
                .from('properties')
                .update(propertyData)
                .eq('id', id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('properties').insert([propertyData]);
            error = insertError;
        }

        setUploading(false);

        if (error) {
            toast({
                title: 'خطأ',
                description: id ? 'فشل تحديث بيانات العقار' : 'فشل إنشاء عقار جديد',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'تم بنجاح',
                description: id ? 'تم تحديث بيانات العقار بنجاح' : 'تم إضافة العقار بنجاح',
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
                        {id ? 'تعديل العقار' : 'إضافة عقار جديد'}
                    </h1>
                    <p className="text-muted-foreground">
                        {id ? 'تعديل بيانات العقار الحالي' : 'أدخل بيانات العقار الجديد'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">عنوان العقار</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="مثال: شقة فاخرة في المعادي"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">نوع العقار</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {propertyTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type === 'apartment' ? 'شقة' :
                                            type === 'villa' ? 'فيلا' :
                                                type === 'commercial' ? 'تجاري' :
                                                    type === 'duplex' ? 'دوبلكس' :
                                                        type === 'office' ? 'مكتب' :
                                                            type === 'land' ? 'أرض' : type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="listing_type">نوع العرض</Label>
                        <Select
                            value={formData.listing_type}
                            onValueChange={(value) => setFormData({ ...formData, listing_type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sale">بيع (تمليك)</SelectItem>
                                <SelectItem value="rent">إيجار</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="price">السعر</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            min="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="area_size">المساحة (م²)</Label>
                        <Input
                            id="area_size"
                            type="number"
                            value={formData.area_size}
                            onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                        <div className="space-y-0.5">
                            <Label htmlFor="installments_available" className="text-base">متاح للتقسيط</Label>
                            <p className="text-sm text-muted-foreground">
                                فعل هذا الخيار إذا كان العقار متاحاً بنظام التقسيط
                            </p>
                        </div>
                        <Switch
                            id="installments_available"
                            checked={formData.installments_available}
                            onCheckedChange={(checked) => setFormData({ ...formData, installments_available: checked })}
                            dir="ltr"
                        />
                    </div>

                    {formData.installments_available && (
                        <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label htmlFor="installment_period">مدة التقسيط</Label>
                                <Input
                                    id="installment_period"
                                    value={formData.installment_period}
                                    onChange={(e) => setFormData({ ...formData, installment_period: e.target.value })}
                                    placeholder="مثال: 12 شهر، 3 سنوات"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="installment_value">قيمة القسط (اختياري)</Label>
                                <Input
                                    id="installment_value"
                                    type="number"
                                    value={formData.installment_value}
                                    onChange={(e) => setFormData({ ...formData, installment_value: e.target.value })}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
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
                    <div className="space-y-2">
                        <Label htmlFor="area">المنطقة</Label>
                        <Input
                            id="area"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            required
                            placeholder="مثال: دبي"
                        />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">وصف العقار</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={6}
                        placeholder="اكتب وصفاً مفصلاً للعقار..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="images">صور العقار</Label>
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
                    <Label>المميزات والمرافق</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
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
                    <Label htmlFor="featured" className="cursor-pointer">تمييز هذا العقار (يظهر في الصفحة الرئيسية)</Label>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(buildLocalizedPath.adminListings())}
                    >
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? 'جاري الحفظ...' : (id ? 'تحديث البيانات' : 'حفظ العقار')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;
