import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildLocalizedPath } from '@/routes';
import { uniqueMediaUrls } from '@/utils/media';
import type { GroupTypeId } from '@/config/filters';

export interface PropertyDetail {
  id: string;
  title: string;
  type: string;
  price: number;
  price_weekend?: number | null;
  rent_count?: number | null;
  max_guests?: number | null;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  listingType: 'sale' | 'rent';
  featured: boolean;
  createdAt: Date;
  description?: string;
  features: string[] | null;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_location?: string;
  installments_available?: boolean;
  installment_period?: string;
  installment_value?: number;
  pricing_type?: 'per_night' | 'per_stay';
  is_negotiable?: boolean;
  groupType?: GroupTypeId | null;
}

const PROPERTY_COLUMNS =
  'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, images, card_images, gallery_images, listing_type, featured, created_at, description, features, contact_name, contact_phone, contact_email, contact_location, installments_available, installment_period, installment_value, pricing_type, is_negotiable, group_type, is_hidden';

async function fetchProperty(id: string): Promise<PropertyDetail | null> {
  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  let { data } = await supabase
    .from('properties')
    .select(PROPERTY_COLUMNS)
    .eq(isUUID ? 'id' : 'slug', id)
    .maybeSingle();

  if (!data && !isUUID && id.includes('-')) {
    const parts = id.split('-');
    const possibleShortId = parts[parts.length - 1];
    if (possibleShortId) {
      const fallbackRes = await supabase
        .from('properties')
        .select(PROPERTY_COLUMNS)
        .eq('slug', possibleShortId)
        .maybeSingle();
      if (fallbackRes.data) data = fallbackRes.data;
    }
  }

  if (!data || (data as { is_hidden?: boolean }).is_hidden) return null;

  const row = data as Record<string, unknown> & {
    id: string;
    slug?: string;
    title: string;
    type: string;
    price: number;
    price_weekend?: number | null;
    rent_count?: number | null;
    max_guests?: number | null;
    location: string;
    bedrooms: number;
    bathrooms: number;
    images?: string[] | null;
    card_images?: string[] | null;
    gallery_images?: string[] | null;
    listing_type?: 'sale' | 'rent';
    featured?: boolean;
    created_at: string;
    description?: string | null;
    features?: string[] | null;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_location?: string;
    installments_available?: boolean;
    installment_period?: string;
    installment_value?: number;
    pricing_type?: 'per_night' | 'per_stay';
    is_negotiable?: boolean;
    group_type?: GroupTypeId | null;
  };

  const cleanPath = buildLocalizedPath.propertyDetails(row.slug || row.id);
  const currentPath = window.location.pathname;
  if (decodeURIComponent(currentPath) !== decodeURIComponent(cleanPath)) {
    window.history.replaceState(null, '', cleanPath);
  }

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    price: row.price,
    price_weekend: row.price_weekend ?? null,
    rent_count: row.rent_count ?? null,
    max_guests: row.max_guests ?? null,
    location: row.location,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    images: uniqueMediaUrls(row.card_images, row.gallery_images, row.images),
    listingType: row.listing_type as 'sale' | 'rent',
    featured: Boolean(row.featured),
    createdAt: new Date(row.created_at),
    description: row.description || undefined,
    features: row.features ?? null,
    contact_name: row.contact_name,
    contact_phone: row.contact_phone,
    contact_email: row.contact_email,
    contact_location: row.contact_location,
    installments_available: row.installments_available,
    installment_period: row.installment_period,
    installment_value: row.installment_value,
    pricing_type: row.pricing_type || 'per_night',
    is_negotiable: row.is_negotiable || false,
    groupType: row.group_type || null,
  };
}

export const useProperty = (id: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  return {
    property: data ?? null,
    loading: isLoading,
    error: (error as Error) || null,
  };
};
