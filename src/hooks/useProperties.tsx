import { useQuery } from "@tanstack/react-query";
import { Property } from "@/data/properties";
import { platformScope } from "@/config/platform";
import { supabase } from "@/integrations/supabase/client";

const LISTING_COLUMNS =
  "id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, card_images, images, featured, group_type, features, created_at, is_negotiable, listing_type";

async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(LISTING_COLUMNS)
    .eq("type", platformScope.propertyType)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((d) => {
    const row = d as Record<string, unknown> & {
      id: string;
      slug?: string;
      title: string;
      type: Property['type'];
      price: number;
      price_weekend?: number | null;
      rent_count?: number | null;
      max_guests?: number | null;
      location: string;
      bedrooms: number;
      bathrooms: number;
      card_images?: string[] | null;
      images?: string[] | null;
      listing_type?: Property['listingType'];
      featured?: boolean;
      group_type?: Property['groupType'];
      created_at: string;
      features?: string[] | null;
      is_negotiable?: boolean;
    };

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      type: row.type,
      price: row.price,
      price_weekend: row.price_weekend,
      rent_count: row.rent_count,
      max_guests: row.max_guests,
      location: row.location,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      image: row.card_images?.[0] || row.images?.[0] || "",
      card_images: row.card_images || (row.images ? row.images.slice(0, 3) : []),
      gallery_images: [],
      listingType: row.listing_type,
      featured: row.featured,
      groupType: row.group_type,
      createdAt: new Date(row.created_at),
      features: row.features,
      is_negotiable: row.is_negotiable || false,
    };
  });
}

export const useProperties = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", platformScope.propertyType],
    queryFn: fetchProperties,
    staleTime: 60_000,
  });

  return {
    properties: data ?? [],
    loading: isLoading,
    error: (error as Error) || null,
  };
};
