import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/data/properties";
import { platformScope } from "@/config/platform";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("properties")
          .select("*")
          .eq("type", platformScope.propertyType)
          .eq("listing_type", platformScope.listingType)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        if (data) {
          const mapped: Property[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            type: platformScope.propertyType,
            price: item.price,
            location: item.location,
            area: item.area,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            areaSize: item.area_size,
            image: item.images?.[0] || "",
            listingType: platformScope.listingType,
            featured: item.featured,
            features: item.features ?? undefined,
            createdAt: new Date(item.created_at),
            contact_name: (item as { contact_name?: string }).contact_name,
            contact_phone: (item as { contact_phone?: string }).contact_phone,
            contact_email: (item as { contact_email?: string }).contact_email,
            contact_location: (item as { contact_location?: string }).contact_location,
          }));
          setProperties(mapped);
        }
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, loading, error };
};
