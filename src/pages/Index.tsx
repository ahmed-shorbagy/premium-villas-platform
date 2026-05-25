import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyGrid from "@/components/PropertyGrid";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useProperties } from "@/hooks/useProperties";
import { siteConfig, platformScope } from "@/config";
import type { GroupTypeId } from "@/config";
import type { HeroSearchFilters } from "@/components/Hero";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading } = useProperties();
  const [sortBy, setSortBy] = useState("newest");
  const [searchFilters, setSearchFilters] = useState<HeroSearchFilters>({
    groupType: (searchParams.get("groupType") as GroupTypeId) || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  });

  useEffect(() => {
    setSearchFilters({
      groupType: (searchParams.get("groupType") as GroupTypeId) || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
    });
  }, [searchParams]);

  const handleSearch = (filters: HeroSearchFilters) => {
    setSearchFilters(filters);
    const params = new URLSearchParams();
    if (filters.groupType) params.set("groupType", filters.groupType);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    setSearchParams(params);
  };

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    if (searchFilters.groupType) {
      filtered = filtered.filter((p) => p.groupType === searchFilters.groupType);
    }
    if (searchFilters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseInt(searchFilters.maxPrice));
    }
    if (searchFilters.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms >= parseInt(searchFilters.bedrooms));
    }
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return filtered;
  }, [sortBy, searchFilters, properties]);

  return (
    <div className="flex min-h-screen flex-col">
      <SEO title="الرئيسية" description={siteConfig.seo.homeDescriptionAr} />
      <Header />

      <main className="flex-1">
        <Hero onSearch={handleSearch} initialValues={searchFilters} />

        <AdBanner />

        <section id="villas" className="relative -mt-6 scroll-mt-28 pb-20 pt-4 md:-mt-10">
          <div className="container">
            <div className="shima-section">
              <div className="mb-12 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-start">
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-brand uppercase" dir="ltr">
                    {siteConfig.brand.name}
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
                    فلل لل<span className="text-gradient-brand">إيجار</span>
                  </h2>
                  <p className="mt-3 max-w-xl text-muted-foreground">{siteConfig.brand.taglineAr}</p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {loading ? "..." : `${filteredProperties.length} فيلا متاحة`}
                </p>
              </div>

              <div className="mb-12">
                <PropertyFilters sortBy={sortBy} onSortChange={setSortBy} />
              </div>

              <PropertyGrid properties={filteredProperties} loading={loading} emptyMessage={platformScope.listingsEmptyAr} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
