import { useEffect, useState } from "react";
import { Search, Users, Banknote, BedDouble, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig, groupTypes } from "@/config";
import type { GroupTypeId } from "@/config";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import HeroBackground from "@/components/HeroBackground";

export interface HeroSearchFilters {
  groupType: GroupTypeId | "";
  maxPrice: string;
  bedrooms: string;
}

interface HeroProps {
  onSearch: (filters: HeroSearchFilters) => void;
  initialValues?: HeroSearchFilters;
}

const emptyFilters: HeroSearchFilters = { groupType: "", maxPrice: "", bedrooms: "" };

const Hero = ({ onSearch, initialValues }: HeroProps) => {
  const [filters, setFilters] = useState<HeroSearchFilters>(initialValues ?? emptyFilters);

  useEffect(() => {
    if (initialValues) setFilters(initialValues);
  }, [initialValues]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <HeroBackground />

      <div className="container relative z-10 flex min-h-[92vh] items-center px-4 py-24 lg:py-32">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-20">
          {/* ── Text Column ── */}
          <div className="order-2 text-center lg:order-1 lg:text-start">
            {/* Pill badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-5 py-2 text-xs font-semibold tracking-[0.22em] text-white/90 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-gold-light" />
              إيجار فلل فاخرة
            </div>

            <div className="mb-6 flex justify-center lg:justify-start">
              <ShimaLogo surface="auto" size="xl" framed />
            </div>

            {/* Tagline */}
            <h1 className="mb-5 font-display text-3xl font-medium leading-[1.2] text-white sm:text-4xl md:text-[3.25rem] md:leading-[1.15]">
              {siteConfig.brand.taglineAr}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-lg text-base leading-relaxed text-white/70 lg:mx-0 lg:text-lg">
              {siteConfig.seo.homeDescriptionAr}
            </p>

            {/* Stats bar */}
            <div className="mt-10 hidden items-center gap-10 lg:flex">
              {[
                { value: "+50", label: "فيلا للإيجار" },
                { value: "24/7", label: "دعم الحجز" },
                { value: "100%", label: "تجربة مميزة" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-10">
                  <div className="text-start">
                    <div className="font-display text-2xl font-semibold text-gold-light">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-xs text-white/55">{stat.label}</div>
                  </div>
                  {i < 2 && (
                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Search Card ── */}
          <div className="order-1 lg:order-2">
            <div className="glass-panel animate-fade-in-up rounded-[2rem] p-7 shadow-float md:p-9">
              <h2 className="mb-1.5 font-display text-xl font-semibold text-foreground">
                ابحث عن فيلتك
              </h2>
              <p className="mb-7 text-sm text-muted-foreground">
                فلل للإيجار — حجز سريع عبر واتساب
              </p>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Users className="absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand" />
                  <Select
                    value={filters.groupType || undefined}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, groupType: value as GroupTypeId }))
                    }
                  >
                    <SelectTrigger className="shima-input ps-10">
                      <SelectValue placeholder="نوع الإيجار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">جميع الأنواع</SelectItem>
                      {groupTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.labelAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Banknote className="absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand" />
                    <Select
                      value={filters.maxPrice || undefined}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, maxPrice: value }))}
                    >
                      <SelectTrigger className="shima-input ps-10">
                        <SelectValue placeholder="الميزانية / الليلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">أي ميزانية</SelectItem>
                        <SelectItem value="800">حتى 800</SelectItem>
                        <SelectItem value="1000">حتى 1,000</SelectItem>
                        <SelectItem value="1500">حتى 1,500</SelectItem>
                        <SelectItem value="2000">حتى 2,000</SelectItem>
                        <SelectItem value="2500">حتى 2,500</SelectItem>
                        <SelectItem value="3000">حتى 3,000</SelectItem>
                        <SelectItem value="3500">حتى 3,500</SelectItem>
                        <SelectItem value="4000">حتى 4,000</SelectItem>
                        <SelectItem value="4500">حتى 4,500</SelectItem>
                        <SelectItem value="5000">حتى 5,000</SelectItem>
                        <SelectItem value="10000">حتى 10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <BedDouble className="absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand" />
                    <Select
                      value={filters.bedrooms || undefined}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, bedrooms: value }))}
                    >
                      <SelectTrigger className="shima-input ps-10">
                        <SelectValue placeholder="غرف النوم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">أي عدد غرف</SelectItem>
                        <SelectItem value="1">1+ غرف</SelectItem>
                        <SelectItem value="2">2+ غرف</SelectItem>
                        <SelectItem value="3">3+ غرف</SelectItem>
                        <SelectItem value="4">4+ غرف</SelectItem>
                        <SelectItem value="5">5+ غرف</SelectItem>
                        <SelectItem value="6">6+ غرف</SelectItem>
                        <SelectItem value="7">7+ غرف</SelectItem>
                        <SelectItem value="8">8+ غرف</SelectItem>
                        <SelectItem value="9">9+ غرف</SelectItem>
                        <SelectItem value="10">10+ غرف</SelectItem>
                        <SelectItem value="11">11+ غرف</SelectItem>
                        <SelectItem value="12">12+ غرف</SelectItem>
                        <SelectItem value="13">13+ غرف</SelectItem>
                        <SelectItem value="14">14+ غرف</SelectItem>
                        <SelectItem value="15">15+ غرف</SelectItem>
                        <SelectItem value="16">16+ غرف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full gap-2 text-base">
                  <Search className="h-4 w-4" />
                  استكشف الفلل
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
