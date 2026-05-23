import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/data/properties';

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const mappedProperties: Property[] = data.map((item) => ({
                        id: item.id,
                        title: item.title,
                        type: item.type as Property['type'], // Cast to match the specific union type
                        price: item.price,
                        location: item.location,
                        area: item.area,
                        bedrooms: item.bedrooms,
                        bathrooms: item.bathrooms,
                        areaSize: item.area_size,
                        image: item.images?.[0] || '', // Use first image or empty string
                        listingType: (item as any).listing_type as Property['listingType'],
                        featured: item.featured,
                        createdAt: new Date(item.created_at),
                    }));
                    setProperties(mappedProperties);
                }
            } catch (err) {
                setError(err as Error);
                console.error('Error fetching properties:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    return { properties, loading, error };
};
