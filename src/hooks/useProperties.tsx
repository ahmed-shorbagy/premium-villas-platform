import { useState, useEffect } from "react";
import { Property } from "@/data/properties";
import { platformScope } from "@/config/platform";
import { supabase } from "@/integrations/supabase/client";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('type', platformScope.propertyType)
          .eq('listing_type', platformScope.listingType);

        if (error) throw error;

        const mapped: Property[] = (data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          type: d.type as any,
          price: d.price,
          price_weekend: d.price_weekend,
          rent_count: d.rent_count,
          location: d.location,
          bedrooms: d.bedrooms,
          bathrooms: d.bathrooms,
          image: d.image || (d.images && d.images.length > 0 ? d.images[0] : ''),
          images: d.images || [],
          listingType: d.listing_type as any,
          featured: d.featured,
          groupType: d.group_type as any,
          createdAt: new Date(d.created_at),
          description: d.description,
          features: d.features,
        }));

        setProperties(mapped);
      } catch (err) {
        console.error("Failed to fetch live properties:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, loading, error };
};
