import { useState, useEffect } from "react";
import { Property, properties as dummyProperties } from "@/data/properties";
import { platformScope } from "@/config/platform";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate a very short network request for realism, but primarily serve dummy data fast.
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Filter dummy data to match the platform scope (villa, rent)
        const mapped = dummyProperties.filter(
          (p) => p.type === platformScope.propertyType && p.listingType === platformScope.listingType
        );
        setProperties(mapped);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, loading, error };
};
