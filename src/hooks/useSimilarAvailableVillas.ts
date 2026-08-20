import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/data/properties';
import { platformScope } from '@/config/platform';
import type { GroupTypeId } from '@/config/filters';
import {
  isDateBookedByRanges,
  isDateInAvailabilityPeriods,
  type BookedRange,
} from '@/hooks/useBookedRanges';
import { parseDateOnly } from '@/utils/dateOnly';
import { firstImageUrl } from '@/utils/media';

interface UseSimilarAvailableVillasArgs {
  propertyId: string;
  groupType?: GroupTypeId | null;
  requestedDate: string | null;
  currentPrice: number;
  enabled?: boolean;
}

function mapRow(row: any): Property {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type as Property['type'],
    price: row.price,
    price_weekend: row.price_weekend,
    rent_count: row.rent_count,
    max_guests: row.max_guests,
    location: row.location,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    image: firstImageUrl(row.card_images) || firstImageUrl(row.images) || '',
    card_images: row.card_images || (row.images ? row.images.slice(0, 3) : []),
    gallery_images: [],
    listingType: (row.listing_type || 'rent') as Property['listingType'],
    featured: row.featured ?? false,
    groupType: row.group_type as GroupTypeId | undefined,
    createdAt: new Date(row.created_at),
    features: row.features || undefined,
    is_negotiable: row.is_negotiable || false,
  };
}

export function useSimilarAvailableVillas({
  propertyId,
  groupType,
  requestedDate,
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

    const day = parseDateOnly(requestedDate);
    if (!day) {
      setProperties([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select(
            'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, card_images, images, featured, group_type, features, created_at, is_negotiable, listing_type, is_hidden'
          )
          .eq('type', platformScope.propertyType)
          .neq('id', propertyId);

        let { data: rows, error } = await query;

        // Fallback if is_hidden column not migrated yet
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
          (r) => r.id !== propertyId && !(r as any).is_hidden
        );
        if (candidates.length === 0) {
          setProperties([]);
          return;
        }

        const ids = candidates.map((c) => c.id);

        const [availabilityRes, bookedRes] = await Promise.all([
          supabase
            .from('villa_availability')
            .select('property_id, available_from, available_to')
            .in('property_id', ids),
          supabase.rpc('get_booked_ranges', { p_property_ids: ids }),
        ]);

        if (cancelled) return;

        const availability = availabilityRes.data || [];
        // If RPC missing/failed, don't treat every villa as booked — just skip booking filter
        const bookedRanges: BookedRange[] = bookedRes.error
          ? []
          : ((bookedRes.data as BookedRange[]) || []);

        const isCandidateAvailable = (c: (typeof candidates)[0]) => {
          const periods = availability.filter((a) => a.property_id === c.id);
          if (periods.length === 0) return false;
          if (!isDateInAvailabilityPeriods(day, periods)) return false;
          const ranges = bookedRanges.filter((b) => b.property_id === c.id);
          if (isDateBookedByRanges(day, ranges)) return false;
          return true;
        };

        const available = candidates.filter(isCandidateAvailable);

        const sameGroup = groupType
          ? available.filter((c) => (c as any).group_type === groupType)
          : [];

        const pool = sameGroup.length > 0 ? sameGroup : available;

        pool.sort(
          (a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice)
        );

        setProperties(pool.slice(0, 6).map(mapRow));
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
  }, [propertyId, groupType, requestedDate, currentPrice, enabled]);

  return { properties, loading };
}
