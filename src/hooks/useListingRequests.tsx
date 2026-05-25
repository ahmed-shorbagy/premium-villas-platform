import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ListingRequest, ListingRequestInput, ListingRequestStatus } from '@/types/listingRequest';
import { toast } from 'sonner';

export const useListingRequests = () => {
    const [requests, setRequests] = useState<ListingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabaseAny
                .from('listing_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data as ListingRequest[]);
        } catch (error) {
            console.error('Error fetching listing requests:', error);
            toast.error('حدث خطأ أثناء تحميل طلبات الإعلانات');
        } finally {
            setLoading(false);
        }
    }, [supabaseAny]);

    const createRequest = async (request: ListingRequestInput, files: File[]) => {
        try {
            // Upload images
            const imageUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `listing-requests/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('properties')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('properties')
                    .getPublicUrl(filePath);

                imageUrls.push(publicUrl);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any).rpc('create_listing_request', {
                p_title: request.title,
                p_description: request.description,
                p_type: request.type,
                p_listing_type: request.listing_type,
                p_price: request.price,
                p_location: request.location,
                p_area: '',
                p_area_size: 0,
                p_bedrooms: request.bedrooms,
                p_bathrooms: request.bathrooms,
                p_features: request.features,
                p_images: imageUrls.length > 0 ? imageUrls : [],
                p_contact_name: request.contact_name,
                p_contact_phone: request.contact_phone,
                p_contact_email: request.contact_email,
                p_contact_location: request.contact_location,
                p_installments_available: request.installments_available || false,
                p_installment_period: request.installment_period,
                p_installment_value: request.installment_value
            });

            if (error) throw error;

            toast.success('تم إرسال طلبك بنجاح! سيتواصل معك المسؤول قريباً');
            return data;
        } catch (error) {
            console.error('Error creating listing request:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            toast.error(`Debug: ${errorMessage}`);
            throw error;
        }
    };

    const updateRequestStatus = async (id: string, status: ListingRequestStatus, adminNotes?: string) => {
        try {
            const { error } = await supabaseAny
                .from('listing_requests')
                .update({
                    status,
                    admin_notes: adminNotes || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setRequests(requests.map(r => r.id === id ? { ...r, status, admin_notes: adminNotes || null } : r));
            toast.success(status === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب');
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error('حدث خطأ أثناء تحديث حالة الطلب');
        }
    };

    const approveAndCreateProperty = async (request: ListingRequest) => {
        try {
            // Create the property
            const { error: propertyError } = await supabaseAny
                .from('properties')
                .insert([{
                    title: request.title,
                    description: request.description,
                    type: request.type,
                    listing_type: request.listing_type,
                    price: request.price,
                    location: request.location,
                    area: '',
                    area_size: 0,
                    bedrooms: request.bedrooms,
                    bathrooms: request.bathrooms,
                    features: request.features,
                    images: request.images || [],
                    featured: false,
                    contact_name: request.contact_name,
                    contact_phone: request.contact_phone,
                    contact_email: request.contact_email,
                    contact_location: request.contact_location,
                    installments_available: request.installments_available,
                    installment_period: request.installment_period,
                    installment_value: request.installment_value
                }]);

            if (propertyError) throw propertyError;

            // Update request status
            await updateRequestStatus(request.id, 'approved', 'تم نشر العقار بنجاح');

            toast.success('تم قبول الطلب ونشر العقار بنجاح');
        } catch (error) {
            console.error('Error approving request:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            toast.error(`حدث خطأ أثناء نشر العقار: ${errorMessage}`);
        }
    };

    const deleteRequest = async (id: string) => {
        try {
            const { error } = await supabaseAny
                .from('listing_requests')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRequests(requests.filter(r => r.id !== id));
            toast.success('تم حذف الطلب');
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('حدث خطأ أثناء حذف الطلب');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        createRequest,
        updateRequestStatus,
        approveAndCreateProperty,
        deleteRequest,
        refreshRequests: fetchRequests
    };
};
