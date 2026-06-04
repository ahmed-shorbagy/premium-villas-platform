import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyFilters from "@/components/PropertyFilters";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyHorizontalList from "@/components/PropertyHorizontalList";
import BannerCarousel from "@/components/BannerCarousel";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useProperties } from "@/hooks/useProperties";
import { useBanners } from "@/hooks/useBanners";
import { siteConfig, platformScope } from "@/config";
import type { GroupTypeId } from "@/config";
import type { HeroSearchFilters } from "@/components/Hero";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading } = useProperties();
  const { banners, loading: bannersLoading } = useBanners();
  const [sortBy, setSortBy] = useState("newest");
  const [searchFilters, setSearchFilters] = useState<HeroSearchFilters & { features: string[] }>({
    groupType: (searchParams.get("groupType") as GroupTypeId) || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    features: searchParams.get("features") ? searchParams.get("features")?.split(",") : [],
  });

  useEffect(() => {
    setSearchFilters({
      groupType: (searchParams.get("groupType") as GroupTypeId) || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      features: searchParams.get("features") ? searchParams.get("features")?.split(",") : [],
    });
  }, [searchParams]);

  const handleSearch = (filters: HeroSearchFilters) => {
    setSearchFilters({ ...filters, features: searchFilters.features });
    const params = new URLSearchParams(searchParams);
    if (filters.groupType && filters.groupType !== "any") params.set("groupType", filters.groupType);
    else params.delete("groupType");

    if (filters.maxPrice && filters.maxPrice !== "any") params.set("maxPrice", filters.maxPrice);
    else params.delete("maxPrice");

    if (filters.bedrooms && filters.bedrooms !== "any") params.set("bedrooms", filters.bedrooms);
    else params.delete("bedrooms");
    setSearchParams(params);
  };

  const handleFeaturesChange = (features: string[]) => {
    setSearchFilters(prev => ({ ...prev, features }));
    const params = new URLSearchParams(searchParams);
    if (features.length > 0) {
      params.set("features", features.join(","));
    } else {
      params.delete("features");
    }
    setSearchParams(params);
  };

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];
    if (searchFilters.groupType && searchFilters.groupType !== "any") {
      filtered = filtered.filter((p) => p.groupType === searchFilters.groupType || p.groupType === "all");
    }
    if (searchFilters.maxPrice && searchFilters.maxPrice !== "any") {
      filtered = filtered.filter((p) => p.price <= parseInt(searchFilters.maxPrice));
    }
    if (searchFilters.bedrooms && searchFilters.bedrooms !== "any") {
      filtered = filtered.filter((p) => p.bedrooms >= parseInt(searchFilters.bedrooms));
    }
    if (searchFilters.features && searchFilters.features.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.features) return false;
        return searchFilters.features.every(f => p.features!.includes(f));
      });
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

  const topVillasThisWeek = useMemo(() => {
    return properties.filter((p) => p.isTopWeek);
  }, [properties]);

  return (
    <div className="flex min-h-screen flex-col">
      <SEO title="الرئيسية" description={siteConfig.seo.homeDescriptionAr} />
      <Header />

      <main className="flex-1">
        <Hero onSearch={handleSearch} initialValues={searchFilters} />

        {/* Dynamic Banners */}
        {!bannersLoading && banners && banners.filter(b => b.is_active).length > 0 && (
          <div className="container -mt-6 mb-8 px-4 relative z-10 h-[200px] sm:h-[300px] md:h-[400px]">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-border">
              <BannerCarousel banners={banners.filter(b => b.is_active)} />
            </div>
          </div>
        )}

        {topVillasThisWeek.length > 0 && (
          <section className="relative -mt-6 scroll-mt-28 pb-10 pt-4 md:-mt-10">
            <div className="container">
              <PropertyHorizontalList 
                title="أفضل الفلل هذا الأسبوع" 
                properties={topVillasThisWeek} 
                loading={loading} 
              />
            </div>
          </section>
        )}

        <section id="villas" className="relative scroll-mt-28 pb-20 pt-4">
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
                <PropertyFilters 
                  sortBy={sortBy} 
                  onSortChange={setSortBy}
                  selectedFeatures={searchFilters.features}
                  onFeaturesChange={handleFeaturesChange}
                />
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
