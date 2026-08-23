import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/data/properties';
import { platformScope } from '@/config/platform';
import type { GroupTypeId } from '@/config/filters';
import { fetchBookedRanges, isStayAvailable } from '@/hooks/useBookedRanges';
import { firstImageUrl } from '@/utils/media';

interface UseSimilarAvailableVillasArgs {
  propertyId: string;
  groupType?: GroupTypeId | null;
  requestedDate: string | null;
  requestedCheckOut?: string | null;
  currentPrice: number;
  enabled?: boolean;
}

function mapRow(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    slug: row.slug ? String(row.slug) : undefined,
    title: String(row.title || ''),
    type: row.type as Property['type'],
    price: Number(row.price) || 0,
    price_weekend: (row.price_weekend as number | null) ?? null,
    rent_count: (row.rent_count as number | null) ?? null,
    max_guests: (row.max_guests as number | null) ?? null,
    location: String(row.location || ''),
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    image:
      firstImageUrl((row.card_images as string[]) || []) ||
      firstImageUrl((row.images as string[]) || []) ||
      '',
    card_images: (row.card_images as string[]) ||
      ((row.images as string[]) ? (row.images as string[]).slice(0, 3) : []),
    gallery_images: [],
    listingType: ((row.listing_type as string) || 'rent') as Property['listingType'],
    featured: Boolean(row.featured),
    groupType: row.group_type as GroupTypeId | undefined,
    createdAt: new Date(String(row.created_at || Date.now())),
    features: (row.features as string[]) || undefined,
    is_negotiable: Boolean(row.is_negotiable),
  };
}

export function useSimilarAvailableVillas({
  propertyId,
  groupType,
  requestedDate,
  requestedCheckOut,
  currentPrice,
  enabled = true,
}: UseSimilarAvailableVillasArgs) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !requestedDate || !propertyId) {
      setProperties([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const selectCols =
          'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, card_images, images, featured, group_type, features, created_at, is_negotiable, listing_type, is_hidden';

        let { data: rows, error } = await supabase
          .from('properties')
          .select(selectCols)
          .eq('type', platformScope.propertyType)
          .neq('id', propertyId);

        if (error && String(error.message || '').includes('is_hidden')) {
          const fallback = await supabase
            .from('properties')
            .select(
              'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, card_images, images, featured, group_type, features, created_at, is_negotiable, listing_type'
            )
            .eq('type', platformScope.propertyType)
            .neq('id', propertyId);
          rows = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;
        if (cancelled) return;

        const candidates = (rows || []).filter(
          (r) => r.id !== propertyId && !(r as { is_hidden?: boolean }).is_hidden
        );
        if (candidates.length === 0) {
          setProperties([]);
          return;
        }

        const ids = candidates.map((c) => c.id);
        const stayEnd = requestedCheckOut || requestedDate;

        const [blockedRes, bookedRanges] = await Promise.all([
          supabase
            .from('villa_availability')
            .select('property_id, available_from, available_to')
            .in('property_id', ids)
            .lte('available_from', stayEnd)
            .gte('available_to', requestedDate),
          fetchBookedRanges(ids, { from: requestedDate, to: stayEnd }),
        ]);

        if (cancelled) return;

        const blocked = blockedRes.data || [];

        const isCandidateAvailable = (c: (typeof candidates)[0]) => {
          const periods = blocked.filter((a) => a.property_id === c.id);
          const ranges = bookedRanges.filter((b) => b.property_id === c.id);
          return isStayAvailable(requestedDate, requestedCheckOut, periods, ranges);
        };

        const available = candidates.filter(isCandidateAvailable);

        const sameGroup = groupType
          ? available.filter((c) => (c as { group_type?: string }).group_type === groupType)
          : [];

        const pool = sameGroup.length > 0 ? sameGroup : available;

        pool.sort(
          (a, b) => Math.abs(Number(a.price) - currentPrice) - Math.abs(Number(b.price) - currentPrice)
        );

        setProperties(pool.slice(0, 8).map((row) => mapRow(row as Record<string, unknown>)));
      } catch (err) {
        console.error('Failed to load similar villas:', err);
        if (!cancelled) setProperties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [propertyId, groupType, requestedDate, requestedCheckOut, currentPrice, enabled]);

  return { properties, loading };
}
