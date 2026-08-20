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
import { startOfDay } from 'date-fns';
import { firstImageUrl } from '@/utils/media';

interface UseSimilarAvailableVillasArgs {
  propertyId: string;
  groupType?: GroupTypeId | null;
  requestedDate: string | null;
  currentPrice: number;
  enabled?: boolean;
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
    if (!enabled || !requestedDate || !groupType) {
      setProperties([]);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from('properties')
          .select(
            'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, card_images, images, featured, group_type, features, created_at, is_negotiable, listing_type'
          )
          .eq('type', platformScope.propertyType)
          .eq('group_type', groupType)
          .neq('id', propertyId);

        if (error) throw error;
        if (cancelled) return;

        const candidates = (rows || []).filter((r) => r.id !== propertyId);
        if (candidates.length === 0) {
          setProperties([]);
          return;
        }

        const ids = candidates.map((c) => c.id);

        const [{ data: availability }, { data: booked }] = await Promise.all([
          supabase
            .from('villa_availability')
            .select('property_id, available_from, available_to')
            .in('property_id', ids),
          supabase.rpc('get_booked_ranges', { p_property_ids: ids }),
        ]);

        if (cancelled) return;

        const day = startOfDay(new Date(requestedDate));
        const bookedRanges = (booked as BookedRange[]) || [];

        const available = candidates.filter((c) => {
          const periods = (availability || []).filter((a) => a.property_id === c.id);
          if (!isDateInAvailabilityPeriods(day, periods)) return false;
          const ranges = bookedRanges.filter((b) => b.property_id === c.id);
          if (isDateBookedByRanges(day, ranges)) return false;
          return true;
        });

        available.sort(
          (a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice)
        );

        const mapped: Property[] = available.slice(0, 6).map((row) => ({
          id: row.id,
          slug: (row as any).slug,
          title: row.title,
          type: row.type as Property['type'],
          price: row.price,
          price_weekend: row.price_weekend,
          rent_count: row.rent_count,
          max_guests: row.max_guests,
          location: row.location,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          image:
            firstImageUrl((row as any).card_images) ||
            firstImageUrl(row.images) ||
            '',
          card_images: (row as any).card_images || (row.images ? row.images.slice(0, 3) : []),
          gallery_images: [],
          listingType: ((row as any).listing_type || 'rent') as Property['listingType'],
          featured: row.featured ?? false,
          groupType: (row as any).group_type as GroupTypeId | undefined,
          createdAt: new Date(row.created_at),
          features: row.features || undefined,
          is_negotiable: (row as any).is_negotiable || false,
        }));

        setProperties(mapped);
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
