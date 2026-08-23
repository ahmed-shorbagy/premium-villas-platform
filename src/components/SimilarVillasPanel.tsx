import { Link } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { Property, formatPrice } from '@/data/properties';
import { buildLocalizedPath } from '@/routes';
import { useSimilarAvailableVillas } from '@/hooks/useSimilarAvailableVillas';
import type { GroupTypeId } from '@/config/filters';
import PropertyHorizontalList from '@/components/PropertyHorizontalList';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

interface SimilarVillasPanelProps {
  propertyId: string;
  groupType?: GroupTypeId | null;
  currentPrice: number;
  checkIn: string | null;
  checkOut?: string | null;
  unavailable?: boolean;
  variant?: 'page' | 'dialog';
  enabled?: boolean;
}

function stayQuery(checkIn: string, checkOut?: string | null) {
  const params = new URLSearchParams();
  params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  return `?${params.toString()}`;
}

const SimilarVillasPanel = ({
  propertyId,
  groupType,
  currentPrice,
  checkIn,
  checkOut,
  unavailable = false,
  variant = 'page',
  enabled = true,
}: SimilarVillasPanelProps) => {
  const { properties, loading } = useSimilarAvailableVillas({
    propertyId,
    groupType,
    requestedDate: checkIn,
    requestedCheckOut: checkOut,
    currentPrice,
    enabled: enabled && !!checkIn,
  });

  if (!checkIn) return null;

  if (variant === 'dialog') {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري البحث عن فلل متاحة في نفس التاريخ...
        </div>
      );
    }

    if (properties.length === 0) {
      return unavailable ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-xs text-muted-foreground dark:border-amber-800 dark:bg-amber-950/30">
          لا توجد فلل مشابهة متاحة في هذا التاريخ حالياً.
        </p>
      ) : null;
    }

    return (
      <div className="space-y-2 rounded-lg border border-gold/30 bg-gold/5 p-3">
        <p className="text-sm font-semibold text-foreground">
          {unavailable
            ? 'هذه الفيلا غير متاحة — خيارات مشابهة لنفس التاريخ'
            : 'فلل أخرى متاحة في نفس التاريخ'}
        </p>
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {properties.map((villa) => (
            <SimilarVillaRow
              key={villa.id}
              villa={villa}
              checkIn={checkIn}
              checkOut={checkOut}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'rounded-lg border p-4',
          unavailable
            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
            : 'border-gold/30 bg-gold/5'
        )}
      >
        <p className="text-sm font-medium text-foreground">
          {unavailable
            ? 'هذه الفيلا غير متاحة في هذا التاريخ — خيارات مشابهة متاحة:'
            : 'فلل مشابهة متاحة في نفس الفترة:'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {checkOut ? `${checkIn} ← ${checkOut}` : `التاريخ المطلوب: ${checkIn}`}
        </p>
      </div>
      {loading ? (
        <PropertyHorizontalList title="فلل مشابهة متاحة" properties={[]} loading />
      ) : properties.length > 0 ? (
        <PropertyHorizontalList title="فلل مشابهة متاحة" properties={properties} />
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          لا توجد فلل مشابهة متاحة في هذا التاريخ حالياً. جرّب تاريخاً آخر أو تواصل معنا.
        </p>
      )}
    </div>
  );
};

function SimilarVillaRow({
  villa,
  checkIn,
  checkOut,
}: {
  villa: Property;
  checkIn: string;
  checkOut?: string | null;
}) {
  const href = `${buildLocalizedPath.propertyDetails(villa.slug || villa.id)}${stayQuery(
    checkIn,
    checkOut
  )}`;

  return (
    <Link
      to={href}
      className="flex gap-3 rounded-md border border-border bg-card p-2 transition-colors hover:border-gold/50 hover:bg-secondary/40"
    >
      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {villa.image ? (
          <OptimizedImage
            src={villa.image}
            alt={villa.title}
            size="sm"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{villa.title}</p>
        <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {villa.location}
        </p>
        <p className="text-xs font-semibold text-gold">{formatPrice(villa.price)} / ليلة</p>
      </div>
    </Link>
  );
}

export default SimilarVillasPanel;
