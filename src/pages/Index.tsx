import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGrid from '@/components/PropertyGrid';
import AdBanner from '@/components/AdBanner';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useProperties } from '@/hooks/useProperties';
import PropertyHorizontalList from '@/components/PropertyHorizontalList';
import { siteConfig } from '@/config';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading } = useProperties();
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'all');
  const [activeListingType, setActiveListingType] = useState(searchParams.get('listingType') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchFilters, setSearchFilters] = useState({
    location: searchParams.get('location') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) setActiveType(type);

    const listingType = searchParams.get('listingType');
    if (listingType) setActiveListingType(listingType);
  }, [searchParams]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    const params = new URLSearchParams(searchParams);
    if (type === 'all') params.delete('type');
    else params.set('type', type);
    setSearchParams(params);
  };

  const handleListingTypeChange = (type: string) => {
    setActiveListingType(type);
    const params = new URLSearchParams(searchParams);
    if (type === 'all') params.delete('listingType');
    else params.set('listingType', type);
    setSearchParams(params);
  };

  const handleSearch = (filters: { location: string; maxPrice: string; bedrooms: string; listingType: string }) => {
    setSearchFilters({
      location: filters.location,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
    });
    setActiveListingType(filters.listingType);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (filters.location) params.set('location', filters.location);
    else params.delete('location');

    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    else params.delete('maxPrice');

    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    else params.delete('bedrooms');

    if (filters.listingType && filters.listingType !== 'all') params.set('listingType', filters.listingType);
    else params.delete('listingType');

    setSearchParams(params);
  };

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Filter by type
    if (activeType !== 'all') {
      filtered = filtered.filter((p) => p.type === activeType);
    }

    // Filter by listing type
    if (activeListingType !== 'all') {
      filtered = filtered.filter((p) => p.listingType === activeListingType);
    }

    // Filter by search criteria
    if (searchFilters.location) {
      filtered = filtered.filter(
        (p) =>
          p.location.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
          p.area.toLowerCase().includes(searchFilters.location.toLowerCase())
      );
    }

    if (searchFilters.maxPrice) {
      const maxPrice = parseInt(searchFilters.maxPrice);
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    if (searchFilters.bedrooms) {
      const minBedrooms = parseInt(searchFilters.bedrooms);
      filtered = filtered.filter((p) => p.bedrooms >= minBedrooms);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
  }, [activeType, activeListingType, sortBy, searchFilters, properties]);

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title="الرئيسية"
        description={siteConfig.seo.homeDescriptionAr}
      />
      <Header />

      <main className="flex-1">
        <Hero
          onSearch={handleSearch}
          initialValues={{
            ...searchFilters,
            listingType: activeListingType
          }}
        />

        <AdBanner />

        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                استكشف <span className="text-gradient-gold">عقاراتنا</span>
              </h2>
              <p className="mt-2 text-muted-foreground">
                اكتشف فللاً وعقارات فاخرة في أفضل المواقع
              </p>
            </div>

            <div className="mb-8">
              <PropertyFilters
                activeType={activeType}
                activeListingType={activeListingType}
                sortBy={sortBy}
                onTypeChange={handleTypeChange}
                onListingTypeChange={handleListingTypeChange}
                onSortChange={setSortBy}
              />
            </div>

            {activeType === 'all' && !searchFilters.location && !searchFilters.maxPrice && !searchFilters.bedrooms && activeListingType === 'all' ? (
              <div className="space-y-8">
                <PropertyHorizontalList
                  title="الشقق"
                  properties={properties.filter(p => p.type === 'apartment')}
                  loading={loading}
                />
                <PropertyHorizontalList
                  title="الفلل"
                  properties={properties.filter(p => p.type === 'villa')}
                  loading={loading}
                />
                {properties.filter(p => p.type !== 'apartment' && p.type !== 'villa').length > 0 && (
                  <div>
                    <h3 className="mb-6 font-display text-2xl font-bold text-foreground">
                      عقارات أخرى
                    </h3>
                    <PropertyGrid properties={properties.filter(p => p.type !== 'apartment' && p.type !== 'villa')} loading={loading} />
                  </div>
                )}
              </div>
            ) : (
              <PropertyGrid properties={filteredProperties} loading={loading} />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
