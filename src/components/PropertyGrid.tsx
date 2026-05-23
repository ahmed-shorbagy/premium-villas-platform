import { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '@/data/properties';
import { supabase } from '@/integrations/supabase/client';

import { Skeleton } from "@/components/ui/skeleton";

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
}

const PropertyCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden h-[400px]">
    <Skeleton className="h-[250px] w-full" />
    <div className="p-4 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

const PropertyGrid = ({ properties, loading }: PropertyGridProps) => {
  const elements = properties.map((property, index) => (
    <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${(index % 6) * 0.05}s` }}>
      <PropertyCard property={property} />
    </div>
  ));

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">لا توجد عقارات متاحة</p>
        <p className="mt-1 text-sm text-muted-foreground/70">حاول تغيير خيارات البحث</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {elements}
    </div>
  );
};

export default PropertyGrid;
