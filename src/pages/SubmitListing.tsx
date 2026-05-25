import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useListingRequests } from '@/hooks/useListingRequests';
import { buildLocalizedPath } from '@/routes';
import { Upload, X, Loader2, CheckCircle, Phone, User, MapPin, Home, DollarSign, Info } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Basic Arab world phone number validation (at least 8 digits)
const phoneRegex = /^[0-9+ ]{8,20}$/;

const formSchema = z.object({
    // Property Details
    title: z.string()
        .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
        .max(100, 'العنوان يجب ألا يتجاوز 100 حرف'),
    description: z.string().max(2000, 'الوصف يجب ألا يتجاوز 2000 حرف').optional(),
    type: z.string().min(1, 'يرجى اختيار نوع العقار'),
    listing_type: z.enum(['sale', 'rent'], {
        required_error: 'يرجى اختيار نوع الإعلان',
        invalid_type_error: 'يرجى اختيار نوع الإعلان'
    }),
    price: z.string()
        .min(1, 'يرجى إدخال السعر')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'السعر يجب أن يكون رقماً موجباً')
        .transform(v => Number(v)),
    location: z.string()
        .min(3, 'الموقع يجب أن يكون 3 أحرف على الأقل')
        .max(100, 'الموقع يجب ألا يتجاوز 100 حرف'),
    bedrooms: z.string().transform(v => Number(v)),
    bathrooms: z.string().transform(v => Number(v)),
    features: z.string().max(500, 'المميزات يجب ألا تتجاوز 500 حرف').optional(),
    // Installments
    installments_available: z.boolean().default(false),
    installment_period: z.string().optional(),
    installment_value: z.string().optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), 'قيمة القسط يجب أن تكون رقماً')
        .transform(v => v ? Number(v) : undefined),
    // Contact Info
    contact_name: z.string()
        .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
        .max(50, 'الاسم يجب ألا يتجاوز 50 حرف')
        .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'الاسم يجب أن يحتوي على حروف فقط'),
    contact_phone: z.string()
        .min(1, 'يرجى إدخال رقم الهاتف')
        .regex(phoneRegex, 'رقم الهاتف غير صحيح'),
    contact_email: z.string()
        .email('البريد الإلكتروني غير صحيح')
        .optional()
        .or(z.literal('')),
    contact_location: z.string().max(100, 'الموقع يجب ألا يتجاوز 100 حرف').optional(),
});

type FormData = z.infer<typeof formSchema>;

