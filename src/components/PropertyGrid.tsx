import PropertyCard from "./PropertyCard";
import { Property } from "@/data/properties";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  emptyMessage?: string;
}

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
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <div
          key={property.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${(index % 6) * 0.06}s` }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
