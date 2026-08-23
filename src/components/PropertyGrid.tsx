import PropertyCard from "./PropertyCard";
import { Property } from "@/data/properties";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  emptyMessage?: string;
}

const PAGE_SIZE = 12;

const PropertyCardSkeleton = () => (
  <div className="shima-card h-[420px] overflow-hidden">
    <Skeleton className="aspect-[5/4] w-full rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

const PropertyGrid = ({ properties, loading, emptyMessage }: PropertyGridProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = useMemo(
    () => properties.slice(0, visibleCount),
    [properties, visibleCount],
  );

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-glass-border bg-card/40 p-12 text-center backdrop-blur-sm">
        <p className="font-display text-xl text-foreground">{emptyMessage ?? "لا توجد فلل متاحة"}</p>
        <p className="mt-2 text-sm text-muted-foreground">جرّب تغيير معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            priority={index < 3}
          />
        ))}
      </div>
      {visibleCount < properties.length && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            عرض المزيد
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;