const SubmitListing = () => {
    const navigate = useNavigate();
    const { createRequest } = useListingRequests();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            type: '',
            listing_type: undefined as 'sale' | 'rent' | undefined,
            price: '',
            location: '',
            bedrooms: '0',
            bathrooms: '1',
            features: '',
            installments_available: false,
            installment_period: '',
            installment_value: '',
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            contact_location: '',
        },
    });

    const installmentsAvailable = form.watch('installments_available');

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 10) {
            alert('يمكنك إضافة 10 صور كحد أقصى');
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (values: any) => {
        try {
            setIsSubmitting(true);

            const requestData = {
                title: values.title,
                description: values.description || null,
                type: values.type,
                listing_type: values.listing_type,
                price: values.price as number,
                location: values.location,
                bedrooms: values.bedrooms as number,
                bathrooms: values.bathrooms as number,
                features: values.features ? values.features.split(',').map(f => f.trim()) : null,
                installments_available: values.installments_available,
                installment_period: values.installments_available ? values.installment_period : null,
                installment_value: values.installments_available ? values.installment_value : null,
                contact_name: values.contact_name,
                contact_phone: values.contact_phone.replace(/\s/g, ''),
                contact_email: values.contact_email || null,
                contact_location: values.contact_location || null,
            };

            await createRequest(requestData, selectedImages);
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-20">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardContent className="py-16">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                                تم إرسال طلبك بنجاح!
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                شكراً لتقديم إعلانك. سيقوم فريقنا بمراجعة طلبك والتواصل معك قريباً.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div className="text-start">
                                        <p className="font-semibold text-amber-800 mb-1">ملاحظة هامة</p>
                                        <p className="text-amber-700 text-sm">
                                            سيتواصل معك أحد ممثلينا لتأكيد البيانات قبل نشر الإعلان على الموقع مجاناً.
                                            يرجى التأكد من صحة رقم الهاتف المُدخل.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => navigate(buildLocalizedPath.home())} variant="gold">
                                العودة للصفحة الرئيسية
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <Badge variant="outline" className="mb-4">أضف إعلانك</Badge>
                        <h1 className="text-4xl font-display font-bold text-foreground mb-4">
                            أعلن عن عقارك
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            أضف تفاصيل عقارك وسنتواصل معك لإتمام عملية النشر
                        </p>
                    </div>

                    {/* Important Notice */}
                    <Card className="mb-8 border-amber-200 bg-amber-50/50">
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-800 mb-1">كيف يتم نشر إعلانك؟</p>
                                    <ul className="text-amber-700 text-sm space-y-1">
                                        <li>1. أكمل النموذج أدناه بمعلومات العقار وبياناتك</li>
                                        <li>2. سيراجع فريقنا طلبك ويتواصل معك</li>
                                        <li>3. سيتم نشر إعلانك على الموقع مجاناً</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Property Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="w-5 h-5 text-gold" />
                                        تفاصيل العقار
                                    </CardTitle>
                                    <CardDescription>أدخل معلومات العقار الذي ترغب في الإعلان عنه</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>عنوان الإعلان *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="مثال: شقة فاخرة للبيع في دبي" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>نوع العقار *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="اختر نوع العقار" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="apartment">شقة</SelectItem>
                                                            <SelectItem value="villa">فيلا</SelectItem>
                                                            <SelectItem value="commercial">تجاري</SelectItem>
                                                            <SelectItem value="land">أرض</SelectItem>
                                                            <SelectItem value="office">مكتب</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="listing_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>نوع الإعلان *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="بيع أم إيجار" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="sale">للبيع</SelectItem>
                                                            <SelectItem value="rent">للإيجار</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>السعر *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Installments Section */}
                                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="installments_available"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>متاح للتقسيط</FormLabel>
                                                        <CardDescription>
                                                            فعل هذا الخيار إذا كان العقار متاحاً بنظام التقسيط
                                                        </CardDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            dir="ltr"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {installmentsAvailable && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                <FormField
                                                    control={form.control}
                                                    name="installment_period"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>مدة التقسيط</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="مثال: 12 شهر، 3 سنوات" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="installment_value"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>قيمة القسط (اختياري)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="0" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>الموقع *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="مثال: حي العليا، الرياض" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="bedrooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>غرف النوم</FormLabel>
                                                    <Select onValueChange={field.onChange} value={String(field.value)}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="bathrooms"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>الحمامات</FormLabel>
                                                    <Select onValueChange={field.onChange} value={String(field.value)}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>الوصف</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="أضف وصفاً تفصيلياً للعقار..."
                                                        rows={4}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="features"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>المميزات</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="مثال: مصعد، حديقة، موقف سيارات (افصل بين كل ميزة بفاصلة)"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Image Upload */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">صور العقار</label>
                                        <div
                                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-gold transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,video/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageSelect}
                                            />
                                            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                            <p className="text-muted-foreground">اضغط لإضافة صور (حتى 10 صور)</p>
                                        </div>

                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                                                {imagePreviews.map((preview, index) => {
                                                    const isVideo = preview.startsWith('data:video/');
                                                    return (
                                                        <div key={index} className="relative aspect-square">
                                                            {isVideo ? (
                                                                <video
                                                                    src={preview}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                    controls
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={preview}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-gold" />
                                        بيانات التواصل
                                    </CardTitle>
                                    <CardDescription>أدخل بياناتك ليتمكن فريقنا من التواصل معك</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contact_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>الاسم *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="الاسم الكامل" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contact_phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>رقم الهاتف *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="tel"
                                                            placeholder="01xxxxxxxxx"
                                                            dir="ltr"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contact_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>البريد الإلكتروني</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="example@email.com"
                                                            dir="ltr"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contact_location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>موقعك</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="المدينة أو المنطقة" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    variant="gold"
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[200px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        'إرسال الطلب'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SubmitListing;
