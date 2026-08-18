import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Banner, BannerInput } from '@/types/banners';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';
import { uploadMediaToCloudinary } from '@/utils/cloudinary';

export const useBanners = (activeOnly = false) => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    // Cast supabase to any to bypass missing type definitions for 'banners' table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabaseAny
                .from('banners')
                .select(activeOnly
                    ? 'id, title, description, image_url, link, is_active, display_order'
                    : '*')
                .order('display_order', { ascending: true });

            if (activeOnly) {
                query = query.eq('is_active', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            const rows = (data as Banner[]) || [];
            setBanners(activeOnly ? rows : [...rows].sort(() => Math.random() - 0.5));
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('حدث خطأ أثناء تحميل البنرات');
        } finally {
            setLoading(false);
        }
    }, [supabaseAny, activeOnly]);

    const createBanner = async (banner: BannerInput, file: File) => {
        try {
            // Compress image before upload
            const compressedFile = await compressImage(file);

            const publicUrl = await uploadMediaToCloudinary(compressedFile);

            const { data, error } = await supabaseAny
                .from('banners')
                .insert([{ ...banner, image_url: publicUrl }])
                .select()
                .single();

            if (error) throw error;

            setBanners([...banners, data as Banner]);
            toast.success('تمت إضافة البنر بنجاح');
            return data;
        } catch (error) {
            console.error('Error creating banner:', error);
            toast.error('حدث خطأ أثناء إضافة البنر');
            throw error;
        }
    };

    const updateBanner = async (id: string, updates: Partial<BannerInput>, file?: File) => {
        try {
            let imageUrl = updates.image_url;

            if (file) {
                // Compress image before upload
                const compressedFile = await compressImage(file);

                const publicUrl = await uploadMediaToCloudinary(compressedFile);
                imageUrl = publicUrl;
            }

            const { data, error } = await supabaseAny
                .from('banners')
                .update({ ...updates, image_url: imageUrl, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setBanners(banners.map(b => b.id === id ? (data as Banner) : b));
            toast.success('تم تحديث البنر بنجاح');
        } catch (error) {
            console.error('Error updating banner:', error);
            toast.error('حدث خطأ أثناء تحديث البنر');
            throw error;
        }
    };

    const deleteBanner = async (id: string) => {
        try {
            const { error } = await supabaseAny
                .from('banners')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setBanners(banners.filter(b => b.id !== id));
            toast.success('تم حذف البنر بنجاح');
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('حدث خطأ أثناء حذف البنر');
        }
    };

    const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabaseAny
                .from('banners')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setBanners(banners.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b));
            toast.success('تم تحديث حالة البنر');
        } catch (error) {
            console.error('Error toggling banner status:', error);
            toast.error('حدث خطأ أثناء تحديث حالة البنر');
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    return {
        banners,
        loading,
        createBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        refreshBanners: fetchBanners
    };
};
