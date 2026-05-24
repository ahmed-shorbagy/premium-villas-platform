import { Search, MapPin, Banknote, BedDouble, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/config";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import HeroBackground from "@/components/HeroBackground";

interface HeroProps {
  onSearch: (filters: { location: string; maxPrice: string; bedrooms: string }) => void;
  initialValues?: { location: string; maxPrice: string; bedrooms: string };
}

const Hero = ({ onSearch, initialValues }: HeroProps) => {
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSearch({
      location: (formData.get("location") as string) || "",
      maxPrice: (formData.get("maxPrice") as string) || "",
      bedrooms: (formData.get("bedrooms") as string) || "",
    });
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

            {/* Logo wordmark */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <ShimaLogo variant="wordmark" size="lg" inverse />
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
                فلل للإيجار فقط — حجز سريع عبر واتساب
              </p>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                  <Input
                    name="location"
                    placeholder="المدينة أو المنطقة"
                    className="shima-input ps-10"
                    defaultValue={initialValues?.location}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Banknote className="absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand" />
                    <Select name="maxPrice" defaultValue={initialValues?.maxPrice}>
                      <SelectTrigger className="shima-input ps-10">
                        <SelectValue placeholder="الميزانية / الليلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3000">حتى 3,000</SelectItem>
                        <SelectItem value="5000">حتى 5,000</SelectItem>
                        <SelectItem value="10000">حتى 10,000</SelectItem>
                        <SelectItem value="20000">حتى 20,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <BedDouble className="absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand" />
                    <Select name="bedrooms" defaultValue={initialValues?.bedrooms}>
                      <SelectTrigger className="shima-input ps-10">
                        <SelectValue placeholder="غرف النوم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2+ غرف</SelectItem>
                        <SelectItem value="3">3+ غرف</SelectItem>
                        <SelectItem value="4">4+ غرف</SelectItem>
                        <SelectItem value="5">5+ غرف</SelectItem>
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
