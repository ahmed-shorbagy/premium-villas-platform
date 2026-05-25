import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reservation {
  id: string;
  property_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_notes: string | null;
  check_in: string;
  check_out: string;
  num_guests: number;
  pricing_type: 'per_night' | 'per_stay';
  price_per_night: number | null;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  admin_notes: string | null;
  whatsapp_notified: boolean;
  whatsapp_notified_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined property data
  property?: {
    title: string;
    location: string;
    price: number;
    images: string[] | null;
  };
}

export interface AvailabilityPeriod {
  id: string;
  property_id: string;
  available_from: string;
  available_to: string;
  price_override: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        property:properties (title, location, price, images)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الحجوزات',
        variant: 'destructive',
      });
    } else {
      setReservations((data as any) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateReservationStatus = async (id: string, status: Reservation['status'], adminNotes?: string) => {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة الحجز',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'تم بنجاح',
      description: 'تم تحديث حالة الحجز',
    });
    await fetchReservations();
    return true;
  };

  const markWhatsAppNotified = async (id: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({
        whatsapp_notified: true,
        whatsapp_notified_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      await fetchReservations();
    }
  };

  const deleteReservation = async (id: string) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الحجز',
        variant: 'destructive',
      });
      return false;
    }

    toast({ title: 'تم بنجاح', description: 'تم حذف الحجز' });
    await fetchReservations();
    return true;
  };

  return {
    reservations,
    loading,
    fetchReservations,
    updateReservationStatus,
    markWhatsAppNotified,
    deleteReservation,
  };
}

export function useAvailability(propertyId?: string) {
  const [periods, setPeriods] = useState<AvailabilityPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAvailability = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('villa_availability')
      .select('*')
      .eq('property_id', propertyId)
      .order('available_from', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error);
    } else {
      setPeriods((data as any) || []);
    }
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const addAvailability = async (period: {
    available_from: string;
    available_to: string;
    price_override?: number | null;
    notes?: string;
  }) => {
    if (!propertyId) return false;

    const { error } = await supabase.from('villa_availability').insert({
      property_id: propertyId,
      ...period,
    });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إضافة فترة التوفر',
        variant: 'destructive',
      });
      return false;
    }

    toast({ title: 'تم بنجاح', description: 'تمت إضافة فترة التوفر' });
    await fetchAvailability();
    return true;
  };

  const deleteAvailability = async (id: string) => {
    const { error } = await supabase
      .from('villa_availability')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف فترة التوفر',
        variant: 'destructive',
      });
      return false;
    }

    toast({ title: 'تم بنجاح', description: 'تم حذف فترة التوفر' });
    await fetchAvailability();
    return true;
  };

  return {
    periods,
    loading,
    fetchAvailability,
    addAvailability,
    deleteAvailability,
  };
}

export function useVillaOwnerWhatsApp() {
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'villa_owner_whatsapp')
        .maybeSingle();

      if (data?.value) {
        setOwnerWhatsApp(String(data.value));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const saveOwnerWhatsApp = async (number: string) => {
    // Upsert the setting
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'villa_owner_whatsapp')
      .maybeSingle();

    let error;
    if (existing) {
      const { error: updateErr } = await supabase
        .from('site_settings')
        .update({ value: number as any, updated_at: new Date().toISOString() })
        .eq('key', 'villa_owner_whatsapp');
      error = updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from('site_settings')
        .insert({ key: 'villa_owner_whatsapp', value: number as any });
      error = insertErr;
    }

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حفظ رقم صاحبة الفلل',
        variant: 'destructive',
      });
      return false;
    }

    setOwnerWhatsApp(number);
    toast({ title: 'تم بنجاح', description: 'تم حفظ رقم صاحبة الفلل' });
    return true;
  };

  return { ownerWhatsApp, loading, saveOwnerWhatsApp };
}
