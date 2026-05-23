import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useBanners } from '@/hooks/useBanners';
import { Banner } from '@/types/banners';
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    link: z.string().optional(),
    display_order: z.number().default(0),
    is_active: z.boolean().default(true),
});

const Banners = () => {
    const { banners, loading, createBanner, updateBanner, deleteBanner, toggleBannerStatus } = useBanners();
    const [isOpen, setIsOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            link: '',
            // Display order is handled by the backend default or ignored
            display_order: 0,
            is_active: true,
        },
    });

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        form.reset({
            title: banner.title || '',
            description: banner.description || '',
            link: banner.link || '',
            display_order: banner.display_order,
            is_active: banner.is_active,
        });
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingBanner(null);
        setSelectedImage(null);
        form.reset({
            title: '',
            description: '',
            link: '',
            display_order: 0,
            is_active: true,
        });
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (!editingBanner && !selectedImage) {
                toast.error('يرجى اختيار صورة للبنر');
                return;
            }

            setIsSubmitting(true);

            const bannerData = {
                title: values.title || null,
                description: values.description || null,
                link: values.link || null,
                display_order: 0,
                is_active: values.is_active,
                image_url: editingBanner?.image_url || '',
            };

            if (editingBanner) {
                await updateBanner(editingBanner.id, bannerData, selectedImage || undefined);
            } else {
                if (selectedImage) {
                    await createBanner(bannerData, selectedImage);
                }
            }

            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد أنك تريد حذف هذا البنر؟')) {
            await deleteBanner(id);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8 flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">إدارة البنرات</h1>
                    <p className="text-muted-foreground">تحكم في الصور والنصوص التي تظهر في الصفحة الرئيسية</p>
                </div>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة بنر جديد
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">الصورة</TableHead>
                                <TableHead className="whitespace-nowrap">العنوان</TableHead>
                                <TableHead className="whitespace-nowrap">الحالة</TableHead>
                                <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        جاري التحميل...
                                    </TableCell>
                                </TableRow>
                            ) : banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        لا توجد بنرات حالياً.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners.map((banner) => (
                                    <TableRow key={banner.id}>
                                        <TableCell>
                                            <div className="h-32 w-48 overflow-hidden rounded-md border border-border">
                                                <img
                                                    src={banner.image_url}
                                                    alt={banner.title || 'Banner'}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">{banner.title || '-'}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={banner.is_active}
                                                onCheckedChange={() => toggleBannerStatus(banner.id, banner.is_active)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(banner)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(banner.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingBanner ? 'تعديل البنر' : 'إضافة بنر جديد'}</DialogTitle>
                        <div className="text-sm text-muted-foreground">
                            {editingBanner ? 'تحديث بيانات البنر الحالي' : 'إضافة بنر جديد للصفحة الرئيسية'}
                        </div>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-center">
                                    <label className="cursor-pointer relative group overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors h-40 w-full flex items-center justify-center bg-muted/50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setSelectedImage(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {selectedImage ? (
                                            <img
                                                src={URL.createObjectURL(selectedImage)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : editingBanner?.image_url ? (
                                            <img
                                                src={editingBanner.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <ImageIcon className="h-8 w-8 mb-2" />
                                                <span className="text-sm">اضغط لاختيار صورة</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium">تغيير الصورة</span>
                                        </div>
                                    </label>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>العنوان (اختياري)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="عنوان البنر" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوصف (اختياري)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="وصف قصير" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>رابط (اختياري)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-4">
                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-end pb-2">
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="!mt-0">نشط</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingBanner ? 'حفظ التعديلات' : 'إضافة البنر'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Banners;
